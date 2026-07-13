"use client";

import { useEffect } from "react";

const STYLE_ID = "hide-nextjs-devtools-indicator";

/**
 * Hides the Next.js DevTools badge, which anchors bottom-left directly on top
 * of the mobile nav dock.
 *
 * Next's own switches for this are dead in 16.3.0-canary.83: `devIndicators:
 * false` is only read for its `position` field, and the `disableDevIndicator`
 * preference is accepted (the POST returns 204 and persists to
 * .next/cache/next-devtools-config.json) but never applied. The badge lives in
 * `<nextjs-portal>`'s shadow root, so a stylesheet cannot reach it either —
 * hence injecting one style rule into that root.
 *
 * Scoped to `#devtools-indicator` so the error overlay in the same shadow root
 * still opens normally. Revisit once the upstream flag works.
 */
export function HideDevIndicator() {
  useEffect(() => {
    const inject = () => {
      const root = document.querySelector("nextjs-portal")?.shadowRoot;
      if (!root) return false;
      if (root.getElementById(STYLE_ID)) return true;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = "#devtools-indicator{display:none!important}";
      root.appendChild(style);
      return true;
    };

    // The portal mounts after hydration, so watch for it if it is not up yet.
    if (inject()) return;
    const observer = new MutationObserver(() => {
      if (inject()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
