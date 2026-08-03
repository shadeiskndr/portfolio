"use client";

import { useCallback, useState } from "react";

export function useArrayKeys(length: number) {
  const [state, setState] = useState(() => ({
    keys: Array.from({ length }, (_, i) => i),
    next: length,
  }));

  let keys = state.keys;
  if (keys.length !== length) {
    const resized = keys.slice(0, length);
    let next = state.next;
    while (resized.length < length) {
      resized.push(next);
      next += 1;
    }
    keys = resized;
    setState({ keys: resized, next });
  }

  const removeKey = useCallback((index: number) => {
    setState((prev) => ({ ...prev, keys: prev.keys.filter((_, i) => i !== index) }));
  }, []);

  const moveKey = useCallback((from: number, to: number) => {
    setState((prev) => {
      const reordered = prev.keys.slice();
      const [moved] = reordered.splice(from, 1);
      if (moved !== undefined) reordered.splice(to, 0, moved);
      return { ...prev, keys: reordered };
    });
  }, []);

  return { keys, removeKey, moveKey };
}
