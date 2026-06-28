"use client";

import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

type SidebarCollapseState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  animate: boolean;
};

const SidebarCollapseContext = createContext<SidebarCollapseState | undefined>(undefined);

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setStoredCollapsed] = useLocalStorage<boolean>("sidebar-collapsed", false, {
    initializeWithValue: false,
  });
  const [animate, setAnimate] = useState(false);

  const setCollapsed = (next: boolean) => {
    setAnimate(true);
    setStoredCollapsed(next);
  };

  const value: SidebarCollapseState = {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed(!collapsed),
    animate,
  };

  return (
    <SidebarCollapseContext.Provider value={value}>{children}</SidebarCollapseContext.Provider>
  );
}

export const useSidebarCollapse = () => {
  const context = useContext(SidebarCollapseContext);

  if (context === undefined)
    throw new Error("useSidebarCollapse must be used within a SidebarCollapseProvider");

  return context;
};
