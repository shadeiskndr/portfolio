"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
}

const Skeleton = ({ loading = true, children, className }: SkeletonProps) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  if (loading && children) {
    return (
      <div aria-busy="true" aria-live="polite" className={cn("relative", className)}>
        <div className="invisible">{children}</div>
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse rounded-[inherit] bg-muted-foreground/20"
        />
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      className={cn("animate-pulse rounded-md bg-muted-foreground/20", className)}
    />
  );
};

export default Skeleton;
