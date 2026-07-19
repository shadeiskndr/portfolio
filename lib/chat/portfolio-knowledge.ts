export interface PortfolioChunk {
  source: "experience" | "project" | "certificate" | "education" | "uses" | "til";
  refKey: string;
  text: string;
  imageKey?: string | undefined;
}

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export interface ExperienceInput {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  summary: string[];
}

export interface ProjectInput {
  title: string;
  description: string;
  technologies: string[];
  url: string;
  imageKey?: string;
}

export interface CertificateInput {
  name: string;
  issuer: string;
  description: string;
  url?: string;
}

function experienceChunk(experience: ExperienceInput): PortfolioChunk {
  const end = experience.current
    ? "Present"
    : experience.endDate
      ? formatMonth(experience.endDate)
      : "";
  const period = `${formatMonth(experience.startDate)}${end ? ` – ${end}` : ""}`;
  const text = [
    `Experience: ${experience.position} at ${experience.company} (${period}).`,
    ...experience.summary,
  ].join("\n");
  return {
    source: "experience",
    refKey: `experience:${experience.company}:${experience.position}`,
    text,
  };
}

function projectChunk(project: ProjectInput): PortfolioChunk {
  const text = [
    `Project: ${project.title}.`,
    project.description,
    `Technologies: ${project.technologies.join(", ")}.`,
    `Link: ${project.url}`,
  ].join("\n");
  return {
    source: "project",
    refKey: `project:${project.title}`,
    text,
    imageKey: project.imageKey,
  };
}

function certificateChunk(certificate: CertificateInput): PortfolioChunk {
  const text = [
    `Certificate: ${certificate.name} (via ${certificate.issuer}).`,
    certificate.description.trim(),
    certificate.url ? `Link: ${certificate.url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    source: "certificate",
    refKey: `certificate:${certificate.name}`,
    text,
  };
}

export function serializePortfolioChunks(data: {
  experiences: ExperienceInput[];
  projects: ProjectInput[];
  certificates: CertificateInput[];
}): PortfolioChunk[] {
  return [
    ...data.experiences.map(experienceChunk),
    ...data.projects.map(projectChunk),
    ...data.certificates.map(certificateChunk),
  ];
}

export interface EducationInput {
  title: string;
  meta?: string;
  detail: string;
}

function educationChunk(item: EducationInput): PortfolioChunk {
  const text = [`Education: ${item.title}.`, item.meta ?? "", item.detail]
    .filter(Boolean)
    .join("\n");
  return { source: "education", refKey: `education:${item.title}`, text };
}

export function serializeEducationChunks(items: EducationInput[]): PortfolioChunk[] {
  return items.map(educationChunk);
}

export interface UsesGroupInput {
  title: string;
  rows: { label: string; value: string }[];
}

function usesChunk(group: UsesGroupInput): PortfolioChunk {
  const specs = group.rows.map((row) => `${row.label}: ${row.value}`).join(". ");
  return {
    source: "uses",
    refKey: `uses:${group.title}`,
    text: `Uses — ${group.title}: ${specs}.`,
  };
}

export function serializeUsesChunks(groups: UsesGroupInput[]): PortfolioChunk[] {
  return groups.map(usesChunk);
}

export interface TilPostInput {
  slug: string;
  title: string;
  summary?: string | undefined;
  tags?: string[] | undefined;
  body: string;
}

function cleanMdxBody(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<Mermaid\s+chart=\{`[\s\S]*?`\}\s*\/>/g, " ")
    .replace(/<[A-Z]\w*[^<]*?\/>/g, " ")
    .replace(/<\/?Highlight[^>]*>/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[*_]{1,3}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function tilChunk(post: TilPostInput): PortfolioChunk {
  const text = [
    `TIL: ${post.title.replace(/[*_`]/g, "")}`,
    post.summary ?? "",
    post.tags && post.tags.length > 0 ? `Tags: ${post.tags.join(", ")}.` : "",
    cleanMdxBody(post.body),
    `Link: /til/${post.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { source: "til", refKey: `til:${post.slug}`, text };
}

export function serializeTilChunks(posts: TilPostInput[]): PortfolioChunk[] {
  return posts.map(tilChunk);
}
