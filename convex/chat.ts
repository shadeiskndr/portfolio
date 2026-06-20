import { vAgentMessageInput } from "@convex-dev/agent/validators";
import { streamQueryArgsValidator } from "@convex-dev/stream";
import { streamText } from "ai";
import { v } from "convex/values";
import { type ChatModel, DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/chat/models";
import { getChatModel } from "../lib/chat/provider";
import { internal } from "./_generated/api";
import {
  type ActionCtx,
  internalAction,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { chatAgent, defineChatModel } from "./agent";
import { listModels, resolveModelRow, toChatModel } from "./models";
import { retrievePortfolioContext } from "./rag";

// Gemma 4 E2B has a 128K-token context window. When a turn's prompt exceeds
// COMPACT_AT_TOKENS (~73% of it), older turns are summarized so the next run
// stays within the window. KEEP_RECENT_MESSAGES are kept verbatim.
const COMPACT_AT_TOKENS = 96_000;
const KEEP_RECENT_MESSAGES = 6;

/** Resolve a session row, scoped to the owning browser (null if not created yet). */
async function findSession(ctx: QueryCtx | MutationCtx, sessionId: string, clientId: string) {
  const session = await ctx.db
    .query("chatSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();
  if (!session || session.clientId !== clientId) return null;
  return session;
}

/** USD cost for a token count at a per-million-token rate. */
function tokenCostUSD(tokens: number, per1M: number): number {
  return (tokens * per1M) / 1_000_000;
}

/** Derive a short session title from the first user message. */
function titleFromMessage(message: {
  text?: string;
  message?: { content?: Array<{ type: string; text?: string }> };
}): string | undefined {
  const fromContent = message.message?.content?.find(
    (part): part is { type: "text"; text: string } =>
      part.type === "text" && typeof part.text === "string"
  )?.text;
  const text = (message.text ?? fromContent)?.trim();
  if (!text) return undefined;
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export const list = query({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const session = await findSession(ctx, sessionId, clientId);
    if (!session) return [];
    const page = await chatAgent.messages.list(ctx, {
      threadId: session.threadId,
      order: "desc",
      paginationOpts: { cursor: null, numItems: 50 },
    });
    return page.page.toReversed();
  },
});

/**
 * Latest completed turn's token usage, priced and sized on the server so the
 * client just displays it. Context window and per-token prices come from the
 * model that actually ran the turn (`session.lastModelId`), not whatever model
 * is selected now — the two can differ if the visitor switched mid-session.
 */
export const usage = query({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const session = await findSession(ctx, sessionId, clientId);
    if (!session) return null;
    const page = await chatAgent.messages.list(ctx, {
      threadId: session.threadId,
      order: "desc",
      paginationOpts: { cursor: null, numItems: 5 },
    });
    const u = page.page.find((m) => m.usage)?.usage;
    if (!u) return null;

    const row = await resolveModelRow(ctx, session.lastModelId);
    const contextTokens = row?.contextTokens ?? DEFAULT_MODEL.contextTokens;
    const pricing = row?.pricing ?? DEFAULT_MODEL.pricing;
    const inputTokens = u.inputTokens ?? 0;
    const outputTokens = u.outputTokens ?? 0;
    // `usedTokens` = last prompt size — the same signal the compaction gate uses.
    const usedTokens = inputTokens;
    const maxTokens = contextTokens;
    // Our registry prices input and output only (no separate cache/reasoning
    // rate), so total = input + output; reasoning/cache show tokens without cost.
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
          noCacheTokens: u.tokenDetails?.input?.noCacheTokens,
          cacheReadTokens: u.tokenDetails?.input?.cacheReadTokens,
          cacheWriteTokens: u.tokenDetails?.input?.cacheWriteTokens,
        },
        outputTokenDetails: {
          textTokens: u.tokenDetails?.output?.textTokens,
          reasoningTokens: u.tokenDetails?.output?.reasoningTokens,
        },
      },
    };
  },
});

/**
 * The chat model registry, served from the backend so the composer's model
 * dropdown — and the usage gauge's per-model context window + pricing — render
 * from the server's source of truth. Adding, removing, or repricing a model
 * here updates every client without a frontend change. `send` independently
 * whitelists whatever id the client returns, so this list is display-only.
 */
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
    chatId: v.string(),
    trigger: v.union(v.literal("submit-message"), v.literal("regenerate-message")),
    messageId: v.optional(v.string()),
    message: vAgentMessageInput,
    messages: v.array(v.any()),
    body: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // The composer sends its selected model and reasoning effort in `body`.
    // Whitelist both here (public endpoint) so an unknown value can't reach
    // Bedrock; each falls back to the registry default.
    const body = args.body as { modelId?: string; reasoning?: boolean } | undefined;
    const row = await resolveModelRow(ctx, body?.modelId);
    const modelId = row?.modelId ?? DEFAULT_MODEL.id;
    // Binary reasoning toggle; defaults on. Capability is enforced in `execute`.
    const reasoning = body?.reasoning ?? DEFAULT_REASONING;

    const session = await findSession(ctx, args.sessionId, args.clientId);
    let threadId: string;
    if (session) {
      threadId = session.threadId;
      // Record the model this turn runs on so the usage gauge prices it correctly.
      if (session.lastModelId !== modelId) {
        await ctx.db.patch(session._id, { lastModelId: modelId });
      }
    } else {
      const thread = await chatAgent.threads.create(ctx, {
        userId: args.clientId,
        title: titleFromMessage(args.message),
      });
      threadId = thread._id;
      await ctx.db.insert("chatSessions", {
        sessionId: args.sessionId,
        clientId: args.clientId,
        threadId,
        title: titleFromMessage(args.message),
        lastModelId: modelId,
      });
    }
    const run = await chatAgent.runs.start(ctx, {
      threadId,
      userId: args.clientId,
      message: args.message,
      // Idempotency key must be unique per user turn. `message.clientKey` is the
      // AI SDK message id (set by fromVercelMessage) — unique per message. Using
      // `chatId` here collides on the 2nd message in a session (conflictingRunKey).
      key: args.message.clientKey ?? args.messageId ?? args.chatId,
    });
    await ctx.scheduler.runAfter(0, internal.chat.execute, {
      runId: run.runId,
      modelId,
      reasoning,
    });
    return run;
  },
});

export const read = query({
  args: {
    sessionId: v.string(),
    clientId: v.string(),
    runId: v.string(),
    streamArgs: streamQueryArgsValidator,
  },
  handler: async (ctx, args) => {
    return await chatAgent.events.read(ctx, { runId: args.runId, ...args.streamArgs });
  },
});

export const cancel = mutation({
  args: {
    sessionId: v.string(),
    clientId: v.string(),
    runId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await chatAgent.runs.cancel(ctx, { runId: args.runId, reason: args.reason });
  },
});

function messageRole(m: { message?: { author?: { type?: string } } }): string {
  const type = m.message?.author?.type;
  if (type === "user") return "User";
  if (type === "agent") return "Assistant";
  return type ?? "system";
}

/**
 * If the last turn's prompt exceeded COMPACT_AT_TOKENS, summarize every message
 * older than the KEEP_RECENT_MESSAGES window into a single brief. Returns null
 * when compaction isn't needed (so the run uses the default context window).
 */
async function summarizeOlderTurns(
  ctx: ActionCtx,
  threadId: string,
  modelId: string,
  surface: ChatModel["surface"],
  api: ChatModel["api"]
): Promise<string | null> {
  const recent = await chatAgent.messages.list(ctx, {
    threadId,
    order: "desc",
    paginationOpts: { cursor: null, numItems: 5 },
  });
  const lastInputTokens = recent.page.find((m) => m.usage)?.usage?.inputTokens ?? 0;
  if (lastInputTokens <= COMPACT_AT_TOKENS) return null;

  const all = await chatAgent.messages.list(ctx, {
    threadId,
    order: "asc",
    excludeToolMessages: true,
    paginationOpts: { cursor: null, numItems: 200 },
  });
  if (all.page.length <= KEEP_RECENT_MESSAGES) return null;
  const older = all.page.slice(0, all.page.length - KEEP_RECENT_MESSAGES);
  const transcript = older
    .map((m) => `${messageRole(m)}: ${m.text ?? ""}`.trim())
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

/** The current user turn's prompt text, for RAG retrieval (empty if none). */
async function latestUserQuery(ctx: ActionCtx, threadId: string): Promise<string> {
  const page = await chatAgent.messages.list(ctx, {
    threadId,
    order: "desc",
    excludeToolMessages: true,
    paginationOpts: { cursor: null, numItems: 10 },
  });
  const userMessage = page.page.find((m) => m.message?.author?.type === "user");
  return userMessage?.text ?? "";
}

type ContextBlock = { type: "text"; name: string; text: string };

export const execute = internalAction({
  args: {
    runId: v.string(),
    modelId: v.optional(v.string()),
    reasoning: v.optional(v.boolean()),
  },
  handler: async (ctx, { runId, modelId, reasoning }) => {
    // Actions can't read the DB directly; resolve the run's model (id, serving
    // API, reasoning capability) through an internal query, falling back to the
    // bootstrap default. Reasoning only applies when the model supports it.
    const resolved = await ctx.runQuery(internal.models.resolveForRun, { modelId });
    const id = resolved?.id ?? DEFAULT_MODEL.id;
    const surface = resolved?.surface ?? DEFAULT_MODEL.surface;
    const api = resolved?.api ?? DEFAULT_MODEL.api;
    const supportsReasoning = resolved?.supportsReasoning ?? DEFAULT_MODEL.supportsReasoning;
    const reasoningOn = (reasoning ?? DEFAULT_REASONING) && supportsReasoning;
    const model = defineChatModel(id, surface, api, reasoningOn);
    const run = await chatAgent.runs.get(ctx, { runId });
    if (!run) {
      await chatAgent.runs.execute(ctx, { runId, model });
      return;
    }

    const contextBlocks: ContextBlock[] = [];

    // Prompt-based RAG: always retrieve portfolio facts relevant to the current
    // question and inject them as context (see convex/rag.ts). Gemma is small,
    // so we retrieve unconditionally rather than relying on a search tool call.
    // Cross-modal: retrieval returns text facts AND relevant image URLs (gallery
    // photos / project screenshots), ranked together from one vector space.
    const query = await latestUserQuery(ctx, run.threadId);
    const retrieved = query ? await retrievePortfolioContext(ctx, query) : { text: "", images: [] };
    if (retrieved.text) {
      contextBlocks.push({
        type: "text",
        name: "portfolio_facts",
        text:
          "Relevant facts about Shahathir Iskandar, retrieved for this question. Ground your " +
          `answer in them; if they do not cover it, say you do not know.\n\n${retrieved.text}`,
      });
    }
    if (retrieved.images.length > 0) {
      const list = retrieved.images.map((image) => `- ${image.title}: ${image.url}`).join("\n");
      contextBlocks.push({
        type: "text",
        name: "portfolio_images",
        text:
          "Relevant images from Shahathir's portfolio (title: URL), matched to this question. " +
          "If the user wants to see them, asks about a photo/screenshot, or an image clearly " +
          "helps, show the relevant ones as markdown images. CRITICAL formatting rule: put each " +
          "image on its OWN line as `![title](URL)`, with a blank line before and after it. Never " +
          "place an image on the same line as text or inside a sentence — write any commentary on " +
          "a separate line. Only include images that are genuinely relevant; do not list URLs as " +
          `plain text.\n\n${list}`,
      });
    }

    // Token-based compaction: when the last prompt neared the window, summarize
    // older turns and keep only the recent window verbatim.
    const summary = await summarizeOlderTurns(ctx, run.threadId, id, surface, api);
    if (summary) {
      contextBlocks.push({
        type: "text",
        name: "conversation_summary",
        text: `Summary of earlier conversation:\n${summary}`,
      });
    }

    await chatAgent.runs.execute(ctx, {
      runId,
      model,
      ...(summary ? { recentMessages: KEEP_RECENT_MESSAGES } : {}),
      ...(contextBlocks.length > 0 ? { context: () => Promise.resolve(contextBlocks) } : {}),
    });
  },
});
