"use client";

import dynamic from "next/dynamic";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { useAsset } from "@/lib/assets-provider";

const PdfViewer = dynamic(() => import("./resume-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-60 flex-auto items-center justify-center bg-muted/50 text-muted-foreground text-sm">
      Loading viewer…
    </div>
  ),
});

interface AttachmentDialogProps {
  /** Assets-table key for the document to view. */
  fileKey: string;
  title: string;
  description?: string;
  /** Noun used in the viewer's loading text and download label. @default "document" */
  label?: string;
  /** The dialog trigger (e.g. a button). */
  children: React.ReactNode;
}

export function AttachmentDialog({
  fileKey,
  title,
  description,
  label = "document",
  children,
}: AttachmentDialogProps) {
  const fileUrl = useAsset(fileKey)?.url;
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 md:w-[95vw] md:max-w-4xl! lg:max-w-5xl!">
        <ResponsiveDialogHeader className="shrink-0 border-foreground/10 border-b px-5 py-3 sm:py-4">
          <ResponsiveDialogTitle className="font-serif text-base">{title}</ResponsiveDialogTitle>
          {description ? (
            <ResponsiveDialogDescription className="text-xs">
              {description}
            </ResponsiveDialogDescription>
          ) : null}
        </ResponsiveDialogHeader>
        {fileUrl ? (
          <PdfViewer fileUrl={fileUrl} label={label} maxPageWidth={1200} />
        ) : (
          <div className="flex min-h-60 flex-auto items-center justify-center bg-muted/50 text-muted-foreground text-sm">
            Attachment unavailable.
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export default AttachmentDialog;
