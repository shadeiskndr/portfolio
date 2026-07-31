import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground active:bg-secondary [&_svg]:stroke-muted-foreground [&_svg]:hover:stroke-foreground",
  {
    variants: {
      size: {
        md: "[&_svg]:h-6 [&_svg]:w-6",
        lg: "[&_svg]:h-8 [&_svg]:w-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function IconButton({
  className,
  size,
  asChild: _asChild = false,
  showTooltip = false,
  tooltipText = "",
  children,
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn("relative", iconButtonVariants({ size }), className)}
      ref={ref}
      {...props}
    >
      {children}
      {showTooltip && tooltipText.length > 0 ? (
        <span className="absolute -top-8 rounded-lg bg-primary px-2 py-1 text-sm">
          {tooltipText}
        </span>
      ) : null}
    </button>
  );
}

export default IconButton;
