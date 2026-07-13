export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 space-y-1.5 sm:mb-10 sm:space-y-2">
      <h1 className="text-pretty font-semibold font-serif text-[1.75rem] leading-[1.15] tracking-tight sm:text-3xl md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="text-pretty text-[0.9375rem] text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
