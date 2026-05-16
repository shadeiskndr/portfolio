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

  githubContributions: defineTable({
    username: v.string(),
    payload: v.string(),
    fetchedAt: v.number(),
  }).index("by_username", ["username"]),
});
