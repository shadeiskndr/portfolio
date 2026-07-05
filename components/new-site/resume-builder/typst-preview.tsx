"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { compileSvg } from "@/lib/resume/typst-engine";
import { cn } from "@/lib/utils";

interface TypstPreviewProps {
  /** The Typst document source. Recompiled (debounced) whenever it changes. */
  source: string;
  className?: string;
}

// Styles applied to the injected document SVG. These live inside the shadow root
// (see below) rather than as Tailwind `[&_svg]` utilities on a light-DOM element,
// because the SVG is rendered in a shadow tree that page CSS can't reach. Each
// `.page` is one A4 sheet — always white paper with dark ink (the résumé is a
// document), regardless of the app's light/dark theme; multi-page documents stack
// them with a gap so they read like a PDF, not one long strip.
const SHADOW_STYLE =
  ":host{display:block;color:#000}" +
  ".page{overflow:hidden;border-radius:0.375rem;background:#fff;" +
  "box-shadow:0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)}" +
  ".page + .page{margin-top:1rem}" +
  "svg{display:block;width:100%;height:auto}";

// A4 aspect ratio (595.28 × 841.89 pt). generate.ts always sets `paper: "a4"`, so
// every page is exactly this tall — used to give each split page a full-sheet
// viewBox regardless of any inter-page gap in the combined SVG.
const A4_RATIO = 841.89 / 595.28;

// Typst renders a multi-page document as ONE <svg> with the pages (`g.typst-page`)
// stacked vertically. Split it into one standalone svg per page so each shows as
// its own sheet, like a PDF viewer, instead of a single long sheet under one
// shared background + shadow. Single-page documents pass through unchanged.
//
// The SVG is parsed via a detached element's innerHTML (HTML parsing) — the same
// lenient path it's ultimately injected through — NOT DOMParser("image/svg+xml"),
// because Typst's raw output isn't well-formed XML (it declares an h5: namespace,
// embeds a <script>, etc.) and strict XML parsing fails on it.
function splitTypstPages(svgString: string): string[] {
  try {
    const holder = document.createElement("div");
    holder.innerHTML = svgString;
    const svg = holder.querySelector("svg");
    if (!svg) return [svgString];
    const pages = Array.from(svg.getElementsByClassName("typst-page"));
    if (pages.length <= 1) return [svgString];

    const viewBox = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
    const width = viewBox[2] || Number(svg.getAttribute("width")) || 596;
    const pageHeight = width * A4_RATIO;

    return pages.map((_, i) => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      // Keep only page i (reset its offset to the sheet origin); drop the rest.
      for (const [j, g] of Array.from(clone.getElementsByClassName("typst-page")).entries()) {
        if (j === i) g.setAttribute("transform", "translate(0, 0)");
        else g.remove();
      }
      for (const s of Array.from(clone.querySelectorAll("script"))) s.remove();
      clone.setAttribute("viewBox", `0 0 ${width} ${pageHeight}`);
      clone.setAttribute("width", String(width));
      clone.setAttribute("height", String(pageHeight));
      return clone.outerHTML;
    });
  } catch {
    return [svgString];
  }
}

// Live vector preview: compiles the Typst source to SVG in the browser and injects
// it into a shadow root. The shadow boundary is load-bearing — Typst's SVG output
// carries a *document-scoped* `<style>` (notably `svg { fill: none }`). Injected
// into the light DOM that rule leaks page-wide and erases every other <svg>,
// including the sidebar's fill-based brand icons. The shadow root contains it.
// (The markup is engine output — typed text becomes vector glyphs, not HTML — so
// injecting it is not a script-injection surface.)
export function TypstPreview({ source, className }: TypstPreviewProps) {
  const [debounced] = useDebounceValue(source, 250);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    compileSvg(debounced)
      .then((out) => {
        if (cancelled) return;
        setError(null);
        const host = hostRef.current;
        if (!host) return;
        const root = shadowRef.current ?? host.attachShadow({ mode: "open" });
        shadowRef.current = root;
        const pages = splitTypstPages(out)
          .map((p) => `<div class="page">${p}</div>`)
          .join("");
        root.innerHTML = `<style>${SHADOW_STYLE}</style>${pages}`;
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className={cn("relative p-4 sm:p-6", className)}>
      {busy && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-muted-foreground text-xs shadow-sm backdrop-blur">
          <Loader2 className="h-3 w-3 animate-spin" /> Rendering…
        </div>
      )}
      {error && (
        <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
          <p className="mb-1 font-medium">Couldn't render the résumé.</p>
          <pre className="wrap-break-word whitespace-pre-wrap font-mono text-xs opacity-80">
            {error}
          </pre>
        </div>
      )}
      {/* Shadow-root host. Always mounted (hidden on error) so the shadow root and
          its compiled SVG survive an error toggle. */}
      <div ref={hostRef} className={cn("mx-auto max-w-3xl", error && "hidden")} />
    </div>
  );
}
