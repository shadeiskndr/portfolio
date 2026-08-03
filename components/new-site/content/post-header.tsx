import { BlurFade } from "@/components/ui/magicui/blur-fade";

const POST_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function PostHeader({
  date,
  title,
  summary,
}: {
  date: string;
  title: string;
  summary?: string | undefined;
}) {
  return (
    <header className="mb-8 space-y-2">
      <BlurFade delay={0}>
        <time className="text-muted-foreground text-sm">
          {POST_DATE_FORMAT.format(new Date(date))}
        </time>
      </BlurFade>
      <BlurFade delay={0.09}>
        <h1 className="font-semibold font-serif text-3xl tracking-tight md:text-4xl">{title}</h1>
      </BlurFade>
      {summary ? (
        <BlurFade delay={0.18}>
          <p className="text-muted-foreground">{summary}</p>
        </BlurFade>
      ) : null}
    </header>
  );
}
