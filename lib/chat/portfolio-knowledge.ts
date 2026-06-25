/**
 * Serializes the structured portfolio data (`lib/data.tsx`) into flat text
 * chunks for the RAG knowledge base — one chunk per experience / project /
 * certificate. Pure data-in / data-out (no React or icon imports) so it can run
 * in the ingest script; the resulting chunks are embedded server-side by
 * `convex/rag.ts` and stored in the `portfolioChunks` vector table.
 */
export interface PortfolioChunk {
  /** Coarse category, also a vector-search filter field. */
  source: "experience" | "project" | "certificate" | "education" | "uses" | "til";
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

// Input shapes are structural subsets of the `lib/new-site/data.ts` exports —
// declared here (rather than imported) so this module stays free of that file's
// React/icon imports and can run in the ingest script.
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
  /** Asset key of the project screenshot (attached on retrieval; not embedded). */
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

// ---------------------------------------------------------------------------
// Education / academic background.
// ---------------------------------------------------------------------------

export interface EducationInput {
  /** Degree or qualification name. */
  title: string;
  /** Institution or category (e.g. "Universiti Kuala Lumpur (MIIT)"). */
  meta?: string;
  /** Result or highlight (e.g. "CGPA 3.78 / 4.00"). */
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

// ---------------------------------------------------------------------------
// "Uses" page — hardware/software setup, one chunk per group.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TIL posts (content/til/*.mdx) — one chunk per post.
// ---------------------------------------------------------------------------

export interface TilPostInput {
  slug: string;
  title: string;
  summary?: string;
  tags?: string[];
  /** Raw MDX body (frontmatter already stripped by the caller). */
  body: string;
}

/**
 * Reduce an MDX body to embeddable prose: drop fenced code, JSX components
 * (interactive demos, Mermaid diagrams) and markdown syntax, keeping the words
 * that actually carry meaning. Heuristic, but the corpus is small and controlled.
 */
function cleanMdxBody(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks (also carries away in-code JSX/generics)
    .replace(/<Mermaid\s+chart=\{`[\s\S]*?`\}\s*\/>/g, " ") // Mermaid — chart template may hold <br/>
    .replace(/<[A-Z]\w*[^<]*?\/>/g, " ") // other self-closing components (interactive demos)
    .replace(/<\/?Highlight[^>]*>/g, "") // Highlight wrapper — keep the prose it wraps
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images -> their label text
    .replace(/`([^`]+)`/g, "$1") // inline code -> text (prose generics like Foo<T> stay as-is)
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/[*_]{1,3}/g, "") // emphasis markers
    .replace(/\n{3,}/g, "\n\n") // collapse blank runs
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
