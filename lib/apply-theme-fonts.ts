import type { ThemeOption } from "@/lib/color-themes";

export const THEME_FONT_LINK_ID = "theme-fonts";

const FONT_VAR_KEYS = ["font-sans", "font-mono", "font-serif", "font-heading"] as const;

const GENERIC_FAMILIES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "cursive",
  "fantasy",
  "math",
  "emoji",
  "fangsong",
  "georgia",
  "courier new",
  "times new roman",
  "arial",
  "helvetica",
  "helvetica neue",
  "menlo",
  "monaco",
  "consolas",
]);

function parseFontFamily(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Skip anything that starts with a CSS var() reference — those are local
  // fonts already loaded via next/font.
  if (trimmed.startsWith("var(")) return null;

  const match = trimmed.match(/^["']?([^,"']+)/);
  const name = (match ? match[1] : (trimmed.split(",")[0] ?? "")).trim();
  if (!name) return null;
  if (GENERIC_FAMILIES.has(name.toLowerCase())) return null;
  return name;
}

function extractFontFamilies(theme: ThemeOption): string[] {
  const seen = new Set<string>();
  const families: string[] = [];

  for (const source of [theme.cssVars.light, theme.cssVars.dark]) {
    if (!source) continue;
    for (const key of FONT_VAR_KEYS) {
      const value = source[key];
      if (typeof value !== "string") continue;
      const family = parseFontFamily(value);
      if (family && !seen.has(family)) {
        seen.add(family);
        families.push(family);
      }
    }
  }
  return families;
}

function buildGoogleFontsUrl(families: string[]): string {
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function applyThemeFonts(doc: Document, theme: ThemeOption): void {
  const families = extractFontFamilies(theme);
  const existing = doc.getElementById(THEME_FONT_LINK_ID) as HTMLLinkElement | null;

  if (families.length === 0) {
    if (existing) existing.remove();
    return;
  }

  const href = buildGoogleFontsUrl(families);
  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }

  const link = doc.createElement("link");
  link.id = THEME_FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  doc.head.appendChild(link);
}
