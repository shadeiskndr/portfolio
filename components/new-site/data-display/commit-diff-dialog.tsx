"use client";

import dynamic from "next/dynamic";
import { ResponsiveDialog, ResponsiveDialogContent } from "@/components/ui/responsive-dialog";
import type { Doc } from "@/convex/_generated/dataModel";

type Commit = Doc<"commits">;

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
