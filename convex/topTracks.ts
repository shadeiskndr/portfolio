import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";
import { clearRateLimit, getAccessToken, isRateLimited, recordRateLimit } from "./spotify";

export const TIME_RANGES = ["short_term", "medium_term", "long_term"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

const timeRangeValidator = v.union(
  v.literal("short_term"),
  v.literal("medium_term"),
  v.literal("long_term")
);

const LIMIT = 24;

const TOP_TRACKS_ENDPOINT = "top-tracks";

type TopTracksResponse = {
  items: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    external_urls?: { spotify?: string };
    album: {
      name: string;
      release_date?: string;
      images: { url: string; width: number | null }[];
    };
  }[];
};

const trackFields = {
  trackId: v.string(),
  song: v.string(),
  artist: v.string(),
  album: v.string(),
  albumArtUrl: v.optional(v.string()),
  url: v.string(),
  durationMs: v.number(),
  releaseDate: v.optional(v.string()),
};

export const refreshTopTracks = internalAction({
  args: {},
  handler: async (ctx) => {
    if (await isRateLimited(ctx, TOP_TRACKS_ENDPOINT)) {
      return { skipped: "rate-limited" as const, total: 0 };
    }

    let total = 0;

    const accessToken = await getAccessToken(ctx);
    const headers = { Authorization: `Bearer ${accessToken}` };

    for (const timeRange of TIME_RANGES) {
      // react-doctor-disable-next-line react-doctor/async-await-in-loop
      const res = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?limit=${LIMIT}&time_range=${timeRange}`,
        { headers }
      );

      if (res.status === 403) {
        throw new Error(
          "Spotify 403 on /me/top/tracks — SPOTIFY_REFRESH_TOKEN is missing the " +
            "`user-top-read` scope. Re-mint it with `bun run scripts/spotify-auth.ts`."
        );
      }
      if (res.status === 429 || res.status >= 500) {
        const waitMs = await recordRateLimit(
          ctx,
          TOP_TRACKS_ENDPOINT,
          res.headers.get("retry-after")
        );
        throw new Error(
          `Spotify ${res.status} on /me/top/tracks — backing off ${Math.round(waitMs / 1000)}s, keeping cached rows`
        );
      }
      if (!res.ok) {
        throw new Error(
          `Spotify /me/top/tracks ${res.status}: ${(await res.text()).slice(0, 200)}`
        );
      }

      const data = (await res.json()) as TopTracksResponse;
      const tracks = data.items.map((item, rank) => ({
        rank,
        trackId: item.id,
        song: item.name,
        artist: item.artists.map((a) => a.name).join(", "),
        album: item.album.name,
        ...(item.album.images[0]?.url !== undefined && {
          albumArtUrl: item.album.images[0]?.url,
        }),
        url: item.external_urls?.spotify ?? `https://open.spotify.com/track/${item.id}`,
        durationMs: item.duration_ms,
        ...(item.album.release_date !== undefined && {
          releaseDate: item.album.release_date,
        }),
      }));

      if (tracks.length === 0) continue;

      await ctx.runMutation(internal.topTracks.replaceRange, { timeRange, tracks });
      total += tracks.length;
    }

    await clearRateLimit(ctx, TOP_TRACKS_ENDPOINT);
    return { skipped: null, total };
  },
});

export const replaceRange = internalMutation({
  args: {
    timeRange: timeRangeValidator,
    tracks: v.array(v.object({ rank: v.number(), ...trackFields })),
  },
  handler: async (ctx, { timeRange, tracks }) => {
    // biome-ignore lint/plugin: Spotify returns at most 50 tracks per range
    const existing = await ctx.db
      .query("topTracks")
      .withIndex("by_range_rank", (q) => q.eq("timeRange", timeRange))
      .collect();
    await Promise.all(existing.map((row) => ctx.db.delete("topTracks", row._id)));

    const fetchedAt = Date.now();
    await Promise.all(
      tracks.map((track) => ctx.db.insert("topTracks", { timeRange, fetchedAt, ...track }))
    );
  },
});

export const list = query({
  args: { timeRange: timeRangeValidator },
  handler: async (ctx, { timeRange }) => {
    // biome-ignore lint/plugin: Spotify returns at most 50 tracks per range
    return await ctx.db
      .query("topTracks")
      .withIndex("by_range_rank", (q) => q.eq("timeRange", timeRange))
      .collect();
  },
});
