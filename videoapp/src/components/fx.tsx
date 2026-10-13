"use client";

import { useEffect } from "react";

/**
 * Site-wide motion controller (one listener set for the whole page, no per-element components):
 *  - [data-reveal]  one-shot scroll reveal (styles in globals.css; `--d` on the element staggers it)
 *  - .spot          hairline highlight that follows the pointer
 *  - [data-tilt]    3D tilt + glare on clip tiles
 *  - --hdr          the sticky header's measured height, used to pin the hero film just below it
 *  - --pre          the height of the line above the header (demo mode), so the hero fits the first screen
 * State lives in data attributes and CSS variables, which React leaves alone on re-render.
 */
export function Fx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | undefined;
    let mo: MutationObserver | undefined;

    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const headerRo = header
      ? new ResizeObserver(() => root.style.setProperty("--hdr", `${header.offsetHeight}px`))
      : undefined;
    if (header) headerRo!.observe(header);
    const banner = document.querySelector<HTMLElement>("[data-site-banner]");
    const bannerRo = banner
      ? new ResizeObserver(() => root.style.setProperty("--pre", `${banner.offsetHeight}px`))
      : undefined;
    if (banner) bannerRo!.observe(banner);

    if (!reduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            (e.target as HTMLElement).dataset.in = "";
            io!.unobserve(e.target);
          }
        },
        { rootMargin: "0px 0px -2% 0px", threshold: 0 },
      );
      const watch = (scope: ParentNode, initial: boolean) => {
        for (const el of scope.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")) {
          // Whatever is already on screen when the page loads is shown as it is: no flash, no late pop-in.
          if (initial && el.getBoundingClientRect().top < window.innerHeight * 0.95) el.dataset.in = "";
          else io!.observe(el);
        }
      };
      watch(document, true);
      root.classList.add("fx-ready");
      // Client-side navigation and streamed content bring new elements after this effect ran.
      mo = new MutationObserver((records) => {
        for (const r of records) for (const n of r.addedNodes) if (n instanceof HTMLElement) {
          if (n.matches("[data-reveal]:not([data-in])")) io!.observe(n);
          watch(n, false);
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    let tilted: HTMLElement | null = null;
    const release = (el: HTMLElement | null) => {
      if (!el) return;
      delete el.dataset.tilting;
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element | null;
      const spot = target?.closest<HTMLElement>(".spot");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const tilt = reduced ? null : (target?.closest<HTMLElement>("[data-tilt]") ?? null);
      if (tilt !== tilted) {
        release(tilted);
        tilted = tilt;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        tilt.dataset.tilting = "";
        tilt.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
        tilt.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      }
    };
    const onLeave = () => {
      release(tilted);
      tilted = null;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      io?.disconnect();
      mo?.disconnect();
      headerRo?.disconnect();
      bannerRo?.disconnect();
      root.style.removeProperty("--hdr");
      root.style.removeProperty("--pre");
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.classList.remove("fx-ready");
    };
  }, []);
  return null;
}
