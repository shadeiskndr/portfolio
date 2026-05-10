import Image from "next/image";
import { CAREER_TIMELINE } from "@/lib/new-site/data";

function formatDuration(start: Date, end?: Date): string {
  const endDate = end ?? new Date();
  const months =
    (endDate.getFullYear() - start.getFullYear()) * 12 + (endDate.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths}mos`;
  if (remMonths === 0) return `${years}yrs`;
  return `${years}yrs ${remMonths}mos`;
}

function formatRange(start: Date, end?: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${fmt(start)} – ${end ? fmt(end) : "Present"}`;
}

export default function CareerTimeline() {
  return (
    <section className="space-y-3">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        My Career Journey
      </h3>
      <ol className="space-y-3">
        {CAREER_TIMELINE.map((entry) => (
          <li key={entry.company} className="flex gap-3">
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={entry.logo}
                alt={`${entry.company} logo`}
                fill
                sizes="36px"
                className="object-contain dark:hidden"
              />
              {entry.darkLogo ? (
                <Image
                  src={entry.darkLogo}
                  alt=""
                  aria-hidden
                  fill
                  sizes="36px"
                  className="hidden object-contain dark:block"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-semibold text-sm">
                  {entry.company}
                  {entry.current ? (
                    <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 font-medium text-primary text-xs">
                      Current
                    </span>
                  ) : null}
                </p>
                <span className="flex-shrink-0 text-muted-foreground text-xs">
                  {formatDuration(entry.startDate, entry.endDate)}
                </span>
              </div>
              <p className="truncate text-muted-foreground text-sm">{entry.position}</p>
              <p className="text-muted-foreground text-xs">
                {formatRange(entry.startDate, entry.endDate)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
