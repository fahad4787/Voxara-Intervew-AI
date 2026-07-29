"use client";

import { useEffect } from "react";

/**
 * One shared IntersectionObserver for `.reveal` blocks.
 ~20 lines — no AOS, fires only when content is on screen.
 */
export function RevealInit() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    if (!nodes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      },
      {
        // Wait until ~12% visible and a bit past the bottom edge
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
