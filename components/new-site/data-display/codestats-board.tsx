"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import CodestatsActivity from "@/components/new-site/data-display/codestats-activity";
import CodestatsCalendar from "@/components/new-site/data-display/codestats-calendar";
import CodestatsLanguages from "@/components/new-site/data-display/codestats-languages";
import StatsSection from "@/components/new-site/data-display/codestats-section";
import {
  CodestatsHero,
  CodestatsTiles,
} from "@/components/new-site/data-display/codestats-summary";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import {
  buildCalendar,
  buildDailySeries,
  buildLanguages,
  buildMachines,
  formatFullXp,
  PROFILE_TIME_ZONE,
  summarize,
  todayInProfileZone,
} from "@/lib/new-site/codestats";

const WINDOW_DAYS = 90;

// `fetchedAt` is a real instant, so it needs an explicit locale *and* timeZone:
// without them the server and the browser format it differently. Pinned to the
// profile's zone (and labelled with it) so the reading matches the day buckets
// the rest of the page is built on.
// Spelled out as individual components rather than dateStyle/timeStyle, which
// throw a TypeError when combined with timeZoneName.
const syncedFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: PROFILE_TIME_ZONE,
  timeZoneName: "short",
});

export default function CodestatsBoard() {
  const profile = useQuery(api.codestats.getProfile);

  const derived = useMemo(() => {
    if (!profile) return null;
    const today = todayInProfileZone(new Date());
    const { data } = profile;
    return {
      summary: summarize(data, today),
      points: buildDailySeries(data.dates, today, WINDOW_DAYS),
      calendar: buildCalendar(data.dates, today),
      languages: buildLanguages(data.languages),
      machines: buildMachines(data.machines),
    };
  }, [profile]);

  if (profile === undefined) return <BoardSkeleton />;

  if (!(profile && derived)) {
    return (
      <p className="rounded-xl border bg-muted/20 p-4 text-muted-foreground text-sm">
        No Code::Stats snapshot cached yet — the sync job fills this in on its next run.
      </p>
    );
  }

  const { summary, points, calendar, languages, machines } = derived;

  return (
    <div className="space-y-4">
      <BlurFade blur="0px">
        <CodestatsHero summary={summary} username={profile.username} />
      </BlurFade>

      <BlurFade blur="0px" delay={0.06}>
        <CodestatsTiles summary={summary} />
      </BlurFade>

      <BlurFade blur="0px" delay={0.12}>
        <CodestatsActivity points={points} days={WINDOW_DAYS} />
      </BlurFade>

      <BlurFade blur="0px" delay={0.18}>
        <StatsSection
          title="Activity calendar"
          description={`${formatFullXp(calendar.totalXp)} XP across ${calendar.weeks.length} weeks.`}
        >
          <CodestatsCalendar calendar={calendar} />
        </StatsSection>
      </BlurFade>

      <BlurFade blur="0px" delay={0.24}>
        <CodestatsLanguages breakdown={languages} />
      </BlurFade>

      <BlurFade blur="0px" delay={0.3}>
        <StatsSection title="Machines" description="XP by the editor/machine that reported it.">
          <ul className="space-y-3">
            {machines.map((machine) => (
              <li key={machine.name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{machine.name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatFullXp(machine.xp)} XP
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${machine.share * 100}%`,
                      background: "var(--color-chart-1)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </StatsSection>
      </BlurFade>

      <p className="text-muted-foreground text-xs">
        {summary.recentXp > 0 ? `${formatFullXp(summary.recentXp)} XP in the last 12 hours · ` : ""}
        Synced {syncedFormatter.format(new Date(profile.fetchedAt))} from{" "}
        <a
          href="https://codestats.net"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          Code::Stats
        </a>
        .
      </p>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["streak", "best", "languages", "days"].map((key) => (
          <Skeleton key={key} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
