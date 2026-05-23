#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { $ } from "bun";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    kind: { type: "string" },
    title: { type: "string", default: "" },
    description: { type: "string", default: "" },
  },
  allowPositionals: true,
});

const [filePath] = positionals;
if (!filePath || !values.kind) {
  console.error(
    "Usage: bun run scripts/add-asset.ts <path> --kind <kind> [--title ...] [--description ...]"
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

const contentType = file.type || "application/octet-stream";
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

await runConvex("assets:addAsset", {
  storageId,
  title: values.title,
  kind: values.kind,
  description: values.description,
});

console.log(`Added ${values.kind} asset, storageId ${storageId}`);
if (!values.title && !values.description) {
  console.log("Edit title/description in the Convex dashboard.");
}
