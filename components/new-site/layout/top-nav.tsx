"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useHorizontalScrollState } from "@/hooks/use-horizontal-scroll-state";
import { NAV_LINKS } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";
import NavScrollButton from "./nav-scroll-button";
import SidebarDrawer from "./sidebar-drawer";
import ThemeControls from "./theme-controls";

export default function TopNav() {
  const pathname = usePathname();
  const { ref, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScrollState<HTMLUListElement>();

  return (
    <nav className="flex items-center justify-between gap-2 border-b px-6 py-4 lg:px-10">
      <SidebarDrawer />
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
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/new" ? pathname === "/new" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <NextLink
                  href={link.href}
                  className={cn(
                    "inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </NextLink>
              </li>
            );
          })}
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
