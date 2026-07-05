import type { Education, Experience, Reference, ResumeData, SystemGroup } from "./schema";
import { resumeSchema } from "./schema";

// Import a résumé from LaTeX. This is NOT a general LaTeX parser — it targets the
// macro grammar of the `nina-resume2.tex` template family (`\resumeSubheading`,
// `\subheadingSingle` + `\resumeSubSubheading`/`\resumeSubRole`, `\resumeItem`,
// `\section{}`, the two-minipage references block). Résumés built from that
// template round-trip; anything else degrades gracefully (unknown sections are
// skipped, and the result is normalised through the zod schema).

// ── low-level LaTeX helpers ──────────────────────────────────────────────────

/** Strip `%` comments, honouring escaped `\%`. */
function stripComments(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      let out = "";
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "\\") {
          out += line[i] + (line[i + 1] ?? "");
          i++;
          continue;
        }
        if (line[i] === "%") break;
        out += line[i];
      }
      return out;
    })
    .join("\n");
}

/** Given the index of a `{`, return the balanced group content and the index past `}`. */
function matchBalanced(src: string, open: number): { content: string; end: number } {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { content: src.slice(open + 1, i), end: i + 1 };
    }
  }
  throw new Error("Unbalanced braces in .tex");
}

/** Read `n` consecutive `{…}` groups starting at `from` (skipping whitespace). */
function readArgs(src: string, from: number, n: number): { args: string[]; end: number } {
  const args: string[] = [];
  let i = from;
  for (let k = 0; k < n; k++) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== "{") throw new Error(`Expected '{' for argument ${k + 1}`);
    const { content, end } = matchBalanced(src, i);
    args.push(content);
    i = end;
  }
  return { args, end: i };
}

function extractEmail(s: string): string {
  const href = s.match(/\\href\{mailto:([^}]*)\}/);
  if (href) return href[1].trim();
  const plain = s.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return plain ? plain[0] : "";
}

/**
 * Convert an inline LaTeX fragment to plain text. With `bold: true`, `\textbf{…}`
 * is preserved as the *bold* convention instead of being flattened away.
 */
function delatex(input: string, opts: { bold?: boolean } = {}): string {
  let s = input;
  // hyperlinks → display text
  s = s.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");
  // bold → *convention* (before the generic unwrap would strip it)
  if (opts.bold) s = s.replace(/\\textbf\s*\{([^{}]*)\}/g, "*$1*");
  // unwrap the remaining formatting commands from the inside out
  const fmt =
    /\\(?:textbf|textit|emph|textsc|textrm|mbox|underline|small|Large|large|scshape|itshape|bfseries)\s*\{([^{}]*)\}/g;
  for (let i = 0; i < 8 && fmt.test(s); i++) s = s.replace(fmt, "$1");
  // math separators
  s = s.replace(/\$\\cdot\$/g, "·").replace(/\$\\circ\$/g, "◦");
  // dashes (order matters: --- before --)
  s = s.replace(/---/g, "—").replace(/--/g, "–");
  // line breaks / nbsp
  s = s.replace(/\\\\/g, " ").replace(/~/g, " ");
  // escaped specials
  s = s
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/\\\$/g, "$")
    .replace(/\\\{/g, "")
    .replace(/\\\}/g, "");
  // remove any leftover commands (with optional [..]/{..} arguments)
  s = s.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^{}]*\})?/g, "");
  // strip stray braces
  s = s.replace(/[{}]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

// ── section walker ───────────────────────────────────────────────────────────

const ARG_COUNT: Record<string, number> = {
  resumeSubheading: 4,
  subheadingSingle: 2,
  resumeSubSubheading: 2,
  resumeSubRole: 2,
  resumeItem: 1,
  resumeItemWithHeading: 2,
  resumeItemTwoFields: 2,
};
// longer names first so alternation is unambiguous
const MACRO_RE =
  /\\(resumeSubSubheading|resumeSubheading|subheadingSingle|resumeSubRole|resumeItemWithHeading|resumeItemTwoFields|resumeItem)(?![a-zA-Z])/g;

function parseExperience(body: string): Experience[] {
  const employers: Experience[] = [];
  let current: Experience | null = null;
  let role: Experience["roles"][number] | null = null;
  let i = 0;
  while (true) {
    MACRO_RE.lastIndex = i;
    const m = MACRO_RE.exec(body);
    if (!m) break;
    const cmd = m[1];
    let args: string[];
    let end: number;
    try {
      ({ args, end } = readArgs(body, m.index + m[0].length, ARG_COUNT[cmd]));
    } catch {
      i = m.index + m[0].length;
      continue;
    }
    i = end;

    if (cmd === "resumeSubheading") {
      role = { title: delatex(args[2]), period: delatex(args[1]), bullets: [] };
      current = { firm: delatex(args[0]), location: delatex(args[3]), roles: [role] };
      employers.push(current);
    } else if (cmd === "subheadingSingle") {
      current = { firm: delatex(args[0]), location: delatex(args[1]), roles: [] };
      role = null;
      employers.push(current);
    } else if (cmd === "resumeSubSubheading" || cmd === "resumeSubRole") {
      role = { title: delatex(args[0]), period: delatex(args[1]), bullets: [] };
      if (current) current.roles.push(role);
    } else if (cmd === "resumeItem") {
      if (role) role.bullets.push(delatex(args[0], { bold: true }));
    } else if (cmd === "resumeItemWithHeading" || cmd === "resumeItemTwoFields") {
      const joiner = cmd === "resumeItemTwoFields" ? ": " : " ";
      if (role) role.bullets.push(delatex(args[0] + joiner + args[1], { bold: true }));
    }
  }
  return employers.filter((e) => e.roles.length > 0);
}

function parseEducation(body: string): Education[] {
  const out: Education[] = [];
  const re = /\\resumeSubheading(?![a-zA-Z])/g;
  for (const m of body.matchAll(re)) {
    try {
      const { args } = readArgs(body, m.index + m[0].length, 4);
      out.push({
        degree: delatex(args[0]),
        period: delatex(args[1]),
        institution: delatex(args[2]),
        location: delatex(args[3]),
      });
    } catch {
      // skip malformed entry
    }
  }
  return out;
}

function parseSystems(body: string): SystemGroup[] {
  const out: SystemGroup[] = [];
  const chunks = body.split(/\\item\[\]/).slice(1);
  for (const chunk of chunks) {
    const bIdx = chunk.indexOf("\\textbf{");
    if (bIdx < 0) continue;
    const { content, end } = matchBalanced(chunk, bIdx + "\\textbf".length);
    const label = delatex(content).replace(/:\s*$/, "");
    const value = delatex(chunk.slice(end));
    if (label || value) out.push({ label, value });
  }
  return out;
}

function parseReferences(body: string): Reference[] {
  const out: Reference[] = [];
  const panes = body.match(/\\begin\{minipage\}[\s\S]*?\\end\{minipage\}/g) ?? [body];
  for (const pane of panes) {
    const items = pane.split(/\\item(?![a-zA-Z])/).slice(1);
    for (const item of items) {
      const bIdx = item.indexOf("\\textbf{");
      if (bIdx < 0) continue;
      const { content, end } = matchBalanced(item, bIdx + "\\textbf".length);
      const name = delatex(content);
      const lines = item.slice(end).split(/\\\\/);
      const role = delatex(lines[1] ?? "");
      const contactRaw = lines[2] ?? "";
      const phone = delatex(contactRaw.split(/\$\\cdot\$/)[0] ?? "");
      const email = extractEmail(contactRaw);
      if (name) out.push({ name, role, phone, email });
    }
  }
  return out;
}

function parseHeading(head: string): Pick<ResumeData, "name" | "email" | "phone" | "location"> {
  // Skip past `\begin{tabular*}{width}{colspec}` so the column spec (e.g.
  // `l@{\extracolsep{\fill}}r`) doesn't leak into the first cell.
  let inner = head;
  const bt = head.indexOf("\\begin{tabular*}");
  if (bt >= 0) {
    try {
      const { end } = readArgs(head, bt + "\\begin{tabular*}".length, 2);
      const stop = head.indexOf("\\end{tabular*}", end);
      inner = head.slice(end, stop >= 0 ? stop : undefined);
    } catch {
      // fall back to the whole heading region
    }
  }
  const rows = inner.split(/\\\\/);
  const cells = (row: string) => (row ?? "").split(/(?<!\\)&/);
  const [nameCell, emailCell] = cells(rows[0] ?? "");
  const [locCell, phoneCell] = cells(rows[1] ?? "");
  return {
    name: delatex(nameCell ?? ""),
    email: extractEmail(emailCell ?? "") || delatex(emailCell ?? ""),
    location: delatex(locCell ?? ""),
    phone: delatex(phoneCell ?? ""),
  };
}

// ── entry point ──────────────────────────────────────────────────────────────

export function parseTex(source: string): ResumeData {
  const src = stripComments(source);
  const docStart = src.indexOf("\\begin{document}");
  const region = docStart >= 0 ? src.slice(docStart) : src;

  const secRe = /\\section\{([^}]*)\}/g;
  const secs: { title: string; matchStart: number; contentStart: number }[] = [];
  for (const m of region.matchAll(secRe)) {
    secs.push({
      title: delatex(m[1]).toLowerCase(),
      matchStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }
  if (secs.length === 0) {
    throw new Error("No \\section{…} found — this doesn't look like a résumé .tex.");
  }

  const docEnd = region.indexOf("\\end{document}");
  const bodyOf = (needle: string): string => {
    const idx = secs.findIndex((s) => s.title.includes(needle));
    if (idx < 0) return "";
    const start = secs[idx].contentStart;
    const end =
      idx + 1 < secs.length ? secs[idx + 1].matchStart : docEnd >= 0 ? docEnd : region.length;
    return region.slice(start, end);
  };

  const heading = parseHeading(region.slice(0, secs[0].matchStart));

  const draft: ResumeData = {
    ...heading,
    summary: delatex(bodyOf("summary"), { bold: true }),
    competencies: bodyOf("competencies")
      .split(/\$\\cdot\$/)
      .map((c) => delatex(c))
      .filter(Boolean),
    experience: parseExperience(bodyOf("experience") || bodyOf("work")),
    education: parseEducation(bodyOf("education")),
    systems: parseSystems(bodyOf("systems") || bodyOf("technical")),
    references: parseReferences(bodyOf("references")),
  };

  // normalise (fills defaults, enforces shape); throws only on a genuinely broken result
  return resumeSchema.parse(draft);
}
