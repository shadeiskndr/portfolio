"use client";

import { m } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface MotionAccordionItem {
  question: React.ReactNode;
  answer: React.ReactNode;
}

export interface MotionAccordionProps {
  items: MotionAccordionItem[];
  gap?: number;
  className?: string;
}

function AccordionItem({
  item,
  isOpen,
  index,
  onToggle,
  itemId,
  panelId,
}: {
  item: MotionAccordionItem;
  isOpen: boolean;
  index: number;
  onToggle: (index: number) => void;
  itemId: string;
  panelId: string;
}) {
  const handleToggle = React.useCallback(() => onToggle(index), [onToggle, index]);

  return (
    <m.div
      layout
      className={cn(
        "overflow-hidden rounded-[30px] bg-surface text-foreground shadow-xs",
        isOpen && " "
      )}
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
      animate={{ scale: isOpen ? 1 : 0.985 }}
      initial={false}
      style={{ originX: 0.5, originY: 0 }}
    >
      <button
        id={itemId}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="flex w-full cursor-pointer select-none items-center justify-between gap-4 px-7 py-5 text-left"
      >
        <span className="font-medium text-[clamp(1.2rem,1.6vw,1.3rem)] leading-snug">
          {item.question}
        </span>

        <m.span
          aria-hidden="true"
          initial={false}
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 480, damping: 28 }}
          className="inline-flex size-12 shrink-0 items-center justify-center text-foreground"
        >
          {isOpen ? (
            <svg width="14" height="14" viewBox="0 0 14 2" fill="none" aria-hidden="true">
              <path d="M1 1h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          )}
        </m.span>
      </button>

      <section
        id={panelId}
        aria-labelledby={itemId}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <m.div
            animate={{ y: isOpen ? 0 : -8 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 30,
              mass: 0.8,
            }}
            className="px-7 pb-7"
          >
            <p className="font-base text-foreground/75 text-lg leading-8 tracking-normal">
              {item.answer}
            </p>
          </m.div>
        </div>
      </section>
    </m.div>
  );
}

export function MotionAccordion({ items, gap = 10, className }: MotionAccordionProps) {
  const rawId = React.useId();
  const baseId = `accordion-${rawId.replace(/:/g, "")}`;

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggle = React.useCallback(
    (i: number) => setOpenIndex((prev) => (prev === i ? null : i)),
    []
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col rounded-[34px] p-3" style={{ gap }}>
        {items.map((item, i) => (
          <AccordionItem
            // react-doctor-disable-next-line react-doctor/no-array-index-as-key
            key={i}
            item={item}
            isOpen={openIndex === i}
            index={i}
            onToggle={toggle}
            itemId={`${baseId}-trigger-${i}`}
            panelId={`${baseId}-panel-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
