"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DailyPoint } from "@/lib/new-site/codestats";
import {
  formatCompactXp,
  formatDayLong,
  formatDayShort,
  formatFullXp,
  formatXp,
} from "@/lib/new-site/codestats";

const ACTIVITY_CONFIG = {
  xp: { label: "XP", color: "var(--color-chart-1)" },
  cumulative: { label: "Total XP", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function XpActivityChart({
  points,
  mode,
}: {
  points: DailyPoint[];
  mode: "daily" | "cumulative";
}) {
  const dataKey = mode === "daily" ? "xp" : "cumulative";

  let peak = 0;
  for (const point of points) {
    if (point[dataKey] > peak) peak = point[dataKey];
  }
  const formatTick = peak >= 10_000 ? formatCompactXp : formatFullXp;

  return (
    <ChartContainer config={ACTIVITY_CONFIG} className="aspect-auto h-56 w-full">
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="codestats-xp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayShort}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          width={46}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--color-border)" }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label) => formatDayLong(String(label))}
              formatter={(value) => `${formatFullXp(Number(value))} XP`}
            />
          }
        />
        <Area
          dataKey={dataKey}
          type="monotone"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#codestats-xp-fill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-background)" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const LANGUAGE_CONFIG = {
  xp: { label: "XP", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function LanguagesChart({ rows }: { rows: { name: string; xp: number }[] }) {
  return (
    <ChartContainer
      config={LANGUAGE_CONFIG}
      className="aspect-auto w-full"
      style={{ height: rows.length * 30 + 12 }}
    >
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 52, bottom: 0, left: 0 }}>
        <XAxis type="number" dataKey="xp" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={112}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-muted)", fillOpacity: 0.5 }}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => `${formatFullXp(Number(value))} XP`}
            />
          }
        />
        <Bar
          dataKey="xp"
          fill="var(--color-chart-1)"
          radius={[0, 4, 4, 0]}
          barSize={12}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="xp"
            position="right"
            offset={8}
            fontSize={11}
            className="fill-muted-foreground"
            formatter={(value) => formatXp(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
