import { v } from "convex/values";
import { type MutationCtx, mutation, type QueryCtx, query } from "./_generated/server";
import { chatAgent } from "./agent";

async function findSession(ctx: QueryCtx | MutationCtx, sessionId: string, clientId: string) {
  const session = await ctx.db
    .query("chatSessions")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();
  if (!session || session.clientId !== clientId) return null;
  return session;
}

export const list = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .order("desc")
      .take(50);
    return sessions.map((s) => ({
      sessionId: s.sessionId,
      title: s.title,
      createdAt: s._creationTime,
    }));
  },
});

export const rename = mutation({
  args: { sessionId: v.string(), clientId: v.string(), title: v.string() },
  handler: async (ctx, { sessionId, clientId, title }) => {
    const session = await findSession(ctx, sessionId, clientId);
    if (!session) return null;
    const trimmed = title.trim().slice(0, 80);
    await ctx.db.patch("chatSessions", session._id, { title: trimmed || undefined });
    return null;
  },
});

export const remove = mutation({
  args: { sessionId: v.string(), clientId: v.string() },
  handler: async (ctx, { sessionId, clientId }) => {
    const session = await findSession(ctx, sessionId, clientId);
    if (!session) return null;
    await chatAgent.updateThreadMetadata(ctx, {
      threadId: session.threadId,
      patch: { status: "archived" },
    });
    await ctx.db.delete("chatSessions", session._id);
    return null;
  },
});
