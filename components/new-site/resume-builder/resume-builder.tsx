"use client";

import { ChevronDown, Download, FileText, Loader2, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldGroup } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResumeEdit } from "@/convex/resumeChat";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { applyResumeEdits } from "@/lib/resume/apply-edits";
import { DEFAULT_RESUME } from "@/lib/resume/default-data";
import { generateTypst } from "@/lib/resume/generate";
import { generateDocx } from "@/lib/resume/generate-docx";
import type { ResumeData } from "@/lib/resume/schema";
import { compilePdf, warmTypst } from "@/lib/resume/typst-engine";
import { cn } from "@/lib/utils";
import { ImportDialog, type ImportFormat } from "./import-dialog";
import { ResumeAssistant, type ResumeAssistantHandle } from "./resume-assistant";
import {
  CompetenciesSection,
  EducationSection,
  ExperienceSection,
  HeadingSection,
  ReferencesSection,
  SummarySection,
  SystemsSection,
} from "./resume-sections";
import { TailorDialog } from "./tailor-dialog";
import { TypstPreview } from "./typst-preview";
import { useResumeForm } from "./use-resume-form";

const selectFormValues = (s: { values: unknown }) => s.values;

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "resume"
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ResumeBuilder() {
  const form = useResumeForm();
  const isDesktop = useMediaQuery("(min-width: 1024px)", { initializeWithValue: false });
  const [exporting, setExporting] = useState(false);
  const assistantRef = useRef<ResumeAssistantHandle>(null);

  useMountEffect(() => {
    warmTypst();
  });

  const handleImportSubmit = useCallback(
    (source: string, format: ImportFormat, label: string) =>
      assistantRef.current?.startImport(source, format, label),
    []
  );
  const handleTailorSubmit = useCallback((jd: string) => assistantRef.current?.startTailor(jd), []);
  const getResume = useCallback(() => form.state.values as ResumeData, [form]);

  async function handleDownloadPdf() {
    setExporting(true);
    try {
      const data = form.state.values as ResumeData;
      const bytes = await compilePdf(generateTypst(data));
      triggerDownload(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${slug(data.name)}-resume.pdf`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate the PDF.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadDocx() {
    setExporting(true);
    try {
      const data = form.state.values as ResumeData;
      const blob = await generateDocx(data);
      triggerDownload(blob, `${slug(data.name)}-resume.docx`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate the Word document.");
    } finally {
      setExporting(false);
    }
  }

  const loadResume = useCallback(
    (resume: ResumeData) => {
      form.reset(resume);
      form.setFieldValue("competencies", resume.competencies);
      form.setFieldValue("experience", resume.experience);
      form.setFieldValue("education", resume.education);
      form.setFieldValue("systems", resume.systems);
      form.setFieldValue("references", resume.references);
    },
    [form]
  );

  const handleReset = useCallback(() => loadResume(DEFAULT_RESUME), [loadResume]);

  function handleImport(resume: ResumeData, method: "deterministic" | "ai") {
    const previous = structuredClone(form.state.values);
    loadResume(resume);
    toast.success(
      method === "deterministic"
        ? `Imported ${resume.name || "résumé"} — parsed exactly`
        : `Imported ${resume.name || "résumé"} — AI-extracted, please review`,
      { action: { label: "Undo", onClick: () => loadResume(previous) } }
    );
  }

  function applyEdits(edits: ResumeEdit[]): number {
    if (edits.length === 0) return 0;
    const previous = structuredClone(form.state.values) as ResumeData;
    const { draft, applied } = applyResumeEdits(previous, edits);

    if (applied > 0) {
      loadResume(draft);
      toast.success(`Applied ${applied} change${applied > 1 ? "s" : ""}`, {
        action: { label: "Undo", onClick: () => loadResume(previous) },
      });
    }
    return applied;
  }

  const formPane = (
    <div className="px-4 py-5">
      <FieldGroup className="gap-6">
        <HeadingSection form={form} />
        <SummarySection form={form} />
        <CompetenciesSection form={form} />
        <ExperienceSection form={form} />
        <EducationSection form={form} />
        <SystemsSection form={form} />
        <ReferencesSection form={form} />
      </FieldGroup>
    </div>
  );

  const previewPane = (
    <form.Subscribe selector={selectFormValues}>
      {(values) => <TypstPreview source={generateTypst(values as ResumeData)} />}
    </form.Subscribe>
  );

  return (
    <div className="relative flex flex-col rounded-lg border border-foreground/10 bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-lg border-foreground/10 border-b px-4 py-2.5">
        <div className="min-w-0">
          <h1 className="font-serif text-base leading-tight">Résumé builder</h1>
          <p className="truncate text-muted-foreground text-xs">
            The preview updates live. Import a résumé, tailor it, and export
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ImportDialog onSubmit={handleImportSubmit} />
          <TailorDialog onSubmit={handleTailorSubmit} />
          <Button
            className="text-muted-foreground"
            onClick={handleReset}
            size="sm"
            type="button"
            variant="ghost"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm" }), "gap-1")}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span className="hidden sm:inline">Download</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPdf}>
                <FileText className="size-3.5" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadDocx}>
                <FileText className="size-3.5" />
                Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isDesktop ? (
        <div className="flex">
          <div className="w-2/5 min-w-85 max-w-xl border-foreground/10 border-r">{formPane}</div>
          <div className="min-w-0 flex-1 rounded-br-lg bg-muted/50">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-auto">
              {previewPane}
            </div>
          </div>
        </div>
      ) : (
        <Tabs className="flex flex-col" defaultValue="edit">
          <TabsList className="mx-4 mt-3 self-start">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">{formPane}</TabsContent>
          <TabsContent className="rounded-b-lg bg-muted/50" value="preview">
            {previewPane}
          </TabsContent>
        </Tabs>
      )}

      <ResumeAssistant
        applyEdits={applyEdits}
        applyResume={handleImport}
        getResume={getResume}
        ref={assistantRef}
      />
    </div>
  );
}
