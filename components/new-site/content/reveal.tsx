"use client";

import type { AnimationDefinition } from "motion/react";
import { createContext, useContext, useState } from "react";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { Highlighter } from "@/components/ui/magicui/highlighter";
import { cn } from "@/lib/utils";

// Whether the nearest RevealFade has finished its entrance animation. Highlighters
// read this so their hand-drawn annotation only starts once the text has settled —
// drawing mid-fade would measure a translated/blurred box and look muddy.
// Defaults to true so a highlighter rendered outside any RevealFade still draws.
const RevealedContext = createContext(true);

type RevealFadeProps = React.ComponentProps<typeof BlurFade>;

/** A BlurFade that announces, via context, when its entrance animation completes. */
export function RevealFade({ children, onAnimationComplete, ...props }: RevealFadeProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <BlurFade
      {...props}
      onAnimationComplete={(definition: AnimationDefinition) => {
        if (definition === "visible") setRevealed(true);
        onAnimationComplete?.(definition);
      }}
    >
      <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
    </BlurFade>
  );
}

type RevealHighlightProps = {
  children: React.ReactNode;
  variant?: "color" | "underline" | "muted";
  className?: string;
  /**
   * Draw when the mark scrolls into view rather than on a RevealFade entrance.
   * Use in long-form content (MDX) where there is no entrance animation to gate on.
   */
  isView?: boolean;
};

/**
 * Drop-in replacement for the static <Highlight> that draws a hand-drawn
 * rough-notation mark instead. By default it is gated on the entrance animation
 * of the surrounding RevealFade; pass `isView` to draw on scroll-into-view
 * instead (for prose). Colors track the active theme.
 */
export function RevealHighlight({
  children,
  variant = "color",
  className,
  isView = false,
}: RevealHighlightProps) {
  const enabled = useContext(RevealedContext);

  // "muted" is de-emphasis, not an annotation — keep it as plain text.
  if (variant === "muted") {
    return <span className={cn("text-muted-foreground", className)}>{children}</span>;
  }

  const isUnderline = variant === "underline";

  return (
    <Highlighter
      enabled={enabled}
      isView={isView}
      action={isUnderline ? "underline" : "highlight"}
      // Resolved against the live theme inside Highlighter. The underline uses the
      // solid primary stroke; the marker uses a translucent primary so it tints
      // rather than obscures the text on dark-primary themes (mirrors bg-primary/15).
      color={
        isUnderline ? "var(--primary)" : "color-mix(in oklab, var(--primary) 18%, transparent)"
      }
      strokeWidth={isUnderline ? 2 : 1.5}
      padding={isUnderline ? 3 : 1}
      iterations={2}
      animationDuration={700}
      className={className}
    >
      {children}
    </Highlighter>
  );
}
