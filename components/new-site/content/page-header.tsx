export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 space-y-2">
      <h1
        className="font-semibold text-3xl tracking-tight md:text-4xl"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {title}
      </h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
    </header>
  );
}
