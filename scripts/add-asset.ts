#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { $ } from "bun";

const MAX_WIDTH = 2000;
const QUALITY = 85;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    key: { type: "string" },
    kind: { type: "string" },
    title: { type: "string", default: "" },
    description: { type: "string", default: "" },
  },
  allowPositionals: true,
});

const [filePath] = positionals;
if (!filePath || !values.kind || !values.key) {
  console.error(
    "Usage: bun run scripts/add-asset.ts <path> --key <key> --kind <kind> [--title ...] [--description ...]"
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

const isSvg = /\.svg$/i.test(filePath) || (file.type || "") === "image/svg+xml";
// Only raster images go through the WebP transcoder. SVGs (vector) and other
// files (PDFs) are stored as-is so they stay crisp / uncorrupted.
const isRaster =
  !isSvg &&
  ((file.type || "").startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(filePath));

let blob: Blob;
let contentType: string;
let width: number | undefined;
let height: number | undefined;

if (isRaster) {
  // Compress + transcode raster images to WebP, capturing dimensions for next/image.
  const inputBytes = new Uint8Array(await file.arrayBuffer());
  const pipeline = new Bun.Image(inputBytes)
    .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY });
  blob = await pipeline.blob();
  ({ width, height } = pipeline);
  contentType = "image/webp";
  console.log(
    `Compressed ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB  (${width}×${height})`
  );
} else {
  // SVGs and PDFs are stored as-is — no transcoding, no dimensions.
  blob = file;
  contentType = isSvg ? "image/svg+xml" : file.type || "application/octet-stream";
  console.log(`Uploading ${(blob.size / 1024).toFixed(0)}KB raw  (${contentType})`);
}

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

const { url } = await runConvex<{ url: string }>("assets:addAsset", {
  storageId,
  key: values.key,
  title: values.title,
  kind: values.kind,
  description: values.description,
  width,
  height,
});

console.log(`Added ${values.kind} asset "${values.key}" → ${url}`);
if (!values.title && !values.description) {
  console.log("Edit title/description in the Convex dashboard.");
}
