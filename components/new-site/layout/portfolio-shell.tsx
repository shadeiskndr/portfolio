"use client";

import Sidebar from "@/components/new-site/layout/sidebar";
import { useSidebarCollapse } from "@/components/new-site/layout/sidebar-collapse-provider";
import TopNav from "@/components/new-site/layout/top-nav";
import { cn } from "@/lib/utils";

export default function PortfolioShell({ children }: { children: React.ReactNode }) {
  const { collapsed, animate } = useSidebarCollapse();

  return (
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
        <main className="flex flex-1 flex-col px-6 py-10 *:w-full lg:px-12 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
