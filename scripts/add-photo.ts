#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { $ } from "bun";

const MAX_WIDTH = 2000;
const QUALITY = 85;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    kind: { type: "string", default: "gallery" },
    title: { type: "string", default: "" },
    date: { type: "string", default: "" },
    description: { type: "string", default: "" },
  },
  allowPositionals: true,
});

const [filePath] = positionals;
if (!filePath) {
  console.error(
    "Usage: bun run scripts/add-photo.ts <path> [--kind gallery] [--title ...] [--date ...] [--description ...]"
  );
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

const inputBytes = new Uint8Array(await file.arrayBuffer());
const inputSize = inputBytes.byteLength;

const pipeline = new Bun.Image(inputBytes)
  .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: QUALITY });
const blob = await pipeline.blob();
const { width, height } = pipeline;

console.log(
  `Compressed ${(inputSize / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB  (${width}×${height})`
);

const uploadUrl = await runConvex<string>("storage:generateUploadUrl");
const uploadRes = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": "image/webp" },
  body: blob,
});
if (!uploadRes.ok) {
  console.error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  process.exit(1);
}
const { storageId } = (await uploadRes.json()) as { storageId: string };

const { order } = await runConvex<{ order: number }>("photos:addPhoto", {
  storageId,
  kind: values.kind,
  title: values.title,
  date: values.date,
  description: values.description,
  width,
  height,
});

console.log(`Added ${values.kind} at order ${order}, storageId ${storageId}`);
if (!values.title && !values.date && !values.description) {
  console.log("Edit title/date/description in the Convex dashboard.");
}
