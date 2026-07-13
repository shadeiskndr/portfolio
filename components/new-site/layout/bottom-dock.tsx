"use client";

import { useEffect } from "react";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { cn } from "@/lib/utils";
import NavStrip from "./nav-strip";
import SidebarDrawer from "./sidebar-drawer";
import ThemeControls from "./theme-controls";

/**
 * Mobile navigation. Replaces the top bar below `lg` and tucks itself away on
 * scroll down so a phone spends its height on content rather than chrome.
 */
export default function BottomDock() {
  const hidden = useHideOnScroll();

  // Published on <html> so bottom-anchored page UI can drop into the space the
  // dock gives up — see --dock-shift in globals.css.
  useEffect(() => {
    document.documentElement.dataset.dockHidden = hidden ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.dockHidden;
    };
  }, [hidden]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out lg:hidden",
        // Past 100% so the shadow clears the edge too.
        hidden ? "translate-y-[calc(100%+1.5rem)]" : "translate-y-0"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-1 rounded-2xl border bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-background/60"
      >
        <SidebarDrawer />
        <NavStrip id="dock-nav" />
        <div className="shrink-0">
          <ThemeControls variant="dock" />
        </div>
      </nav>
    </div>
  );
}
