"use client";

import { domMax, LazyMotion } from "motion/react";
import BottomDock from "@/components/new-site/layout/bottom-dock";
import { MusicPlayerProvider } from "@/components/new-site/layout/music-player-provider";
import Sidebar from "@/components/new-site/layout/sidebar";
import { useSidebarCollapse } from "@/components/new-site/layout/sidebar-collapse-provider";
import TopNav from "@/components/new-site/layout/top-nav";
import { cn } from "@/lib/utils";

export default function PortfolioShell({ children }: { children: React.ReactNode }) {
  const { collapsed, animate } = useSidebarCollapse();

  return (
    <LazyMotion features={domMax}>
      <MusicPlayerProvider>
        <div
          className={cn(
            "mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1",
            animate && "transition-[grid-template-columns] duration-300 ease-in-out",
            collapsed ? "lg:grid-cols-[0px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]"
          )}
        >
          <div
            className={cn(
              "hidden overflow-hidden border-r bg-background/50 lg:sticky lg:top-0 lg:block lg:h-screen",
              animate && "transition-opacity duration-300 ease-in-out",
              collapsed ? "lg:opacity-0" : "lg:opacity-100"
            )}
          >
            <div className="h-full w-75 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
          <div className="flex min-h-screen min-w-0 flex-col">
            <TopNav />
            <main className="flex flex-1 flex-col px-5 pt-8 pb-(--dock-clearance) *:w-full sm:px-6 sm:pt-9 lg:px-12 lg:py-14">
              {children}
            </main>
          </div>
          <BottomDock />
        </div>
      </MusicPlayerProvider>
    </LazyMotion>
  );
}
