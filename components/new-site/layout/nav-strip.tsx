"use client";

import { LayoutGroup, m } from "motion/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useHorizontalScrollState } from "@/hooks/use-horizontal-scroll-state";
import { playClick } from "@/hooks/use-sound";
import { NAV_LINKS } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";
import NavScrollButton from "./nav-scroll-button";

export default function NavStrip({
  groupId,
  showArrows = false,
  className,
}: {
  groupId: string;
  showArrows?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const { ref, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScrollState<HTMLUListElement>();
  const hasCentered = useRef(false);

  const handleScrollLeft = useCallback(() => scrollBy("left"), [scrollBy]);
  const handleScrollRight = useCallback(() => scrollBy("right"), [scrollBy]);
  const handleLinkClick = useCallback(() => playClick(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: route-change trigger
  useEffect(() => {
    const list = ref.current;
    if (!list?.clientWidth) return;
    const active = list.querySelector<HTMLElement>("[data-active='true']");
    if (!active) return;
    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.left >= listRect.left && activeRect.right <= listRect.right) {
      hasCentered.current = true;
      return;
    }
    const delta = activeRect.left - listRect.left - (list.clientWidth - activeRect.width) / 2;
    list.scrollTo({
      left: Math.max(0, list.scrollLeft + delta),
      behavior: hasCentered.current ? "smooth" : "instant",
    });
    hasCentered.current = true;
  }, [pathname, ref]);

  return (
    <div className={cn("flex min-w-0 flex-1 items-center", className)}>
      {showArrows ? (
        <NavScrollButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={handleScrollLeft}
          className="hidden lg:inline-flex"
        />
      ) : null}
      <ul
        ref={ref}
        style={
          {
            "--nav-fade-start": canScrollLeft ? "24px" : "0px",
            "--nav-fade-end": canScrollRight ? "24px" : "0px",
          } as React.CSSProperties
        }
        className="hide-scrollbar nav-scroller flex flex-1 items-center gap-0.5 overflow-x-auto scroll-smooth sm:gap-1"
      >
        <LayoutGroup id={groupId}>
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href} data-active={active}>
                <NextLink
                  href={link.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  onClick={handleLinkClick}
                  className={cn(
                    "relative inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors lg:min-h-0",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {active ? (
                    <m.span
                      layoutId={`${groupId}-active`}
                      className="absolute inset-0 rounded-md bg-muted"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
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
      {showArrows ? (
        <NavScrollButton
          direction="right"
          disabled={!canScrollRight}
          onClick={handleScrollRight}
          className="hidden lg:inline-flex"
        />
      ) : null}
    </div>
  );
}
