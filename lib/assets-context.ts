"use client";

import { createContext, useContext } from "react";

export type ResolvedAsset = {
  url: string;
  width: number | null;
  height: number | null;
  title: string;
};

export const AssetsContext = createContext<Map<string, ResolvedAsset>>(new Map());

export function useAsset(key: string | undefined): ResolvedAsset | undefined {
  const map = useContext(AssetsContext);
  return key ? map.get(key) : undefined;
}
