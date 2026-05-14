import Highlight from "@/components/new-site/content/highlight";
import Link from "@/components/new-site/link";
import { BlurFade } from "@/components/ui/magicui/blur-fade";

export default function AboutHome() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <BlurFade delay={0}>
        <h1
          className="font-medium text-3xl tracking-tight md:text-4xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          hi, i&apos;m <Highlight>shahathir</Highlight> — a software developer building things at{" "}
          <Highlight variant="underline">FRG</Highlight>.
        </h1>
      </BlurFade>

      <div className="space-y-4 text-base leading-relaxed">
        <BlurFade delay={0.08}>
          <p>
            I graduated from{" "}
            <Link
              href="https://www.unikl.edu.my/"
              external
              className="underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
            >
              UniKL MIIT
            </Link>{" "}
            and now spend most of my time on web apps for the financial-risk space — which is a
            fancier way of saying I write a lot of TypeScript and stare at a lot form fields, data
            tables, ETL diagrams, and charts.
          </p>
        </BlurFade>

        <BlurFade delay={0.16}>
          <p>
            I started writing code when I was 15, in a high-school computer science class that I
            thought was going to be a throwaway elective. <Highlight>It wasn&apos;t.</Highlight> I
            haven&apos;t really stopped since. Most of what I know I learned by breaking things in
            public — building, shipping, and watching the parts I got wrong embarrass me later.
          </p>
        </BlurFade>

        <BlurFade delay={0.24}>
          <p>
            I plan more than I should. I rewrite more than I need to. I care about the small stuff —
            spacing, hit targets, the way a page feels to navigate — probably more than is
            economically rational.{" "}
            <Highlight>I just have a stubborn need to get the details right.</Highlight>
          </p>
        </BlurFade>

        <BlurFade delay={0.32}>
          <p>
            When I&apos;m not at a keyboard I&apos;m usually{" "}
            <Highlight variant="underline">somewhere on the MRT</Highlight>, deep in a playlist, or
            falling down a YouTube rabbit hole about something I&apos;ll never use professionally.
            I&apos;m a quiet evangelist for free and open-source software, and I have strong
            opinions about consumer electronics I won&apos;t bore you with here.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <p>
            This site is the slower, more honest version of a portfolio:{" "}
            <Highlight>
              half-finished essays, things I learned this week, books I&apos;m reading, projects
              that may or may not ship.
            </Highlight>{" "}
            <span className="text-muted-foreground">
              Not everything here is polished. That&apos;s sort of the point.
            </span>
          </p>
        </BlurFade>

        <BlurFade delay={0.48}>
          <p>
            If you&apos;re here, thanks for reading. The old portfolio still lives at{" "}
            <Link
              href="/old"
              className="underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
            >
              /old
            </Link>{" "}
            if you&apos;re looking for the CV version.
          </p>
        </BlurFade>
      </div>
    </article>
  );
}
