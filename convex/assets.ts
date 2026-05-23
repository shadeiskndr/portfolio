import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: { kind: v.optional(v.string()) },
  handler: async (ctx, { kind }) => {
    const rows = kind
      ? await ctx.db
          .query("assets")
          .withIndex("by_kind", (q) => q.eq("kind", kind))
          .collect()
      : await ctx.db.query("assets").collect();
    return await Promise.all(
      rows.map(async (row) => {
        const url = await ctx.storage.getUrl(row.storageId);
        const meta = await ctx.db.system.get(row.storageId);
        return {
          url,
          title: row.title,
          kind: row.kind,
          description: row.description,
          contentType: meta?.contentType ?? null,
          size: meta?.size ?? 0,
        };
      })
    );
  },
});

export const addAsset = internalMutation({
  args: {
    storageId: v.id("_storage"),
    title: v.string(),
    kind: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("assets", args);
  },
});
