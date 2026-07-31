"use client";

import { createContext, useContext } from "react";

export type SidebarCollapseState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  animate: boolean;
};

export const SidebarCollapseContext = createContext<SidebarCollapseState | undefined>(undefined);

export const useSidebarCollapse = () => {
  const context = useContext(SidebarCollapseContext);

  if (context === undefined)
    throw new Error("useSidebarCollapse must be used within a SidebarCollapseProvider");

  return context;
};
