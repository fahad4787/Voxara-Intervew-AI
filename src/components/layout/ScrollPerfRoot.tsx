"use client";

import { useEffect } from "react";

/**
 * Pauses decorative CSS animations while the page is scrolling.
 * Look stays the same — animations resume ~140ms after scroll stops.
 */
export function ScrollPerfRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    let timeout = 0;

    const onScroll = () => {
      root.classList.add("is-scrolling");
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        root.classList.remove("is-scrolling");
      }, 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeout);
      root.classList.remove("is-scrolling");
    };
  }, []);

  return children;
}
