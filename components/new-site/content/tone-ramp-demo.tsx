"use client";

import { useState } from "react";

const TONES = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];

// One constant threshold picks the text color on every swatch of both ramps.
const textForTone = (tone: number) => (tone >= 60 ? "#111827" : "#ffffff");

function Ramp({
  label,
  swatch,
  note,
}: {
  label: string;
  swatch: (tone: number) => string;
  note: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1.5 font-medium text-xs">{label}</p>
      <div className="flex overflow-hidden rounded-lg border">
        {TONES.map((tone) => (
          <div
            key={tone}
            className="flex h-14 flex-1 items-center justify-center"
            style={{ backgroundColor: swatch(tone), color: textForTone(tone) }}
          >
            <span className="font-medium text-xs">Aa</span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-muted-foreground text-xs">{note}</p>
    </div>
  );
}

/**
 * Illustrates tone-as-contrast-axis with CSS OKLCH lightness (the same
 * principle HCT's tone gives you) against naive HSL lightness.
 */
export function ToneRampDemo() {
  const [hue, setHue] = useState(90);
  const [chroma, setChroma] = useState(0.12);

  return (
    <div className="my-6 rounded-xl border p-4">
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
            aria-label="Hue"
          />
        </label>
        <label className="flex items-center gap-3 text-xs">
          <span className="w-20 shrink-0 text-muted-foreground">Chroma {chroma.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.01}
            value={chroma}
            onChange={(e) => setChroma(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Chroma"
          />
        </label>
      </div>

      <Ramp
        label="By tone — OKLCH lightness (perceptual)"
        swatch={(tone) => `oklch(${tone / 100} ${chroma} ${hue})`}
        note="Text picked by one constant tone threshold. Drag hue — every step stays readable."
      />
      <Ramp
        label="By HSL lightness (naive)"
        swatch={(tone) => `hsl(${hue} 65% ${tone}%)`}
        note="Same threshold, but HSL 'lightness' ≠ perceived lightness — contrast wobbles with hue."
      />
    </div>
  );
}
