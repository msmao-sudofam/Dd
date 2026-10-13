"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { LazyVideo } from "@/components/lazy-video";

/**
 * Scroll-scrubbed 9:16 film (animated-website technique): a sticky canvas plays a frame sequence as
 * the visitor scrolls, with a Gaussian "dwell" remap so the film nearly stops at each text beat.
 * Frames: public/film/{desktop,mobile}/frame-NNNN.webp (regenerate with `npm run film`).
 *
 * The film opens on a plain white listing photo, so the card starts small and only grows to full size
 * as the visitor scrolls into the second beat. The growth is one CSS variable, `--grow` (0 → 1), written
 * on the section; the card, the deck behind it and the phone overlay read it in CSS.
 *
 * While the page rests at the top the film plays by itself (photo → ad → back), so the first screen shows
 * the result without a scroll. `--lit` (0 → 1) follows the frame on screen and drives the card's light;
 * `--bar` fills the story bars; `--px` / `--py` are the eased pointer position for the deck's parallax.
 * As soon as the visitor scrolls, the scroll position takes the film over again.
 */

/** A finished clip floating behind the film card: one of the looks the same photo could become. */
export interface DeckClip {
  src: string;
  poster?: string;
  name: string;
}

/** Where each deck card sits, as a share of the film card's box (the deck scales with the card). */
const DECK_SLOTS = [
  { x: "-40%", y: "7%", w: "44%", r: "-9deg", depth: 16, tuck: "70%" },
  { x: "97%", y: "15%", w: "40%", r: "8deg", depth: 24, tuck: "-80%" },
  { x: "-31%", y: "55%", w: "38%", r: "6deg", depth: 30, tuck: "60%" },
  { x: "95%", y: "58%", w: "44%", r: "-6deg", depth: 20, tuck: "-75%" },
];

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
/** The card grows between these two points of (remapped) progress: after beat 0 has had its dwell. */
const GROW_FROM = 0.3;
const GROW_TO = 0.46;
/** Starting scale on desktop; on phones it is measured so the card clears the first beat's text. */
const START_SCALE_DESKTOP = 0.84;
/** Self-playing loop at the top of the page, in seconds: wait, play, hold on the ad, rewind, rest on the photo. */
const AUTO = { lead: 0.9, play: 2.8, hold: 3.4, back: 0.8, rest: 1.3 };
/** Scrolled further than this share of the section, the scroll position drives the film. */
const AUTO_BELOW = 0.012;
const CAPTION_END = 0.6;

function autoPos(t: number) {
  t -= AUTO.lead;
  if (t < 0) return 0;
  t %= AUTO.play + AUTO.hold + AUTO.back + AUTO.rest;
  if (t < AUTO.play) return smoothstep(0, 1, t / AUTO.play);
  t -= AUTO.play;
  if (t < AUTO.hold) return 1;
  t -= AUTO.hold;
  if (t < AUTO.back) return 1 - smoothstep(0, 1, t / AUTO.back);
  return 0;
}

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

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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
  captions,
  deck = [],
}: {
  frameCount: number;
  beats: Beat[];
  poster: string;
  label: string;
  /** Short labels on the card for the film's first and last state, e.g. "Listing photo" / "Finished ad". */
  captions?: { start: string; end: string };
  /** Up to four finished clips that float behind the card until it grows. */
  deck?: DeckClip[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  /** Which caption the card shows: follows the frame on screen, not the scroll. */
  const [phase, setPhase] = useState<"start" | "mid" | "end">("start");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const card = cardRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    // Ambient light: the current frame, 16 px wide, blurred up behind the card so the film lights the page.
    const glow = glowRef.current?.getContext("2d") ?? null;
    const desktopMq = window.matchMedia("(min-width: 768px)");
    const dir = desktopMq.matches ? "desktop" : "mobile";
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

    // The stage is pinned below the site header (its `top` is the header height), so the scroll
    // distance is the section height minus the stage height, measured from where pinning starts.
    let pinTop = 0;
    let stageH = window.innerHeight;
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      canvas.dataset.dirty = "1";
      pinTop = parseFloat(getComputedStyle(stage).top) || 0;
      stageH = stage.offsetHeight;
      let start = START_SCALE_DESKTOP;
      if (!desktopMq.matches) {
        // Phones: shrink the card until it sits above the first beat's text (12 px inset, 16 px gap).
        const first = section.querySelector<HTMLElement>('[data-beat="0"]');
        const textH = (first?.offsetHeight ?? 220) + 20 + 12;
        start = Math.max(0.42, Math.min(0.72, (stageH - textH - 12 - 16) / Math.max(1, card.offsetHeight)));
      }
      section.style.setProperty("--start", start.toFixed(3));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    desktopMq.addEventListener("change", measure);

    const centers = beats.map((b) => (b.from + b.to) / 2);
    const remap = buildRemap(centers);
    let current = 0;
    let eased = 0;
    let lastDrawn = -1;
    let lastP = -1;
    let lastGrow = -1;
    let lastLit = -1;
    let lastBar = -1;
    let lastPhase = "start";
    let auto = false;
    let autoT0 = 0;
    let deckOff = false;
    let raf = 0;

    // Pointer position, -1..1 from the middle of the window, eased in the frame loop (mouse only).
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const raw = Math.max(0, Math.min(1, (pinTop - rect.top) / Math.max(1, rect.height - stageH)));
      const p = remap(raw);
      if (Math.abs(p - lastP) > 0.002) {
        lastP = p;
        setProgress(p);
      }
      // Resting at the top with every frame in memory: the film plays by itself, starting from the photo.
      const now = performance.now();
      const wantAuto = raw < AUTO_BELOW && count === frameCount && !document.hidden;
      if (wantAuto && !auto) autoT0 = now;
      auto = wantAuto;
      const pos = auto ? autoPos((now - autoT0) / 1000) : p;
      current += (pos * (frameCount - 1) - current) * (auto ? 0.2 : LERP);
      const at = current / (frameCount - 1);
      // Grow follows the eased scroll, not the raw one, so the card moves as smoothly as the film.
      eased += (p - eased) * LERP;
      const grow = smoothstep(GROW_FROM, GROW_TO, eased);
      if (Math.abs(grow - lastGrow) > 0.001) {
        lastGrow = grow;
        section.style.setProperty("--grow", grow.toFixed(4));
      }
      // Once the film has grown over the deck, its clips are invisible: stop decoding them until it shrinks again.
      if (grow > 0.98 !== deckOff) {
        deckOff = !deckOff;
        for (const v of deckRef.current?.querySelectorAll("video") ?? []) {
          if (deckOff) v.pause();
          else if (v.src) v.play().catch(() => {});
        }
      }
      const lit = smoothstep(GROW_FROM, GROW_TO, at);
      if (Math.abs(lit - lastLit) > 0.001) {
        lastLit = lit;
        section.style.setProperty("--lit", lit.toFixed(4));
      }
      const bar = auto ? at : p;
      if (Math.abs(bar - lastBar) > 0.001) {
        lastBar = bar;
        section.style.setProperty("--bar", bar.toFixed(4));
      }
      const ph = at < GROW_FROM ? "start" : at >= CAPTION_END ? "end" : "mid";
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
      }
      if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) {
        px += (tx - px) * 0.06;
        py += (ty - py) * 0.06;
        section.style.setProperty("--px", px.toFixed(4));
        section.style.setProperty("--py", py.toFixed(4));
      }
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
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      desktopMq.removeEventListener("change", measure);
      window.removeEventListener("pointermove", onPointer);
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
    <section ref={sectionRef} className="film relative h-[320vh]" data-testid="scroll-film" aria-label={label}>
      <div ref={stageRef} className="sticky top-[var(--hdr)] h-[calc(100svh-var(--hdr)-var(--pre,0px))] overflow-hidden">
        <div className="relative mx-auto h-full max-w-6xl px-4 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-10">
          {/* Text beats: one grid cell, cross-faded by progress. Overlaid on the film's lower edge on phones. */}
          <div className="absolute inset-x-4 bottom-3 z-10 grid p-5 md:static md:p-0 md:pr-[clamp(24px,5vw,72px)]">
            {beats.map((b, i) => {
              const on = progress >= b.from && (progress < b.to || (i === beats.length - 1 && progress >= b.from));
              return (
                <div
                  key={i}
                  className="beat col-start-1 row-start-1 self-end md:self-center"
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
          <div className="film-in absolute inset-x-4 top-3 bottom-3 md:relative md:inset-auto md:mr-[72px] md:w-[min(400px,42svh,32vw)] lg:mr-[clamp(40px,4vw,56px)]">
            <canvas
              ref={glowRef}
              width={16}
              height={28}
              aria-hidden
              className="film-glow pointer-events-none absolute -inset-[20%] hidden h-[140%] w-[140%] blur-[56px] saturate-150 [mask-image:radial-gradient(closest-side,#000_25%,transparent_100%)] md:block"
            />
            {deck.length > 0 && (
              <div ref={deckRef} className="film-deck pointer-events-none absolute inset-0" aria-hidden>
                {deck.slice(0, DECK_SLOTS.length).map((c, i) => {
                  const slot = DECK_SLOTS[i];
                  return (
                    <div
                      key={c.src}
                      className="film-deck-item"
                      style={{ "--x": slot.x, "--y": slot.y, "--w": slot.w, "--r": slot.r, "--depth": slot.depth, "--tuck": slot.tuck, "--i": i } as React.CSSProperties}
                    >
                      <div className="film-deck-card">
                        <LazyVideo src={c.src} poster={c.poster} className="h-full w-full object-cover" />
                        <span className="film-deck-name" data-side={i % 2 ? "right" : undefined}>{c.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={cardRef} className="film-card relative h-full overflow-hidden rounded-[32px] border border-border bg-surface md:aspect-[9/16] md:h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded > 0 ? "opacity-0" : ""}`} />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label={label} />
              <div className="film-shade absolute inset-0 bg-gradient-to-t from-black via-black/55 via-45% to-transparent md:hidden" />
              <div className="absolute inset-x-4 top-4 flex gap-1.5 mix-blend-difference" aria-hidden>
                {beats.map((b, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                    <span className="film-bar block h-full bg-white" style={{ "--from": b.from, "--span": b.to - b.from } as React.CSSProperties} />
                  </span>
                ))}
              </div>
              {captions && (
                <div className="film-caption absolute top-9 left-4 grid" aria-hidden>
                  <span className={`pill col-start-1 row-start-1 transition-opacity duration-300 ${phase === "start" ? "opacity-100" : "opacity-0"}`}>{captions.start}</span>
                  <span className={`pill col-start-1 row-start-1 transition-opacity duration-300 ${phase === "end" ? "opacity-100" : "opacity-0"}`}>{captions.end}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
