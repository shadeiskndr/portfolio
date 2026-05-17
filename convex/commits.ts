import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  type ActionCtx,
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";

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
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
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

export type CommitFile = {
  path: string;
  prevPath?: string;
  status: string;
  additions: number;
  deletions: number;
};

export type CommitFileList = {
  parentSha: string;
  files: CommitFile[];
};

const MAX_BLOB_BYTES = 512 * 1024;
const TEXT_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github.raw",
  "X-GitHub-Api-Version": "2022-11-28",
};
const JSON_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function ghHeaders(base: Record<string, string>): Record<string, string> {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  return token ? { ...base, Authorization: `Bearer ${token}` } : { ...base };
}

function isRateLimited(res: Response): boolean {
  if (res.status !== 403 && res.status !== 429) return false;
  const remaining = res.headers.get("x-ratelimit-remaining");
  return remaining === "0" || res.headers.has("retry-after");
}

function rateLimitError(res: Response): Error {
  const reset = res.headers.get("x-ratelimit-reset");
  const resetAt = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "later";
  const authed = !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  const hint = authed
    ? ""
    : " (set GITHUB_PERSONAL_ACCESS_TOKEN in Convex env to raise the 60/hr unauth limit to 5000/hr)";
  return new Error(`GitHub rate limit hit — try again at ${resetAt}${hint}`);
}

function ghRepo(): { owner: string; repo: string } {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!(owner && repo)) {
    throw new Error("GITHUB_OWNER / GITHUB_REPO env vars missing");
  }
  return { owner, repo };
}

export const getCachedFileList = query({
  args: { sha: v.string() },
  handler: async (ctx, { sha }) => {
    const row = await ctx.db
      .query("commitFileLists")
      .withIndex("by_sha", (q) => q.eq("sha", sha))
      .unique();
    if (!row) return null;
    const parsed = JSON.parse(row.filesJson) as CommitFile[];
    return { parentSha: row.parentSha, files: parsed, fetchedAt: row.fetchedAt };
  },
});

export const cacheFileList = internalMutation({
  args: { sha: v.string(), parentSha: v.string(), filesJson: v.string() },
  handler: async (ctx, { sha, parentSha, filesJson }) => {
    const existing = await ctx.db
      .query("commitFileLists")
      .withIndex("by_sha", (q) => q.eq("sha", sha))
      .unique();
    const fields = { sha, parentSha, filesJson, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("commitFileLists", fields);
    }
  },
});

export const getCachedBlob = query({
  args: { ref: v.string(), path: v.string() },
  handler: async (ctx, { ref, path }) => {
    const row = await ctx.db
      .query("commitBlobs")
      .withIndex("by_ref_path", (q) => q.eq("ref", ref).eq("path", path))
      .unique();
    if (!row) return null;
    return { content: row.content, truncated: row.truncated };
  },
});

export const cacheBlob = internalMutation({
  args: {
    ref: v.string(),
    path: v.string(),
    content: v.string(),
    truncated: v.boolean(),
  },
  handler: async (ctx, { ref, path, content, truncated }) => {
    const existing = await ctx.db
      .query("commitBlobs")
      .withIndex("by_ref_path", (q) => q.eq("ref", ref).eq("path", path))
      .unique();
    const fields = { ref, path, content, truncated, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("commitBlobs", fields);
    }
  },
});

type GhFileEntry = {
  filename: string;
  previous_filename?: string;
  status: string;
  additions: number;
  deletions: number;
};

type GhCommitResponse = {
  parents: { sha: string }[];
  files?: GhFileEntry[];
};

export const fetchCommitFiles = action({
  args: { sha: v.string() },
  handler: async (ctx, { sha }): Promise<CommitFileList> => {
    const cached: CommitFileList | null = await ctx.runQuery(api.commits.getCachedFileList, {
      sha,
    });
    if (cached) return { parentSha: cached.parentSha, files: cached.files };

    const { owner, repo } = ghRepo();
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: ghHeaders(JSON_HEADERS),
    });
    if (isRateLimited(res)) throw rateLimitError(res);
    if (!res.ok) {
      throw new Error(`GitHub commit API ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as GhCommitResponse;

    const files: CommitFile[] = (data.files ?? []).map((f) => ({
      path: f.filename,
      prevPath: f.previous_filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
    }));
    const parentSha = data.parents[0]?.sha ?? "";

    await ctx.runMutation(internal.commits.cacheFileList, {
      sha,
      parentSha,
      filesJson: JSON.stringify(files),
    });
    return { parentSha, files };
  },
});

async function fetchBlobAtRef(
  ctx: ActionCtx,
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<{ content: string; truncated: boolean }> {
  if (!ref || !path) return { content: "", truncated: false };

  const cached: { content: string; truncated: boolean } | null = await ctx.runQuery(
    api.commits.getCachedBlob,
    { ref, path }
  );
  if (cached) return cached;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
    path
  ).replace(/%2F/g, "/")}?ref=${ref}`;
  const res = await fetch(url, { headers: ghHeaders(TEXT_HEADERS) });
  if (res.status === 404) {
    await ctx.runMutation(internal.commits.cacheBlob, {
      ref,
      path,
      content: "",
      truncated: false,
    });
    return { content: "", truncated: false };
  }
  if (isRateLimited(res)) throw rateLimitError(res);
  if (!res.ok) {
    throw new Error(`GitHub blob ${res.status} for ${ref}:${path}: ${await res.text()}`);
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BLOB_BYTES) {
    const result = { content: "", truncated: true };
    await ctx.runMutation(internal.commits.cacheBlob, { ref, path, ...result });
    return result;
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  const result = { content: text, truncated: false };
  await ctx.runMutation(internal.commits.cacheBlob, { ref, path, ...result });
  return result;
}

export const fetchFileBlobs = action({
  args: {
    sha: v.string(),
    parentSha: v.string(),
    path: v.string(),
    prevPath: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (
    ctx,
    { sha, parentSha, path, prevPath, status }
  ): Promise<{
    before: string;
    after: string;
    beforeTruncated: boolean;
    afterTruncated: boolean;
  }> => {
    const { owner, repo } = ghRepo();
    const beforePath = prevPath ?? path;

    const wantBefore = status !== "added";
    const wantAfter = status !== "removed";

    const [before, after] = await Promise.all([
      wantBefore
        ? fetchBlobAtRef(ctx, owner, repo, parentSha, beforePath)
        : Promise.resolve({ content: "", truncated: false }),
      wantAfter
        ? fetchBlobAtRef(ctx, owner, repo, sha, path)
        : Promise.resolve({ content: "", truncated: false }),
    ]);

    return {
      before: before.content,
      after: after.content,
      beforeTruncated: before.truncated,
      afterTruncated: after.truncated,
    };
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
