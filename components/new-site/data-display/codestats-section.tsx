"use client";

/** Shared card chrome for the /stats sections. */
export default function StatsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium text-sm">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
