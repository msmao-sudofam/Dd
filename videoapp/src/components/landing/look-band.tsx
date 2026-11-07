"use client";

import { useEffect, useRef } from "react";

/**
 * A band of the looks' names in display type, every second one outlined. It drifts by itself and speeds up
 * and leans with the scroll (styles: `.band` in globals.css). Decorative: the catalog below is the real list.
 */
export function LookBand({ names }: { names: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = ref.current;
    const track = band?.firstElementChild as HTMLElement | null;
    if (!band || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let vel = 0;
    let last = window.scrollY;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      vel += (y - last - vel) * 0.2;
      last = y;
      x -= 0.7 + Math.abs(vel) * 0.55;
      const half = track.scrollWidth / 2; // the names are rendered twice
      if (-x > half) x += half;
      const skew = Math.max(-10, Math.min(10, -vel * 0.35));
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    // Only moves while it can be seen.
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(band);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  if (names.length < 4) return null;
  // An even count keeps the solid / outlined rhythm unbroken where the two copies meet.
  const list = names.length % 2 ? names.slice(0, -1) : names;
  return (
    <div ref={ref} className="band" aria-hidden="true" data-testid="look-band">
      <div className="band-track">
        {[0, 1].map((copy) => list.map((n) => <span key={`${copy}-${n}`} className="band-item">{n}</span>))}
      </div>
    </div>
  );
}
