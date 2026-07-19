import type { Education, Experience, Reference, ResumeData, SystemGroup } from "./schema";
import { resumeSchema } from "./schema";

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

function readArgs(src: string, from: number, n: number): { args: string[]; end: number } {
  const args: string[] = [];
  let i = from;
  for (let k = 0; k < n; k++) {
    while (i < src.length && /\s/.test(src.charAt(i))) i++;
    if (src[i] !== "{") throw new Error(`Expected '{' for argument ${k + 1}`);
    const { content, end } = matchBalanced(src, i);
    args.push(content);
    i = end;
  }
  return { args, end: i };
}

function extractEmail(s: string): string {
  const href = s.match(/\\href\{mailto:([^}]*)\}/);
  if (href?.[1]) return href[1].trim();
  const plain = s.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return plain ? plain[0] : "";
}

function delatex(input: string, opts: { bold?: boolean } = {}): string {
  let s = input;
  s = s.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");
  if (opts.bold) s = s.replace(/\\textbf\s*\{([^{}]*)\}/g, "*$1*");
  const fmt =
    /\\(?:textbf|textit|emph|textsc|textrm|mbox|underline|small|Large|large|scshape|itshape|bfseries)\s*\{([^{}]*)\}/g;
  for (let i = 0; i < 8 && fmt.test(s); i++) s = s.replace(fmt, "$1");
  s = s.replace(/\$\\cdot\$/g, "·").replace(/\$\\circ\$/g, "◦");
  s = s.replace(/---/g, "—").replace(/--/g, "–");
  s = s.replace(/\\\\/g, " ").replace(/~/g, " ");
  s = s
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/\\\$/g, "$")
    .replace(/\\\{/g, "")
    .replace(/\\\}/g, "");
  s = s.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^{}]*\})?/g, "");
  s = s.replace(/[{}]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

const ARG_COUNT: Record<string, number> = {
  resumeSubheading: 4,
  subheadingSingle: 2,
  resumeSubSubheading: 2,
  resumeSubRole: 2,
  resumeItem: 1,
  resumeItemWithHeading: 2,
  resumeItemTwoFields: 2,
};
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
    if (!cmd) break;
    const argCount = ARG_COUNT[cmd] ?? 0;
    let args: string[];
    let end: number;
    try {
      ({ args, end } = readArgs(body, m.index + m[0].length, argCount));
    } catch {
      i = m.index + m[0].length;
      continue;
    }
    i = end;

    if (cmd === "resumeSubheading") {
      role = { title: delatex(args[2] ?? ""), period: delatex(args[1] ?? ""), bullets: [] };
      current = { firm: delatex(args[0] ?? ""), location: delatex(args[3] ?? ""), roles: [role] };
      employers.push(current);
    } else if (cmd === "subheadingSingle") {
      current = { firm: delatex(args[0] ?? ""), location: delatex(args[1] ?? ""), roles: [] };
      role = null;
      employers.push(current);
    } else if (cmd === "resumeSubSubheading" || cmd === "resumeSubRole") {
      role = { title: delatex(args[0] ?? ""), period: delatex(args[1] ?? ""), bullets: [] };
      if (current) current.roles.push(role);
    } else if (cmd === "resumeItem") {
      if (role) role.bullets.push(delatex(args[0] ?? "", { bold: true }));
    } else if (cmd === "resumeItemWithHeading" || cmd === "resumeItemTwoFields") {
      const joiner = cmd === "resumeItemTwoFields" ? ": " : " ";
      if (role)
        role.bullets.push(delatex(`${args[0] ?? ""}${joiner}${args[1] ?? ""}`, { bold: true }));
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
        degree: delatex(args[0] ?? ""),
        period: delatex(args[1] ?? ""),
        institution: delatex(args[2] ?? ""),
        location: delatex(args[3] ?? ""),
      });
    } catch {}
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
  let inner = head;
  const bt = head.indexOf("\\begin{tabular*}");
  if (bt >= 0) {
    try {
      const { end } = readArgs(head, bt + "\\begin{tabular*}".length, 2);
      const stop = head.indexOf("\\end{tabular*}", end);
      inner = head.slice(end, stop >= 0 ? stop : undefined);
    } catch {}
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

export function parseTex(source: string): ResumeData {
  const src = stripComments(source);
  const docStart = src.indexOf("\\begin{document}");
  const region = docStart >= 0 ? src.slice(docStart) : src;

  const secRe = /\\section\{([^}]*)\}/g;
  const secs: { title: string; matchStart: number; contentStart: number }[] = [];
  for (const m of region.matchAll(secRe)) {
    secs.push({
      title: delatex(m[1] ?? "").toLowerCase(),
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
    const sec = idx < 0 ? undefined : secs[idx];
    if (!sec) return "";
    const start = sec.contentStart;
    const next = secs[idx + 1];
    const end = next ? next.matchStart : docEnd >= 0 ? docEnd : region.length;
    return region.slice(start, end);
  };

  const heading = parseHeading(region.slice(0, secs[0]?.matchStart ?? 0));

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

  return resumeSchema.parse(draft);
}
