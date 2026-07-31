"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { compileSvg } from "@/lib/resume/typst-engine";
import { cn } from "@/lib/utils";

interface TypstPreviewProps {
  source: string;
  className?: string;
}

const SHADOW_STYLE =
  ":host{display:block;color:#000}" +
  ".page{overflow:hidden;border-radius:0.375rem;background:#fff;" +
  "box-shadow:0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)}" +
  ".page + .page{margin-top:1rem}" +
  "svg{display:block;width:100%;height:auto}";

const A4_RATIO = 841.89 / 595.28;

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
      {busy ? (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-muted-foreground text-xs shadow-sm backdrop-blur">
          <Loader2 className="h-3 w-3 animate-spin" /> Rendering…
        </div>
      ) : null}
      {error ? (
        <div className="mx-auto max-w-md rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
          <p className="mb-1 font-medium">Couldn't render the résumé.</p>
          <pre className="wrap-break-word whitespace-pre-wrap font-mono text-xs opacity-80">
            {error}
          </pre>
        </div>
      ) : null}
      <div ref={hostRef} className={cn("mx-auto max-w-3xl", error && "hidden")} />
    </div>
  );
}
