"use client";

import * as React from "react";

type EventType = "mousedown" | "mouseup" | "touchstart" | "touchend" | "focusin" | "focusout";

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null> | React.RefObject<T | null>[],
  handler: (event: MouseEvent | TouchEvent | FocusEvent) => void,
  eventType: EventType = "mousedown",
  eventListenerOptions: AddEventListenerOptions = {}
): void {
  const savedHandler = React.useRef(handler);

  // useEffect (not useLayoutEffect) keeps the ref fresh without emitting an
  // SSR warning; the handler is only ever read inside a user-triggered event.
  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

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
