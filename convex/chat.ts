import { vAgentMessageInput } from "@convex-dev/agent/validators";
import { streamQueryArgsValidator } from "@convex-dev/stream";
import { streamText } from "ai";
import { v } from "convex/values";
import { resolveModelId } from "../lib/chat/models";
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
import { retrievePortfolioContext } from "./rag";

// Gemma 4 E2B has a 128K-token context window. When a turn's prompt exceeds
// COMPACT_AT_TOKENS (~73% of it), older turns are summarized so the next run
// stays within the window. KEEP_RECENT_MESSAGES are kept verbatim.
const COMPACT_AT_TOKENS = 96_000;
const KEEP_RECENT_MESSAGES = 6;

/** Resolve a session's thread, scoped to the owning browser (null if not created yet). */
async function findThreadId(ctx: QueryCtx | MutationCtx, sessionId: string, clientId: string) {
  const session = await ctx.db
    .query("chatSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();
  if (!session || session.clientId !== clientId) return null;
  return session.threadId;
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
    const threadId = await findThreadId(ctx, sessionId, clientId);
    if (!threadId) return [];
    const page = await chatAgent.messages.list(ctx, {
      threadId,
      order: "desc",
      paginationOpts: { cursor: null, numItems: 50 },
    });
    return page.page.toReversed();
  },
});

/** Token usage of the latest completed turn, shaped for the AI SDK Context UI. */
export const usage = query({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const threadId = await findThreadId(ctx, sessionId, clientId);
    if (!threadId) return null;
    const page = await chatAgent.messages.list(ctx, {
      threadId,
      order: "desc",
      paginationOpts: { cursor: null, numItems: 5 },
    });
    const u = page.page.find((m) => m.usage)?.usage;
    if (!u) return null;
    return {
      // `usedTokens` = last prompt size — the same signal the compaction gate uses.
      usedTokens: u.inputTokens ?? 0,
      usage: {
        inputTokens: u.inputTokens ?? 0,
        outputTokens: u.outputTokens ?? 0,
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
    let threadId = await findThreadId(ctx, args.sessionId, args.clientId);
    if (!threadId) {
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
    // The composer sends its selected model in `body.modelId`. Whitelist it here
    // (public endpoint) so an unknown id can't reach Bedrock; falls back to the
    // registry default.
    const modelId = resolveModelId((args.body as { modelId?: string } | undefined)?.modelId);
    await ctx.scheduler.runAfter(0, internal.chat.execute, { runId: run.runId, modelId });
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
  modelId?: string
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
    model: getChatModel(modelId),
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
  args: { runId: v.string(), modelId: v.optional(v.string()) },
  handler: async (ctx, { runId, modelId }) => {
    const model = defineChatModel(modelId);
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
    const summary = await summarizeOlderTurns(ctx, run.threadId, modelId);
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
