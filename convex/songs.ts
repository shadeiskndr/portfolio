import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("songs").withIndex("by_order").collect();
    const resolved = await Promise.all(
      rows.map(async (row) => {
        const url = await ctx.storage.getUrl(row.storageId);
        if (!url) return null;
        const cover = row.coverStorageId ? await ctx.storage.getUrl(row.coverStorageId) : null;
        return {
          src: url,
          title: row.title,
          artist: row.artist,
          cover,
        };
      })
    );
    return resolved.filter((t): t is NonNullable<typeof t> => t !== null);
  },
});

export const addSong = internalMutation({
  args: {
    storageId: v.id("_storage"),
    coverStorageId: v.optional(v.id("_storage")),
    title: v.string(),
    artist: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("songs").collect();
    const order = existing.reduce((max, s) => Math.max(max, s.order), -1) + 1;
    await ctx.db.insert("songs", { ...args, order });
    return { order };
  },
});

export const listForCover = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("songs").withIndex("by_order").collect();
    return rows.map((row) => ({
      id: row._id,
      title: row.title,
      hasCover: row.coverStorageId !== undefined,
    }));
  },
});

export const setCover = internalMutation({
  args: { id: v.id("songs"), coverStorageId: v.id("_storage") },
  handler: async (ctx, { id, coverStorageId }) => {
    await ctx.db.patch(id, { coverStorageId });
  },
});
