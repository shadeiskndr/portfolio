"use client";

import dynamic from "next/dynamic";
import { DemoFallback } from "./demo-fallback";

export const CodeMirrorDemo = dynamic(
  () => import("./codemirror-demo").then((m) => m.CodeMirrorDemo),
  { ssr: false, loading: () => <DemoFallback label="editor" /> }
);

export const SyncedChartsDemo = dynamic(
  () => import("./synced-charts-demo").then((m) => m.SyncedChartsDemo),
  { ssr: false, loading: () => <DemoFallback label="charts" /> }
);
