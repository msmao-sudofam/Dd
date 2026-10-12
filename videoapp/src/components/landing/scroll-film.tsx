"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * Scroll-scrubbed 9:16 film (animated-website technique): a sticky canvas plays a frame sequence as
 * the visitor scrolls, with a Gaussian "dwell" remap so the film nearly stops at each text beat.
 * Frames: public/film/{desktop,mobile}/frame-NNNN.webp (regenerate with `npm run film`).
 */

export interface Beat {
  /** progress window (0..1) in which this beat is visible */
  from: number;
  to: number;
  content: ReactNode;
}

const DWELL_WIDTH = 0.06;
const DWELL_PEAK = 3;
const REMAP_N = 1200;
const LERP = 0.12;

/** Scroll position → effective progress, slowing down around each dwell centre. */
function buildRemap(centers: number[]) {
  const density = (x: number) =>
    1 + centers.reduce((s, c) => s + DWELL_PEAK * Math.exp(-((x - c) ** 2) / (2 * DWELL_WIDTH ** 2)), 0);
  const cum = new Float32Array(REMAP_N + 1);
  for (let i = 1; i <= REMAP_N; i++) cum[i] = cum[i - 1] + density(i / REMAP_N);
  const total = cum[REMAP_N];
  // cum maps effective progress → scroll; invert it.
  return (scroll: number) => {
    const target = scroll * total;
    let lo = 0;
    let hi = REMAP_N;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return lo / REMAP_N;
  };
}

const pad = (n: number) => String(n).padStart(4, "0");

const RM = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(RM);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

export function ScrollFilm({
  frameCount,
  beats,
  poster,
  label,
}: {
  frameCount: number;
  beats: Beat[];
  poster: string;
  label: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    // Ambient light: the current frame, 16 px wide, blurred up behind the card so the film lights the page.
    const glow = glowRef.current?.getContext("2d") ?? null;
    const dir = window.innerWidth < 768 ? "mobile" : "desktop";
    const frames: (ImageBitmap | HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    let count = 0;
    let stop = false;

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = `/film/${dir}/frame-${pad(i + 1)}.webp`;
        img.onload = async () => {
          frames[i] = "createImageBitmap" in window ? await createImageBitmap(img).catch(() => img) : img;
          count++;
          if (!stop) setLoaded(count / frameCount);
          resolve();
        };
        img.onerror = () => resolve();
      });

    // Critical frames first (evenly spaced), then everything else in small batches.
    (async () => {
      const critical = Array.from({ length: 8 }, (_, k) => Math.round((k * (frameCount - 1)) / 7));
      await Promise.all(critical.map(load));
      const rest = [...Array(frameCount).keys()].filter((i) => !critical.includes(i));
      for (let i = 0; i < rest.length; i += 8) await Promise.all(rest.slice(i, i + 8).map(load));
    })();

    const nearest = (i: number) => {
      for (let d = 0; d < frameCount; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const centers = beats.map((b) => (b.from + b.to) / 2);
    const remap = buildRemap(centers);
    let current = 0;
    let lastDrawn = -1;
    let lastP = -1;
    let raf = 0;

    const tick = () => {
      const s = sectionRef.current;
      if (s) {
        const rect = s.getBoundingClientRect();
        const raw = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
        const p = remap(raw);
        if (Math.abs(p - lastP) > 0.002) {
          lastP = p;
          setProgress(p);
        }
        current += (p * (frameCount - 1) - current) * LERP;
        const idx = Math.round(current);
        const img = nearest(idx);
        if (img && (idx !== lastDrawn || canvas.dataset.dirty)) {
          // object-fit: cover
          const iw = img.width;
          const ih = img.height;
          const scale = Math.max(canvas.width / iw, canvas.height / ih);
          const w = iw * scale;
          const h = ih * scale;
          ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
          glow?.drawImage(img, 0, 0, 16, 28);
          lastDrawn = idx;
          delete canvas.dataset.dirty;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [frameCount, beats, reduced]);

  if (reduced) {
    // No scroll-jacking: static poster + every beat in normal flow.
    return (
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_minmax(0,380px)]" data-testid="scroll-film">
        <div className="space-y-12">{beats.map((b, i) => <div key={i}>{b.content}</div>)}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt={label} className="aspect-[9/16] w-full rounded-[32px] object-cover" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh]" data-testid="scroll-film" aria-label={label}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative mx-auto h-full max-w-6xl px-4 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10">
          {/* Text beats: one grid cell, cross-faded by progress. Overlaid on the film on mobile. */}
          <div className="absolute inset-x-4 bottom-4 z-10 grid p-5 md:static md:p-0">
            {beats.map((b, i) => {
              const on = progress >= b.from && (progress < b.to || (i === beats.length - 1 && progress >= b.from));
              return (
                <div
                  key={i}
                  className={`col-start-1 row-start-1 self-end transition-[opacity,transform,filter] duration-500 ease-out md:self-center ${on ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0 blur-[6px]"}`}
                  aria-hidden={!on}
                  data-beat={i}
                  data-active={on}
                >
                  {b.content}
                </div>
              );
            })}
          </div>

          {/* The film: 9:16 hero card (Morphic 32px radius) with story-style progress bars. */}
          <div className="absolute inset-x-4 top-[100px] bottom-4 md:relative md:inset-auto md:w-[min(400px,42svh)]">
            <canvas
              ref={glowRef}
              width={16}
              height={28}
              aria-hidden
              className="pointer-events-none absolute -inset-[20%] hidden h-[140%] w-[140%] opacity-40 blur-[56px] saturate-150 [mask-image:radial-gradient(closest-side,#000_25%,transparent_100%)] md:block"
            />
            <div className="relative h-full overflow-hidden rounded-[32px] border border-border bg-surface md:aspect-[9/16] md:h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded > 0 ? "opacity-0" : ""}`} />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label={label} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent md:hidden" />
              <div className="absolute inset-x-4 top-4 flex gap-1.5" aria-hidden>
                {beats.map((b, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                    <span
                      className="block h-full bg-white"
                      style={{ width: `${Math.max(0, Math.min(1, (progress - b.from) / (b.to - b.from))) * 100}%` }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
