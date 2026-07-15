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
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;
  enabled?: boolean;
  className?: string;
}

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
        animate: firstDraw && animate,
      });
      annotation.show();
      firstDraw = false;
    };

    draw();

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

  const shouldShow = enabled && (!isView || isInView);
  const animate = !reduceMotion;

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
