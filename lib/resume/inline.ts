export type InlineSegment = { text: string; bold: boolean };

const SENTINEL = "\u0000";

export function parseInline(input: string): InlineSegment[] {
  const protectedInput = input.replace(/\\\*/g, SENTINEL);
  const segments: InlineSegment[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (const m of protectedInput.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) segments.push({ text: protectedInput.slice(last, idx), bold: false });
    segments.push({ text: m[1], bold: true });
    last = idx + m[0].length;
  }
  if (last < protectedInput.length) {
    segments.push({ text: protectedInput.slice(last), bold: false });
  }
  const out: InlineSegment[] = [];
  for (const s of segments) {
    const text = s.text.split(SENTINEL).join("*");
    if (text.length > 0) out.push({ text, bold: s.bold });
  }
  return out;
}
