import { RevealHighlight as Highlight, RevealFade } from "@/components/new-site/content/reveal";
import { JsonLd } from "@/components/new-site/json-ld";
import Link from "@/components/new-site/link";
import { GITHUB_URL, SITE_NAME, SITE_URL } from "@/lib/site";

export default function AboutHome() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE_NAME,
          url: SITE_URL,
          jobTitle: "Software Developer",
          worksFor: { "@type": "Organization", name: "FRG", url: "https://frgrisk.com" },
          alumniOf: { "@type": "CollegeOrUniversity", name: "UniKL MIIT" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Batu Caves",
            addressRegion: "Selangor",
            addressCountry: "MY",
          },
          sameAs: [GITHUB_URL],
        }}
      />
      <RevealFade delay={0}>
        <h1 className="font-medium font-serif text-3xl tracking-tight md:text-4xl">
          hi, i&apos;m <Highlight>shahathir</Highlight> — a software developer building things at{" "}
          <Highlight variant="underline">FRG</Highlight>.
        </h1>
      </RevealFade>

      <div className="space-y-4 text-base leading-relaxed">
        <RevealFade delay={0.08}>
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
        </RevealFade>

        <RevealFade delay={0.16}>
          <p>
            I started writing code when I was 15, in a high-school computer science class that I
            thought was going to be a throwaway elective. <Highlight>It wasn&apos;t.</Highlight> I
            haven&apos;t really stopped since. Most of what I know I learned by breaking things in
            public — building, shipping, and watching the parts I got wrong embarrass me later.
          </p>
        </RevealFade>

        <RevealFade delay={0.24}>
          <p>
            I plan more than I should. I rewrite more than I need to. I care about the small stuff —
            spacing, hit targets, the way a page feels to navigate — probably more than is
            economically rational.{" "}
            <Highlight>I just have a stubborn need to get the details right.</Highlight>
          </p>
        </RevealFade>

        <RevealFade delay={0.32}>
          <p>
            When I&apos;m not at a keyboard I&apos;m usually{" "}
            <Highlight variant="underline">somewhere on the MRT</Highlight>, deep in a playlist, or
            falling down a YouTube rabbit hole about something I&apos;ll never use professionally.
            I&apos;m a quiet evangelist for free and open-source software, and I have strong
            opinions about consumer electronics I won&apos;t bore you with here.
          </p>
        </RevealFade>

        <RevealFade delay={0.4}>
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
        </RevealFade>

        <RevealFade delay={0.48}>
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
        </RevealFade>
      </div>
    </article>
  );
}
