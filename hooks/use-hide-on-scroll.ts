"use client";

import { useEffect, useRef, useState } from "react";

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
        if (Math.abs(diff) < delta) return;
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
