"use client";

import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
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

export type ImportFormat = "tex" | "docx" | "text";

type Mammoth = {
  extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

// Extract plain text from a file for the importer. .docx goes through mammoth
// (lazy-loaded); .tex keeps its raw LaTeX so the deterministic parser can run.
async function readFile(file: File): Promise<{ source: string; format: ImportFormat }> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mod = await import("mammoth");
    const mammoth = ((mod as { default?: Mammoth }).default ??
      (mod as unknown as Mammoth)) as Mammoth;
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { source: value, format: "docx" };
  }
  const source = await file.text();
  return { source, format: name.endsWith(".tex") ? "tex" : "text" };
}

// Import a résumé from a .tex/.docx file or pasted text. The file is read to plain
// text here (client-side), then handed to the assistant, which extracts it (exact
// LaTeX parse first, else AI) and streams a review — so the wait happens in the
// chat, not this dialog.
export function ImportDialog({
  onSubmit,
}: {
  onSubmit: (source: string, format: ImportFormat, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canImport = !!file || text.trim().length > 0;

  async function run() {
    setBusy(true);
    try {
      const { source, format } = file
        ? await readFile(file)
        : { source: text, format: "text" as const };
      if (!source.trim()) throw new Error("Couldn't read any text from that file.");
      onSubmit(source, format, file ? file.name : "pasted résumé");
      setOpen(false);
      setFile(null);
      setText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that résumé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResponsiveDialog onOpenChange={setOpen} open={open}>
      <ResponsiveDialogTrigger asChild>
        <Button className="text-muted-foreground" size="sm" type="button" variant="ghost">
          <Upload className="size-3.5" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">
        <ResponsiveDialogHeader className="px-5 pt-5 pb-3">
          <ResponsiveDialogTitle className="font-serif text-base">
            Import a résumé
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            Upload a .tex or .docx file, or paste text. The assistant reads it into the form — a
            .tex from this template is parsed exactly, anything else is AI-extracted, using only
            what's in the document, nothing invented — then walks you through what it found.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5">
          <input
            accept=".tex,.docx,.txt,text/plain,application/x-tex,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="flex items-center gap-2 rounded-lg border border-foreground/15 border-dashed px-3 py-3 text-left text-muted-foreground text-sm transition-colors hover:border-foreground/30 hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <FileText className="size-4 shrink-0" />
            {file ? (
              <span className="truncate text-foreground">{file.name}</span>
            ) : (
              <span>Choose a .tex or .docx file…</span>
            )}
          </button>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span className="h-px flex-1 bg-foreground/10" />
            or paste
            <span className="h-px flex-1 bg-foreground/10" />
          </div>

          <Textarea
            className="min-h-40"
            disabled={!!file}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your résumé text or LaTeX here…"
            value={text}
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <Button
            disabled={busy}
            onClick={() => setOpen(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button disabled={busy || !canImport} onClick={run} size="sm" type="button">
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Import résumé
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
