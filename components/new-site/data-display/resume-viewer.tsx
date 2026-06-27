"use client";

import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { useResizeObserver } from "@/hooks/use-resize-observer";

const PDFJS_BASE =
  process.env.NODE_ENV === "production"
    ? "/pdfjs"
    : `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}`;

pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/build/pdf.worker.min.mjs`;

interface ResumeViewerProps {
  fileUrl: string;
  /** Noun used in the loading text and download label. @default "document" */
  label?: string;
  /** Upper bound for the rendered page width in px. @default 900 */
  maxPageWidth?: number;
}

export default function ResumeViewer({
  fileUrl,
  label = "document",
  maxPageWidth = 900,
}: ResumeViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { width: containerWidth } = useResizeObserver({ ref: containerRef });

  const documentOptions = useMemo(
    () => ({
      cMapUrl: `${PDFJS_BASE}/cmaps/`,
      standardFontDataUrl: `${PDFJS_BASE}/standard_fonts/`,
    }),
    []
  );

  const canPrev = pageNumber > 1;
  const canNext = pageNumber < numPages;

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-0 flex-auto overflow-auto bg-muted/50 px-3 py-4 sm:px-6"
      >
        <div className="mx-auto flex flex-col items-center">
          <Document
            file={fileUrl}
            options={documentOptions}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={
              <div className="flex items-center gap-2 py-12 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading {label}…
              </div>
            }
            error={
              <div className="py-12 text-muted-foreground text-sm">
                Couldn't render the PDF.{" "}
                <a className="underline" href={fileUrl} target="_blank" rel="noreferrer">
                  Open directly
                </a>
                .
              </div>
            }
          >
            {containerWidth !== undefined && containerWidth > 0 && (
              <Page
                pageNumber={pageNumber}
                width={Math.min(containerWidth, maxPageWidth)}
                className="overflow-hidden rounded-md shadow-md"
              />
            )}
          </Document>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 border-foreground/10 border-t px-5 py-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={fileUrl} download aria-label={`Download ${label}`} />}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        {numPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="min-w-20 text-center text-muted-foreground text-xs tabular-nums">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
