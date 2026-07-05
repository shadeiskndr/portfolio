import { parseInline } from "./inline";
import type { Education, Experience, Reference, ResumeData, SystemGroup } from "./schema";

// ── escaping ────────────────────────────────────────────────────────────────
// A Typst *string literal* built from arbitrary text. Rendering a string inside
// content shows it verbatim — no markup is parsed — so neutralising #, $, *, _,
// @, [], `, etc. reduces to escaping just backslash and double-quote. This is
// what makes it safe to interpolate untrusted form input into the template.
function S(text: string): string {
  return `"${text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, " ")}"`;
}

/** Content block that renders a string verbatim: `[#("…")]`. */
function C(text: string): string {
  return `[#(${S(text)})]`;
}

/** Inline markup honoring the *bold* convention, for a markup context. */
function inlineMarkup(text: string): string {
  return parseInline(text)
    .map((seg) => (seg.bold ? `#strong(${S(seg.text)})` : `#(${S(seg.text)})`))
    .join("");
}

/** Same, wrapped as a content block `[…]` (list items, text bodies). */
function inlineContent(text: string): string {
  return `[${inlineMarkup(text)}]`;
}

// ── sections ────────────────────────────────────────────────────────────────

function heading(d: ResumeData): string {
  return `#hrow(
  text(size: 16pt, weight: "bold", ${S(d.name)}),
  link(${S(`mailto:${d.email}`)})[#(${S(d.email)})],
)
#v(-0.5pt)
#hrow(${C(d.location)}, ${C(d.phone)})`;
}

function bulletsCall(items: string[]): string {
  if (items.length === 0) return "";
  const list = items.map(inlineContent).join(", ");
  return `\n  #bullets((${list},))`;
}

function experienceBlock(e: Experience): string {
  // Single role: date sits on the firm line, location on the role line.
  // Multiple roles: location sits on the firm line, each role carries its date.
  if (e.roles.length === 1) {
    const r = e.roles[0];
    return `#block(above: 7pt, below: 7pt)[
  #firmline(${S(e.firm)}, ${S(r.period)})
  #roleline(${S(r.title)}, ${S(e.location)})${bulletsCall(r.bullets)}
]`;
  }
  const roles = e.roles
    .map((r, i) => {
      const spacer = i > 0 ? "\n  #v(4pt)" : "";
      return `${spacer}\n  #roleline(${S(r.title)}, ${S(r.period)})${bulletsCall(r.bullets)}`;
    })
    .join("");
  return `#block(above: 7pt, below: 7pt)[
  #firmline(${S(e.firm)}, ${S(e.location)})${roles}
]`;
}

function educationBlock(e: Education, i: number): string {
  const above = i === 0 ? 7 : 6;
  return `#block(above: ${above}pt, below: 7pt)[
  #firmline(${S(e.degree)}, ${S(e.period)})
  #roleline(${S(e.institution)}, ${S(e.location)})
]`;
}

function systemsBody(rows: SystemGroup[]): string {
  return rows
    .map((s, i) => {
      const br = i < rows.length - 1 ? " \\" : "";
      return `#strong(${S(s.label)}): ${inlineMarkup(s.value)}${br}`;
    })
    .join("\n    ");
}

function referenceCell(r: Reference): string {
  return `[#strong(${S(r.name)}) \\
    #(${S(r.role)}) \\
    #(${S(r.phone)}) · #link(${S(`mailto:${r.email}`)})[#(${S(r.email)})]]`;
}

// ── document ────────────────────────────────────────────────────────────────

const PREAMBLE = (
  d: ResumeData
) => `#set document(title: ${S(`${d.name} — Résumé`)}, author: ${S(d.name)})
#set page(paper: "a4", margin: (x: 1.3cm, top: 1.15cm, bottom: 1.1cm))
#set text(font: "XCharter", size: 10pt, lang: "en")
#set par(justify: false, leading: 0.5em, spacing: 0.5em)
#show link: set text(fill: black)

#let sec(title) = {
  v(5.5pt)
  text(size: 12.5pt)[#smallcaps(title)]
  v(1.5pt)
  line(length: 100%, stroke: 0.5pt)
  v(0.5pt)
}
#let dt(d) = text(size: 9pt)[#d]
#let hrow(l, r) = grid(columns: (1fr, auto), column-gutter: 8pt, align: (left, right), l, r)
#let bullets(items) = pad(left: 1.55em, top: 1.5pt)[
  #set text(size: 9.7pt)
  #list(marker: text(size: 8pt)[◦], indent: 0pt, body-indent: 0.5em, spacing: 3.4pt, tight: true, ..items)
]
#let firmline(firm, right) = hrow([• #strong(firm)], dt(right))
#let roleline(role, right) = hrow([#h(1.1em)#emph(role)], emph(right))`;

/**
 * Turn résumé data into a self-contained Typst document. Ported from the
 * browser-verified `nina-web.typ`; the fixed section titles are structural
 * (not user-editable), everything else flows from `data`.
 */
export function generateTypst(data: ResumeData): string {
  // Each section is emitted only when it has content — an imported or partial
  // résumé may lack, say, references, and an empty grid/section is invalid Typst.
  const parts: string[] = [PREAMBLE(data), "", heading(data), ""];

  if (data.summary.trim()) {
    parts.push(
      "#sec[Professional Summary]",
      `#text(size: 9.7pt)${inlineContent(data.summary)}`,
      ""
    );
  }
  if (data.competencies.length > 0) {
    parts.push(
      "#sec[Core Competencies]",
      `#text(size: 9.7pt)${inlineContent(data.competencies.join(" · "))}`,
      ""
    );
  }
  if (data.experience.length > 0) {
    parts.push("#sec[Work Experience]", "", data.experience.map(experienceBlock).join("\n\n"), "");
  }
  if (data.education.length > 0) {
    parts.push("#sec[Education]", data.education.map(educationBlock).join("\n"), "");
  }
  if (data.systems.length > 0) {
    parts.push(
      "#sec[Systems & Technical Proficiency]",
      "#set par(spacing: 4.2pt)",
      `#pad(left: 0.15in)[
  #text(size: 9.7pt)[
    ${systemsBody(data.systems)}
  ]
]`,
      ""
    );
  }
  if (data.references.length > 0) {
    parts.push(
      "#sec[References]",
      "#set par(spacing: 0.5em)",
      `#text(size: 9.7pt)[
  #grid(columns: (1fr, 1fr), column-gutter: 1.2em, row-gutter: 8pt,
    ${data.references.map(referenceCell).join(",\n    ")},
  )
]`,
      ""
    );
  }
  return parts.join("\n");
}
