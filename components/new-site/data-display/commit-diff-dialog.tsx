"use client";

import dynamic from "next/dynamic";
import { ResponsiveDialog, ResponsiveDialogContent } from "@/components/ui/responsive-dialog";
import type { Doc } from "@/convex/_generated/dataModel";

type Commit = Doc<"commits">;

// The body pulls in the full CodeMirror merge stack (editor, themes, language
// data) — heavy and only ever needed once a commit is opened. Keep the dialog
// shell static so open/close still animates, and defer the body to a lazy chunk
// that loads on first open. ssr: false because CodeMirror touches `window`.
const CommitDiffBody = dynamic(() => import("./commit-diff-body").then((m) => m.CommitDiffBody), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
      Loading diff…
    </div>
  ),
});

export function CommitDiffDialog({
  commit,
  onOpenChange,
}: {
  commit: Commit | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = commit !== null;
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="flex h-[90vh] w-full max-w-[calc(100vw)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1800px)]">
        {commit ? <CommitDiffBody key={commit.sha} commit={commit} /> : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
