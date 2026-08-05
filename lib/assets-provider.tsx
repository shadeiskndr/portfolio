"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { AssetsContext, type ResolvedAsset } from "@/lib/assets-context";
import type { AssetRow } from "@/lib/assets-server";

export function AssetsProvider({
  assets,
  children,
}: {
  assets: AssetRow[];
  children: React.ReactNode;
}) {
  const live = useQuery(api.assets.list, {});
  const rows = live ?? assets;

  const map = useMemo(() => {
    const m = new Map<string, ResolvedAsset>();
    for (const a of rows) {
      if (!a.url) continue;
      m.set(a.key, { url: a.url, width: a.width, height: a.height, title: a.title });
    }
    return m;
  }, [rows]);

  return <AssetsContext.Provider value={map}>{children}</AssetsContext.Provider>;
}
