import type * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
}

function Container({ className, children, ref, ...props }: ContainerProps) {
  return (
    <section
      className={cn("w-full bg-background py-16 md:py-20 2xl:py-24", className)}
      ref={ref}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:gap-12 md:px-8">
        {children}
      </div>
    </section>
  );
}

export default Container;
