"use client";

import type { AnimationDefinition } from "motion/react";
import { createContext, useCallback, useContext, useState } from "react";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { Highlighter } from "@/components/ui/magicui/highlighter";
import { cn } from "@/lib/utils";

const RevealedContext = createContext(true);

type RevealFadeProps = React.ComponentProps<typeof BlurFade>;

export function RevealFade({ children, onAnimationComplete, ...props }: RevealFadeProps) {
  const [revealed, setRevealed] = useState(false);

  const handleAnimationComplete = useCallback(
    (definition: AnimationDefinition) => {
      if (definition === "visible") setRevealed(true);
      onAnimationComplete?.(definition);
    },
    [onAnimationComplete]
  );

  return (
    <BlurFade {...props} onAnimationComplete={handleAnimationComplete}>
      <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
    </BlurFade>
  );
}

type RevealHighlightProps = {
  children: React.ReactNode;
  variant?: "color" | "underline" | "muted";
  className?: string;
  isView?: boolean;
};

export function RevealHighlight({
  children,
  variant = "color",
  className,
  isView = false,
}: RevealHighlightProps) {
  const enabled = useContext(RevealedContext);

  if (variant === "muted") {
    return <span className={cn("text-muted-foreground", className)}>{children}</span>;
  }

  const isUnderline = variant === "underline";

  return (
    <Highlighter
      enabled={enabled}
      isView={isView}
      action={isUnderline ? "underline" : "highlight"}
      color={
        isUnderline ? "var(--primary)" : "color-mix(in oklab, var(--primary) 18%, transparent)"
      }
      strokeWidth={isUnderline ? 2 : 1.5}
      padding={isUnderline ? 3 : 1}
      iterations={2}
      animationDuration={700}
      {...(className !== undefined && { className })}
    >
      {children}
    </Highlighter>
  );
}
