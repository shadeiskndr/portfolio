"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Calendar } from "@/lib/new-site/codestats";
import {
  formatDayLong,
  formatFullXp,
  formatMonthShort,
  isSameMonth,
} from "@/lib/new-site/codestats";
import { cn } from "@/lib/utils";

/**
 * Sequential single-hue ramp, light -> dark, mixed against the surface so it
 * tracks whichever runtime theme is active instead of hard-coding a green.
 */
const LEVEL_FILL = [
  "color-mix(in oklab, var(--color-muted) 55%, transparent)",
  "color-mix(in oklab, var(--color-chart-1) 25%, var(--color-muted))",
  "color-mix(in oklab, var(--color-chart-1) 50%, var(--color-muted))",
  "color-mix(in oklab, var(--color-chart-1) 75%, var(--color-muted))",
  "var(--color-chart-1)",
];

/** Weekday rail — only alternating rows are labelled, as on GitHub. */
const WEEKDAY_ROWS = [
  { day: "sun", label: "" },
  { day: "mon", label: "Mon" },
  { day: "tue", label: "" },
  { day: "wed", label: "Wed" },
  { day: "thu", label: "" },
  { day: "fri", label: "Fri" },
  { day: "sat", label: "" },
];

export default function CodestatsCalendar({ calendar }: { calendar: Calendar }) {
  // A month label sits above the first week of each month, plus the leading
  // column so the grid never opens unlabelled. Labels closer than two columns
  // would collide, so the later one is dropped.
  const monthLabels: (string | null)[] = [];
  let lastLabelled = Number.NEGATIVE_INFINITY;
  for (const [index, week] of calendar.weeks.entries()) {
    const startsMonth =
      index === 0 || !isSameMonth(week[0].date, calendar.weeks[index - 1][0].date);
    if (startsMonth && index - lastLabelled >= 2) {
      monthLabels.push(formatMonthShort(week[0].date));
      lastLabelled = index;
    } else {
      monthLabels.push(null);
    }
  }

  return (
    <TooltipProvider delay={50}>
      <div className="hide-scrollbar overflow-x-auto">
        <div className="flex w-max gap-1.5">
          <div className="flex flex-col gap-[3px] pt-5">
            {WEEKDAY_ROWS.map((row) => (
              <div
                key={row.day}
                className="flex h-3 items-center text-[10px] text-muted-foreground leading-none"
              >
                {row.label}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {calendar.weeks.map((week, weekIndex) => (
              <div key={week[0].date} className="flex flex-col gap-[3px]">
                <div className="h-5 text-[10px] text-muted-foreground leading-none">
                  {monthLabels[weekIndex]}
                </div>
                {week.map((cell) =>
                  cell.future ? (
                    <div key={cell.date} className="size-3" />
                  ) : (
                    <Tooltip key={cell.date} disableHoverablePopup>
                      <TooltipTrigger
                        render={
                          <div
                            // The 3px flex gap already separates cells; no border
                            // is drawn on filled marks.
                            className={cn(
                              "size-3 rounded-[3px]",
                              cell.level === 0 && "ring-1 ring-border/60 ring-inset"
                            )}
                            style={{ background: LEVEL_FILL[cell.level] }}
                          />
                        }
                      />
                      <TooltipContent side="top" sideOffset={6}>
                        <span className="font-semibold tabular-nums">
                          {cell.xp > 0 ? `${formatFullXp(cell.xp)} XP` : "No XP"}
                        </span>
                        <span className="text-background/70">on {formatDayLong(cell.date)}</span>
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-muted-foreground text-xs">
        <span>Less</span>
        {LEVEL_FILL.map((fill, index) => (
          <span
            key={fill}
            aria-hidden
            className={cn(
              "size-3 rounded-[3px]",
              index === 0 && "ring-1 ring-border/60 ring-inset"
            )}
            style={{ background: fill }}
          />
        ))}
        <span>More</span>
      </div>
    </TooltipProvider>
  );
}
