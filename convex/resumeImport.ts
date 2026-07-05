import { generateObject } from "ai";
import { v } from "convex/values";
import { parseTex } from "../lib/resume/parse-tex";
import type { ResumeData, SystemGroup } from "../lib/resume/schema";
import { resumeSchema } from "../lib/resume/schema";
import { action } from "./_generated/server";
import { resolveResumeModel } from "./resumeChat";

// Import a résumé from a document. Deterministic-first: for LaTeX from the known
// template, the exact `parseTex` parser is the primary "tool" (fast, lossless, no
// LLM). For .docx, plain text, or LaTeX it can't parse, an AI pass extracts the
// structured résumé. The hard rule for the AI path: extract ONLY what's in the
// document — never invent a name, employer, date, bullet, or skill.

const MAX_SOURCE = 60_000;
// Structured extraction benefits from a stronger model; fall back to the registry
// default if this id isn't in the table.
const EXTRACT_MODEL = "openai.gpt-oss-120b";

const EXTRACT_RULES =
  "Extract the résumé in this document into the structured format. Absolute rules: use ONLY " +
  "information that appears in the document — never invent or infer a name, employer, job title, " +
  "date, location, bullet point, skill, phone number, or email that is not present. Copy wording " +
  "faithfully; you may only fix obvious formatting artifacts and join words split across line " +
  "breaks. Group each employer's roles together, and keep each role's own bullet points. Put a " +
  "plain list of skills under `competencies`. Use `systems` ONLY for an explicit technical section " +
  "written as labelled groups (e.g. 'Languages: TypeScript, Go' or 'Tools: Docker, Git'); a section " +
  "titled 'Skills' is competencies, NOT systems — never invent group labels, and never place the " +
  "same content in both `competencies` and `systems`. Leave a field empty ('' or []) when the " +
  "document does not contain it. Do not add commentary.";

/** Does a deterministic parse look substantive enough to trust over an AI pass? */
function looksComplete(r: ResumeData): boolean {
  return r.name.trim().length > 0 && r.experience.length > 0;
}

// Labels that mean "these are competencies, not a technical-proficiency group".
const SKILL_LABELS = new Set([
  "skills",
  "skill",
  "competencies",
  "core competencies",
  "key skills",
  "technical skills",
]);

/** Split a systems value like "TypeScript, Go · SQL" into individual items. */
function splitItems(value: string): string[] {
  return value
    .split(/[,·;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Guardrail for the AI path: the extractor sometimes mislabels a plain skills
// list as a "Systems & Technical Proficiency" group AND also (or instead) puts it
// in competencies. The template rule is that a "Skills" section IS competencies,
// so fold any such group's items into competencies (case-insensitive dedupe,
// existing order first) and drop the group from systems — no data lost, no
// duplication across the two sections.
function dedupeSkillGroups(r: ResumeData): ResumeData {
  const isSkillGroup = (g: SystemGroup) =>
    SKILL_LABELS.has(
      g.label
        .trim()
        .toLowerCase()
        .replace(/[\s:]+$/, "")
    );
  const skillGroups = r.systems.filter(isSkillGroup);
  if (skillGroups.length === 0) return r;

  const seen = new Set(r.competencies.map((c) => c.toLowerCase()));
  const competencies = [...r.competencies];
  for (const g of skillGroups) {
    for (const item of splitItems(g.value)) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        competencies.push(item);
      }
    }
  }
  return { ...r, competencies, systems: r.systems.filter((g) => !isSkillGroup(g)) };
}

export const extractResume = action({
  args: {
    source: v.string(),
    format: v.union(v.literal("tex"), v.literal("docx"), v.literal("text")),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ resume: ResumeData; method: "deterministic" | "ai" }> => {
    const source = args.source.slice(0, MAX_SOURCE).trim();
    if (!source) throw new Error("There's nothing to import.");

    // 1) Deterministic tool — the nina-template LaTeX parser.
    if (args.format === "tex") {
      try {
        const parsed = parseTex(source);
        if (looksComplete(parsed)) return { resume: parsed, method: "deterministic" };
      } catch {
        // not the known template — fall through to the AI pass
      }
    }

    // 2) AI structured extraction (.docx / plain text / non-template LaTeX).
    const model = await resolveResumeModel(ctx, args.modelId ?? EXTRACT_MODEL);
    const { object } = await generateObject({
      model,
      schema: resumeSchema,
      schemaName: "resume",
      schemaDescription: "A résumé extracted verbatim from the document.",
      prompt: `${EXTRACT_RULES}\n\nDOCUMENT:\n${source}`,
    });
    return { resume: dedupeSkillGroups(resumeSchema.parse(object)), method: "ai" };
  },
});
