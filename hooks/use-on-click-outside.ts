"use client";

import * as React from "react";

type EventType = "mousedown" | "mouseup" | "touchstart" | "touchend" | "focusin" | "focusout";

// Stable default so callers that omit options don't pass a fresh `{}` every
// render, which would otherwise re-subscribe the listener effect each render.
const DEFAULT_EVENT_OPTIONS: AddEventListenerOptions = {};

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null> | React.RefObject<T | null>[],
  handler: (event: MouseEvent | TouchEvent | FocusEvent) => void,
  eventType: EventType = "mousedown",
  eventListenerOptions: AddEventListenerOptions = DEFAULT_EVENT_OPTIONS
): void {
  const savedHandler = React.useRef(handler);

  // useEffect (not useLayoutEffect) keeps the ref fresh without emitting an
  // SSR warning; the handler is only ever read inside a user-triggered event.
  // No dependency array: a fresh handler each render must not re-run the effect.
  React.useEffect(() => {
    savedHandler.current = handler;
  });

  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent | FocusEvent) => {
      const target = event.target as Node;

      // Do nothing if the target is no longer connected to the document.
      if (!target?.isConnected) {
        return;
      }

      const isOutside = Array.isArray(ref)
        ? ref
            .filter((r) => Boolean(r.current))
            .every((r) => r.current && !r.current.contains(target))
        : ref.current && !ref.current.contains(target);

      if (isOutside) {
        savedHandler.current(event);
      }
    };

    document.addEventListener(eventType, listener as EventListener, eventListenerOptions);

    return () => {
      document.removeEventListener(eventType, listener as EventListener, eventListenerOptions);
    };
  }, [ref, eventType, eventListenerOptions]);
}

export type { EventType };
