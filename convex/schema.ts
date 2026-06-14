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

  // Chat sessions map a public, client-generated UUIDv7 (`sessionId`) to an
  // Agent-component thread. `clientId` (also a UUIDv7) scopes sessions to a
  // single browser so a visitor can list/switch/delete their own chats. Neither
  // id is a secret beyond being unguessable — the /chat endpoint is unauthed.
  chatSessions: defineTable({
    sessionId: v.string(),
    clientId: v.string(),
    threadId: v.string(),
    title: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_client", ["clientId"]),
});
