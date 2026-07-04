"use client";

import * as React from "react";

export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);

  // Keep the latest callback in a ref without listing it as a dependency:
  // depending on a fresh function each render re-runs the effect every render.
  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    if (delay === null || typeof delay !== "number") return;

    const tick = () => savedCallback.current();

    const id = setTimeout(tick, delay);

    return () => clearTimeout(id);
  }, [delay]);
}
