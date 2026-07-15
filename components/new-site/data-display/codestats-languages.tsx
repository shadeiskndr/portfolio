"use client";

import dynamic from "next/dynamic";
import StatsSection from "@/components/new-site/data-display/codestats-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LanguageBreakdown } from "@/lib/new-site/codestats";
import { formatFullXp } from "@/lib/new-site/codestats";

const LanguagesChart = dynamic(
  () => import("./codestats-charts").then((mod) => mod.LanguagesChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default function CodestatsLanguages({ breakdown }: { breakdown: LanguageBreakdown }) {
  const rows = breakdown.top.map((slice) => ({ name: slice.name, xp: slice.xp }));
  if (breakdown.otherCount > 0) {
    rows.push({ name: `Other (${breakdown.otherCount})`, xp: breakdown.otherXp });
  }

  return (
    <Tabs defaultValue="chart">
      <StatsSection
        title="Languages"
        description={`${breakdown.all.length} languages, ranked by lifetime XP.`}
        action={
          <TabsList className="h-8">
            <TabsTrigger value="chart" className="px-2.5 text-xs">
              Chart
            </TabsTrigger>
            <TabsTrigger value="table" className="px-2.5 text-xs">
              Table
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="chart">
          <LanguagesChart rows={rows} />
        </TabsContent>
        <TabsContent value="table">
          <div className="max-h-72 overflow-y-auto pr-1">
            <table className="w-full text-sm">
              <caption className="sr-only">Code::Stats XP by language</caption>
              <thead className="sticky top-0 bg-background">
                <tr className="text-left text-muted-foreground text-xs">
                  <th scope="col" className="py-1.5 font-normal">
                    Language
                  </th>
                  <th scope="col" className="py-1.5 text-right font-normal">
                    XP
                  </th>
                  <th scope="col" className="py-1.5 text-right font-normal">
                    Share
                  </th>
                  <th scope="col" className="py-1.5 text-right font-normal">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.all.map((slice) => (
                  <tr key={slice.name} className="border-border/50 border-t">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {slice.name}
                    </th>
                    <td className="py-1.5 text-right tabular-nums">{formatFullXp(slice.xp)}</td>
                    <td className="py-1.5 text-right text-muted-foreground tabular-nums">
                      {percentFormatter.format(slice.share)}
                    </td>
                    <td className="py-1.5 text-right text-muted-foreground tabular-nums">
                      {slice.level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </StatsSection>
    </Tabs>
  );
}
