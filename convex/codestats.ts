import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";

/**
 * Shape of `GET https://codestats.net/api/users/:username`.
 *
 * That endpoint is public and unauthenticated — the CODESTATS_API_KEY machine
 * token is write-only (it authorizes `POST /api/my/pulses` from an editor
 * plugin), and every token-scoped read path 404s. So nothing here needs a key;
 * only the username is configuration.
 *
 * `new_xp` / `new_xps` are XP earned in the last 12 hours, not a lifetime delta.
 */
export type CodestatsProfileData = {
  user: string;
  total_xp: number;
  new_xp: number;
  /** "YYYY-MM-DD" (profile-local) -> XP earned that day, for all of history. */
  dates: Record<string, number>;
  languages: Record<string, { xps: number; new_xps: number }>;
  machines: Record<string, { xps: number; new_xps: number }>;
};

export const refreshProfile = internalAction({
  args: {},
  handler: async (ctx) => {
    const username = process.env.CODESTATS_USERNAME;
    if (!username) {
      throw new Error("CODESTATS_USERNAME missing");
    }

    const res = await fetch(`https://codestats.net/api/users/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`code::stats API ${res.status}`);
    }

    const data = (await res.json()) as CodestatsProfileData;
    await ctx.runMutation(internal.codestats.upsertProfile, {
      username,
      payload: JSON.stringify(data),
    });
  },
});

export const upsertProfile = internalMutation({
  args: {
    username: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, { username, payload }) => {
    const existing = await ctx.db
      .query("codestatsProfile")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    const fields = { username, payload, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("codestatsProfile", fields);
    }
  },
});

/**
 * The cached snapshot for the site owner. Single-tenant like `spotify.getNowPlaying`:
 * the username lives in the Convex env, so the client never has to supply it.
 */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("codestatsProfile").first();
    if (!row) return null;
    return {
      username: row.username,
      data: JSON.parse(row.payload) as CodestatsProfileData,
      fetchedAt: row.fetchedAt,
    };
  },
});
