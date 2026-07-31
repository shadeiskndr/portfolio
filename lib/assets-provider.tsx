"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useMemo } from "react";
import type { api } from "@/convex/_generated/api";
import { AssetsContext, type ResolvedAsset } from "@/lib/assets-context";

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
