"use client";

import { useState } from "react";
import { v7 as uuidv7 } from "uuid";

/**
 * A stable, browser-scoped id persisted to localStorage under `key`.
 *
 * Unlike `useLocalStorage`, the generated id is written to storage immediately
 * (in the lazy initializer) so it survives reloads from the very first visit —
 * without a mount effect. Returns `""` during SSR; the real id is read/created
 * on the first client render (the value is used only as a query arg, never
 * rendered, so there is no hydration mismatch).
 */
export function usePersistentId(key: string): string {
  const [id] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const created = uuidv7();
      window.localStorage.setItem(key, created);
      return created;
    } catch {
      return uuidv7();
    }
  });
  return id;
}
