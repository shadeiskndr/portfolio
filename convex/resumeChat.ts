import { generateText, stepCountIs, tool } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { DEFAULT_MODEL } from "../lib/chat/models";
import { getChatModel } from "../lib/chat/provider";
import type { ResumeData } from "../lib/resume/schema";
import { internal } from "./_generated/api";
import { type ActionCtx, action } from "./_generated/server";

// Conversational résumé assistant. A multi-step tool-calling turn (AI SDK
// generate/streamText + tools) reusing the same Bedrock provider/registry as
// /chat. The tools don't mutate anything server-side — they record structured
// EDITS the client applies to the TanStack form (résumé stays client-owned, the
// preview updates live). The agent has full CRUD over the résumé: rewrite PROSE
// (summary, competencies, role bullets), EDIT existing items (contact, employers,
// roles, education, systems, references), ADD new structural items, and DELETE
// items — but only from what the user provides, never inventing. No fabrication.
//
// Two entry points share the helpers below: the streaming HTTP route in
// `http.ts` (POST /resume-chat, SSE) and the non-streaming `chat` action here.

export type ResumeEdit =
  | { type: "summary"; text: string }
  | { type: "competencies"; items: string[] }
  | { type: "bullets"; employerIndex: number; roleIndex: number; bullets: string[] }
  // Structural additions (append a new item).
  | { type: "add_role"; employerIndex: number; title: string; period: string; bullets: string[] }
  | {
      type: "add_employer";
      firm: string;
      location: string;
      role: { title: string; period: string; bullets: string[] };
    }
  | { type: "add_education"; degree: string; institution: string; period: string; location: string }
  | { type: "add_system"; label: string; value: string }
  | { type: "add_reference"; name: string; role: string; phone: string; email: string }
  // Edits to an EXISTING item (addressed by index; only the provided fields change).
  | { type: "contact"; name?: string; email?: string; phone?: string; location?: string }
  | { type: "update_employer"; employerIndex: number; firm?: string; location?: string }
  | {
      type: "update_role";
      employerIndex: number;
      roleIndex: number;
      title?: string;
      period?: string;
    }
  | {
      type: "update_education";
      index: number;
      degree?: string;
      institution?: string;
      period?: string;
      location?: string;
    }
  | { type: "update_system"; index: number; label?: string; value?: string }
  | {
      type: "update_reference";
      index: number;
      name?: string;
      role?: string;
      phone?: string;
      email?: string;
    }
  // Deletions (addressed by index).
  | { type: "delete_role"; employerIndex: number; roleIndex: number }
  | { type: "delete_employer"; employerIndex: number }
  | { type: "delete_education"; index: number }
  | { type: "delete_system"; index: number }
  | { type: "delete_reference"; index: number };

/** Strip a leading list marker (models sometimes format bullets/skills as "- item"). */
function stripMarker(s: string): string {
  return s.replace(/^\s*[-*•◦·]\s+/, "").trim();
}

/** Trim, strip list markers, and drop empties from a list of items. */
function cleanList(items: string[]): string[] {
  return items.flatMap((s) => {
    const c = stripMarker(s);
    return c ? [c] : [];
  });
}

/** Render the FULL résumé for the model to read. Every section is included — the
 * assistant can only EDIT some of them (see the system prompt), but it must be able
 * to READ all of them to answer questions, or it will invent the missing ones.
 * Empty sections are marked "(none)" so the model reports absence instead of guessing.
 * Experience keeps its employerIndex/roleIndex labels — the edit tools address roles by them. */
function resumeContext(r: ResumeData): string {
  const experience = r.experience.length
    ? r.experience
        .map((e, i) => {
          const roles = e.roles
            .map((role, j) => {
              const bullets = role.bullets.length
                ? role.bullets.map((b) => `        - ${b}`).join("\n")
                : "        (no bullets yet)";
              return `    roleIndex ${j} — ${role.title} (${role.period})\n      bullets:\n${bullets}`;
            })
            .join("\n");
          return `  employerIndex ${i} — ${e.firm} (${e.location})\n${roles}`;
        })
        .join("\n")
    : "  (none)";
  const education = r.education.length
    ? r.education
        .map(
          (e, i) =>
            `  index ${i} — ${e.degree} — ${e.institution} (${e.period})${e.location ? `, ${e.location}` : ""}`
        )
        .join("\n")
    : "  (none)";
  const systems = r.systems.length
    ? r.systems.map((s, i) => `  index ${i} — ${s.label}: ${s.value}`).join("\n")
    : "  (none)";
  const references = r.references.length
    ? r.references
        .map(
          (ref, i) =>
            `  index ${i} — ${ref.name} — ${ref.role}${ref.phone ? `, ${ref.phone}` : ""}${ref.email ? `, ${ref.email}` : ""}`
        )
        .join("\n")
    : "  (none)";
  return [
    "CURRENT RÉSUMÉ — this is the user's ACTUAL résumé, currently loaded in the builder. Answer every " +
      "question using ONLY what appears below; when a field or section shows (none), say it is empty " +
      "rather than inventing anything.",
    "",
    "Contact:",
    `  Name: ${r.name || "(none)"}`,
    `  Email: ${r.email || "(none)"}`,
    `  Phone: ${r.phone || "(none)"}`,
    `  Location: ${r.location || "(none)"}`,
    "",
    `Summary: ${r.summary.trim() || "(none)"}`,
    "",
    `Core competencies: ${r.competencies.length ? r.competencies.join(" · ") : "(none)"}`,
    "",
    "Experience:",
    experience,
    "",
    "Education:",
    education,
    "",
    "Systems & technical proficiency:",
    systems,
    "",
    "References:",
    references,
  ].join("\n");
}

export const RESUME_SYSTEM = (r: ResumeData): string =>
  "You are a résumé writing assistant embedded in a résumé builder. You help the user improve their " +
  "résumé and answer questions about it. " +
  "You CAN READ the entire résumé shown below — contact details, summary, competencies, experience, " +
  "education, systems, and references — and you should answer any question about it from that content. " +
  "You have full editing tools over every section:\n" +
  "• EDIT PROSE: the professional summary (update_summary) and the core-competencies list " +
  "(update_competencies).\n" +
  "• EDIT EXISTING ITEMS (addressed by the index shown below, changing only the fields you pass): " +
  "contact/heading details (update_contact), an employer's name or location (update_employer), a role's " +
  "title or dates (update_role), its bullet points (set_role_bullets), an education entry " +
  "(update_education), a technical group (update_system), or a reference (update_reference).\n" +
  "• ADD new items: a role under an existing employer (add_role), a whole new employer with its first " +
  "role (add_employer), an education entry (add_education), a technical group (add_system), or a " +
  "reference (add_reference).\n" +
  "• DELETE items (addressed by index): a role (delete_role — deleting an employer's only role removes " +
  "the employer), an employer and all its roles (delete_employer), an education entry (delete_education), " +
  "a technical group (delete_system), or a reference (delete_reference). Delete ONLY when the user " +
  "clearly asks to remove something; never delete to 'clean up' on your own. Every change (including " +
  "deletions) can be reversed with the Undo button, so you don't need to ask for confirmation first. " +
  "ABSOLUTE NO-FABRICATION RULE: only ever use information the user has actually given you — the " +
  "existing résumé content below, or details they state in this conversation. NEVER invent or infer an " +
  "employer, role, title, date, location, degree, institution, skill, metric, achievement, name, phone, " +
  "or email. When adding or editing, if you are missing a required detail (e.g. the dates for a new role, " +
  "or the new value the user wants), ASK the user for it instead of guessing or filling a placeholder. Do " +
  "not offer to write bullet content for a role the user hasn't described — the accomplishments must come " +
  "from what they tell you about that role, not from you. " +
  "Keep bullets concise and led by a strong action verb; ATS-friendly plain text; you may wrap a key " +
  "phrase in *asterisks* for bold. When you edit, call the matching tool — for list-valued fields " +
  "(bullets, competencies) pass the FULL new value, and for the update_* tools pass ONLY the fields that " +
  "change — then reply in one or two short sentences saying what you changed. If the user only asks a " +
  "question or for advice, answer conversationally without calling any tool.\n\n" +
  resumeContext(r);

// ── Import review (streamed after an import) ────────────────────────────────
// After a résumé is imported into the builder, the assistant streams a short,
// honest review of what came through, so importing feels conversational instead
// of a silent form-fill (see the /resume-import SSE route in http.ts).
export const RESUME_IMPORT_REVIEW_SYSTEM =
  "You are a résumé assistant. The user just imported a résumé and it is now loaded into the builder's " +
  "form. In 2–4 short sentences, warmly confirm the import and give a quick, honest review. Use the " +
  "SECTION STATUS list below as the ONLY source of truth for what is present, empty, or missing: mention " +
  "which major sections came through, and gently flag ONLY sections the status marks EMPTY or 0, or " +
  "bullets that genuinely lack concrete detail, so they know what to check. Never claim a section is empty " +
  "when its status shows content, or that it came through when its status shows it is empty, and do not " +
  "raise problems the status does not support. Close by offering to help — for example tightening the " +
  "summary or strengthening a role's bullets. ABSOLUTE RULE: describe ONLY what actually appears in the " +
  "imported résumé below — never invent employers, skills, achievements, or numbers. Write plain " +
  "conversational text, no headings or bullet lists.";

export function importReviewPrompt(r: ResumeData, method: "deterministic" | "ai"): string {
  const provenance =
    method === "deterministic"
      ? "It was parsed exactly from a known LaTeX template, so the fields are lossless."
      : "It was extracted by AI from the document, so gently remind the user to double-check the fields.";
  const bullets = r.experience.reduce(
    (n, e) => n + e.roles.reduce((m, role) => m + role.bullets.length, 0),
    0
  );
  const status = [
    `- Summary: ${r.summary.trim() ? `present (${r.summary.trim().length} characters)` : "EMPTY"}`,
    `- Core competencies: ${r.competencies.length} item(s)`,
    `- Work experience: ${r.experience.length} employer(s), ${bullets} bullet(s) total`,
    `- Education: ${r.education.length} entry(ies)`,
    `- Systems / technical groups: ${r.systems.length}`,
    `- References: ${r.references.length}`,
  ].join("\n");
  return [
    provenance,
    "",
    "SECTION STATUS (ground truth — describe presence/emptiness ONLY from this):",
    status,
    "",
    resumeContext(r),
  ].join("\n");
}

// ── Tailor explanation (streamed after a tailor-to-job) ─────────────────────
// After the résumé is tailored (summary rewritten + competencies reordered to the
// SAME set), the assistant streams a short explanation, so tailoring feels like a
// chat turn (see the /resume-tailor SSE route in http.ts).
export const RESUME_TAILOR_EXPLAIN_SYSTEM =
  "You are a résumé assistant. The user asked to tailor their résumé to a job, and you have just " +
  "rewritten their professional summary and reordered their core competencies to match the posting. In " +
  "2–3 short sentences, explain what you emphasized in the summary and which skills you moved toward the " +
  "front and why, grounded in the job description. Be honest about the scope: you ONLY rephrased the " +
  "summary and REORDERED the existing skills — you did NOT add, remove, or invent any skill, experience, " +
  "title, or metric, and you did not touch anything else. Offer to adjust further if they'd like. Write " +
  "plain conversational text, no headings or bullet lists.";

export function tailorExplainPrompt(
  jobDescription: string,
  tailored: { summary: string; competencies: string[] }
): string {
  return [
    `JOB DESCRIPTION (excerpt):\n${jobDescription.slice(0, 2500)}`,
    "",
    `TAILORED SUMMARY:\n${tailored.summary}`,
    "",
    `COMPETENCIES, NOW REORDERED (same set, most job-relevant first):\n${tailored.competencies.join(" · ")}`,
  ].join("\n");
}

/** Build the edit + structural-add tools, pushing structured edits into `edits` as they run. */
export function buildResumeTools(edits: ResumeEdit[]) {
  return {
    update_summary: tool({
      description: "Replace the professional summary paragraph with new prose.",
      inputSchema: z.object({ text: z.string().describe("The complete new summary.") }),
      execute: async ({ text }) => {
        edits.push({ type: "summary", text: text.trim() });
        return "Summary updated.";
      },
    }),
    update_competencies: tool({
      description:
        "Replace the entire core-competencies (skills) list. Provide the full ordered list.",
      inputSchema: z.object({
        items: z.array(z.string()).describe("The complete ordered list of skills."),
      }),
      execute: async ({ items }) => {
        const cleaned = cleanList(items);
        edits.push({ type: "competencies", items: cleaned });
        return `Competencies set (${cleaned.length}).`;
      },
    }),
    set_role_bullets: tool({
      description:
        "Replace ALL bullet points for one role, addressed by the employerIndex and roleIndex " +
        "from the résumé context. Provide the full new bullet list.",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based employer index."),
        roleIndex: z.number().int().describe("0-based role index within that employer."),
        bullets: z.array(z.string()).describe("The complete new list of bullets for that role."),
      }),
      execute: async ({ employerIndex, roleIndex, bullets }) => {
        edits.push({ type: "bullets", employerIndex, roleIndex, bullets: cleanList(bullets) });
        return "Bullets updated.";
      },
    }),
    add_role: tool({
      description:
        "Add a NEW role/position under an EXISTING employer (by employerIndex from the context). Use " +
        "ONLY details the user explicitly gave — never invent a title, dates, or bullets. If the title " +
        "or dates are missing, ask the user instead of calling this.",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based index of the existing employer."),
        title: z.string().describe("The role/job title, exactly as the user gave it."),
        period: z.string().describe("The date span the user gave, e.g. 'Jan 2020 – Dec 2022'."),
        bullets: z.array(z.string()).describe("Bullets the user provided; pass [] if none yet."),
      }),
      execute: async ({ employerIndex, title, period, bullets }) => {
        if (!title.trim() || !period.trim())
          return "I need both the role title and the dates before adding it — please provide them.";
        edits.push({
          type: "add_role",
          employerIndex,
          title: title.trim(),
          period: period.trim(),
          bullets: cleanList(bullets),
        });
        return "Role added.";
      },
    }),
    add_employer: tool({
      description:
        "Add a NEW employer with its first role. Use ONLY details the user explicitly gave — never " +
        "invent a firm, title, dates, location, or bullets. Ask for anything missing.",
      inputSchema: z.object({
        firm: z.string().describe("Employer/company name, as the user gave it."),
        location: z.string().describe("Employer location, or '' if the user didn't give one."),
        title: z.string().describe("The role title at this employer."),
        period: z
          .string()
          .describe("The date span, e.g. 'Jan 2020 – Dec 2022', or '' if not given."),
        bullets: z.array(z.string()).describe("Bullets the user provided; pass [] if none yet."),
      }),
      execute: async ({ firm, location, title, period, bullets }) => {
        if (!firm.trim() || !title.trim())
          return "I need at least the employer name and the role title — please provide them.";
        edits.push({
          type: "add_employer",
          firm: firm.trim(),
          location: location.trim(),
          role: { title: title.trim(), period: period.trim(), bullets: cleanList(bullets) },
        });
        return "Employer added.";
      },
    }),
    add_education: tool({
      description:
        "Add a NEW education entry. Use ONLY what the user gave — never invent a degree, institution, " +
        "dates, or location. Ask for anything missing.",
      inputSchema: z.object({
        degree: z.string().describe("Degree/qualification, e.g. 'B.Sc. in Computer Science'."),
        institution: z.string().describe("School/university name."),
        period: z.string().describe("Years, e.g. '2013 – 2017', or '' if not given."),
        location: z.string().describe("Location, or '' if not given."),
      }),
      execute: async ({ degree, institution, period, location }) => {
        if (!degree.trim() || !institution.trim())
          return "I need the degree and the institution — please provide them.";
        edits.push({
          type: "add_education",
          degree: degree.trim(),
          institution: institution.trim(),
          period: period.trim(),
          location: location.trim(),
        });
        return "Education added.";
      },
    }),
    add_system: tool({
      description:
        "Add a NEW 'Systems & Technical Proficiency' group: a label and its items (e.g. label " +
        "'Languages', value 'TypeScript, Go, SQL'). Use ONLY what the user gave.",
      inputSchema: z.object({
        label: z.string().describe("The group label, e.g. 'Languages' or 'Tools'."),
        value: z.string().describe("The items for that group, as the user gave them."),
      }),
      execute: async ({ label, value }) => {
        if (!label.trim() || !value.trim())
          return "I need both a label and its items — please provide them.";
        edits.push({ type: "add_system", label: label.trim(), value: value.trim() });
        return "Technical group added.";
      },
    }),
    add_reference: tool({
      description:
        "Add a NEW reference. Use ONLY the contact details the user explicitly gave — never invent a " +
        "name, role, phone, or email. Ask for anything missing.",
      inputSchema: z.object({
        name: z.string().describe("Reference's full name."),
        role: z.string().describe("Their role/firm, e.g. 'Engineering Manager, Acme'."),
        phone: z.string().describe("Phone, or '' if not given."),
        email: z.string().describe("Email, or '' if not given."),
      }),
      execute: async ({ name, role, phone, email }) => {
        if (!name.trim()) return "I need at least the reference's name — please provide it.";
        edits.push({
          type: "add_reference",
          name: name.trim(),
          role: role.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
        return "Reference added.";
      },
    }),
    // ── Edits to existing items (partial; only the fields passed are changed) ──
    update_contact: tool({
      description:
        "Correct the heading/contact fields. Pass ONLY the fields the user wants changed, with the " +
        "exact values they give. Never invent a value.",
      inputSchema: z.object({
        name: z.string().optional().describe("New full name, if changing it."),
        email: z.string().optional().describe("New email, if changing it."),
        phone: z.string().optional().describe("New phone, if changing it."),
        location: z.string().optional().describe("New location, if changing it."),
      }),
      execute: async ({ name, email, phone, location }) => {
        const patch: Extract<ResumeEdit, { type: "contact" }> = { type: "contact" };
        if (name !== undefined) patch.name = name.trim();
        if (email !== undefined) patch.email = email.trim();
        if (phone !== undefined) patch.phone = phone.trim();
        if (location !== undefined) patch.location = location.trim();
        if (Object.keys(patch).length === 1) return "Tell me which contact detail to change.";
        edits.push(patch);
        return "Contact updated.";
      },
    }),
    update_employer: tool({
      description:
        "Rename or relocate an EXISTING employer, addressed by employerIndex from the context. Pass " +
        "only the fields to change.",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based employer index."),
        firm: z.string().optional().describe("New firm name, if changing it."),
        location: z.string().optional().describe("New location, if changing it."),
      }),
      execute: async ({ employerIndex, firm, location }) => {
        const patch: Extract<ResumeEdit, { type: "update_employer" }> = {
          type: "update_employer",
          employerIndex,
        };
        if (firm !== undefined) {
          if (!firm.trim()) return "The firm name can't be empty.";
          patch.firm = firm.trim();
        }
        if (location !== undefined) patch.location = location.trim();
        if (patch.firm === undefined && patch.location === undefined)
          return "Tell me what to change about this employer.";
        edits.push(patch);
        return "Employer updated.";
      },
    }),
    update_role: tool({
      description:
        "Change the title or dates of an EXISTING role, addressed by employerIndex + roleIndex. Pass " +
        "only the fields to change. (Use set_role_bullets to change its bullet points.)",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based employer index."),
        roleIndex: z.number().int().describe("0-based role index within that employer."),
        title: z.string().optional().describe("New role title, if changing it."),
        period: z.string().optional().describe("New date span, if changing it."),
      }),
      execute: async ({ employerIndex, roleIndex, title, period }) => {
        const patch: Extract<ResumeEdit, { type: "update_role" }> = {
          type: "update_role",
          employerIndex,
          roleIndex,
        };
        if (title !== undefined) {
          if (!title.trim()) return "The role title can't be empty.";
          patch.title = title.trim();
        }
        if (period !== undefined) patch.period = period.trim();
        if (patch.title === undefined && patch.period === undefined)
          return "Tell me what to change about this role.";
        edits.push(patch);
        return "Role updated.";
      },
    }),
    update_education: tool({
      description:
        "Edit an EXISTING education entry, addressed by index. Pass only the fields to change.",
      inputSchema: z.object({
        index: z.number().int().describe("0-based education index."),
        degree: z.string().optional(),
        institution: z.string().optional(),
        period: z.string().optional(),
        location: z.string().optional(),
      }),
      execute: async ({ index, degree, institution, period, location }) => {
        const patch: Extract<ResumeEdit, { type: "update_education" }> = {
          type: "update_education",
          index,
        };
        if (degree !== undefined) {
          if (!degree.trim()) return "The degree can't be empty.";
          patch.degree = degree.trim();
        }
        if (institution !== undefined) {
          if (!institution.trim()) return "The institution can't be empty.";
          patch.institution = institution.trim();
        }
        if (period !== undefined) patch.period = period.trim();
        if (location !== undefined) patch.location = location.trim();
        if (Object.keys(patch).length === 2)
          return "Tell me what to change about this education entry.";
        edits.push(patch);
        return "Education updated.";
      },
    }),
    update_system: tool({
      description:
        "Edit an EXISTING 'Systems & Technical Proficiency' group, addressed by index. Pass only the " +
        "fields to change.",
      inputSchema: z.object({
        index: z.number().int().describe("0-based systems index."),
        label: z.string().optional().describe("New group label, if changing it."),
        value: z.string().optional().describe("New items for the group, if changing them."),
      }),
      execute: async ({ index, label, value }) => {
        const patch: Extract<ResumeEdit, { type: "update_system" }> = {
          type: "update_system",
          index,
        };
        if (label !== undefined) {
          if (!label.trim()) return "The label can't be empty.";
          patch.label = label.trim();
        }
        if (value !== undefined) {
          if (!value.trim()) return "The value can't be empty.";
          patch.value = value.trim();
        }
        if (patch.label === undefined && patch.value === undefined)
          return "Tell me what to change about this group.";
        edits.push(patch);
        return "Technical group updated.";
      },
    }),
    update_reference: tool({
      description:
        "Edit an EXISTING reference, addressed by index. Pass only the fields to change.",
      inputSchema: z.object({
        index: z.number().int().describe("0-based references index."),
        name: z.string().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
      }),
      execute: async ({ index, name, role, phone, email }) => {
        const patch: Extract<ResumeEdit, { type: "update_reference" }> = {
          type: "update_reference",
          index,
        };
        if (name !== undefined) {
          if (!name.trim()) return "The reference name can't be empty.";
          patch.name = name.trim();
        }
        if (role !== undefined) patch.role = role.trim();
        if (phone !== undefined) patch.phone = phone.trim();
        if (email !== undefined) patch.email = email.trim();
        if (Object.keys(patch).length === 2) return "Tell me what to change about this reference.";
        edits.push(patch);
        return "Reference updated.";
      },
    }),
    // ── Deletions (only when the user clearly asks; undoable in the form) ──────
    delete_role: tool({
      description:
        "Delete an EXISTING role by employerIndex + roleIndex. If it is the employer's only role, the " +
        "whole employer is removed. Only when the user asks to remove it.",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based employer index."),
        roleIndex: z.number().int().describe("0-based role index within that employer."),
      }),
      execute: async ({ employerIndex, roleIndex }) => {
        edits.push({ type: "delete_role", employerIndex, roleIndex });
        return "Role deleted.";
      },
    }),
    delete_employer: tool({
      description:
        "Delete an EXISTING employer and all its roles, by employerIndex. Only when the user asks.",
      inputSchema: z.object({
        employerIndex: z.number().int().describe("0-based employer index."),
      }),
      execute: async ({ employerIndex }) => {
        edits.push({ type: "delete_employer", employerIndex });
        return "Employer deleted.";
      },
    }),
    delete_education: tool({
      description: "Delete an EXISTING education entry by index. Only when the user asks.",
      inputSchema: z.object({ index: z.number().int().describe("0-based education index.") }),
      execute: async ({ index }) => {
        edits.push({ type: "delete_education", index });
        return "Education deleted.";
      },
    }),
    delete_system: tool({
      description: "Delete an EXISTING technical group by index. Only when the user asks.",
      inputSchema: z.object({ index: z.number().int().describe("0-based systems index.") }),
      execute: async ({ index }) => {
        edits.push({ type: "delete_system", index });
        return "Technical group deleted.";
      },
    }),
    delete_reference: tool({
      description: "Delete an EXISTING reference by index. Only when the user asks.",
      inputSchema: z.object({ index: z.number().int().describe("0-based references index.") }),
      execute: async ({ index }) => {
        edits.push({ type: "delete_reference", index });
        return "Reference deleted.";
      },
    }),
  };
}

// Return type annotated to break the TS inference cycle from ctx.runQuery(internal…).
export async function resolveResumeModel(
  ctx: ActionCtx,
  modelId?: string
): Promise<ReturnType<typeof getChatModel>> {
  const resolved = await ctx.runQuery(internal.models.resolveForRun, { modelId });
  return getChatModel(
    resolved?.id ?? DEFAULT_MODEL.id,
    resolved?.surface ?? DEFAULT_MODEL.surface,
    resolved?.api ?? DEFAULT_MODEL.api
  );
}

/** Non-streaming turn (kept as a fallback; the panel uses the streaming HTTP route). */
export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    resume: v.any(),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ text: string; edits: ResumeEdit[] }> => {
    const resume = args.resume as ResumeData;
    const model = await resolveResumeModel(ctx, args.modelId);
    const edits: ResumeEdit[] = [];
    const result = await generateText({
      model,
      system: RESUME_SYSTEM(resume),
      messages: args.messages.slice(-20),
      tools: buildResumeTools(edits),
      stopWhen: stepCountIs(8),
      temperature: 0.4,
    });
    return { text: result.text, edits };
  },
});
