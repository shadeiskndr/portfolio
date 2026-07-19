import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";

export type CodestatsProfileData = {
  user: string;
  total_xp: number;
  new_xp: number;
  dates: Record<string, number>;
  languages: Record<string, { xps: number; new_xps: number }>;
  machines: Record<string, { xps: number; new_xps: number }>;
};

export const refreshProfile = internalAction({
  args: {},
  handler: async (ctx) => {
    const username = process.env["CODESTATS_USERNAME"];
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
