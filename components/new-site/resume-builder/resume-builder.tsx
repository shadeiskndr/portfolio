"use client";

import { useForm } from "@tanstack/react-form";
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
import { DEFAULT_RESUME } from "@/lib/resume/default-data";
import { generateTypst } from "@/lib/resume/generate";
import { generateDocx } from "@/lib/resume/generate-docx";
import type { ResumeData } from "@/lib/resume/schema";
import { compilePdf, warmTypst } from "@/lib/resume/typst-engine";
import { cn } from "@/lib/utils";
import { AddButton, ItemCard, RemoveButton, TextAreaField, TextField } from "./fields";
import { ImportDialog, type ImportFormat } from "./import-dialog";
import { ResumeAssistant, type ResumeAssistantHandle } from "./resume-assistant";
import { TailorDialog } from "./tailor-dialog";
import { TypstPreview } from "./typst-preview";

const emptyString = () => "";
const selectFormValues = (s: { values: unknown }) => s.values;
const emptyRole = () => ({ title: "", period: "", bullets: [""] });
const emptyExperience = () => ({ firm: "", location: "", roles: [emptyRole()] });
const emptyEducation = () => ({ degree: "", period: "", institution: "", location: "" });
const emptySystem = () => ({ label: "", value: "" });
const emptyReference = () => ({ name: "", role: "", phone: "", email: "" });

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-foreground/10 border-b pb-1 font-serif text-foreground text-sm">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RemoveRoleButton({
  index,
  onRemove,
}: {
  index: number;
  onRemove: (index: number) => void;
}) {
  const handleClick = useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <Button
      className="self-start text-muted-foreground text-xs"
      onClick={handleClick}
      size="sm"
      type="button"
      variant="ghost"
    >
      Remove role
    </Button>
  );
}

export default function ResumeBuilder() {
  const form = useForm({ defaultValues: DEFAULT_RESUME });
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

  function applyResumeEdits(edits: ResumeEdit[]): number {
    if (edits.length === 0) return 0;
    const previous = structuredClone(form.state.values) as ResumeData;
    const draft = structuredClone(form.state.values) as ResumeData;
    let applied = 0;

    const deleteEmployers = new Set<number>();
    const deleteRoles = new Map<number, Set<number>>();
    const deleteEducation = new Set<number>();
    const deleteSystems = new Set<number>();
    const deleteReferences = new Set<number>();
    const markRole = (emp: number, role: number) => {
      const set = deleteRoles.get(emp) ?? new Set<number>();
      set.add(role);
      deleteRoles.set(emp, set);
    };

    for (const edit of edits) {
      switch (edit.type) {
        case "summary":
          draft.summary = edit.text;
          applied++;
          break;
        case "competencies":
          draft.competencies = edit.items;
          applied++;
          break;
        case "contact":
          if (edit.name !== undefined) draft.name = edit.name;
          if (edit.email !== undefined) draft.email = edit.email;
          if (edit.phone !== undefined) draft.phone = edit.phone;
          if (edit.location !== undefined) draft.location = edit.location;
          applied++;
          break;
        case "bullets": {
          const role = draft.experience[edit.employerIndex]?.roles[edit.roleIndex];
          if (role) {
            role.bullets = edit.bullets;
            applied++;
          }
          break;
        }
        case "update_employer": {
          const emp = draft.experience[edit.employerIndex];
          if (emp) {
            if (edit.firm !== undefined) emp.firm = edit.firm;
            if (edit.location !== undefined) emp.location = edit.location;
            applied++;
          }
          break;
        }
        case "update_role": {
          const role = draft.experience[edit.employerIndex]?.roles[edit.roleIndex];
          if (role) {
            if (edit.title !== undefined) role.title = edit.title;
            if (edit.period !== undefined) role.period = edit.period;
            applied++;
          }
          break;
        }
        case "update_education": {
          const ed = draft.education[edit.index];
          if (ed) {
            if (edit.degree !== undefined) ed.degree = edit.degree;
            if (edit.institution !== undefined) ed.institution = edit.institution;
            if (edit.period !== undefined) ed.period = edit.period;
            if (edit.location !== undefined) ed.location = edit.location;
            applied++;
          }
          break;
        }
        case "update_system": {
          const s = draft.systems[edit.index];
          if (s) {
            if (edit.label !== undefined) s.label = edit.label;
            if (edit.value !== undefined) s.value = edit.value;
            applied++;
          }
          break;
        }
        case "update_reference": {
          const ref = draft.references[edit.index];
          if (ref) {
            if (edit.name !== undefined) ref.name = edit.name;
            if (edit.role !== undefined) ref.role = edit.role;
            if (edit.phone !== undefined) ref.phone = edit.phone;
            if (edit.email !== undefined) ref.email = edit.email;
            applied++;
          }
          break;
        }
        case "add_role": {
          const emp = draft.experience[edit.employerIndex];
          if (emp) {
            emp.roles.push({ title: edit.title, period: edit.period, bullets: edit.bullets });
            applied++;
          }
          break;
        }
        case "add_employer":
          draft.experience.push({
            firm: edit.firm,
            location: edit.location,
            roles: [
              { title: edit.role.title, period: edit.role.period, bullets: edit.role.bullets },
            ],
          });
          applied++;
          break;
        case "add_education":
          draft.education.push({
            degree: edit.degree,
            period: edit.period,
            institution: edit.institution,
            location: edit.location,
          });
          applied++;
          break;
        case "add_system":
          draft.systems.push({ label: edit.label, value: edit.value });
          applied++;
          break;
        case "add_reference":
          draft.references.push({
            name: edit.name,
            role: edit.role,
            phone: edit.phone,
            email: edit.email,
          });
          applied++;
          break;
        case "delete_employer":
          if (draft.experience[edit.employerIndex]) {
            deleteEmployers.add(edit.employerIndex);
            applied++;
          }
          break;
        case "delete_role":
          if (draft.experience[edit.employerIndex]?.roles[edit.roleIndex]) {
            markRole(edit.employerIndex, edit.roleIndex);
            applied++;
          }
          break;
        case "delete_education":
          if (draft.education[edit.index]) {
            deleteEducation.add(edit.index);
            applied++;
          }
          break;
        case "delete_system":
          if (draft.systems[edit.index]) {
            deleteSystems.add(edit.index);
            applied++;
          }
          break;
        case "delete_reference":
          if (draft.references[edit.index]) {
            deleteReferences.add(edit.index);
            applied++;
          }
          break;
      }
    }

    const nextExperience: ResumeData["experience"] = [];
    for (const [i, emp] of draft.experience.entries()) {
      if (deleteEmployers.has(i)) continue;
      const roleDeletes = deleteRoles.get(i);
      const roles = roleDeletes ? emp.roles.filter((_, j) => !roleDeletes.has(j)) : emp.roles;
      if (roles.length > 0) nextExperience.push({ ...emp, roles });
    }
    draft.experience = nextExperience;
    draft.education = draft.education.filter((_, i) => !deleteEducation.has(i));
    draft.systems = draft.systems.filter((_, i) => !deleteSystems.has(i));
    draft.references = draft.references.filter((_, i) => !deleteReferences.has(i));

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
        <Section title="Heading">
          <form.Field name="name">
            {(f) => <TextField field={f} label="Full name" placeholder="Jane Doe" />}
          </form.Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="email">
              {(f) => <TextField field={f} label="Email" placeholder="jane@example.com" />}
            </form.Field>
            <form.Field name="phone">
              {(f) => <TextField field={f} label="Phone" placeholder="+60 12-345 6789" />}
            </form.Field>
          </div>
          <form.Field name="location">
            {(f) => <TextField field={f} label="Location" placeholder="City, Country" />}
          </form.Field>
        </Section>

        <Section title="Professional Summary">
          <form.Field name="summary">{(f) => <TextAreaField field={f} rows={6} />}</form.Field>
        </Section>

        <Section title="Core Competencies">
          <form.Field mode="array" name="competencies">
            {(arr) => (
              <div className="flex flex-col gap-2">
                {(arr.state.value as string[]).map((_, i) => (
                  <div className="flex items-center gap-1.5" key={i}>
                    <form.Field name={`competencies[${i}]`}>
                      {(f) => <TextField className="flex-1" field={f} />}
                    </form.Field>
                    <RemoveButton index={i} onRemove={arr.removeValue} />
                  </div>
                ))}
                <AddButton makeValue={emptyString} onAdd={arr.pushValue}>
                  Add competency
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="Work Experience">
          <form.Field mode="array" name="experience">
            {(exp) => (
              <div className="flex flex-col gap-3">
                {(exp.state.value as ResumeData["experience"]).map((_emp, i) => (
                  <ItemCard
                    canMoveDown={i < exp.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    index={i}
                    onMove={exp.moveValue}
                    onRemove={exp.removeValue}
                    title={`Employer ${i + 1}`}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <form.Field name={`experience[${i}].firm`}>
                        {(f) => <TextField field={f} label="Firm / company" />}
                      </form.Field>
                      <form.Field name={`experience[${i}].location`}>
                        {(f) => <TextField field={f} label="Location" />}
                      </form.Field>
                    </div>

                    <form.Field mode="array" name={`experience[${i}].roles`}>
                      {(roles) => (
                        <div className="flex flex-col gap-3 border-foreground/10 border-l-2 pl-3">
                          {(roles.state.value as ResumeData["experience"][number]["roles"]).map(
                            (_role, j) => (
                              <div className="flex flex-col gap-2.5" key={j}>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <form.Field name={`experience[${i}].roles[${j}].title`}>
                                    {(f) => <TextField field={f} label="Role title" />}
                                  </form.Field>
                                  <form.Field name={`experience[${i}].roles[${j}].period`}>
                                    {(f) => <TextField field={f} label="Dates" />}
                                  </form.Field>
                                </div>

                                <form.Field
                                  mode="array"
                                  name={`experience[${i}].roles[${j}].bullets`}
                                >
                                  {(bullets) => (
                                    <div className="flex flex-col gap-2">
                                      {(bullets.state.value as string[]).map((___, k) => (
                                        <div className="flex items-start gap-1.5" key={k}>
                                          <form.Field
                                            name={`experience[${i}].roles[${j}].bullets[${k}]`}
                                          >
                                            {(f) => (
                                              <TextAreaField
                                                className="flex-1"
                                                field={f}
                                                rows={2}
                                              />
                                            )}
                                          </form.Field>
                                          <RemoveButton
                                            label="Remove bullet"
                                            index={k}
                                            onRemove={bullets.removeValue}
                                          />
                                        </div>
                                      ))}
                                      <AddButton makeValue={emptyString} onAdd={bullets.pushValue}>
                                        Add bullet
                                      </AddButton>
                                    </div>
                                  )}
                                </form.Field>

                                {roles.state.value.length > 1 ? (
                                  <RemoveRoleButton index={j} onRemove={roles.removeValue} />
                                ) : null}
                              </div>
                            )
                          )}
                          <AddButton makeValue={emptyRole} onAdd={roles.pushValue}>
                            Add role
                          </AddButton>
                        </div>
                      )}
                    </form.Field>
                  </ItemCard>
                ))}
                <AddButton makeValue={emptyExperience} onAdd={exp.pushValue}>
                  Add employer
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="Education">
          <form.Field mode="array" name="education">
            {(edu) => (
              <div className="flex flex-col gap-3">
                {(edu.state.value as ResumeData["education"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < edu.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    index={i}
                    onMove={edu.moveValue}
                    onRemove={edu.removeValue}
                    title={`Entry ${i + 1}`}
                  >
                    <form.Field name={`education[${i}].degree`}>
                      {(f) => <TextField field={f} label="Degree / qualification" />}
                    </form.Field>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <form.Field name={`education[${i}].institution`}>
                        {(f) => <TextField field={f} label="Institution" />}
                      </form.Field>
                      <form.Field name={`education[${i}].period`}>
                        {(f) => <TextField field={f} label="Years" />}
                      </form.Field>
                    </div>
                    <form.Field name={`education[${i}].location`}>
                      {(f) => <TextField field={f} label="Location (optional)" />}
                    </form.Field>
                  </ItemCard>
                ))}
                <AddButton makeValue={emptyEducation} onAdd={edu.pushValue}>
                  Add education
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="Systems & Technical Proficiency">
          <form.Field mode="array" name="systems">
            {(sys) => (
              <div className="flex flex-col gap-3">
                {(sys.state.value as ResumeData["systems"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < sys.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    index={i}
                    onMove={sys.moveValue}
                    onRemove={sys.removeValue}
                    title={`Group ${i + 1}`}
                  >
                    <form.Field name={`systems[${i}].label`}>
                      {(f) => <TextField field={f} label="Label" placeholder="Bank Portals" />}
                    </form.Field>
                    <form.Field name={`systems[${i}].value`}>
                      {(f) => <TextAreaField field={f} label="Items" rows={2} />}
                    </form.Field>
                  </ItemCard>
                ))}
                <AddButton makeValue={emptySystem} onAdd={sys.pushValue}>
                  Add group
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        <Section title="References">
          <form.Field mode="array" name="references">
            {(refs) => (
              <div className="flex flex-col gap-3">
                {(refs.state.value as ResumeData["references"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < refs.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    index={i}
                    onMove={refs.moveValue}
                    onRemove={refs.removeValue}
                    title={`Reference ${i + 1}`}
                  >
                    <form.Field name={`references[${i}].name`}>
                      {(f) => <TextField field={f} label="Name" />}
                    </form.Field>
                    <form.Field name={`references[${i}].role`}>
                      {(f) => <TextField field={f} label="Role / firm" />}
                    </form.Field>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <form.Field name={`references[${i}].phone`}>
                        {(f) => <TextField field={f} label="Phone" />}
                      </form.Field>
                      <form.Field name={`references[${i}].email`}>
                        {(f) => <TextField field={f} label="Email" />}
                      </form.Field>
                    </div>
                  </ItemCard>
                ))}
                <AddButton makeValue={emptyReference} onAdd={refs.pushValue}>
                  Add reference
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>
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
        applyEdits={applyResumeEdits}
        applyResume={handleImport}
        getResume={getResume}
        ref={assistantRef}
      />
    </div>
  );
}
