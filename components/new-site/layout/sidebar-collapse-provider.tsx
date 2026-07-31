"use client";

import { useCallback, useMemo, useState } from "react";
import {
  SidebarCollapseContext,
  type SidebarCollapseState,
} from "@/components/new-site/layout/sidebar-collapse-context";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setStoredCollapsed] = useLocalStorage<boolean>("sidebar-collapsed", false, {
    initializeWithValue: false,
  });
  const [animate, setAnimate] = useState(false);

  const setCollapsed = useCallback(
    (next: boolean) => {
      setAnimate(true);
      setStoredCollapsed(next);
    },
    [setStoredCollapsed]
  );

  const value = useMemo<SidebarCollapseState>(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed(!collapsed),
      animate,
    }),
    [collapsed, setCollapsed, animate]
  );

  return (
    <SidebarCollapseContext.Provider value={value}>{children}</SidebarCollapseContext.Provider>
  );
}
