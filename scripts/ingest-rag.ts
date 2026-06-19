#!/usr/bin/env bun
/**
 * Ingest the portfolio knowledge base for the /chat RAG assistant.
 *
 * Serializes `lib/data.tsx` (experiences, projects, certificates) into text
 * chunks, then hands them to the `rag:embedAndStore` Convex action, which embeds
 * them with Amazon Nova and replaces the `portfolioChunks` vector table.
 *
 * Run AFTER the schema is pushed (the vector index must exist):
 *   bunx convex deploy   # or `bunx convex dev` running
 *   bun run scripts/ingest-rag.ts
 *
 * Testimonials are intentionally excluded — the ones in data.tsx are placeholder
 * text about a different person and would mislead the assistant.
 */
import { $ } from "bun";
import { serializePortfolioChunks } from "../lib/chat/portfolio-knowledge";
import { CERTIFICATES, EXPERIENCES, PROJECTS } from "../lib/data";

const chunks = serializePortfolioChunks({
  experiences: EXPERIENCES,
  projects: PROJECTS,
  certificates: CERTIFICATES,
});

console.log(`Serialized ${chunks.length} chunks:`);
for (const chunk of chunks) {
  console.log(`  • [${chunk.source}] ${chunk.refKey}`);
}

console.log("\nEmbedding + storing via rag:embedAndStore ...");
const result = await $`bunx convex run rag:embedAndStore ${JSON.stringify({ chunks })}`.quiet();
const stdout = result.stdout.toString().trim();
const stderr = result.stderr.toString().trim();
if (stderr) {
  console.error(stderr);
}
console.log(stdout || "done");
