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
});
