#!/usr/bin/env bun
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";
import matter from "gray-matter";
import {
  type PortfolioChunk,
  serializeEducationChunks,
  serializePortfolioChunks,
  serializeTilChunks,
  serializeUsesChunks,
  type TilPostInput,
  type UsesGroupInput,
} from "../lib/chat/portfolio-knowledge";
import {
  CERTIFICATES,
  EXPERIENCES,
  PROJECTS,
  RECOGNITIONS,
  USES_RIGS,
  USES_SHARED,
} from "../lib/new-site/data";

async function loadTilPosts(): Promise<TilPostInput[]> {
  const dir = path.join(process.cwd(), "content", "til");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (file): Promise<TilPostInput | null> => {
      const { data, content } = matter(await readFile(path.join(dir, file), "utf-8"));
      if (data["draft"]) return null;
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: String(data["title"] ?? file),
        summary: data["summary"] ? String(data["summary"]) : undefined,
        tags: Array.isArray(data["tags"]) ? data["tags"].map(String) : undefined,
        body: content,
      };
    })
  );
  return posts.filter((post): post is TilPostInput => post !== null);
}

const usesGroups: UsesGroupInput[] = [
  ...USES_RIGS.map((rig) => ({ title: `${rig.label} (PC)`, rows: rig.rows })),
  ...USES_SHARED,
];

const chunks: PortfolioChunk[] = [
  ...serializePortfolioChunks({
    experiences: EXPERIENCES,
    projects: PROJECTS,
    certificates: CERTIFICATES,
  }),
  ...serializeEducationChunks(RECOGNITIONS),
  ...serializeUsesChunks(usesGroups),
  ...serializeTilChunks(await loadTilPosts()),
];

console.log(`Serialized ${chunks.length} chunks:`);
for (const chunk of chunks) {
  console.log(`  • [${chunk.source}] ${chunk.refKey}`);
}

const BATCH_SIZE = 8;
console.log(`\nEmbedding + storing via rag:embedAndStore (batches of ${BATCH_SIZE}) ...`);
for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  const res =
    await $`bunx convex run rag:embedAndStore ${JSON.stringify({ chunks: batch })}`.quiet();
  const err = res.stderr.toString().trim();
  if (err) {
    console.error(err);
  }
  console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${res.stdout.toString().trim()}`);
}

console.log("\nPruning stale chunks via rag:pruneTextChunks ...");
const keepRefKeys = chunks.map((chunk) => chunk.refKey);
const prune =
  await $`bunx convex run rag:pruneTextChunks ${JSON.stringify({ keepRefKeys })}`.quiet();
const pruneErr = prune.stderr.toString().trim();
if (pruneErr) {
  console.error(pruneErr);
}
console.log(prune.stdout.toString().trim() || "done");
