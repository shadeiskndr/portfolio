"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the page has been scrolled down past `threshold`; false again on
 * any upward scroll. Used to tuck the mobile dock away while reading.
 *
 * Pages that scroll an inner container rather than the window (chat, the
 * resume builder) never move `window.scrollY`, so the dock simply stays put
 * there — which is the behaviour we want, since those pages have no other
 * navigation affordance.
 */
export function useHideOnScroll({ threshold = 96, delta = 6 } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const diff = y - lastY.current;
        // Below the delta the reading is jitter (or momentum rubber-banding);
        // leave lastY alone so small moves still accumulate into a real one.
        if (Math.abs(diff) < delta) return;
        // Near the top there is nothing to gain by hiding, and iOS overscroll
        // makes it flicker. Otherwise direction decides — including at the
        // page end, where the dock stays away until you scroll back up.
        setHidden(y < threshold ? false : diff > 0);
        lastY.current = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold, delta]);

  return hidden;
}
