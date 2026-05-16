import type { ThemeCSSVars, ThemeOption } from "@/lib/color-themes";

export const THEME_VARS_STYLE_ID = "theme-vars";

const VALID_CSS_VAR_NAME = /^[a-z0-9-]+$/i;

function toCSSVars(vars: ThemeCSSVars | undefined, indent = "  "): string {
  if (!vars) return "";
  return Object.entries(vars)
    .filter(([k, v]) => typeof v === "string" && v.trim() && VALID_CSS_VAR_NAME.test(k))
    .map(([k, v]) => `${indent}--${k}: ${v.trim()};`)
    .join("\n");
}

export function buildThemeCSSText(theme: ThemeOption): string {
  const { light, dark } = theme.cssVars;
  return `:root {\n${toCSSVars(light)}\n}\n\n.dark {\n${toCSSVars(dark)}\n}\n`;
}

export function applyThemeCSSVars(doc: Document, theme: ThemeOption): void {
  let el = doc.getElementById(THEME_VARS_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = doc.createElement("style");
    el.id = THEME_VARS_STYLE_ID;
    doc.head.appendChild(el);
  }
  el.textContent = buildThemeCSSText(theme);
}
