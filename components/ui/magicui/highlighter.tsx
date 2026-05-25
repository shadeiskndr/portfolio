"use client";

import { useInView, useReducedMotion } from "motion/react";
import type React from "react";
import { useRef } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket";

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  /**
   * Any CSS color expression — including `var(...)` and `color-mix(...)`. It is
   * resolved against the live theme before being handed to rough-notation, which
   * only accepts a concrete color on the SVG stroke attribute.
   */
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  /** Only draw once the element has scrolled into view. */
  isView?: boolean;
  /**
   * Gate drawing on an external signal (e.g. an entrance animation finishing).
   * rough-notation measures the element's box when it draws, so drawing while a
   * parent is still translating/blurring/fading produces a misplaced, muddy mark.
   */
  enabled?: boolean;
  className?: string;
}

// Resolve a CSS color expression (var(), color-mix(), oklch(), keywords) to the
// concrete value rough-notation can set on an SVG stroke attribute. Evaluated in
// the element's own cascade so theme variables resolve to the active palette.
function resolveColor(value: string, context: HTMLElement): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  context.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  context.removeChild(probe);
  return resolved || value;
}

type AnnotationProps = {
  targetRef: React.RefObject<HTMLSpanElement | null>;
  action: AnnotationAction;
  color: string;
  strokeWidth: number;
  animationDuration: number;
  iterations: number;
  padding: number;
  multiline: boolean;
  animate: boolean;
};

// Renders nothing — it imperatively syncs a rough-notation annotation onto the
// target span for as long as it is mounted. The parent mounts it only once the
// annotation should be visible, and remounts it (via `key`) when the config
// changes, so all the "when do we (re)draw" logic lives in mount/unmount.
function Annotation({
  targetRef,
  action,
  color,
  strokeWidth,
  animationDuration,
  iterations,
  padding,
  multiline,
  animate,
}: AnnotationProps) {
  useMountEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    let annotation: RoughAnnotation | null = null;
    let firstDraw = true;

    const draw = () => {
      annotation?.remove();
      annotation = annotate(element, {
        type: action,
        color: resolveColor(color, element),
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
        // Animate only the initial reveal; theme-change redraws snap into place.
        animate: firstDraw && animate,
      });
      annotation.show();
      firstDraw = false;
    };

    draw();

    // Re-resolve the color and redraw when the palette (data-theme) or light/dark
    // mode (class) changes on the document root. rough-notation already handles
    // resize/reflow via its own observers, so we only watch for theme swaps here.
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
      annotation?.remove();
    };
  });

  return null;
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  enabled = true,
  className,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();

  // If isView is false, draw as soon as enabled; otherwise also wait for inView.
  const shouldShow = enabled && (!isView || isInView);
  const animate = !reduceMotion;

  // Plain inline span so wrapped phrases can break across lines (multiline).
  return (
    <span ref={elementRef} className={cn("bg-transparent", className)}>
      {children}
      {shouldShow ? (
        <Annotation
          key={`${action}|${color}|${strokeWidth}|${animationDuration}|${iterations}|${padding}|${multiline}|${animate}`}
          targetRef={elementRef}
          action={action}
          color={color}
          strokeWidth={strokeWidth}
          animationDuration={animationDuration}
          iterations={iterations}
          padding={padding}
          multiline={multiline}
          animate={animate}
        />
      ) : null}
    </span>
  );
}
