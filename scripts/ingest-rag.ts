#!/usr/bin/env bun
/**
 * Ingest the portfolio knowledge base for the /chat RAG assistant.
 *
 * Serializes the portfolio (experiences, projects, certificates, education) from
 * `lib/new-site/data.ts` and the TIL posts (`content/til/*.mdx`) into text
 * chunks, embeds them with Amazon Nova via the `rag:embedAndStore` Convex
 * action, and upserts the `portfolioChunks` vector table. Ingestion runs in
 * batches (the full corpus exceeds the CLI argument-length limit); a final
 * `rag:pruneTextChunks` drops any refKey no longer in the corpus.
 *
 * Always run the FULL script (not a partial subset) so the prune's keep-list
 * reflects the whole corpus. Testimonials are excluded on purpose.
 *
 * Run AFTER the schema is pushed (the vector index must exist):
 *   bunx convex deploy   # or `bunx convex dev` running
 *   bun run scripts/ingest-rag.ts
 */
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

/** Read published TIL posts (frontmatter + raw MDX body) for RAG serialization. */
async function loadTilPosts(): Promise<TilPostInput[]> {
  const dir = path.join(process.cwd(), "content", "til");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (file): Promise<TilPostInput | null> => {
      const { data, content } = matter(await readFile(path.join(dir, file), "utf-8"));
      if (data.draft) return null;
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: String(data.title ?? file),
        summary: data.summary ? String(data.summary) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
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

// Ingest in batches — the full chunk set exceeds the CLI argument-length limit.
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

// Prune stale rows once, passing only refKeys (small enough for one arg).
console.log("\nPruning stale chunks via rag:pruneTextChunks ...");
const keepRefKeys = chunks.map((chunk) => chunk.refKey);
const prune =
  await $`bunx convex run rag:pruneTextChunks ${JSON.stringify({ keepRefKeys })}`.quiet();
const pruneErr = prune.stderr.toString().trim();
if (pruneErr) {
  console.error(pruneErr);
}
console.log(prune.stdout.toString().trim() || "done");
