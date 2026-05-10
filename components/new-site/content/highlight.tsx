import { cn } from "@/lib/utils";

type HighlightProps = {
  children: React.ReactNode;
  variant?: "color" | "underline" | "muted";
  className?: string;
};

export default function Highlight({ children, variant = "color", className }: HighlightProps) {
  if (variant === "underline") {
    return (
      <span
        className={cn(
          "underline decoration-foreground/40 decoration-dashed underline-offset-4",
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === "muted") {
    return <span className={cn("text-muted-foreground", className)}>{children}</span>;
  }

  return (
    <span className={cn("rounded-md bg-primary/15 px-1 text-primary", className)}>{children}</span>
  );
}
