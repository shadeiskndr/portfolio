"use client";

import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { Streamdown } from "streamdown";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Shimmer } from "./shimmer";

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = true,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    // Open at mount only while actively streaming. Historical reasoning (e.g.
    // after switching sessions) must start collapsed — otherwise it opens for a
    // moment and then auto-closes, which reads as a jarring flash.
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen && isStreaming);
    const isOpen = open ?? uncontrolledOpen;
    const setIsOpen = useCallback(
      (next: boolean) => {
        if (open === undefined) {
          setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
      },
      [open, onOpenChange]
    );
    const [measuredDuration, setDuration] = useState<number | undefined>(undefined);
    const duration = durationProp ?? measuredDuration;

    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    // Refs, not state: neither value is ever rendered. hasStreamed records
    // whether this block streamed during its lifetime — historical blocks
    // (opened after the fact) never stream, so they must never auto-close.
    // startTime anchors the thinking-duration measurement.
    const hasStreamedRef = useRef(isStreaming);
    const startTimeRef = useRef<number | null>(null);

    // Runs at most once per stream (from the timer below): close the panel and
    // consume the one-shot auto-close. Reads the latest state at fire time, so
    // a panel the user already closed isn't "re-closed" (no spurious
    // onOpenChange), and a later manual open sticks.
    const autoClose = useEffectEvent(() => {
      if (isOpen) {
        setIsOpen(false);
      }
      setHasAutoClosed(true);
    });

    // Stream start: anchor the duration measurement and auto-open — covers a
    // block that mounts before its stream begins.
    const handleStreamStart = useEffectEvent(() => {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      if (defaultOpen && !hasAutoClosed) {
        setIsOpen(true);
      }
    });

    // Stream end: record the measured duration, then auto-close after a small
    // delay (once only) so the user can see the content. Returns the timer
    // cleanup so a re-started stream or unmount cancels the pending close.
    const handleStreamEnd = useEffectEvent((): (() => void) | undefined => {
      if (startTimeRef.current !== null) {
        setDuration(Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S));
        startTimeRef.current = null;
      }
      if (defaultOpen && isOpen && !hasAutoClosed) {
        const timer = setTimeout(autoClose, AUTO_CLOSE_DELAY);
        return () => clearTimeout(timer);
      }
      return undefined;
    });

    // Subscribe to isStreaming transitions only. The effect events above read
    // the latest props/state without being dependencies, so a parent re-render
    // (e.g. a recreated onOpenChange) can't re-arm the auto-close timer.
    useEffect(() => {
      if (isStreaming) {
        hasStreamedRef.current = true;
        handleStreamStart();
        return undefined;
      }
      if (!hasStreamedRef.current) {
        return undefined;
      }
      return handleStreamEnd();
    }, [isStreaming]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    const contextValue = useMemo(
      () => ({ isStreaming, isOpen, setIsOpen, duration }),
      [isStreaming, isOpen, setIsOpen, duration]
    );

    return (
      <ReasoningContext.Provider value={contextValue}>
        <Collapsible
          className={cn("not-prose mb-4", className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  }
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number) => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>Thinking...</Shimmer>;
  }
  if (duration === undefined) {
    return <p>Thought for a few seconds</p>;
  }
  return <p>Thought for {duration} seconds</p>;
};

export const ReasoningTrigger = memo(
  ({
    className,
    children,
    getThinkingMessage = defaultGetThinkingMessage,
    ...props
  }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainIcon className="size-4" />
            {getThinkingMessage(isStreaming, duration)}
            <ChevronDownIcon
              className={cn("size-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

export type ReasoningContentProps = {
  className?: string;
  children: string;
  plugins?: ComponentProps<typeof Streamdown>["plugins"];
  animated?: ComponentProps<typeof Streamdown>["animated"];
  isAnimating?: ComponentProps<typeof Streamdown>["isAnimating"];
};

export const ReasoningContent = memo(
  ({ className, children, plugins, animated, isAnimating }: ReasoningContentProps) => {
    const { isOpen } = useReasoning();
    const shouldReduceMotion = useReducedMotion();

    return (
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            // Height snaps to `auto` after the tween, so streaming content that
            // grows while the panel is open keeps expanding without clipping.
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            key="reasoning-content"
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
            }
          >
            <div className={cn("mt-4 text-muted-foreground text-sm", className)}>
              <Streamdown
                animated={animated}
                isAnimating={isAnimating}
                plugins={plugins}
                linkSafety={{ enabled: false }}
              >
                {children}
              </Streamdown>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }
);

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";

/** Demo component for preview */
export default function ReasoningDemo() {
  return (
    <div className="w-full max-w-2xl p-6">
      <Reasoning defaultOpen={true} duration={12}>
        <ReasoningTrigger />
        <ReasoningContent>
          Let me think through this step by step... First, I need to consider the user's
          requirements. They want a solution that is both efficient and maintainable. Looking at the
          codebase, I can see several potential approaches: 1. **Refactor the existing module** -
          This would minimize disruption 2. **Create a new abstraction layer** - More work but
          cleaner long-term 3. **Use a library solution** - Fastest but adds a dependency After
          weighing the tradeoffs, I believe option 2 provides the best balance of maintainability
          and performance.
        </ReasoningContent>
      </Reasoning>
    </div>
  );
}
