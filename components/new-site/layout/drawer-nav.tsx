"use client";

import { CircleUserRound } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { playClick } from "@/hooks/use-sound";
import { NAV_LINKS } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";

/**
 * The drawer is the primary way to navigate below `lg` — the top-bar strip only
 * has room for two or three links on a phone. Two columns fit all 13 routes on
 * one screen above the profile card, so the whole site map is visible in a
 * single tap instead of a swipe hunt.
 */
export default function DrawerNav({
  onNavigate,
  onOpenProfile,
}: {
  onNavigate: () => void;
  onOpenProfile: () => void;
}) {
  const pathname = usePathname();
  const oddCount = NAV_LINKS.length % 2 === 1;

  return (
    <nav aria-label="Primary" className="px-3 pt-3">
      <button
        type="button"
        onClick={() => {
          playClick();
          onOpenProfile();
        }}
        className="mb-2 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-[0.9375rem] text-muted-foreground transition-colors active:bg-muted/60"
      >
        <CircleUserRound className="size-4 shrink-0" />
        Profile
      </button>
      <ul className="grid grid-cols-2 gap-0.5">
        {NAV_LINKS.map((link, i) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li
              key={link.href}
              className={cn(oddCount && i === NAV_LINKS.length - 1 && "col-span-2")}
            >
              <NextLink
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  playClick();
                  onNavigate();
                }}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 text-[0.9375rem] transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground active:bg-muted/60"
                )}
              >
                {link.label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
