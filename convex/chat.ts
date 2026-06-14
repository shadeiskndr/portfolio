import { vAgentMessageInput } from "@convex-dev/agent/validators";
import { streamQueryArgsValidator } from "@convex-dev/stream";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { chatAgent } from "./agent";

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
    await ctx.scheduler.runAfter(0, internal.chat.execute, { runId: run.runId });
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

export const execute = internalAction({
  args: { runId: v.string() },
  handler: async (ctx, { runId }) => {
    await chatAgent.runs.execute(ctx, { runId });
  },
});
