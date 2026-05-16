import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation, query } from "./_generated/server";

const KNOWN_TYPES = [
  "feat",
  "fix",
  "perf",
  "docs",
  "style",
  "refactor",
  "security",
  "chore",
  "content",
] as const;

const NOISE_TYPES = new Set(["chore", "style"]);

const TYPE_RE = new RegExp(`^(${KNOWN_TYPES.join("|")})(?:\\([^)]+\\))?!?:\\s*(.+)$`, "i");

type ParsedCommit = {
  type: string;
  subject: string;
  noise: boolean;
};

function parseCommitMessage(raw: string): ParsedCommit {
  const firstLine = raw.split("\n", 1)[0] ?? "";
  const stripped = firstLine.replace(/^[^\p{L}]+/u, "").trim();
  const match = stripped.match(TYPE_RE);
  if (match) {
    const type = match[1].toLowerCase();
    return {
      type,
      subject: match[2].trim(),
      noise: NOISE_TYPES.has(type),
    };
  }
  return {
    type: "other",
    subject: stripped || firstLine.trim(),
    noise: false,
  };
}

function repoUrl(): string {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!(owner && repo)) {
    throw new Error("GITHUB_OWNER / GITHUB_REPO env vars missing");
  }
  return `https://github.com/${owner}/${repo}`;
}

function commitUrl(sha: string): string {
  return `${repoUrl()}/commit/${sha}`;
}

export const ingestCommits = internalMutation({
  args: {
    commits: v.array(
      v.object({
        sha: v.string(),
        message: v.string(),
        authorDate: v.number(),
        url: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { commits }) => {
    let inserted = 0;
    for (const c of commits) {
      const existing = await ctx.db
        .query("commits")
        .withIndex("by_sha", (q) => q.eq("sha", c.sha))
        .unique();
      if (existing) continue;

      const parsed = parseCommitMessage(c.message);
      await ctx.db.insert("commits", {
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        subject: parsed.subject,
        type: parsed.type,
        noise: parsed.noise,
        authorDate: c.authorDate,
        url: c.url ?? commitUrl(c.sha),
      });

      const countRow = await ctx.db
        .query("commitCounts")
        .withIndex("by_type", (q) => q.eq("type", parsed.type))
        .unique();
      if (countRow) {
        await ctx.db.patch(countRow._id, { count: countRow.count + 1 });
      } else {
        await ctx.db.insert("commitCounts", { type: parsed.type, count: 1 });
      }
      inserted += 1;
    }
    return { inserted, received: commits.length };
  },
});

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: { date: string } | null;
    committer: { date: string } | null;
  };
  html_url: string;
};

export const backfillFromGitHub = internalAction({
  args: { perPage: v.optional(v.number()), maxPages: v.optional(v.number()) },
  handler: async (ctx, { perPage = 100, maxPages = 20 }) => {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!(owner && repo)) {
      throw new Error("GITHUB_OWNER / GITHUB_REPO env vars missing");
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    let totalInserted = 0;
    let totalReceived = 0;
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`,
        { headers }
      );
      if (!res.ok) {
        throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      }
      const batch = (await res.json()) as GitHubCommit[];
      if (batch.length === 0) break;

      const result = await ctx.runMutation(internal.commits.ingestCommits, {
        commits: batch.map((c) => ({
          sha: c.sha,
          message: c.commit.message,
          authorDate: new Date(
            c.commit.author?.date ?? c.commit.committer?.date ?? Date.now()
          ).getTime(),
          url: c.html_url,
        })),
      });
      totalInserted += result.inserted;
      totalReceived += result.received;

      if (batch.length < perPage) break;
    }
    return { inserted: totalInserted, received: totalReceived };
  },
});

export const list = query({
  args: {
    type: v.optional(v.string()),
    hideNoise: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { type, hideNoise, limit = 200 }) => {
    let results: Doc<"commits">[];
    if (type && type !== "all") {
      results = await ctx.db
        .query("commits")
        .withIndex("by_type_date", (q) => q.eq("type", type))
        .order("desc")
        .take(limit);
    } else {
      results = await ctx.db.query("commits").withIndex("by_date").order("desc").take(limit);
    }
    return hideNoise ? results.filter((r) => !r.noise) : results;
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("commitCounts").collect();
    const byType: Record<string, number> = {};
    let all = 0;
    for (const row of rows) {
      byType[row.type] = row.count;
      all += row.count;
    }
    return { all, byType };
  },
});

export const search = query({
  args: { q: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { q, limit = 50 }) => {
    if (!q.trim()) return [];
    return await ctx.db
      .query("commits")
      .withSearchIndex("search_subject", (s) => s.search("subject", q))
      .take(limit);
  },
});
