import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";

type SpotifyTrackResponse = {
  is_playing?: boolean;
  item?: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    external_urls: { spotify: string };
  } | null;
};

type RecentlyPlayedResponse = {
  items: {
    played_at: string;
    track: SpotifyTrackResponse["item"];
  }[];
};

type NormalizedTrack = {
  trackId: string;
  song: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  url: string;
};

function normalize(item: NonNullable<SpotifyTrackResponse["item"]>): NormalizedTrack {
  return {
    trackId: item.id,
    song: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    album: item.album.name,
    albumArtUrl: item.album.images[0]?.url ?? null,
    url: item.external_urls.spotify,
  };
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!(clientId && clientSecret && refreshToken)) {
    throw new Error("Spotify env vars missing");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export const pollSpotify = internalAction({
  args: {},
  handler: async (ctx) => {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
    });

    if (current.status === 200) {
      const data = (await current.json()) as SpotifyTrackResponse;
      if (data?.item && data.is_playing) {
        await ctx.runMutation(internal.spotify.upsertStatus, {
          isPlaying: true,
          track: normalize(data.item),
        });
        return;
      }
    }

    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
    });

    if (recent.ok) {
      const data = (await recent.json()) as RecentlyPlayedResponse;
      const last = data.items[0];
      if (last?.track) {
        await ctx.runMutation(internal.spotify.upsertStatus, {
          isPlaying: false,
          track: normalize(last.track),
          playedAt: new Date(last.played_at).getTime(),
        });
        return;
      }
    }

    await ctx.runMutation(internal.spotify.upsertStatus, {
      isPlaying: false,
      track: null,
    });
  },
});

export const upsertStatus = internalMutation({
  args: {
    isPlaying: v.boolean(),
    track: v.union(
      v.null(),
      v.object({
        trackId: v.string(),
        song: v.string(),
        artist: v.string(),
        album: v.string(),
        albumArtUrl: v.union(v.string(), v.null()),
        url: v.string(),
      })
    ),
    playedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const fields = {
      isPlaying: args.isPlaying,
      trackId: args.track?.trackId,
      song: args.track?.song,
      artist: args.track?.artist,
      album: args.track?.album,
      albumArtUrl: args.track?.albumArtUrl ?? undefined,
      url: args.track?.url,
      playedAt: args.playedAt,
      fetchedAt: Date.now(),
    };

    const existing = await ctx.db.query("spotifyStatus").first();
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("spotifyStatus", fields);
    }
  },
});

export const getNowPlaying = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("spotifyStatus").first();
  },
});
