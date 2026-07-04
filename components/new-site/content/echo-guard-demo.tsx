"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Origin = "chart" | "grid";

/**
 * One value edited from two surfaces. The chart carries local view state (zoom)
 * that a rebuild would clobber — so it must skip the echo of its own write.
 */
export function EchoGuardDemo() {
  const [value, setValue] = useState(50);
  const [zoom, setZoom] = useState(1.6);
  const [guard, setGuard] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [clobbers, setClobbers] = useState(0);

  // The mechanism from the post: a monotonic generation counter, and a record
  // of which origin produced which generation.
  const generation = useRef(0);
  const producedBy = useRef(new Map<Origin, number>());

  const commit = (next: number, origin: Origin) => {
    generation.current += 1;
    producedBy.current.set(origin, generation.current);
    setValue(next);

    // The store notifies every surface; the chart rebuilds unless this emission
    // is the echo of its own write.
    if (origin === "chart") {
      const isOwnEcho = producedBy.current.get("chart") === generation.current;
      if (guard && isOwnEcho) {
        setSkipped((n) => n + 1); // skip → live zoom is preserved
      } else {
        setZoom(1); // rebuild resets the view — the clobber
        setClobbers((n) => n + 1);
      }
    }
  };

  const reset = () => {
    setValue(50);
    setZoom(1.6);
    setSkipped(0);
    setClobbers(0);
    generation.current = 0;
    producedBy.current.clear();
  };

  return (
    <div className="my-6 rounded-xl border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={guard ? "default" : "outline"}
          onClick={() => setGuard((g) => !g)}
        >
          {guard ? "Echo guard: on" : "Echo guard: off"}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
        <span className="ml-auto flex gap-3 font-mono text-xs">
          <span className="text-red-600 dark:text-red-400">clobbers {clobbers}</span>
          <span className="text-emerald-600 dark:text-emerald-400">skipped {skipped}</span>
        </span>
      </div>

      {/* Chart surface — a bar whose view is scaled by a local zoom. */}
      <div className="rounded-lg border p-3">
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Chart surface (holds live zoom)
        </p>
        <div className="flex h-24 items-end overflow-hidden rounded bg-muted/40 p-2">
          <div
            className="w-full origin-bottom transition-transform"
            style={{ transform: `scaleY(${zoom})` }}
          >
            <div
              className="rounded-t bg-primary transition-[height]"
              style={{ height: `${value * 0.6}px` }}
            />
          </div>
        </div>
        <label className="mt-2 flex items-center gap-3 text-xs">
          <span className="w-24 shrink-0 text-muted-foreground">Value (drag)</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => commit(Number(e.target.value), "chart")}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Chart value"
          />
        </label>
        <label className="mt-2 flex items-center gap-3 text-xs">
          <span className="w-24 shrink-0 text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Chart zoom"
          />
        </label>
      </div>

      {/* Grid surface — edits the same value, no protected view state. */}
      <div className="mt-3 rounded-lg border p-3">
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Grid surface
        </p>
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            // Guard the parse: a cleared field keeps the current value and
            // partial input (NaN) is ignored, rather than storing 0/NaN.
            const next = raw === "" ? value : Number(raw);
            if (Number.isNaN(next)) return;
            commit(next, "grid");
          }}
          className="w-24 rounded-md border bg-transparent px-2 py-1 font-mono text-sm outline-none"
          aria-label="Grid value"
        />
      </div>

      <p className="mt-3 text-muted-foreground text-xs">
        Set a zoom, then drag the chart value. Guard off: every self-echo rebuilds the chart and
        snaps zoom back to 1. Guard on: the chart recognizes its own write and keeps your view.
      </p>
    </div>
  );
}
