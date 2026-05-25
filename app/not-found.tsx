import { RevealHighlight as Highlight, RevealFade } from "@/components/new-site/content/reveal";
import Link from "@/components/new-site/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <article className="mx-auto w-full max-w-2xl space-y-6">
        <RevealFade delay={0}>
          <p className="font-mono text-muted-foreground text-sm">404</p>
        </RevealFade>

        <RevealFade delay={0.08}>
          <h1 className="font-medium font-serif text-3xl tracking-tight md:text-4xl">
            this page <Highlight>doesn&apos;t exist</Highlight> — or maybe it did, and i moved it.
          </h1>
        </RevealFade>

        <div className="space-y-4 text-base leading-relaxed">
          <RevealFade delay={0.16}>
            <p className="text-muted-foreground">
              I rewrite this site more than I should, so URLs occasionally vanish. If you got here
              from a link that used to work, sorry about that.
            </p>
          </RevealFade>

          <RevealFade delay={0.24}>
            <p>
              Head back to the{" "}
              <Link
                href="/"
                className="underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
              >
                home page
              </Link>
              , or check out the{" "}
              <Link
                href="/old"
                className="underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
              >
                old portfolio
              </Link>{" "}
              if you&apos;re after the CV version.
            </p>
          </RevealFade>
        </div>
      </article>
    </main>
  );
}
