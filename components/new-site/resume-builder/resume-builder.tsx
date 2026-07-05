"use client";

import { useForm } from "@tanstack/react-form";
import { ChevronDown, Download, FileText, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { ImportDialog } from "./import-dialog";
import { ResumeAssistant, type ResumeAssistantHandle } from "./resume-assistant";
import { TailorDialog } from "./tailor-dialog";
import { TypstPreview } from "./typst-preview";

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

export default function ResumeBuilder() {
  const form = useForm({ defaultValues: DEFAULT_RESUME });
  const isDesktop = useMediaQuery("(min-width: 1024px)", { initializeWithValue: false });
  const [exporting, setExporting] = useState(false);
  const assistantRef = useRef<ResumeAssistantHandle>(null);

  // Warm the engine (WASM + fonts) as soon as the builder mounts so the first
  // preview and the first export don't pay cold-start latency.
  useMountEffect(() => {
    warmTypst();
  });

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

  // Load a full résumé into the form. `form.reset` doesn't reliably resize array
  // fields (a shorter imported list leaves ghost empty rows), so set each array
  // explicitly after the reset to force the field lengths to match.
  function loadResume(resume: ResumeData) {
    form.reset(resume);
    form.setFieldValue("competencies", resume.competencies);
    form.setFieldValue("experience", resume.experience);
    form.setFieldValue("education", resume.education);
    form.setFieldValue("systems", resume.systems);
    form.setFieldValue("references", resume.references);
  }

  // Load an imported résumé into the form. Invoked by the assistant's import turn
  // (via the `applyResume` prop) when the `resume` stream frame arrives, so the
  // form/preview fill in while the assistant streams its review; keeps an Undo.
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

  // Apply the assistant's structured edits to the form, with a single Undo that
  // restores the whole snapshot. Returns how many were applied.
  //
  // Field edits (prose, contact, update_*, add_*) mutate a working draft in place.
  // Deletions are collected as index sets and applied AFTER, in one compaction
  // pass, so each edit's index — which refers to the résumé the model was shown —
  // stays valid no matter how many items are removed in the same turn. The draft
  // is loaded via loadResume so array lengths resize correctly (deletes shrink them).
  function applyResumeEdits(edits: ResumeEdit[]): number {
    if (edits.length === 0) return 0;
    const previous = structuredClone(form.state.values) as ResumeData;
    const draft = structuredClone(form.state.values) as ResumeData;
    let applied = 0;

    const deleteEmployers = new Set<number>();
    const deleteRoles = new Map<number, Set<number>>(); // employerIndex → roleIndexes
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

    // Compact deletions by original index: in one pass drop deleted employers and
    // deleted roles, discarding any employer left with no roles; then the flat sections.
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
        {/* ── Heading ─────────────────────────────────────────────── */}
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

        {/* ── Summary ─────────────────────────────────────────────── */}
        <Section title="Professional Summary">
          <form.Field name="summary">{(f) => <TextAreaField field={f} rows={6} />}</form.Field>
        </Section>

        {/* ── Core Competencies ───────────────────────────────────── */}
        <Section title="Core Competencies">
          <form.Field mode="array" name="competencies">
            {(arr) => (
              <div className="flex flex-col gap-2">
                {(arr.state.value as string[]).map((_, i) => (
                  <div className="flex items-center gap-1.5" key={i}>
                    <form.Field name={`competencies[${i}]`}>
                      {(f) => <TextField className="flex-1" field={f} />}
                    </form.Field>
                    <RemoveButton onClick={() => arr.removeValue(i)} />
                  </div>
                ))}
                <AddButton onClick={() => arr.pushValue("")}>Add competency</AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        {/* ── Work Experience ─────────────────────────────────────── */}
        <Section title="Work Experience">
          <form.Field mode="array" name="experience">
            {(exp) => (
              <div className="flex flex-col gap-3">
                {(exp.state.value as ResumeData["experience"]).map((_emp, i) => (
                  <ItemCard
                    canMoveDown={i < exp.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    onMoveDown={() => exp.moveValue(i, i + 1)}
                    onMoveUp={() => exp.moveValue(i, i - 1)}
                    onRemove={() => exp.removeValue(i)}
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
                                            onClick={() => bullets.removeValue(k)}
                                          />
                                        </div>
                                      ))}
                                      <AddButton onClick={() => bullets.pushValue("")}>
                                        Add bullet
                                      </AddButton>
                                    </div>
                                  )}
                                </form.Field>

                                {roles.state.value.length > 1 ? (
                                  <Button
                                    className="self-start text-muted-foreground text-xs"
                                    onClick={() => roles.removeValue(j)}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                  >
                                    Remove role
                                  </Button>
                                ) : null}
                              </div>
                            )
                          )}
                          <AddButton onClick={() => roles.pushValue(emptyRole())}>
                            Add role
                          </AddButton>
                        </div>
                      )}
                    </form.Field>
                  </ItemCard>
                ))}
                <AddButton onClick={() => exp.pushValue(emptyExperience())}>Add employer</AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        {/* ── Education ───────────────────────────────────────────── */}
        <Section title="Education">
          <form.Field mode="array" name="education">
            {(edu) => (
              <div className="flex flex-col gap-3">
                {(edu.state.value as ResumeData["education"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < edu.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    onMoveDown={() => edu.moveValue(i, i + 1)}
                    onMoveUp={() => edu.moveValue(i, i - 1)}
                    onRemove={() => edu.removeValue(i)}
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
                <AddButton onClick={() => edu.pushValue(emptyEducation())}>Add education</AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        {/* ── Systems & Technical Proficiency ─────────────────────── */}
        <Section title="Systems & Technical Proficiency">
          <form.Field mode="array" name="systems">
            {(sys) => (
              <div className="flex flex-col gap-3">
                {(sys.state.value as ResumeData["systems"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < sys.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    onMoveDown={() => sys.moveValue(i, i + 1)}
                    onMoveUp={() => sys.moveValue(i, i - 1)}
                    onRemove={() => sys.removeValue(i)}
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
                <AddButton onClick={() => sys.pushValue(emptySystem())}>Add group</AddButton>
              </div>
            )}
          </form.Field>
        </Section>

        {/* ── References ──────────────────────────────────────────── */}
        <Section title="References">
          <form.Field mode="array" name="references">
            {(refs) => (
              <div className="flex flex-col gap-3">
                {(refs.state.value as ResumeData["references"]).map((_, i) => (
                  <ItemCard
                    canMoveDown={i < refs.state.value.length - 1}
                    canMoveUp={i > 0}
                    key={i}
                    onMoveDown={() => refs.moveValue(i, i + 1)}
                    onMoveUp={() => refs.moveValue(i, i - 1)}
                    onRemove={() => refs.removeValue(i)}
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
                <AddButton onClick={() => refs.pushValue(emptyReference())}>
                  Add reference
                </AddButton>
              </div>
            )}
          </form.Field>
        </Section>
      </FieldGroup>
    </div>
  );

  // Subscribing to values only around the preview keeps typing from re-rendering
  // the whole form; each form.Field manages its own input.
  const previewPane = (
    <form.Subscribe selector={(s) => s.values}>
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
          <ImportDialog
            onSubmit={(source, format, label) =>
              assistantRef.current?.startImport(source, format, label)
            }
          />
          <TailorDialog onSubmit={(jd) => assistantRef.current?.startTailor(jd)} />
          <Button
            className="text-muted-foreground"
            onClick={() => loadResume(DEFAULT_RESUME)}
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
          {/* Preview owns the muted panel background so it fills the column and its
              bottom-right corner rounds cleanly. The inner wrapper sticks (below the
              sticky top-nav) so the live preview stays in view while scrolling the form. */}
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
        getResume={() => form.state.values as ResumeData}
        ref={assistantRef}
      />
    </div>
  );
}
