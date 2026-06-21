import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  spotifyStatus: defineTable({
    isPlaying: v.boolean(),
    trackId: v.optional(v.string()),
    song: v.optional(v.string()),
    artist: v.optional(v.string()),
    album: v.optional(v.string()),
    albumArtUrl: v.optional(v.string()),
    url: v.optional(v.string()),
    playedAt: v.optional(v.number()),
    fetchedAt: v.number(),
  }),

  commits: defineTable({
    sha: v.string(),
    shortSha: v.string(),
    subject: v.string(),
    type: v.string(),
    noise: v.boolean(),
    authorDate: v.number(),
    url: v.string(),
  })
    .index("by_sha", ["sha"])
    .index("by_date", ["authorDate"])
    .index("by_type_date", ["type", "authorDate"])
    .searchIndex("search_subject", { searchField: "subject" }),

  commitCounts: defineTable({
    type: v.string(),
    count: v.number(),
  }).index("by_type", ["type"]),

  commitFileLists: defineTable({
    sha: v.string(),
    parentSha: v.string(),
    filesJson: v.string(),
    fetchedAt: v.number(),
  }).index("by_sha", ["sha"]),

  commitBlobs: defineTable({
    ref: v.string(),
    path: v.string(),
    content: v.string(),
    truncated: v.boolean(),
    fetchedAt: v.number(),
  }).index("by_ref_path", ["ref", "path"]),

  githubContributions: defineTable({
    username: v.string(),
    payload: v.string(),
    fetchedAt: v.number(),
  }).index("by_username", ["username"]),

  tweakcnThemes: defineTable({
    key: v.string(),
    payload: v.string(),
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  photos: defineTable({
    storageId: v.id("_storage"),
    title: v.string(),
    date: v.string(),
    description: v.string(),
    order: v.number(),
    width: v.number(),
    height: v.number(),
    kind: v.string(),
  }).index("by_kind_order", ["kind", "order"]),

  assets: defineTable({
    storageId: v.id("_storage"),
    key: v.string(),
    title: v.string(),
    kind: v.string(),
    description: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  })
    .index("by_kind", ["kind"])
    .index("by_key", ["key"]),

  songs: defineTable({
    storageId: v.id("_storage"),
    coverStorageId: v.optional(v.id("_storage")),
    title: v.string(),
    artist: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  // Curated bookmarks shown on /bookmarks. Two sections: "reading" (blogs /
  // articles, sorted by `publishedAt` descending) and "resource" (websites worth
  // revisiting, sorted by `order`). Each row carries a screenshot preview stored
  // as a Convex blob (`previewId`, resolved to a URL in `bookmarks.list`) plus an
  // optional inlined favicon data URI. Seeded/refreshed by
  // `scripts/ingest-bookmarks.ts` via the `bookmarks:upsertBookmark` mutation,
  // which snapshots each site with headless Chrome. `url` is unique per row.
  bookmarks: defineTable({
    section: v.union(v.literal("reading"), v.literal("resource")),
    url: v.string(),
    title: v.string(),
    domain: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    // Article publish date (ms epoch) — readings only, best-effort from metadata.
    publishedAt: v.optional(v.number()),
    // When it was bookmarked (ms epoch) — from the browser export when known.
    addedAt: v.number(),
    // Manual sort key within a section (insertion order from the ingest list).
    order: v.number(),
    previewId: v.optional(v.id("_storage")),
    faviconUrl: v.optional(v.string()),
  })
    .index("by_section", ["section"])
    .index("by_url", ["url"]),

  // Chat sessions map a public, client-generated UUIDv7 (`sessionId`) to an
  // Agent-component thread. `clientId` (also a UUIDv7) scopes sessions to a
  // single browser so a visitor can list/switch/delete their own chats. Neither
  // id is a secret beyond being unguessable — the /chat endpoint is unauthed.
  chatSessions: defineTable({
    sessionId: v.string(),
    clientId: v.string(),
    threadId: v.string(),
    title: v.optional(v.string()),
    // Model id of the most recent turn, recorded in `chat.send`. The usage query
    // prices the latest turn against the model that actually produced it (the
    // Agent component doesn't store a per-message model). Optional: sessions
    // predating this field, or before their first turn, fall back to the default.
    lastModelId: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_client", ["clientId"]),

  // Chat model registry, owner-editable at runtime (Convex dashboard / mutation)
  // without a code deploy. Seeded from lib/chat/models.ts via `models:seed`. The
  // client dropdown reads it through `chat.models`; the server prices/whitelists
  // turns against it. `api` is the Bedrock Mantle surface (chat vs responses),
  // `isDefault` marks the fallback model, `order` sets dropdown position.
  chatModels: defineTable({
    modelId: v.string(),
    name: v.string(),
    provider: v.string(),
    contextTokens: v.number(),
    pricing: v.object({ inputPer1M: v.number(), outputPer1M: v.number() }),
    // Provider surface: "mantle" (OpenAI-compat gateway) or "converse" (native
    // Bedrock Converse API). Optional so adding it to a seeded table validates;
    // `models:seed` backfills existing rows and reads default to "mantle".
    surface: v.optional(v.union(v.literal("mantle"), v.literal("converse"))),
    // Mantle OpenAI-compat route; only meaningful when surface is "mantle".
    api: v.union(v.literal("responses"), v.literal("chat")),
    // Binary reasoning capability (off / on=high). Optional so adding it to an
    // already-seeded table validates; `models:seed` backfills existing rows and
    // reads default to true.
    supportsReasoning: v.optional(v.boolean()),
    isDefault: v.boolean(),
    order: v.number(),
  })
    .index("by_modelId", ["modelId"])
    .index("by_order", ["order"]),

  // RAG knowledge base for the /chat assistant: one embedded chunk per portfolio
  // item (experience / project / certificate), serialized from `lib/data.tsx` by
  // `scripts/ingest-rag.ts`. `dimensions` MUST equal EMBEDDING_DIMENSION in
  // `lib/chat/provider.ts` (Amazon Nova embeddings, 1024). Queried in
  // `convex/rag.ts` via `ctx.vectorSearch` and injected as context in the chat run.
  portfolioChunks: defineTable({
    source: v.string(),
    refKey: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
    // Cross-modal: text chunks vs. image chunks (gallery photos). Absent =
    // "text". Photo chunks carry the storage blob; project text chunks carry
    // their screenshot's asset key — both resolve to a URL on retrieval.
    modality: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    imageKey: v.optional(v.string()),
  })
    .index("by_ref", ["refKey"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1024,
      filterFields: ["source"],
    }),
});
