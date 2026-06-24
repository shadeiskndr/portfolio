import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { AskUserDemo } from "@/components/new-site/content/ask-user-demo";
import { CodeMirrorDemo } from "@/components/new-site/content/codemirror-demo";
import { DiscriminatedUnionDemo } from "@/components/new-site/content/discriminated-union-demo";
import { EchoGuardDemo } from "@/components/new-site/content/echo-guard-demo";
import { GraphOrphanEdgesDemo } from "@/components/new-site/content/graph-orphan-edges-demo";
import { Mermaid } from "@/components/new-site/content/mermaid";
import { NestedFormDemo } from "@/components/new-site/content/nested-form-demo";
import { ProfileFormDemo } from "@/components/new-site/content/profile-form-demo";
import { RevealHighlight } from "@/components/new-site/content/reveal";
import { RuntimeThemeDemo } from "@/components/new-site/content/runtime-theme-demo";
import { StreamRevealDemo } from "@/components/new-site/content/stream-reveal-demo";
import { SyncedChartsDemo } from "@/components/new-site/content/synced-charts-demo";
import { ToneRampDemo } from "@/components/new-site/content/tone-ramp-demo";
import { UsePromiseDemo } from "@/components/new-site/content/use-promise-demo";
import { WorkflowGraphDemo } from "@/components/new-site/content/workflow-graph-demo";
import Link from "@/components/new-site/link";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXComponents = {
  // Draw the hand-drawn mark as it scrolls into view, since prose has no
  // entrance animation to gate on.
  Highlight: (props) => <RevealHighlight isView {...props} />,
  AskUserDemo,
  CodeMirrorDemo,
  DiscriminatedUnionDemo,
  EchoGuardDemo,
  GraphOrphanEdgesDemo,
  Mermaid,
  NestedFormDemo,
  ProfileFormDemo,
  RuntimeThemeDemo,
  StreamRevealDemo,
  SyncedChartsDemo,
  ToneRampDemo,
  UsePromiseDemo,
  WorkflowGraphDemo,
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-8 mb-4 font-semibold font-serif text-2xl tracking-tight", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-8 mb-3 font-semibold font-serif text-xl tracking-tight", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mb-4 leading-relaxed", className)} {...props} />
  ),
  a: ({ className, href, ...props }) => (
    <Link
      href={href ?? "#"}
      className={cn(
        "underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-4 list-disc space-y-2 pl-6", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-4 list-decimal space-y-2 pl-6", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    // Fenced blocks arrive either with a `language-*` class (plain markdown) or a
    // `data-language` attr (after rehype-pretty-code highlights them). Those live
    // inside <pre>, so skip the inline "pill" styling and let the block/token
    // colors show through. Only real inline code gets the muted pill.
    const isBlock =
      "data-language" in props ||
      (typeof className === "string" && className.includes("language-"));
    if (isBlock) {
      return <code className={cn("font-mono text-sm", className)} {...props} />;
    }
    return (
      <code
        className={cn("rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)}
        {...props}
      />
    );
  },
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-8 border-muted", className)} {...props} />,
};
