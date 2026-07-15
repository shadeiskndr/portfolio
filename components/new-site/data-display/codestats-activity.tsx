"use client";

import dynamic from "next/dynamic";
import StatsSection from "@/components/new-site/data-display/codestats-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyPoint } from "@/lib/new-site/codestats";
import { formatDayLong, formatFullXp } from "@/lib/new-site/codestats";

const XpActivityChart = dynamic(
  () => import("./codestats-charts").then((mod) => mod.XpActivityChart),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full rounded-lg" /> }
);

export default function CodestatsActivity({
  points,
  days,
}: {
  points: DailyPoint[];
  days: number;
}) {
  return (
    <Tabs defaultValue="daily">
      <StatsSection
        title="XP over time"
        description={`Daily and all-time XP across the last ${days} days.`}
        action={
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="px-2.5 text-xs">
              Daily
            </TabsTrigger>
            <TabsTrigger value="cumulative" className="px-2.5 text-xs">
              Cumulative
            </TabsTrigger>
            <TabsTrigger value="table" className="px-2.5 text-xs">
              Table
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="daily">
          <XpActivityChart points={points} mode="daily" />
        </TabsContent>
        <TabsContent value="cumulative">
          <XpActivityChart points={points} mode="cumulative" />
        </TabsContent>
        <TabsContent value="table">
          <ActivityTable points={points} />
        </TabsContent>
      </StatsSection>
    </Tabs>
  );
}

function ActivityTable({ points }: { points: DailyPoint[] }) {
  const rows = points.slice().reverse();

  return (
    <div className="max-h-56 overflow-y-auto pr-1">
      <table className="w-full text-sm">
        <caption className="sr-only">Daily and cumulative Code::Stats XP</caption>
        <thead className="sticky top-0 bg-background">
          <tr className="text-left text-muted-foreground text-xs">
            <th scope="col" className="py-1.5 font-normal">
              Date
            </th>
            <th scope="col" className="py-1.5 text-right font-normal">
              XP
            </th>
            <th scope="col" className="py-1.5 text-right font-normal">
              All-time
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr key={point.date} className="border-border/50 border-t">
              <th scope="row" className="py-1.5 text-left font-normal">
                {formatDayLong(point.date)}
              </th>
              <td className="py-1.5 text-right tabular-nums">
                {point.xp > 0 ? formatFullXp(point.xp) : "—"}
              </td>
              <td className="py-1.5 text-right text-muted-foreground tabular-nums">
                {formatFullXp(point.cumulative)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
