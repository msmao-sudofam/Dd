"use client";

import { useEffect, useRef } from "react";

/** Muted looping clip that only downloads/plays while on screen (rows of 20 previews stay light). */
export function LazyVideo({ src, poster, className, label }: { src: string; poster?: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} poster={poster} className={className} aria-label={label} muted loop playsInline preload="none" />;
}
