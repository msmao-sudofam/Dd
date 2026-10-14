"use client";

import { useEffect, useRef } from "react";

const DEAL_MS = 5000; // one preview clip is five seconds long, so each tile plays a full loop per turn

/**
 * Decides which of the wall's clips play. About thirty tiles are on screen at once, and thirty videos
 * decoding together make scrolling stutter, so only `max` of them move at a time; every few seconds the
 * turn passes to other tiles. A tile that is not playing shows its poster or the frame it stopped on.
 * The wall's <video>s carry their file in `data-src` and are loaded the first time they get a turn.
 * It also switches the rows' drift on only while the wall is near the screen.
 */
export function WallGovernor({ max = 10, maxSmall = 6 }: { max?: number; maxSmall?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wall = ref.current?.parentElement;
    if (!wall || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cap = window.matchMedia("(min-width: 640px)").matches ? max : maxSmall;
    const seen = new Set<HTMLVideoElement>();
    const playing = new Set<HTMLVideoElement>();
    const start = (v: HTMLVideoElement) => {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().catch(() => {});
      playing.add(v);
    };
    const stop = (v: HTMLVideoElement) => {
      v.pause();
      playing.delete(v);
    };
    let turn = 0;
    // A fresh hand: `cap` tiles spread evenly over the ones on screen, starting one further along each time.
    const deal = () => {
      const on = [...seen];
      const pick = new Set<HTMLVideoElement>();
      const n = Math.min(cap, on.length);
      for (let i = 0; i < n; i++) pick.add(on[Math.floor((i * on.length) / n + turn) % on.length]);
      for (const v of on) {
        if (pick.has(v)) start(v);
        else stop(v);
      }
      turn += 1;
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          seen.add(v);
          if (playing.size < cap) start(v); // fill free seats at once; the rest wait for the next hand
        } else {
          seen.delete(v);
          stop(v);
        }
      }
    });
    for (const v of wall.querySelectorAll("video")) io.observe(v);
    // The rows drift only while the wall itself is near the screen (styles: `.wall[data-on]`).
    const near = new IntersectionObserver(([e]) => wall.toggleAttribute("data-on", e.isIntersecting), { rootMargin: "200px" });
    near.observe(wall);
    const id = window.setInterval(() => {
      if (!document.hidden && seen.size) deal();
    }, DEAL_MS);
    return () => {
      io.disconnect();
      near.disconnect();
      window.clearInterval(id);
    };
  }, [max, maxSmall]);

  return <span ref={ref} hidden />;
}
