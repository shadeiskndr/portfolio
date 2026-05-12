import { useCallback, useEffect, useRef, useState } from "react";

export function useHorizontalScrollState<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = useCallback((direction: "left" | "right", ratio = 0.6) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * ratio);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return { ref, canScrollLeft, canScrollRight, scrollBy };
}
