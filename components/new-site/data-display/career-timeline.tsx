import { AssetImage } from "@/components/asset-image";
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
    <section className="space-y-2.5">
      <h3 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        My Career Journey
      </h3>
      <ol className="space-y-2.5">
        {CAREER_TIMELINE.map((entry) => (
          <li key={entry.company} className="flex gap-2.5">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
              <AssetImage
                assetKey={entry.logoKey}
                alt={`${entry.company} logo`}
                fill
                sizes="32px"
                className="object-contain dark:hidden"
              />
              {entry.darkLogoKey ? (
                <AssetImage
                  assetKey={entry.darkLogoKey}
                  alt=""
                  aria-hidden
                  fill
                  sizes="32px"
                  className="hidden object-contain dark:block"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-semibold text-xs">{entry.company}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatDuration(entry.startDate, entry.endDate)}
                </span>
              </div>
              <p className="truncate text-muted-foreground text-xs">{entry.position}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatRange(entry.startDate, entry.endDate)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
