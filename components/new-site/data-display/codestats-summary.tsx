"use client";

import { Flame, Languages, Laptop, Trophy } from "lucide-react";
import type { CodestatsSummary } from "@/lib/new-site/codestats";
import { formatDayLong, formatFullXp, formatXp } from "@/lib/new-site/codestats";

export function CodestatsHero({
  summary,
  username,
}: {
  summary: CodestatsSummary;
  username: string;
}) {
  const percent = Math.round(summary.levelRatio * 100);

  return (
    <div className="rounded-xl border bg-muted/20 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Total XP</p>
          <p className="mt-1 font-semibold text-4xl leading-none tracking-tight sm:text-5xl">
            {formatFullXp(summary.totalXp)}
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            <a
              href={`https://codestats.net/users/${username}`}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              @{username}
            </a>
            {summary.trackedSince ? ` · tracking since ${formatDayLong(summary.trackedSince)}` : ""}
          </p>
        </div>

        <div className="min-w-[13rem] flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-sm">Level {summary.level}</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {percent}% to {summary.level + 1}
            </span>
          </div>
          <div aria-hidden className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${percent}%`, background: "var(--color-chart-1)" }}
            />
          </div>
          <p className="mt-2 text-muted-foreground text-xs tabular-nums">
            {formatFullXp(summary.xpToNextLevel)} XP to level {summary.level + 1}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CodestatsTiles({ summary }: { summary: CodestatsSummary }) {
  const tiles = [
    {
      icon: Flame,
      label: "Current streak",
      value: `${summary.currentStreak}d`,
      hint: `Longest ${summary.longestStreak}d`,
    },
    {
      icon: Trophy,
      label: "Best day",
      value: summary.bestDay ? formatXp(summary.bestDay.xp) : "—",
      hint: summary.bestDay ? formatDayLong(summary.bestDay.date) : "No activity yet",
    },
    {
      icon: Languages,
      label: "Languages",
      value: `${summary.languageCount}`,
      hint: `${formatXp(summary.avgPerActiveDay)} XP / active day`,
    },
    {
      icon: Laptop,
      label: "Active days",
      value: `${summary.activeDays}`,
      hint: `${formatXp(summary.last7Xp)} XP this week`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map(({ icon: Icon, label, value, hint }) => (
        <div key={label} className="rounded-xl border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="size-3.5" aria-hidden />
            <span className="text-xs">{label}</span>
          </div>
          <p className="mt-1.5 font-semibold text-2xl leading-none tracking-tight">{value}</p>
          <p className="mt-1.5 text-muted-foreground text-xs">{hint}</p>
        </div>
      ))}
    </div>
  );
}
