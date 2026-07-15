"use client";

import { useEffect } from "react";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { cn } from "@/lib/utils";
import NavStrip from "./nav-strip";
import SidebarDrawer from "./sidebar-drawer";
import ThemeControls from "./theme-controls";

export default function BottomDock() {
  const hidden = useHideOnScroll();

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
