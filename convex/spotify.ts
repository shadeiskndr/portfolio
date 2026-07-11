import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";

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

/**
 * `currently-playing` is polled continuously and tolerates it; the
 * `recently-played` endpoint does not — hammering it once per idle tick earned
 * this app a `429 QUOTA_EXCEEDED` with a ~16 hour `Retry-After`. It only exists
 * to answer "what was the last thing played", which changes slowly, so consult
 * it at most this often.
 */
const RECENTLY_PLAYED_TTL_MS = 30 * 60 * 1000;

/** Backoff-table key for `/v1/me/player/recently-played`. */
const RECENTLY_PLAYED_ENDPOINT = "recently-played";

/** Refresh the cached access token slightly before Spotify actually expires it. */
const TOKEN_SKEW_MS = 60 * 1000;

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

async function mintAccessToken(): Promise<{ token: string; expiresAt: number }> {
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
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  return {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
}

/**
 * Access token for the user-scoped endpoints, cached in `spotifyAuth` so a
 * 30-second poll doesn't mint a fresh hour-long token every time.
 *
 * Exported for `topTracks.ts`, which shares the same credentials.
 */
export async function getAccessToken(ctx: ActionCtx): Promise<string> {
  const cached = await ctx.runQuery(internal.spotify.getCachedToken, {});
  if (cached && cached.expiresAt - TOKEN_SKEW_MS > Date.now()) {
    return cached.accessToken;
  }

  const { token, expiresAt } = await mintAccessToken();
  await ctx.runMutation(internal.spotify.setCachedToken, { accessToken: token, expiresAt });
  return token;
}

/**
 * Rate-limit bookkeeping, shared by every caller of a `/v1/me/*` endpoint.
 *
 * Spotify's guidance is to respect `Retry-After` and back off exponentially on
 * a 429. `RATE_LIMITED_ENDPOINTS` keys are arbitrary labels — one per endpoint
 * whose quota is tracked separately.
 */
const BACKOFF_BASE_MS = 60 * 1000;
const BACKOFF_CAP_MS = 6 * 60 * 60 * 1000;

export async function isRateLimited(ctx: ActionCtx, endpoint: string): Promise<boolean> {
  const row = await ctx.runQuery(internal.spotify.getBackoff, { endpoint });
  return row !== null && row.blockedUntil > Date.now();
}

/**
 * Park `endpoint` until Spotify says it is safe again. Prefers the server's own
 * `Retry-After` (in seconds); falls back to exponential backoff when the header
 * is absent, which is the case for some 5xx responses.
 */
export async function recordRateLimit(
  ctx: ActionCtx,
  endpoint: string,
  retryAfterHeader: string | null
): Promise<number> {
  const prior = await ctx.runQuery(internal.spotify.getBackoff, { endpoint });
  const attempts = (prior?.attempts ?? 0) + 1;

  const retryAfterSeconds = Number(retryAfterHeader);
  const waitMs =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : Math.min(BACKOFF_BASE_MS * 2 ** (attempts - 1), BACKOFF_CAP_MS);

  await ctx.runMutation(internal.spotify.setBackoff, {
    endpoint,
    blockedUntil: Date.now() + waitMs,
    attempts,
  });
  return waitMs;
}

export async function clearRateLimit(ctx: ActionCtx, endpoint: string): Promise<void> {
  await ctx.runMutation(internal.spotify.setBackoff, {
    endpoint,
    blockedUntil: 0,
    attempts: 0,
  });
}

export const getBackoff = internalQuery({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const row = await ctx.db
      .query("spotifyBackoff")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    return row ? { blockedUntil: row.blockedUntil, attempts: row.attempts } : null;
  },
});

export const setBackoff = internalMutation({
  args: { endpoint: v.string(), blockedUntil: v.number(), attempts: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("spotifyBackoff")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();
    if (existing) {
      await ctx.db.replace(existing._id, args);
    } else {
      await ctx.db.insert("spotifyBackoff", args);
    }
  },
});

export const getCachedToken = internalQuery({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("spotifyAuth").first();
    return row ? { accessToken: row.accessToken, expiresAt: row.expiresAt } : null;
  },
});

export const setCachedToken = internalMutation({
  args: { accessToken: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("spotifyAuth").first();
    if (existing) {
      await ctx.db.replace(existing._id, args);
    } else {
      await ctx.db.insert("spotifyAuth", args);
    }
  },
});

export const pollSpotify = internalAction({
  args: {},
  handler: async (ctx) => {
    const accessToken = await getAccessToken(ctx);
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

    // Nothing playing (or Spotify is unhappy). Fall back to the last-played
    // track, but only if the cached answer has gone stale — see the TTL note.
    // The TTL is the *only* gate on purpose: an earlier version also forced a
    // check whenever no track was cached, which meant a rate-limited account
    // (no track to cache → always "needs" a check) re-hit the blocked endpoint
    // every single tick and never let the quota recover.
    const status = await ctx.runQuery(internal.spotify.getStatusMeta, {});
    const staleAt = Date.now() - RECENTLY_PLAYED_TTL_MS;

    // Two independent gates: the TTL sets the normal cadence, and the backoff
    // table honours a `Retry-After` Spotify has already handed us. Checking the
    // latter first means a rate-limited endpoint costs zero requests.
    if (
      (status?.recentCheckedAt ?? 0) >= staleAt ||
      (await isRateLimited(ctx, RECENTLY_PLAYED_ENDPOINT))
    ) {
      await ctx.runMutation(internal.spotify.markNotPlaying, {});
      return;
    }

    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
    });

    if (recent.ok) {
      await clearRateLimit(ctx, RECENTLY_PLAYED_ENDPOINT);
      const data = (await recent.json()) as RecentlyPlayedResponse;
      const last = data.items[0];
      if (last?.track) {
        await ctx.runMutation(internal.spotify.upsertStatus, {
          isPlaying: false,
          track: normalize(last.track),
          playedAt: new Date(last.played_at).getTime(),
          recentChecked: true,
        });
        return;
      }
    } else if (recent.status === 429 || recent.status >= 500) {
      await recordRateLimit(ctx, RECENTLY_PLAYED_ENDPOINT, recent.headers.get("retry-after"));
    }

    // Reached on a 429/5xx, or on an empty history. This used to blank the
    // widget out — keep whatever track was last resolved and just flip the
    // playing flag. Stamp the check either way: none of these outcomes get
    // better by asking again in sixty seconds, and retrying is what exhausted
    // the quota in the first place.
    await ctx.runMutation(internal.spotify.markNotPlaying, { recentChecked: true });
  },
});

export const getStatusMeta = internalQuery({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("spotifyStatus").first();
    return row ? { recentCheckedAt: row.recentCheckedAt } : null;
  },
});

/** Flip to "not playing" without discarding the cached track metadata. */
export const markNotPlaying = internalMutation({
  args: { recentChecked: v.optional(v.boolean()) },
  handler: async (ctx, { recentChecked }) => {
    const existing = await ctx.db.query("spotifyStatus").first();
    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("spotifyStatus", {
        isPlaying: false,
        fetchedAt: now,
        ...(recentChecked ? { recentCheckedAt: now } : {}),
      });
      return;
    }
    await ctx.db.patch(existing._id, {
      isPlaying: false,
      fetchedAt: now,
      ...(recentChecked ? { recentCheckedAt: now } : {}),
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
    recentChecked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("spotifyStatus").first();
    const now = Date.now();
    const fields = {
      isPlaying: args.isPlaying,
      trackId: args.track?.trackId,
      song: args.track?.song,
      artist: args.track?.artist,
      album: args.track?.album,
      albumArtUrl: args.track?.albumArtUrl ?? undefined,
      url: args.track?.url,
      playedAt: args.playedAt,
      fetchedAt: now,
      recentCheckedAt: args.recentChecked ? now : existing?.recentCheckedAt,
    };

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
