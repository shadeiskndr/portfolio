import NextLink from "next/link";
import { cn } from "@/lib/utils";

type LinkProps = React.ComponentProps<typeof NextLink> & {
  external?: boolean;
};

export default function Link({ external, className, children, ...props }: LinkProps) {
  const cls = cn("transition-colors hover:text-foreground", className);
  if (external || (typeof props.href === "string" && /^https?:/.test(props.href))) {
    return (
      <a
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink {...props} className={cls}>
      {children}
    </NextLink>
  );
}
