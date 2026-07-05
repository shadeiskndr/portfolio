"use client";

import { Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";

// Paste a job description → hand it to the assistant, which rewrites the summary
// to foreground relevant existing experience and reorders skills (never
// added/dropped — the server reconciles to the original set), then streams an
// explanation of what changed. The wait happens in the chat, not this dialog.
export function TailorDialog({ onSubmit }: { onSubmit: (jobDescription: string) => void }) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");

  function run() {
    if (!jd.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    onSubmit(jd);
    setOpen(false);
    setJd("");
  }

  return (
    <ResponsiveDialog onOpenChange={setOpen} open={open}>
      <ResponsiveDialogTrigger asChild>
        <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
          <Target className="size-3.5" />
          <span className="hidden sm:inline">Tailor to job</span>
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">
        <ResponsiveDialogHeader className="px-5 pt-5 pb-3">
          <ResponsiveDialogTitle className="font-serif text-base">
            Tailor to a job
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            The assistant rewrites your summary and reorders your skills to match the posting —
            using only what's already in your résumé, nothing invented — then explains what it
            changed.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <Textarea
            className="min-h-52"
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            value={jd}
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <Button onClick={() => setOpen(false)} size="sm" type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={!jd.trim()} onClick={run} size="sm" type="button">
            <Sparkles className="size-3.5" />
            Tailor résumé
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
