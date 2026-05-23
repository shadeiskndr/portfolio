import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("photos")
      .withIndex("by_kind_order", (q) => q.eq("kind", "gallery"))
      .collect();
    const resolved = await Promise.all(
      rows.map(async (row) => {
        const url = await ctx.storage.getUrl(row.storageId);
        if (!url) return null;
        return {
          src: url,
          title: row.title,
          date: row.date,
          description: row.description,
          width: row.width,
          height: row.height,
        };
      })
    );
    return resolved.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

export const listByKind = query({
  args: { kind: v.string() },
  handler: async (ctx, { kind }) => {
    const rows = await ctx.db
      .query("photos")
      .withIndex("by_kind_order", (q) => q.eq("kind", kind))
      .collect();
    return await Promise.all(
      rows.map(async (row) => ({
        src: await ctx.storage.getUrl(row.storageId),
        title: row.title,
        description: row.description,
        width: row.width,
        height: row.height,
      }))
    );
  },
});

export const addPhoto = internalMutation({
  args: {
    storageId: v.id("_storage"),
    kind: v.string(),
    title: v.string(),
    date: v.string(),
    description: v.string(),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("photos")
      .withIndex("by_kind_order", (q) => q.eq("kind", args.kind))
      .collect();
    const order = existing.reduce((max, p) => Math.max(max, p.order), -1) + 1;
    await ctx.db.insert("photos", { ...args, order });
    return { order };
  },
});
