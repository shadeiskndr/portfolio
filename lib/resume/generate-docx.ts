import { parseInline } from "./inline";
import type { ResumeData } from "./schema";

// Word (.docx) export. Unlike the PDF (Typst), this maps the model straight to
// Office Open XML via the `docx` library — real paragraphs, headings, and bullet
// lists, so it stays fully editable and ATS-parsable. It won't be pixel-identical
// to the Typst PDF, but it mirrors the structure and reading order. The library
// is dynamically imported so it only loads when the user exports Word.

// A4 in twips (1 inch = 1440), with margins matching the Typst layout.
const PAGE_W = 11906;
const MARGIN = { top: 652, bottom: 624, left: 737, right: 737 };
const TEXT_WIDTH = PAGE_W - MARGIN.left - MARGIN.right;

const FONT = "Georgia"; // universally available serif close to the PDF's Charter

export async function generateDocx(data: ResumeData): Promise<Blob> {
  const {
    BorderStyle,
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TabStopType,
    TextRun,
    WidthType,
  } = await import("docx");

  // text runs honoring the *bold* convention (shared with the Typst generator)
  const inlineRuns = (text: string, opts: { size?: number; italics?: boolean } = {}) =>
    parseInline(text).map(
      (seg) =>
        new TextRun({ text: seg.text, bold: seg.bold, italics: opts.italics, size: opts.size })
    );

  // right-aligned second field on the same line, via a right tab stop
  const twoCol = (
    left: { text: string; bold?: boolean; italics?: boolean },
    right: { text: string; italics?: boolean; size?: number },
    opts?: { spacingBefore?: number }
  ) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH }],
      spacing: { before: opts?.spacingBefore ?? 0, after: 0 },
      children: [
        new TextRun({ text: left.text, bold: left.bold, italics: left.italics }),
        new TextRun({ text: `\t${right.text}`, italics: right.italics, size: right.size }),
      ],
    });

  const sectionHeading = (title: string) =>
    new Paragraph({
      spacing: { before: 180, after: 60 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, space: 2, color: "000000" },
      },
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 22, characterSpacing: 12 }),
      ],
    });

  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 0, after: 20 },
      indent: { left: 620, hanging: 200 },
      children: inlineRuns(text, { size: 19 }),
    });

  const body: InstanceType<typeof Paragraph>[] = [];

  // ── Heading ── (name is larger, so build this line directly)
  body.push(
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH }],
      spacing: { after: 0 },
      children: [
        new TextRun({ text: data.name, bold: true, size: 32 }),
        new TextRun({ text: `\t${data.email}` }),
      ],
    })
  );
  body.push(twoCol({ text: data.location }, { text: data.phone }));

  // ── Summary ──
  if (data.summary.trim()) {
    body.push(sectionHeading("Professional Summary"));
    body.push(
      new Paragraph({ spacing: { after: 0 }, children: inlineRuns(data.summary, { size: 19 }) })
    );
  }

  // ── Core Competencies ──
  if (data.competencies.length > 0) {
    body.push(sectionHeading("Core Competencies"));
    body.push(
      new Paragraph({
        spacing: { after: 0 },
        children: inlineRuns(data.competencies.join("  ·  "), { size: 19 }),
      })
    );
  }

  // ── Work Experience ──
  if (data.experience.length > 0) {
    body.push(sectionHeading("Work Experience"));
    for (const e of data.experience) {
      if (e.roles.length === 1) {
        const r = e.roles[0];
        body.push(
          twoCol(
            { text: `•  ${e.firm}`, bold: true },
            { text: r.period, size: 18 },
            { spacingBefore: 140 }
          )
        );
        body.push(twoCol({ text: r.title, italics: true }, { text: e.location, italics: true }));
        for (const b of r.bullets) body.push(bullet(b));
      } else {
        body.push(
          twoCol(
            { text: `•  ${e.firm}`, bold: true },
            { text: e.location, size: 18 },
            { spacingBefore: 140 }
          )
        );
        for (const r of e.roles) {
          body.push(
            twoCol(
              { text: `    ${r.title}`, italics: true },
              { text: r.period, italics: true },
              { spacingBefore: 60 }
            )
          );
          for (const b of r.bullets) body.push(bullet(b));
        }
      }
    }
  }

  // ── Education ──
  if (data.education.length > 0) {
    body.push(sectionHeading("Education"));
    for (const ed of data.education) {
      body.push(
        twoCol(
          { text: `•  ${ed.degree}`, bold: true },
          { text: ed.period, size: 18 },
          { spacingBefore: 100 }
        )
      );
      body.push(
        twoCol({ text: ed.institution, italics: true }, { text: ed.location, italics: true })
      );
    }
  }

  // ── Systems & Technical Proficiency ──
  if (data.systems.length > 0) {
    body.push(sectionHeading("Systems & Technical Proficiency"));
    for (const s of data.systems) {
      body.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 220 },
          children: [
            new TextRun({ text: `${s.label}: `, bold: true, size: 19 }),
            ...inlineRuns(s.value, { size: 19 }),
          ],
        })
      );
    }
  }

  // ── References (two-column borderless table) ──
  const sectionChildren: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    ...body,
  ];
  const refCell = (r: ResumeData["references"][number] | null) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      margins: { top: 60, bottom: 60, right: 160 },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      children: r
        ? [
            new Paragraph({
              spacing: { after: 0 },
              children: [new TextRun({ text: r.name, bold: true, size: 19 })],
            }),
            new Paragraph({
              spacing: { after: 0 },
              children: [new TextRun({ text: r.role, size: 19 })],
            }),
            new Paragraph({
              spacing: { after: 0 },
              children: [new TextRun({ text: `${r.phone}  ·  ${r.email}`, size: 19 })],
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  if (data.references.length > 0) {
    sectionChildren.push(sectionHeading("References"));
    const rows: InstanceType<typeof TableRow>[] = [];
    for (let i = 0; i < data.references.length; i += 2) {
      rows.push(
        new TableRow({
          children: [refCell(data.references[i]), refCell(data.references[i + 1] ?? null)],
        })
      );
    }
    sectionChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows,
      })
    );
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 20 } } },
    },
    sections: [
      {
        properties: {
          page: { size: { width: PAGE_W, height: 16838 }, margin: MARGIN },
        },
        children: sectionChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
}
