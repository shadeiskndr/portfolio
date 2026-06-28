"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useHorizontalScrollState } from "@/hooks/use-horizontal-scroll-state";
import useScroll from "@/hooks/use-scroll";
import { playClick } from "@/hooks/use-sound";
import { NAV_LINKS } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";
import NavScrollButton from "./nav-scroll-button";
import { useSidebarCollapse } from "./sidebar-collapse-provider";
import SidebarDrawer from "./sidebar-drawer";
import ThemeControls from "./theme-controls";

export default function TopNav() {
  const pathname = usePathname();
  const scrolled = useScroll(40);
  const { collapsed, toggle } = useSidebarCollapse();
  const { ref, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScrollState<HTMLUListElement>();

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-2 border-b px-6 py-4 transition-colors lg:px-10",
        scrolled
          ? "bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40"
          : "bg-background"
      )}
    >
      <SidebarDrawer />
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        onClick={() => {
          playClick();
          toggle();
        }}
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
      <div className="flex min-w-0 flex-1 items-center">
        <NavScrollButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={() => scrollBy("left")}
        />
        <ul
          ref={ref}
          className="hide-scrollbar flex flex-1 items-center gap-1 overflow-x-auto scroll-smooth"
        >
          <LayoutGroup id="top-nav">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <NextLink
                    href={link.href}
                    onClick={() => playClick()}
                    className={cn(
                      "relative inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="top-nav-active"
                        className="absolute inset-0 rounded-md bg-muted"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="relative z-10 grid">
                      <span aria-hidden className="invisible col-start-1 row-start-1 font-medium">
                        {link.label}
                      </span>
                      <span className="col-start-1 row-start-1">{link.label}</span>
                    </span>
                  </NextLink>
                </li>
              );
            })}
          </LayoutGroup>
        </ul>
        <NavScrollButton
          direction="right"
          disabled={!canScrollRight}
          onClick={() => scrollBy("right")}
        />
      </div>
      <div className="ml-2 shrink-0">
        <ThemeControls />
      </div>
    </nav>
  );
}
