import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

type ContributionDay = {
  color: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
  date: string;
};

export type GithubContributionData = {
  contributions: ContributionDay[][];
  totalContributions: number;
};

export const refreshContributions = internalAction({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    if (!res.ok) {
      throw new Error(`github contributions API ${res.status}`);
    }
    const data = (await res.json()) as GithubContributionData;
    await ctx.runMutation(internal.github.upsertContributions, {
      username,
      payload: JSON.stringify(data),
    });
  },
});

export const upsertContributions = internalMutation({
  args: {
    username: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, { username, payload }) => {
    const existing = await ctx.db
      .query("githubContributions")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    const fields = { username, payload, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("githubContributions", fields);
    }
  },
});

export const getContributions = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const row = await ctx.db
      .query("githubContributions")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (!row) return null;
    return {
      data: JSON.parse(row.payload) as GithubContributionData,
      fetchedAt: row.fetchedAt,
    };
  },
});
