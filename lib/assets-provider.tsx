"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { createContext, useContext, useMemo } from "react";
import type { api } from "@/convex/_generated/api";

export type ResolvedAsset = {
  url: string;
  width: number | null;
  height: number | null;
  title: string;
};

const AssetsContext = createContext<Map<string, ResolvedAsset>>(new Map());

export function AssetsProvider({
  preloaded,
  children,
}: {
  preloaded: Preloaded<typeof api.assets.list>;
  children: React.ReactNode;
}) {
  const assets = usePreloadedQuery(preloaded);

  const map = useMemo(() => {
    const m = new Map<string, ResolvedAsset>();
    for (const a of assets) {
      if (!a.url) continue;
      m.set(a.key, { url: a.url, width: a.width, height: a.height, title: a.title });
    }
    return m;
  }, [assets]);

  return <AssetsContext.Provider value={map}>{children}</AssetsContext.Provider>;
}

export function useAsset(key: string | undefined): ResolvedAsset | undefined {
  const map = useContext(AssetsContext);
  return key ? map.get(key) : undefined;
}
