"use client";

import { Paperclip } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import * as React from "react";
import { SpotlightCard } from "@/components/ui/componentry/spotlight-card";
import { EXPERIENCES, type ExperienceEntry } from "@/lib/new-site/data";
import AttachmentDialog from "./attachment-dialog";

function formatDuration(start: Date, end?: Date): string {
  const endDate = end ?? new Date();
  const months =
    (endDate.getFullYear() - start.getFullYear()) * 12 + (endDate.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths || 1}mos`;
  if (remMonths === 0) return `${years}yrs`;
  return `${years}yrs ${remMonths}mos`;
}

function formatRange(start: Date, end?: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${fmt(start)} – ${end ? fmt(end) : "Present"}`;
}

function ToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-foreground"
    >
      {isOpen ? (
        <svg width="12" height="12" viewBox="0 0 14 2" fill="none" role="img" aria-hidden="true">
          <title>Collapse</title>
          <path d="M1 1h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" role="img" aria-hidden="true">
          <title>Expand</title>
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      )}
    </motion.span>
  );
}

function ExperienceCard({
  experience,
  isOpen,
  onToggle,
  itemId,
  panelId,
}: {
  experience: ExperienceEntry;
  isOpen: boolean;
  onToggle: () => void;
  itemId: string;
  panelId: string;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = React.useState(0);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContentH(el.scrollHeight));
    ro.observe(el);
    setContentH(el.scrollHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
      animate={{ scale: isOpen ? 1 : 0.99 }}
      initial={false}
      style={{ originX: 0.5, originY: 0 }}
    >
      <SpotlightCard borderColor="var(--border)" className="shadow-md dark:shadow-2xl">
        <button
          id={itemId}
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="flex w-full cursor-pointer select-none items-center gap-4 px-6 py-5 text-left"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted/50 ring-1 ring-border">
            <Image
              src={experience.logo}
              alt={experience.logoAlt}
              fill
              sizes="44px"
              className={
                experience.darkLogo ? "object-contain p-1.5 dark:hidden" : "object-contain p-1.5"
              }
            />
            {experience.darkLogo ? (
              <Image
                src={experience.darkLogo}
                alt=""
                aria-hidden
                fill
                sizes="44px"
                className="hidden object-contain p-1.5 dark:block"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-sm">{experience.position}</p>
              {experience.current ? (
                <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 font-medium text-[10px] text-primary">
                  Current
                </span>
              ) : null}
            </div>
            <p className="truncate text-muted-foreground text-xs">{experience.company}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatRange(experience.startDate, experience.endDate)}
              <span className="mx-1.5 opacity-40">·</span>
              {formatDuration(experience.startDate, experience.endDate)}
            </p>
          </div>

          <ToggleIcon isOpen={isOpen} />
        </button>

        <motion.div
          id={panelId}
          role="region"
          aria-labelledby={itemId}
          animate={{ height: isOpen ? contentH : 0, opacity: isOpen ? 1 : 0 }}
          initial={false}
          transition={{
            height: { type: "spring", stiffness: 340, damping: 34, mass: 0.9 },
            opacity: { duration: 0.2, ease: "easeOut" },
          }}
          style={{ overflow: "hidden" }}
        >
          <motion.div
            ref={contentRef}
            animate={{ y: isOpen ? 0 : -8 }}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
            className="px-6 pb-6"
          >
            <ul className="flex list-disc flex-col gap-2 pl-4 text-muted-foreground text-sm leading-relaxed">
              {experience.summary.map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
            {experience.attachedFile ? (
              <AttachmentDialog
                fileUrl={experience.attachedFile}
                title={experience.company}
                description={experience.position}
              >
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-medium text-foreground text-xs transition-colors hover:bg-muted"
                >
                  <Paperclip className="size-3.5" />
                  View attachment
                </button>
              </AttachmentDialog>
            ) : null}
          </motion.div>
        </motion.div>
      </SpotlightCard>
    </motion.div>
  );
}

export default function ExperienceCards() {
  const rawId = React.useId();
  const baseId = `experience-${rawId.replace(/:/g, "")}`;
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <motion.div layout className="flex flex-col gap-4">
      {EXPERIENCES.map((experience, i) => (
        <ExperienceCard
          key={experience.company}
          experience={experience}
          isOpen={openIndex === i}
          onToggle={() => toggle(i)}
          itemId={`${baseId}-trigger-${i}`}
          panelId={`${baseId}-panel-${i}`}
        />
      ))}
    </motion.div>
  );
}
