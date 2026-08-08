import { type Infer, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { ActionCtx, MutationCtx } from "./_generated/server";
import {
  env,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

type SpotifyTrackResponse = {
  is_playing?: boolean;
  progress_ms?: number | null;
  item?: {
    id: string;
    name: string;
    duration_ms?: number | null;
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

type StatusFields = {
  isPlaying: boolean;
  trackId?: string;
  song?: string;
  artist?: string;
  album?: string;
  albumArtUrl?: string;
  url?: string;
  playedAt?: number;
};

type PollMeta = { recentCheckedAt: number | undefined; idleAttempts: number } | null;

const RECENTLY_PLAYED_TTL_MS = 30 * 60 * 1000;

const RECENTLY_PLAYED_ENDPOINT = "recently-played";

const CURRENTLY_PLAYING_ENDPOINT = "currently-playing";

const TOKEN_SKEW_MS = 60 * 1000;

const POLL_END_BUFFER_MS = 2 * 1000;

const MIN_POLL_DELAY_MS = 5 * 1000;

const MAX_POLL_DELAY_MS = 5 * 60 * 1000;

const IDLE_POLL_BACKOFF_MS = [60 * 1000, 2 * 60 * 1000, MAX_POLL_DELAY_MS];

const VIEWER_TTL_MS = 3 * 60 * 1000;

const VIEWER_WRITE_THROTTLE_MS = 30 * 1000;

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

function idlePollDelay(attempts: number): number {
  const index = Math.min(Math.max(attempts, 1), IDLE_POLL_BACKOFF_MS.length) - 1;
  return IDLE_POLL_BACKOFF_MS[index] ?? MAX_POLL_DELAY_MS;
}

function playingPollDelay(progressMs: number | null, durationMs: number | null): number {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs <= 0) {
    return idlePollDelay(1);
  }
  const progress = progressMs !== null && Number.isFinite(progressMs) ? progressMs : 0;
  const remaining = durationMs - progress + POLL_END_BUFFER_MS;
  return Math.min(Math.max(remaining, MIN_POLL_DELAY_MS), MAX_POLL_DELAY_MS);
}

async function mintAccessToken(): Promise<{ token: string; expiresAt: number }> {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = env.SPOTIFY_REFRESH_TOKEN;

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

export async function getAccessToken(ctx: ActionCtx): Promise<string> {
  const cached = await ctx.runQuery(internal.spotify.getCachedToken, {});
  if (cached && cached.expiresAt - TOKEN_SKEW_MS > Date.now()) {
    return cached.accessToken;
  }

  const { token, expiresAt } = await mintAccessToken();
  await ctx.runMutation(internal.spotify.setCachedToken, { accessToken: token, expiresAt });
  return token;
}

const BACKOFF_BASE_MS = 60 * 1000;
const BACKOFF_CAP_MS = 6 * 60 * 60 * 1000;

export async function rateLimitRemainingMs(ctx: ActionCtx, endpoint: string): Promise<number> {
  const row = await ctx.runQuery(internal.spotify.getBackoff, { endpoint });
  if (row === null) {
    return 0;
  }
  return Math.max(row.blockedUntil - Date.now(), 0);
}

export async function isRateLimited(ctx: ActionCtx, endpoint: string): Promise<boolean> {
  return (await rateLimitRemainingMs(ctx, endpoint)) > 0;
}

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
  handler: async (
    ctx,
    { endpoint }
  ): Promise<{ blockedUntil: number; attempts: number } | null> => {
    const row = await ctx.db
      .query("spotifyBackoff")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    return row ? { blockedUntil: row.blockedUntil, attempts: row.attempts } : null;
  },
});

export const setBackoff = internalMutation({
  args: { endpoint: v.string(), blockedUntil: v.number(), attempts: v.number() },
  handler: async (ctx, args): Promise<void> => {
    const existing = await ctx.db
      .query("spotifyBackoff")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (!existing) {
      if (args.blockedUntil === 0 && args.attempts === 0) {
        return;
      }
      await ctx.db.insert("spotifyBackoff", args);
      return;
    }

    if (existing.blockedUntil === args.blockedUntil && existing.attempts === args.attempts) {
      return;
    }
    await ctx.db.replace("spotifyBackoff", existing._id, args);
  },
});

export const getCachedToken = internalQuery({
  args: {},
  handler: async (ctx): Promise<{ accessToken: string; expiresAt: number } | null> => {
    const row = await ctx.db.query("spotifyAuth").first();
    return row ? { accessToken: row.accessToken, expiresAt: row.expiresAt } : null;
  },
});

export const setCachedToken = internalMutation({
  args: { accessToken: v.string(), expiresAt: v.number() },
  handler: async (ctx, args): Promise<void> => {
    const existing = await ctx.db.query("spotifyAuth").first();
    if (existing) {
      await ctx.db.replace("spotifyAuth", existing._id, args);
    } else {
      await ctx.db.insert("spotifyAuth", args);
    }
  },
});

const trackValidator = v.object({
  trackId: v.string(),
  song: v.string(),
  artist: v.string(),
  album: v.string(),
  albumArtUrl: v.union(v.string(), v.null()),
  url: v.string(),
});

const pollResultValidator = v.union(
  v.object({
    kind: v.literal("playing"),
    track: trackValidator,
    progressMs: v.union(v.number(), v.null()),
    durationMs: v.union(v.number(), v.null()),
  }),
  v.object({
    kind: v.literal("recent"),
    track: trackValidator,
    playedAt: v.number(),
  }),
  v.object({ kind: v.literal("idle"), recentChecked: v.boolean() }),
  v.object({ kind: v.literal("deferred"), retryAfterMs: v.number() })
);

type PollResult = Infer<typeof pollResultValidator>;

function trackStatus(track: NormalizedTrack, isPlaying: boolean): StatusFields {
  return {
    isPlaying,
    trackId: track.trackId,
    song: track.song,
    artist: track.artist,
    album: track.album,
    ...(track.albumArtUrl !== null && { albumArtUrl: track.albumArtUrl }),
    url: track.url,
  };
}

function materialFields(doc: Doc<"spotifyStatus">): StatusFields {
  return {
    isPlaying: doc.isPlaying,
    ...(doc.trackId !== undefined && { trackId: doc.trackId }),
    ...(doc.song !== undefined && { song: doc.song }),
    ...(doc.artist !== undefined && { artist: doc.artist }),
    ...(doc.album !== undefined && { album: doc.album }),
    ...(doc.albumArtUrl !== undefined && { albumArtUrl: doc.albumArtUrl }),
    ...(doc.url !== undefined && { url: doc.url }),
    ...(doc.playedAt !== undefined && { playedAt: doc.playedAt }),
  };
}

function statusFieldsFor(result: PollResult, existing: Doc<"spotifyStatus"> | null): StatusFields {
  if (result.kind === "playing") {
    return trackStatus(result.track, true);
  }
  if (result.kind === "recent") {
    return { ...trackStatus(result.track, false), playedAt: result.playedAt };
  }
  return existing ? { ...materialFields(existing), isPlaying: false } : { isPlaying: false };
}

function sameStatus(existing: Doc<"spotifyStatus">, fields: StatusFields): boolean {
  return (
    existing.isPlaying === fields.isPlaying &&
    existing.trackId === fields.trackId &&
    existing.song === fields.song &&
    existing.artist === fields.artist &&
    existing.album === fields.album &&
    existing.albumArtUrl === fields.albumArtUrl &&
    existing.url === fields.url &&
    existing.playedAt === fields.playedAt
  );
}

function hasViewer(meta: Doc<"spotifyPoll"> | null, now: number): boolean {
  const lastViewerAt = meta?.lastViewerAt;
  return lastViewerAt !== undefined && now - lastViewerAt <= VIEWER_TTL_MS;
}

async function cancelQueuedPoll(ctx: MutationCtx, meta: Doc<"spotifyPoll"> | null): Promise<void> {
  const queued = meta?.nextPollId;
  if (!queued) {
    return;
  }
  const scheduled = await ctx.db.system.get("_scheduled_functions", queued);
  if (scheduled?.state.kind === "pending") {
    await ctx.scheduler.cancel(queued);
  }
}

async function pollIsLive(ctx: MutationCtx, meta: Doc<"spotifyPoll"> | null): Promise<boolean> {
  const queued = meta?.nextPollId;
  if (!queued) {
    return false;
  }
  const scheduled = await ctx.db.system.get("_scheduled_functions", queued);
  const kind = scheduled?.state.kind;
  return kind === "pending" || kind === "inProgress";
}

async function scheduleNextPoll(
  ctx: MutationCtx,
  meta: Doc<"spotifyPoll"> | null,
  delayMs: number
): Promise<Id<"_scheduled_functions">> {
  await cancelQueuedPoll(ctx, meta);
  return await ctx.scheduler.runAfter(delayMs, internal.spotify.pollSpotify, {});
}

async function savePollMeta(
  ctx: MutationCtx,
  meta: Doc<"spotifyPoll"> | null,
  update: { idleAttempts: number; recentChecked: boolean; delayMs: number }
): Promise<void> {
  const now = Date.now();
  const watched = hasViewer(meta, now);
  const nextPollId = watched ? await scheduleNextPoll(ctx, meta, update.delayMs) : null;
  if (!watched) {
    await cancelQueuedPoll(ctx, meta);
  }
  const recentCheckedAt = update.recentChecked ? now : meta?.recentCheckedAt;
  const lastViewerAt = meta?.lastViewerAt;
  const fields = {
    fetchedAt: now,
    idleAttempts: update.idleAttempts,
    ...(nextPollId !== null && { nextPollAt: now + update.delayMs, nextPollId }),
    ...(recentCheckedAt !== undefined && { recentCheckedAt }),
    ...(lastViewerAt !== undefined && { lastViewerAt }),
  };

  if (meta) {
    await ctx.db.replace("spotifyPoll", meta._id, fields);
  } else {
    await ctx.db.insert("spotifyPoll", fields);
  }
}

export const recordPoll = internalMutation({
  args: { result: pollResultValidator },
  handler: async (ctx, { result }): Promise<void> => {
    const meta = await ctx.db.query("spotifyPoll").first();

    if (result.kind === "deferred") {
      await savePollMeta(ctx, meta, {
        idleAttempts: meta?.idleAttempts ?? 0,
        recentChecked: false,
        delayMs: Math.max(result.retryAfterMs, MIN_POLL_DELAY_MS),
      });
      return;
    }

    const existing = await ctx.db.query("spotifyStatus").first();
    const fields = statusFieldsFor(result, existing);

    if (!existing) {
      await ctx.db.insert("spotifyStatus", { ...fields, fetchedAt: Date.now() });
    } else if (!sameStatus(existing, fields)) {
      await ctx.db.replace("spotifyStatus", existing._id, { ...fields, fetchedAt: Date.now() });
    }

    const idleAttempts = result.kind === "playing" ? 0 : (meta?.idleAttempts ?? 0) + 1;
    await savePollMeta(ctx, meta, {
      idleAttempts,
      recentChecked: result.kind === "recent" || (result.kind === "idle" && result.recentChecked),
      delayMs:
        result.kind === "playing"
          ? playingPollDelay(result.progressMs, result.durationMs)
          : idlePollDelay(idleAttempts),
    });
  },
});

export const pollSpotify = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const deferredMs = await rateLimitRemainingMs(ctx, CURRENTLY_PLAYING_ENDPOINT);
    if (deferredMs > 0) {
      await ctx.runMutation(internal.spotify.recordPoll, {
        result: { kind: "deferred", retryAfterMs: deferredMs },
      });
      return;
    }

    const accessToken = await getAccessToken(ctx);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
    });

    if (current.status === 429 || current.status >= 500) {
      const waitMs = await recordRateLimit(
        ctx,
        CURRENTLY_PLAYING_ENDPOINT,
        current.headers.get("retry-after")
      );
      await ctx.runMutation(internal.spotify.recordPoll, {
        result: { kind: "deferred", retryAfterMs: waitMs },
      });
      return;
    }

    await clearRateLimit(ctx, CURRENTLY_PLAYING_ENDPOINT);

    if (current.status === 200) {
      const data = (await current.json()) as SpotifyTrackResponse;
      if (data?.item && data.is_playing) {
        await ctx.runMutation(internal.spotify.recordPoll, {
          result: {
            kind: "playing",
            track: normalize(data.item),
            progressMs: data.progress_ms ?? null,
            durationMs: data.item.duration_ms ?? null,
          },
        });
        return;
      }
    }

    const meta: PollMeta = await ctx.runQuery(internal.spotify.getPollMeta, {});
    const staleAt = Date.now() - RECENTLY_PLAYED_TTL_MS;

    if (
      (meta?.recentCheckedAt ?? 0) >= staleAt ||
      (await isRateLimited(ctx, RECENTLY_PLAYED_ENDPOINT))
    ) {
      await ctx.runMutation(internal.spotify.recordPoll, {
        result: { kind: "idle", recentChecked: false },
      });
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
        await ctx.runMutation(internal.spotify.recordPoll, {
          result: {
            kind: "recent",
            track: normalize(last.track),
            playedAt: new Date(last.played_at).getTime(),
          },
        });
        return;
      }
    } else if (recent.status === 429 || recent.status >= 500) {
      await recordRateLimit(ctx, RECENTLY_PLAYED_ENDPOINT, recent.headers.get("retry-after"));
    }

    await ctx.runMutation(internal.spotify.recordPoll, {
      result: { kind: "idle", recentChecked: true },
    });
  },
});

export const ensurePolling = internalMutation({
  args: {},
  handler: async (ctx): Promise<void> => {
    const now = Date.now();
    const meta = await ctx.db.query("spotifyPoll").first();

    if (!meta || !hasViewer(meta, now) || (await pollIsLive(ctx, meta))) {
      return;
    }

    const nextPollId = await ctx.scheduler.runAfter(0, internal.spotify.pollSpotify, {});
    await ctx.db.patch("spotifyPoll", meta._id, { nextPollAt: now, nextPollId });
  },
});

export const viewerSeen = mutation({
  args: {},
  handler: async (ctx): Promise<void> => {
    const now = Date.now();
    const meta = await ctx.db.query("spotifyPoll").first();

    if (!meta) {
      const nextPollId = await ctx.scheduler.runAfter(0, internal.spotify.pollSpotify, {});
      await ctx.db.insert("spotifyPoll", {
        idleAttempts: 0,
        lastViewerAt: now,
        nextPollAt: now,
        nextPollId,
      });
      return;
    }

    if (await pollIsLive(ctx, meta)) {
      if (now - (meta.lastViewerAt ?? 0) > VIEWER_WRITE_THROTTLE_MS) {
        await ctx.db.patch("spotifyPoll", meta._id, { lastViewerAt: now });
      }
      return;
    }

    const nextPollId = await ctx.scheduler.runAfter(0, internal.spotify.pollSpotify, {});
    await ctx.db.patch("spotifyPoll", meta._id, {
      idleAttempts: 0,
      lastViewerAt: now,
      nextPollAt: now,
      nextPollId,
    });
  },
});

export const getPollMeta = internalQuery({
  args: {},
  handler: async (ctx): Promise<PollMeta> => {
    const row = await ctx.db.query("spotifyPoll").first();
    return row ? { recentCheckedAt: row.recentCheckedAt, idleAttempts: row.idleAttempts } : null;
  },
});

export const getNowPlaying = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("spotifyStatus").first();
  },
});
