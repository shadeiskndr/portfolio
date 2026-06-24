"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEEDS: { label: string; hue: number }[] = [
  { label: "Violet", hue: 292 },
  { label: "Blue", hue: 255 },
  { label: "Teal", hue: 185 },
  { label: "Green", hue: 145 },
  { label: "Amber", hue: 70 },
];

type Roles = Record<string, string>;

// A seed is not a theme: one hue generates a whole coordinated role set. Move
// the hue and every role moves together — the point of the post.
function scheme(h: number, c: number, dark: boolean): Roles {
  const ok = (l: number, ch: number) => `oklch(${l} ${ch} ${h})`;
  return dark
    ? {
        primary: ok(0.72, c),
        onPrimary: ok(0.22, c * 0.4),
        primaryContainer: ok(0.38, c * 0.8),
        onPrimaryContainer: ok(0.9, c * 0.4),
        surface: ok(0.21, 0.01),
        surfaceContainer: ok(0.26, 0.015),
        onSurface: ok(0.92, 0.01),
        onSurfaceVariant: ok(0.75, 0.02),
        outline: ok(0.55, 0.02),
      }
    : {
        primary: ok(0.55, c),
        onPrimary: ok(0.99, c * 0.1),
        primaryContainer: ok(0.9, c * 0.5),
        onPrimaryContainer: ok(0.3, c),
        surface: ok(0.99, 0.006),
        surfaceContainer: ok(0.95, 0.01),
        onSurface: ok(0.24, 0.02),
        onSurfaceVariant: ok(0.45, 0.02),
        outline: ok(0.62, 0.03),
      };
}

const ROLE_SWATCHES = [
  "primary",
  "primaryContainer",
  "surface",
  "surfaceContainer",
  "outline",
] as const;

/** Pick a seed hue and watch a full Material-style role set regenerate live. */
export function RuntimeThemeDemo() {
  const [hue, setHue] = useState(292);
  const [chroma, setChroma] = useState(0.15);
  const [dark, setDark] = useState(false);
  const r = scheme(hue, chroma, dark);

  return (
    <div className="my-6 rounded-xl border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {SEEDS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setHue(s.hue)}
            className={cn(
              "size-6 rounded-full border-2 transition-transform hover:scale-110",
              Math.abs(hue - s.hue) < 3 ? "border-foreground" : "border-transparent"
            )}
            style={{ backgroundColor: `oklch(0.6 0.16 ${s.hue})` }}
            aria-label={`Seed ${s.label}`}
          />
        ))}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setDark((d) => !d)}>
          {dark ? "Dark scheme" : "Light scheme"}
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-xs">
          <span className="w-20 shrink-0 text-muted-foreground">Hue {Math.round(hue)}°</span>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Seed hue"
          />
        </label>
        <label className="flex items-center gap-3 text-xs">
          <span className="w-20 shrink-0 text-muted-foreground">Chroma {chroma.toFixed(2)}</span>
          <input
            type="range"
            min={0.02}
            max={0.3}
            step={0.01}
            value={chroma}
            onChange={(e) => setChroma(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Seed chroma"
          />
        </label>
      </div>

      {/* Preview surface — every element reads a different generated role. */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: r.surface, borderColor: r.outline, color: r.onSurface }}
      >
        <p className="font-semibold text-sm" style={{ color: r.onSurface }}>
          Quarterly report
        </p>
        <p className="mt-1 text-xs" style={{ color: r.onSurfaceVariant }}>
          Every role — surface, container, outline, and each on-color — comes from the one seed.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-md px-3 py-1.5 font-medium text-xs"
            style={{ backgroundColor: r.primary, color: r.onPrimary }}
          >
            Filled
          </span>
          <span
            className="rounded-md px-3 py-1.5 font-medium text-xs"
            style={{ backgroundColor: r.primaryContainer, color: r.onPrimaryContainer }}
          >
            Tonal
          </span>
          <span
            className="rounded-md border px-3 py-1.5 font-medium text-xs"
            style={{ borderColor: r.outline, color: r.onSurfaceVariant }}
          >
            Outlined
          </span>
          <span
            className="ml-auto rounded-md px-2 py-1 text-xs"
            style={{ backgroundColor: r.surfaceContainer, color: r.onSurfaceVariant }}
          >
            container
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-1">
        {ROLE_SWATCHES.map((role) => (
          <div key={role} className="flex-1">
            <div
              className="h-6 rounded"
              style={{ backgroundColor: r[role], border: "1px solid var(--color-border)" }}
            />
            <p className="mt-1 truncate text-[10px] text-muted-foreground">{role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
