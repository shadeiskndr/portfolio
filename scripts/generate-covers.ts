#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { $ } from "bun";
import { uploadCover } from "./cover-art";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    force: { type: "boolean", default: false },
  },
});

const runConvex = async <T>(fn: string, args?: object): Promise<T> => {
  const cmd = args
    ? await $`bunx convex run ${fn} ${JSON.stringify(args)}`.quiet()
    : await $`bunx convex run ${fn}`.quiet();
  const stdout = cmd.stdout.toString().trim();
  return stdout ? (JSON.parse(stdout) as T) : (undefined as T);
};

const generateUploadUrl = () => runConvex<string>("storage:generateUploadUrl");

type SongRow = { id: string; title: string; hasCover: boolean };
const songs = await runConvex<SongRow[]>("songs:listForCover");

const targets = values.force ? songs : songs.filter((s) => !s.hasCover);
if (targets.length === 0) {
  console.log("All songs already have covers. Use --force to regenerate.");
  process.exit(0);
}

console.log(`Generating covers for ${targets.length} song(s)${values.force ? " (forced)" : ""}...`);

for (const song of targets) {
  const storageId = await uploadCover(generateUploadUrl);
  if (!storageId) {
    console.error(`  ✗ ${song.title}: cover upload failed`);
    continue;
  }
  await runConvex("songs:setCover", { id: song.id, coverStorageId: storageId });
  console.log(`  ✓ ${song.title}`);
}

console.log("Done.");
