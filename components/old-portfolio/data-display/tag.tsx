import type * as React from "react";
import Typography from "@/components/old-portfolio/general/typography";
import { cn } from "@/lib/utils";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

function Tag({ label, className, ...props }: TagProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-secondary px-5 py-1 [a&]:hover:bg-secondary/90",
        className
      )}
      {...props}
    >
      <Typography variant="body3" className="font-medium text-secondary-foreground">
        {label}
      </Typography>
    </div>
  );
}

export default Tag;
