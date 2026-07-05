import { generateText } from "ai";
import { v } from "convex/values";
import { DEFAULT_MODEL } from "../lib/chat/models";
import { getChatModel } from "../lib/chat/provider";
import { internal } from "./_generated/api";
import { type ActionCtx, action } from "./_generated/server";

// AI assist for the résumé builder: the tailor-to-job action (a one-shot
// completion, not an agent thread) reusing the same Bedrock model registry/provider
// as /chat. The hard rule: reorganize ONLY what the user already wrote — never invent
// employers, dates, titles, metrics, or skills. It is also enforced structurally
// (competencies are reconciled to the original set server-side, so the model cannot
// add or drop a skill).

const MAX_TEXT = 4000;
const MAX_JD = 8000;

/** Strip code fences and wrapping quotes a model sometimes adds around its output. */
function cleanup(s: string): string {
  let t = s.trim();
  t = t
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/** Reorder `original` by `proposed`, keeping the original set EXACTLY (no adds/drops). */
function reconcileList(original: string[], proposed: string[]): string[] {
  const byKey = new Map(original.map((s) => [s.trim().toLowerCase(), s]));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of proposed) {
    const key = p.trim().toLowerCase();
    const match = byKey.get(key);
    if (match && !seen.has(key)) {
      result.push(match);
      seen.add(key);
    }
  }
  for (const s of original) {
    const key = s.trim().toLowerCase();
    if (!seen.has(key)) {
      result.push(s);
      seen.add(key);
    }
  }
  return result;
}

// Return types are annotated explicitly: these functions call ctx.runQuery on the
// generated `internal` API, which would otherwise create a TS inference cycle
// (TS7022/7023 "referenced directly or indirectly in its own initializer").
async function resolveModel(
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

export const tailorToJob = action({
  args: {
    summary: v.string(),
    competencies: v.array(v.string()),
    jobDescription: v.string(),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ summary: string; competencies: string[] }> => {
    const jd = args.jobDescription.trim().slice(0, MAX_JD);
    const competencies = args.competencies.slice(0, 40);
    if (!jd) return { summary: args.summary, competencies };
    const model = await resolveModel(ctx, args.modelId);

    // 1) Rewrite the summary to foreground JD-relevant EXISTING experience.
    const summaryPrompt =
      "You are tailoring a résumé summary to a specific job. Rewrite the summary so it foregrounds the " +
      "candidate's most relevant EXISTING experience and skills for the target role, echoing the job's " +
      "language where it genuinely fits. Absolute rules: use ONLY facts, skills, and experience already " +
      "present in the current summary — never invent or imply experience, tools, seniority, or metrics the " +
      "candidate did not state. Do NOT adopt the job's title or seniority as the candidate's own identity; " +
      "keep the candidate's actual role and background, only shifting which parts you emphasize. Keep it " +
      "truthful, concise, and ATS-friendly plain text. Return ONLY the " +
      `rewritten summary.\n\nJOB DESCRIPTION:\n${jd}\n\nCURRENT SUMMARY:\n${args.summary.slice(0, MAX_TEXT)}`;

    // 2) Reorder the skills so JD-relevant ones lead (reconciled to the original set).
    const compPrompt =
      "Given a JOB DESCRIPTION and a candidate's SKILLS, output the SAME skills reordered so the ones most " +
      "relevant to the job come first. Rules: return the exact same skill strings, one per line, reordered " +
      "only — do not add, remove, reword, merge, or split any skill, and output nothing else.\n\n" +
      `JOB DESCRIPTION:\n${jd}\n\nSKILLS (one per line):\n${competencies.join("\n")}`;

    const [summaryRes, compRes] = await Promise.all([
      generateText({ model, prompt: summaryPrompt, temperature: 0.4 }),
      generateText({ model, prompt: compPrompt, temperature: 0.2 }),
    ]);

    const proposed = compRes.text
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
      .filter(Boolean);

    return {
      summary: cleanup(summaryRes.text) || args.summary,
      competencies: reconcileList(competencies, proposed),
    };
  },
});
