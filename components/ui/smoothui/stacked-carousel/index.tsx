"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { SpotlightCard } from "@/components/ui/componentry/spotlight-card";
import { useEventCallback } from "@/hooks/use-event-callback";
import { useEventListener } from "@/hooks/use-event-listener";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useStep } from "@/hooks/use-step";
import { useTimeout } from "@/hooks/use-timeout";
import { cn } from "@/lib/utils";

const FRAME_OFFSET = -30;
const FRAMES_VISIBLE_LENGTH = 3;
// The wheel listener must be non-passive so it can preventDefault; the cooldown
// collapses a single trackpad/wheel gesture's burst of events into one step.
const WHEEL_OPTIONS = { passive: false } as const;
const WHEEL_COOLDOWN_MS = 450;

function clamp(val: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(val, min), max);
}

export interface CarouselItem {
  id: string | number;
  content: ReactNode;
}

interface StackedCardProps {
  activeIndex: number;
  index: number;
  item: CarouselItem;
  totalCards: number;
}

function StackedCard({ item, index, activeIndex, totalCards }: StackedCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const offsetIndex = index - activeIndex;

  const blur = activeIndex > index ? 2 : 0;
  const opacity = activeIndex > index ? 0 : 1;
  const scale = shouldReduceMotion ? 1 : clamp(1 - offsetIndex * 0.08, [0.08, 2]);
  const y = shouldReduceMotion
    ? 0
    : clamp(offsetIndex * FRAME_OFFSET, [
        FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
        Number.POSITIVE_INFINITY,
      ]);

  const isActive = index === activeIndex;

  return (
    <motion.div
      animate={{
        y,
        scale,
        transition: {
          type: "spring" as const,
          stiffness: 250,
          damping: 20,
          mass: 0.5,
          duration: 0.25,
        },
      }}
      className="absolute left-1/2 w-[calc(100%-2rem)] max-w-150 -translate-x-1/2 -translate-y-1/2"
      initial={false}
      style={{
        willChange: "opacity, filter, transform",
        filter: `blur(${blur}px)`,
        opacity,
        transitionProperty: "opacity, filter",
        transitionDuration: shouldReduceMotion ? "0ms" : "250ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: totalCards - index,
        pointerEvents: isActive ? "auto" : "none",
        // Anchor slightly below center so the upward-growing stack of cards
        // behind the active one has clearance (e.g. from a tab bar above).
        top: "58%",
      }}
    >
      {/* SpotlightCard owns the chrome. Its opaque bg-card lets the active card
          fully cover the ones behind it, so the stack reads through the peeking
          offset edges + scale + shadow rather than see-through translucency
          (nesting breaks backdrop-blur, which would otherwise blur the cards
          behind). The spotlight only reacts on the active card, which alone has
          pointer-events enabled above. */}
      <SpotlightCard
        borderColor="color-mix(in oklch, var(--foreground) 10%, transparent)"
        className="p-5 shadow-lg sm:p-6"
      >
        {item.content}
      </SpotlightCard>
    </motion.div>
  );
}

interface NavigationButtonProps {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}

function NavigationButton({ direction, onClick, disabled }: NavigationButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      aria-label={direction === "prev" ? "Previous" : "Next"}
      className={cn(
        "group relative z-0 flex h-7 w-7 items-center justify-center rounded-full border-[0.5px] border-foreground/10 bg-background/50 backdrop-blur-sm transition-all duration-200",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "cursor-pointer hover:border-foreground/20 hover:bg-background/70 hover:shadow-lg",
        "dark:border-foreground/5 dark:bg-foreground/5 dark:hover:border-foreground/10 dark:hover:bg-foreground/10"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 text-foreground/60 transition-colors",
          "group-hover:text-foreground group-disabled:text-foreground/20"
        )}
      />
    </button>
  );
}

export interface StackedCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  excludeIds?: (string | number)[];
  height?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
}

export default function StackedCarousel({
  items,
  className = "",
  height = "300px",
  excludeIds = [],
  showIndicators = true,
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}: StackedCarouselProps) {
  const filteredItems = useMemo(() => {
    if (excludeIds.length === 0) {
      return items;
    }
    const excludeSet = new Set(excludeIds);
    return items.filter((item) => !excludeSet.has(item.id));
  }, [items, excludeIds]);

  const containerRef = useRef<HTMLDivElement>(null);
  // The ref guards synchronously so a wheel gesture's burst collapses to one
  // step even before React re-renders; the state arms the declarative cooldown.
  const wheelLockRef = useRef(false);
  const [wheelLocked, setWheelLocked] = useState(false);

  // useStep is 1-indexed: step N renders item N-1 as the active card.
  const [
    currentStep,
    { goToNextStep, goToPrevStep, setStep, canGoToNextStep, canGoToPrevStep, reset },
  ] = useStep(filteredItems.length);
  const activeIndex = currentStep - 1;

  // Auto-play. The tick is wrapped in useEventCallback so the mount-once
  // interval always sees the latest step — useStep's callbacks close over
  // currentStep and would otherwise go stale.
  const advance = useEventCallback(() => {
    if (canGoToNextStep) {
      goToNextStep();
    } else {
      reset();
    }
  });
  useMountEffect(() => {
    if (!autoPlay || filteredItems.length <= 1) {
      return;
    }
    const interval = setInterval(advance, autoPlayInterval);
    return () => clearInterval(interval);
  });

  // Keyboard navigation (global arrow keys). useEventListener stores the latest
  // handler, so the step callbacks stay current.
  useEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goToPrevStep();
    } else if (event.key === "ArrowRight") {
      goToNextStep();
    }
  });

  // Scroll / trackpad navigation over the stack. preventDefault only while the
  // stack can still move in that direction, so reaching either end releases the
  // scroll back to the page instead of trapping it. The cooldown throttles a
  // gesture's burst of wheel events down to a single step.
  useEventListener(
    "wheel",
    (event) => {
      const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (direction === 0) {
        return;
      }
      const canMove = direction > 0 ? canGoToNextStep : canGoToPrevStep;
      if (!canMove) {
        return;
      }
      event.preventDefault();
      if (wheelLockRef.current) {
        return;
      }
      wheelLockRef.current = true;
      setWheelLocked(true);
      if (direction > 0) {
        goToNextStep();
      } else {
        goToPrevStep();
      }
    },
    containerRef,
    WHEEL_OPTIONS
  );

  // Release the wheel cooldown declaratively. A null delay keeps the timeout
  // disarmed while unlocked; it re-arms each time a wheel step locks again, and
  // is cleared automatically if the carousel unmounts mid-cooldown.
  useTimeout(
    () => {
      wheelLockRef.current = false;
      setWheelLocked(false);
    },
    wheelLocked ? WHEEL_COOLDOWN_MS : null
  );

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative mx-auto w-full max-w-4xl", className)}
      ref={containerRef}
      style={{ height }}
    >
      {/* Stack of cards */}
      <div className="relative h-full w-full py-8">
        <div className="grid h-full w-full place-items-center">
          {filteredItems.map((item, index) => (
            <StackedCard
              activeIndex={activeIndex}
              index={index}
              item={item}
              key={item.id}
              totalCards={filteredItems.length}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      {(showNavigation || showIndicators) && filteredItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
          {showNavigation && (
            <NavigationButton direction="prev" disabled={!canGoToPrevStep} onClick={goToPrevStep} />
          )}
          {showIndicators && (
            <div className="flex items-center gap-2">
              {filteredItems.map((item, index) => (
                <button
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    index === activeIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-primary/30 hover:bg-primary/50"
                  )}
                  key={item.id}
                  onClick={() => setStep(index + 1)}
                  type="button"
                />
              ))}
            </div>
          )}
          {showNavigation && (
            <NavigationButton direction="next" disabled={!canGoToNextStep} onClick={goToNextStep} />
          )}
        </div>
      )}
    </div>
  );
}
