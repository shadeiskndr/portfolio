"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback } from "react";
import useScroll from "@/hooks/use-scroll";
import { playClick } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import NavStrip from "./nav-strip";
import { useSidebarCollapse } from "./sidebar-collapse-context";
import ThemeControls from "./theme-controls";

export default function TopNav() {
  const scrolled = useScroll(40);
  const { collapsed, toggle } = useSidebarCollapse();

  const handleToggle = useCallback(() => {
    playClick();
    toggle();
  }, [toggle]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 hidden items-center justify-between gap-2 border-b px-6 py-4 transition-colors lg:flex lg:px-10",
        scrolled
          ? "bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40"
          : "bg-background"
      )}
    >
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        onClick={handleToggle}
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
      <NavStrip groupId="top-nav" showArrows />
      <div className="ml-2 shrink-0">
        <ThemeControls />
      </div>
    </nav>
  );
}
