import * as React from "react";

import { cn } from "@/lib/utils";
import Typography from "@/components/general/typography";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ label, className, ...props }: TagProps, ref) => {
    return (
      <div
        className={cn(
          "bg-secondary flex items-center justify-center rounded-xl px-5 py-1",
          className
        )}
        {...props}
      >
        <Typography variant="body3" className="text-secondary-foreground font-medium">
          {label}
        </Typography>
      </div>
    );
  }
);

Tag.displayName = "Tag";

export default Tag;
