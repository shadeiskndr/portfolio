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

async function findThreadId(ctx: QueryCtx | MutationCtx, sessionId: string) {
  const threads = await chatAgent.threads.list(ctx, {
    userId: sessionId,
    order: "desc",
    paginationOpts: { cursor: null, numItems: 1 },
  });
  return threads.page[0]?._id ?? null;
}

export const list = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const threadId = await findThreadId(ctx, sessionId);
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
    chatId: v.string(),
    trigger: v.union(v.literal("submit-message"), v.literal("regenerate-message")),
    messageId: v.optional(v.string()),
    message: vAgentMessageInput,
    messages: v.array(v.any()),
    body: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await findThreadId(ctx, args.sessionId);
    const threadId =
      existing ?? (await chatAgent.threads.create(ctx, { userId: args.sessionId }))._id;
    const run = await chatAgent.runs.start(ctx, {
      threadId,
      userId: args.sessionId,
      message: args.message,
      key: args.messageId ?? args.chatId,
    });
    await ctx.scheduler.runAfter(0, internal.chat.execute, { runId: run.runId });
    return run;
  },
});

export const read = query({
  args: { sessionId: v.string(), runId: v.string(), streamArgs: streamQueryArgsValidator },
  handler: async (ctx, args) => {
    return await chatAgent.events.read(ctx, { runId: args.runId, ...args.streamArgs });
  },
});

export const cancel = mutation({
  args: { sessionId: v.string(), runId: v.string(), reason: v.optional(v.string()) },
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
