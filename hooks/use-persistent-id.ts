"use client";

import { useState } from "react";
import { v7 as uuidv7 } from "uuid";

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
