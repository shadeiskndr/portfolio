#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { $ } from "bun";
import { uploadCover } from "./cover-art";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    title: { type: "string", default: "" },
    artist: { type: "string", default: "" },
  },
  allowPositionals: true,
});

const [filePath] = positionals;
if (!filePath) {
  console.error("Usage: bun run scripts/add-song.ts <path> [--title ...] [--artist ...]");
  process.exit(1);
}

const runConvex = async <T>(fn: string, args?: object): Promise<T> => {
  const cmd = args
    ? await $`bunx convex run ${fn} ${JSON.stringify(args)}`.quiet()
    : await $`bunx convex run ${fn}`.quiet();
  const stdout = cmd.stdout.toString().trim();
  return stdout ? (JSON.parse(stdout) as T) : (undefined as T);
};

const file = Bun.file(filePath);
if (!(await file.exists())) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const contentType = file.type || "audio/mpeg";
const bytes = await file.arrayBuffer();
const blob = new Blob([bytes], { type: contentType });

console.log(`Uploading ${(blob.size / 1024).toFixed(0)}KB  (${contentType})`);

const uploadUrl = await runConvex<string>("storage:generateUploadUrl");
const uploadRes = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": contentType },
  body: blob,
});
if (!uploadRes.ok) {
  console.error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  process.exit(1);
}
const { storageId } = (await uploadRes.json()) as { storageId: string };

const coverStorageId = await uploadCover(() => runConvex<string>("storage:generateUploadUrl"));
if (!coverStorageId) {
  console.warn("Cover generation failed — run scripts/generate-covers.ts later to backfill.");
}

const { order } = await runConvex<{ order: number }>("songs:addSong", {
  storageId,
  ...(coverStorageId ? { coverStorageId } : {}),
  title: values.title,
  artist: values.artist,
});

console.log(`Added song at order ${order}, storageId ${storageId}`);
if (!values.title && !values.artist) {
  console.log("Edit title/artist in the Convex dashboard.");
}
