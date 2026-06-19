/**
 * Serializes the structured portfolio data (`lib/data.tsx`) into flat text
 * chunks for the RAG knowledge base — one chunk per experience / project /
 * certificate. Pure data-in / data-out (no React or icon imports) so it can run
 * in the ingest script; the resulting chunks are embedded server-side by
 * `convex/rag.ts` and stored in the `portfolioChunks` vector table.
 */
import type { CertificateDetails, ExperienceDetails, ProjectDetails } from "../types";

export interface PortfolioChunk {
  /** Coarse category, also a vector-search filter field. */
  source: "experience" | "project" | "certificate";
  /** Stable identity for the item, so re-ingestion is deterministic. */
  refKey: string;
  /** The text that gets embedded and, on retrieval, injected as context. */
  text: string;
  /**
   * Asset key of an associated image (project screenshots). Attached to the
   * chunk so retrieval can surface the image when the project is retrieved —
   * project screenshots aren't embedded (see convex/rag.ts).
   */
  imageKey?: string;
}

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function organizationFromLogoAlt(logoAlt: string): string {
  return logoAlt.replace(/\s+logo$/i, "").trim();
}

function experienceChunk(experience: ExperienceDetails): PortfolioChunk {
  const org = organizationFromLogoAlt(experience.logoAlt);
  const end = experience.currentlyWorkHere
    ? "Present"
    : experience.endDate
      ? formatMonth(experience.endDate)
      : "";
  const period = `${formatMonth(experience.startDate)}${end ? ` – ${end}` : ""}`;
  const text = [
    `Experience: ${experience.position} at ${org} (${period}).`,
    ...experience.summary,
  ].join("\n");
  return { source: "experience", refKey: `experience:${org}:${experience.position}`, text };
}

function projectChunk(project: ProjectDetails): PortfolioChunk {
  const text = [
    `Project: ${project.name}.`,
    project.description,
    `Technologies: ${project.technologies.join(", ")}.`,
    `Link: ${project.url}`,
  ].join("\n");
  return {
    source: "project",
    refKey: `project:${project.name}`,
    text,
    imageKey: project.previewImageKey,
  };
}

function certificateChunk(certificate: CertificateDetails): PortfolioChunk {
  const text = [
    `Certificate: ${certificate.certificateName} (via ${certificate.certificateSource}).`,
    certificate.certificateDescription.trim(),
    `Link: ${certificate.url}`,
  ].join("\n");
  return {
    source: "certificate",
    refKey: `certificate:${certificate.certificateName}`,
    text,
  };
}

export function serializePortfolioChunks(data: {
  experiences: ExperienceDetails[];
  projects: ProjectDetails[];
  certificates: CertificateDetails[];
}): PortfolioChunk[] {
  return [
    ...data.experiences.map(experienceChunk),
    ...data.projects.map(projectChunk),
    ...data.certificates.map(certificateChunk),
  ];
}
