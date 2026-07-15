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
    recentCheckedAt: v.optional(v.number()),
  }),

  spotifyAuth: defineTable({
    accessToken: v.string(),
    expiresAt: v.number(),
  }),

  spotifyBackoff: defineTable({
    endpoint: v.string(),
    blockedUntil: v.number(),
    attempts: v.number(),
  }).index("by_endpoint", ["endpoint"]),

  topTracks: defineTable({
    timeRange: v.union(v.literal("short_term"), v.literal("medium_term"), v.literal("long_term")),
    rank: v.number(),
    trackId: v.string(),
    song: v.string(),
    artist: v.string(),
    album: v.string(),
    albumArtUrl: v.optional(v.string()),
    url: v.string(),
    durationMs: v.number(),
    releaseDate: v.optional(v.string()),
    fetchedAt: v.number(),
  }).index("by_range_rank", ["timeRange", "rank"]),

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

  codestatsProfile: defineTable({
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

  bookmarks: defineTable({
    section: v.union(v.literal("reading"), v.literal("resource")),
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
  })
    .index("by_section", ["section"])
    .index("by_url", ["url"]),

  chatSessions: defineTable({
    sessionId: v.string(),
    clientId: v.string(),
    threadId: v.string(),
    title: v.optional(v.string()),
    lastModelId: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_client", ["clientId"]),

  chatModels: defineTable({
    modelId: v.string(),
    name: v.string(),
    provider: v.string(),
    contextTokens: v.number(),
    pricing: v.object({ inputPer1M: v.number(), outputPer1M: v.number() }),
    surface: v.optional(v.union(v.literal("mantle"), v.literal("converse"))),
    api: v.union(v.literal("responses"), v.literal("chat")),
    supportsReasoning: v.optional(v.boolean()),
    isDefault: v.boolean(),
    order: v.number(),
  })
    .index("by_modelId", ["modelId"])
    .index("by_order", ["order"]),

  portfolioChunks: defineTable({
    source: v.string(),
    refKey: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
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
