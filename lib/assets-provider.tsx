"use client";

import { useMemo } from "react";
import { AssetsContext, type ResolvedAsset } from "@/lib/assets-context";
import type { AssetRow } from "@/lib/assets-server";

export function AssetsProvider({
  assets,
  children,
}: {
  assets: AssetRow[];
  children: React.ReactNode;
}) {
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
