"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping clip that only downloads/plays while on screen (rows of 20 previews stay light).
 * `srcWide` is a sharper file for screens 768 px and wider, where the clip is shown large.
 */
export function LazyVideo({ src, srcWide, poster, className, label }: { src: string; srcWide?: string; poster?: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = srcWide && window.matchMedia("(min-width: 768px)").matches ? srcWide : src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, srcWide]);
  return <video ref={ref} poster={poster} className={className} aria-label={label} muted loop playsInline preload="none" />;
}
