import type { ReactNode } from "react";

export interface UsesRow {
  label: string;
  value: ReactNode;
}

export interface UsesSection {
  title: string;
  rows: UsesRow[];
}

export default function UsesTable({
  sections,
  action,
}: {
  sections: UsesSection[];
  action?: ReactNode;
}) {
  const visible = sections.filter((section) => section.rows.length > 0);

  if (visible.length === 0) {
    return (
      <div className="space-y-3">
        {action ? <div className="flex justify-end">{action}</div> : null}
        <p className="rounded-lg border bg-muted/30 px-4 py-6 text-muted-foreground text-sm">
          Specs coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visible.map((section, index) => (
        <section key={section.title}>
          <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {section.title}
            </h2>
            {index === 0 && action ? action : null}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <dl className="text-sm">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(7rem,11rem)_1fr] gap-4 px-4 py-3 odd:bg-muted/30"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ))}
    </div>
  );
}
