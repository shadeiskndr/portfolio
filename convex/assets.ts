import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: { kind: v.optional(v.string()) },
  handler: async (ctx, { kind }) => {
    // biome-ignore-start lint/plugin: useAsset resolves keys from the full map; a partial read silently yields undefined
    const rows = kind
      ? await ctx.db
          .query("assets")
          .withIndex("by_kind", (q) => q.eq("kind", kind))
          .collect()
      : await ctx.db.query("assets").collect();
    // biome-ignore-end lint/plugin: useAsset resolves keys from the full map; a partial read silently yields undefined
    return await Promise.all(
      rows.map(async (row) => {
        const [url, meta] = await Promise.all([
          ctx.storage.getUrl(row.storageId),
          ctx.db.system.get("_storage", row.storageId),
        ]);
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
    await ctx.db.patch("assets", row._id, {
      storageId: args.storageId,
      width: args.width,
      height: args.height,
    });
    return { url: await ctx.storage.getUrl(args.storageId) };
  },
});
