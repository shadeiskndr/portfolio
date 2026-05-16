import type { MDXComponents } from "next-mdx-remote-client/rsc";
import Highlight from "@/components/new-site/content/highlight";
import Link from "@/components/new-site/link";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXComponents = {
  Highlight,
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
  code: ({ className, ...props }) => (
    <code
      className={cn("rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-8 border-muted", className)} {...props} />,
};
