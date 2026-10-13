"use client";

import { useEffect } from "react";

/**
 * Site-wide motion controller (one listener set for the whole page, no per-element components):
 *  - [data-reveal]  one-shot scroll reveal (styles in globals.css; `--d` on the element staggers it)
 *  - .spot          hairline highlight that follows the pointer
 *  - [data-tilt]    3D tilt + glare on clip tiles
 *  - [data-magnetic] a button that leans toward the pointer while it is over it
 *  - [data-scrub-words]  a heading whose words sharpen one by one as it scrolls up the screen
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

    // Scroll-linked word sharpen: one passive listener, one frame per scroll event at most.
    const ss = (a: number, b: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    let scrubQueued = false;
    const scrub = () => {
      scrubQueued = false;
      const vh = window.innerHeight;
      for (const el of document.querySelectorAll<HTMLElement>("[data-scrub-words]")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        // 0 when the heading's top enters at the bottom of the screen, 1 once it is 45% of the way up.
        const p = (vh * 0.96 - r.top) / (vh * 0.45);
        const words = el.querySelectorAll<HTMLElement>(".sw");
        words.forEach((w, k) => {
          const at = (k / words.length) * 0.62;
          const wp = ss(at, at + 0.38, p);
          w.style.opacity = (0.14 + 0.86 * wp).toFixed(3);
          w.style.filter = wp < 1 ? `blur(${((1 - wp) * 7).toFixed(2)}px)` : "";
          w.style.transform = wp < 1 ? `translate3d(0,${((1 - wp) * 0.22).toFixed(3)}em,0)` : "";
        });
      }
    };
    const onScroll = () => {
      if (scrubQueued) return;
      scrubQueued = true;
      requestAnimationFrame(scrub);
    };
    if (!reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }

    let magnet: HTMLElement | null = null;
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
      const mag = reduced ? null : (target?.closest<HTMLElement>("[data-magnetic]") ?? null);
      if (mag !== magnet) {
        magnet?.style.removeProperty("transform");
        magnet = mag;
      }
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.transform = `translate3d(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px,0)`;
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
      magnet?.style.removeProperty("transform");
      magnet = null;
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.classList.remove("fx-ready");
    };
  }, []);
  return null;
}
