import { stepCountIs, streamText } from "ai";
import type { HttpRouter } from "convex/server";
import type { ResumeData } from "../../lib/resume/schema";
import { api } from "../_generated/api";
import { httpAction } from "../_generated/server";
import {
  buildResumeTools,
  importReviewPrompt,
  RESUME_IMPORT_REVIEW_SYSTEM,
  RESUME_SYSTEM,
  RESUME_TAILOR_EXPLAIN_SYSTEM,
  type ResumeEdit,
  resolveResumeModel,
  tailorExplainPrompt,
} from "../resumeChat";
import { badRequest, readJson, sseResponse, sseRoute } from "./sse";

// The résumé builder's assistant panel drives all three of these endpoints and
// reads the shared SSE frame protocol documented in ./sse. Behaviour lives in
// resumeChat.ts (prompts/tools) and the resumeImport/resume actions; these routes
// only wire an HTTP request to a stream.
export function registerResumeRoutes(http: HttpRouter) {
  // ── Free-form chat ─────────────────────────────────────────────────────────
  // Streams the assistant reply, then a single `edits` frame (tools have run by
  // then, so `edits` is complete) for the form to apply.
  sseRoute(
    http,
    "/resume-chat",
    httpAction(async (ctx, request) => {
      const body = await readJson<{
        messages?: { role: "user" | "assistant"; content: string }[];
        resume?: ResumeData;
        modelId?: string;
      }>(request);
      if (!body) return badRequest("bad request");
      const { messages, resume } = body;
      if (!Array.isArray(messages) || !resume) {
        return badRequest("missing messages or resume");
      }

      const model = await resolveResumeModel(ctx, body.modelId);
      const edits: ResumeEdit[] = [];
      const result = streamText({
        model,
        system: RESUME_SYSTEM(resume),
        messages: messages.slice(-20),
        tools: buildResumeTools(edits),
        stopWhen: stepCountIs(8),
        temperature: 0.4,
      });

      return sseResponse("stream failed", async (send) => {
        for await (const delta of result.textStream) send({ type: "text", delta });
        send({ type: "edits", edits });
      });
    })
  );

  // ── Import ─────────────────────────────────────────────────────────────────
  // The Import dialog hands its source text here. A `resume` frame is emitted
  // first (so the form + preview fill in immediately), then a streamed review of
  // what was imported. Extraction reuses the deterministic-first import action
  // (parse the known LaTeX template exactly, else AI-extract).
  sseRoute(
    http,
    "/resume-import",
    httpAction(async (ctx, request) => {
      const body = await readJson<{
        source?: string;
        format?: "tex" | "docx" | "text";
        modelId?: string;
      }>(request);
      if (!body) return badRequest("bad request");
      const { source, format } = body;
      if (typeof source !== "string" || !source.trim() || !format) {
        return badRequest("missing source or format");
      }

      return sseResponse("import failed", async (send) => {
        const { resume, method } = await ctx.runAction(api.resumeImport.extractResume, {
          source,
          format,
        });
        send({ type: "resume", resume, method });

        const model = await resolveResumeModel(ctx, body.modelId);
        const result = streamText({
          model,
          system: RESUME_IMPORT_REVIEW_SYSTEM,
          prompt: importReviewPrompt(resume, method),
          temperature: 0.4,
        });
        for await (const delta of result.textStream) send({ type: "text", delta });
      });
    })
  );

  // ── Tailor to a job ──────────────────────────────────────────────────────────
  // The Tailor dialog hands a job description here. An `edits` frame (rewritten
  // summary + reordered competencies — the set is reconciled server-side in
  // resume.tailorToJob, so no skill is added or dropped) is emitted first, then a
  // streamed explanation of what changed and why.
  sseRoute(
    http,
    "/resume-tailor",
    httpAction(async (ctx, request) => {
      const body = await readJson<{
        jobDescription?: string;
        resume?: ResumeData;
        modelId?: string;
      }>(request);
      if (!body) return badRequest("bad request");
      const { jobDescription, resume } = body;
      if (typeof jobDescription !== "string" || !jobDescription.trim() || !resume) {
        return badRequest("missing jobDescription or resume");
      }

      return sseResponse("tailor failed", async (send) => {
        const tailored = await ctx.runAction(api.resume.tailorToJob, {
          summary: resume.summary,
          competencies: resume.competencies,
          jobDescription,
        });
        const edits: ResumeEdit[] = [
          { type: "summary", text: tailored.summary },
          { type: "competencies", items: tailored.competencies },
        ];
        send({ type: "edits", edits });

        const model = await resolveResumeModel(ctx, body.modelId);
        const result = streamText({
          model,
          system: RESUME_TAILOR_EXPLAIN_SYSTEM,
          prompt: tailorExplainPrompt(jobDescription, tailored),
          temperature: 0.4,
        });
        for await (const delta of result.textStream) send({ type: "text", delta });
      });
    })
  );
}
