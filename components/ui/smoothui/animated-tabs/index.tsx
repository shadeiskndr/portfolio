"use client";

import { m, useReducedMotion } from "motion/react";
import type React from "react";
import { type ReactNode, useCallback, useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedTabsProps {
  activeTab?: string;
  className?: string;
  defaultTab?: string;
  layoutId?: string;
  onChange?: (tabId: string) => void;
  tabs: { id: string; label: string; icon?: ReactNode }[];
  variant?: "underline" | "pill" | "segment";
  radius?: string;
}

const SPRING = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0.05,
};

function TabButton({
  tab,
  index,
  isActive,
  layoutId,
  className,
  indicatorClassName,
  shouldReduceMotion,
  onSelect,
  onKeyDown,
}: {
  tab: AnimatedTabsProps["tabs"][number];
  index: number;
  isActive: boolean;
  layoutId: string;
  className: string;
  indicatorClassName: string;
  shouldReduceMotion: boolean | null;
  onSelect: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
}) {
  const handleClick = useCallback(() => onSelect(tab.id), [onSelect, tab.id]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, index),
    [onKeyDown, index]
  );

  return (
    <button
      aria-selected={isActive}
      className={className}
      id={`${layoutId}-tab-${tab.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      {isActive ? (
        <m.span
          className={indicatorClassName}
          layout
          layoutId={layoutId}
          style={{ originY: "0px" }}
          transition={shouldReduceMotion ? { duration: 0 } : SPRING}
        />
      ) : null}
      {tab.icon ? <span className="relative z-10">{tab.icon}</span> : null}
      <span className="relative z-10">{tab.label}</span>
    </button>
  );
}

export default function AnimatedTabs({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  variant = "underline",
  layoutId: customLayoutId,
  className,
  radius,
}: AnimatedTabsProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId();
  const layoutId = customLayoutId ?? `animated-tabs-${generatedId}`;

  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalActiveTab(tabId);
      }
      onChange?.(tabId);
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }

      const newTab = tabs[newIndex];
      if (newTab) {
        handleTabChange(newTab.id);
        const tabElement = document.getElementById(`${layoutId}-tab-${newTab.id}`);
        tabElement?.focus();
      }
    },
    [tabs, handleTabChange, layoutId]
  );

  const baseContainerStyles = cn(
    "relative inline-flex",
    variant === "underline" && "gap-1 border-border border-b",
    variant === "pill" && ["gap-1 bg-muted p-1", radius ?? "rounded-full"],
    variant === "segment" && "gap-0 rounded-lg bg-muted p-1"
  );

  const getTabStyles = (isActive: boolean) =>
    cn(
      "relative z-10 flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      variant === "underline" && [
        "rounded-t-md",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ],
      variant === "pill" && [
        radius ?? "rounded-full",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ],
      variant === "segment" && [
        "flex-1 rounded-md",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ]
    );

  const getIndicatorStyles = () =>
    cn(
      "absolute",
      variant === "underline" && "right-0 -bottom-px left-0 h-0.5 bg-primary",
      variant === "pill" && [
        "inset-0 border border-border bg-background shadow-sm",
        radius ?? "rounded-full",
      ],
      variant === "segment" && "inset-0 rounded-md border border-border bg-background shadow-sm"
    );

  return (
    <div aria-label="Tabs" className={cn(baseContainerStyles, className)} role="tablist">
      {tabs.map((tab, index) => (
        <TabButton
          className={getTabStyles(activeTab === tab.id)}
          index={index}
          indicatorClassName={getIndicatorStyles()}
          isActive={activeTab === tab.id}
          key={tab.id}
          layoutId={layoutId}
          onKeyDown={handleKeyDown}
          onSelect={handleTabChange}
          shouldReduceMotion={shouldReduceMotion}
          tab={tab}
        />
      ))}
    </div>
  );
}
