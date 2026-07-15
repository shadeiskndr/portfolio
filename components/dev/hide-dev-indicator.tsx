"use client";

import { useEffect } from "react";

const STYLE_ID = "hide-nextjs-devtools-indicator";

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

    if (inject()) return;
    const observer = new MutationObserver(() => {
      if (inject()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
