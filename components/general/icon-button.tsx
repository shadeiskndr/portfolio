import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "flex justify-center items-center hover:bg-muted active:bg-secondary rounded-lg p-1.5 transition-colors duration-200 [&_svg]:stroke-muted-foreground [&_svg]:hover:stroke-foreground",
  {
    variants: {
      size: {
        md: "[&_svg]:w-6 [&_svg]:h-6",
        lg: "[&_svg]:w-8 [&_svg]:h-8",
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
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { className, size, asChild = false, showTooltip = false, tooltipText = "", children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn("relative", iconButtonVariants({ size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {showTooltip && tooltipText.length > 0 && (
          <span className="bg-primary absolute -top-8 rounded-lg px-2 py-1 text-sm">
            {tooltipText}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
