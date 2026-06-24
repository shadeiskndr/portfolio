"use client";

import { useRef, useState } from "react";
import { Brush, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useResizeObserver } from "@/hooks/use-resize-observer";

// Deterministic, illustrative signals sharing one time axis — generic
// market-style series, nothing domain-specific. A closed form (not random)
// keeps the render identical on every reload.
const DATA = Array.from({ length: 36 }, (_, i) => {
  const t = i / 5;
  return {
    t: `T${i + 1}`,
    price: Math.round(100 + 18 * Math.sin(t) + 6 * Math.cos(t * 2.3) + i * 0.4),
    vol: Math.round(20 + 8 * Math.abs(Math.sin(t * 1.7)) + 4 * Math.cos(t)),
    volume: Math.round(520 + 220 * Math.abs(Math.sin(t * 0.9 + 1)) + 40 * Math.cos(t * 2)),
  };
});

const TOOLTIP_STYLE = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function Panel({
  title,
  dataKey,
  color,
  synced,
  showAxis = false,
}: {
  title: string;
  dataKey: string;
  color: string;
  synced: boolean;
  showAxis?: boolean;
}) {
  // Measure the container ourselves and hand recharts explicit numeric
  // dimensions — ResponsiveContainer warns on its first (-1×-1) render.
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver({ ref });
  const height = showAxis ? 128 : 84;

  return (
    <div>
      <div className="mb-1 flex items-center gap-2 px-1 text-muted-foreground text-xs">
        <span className="size-2 rounded-full" style={{ background: color }} />
        <span className="font-medium">{title}</span>
      </div>
      <div ref={ref} style={{ height }}>
        {width ? (
          <LineChart
            width={width}
            height={height}
            data={DATA}
            // The whole trick: one shared id links every panel's cursor and
            // brush window. Drop the id and the panels stop talking.
            syncId={synced ? "scenario" : undefined}
            margin={{ top: 4, right: 8, bottom: 0, left: -18 }}
          >
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              hide={!showAxis}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {showAxis ? (
              <Brush
                dataKey="t"
                height={22}
                travellerWidth={8}
                stroke="var(--color-muted-foreground)"
                fill="var(--color-muted)"
              />
            ) : null}
          </LineChart>
        ) : null}
      </div>
    </div>
  );
}

/** Three stacked charts sharing one x-axis via recharts' `syncId`. */
export function SyncedChartsDemo() {
  const [synced, setSynced] = useState(true);

  return (
    <div className="my-6 rounded-xl border p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {synced
            ? "Hover any panel, or drag the navigator — all three track one x-axis."
            : "Sync off — each panel now tracks only its own cursor and window."}
        </p>
        <Button variant="outline" size="sm" onClick={() => setSynced((s) => !s)}>
          {synced ? "Disable sync" : "Enable sync"}
        </Button>
      </div>
      <div className="space-y-2">
        <Panel title="Price" dataKey="price" color="var(--color-chart-1)" synced={synced} />
        <Panel title="Volatility" dataKey="vol" color="var(--color-chart-2)" synced={synced} />
        <Panel
          title="Volume"
          dataKey="volume"
          color="var(--color-chart-3)"
          synced={synced}
          showAxis
        />
      </div>
    </div>
  );
}
