"use client";

import * as React from "react";

type EventType = "mousedown" | "mouseup" | "touchstart" | "touchend" | "focusin" | "focusout";

const DEFAULT_EVENT_OPTIONS: AddEventListenerOptions = {};

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null> | React.RefObject<T | null>[],
  handler: (event: MouseEvent | TouchEvent | FocusEvent) => void,
  eventType: EventType = "mousedown",
  eventListenerOptions: AddEventListenerOptions = DEFAULT_EVENT_OPTIONS
): void {
  const savedHandler = React.useRef(handler);

  React.useEffect(() => {
    savedHandler.current = handler;
  });

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent | FocusEvent) => {
      const target = event.target as Node;

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
