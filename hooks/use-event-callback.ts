"use client";

import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";

/**
 * Custom hook that creates a memoized event callback that's safe to call during rendering.
 *
 * This hook ensures that the callback always has access to the latest values
 * while maintaining a stable reference, preventing unnecessary re-renders.
 */
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R;
export function useEventCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined
): ((...args: Args) => R) | undefined;
export function useEventCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined
): ((...args: Args) => R) | undefined {
  const ref = useRef<typeof fn>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  // No dependency array: `fn` is a fresh function each render, so listing it
  // would re-run the effect every render. Syncing the ref on every commit is
  // exactly the intended latest-ref behavior.
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: Args) => ref.current?.(...args), [ref]) as (...args: Args) => R;
}
