import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery, query } from "./_generated/server";

const sectionValidator = v.union(v.literal("reading"), v.literal("resource"));

export type ResolvedBookmark = {
  url: string;
  title: string;
  domain: string;
  description: string | null;
  tags: string[];
  publishedAt: number | null;
  addedAt: number;
  previewUrl: string | null;
  faviconUrl: string | null;
};

function sortForSection(section: "reading" | "resource", rows: Doc<"bookmarks">[]) {
  const sorted = [...rows];
  if (section === "reading") {
    sorted.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0) || a.order - b.order);
  } else {
    sorted.sort((a, b) => a.order - b.order);
  }
  return sorted;
}

export const list = query({
  args: { section: sectionValidator },
  handler: async (ctx, { section }): Promise<ResolvedBookmark[]> => {
    // biome-ignore lint/plugin: one curated section; every row is rendered
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_section", (q) => q.eq("section", section))
      .collect();

    return await Promise.all(
      sortForSection(section, rows).map(async (row) => ({
        url: row.url,
        title: row.title,
        domain: row.domain,
        description: row.description ?? null,
        tags: row.tags,
        publishedAt: row.publishedAt ?? null,
        addedAt: row.addedAt,
        previewUrl: row.previewId ? await ctx.storage.getUrl(row.previewId) : null,
        faviconUrl: row.faviconUrl ?? null,
      }))
    );
  },
});

export const upsertBookmark = internalMutation({
  args: {
    section: sectionValidator,
    url: v.string(),
    title: v.string(),
    domain: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    addedAt: v.number(),
    order: v.number(),
    previewId: v.optional(v.id("_storage")),
    faviconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();

    if (existing) {
      if (args.previewId && existing.previewId && existing.previewId !== args.previewId) {
        await ctx.storage.delete(existing.previewId);
      }
      await ctx.db.patch("bookmarks", existing._id, {
        ...args,
        previewId: args.previewId ?? existing.previewId,
      });
      return { id: existing._id, created: false };
    }

    const id = await ctx.db.insert("bookmarks", args);
    return { id, created: true };
  },
});

async function collectReferencedStorageIds(ctx: QueryCtx): Promise<Set<string>> {
  const referenced = new Set<string>();
  const add = (id: Id<"_storage"> | undefined | null) => {
    if (id) referenced.add(id);
  };
  // biome-ignore-start lint/plugin: GC reachability scan; a partial read would mark live blobs as orphans
  for (const b of await ctx.db.query("bookmarks").collect()) add(b.previewId);
  for (const p of await ctx.db.query("photos").collect()) add(p.storageId);
  for (const a of await ctx.db.query("assets").collect()) add(a.storageId);
  for (const s of await ctx.db.query("songs").collect()) {
    add(s.storageId);
    add(s.coverStorageId);
  }
  for (const c of await ctx.db.query("portfolioChunks").collect()) add(c.storageId);
  // biome-ignore-end lint/plugin: GC reachability scan; a partial read would mark live blobs as orphans
  return referenced;
}

export const findOrphanBlobs = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [referenced, files] = await Promise.all([
      collectReferencedStorageIds(ctx),
      // biome-ignore lint/plugin: orphan detection must see every stored file
      ctx.db.system.query("_storage").collect(),
    ]);
    const orphans = files.filter((f) => !referenced.has(f._id));
    const orphanBytes = orphans.reduce((sum, f) => sum + f.size, 0);
    return {
      totalFiles: files.length,
      referenced: referenced.size,
      orphanCount: orphans.length,
      orphanBytes,
      orphans: orphans.map((f) => ({
        id: f._id,
        contentType: f.contentType ?? null,
        sizeKB: Math.round(f.size / 1024),
      })),
    };
  },
});

export const deleteOrphanBlobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const [referenced, files] = await Promise.all([
      collectReferencedStorageIds(ctx),
      // biome-ignore lint/plugin: orphan deletion must see every stored file
      ctx.db.system.query("_storage").collect(),
    ]);
    const orphans = files.filter((f) => !referenced.has(f._id));
    await Promise.all(orphans.map((f) => ctx.storage.delete(f._id)));
    return {
      deleted: orphans.length,
      freedKB: Math.round(orphans.reduce((s, f) => s + f.size, 0) / 1024),
    };
  },
});

export const clearSection = internalMutation({
  args: { section: sectionValidator },
  handler: async (ctx, { section }) => {
    // biome-ignore lint/plugin: must delete every row in the section
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_section", (q) => q.eq("section", section))
      .collect();
    await Promise.all(
      rows.map(async (row) => {
        if (row.previewId) await ctx.storage.delete(row.previewId);
        await ctx.db.delete("bookmarks", row._id);
      })
    );
    return { deleted: rows.length };
  },
});
