import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { RevealHighlight } from "@/components/new-site/content/reveal";
import Link from "@/components/new-site/link";
import { cn } from "@/lib/utils";

type ElementOf<K extends keyof MDXComponents> = NonNullable<MDXComponents[K]>;

export const MdxHighlight: ElementOf<"Highlight"> = (props) => (
  <RevealHighlight isView {...props} />
);

export const MdxH1: ElementOf<"h1"> = ({ className, ...props }) => (
  <h1
    className={cn("mt-8 mb-4 font-semibold font-serif text-2xl tracking-tight", className)}
    {...props}
  />
);

export const MdxH2: ElementOf<"h2"> = ({ className, ...props }) => (
  <h2
    className={cn("mt-8 mb-3 font-semibold font-serif text-xl tracking-tight", className)}
    {...props}
  />
);

export const MdxH3: ElementOf<"h3"> = ({ className, ...props }) => (
  <h3 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...props} />
);

export const MdxP: ElementOf<"p"> = ({ className, ...props }) => (
  <p className={cn("mb-4 leading-relaxed", className)} {...props} />
);

export const MdxA: ElementOf<"a"> = ({ className, href, ...props }) => (
  <Link
    href={href ?? "#"}
    className={cn(
      "underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground",
      className
    )}
    {...props}
  />
);

export const MdxUl: ElementOf<"ul"> = ({ className, ...props }) => (
  <ul className={cn("mb-4 list-disc space-y-2 pl-6", className)} {...props} />
);

export const MdxOl: ElementOf<"ol"> = ({ className, ...props }) => (
  <ol className={cn("mb-4 list-decimal space-y-2 pl-6", className)} {...props} />
);

export const MdxLi: ElementOf<"li"> = ({ className, ...props }) => (
  <li className={cn("leading-relaxed", className)} {...props} />
);

export const MdxBlockquote: ElementOf<"blockquote"> = ({ className, ...props }) => (
  <blockquote
    className={cn(
      "my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic",
      className
    )}
    {...props}
  />
);

export const MdxCode: ElementOf<"code"> = ({ className, ...props }) => {
  const isBlock =
    "data-language" in props || (typeof className === "string" && className.includes("language-"));
  if (isBlock) {
    return <code className={cn("font-mono text-sm", className)} {...props} />;
  }
  return (
    <code
      className={cn("rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)}
      {...props}
    />
  );
};

export const MdxPre: ElementOf<"pre"> = ({ className, ...props }) => (
  <pre
    className={cn(
      "my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm leading-relaxed",
      className
    )}
    {...props}
  />
);

export const MdxHr: ElementOf<"hr"> = ({ className, ...props }) => (
  <hr className={cn("my-8 border-muted", className)} {...props} />
);
