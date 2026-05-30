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
          key: row.key,
          title: row.title,
          kind: row.kind,
          description: row.description,
          width: row.width ?? null,
          height: row.height ?? null,
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
    key: v.string(),
    title: v.string(),
    kind: v.string(),
    description: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("assets", args);
    return {
      url: await ctx.storage.getUrl(args.storageId),
      width: args.width ?? null,
      height: args.height ?? null,
    };
  },
});

// Swap an existing asset's file in place (same key/url-less identity): deletes the
// old storage blob and repoints the row at a newly-uploaded one. Used to replace a
// file with an optimized version without creating a duplicate row.
export const replaceAssetFile = internalMutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("assets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!row) throw new Error(`No asset with key "${args.key}"`);
    await ctx.storage.delete(row.storageId);
    await ctx.db.patch(row._id, {
      storageId: args.storageId,
      width: args.width,
      height: args.height,
    });
    return { url: await ctx.storage.getUrl(args.storageId) };
  },
});
