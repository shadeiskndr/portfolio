"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The same tagged union from the post: the `kind` literal selects exactly one
// schema, so a bad block yields ONE targeted error, not "no variant matched".
const Heading = z.strictObject({
  kind: z.literal("heading"),
  text: z.string().min(1),
  level: z.number().int().min(1).max(4),
});
const Table = z.strictObject({
  kind: z.literal("table"),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
});
const Image = z.strictObject({
  kind: z.literal("image"),
  ref: z.string().regex(/^asset:[0-9a-f-]{36}$/),
});

const Block = z.discriminatedUnion("kind", [Heading, Table, Image]);

const EXAMPLES: { label: string; json: string }[] = [
  {
    label: "Valid heading",
    json: JSON.stringify({ kind: "heading", text: "Q3 Results", level: 2 }, null, 2),
  },
  {
    label: "Bad table",
    json: JSON.stringify({ kind: "table", columns: ["Region"], rows: "oops" }, null, 2),
  },
  {
    label: "Extra key",
    json: JSON.stringify({ kind: "heading", text: "Title", level: 1, color: "red" }, null, 2),
  },
  {
    label: "Unknown kind",
    json: JSON.stringify({ kind: "callout", text: "note" }, null, 2),
  },
];

type Result =
  | { status: "json-error"; message: string }
  | { status: "invalid"; issues: { path: string; message: string }[]; tag: string | null }
  | { status: "valid"; kind: string };

function validate(source: string): Result {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (e) {
    return { status: "json-error", message: e instanceof Error ? e.message : "Invalid JSON" };
  }
  const res = Block.safeParse(parsed);
  if (res.success) return { status: "valid", kind: res.data.kind };
  const tag =
    parsed && typeof parsed === "object" && "kind" in parsed
      ? String((parsed as { kind: unknown }).kind)
      : null;
  const issues = res.error.issues.map((i) => ({
    path: i.path.join(".") || "(root)",
    message: i.message,
  }));
  return { status: "invalid", issues, tag };
}

/** Edit a block and watch the discriminated union pick one schema and report against it. */
export function DiscriminatedUnionDemo() {
  const [source, setSource] = useState(EXAMPLES[1].json);
  const result = useMemo(() => validate(source), [source]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <span className="mr-1 text-muted-foreground text-xs">Load a block:</span>
        {EXAMPLES.map((ex) => (
          <Button key={ex.label} size="sm" variant="ghost" onClick={() => setSource(ex.json)}>
            {ex.label}
          </Button>
        ))}
      </div>
      <div className="grid md:grid-cols-2">
        <textarea
          aria-label="Block JSON"
          spellCheck={false}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="min-h-55 resize-y border-b bg-transparent p-4 font-mono text-xs leading-relaxed outline-none md:border-r md:border-b-0"
        />
        <div className="min-w-0 p-4">
          {result.status === "valid" ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
              <p className="font-medium text-emerald-600 text-sm dark:text-emerald-400">
                ✓ Valid — matched the <code className="font-mono">{result.kind}</code> schema
              </p>
            </div>
          ) : result.status === "json-error" ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="font-medium text-amber-600 text-sm dark:text-amber-400">
                Not valid JSON yet
              </p>
              <p className="mt-1 font-mono text-muted-foreground text-xs">{result.message}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
              <p className="font-medium text-red-600 text-sm dark:text-red-400">
                {result.tag && ["heading", "table", "image"].includes(result.tag)
                  ? `✗ Checked against the "${result.tag}" schema`
                  : "✗ No schema for that discriminator"}
              </p>
              <ul className="mt-2 space-y-1">
                {result.issues.map((issue) => (
                  <li key={`${issue.path}:${issue.message}`} className="font-mono text-xs">
                    <span className="text-muted-foreground">{issue.path}</span> — {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className={cn("mt-3 text-muted-foreground text-xs")}>
            The <code className="font-mono">kind</code> tag routes to a single schema, so the errors
            name the block the model was trying to write — not every variant it wasn't.
          </p>
        </div>
      </div>
    </div>
  );
}
