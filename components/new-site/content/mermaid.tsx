"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getThemeSnapshot = () => document.documentElement.classList.contains("dark");
const getServerThemeSnapshot = () => false;

function useIsDark() {
  return useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
}

function MermaidCanvas({
  chart,
  dark,
  className,
}: {
  chart: string;
  dark: boolean;
  className?: string;
}) {
  const id = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useMountEffect(() => {
    let cancelled = false;
    import("mermaid").then(({ default: mermaid }) => {
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: dark ? "dark" : "default",
        securityLevel: "strict",
        fontFamily: "inherit",
      });
      mermaid
        .render(id, chart.trim())
        .then(({ svg: rendered }) => {
          if (!cancelled) setSvg(rendered);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    });
    return () => {
      cancelled = true;
    };
  });

  if (error) {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm">
        {chart.trim()}
      </pre>
    );
  }

  return (
    <div
      className={cn(
        "my-6 flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full",
        className
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid output, rendered with securityLevel "strict"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

export function Mermaid({ chart, className }: { chart: string; className?: string }) {
  const dark = useIsDark();
  return (
    <MermaidCanvas
      key={`${dark ? "dark" : "light"}:${chart}`}
      chart={chart}
      dark={dark}
      className={className}
    />
  );
}
