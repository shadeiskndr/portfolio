import { abortStream, listUIMessages, vStreamArgs } from "@convex-dev/agent";
import { streamText } from "ai";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { type ChatModel, DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/chat/models";
import { getChatModel } from "../lib/chat/provider";
import { components, internal } from "./_generated/api";
import {
  type ActionCtx,
  internalAction,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { chatAgent, chatModelArgs } from "./agent";
import { listModels, resolveModelRow, toChatModel } from "./models";
import { retrievePortfolioContext } from "./rag";

const COMPACT_AT_TOKENS = 96_000;
const KEEP_RECENT_MESSAGES = 6;

async function findSession(ctx: QueryCtx | MutationCtx, sessionId: string, clientId: string) {
  const session = await ctx.db
    .query("chatSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();
  if (!session || session.clientId !== clientId) return null;
  return session;
}

function tokenCostUSD(tokens: number, per1M: number): number {
  return (tokens * per1M) / 1_000_000;
}

function titleFromText(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}

export const thread = query({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const session = await findSession(ctx, sessionId, clientId);
    return session ? { threadId: session.threadId } : null;
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    clientId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!session || session.clientId !== args.clientId) {
      return { page: [], isDone: true, continueCursor: "", streams: undefined };
    }
    const [paginated, streams] = await Promise.all([
      listUIMessages(ctx, components.agent, args),
      chatAgent.syncStreams(ctx, {
        threadId: args.threadId,
        streamArgs: args.streamArgs,
      }),
    ]);
    return { ...paginated, streams };
  },
});

export const usage = query({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const session = await findSession(ctx, sessionId, clientId);
    if (!session) return null;
    const page = await chatAgent.listMessages(ctx, {
      threadId: session.threadId,
      paginationOpts: { cursor: null, numItems: 5 },
    });
    const u = page.page.find((m) => m.usage)?.usage;
    if (!u) return null;

    const row = await resolveModelRow(ctx, session.lastModelId);
    const contextTokens = row?.contextTokens ?? DEFAULT_MODEL.contextTokens;
    const pricing = row?.pricing ?? DEFAULT_MODEL.pricing;
    const inputTokens = u.promptTokens ?? 0;
    const outputTokens = u.completionTokens ?? 0;
    const usedTokens = inputTokens;
    const maxTokens = contextTokens;
    const inputCost = tokenCostUSD(inputTokens, pricing.inputPer1M);
    const outputCost = tokenCostUSD(outputTokens, pricing.outputPer1M);

    return {
      usedTokens,
      maxTokens,
      usedPercent: maxTokens > 0 ? usedTokens / maxTokens : 0,
      cost: {
        input: inputCost,
        output: outputCost,
        total: inputCost + outputCost,
      },
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: u.totalTokens ?? 0,
        inputTokenDetails: {
          noCacheTokens: u.nonCachedInputTokens,
          cacheReadTokens: u.cachedInputTokens,
          cacheWriteTokens: u.cacheWriteInputTokens,
        },
        outputTokenDetails: {
          textTokens: u.textOutputTokens,
          reasoningTokens: u.reasoningTokens,
        },
      },
    };
  },
});

export const models = query({
  args: {},
  handler: async (ctx) => {
    const rows = await listModels(ctx);
    const def = rows.find((r) => r.isDefault) ?? rows[0];
    return {
      models: rows.map(toChatModel),
      defaultId: def?.modelId ?? DEFAULT_MODEL.id,
    };
  },
});

export const send = mutation({
  args: {
    sessionId: v.string(),
    clientId: v.string(),
    text: v.string(),
    modelId: v.optional(v.string()),
    reasoning: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const row = await resolveModelRow(ctx, args.modelId);
    const modelId = row?.modelId ?? DEFAULT_MODEL.id;
    const reasoning = args.reasoning ?? DEFAULT_REASONING;

    const session = await findSession(ctx, args.sessionId, args.clientId);
    let threadId: string;
    if (session) {
      threadId = session.threadId;
      if (session.lastModelId !== modelId) {
        await ctx.db.patch(session._id, { lastModelId: modelId });
      }
    } else {
      const title = titleFromText(args.text);
      const created = await chatAgent.createThread(ctx, {
        userId: args.clientId,
        ...(title !== undefined && { title }),
      });
      threadId = created.threadId;
      await ctx.db.insert("chatSessions", {
        sessionId: args.sessionId,
        clientId: args.clientId,
        threadId,
        ...(title !== undefined && { title }),
        lastModelId: modelId,
      });
    }

    const { messageId } = await chatAgent.saveMessage(ctx, {
      threadId,
      userId: args.clientId,
      prompt: args.text,
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.stream, {
      threadId,
      promptMessageId: messageId,
      modelId,
      reasoning,
    });
    return { threadId, messageId };
  },
});

export const cancel = mutation({
  args: {
    sessionId: v.string(),
    clientId: v.string(),
    order: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await findSession(ctx, args.sessionId, args.clientId);
    if (!session) return false;
    return await abortStream(ctx, components.agent, {
      threadId: session.threadId,
      order: args.order,
      reason: args.reason ?? "Cancelled by user",
    });
  },
});

async function summarizeOlderTurns(
  ctx: ActionCtx,
  threadId: string,
  modelId: string,
  surface: ChatModel["surface"],
  api: ChatModel["api"]
): Promise<string | null> {
  const recent = await chatAgent.listMessages(ctx, {
    threadId,
    paginationOpts: { cursor: null, numItems: 5 },
  });
  const lastInputTokens = recent.page.find((m) => m.usage)?.usage?.promptTokens ?? 0;
  if (lastInputTokens <= COMPACT_AT_TOKENS) return null;

  const all = await chatAgent.listMessages(ctx, {
    threadId,
    excludeToolMessages: true,
    paginationOpts: { cursor: null, numItems: 200 },
  });
  if (all.page.length <= KEEP_RECENT_MESSAGES) return null;
  const ordered = all.page.toReversed();
  const older = ordered.slice(0, ordered.length - KEEP_RECENT_MESSAGES);
  const transcript = older
    .map((m) => `${m.message?.role === "user" ? "User" : "Assistant"}: ${m.text ?? ""}`.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  if (!transcript) return null;

  const result = streamText({
    model: getChatModel(modelId, surface, api),
    prompt:
      "Summarize the earlier part of this conversation into a concise brief that " +
      "preserves facts, names, preferences, and decisions. Output only the summary, " +
      `no preamble.\n\n${transcript}`,
  });
  let summary = "";
  for await (const delta of result.textStream) summary += delta;
  summary = summary.trim();
  return summary || null;
}

async function latestUserQuery(ctx: ActionCtx, threadId: string): Promise<string> {
  const page = await chatAgent.listMessages(ctx, {
    threadId,
    excludeToolMessages: true,
    paginationOpts: { cursor: null, numItems: 10 },
  });
  return page.page.find((m) => m.message?.role === "user")?.text ?? "";
}

export const stream = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    modelId: v.optional(v.string()),
    reasoning: v.optional(v.boolean()),
  },
  handler: async (ctx, { threadId, promptMessageId, modelId, reasoning }) => {
    const resolved = await ctx.runQuery(internal.models.resolveForRun, {
      ...(modelId !== undefined && { modelId }),
    });
    const id = resolved?.id ?? DEFAULT_MODEL.id;
    const surface = resolved?.surface ?? DEFAULT_MODEL.surface;
    const api = resolved?.api ?? DEFAULT_MODEL.api;
    const supportsReasoning = resolved?.supportsReasoning ?? DEFAULT_MODEL.supportsReasoning;
    const supportsTools = resolved?.supportsTools ?? DEFAULT_MODEL.supportsTools;
    const reasoningOn = (reasoning ?? DEFAULT_REASONING) && supportsReasoning;
    const modelArgs = chatModelArgs(id, surface, api, reasoningOn, supportsTools);

    const contextMessages: { role: "system"; content: string }[] = [];

    const userQuery = await latestUserQuery(ctx, threadId);
    const retrieved = userQuery
      ? await retrievePortfolioContext(ctx, userQuery)
      : { text: "", images: [] };
    if (retrieved.text) {
      contextMessages.push({
        role: "system",
        content:
          "Relevant facts about Shahathir Iskandar, retrieved for this question. Ground your " +
          `answer in them; if they do not cover it, say you do not know.\n\n${retrieved.text}`,
      });
    }
    if (retrieved.images.length > 0) {
      const list = retrieved.images.map((image) => `- ${image.title}: ${image.url}`).join("\n");
      contextMessages.push({
        role: "system",
        content:
          "Relevant images from Shahathir's portfolio (title: URL), matched to this question. " +
          "If the user wants to see them, asks about a photo/screenshot, or an image clearly " +
          "helps, show the relevant ones as markdown images. CRITICAL formatting rule: put each " +
          "image on its OWN line as `![title](URL)`, with a blank line before and after it. Never " +
          "place an image on the same line as text or inside a sentence — write any commentary on " +
          "a separate line. Only include images that are genuinely relevant; do not list URLs as " +
          `plain text.\n\n${list}`,
      });
    }

    const summary = await summarizeOlderTurns(ctx, threadId, id, surface, api);
    if (summary) {
      contextMessages.push({
        role: "system",
        content: `Summary of earlier conversation:\n${summary}`,
      });
    }

    const result = await chatAgent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        ...modelArgs,
        ...(supportsTools ? {} : { tools: {} }),
        ...(contextMessages.length > 0 ? { messages: contextMessages } : {}),
      },
      {
        saveStreamDeltas: true,
        ...(summary ? { contextOptions: { recentMessages: KEEP_RECENT_MESSAGES } } : {}),
      }
    );
    await result.consumeStream();
  },
});
