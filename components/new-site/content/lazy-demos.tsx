"use client";

import dynamic from "next/dynamic";

// Heavy, client-only MDX demos. Each pulls in a large editor/charting bundle
// (CodeMirror, recharts) that no longer belongs in the shared MDX chunk — a TIL
// post now ships only the demo bundles it actually renders. `ssr: false` because
// both are interactive and render nothing meaningful on the server.
function DemoFallback({ label }: { label: string }) {
  return (
    <div className="my-6 flex h-48 items-center justify-center rounded-xl border text-muted-foreground text-sm">
      Loading {label}…
    </div>
  );
}

export const CodeMirrorDemo = dynamic(
  () => import("./codemirror-demo").then((m) => m.CodeMirrorDemo),
  { ssr: false, loading: () => <DemoFallback label="editor" /> }
);

export const SyncedChartsDemo = dynamic(
  () => import("./synced-charts-demo").then((m) => m.SyncedChartsDemo),
  { ssr: false, loading: () => <DemoFallback label="charts" /> }
);
