"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { useAsset } from "@/lib/assets-provider";

const ResumeViewer = dynamic(() => import("./resume-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/50 text-muted-foreground text-sm">
      Loading viewer…
    </div>
  ),
});

interface ResumeDialogProps {
  children?: React.ReactNode;
}

export function ResumeDialog({ children }: ResumeDialogProps) {
  const resumeUrl = useAsset("resume")?.url;
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            Resume
          </Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex h-[90vh] flex-col gap-0 overflow-hidden p-0 md:h-[90vh] md:w-[95vw] md:max-w-3xl!">
        <ResponsiveDialogHeader className="border-foreground/10 border-b px-5 py-3 sm:py-4">
          <ResponsiveDialogTitle className="font-serif text-base">Resume</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            Shahathir Iskandar — Software Developer
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {resumeUrl ? (
          <ResumeViewer fileUrl={resumeUrl} label="resume" />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/50 text-muted-foreground text-sm">
            Resume unavailable.
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export default ResumeDialog;
