"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { INTRO_KEY } from "./intro-gate";

/** Real outputs flashed in the viewfinder while the page loads; the last one is the hero film's first frame. */
const SHOTS = Array.from({ length: 12 }, (_, i) => `/intro/${String(i).padStart(2, "0")}.webp`);
const END = "/intro/end.webp";
const LABELS: [number, string][] = [
  [0, "Loading the reel"],
  [0.35, "Lighting the set"],
  [0.7, "Framing the shot"],
];
const MIN_MS = 1800;
const MAX_MS = 5000;
const KEY = INTRO_KEY;

/**
 * The landing page's loading screen. A 9:16 viewfinder flicks through finished ads while a counter follows
 * what really loads (fonts, these stills, the hero film's frames). When it is done the curtains split and the
 * viewfinder flies onto the hero film card, which takes over from the same frame.
 *
 * States on <html>: `intro-on` (screen up; hero entrance held, see globals.css), `intro-out` (curtains
 * opening, hero type coming in, card still hidden under the flying viewfinder), `intro-done` (finished; the
 * card keeps its place instead of playing its own entrance). Styles: `.intro` in globals.css.
 */
export function Intro({ brand }: { brand: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const lblRef = useRef<HTMLSpanElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro-on")) return;
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {}
    window.scrollTo(0, 0);
    const root = rootRef.current!;
    const vf = vfRef.current!;
    const shots = [...vf.querySelectorAll<HTMLImageElement>(".intro-shot")];

    let fonts = 0;
    document.fonts?.ready.then(() => (fonts = 1)).catch(() => (fonts = 1));
    let stills = 0;
    for (const img of shots) {
      if (img.complete) stills++;
      else {
        img.addEventListener("load", () => stills++, { once: true });
        img.addEventListener("error", () => stills++, { once: true });
      }
    }
    // The hero film reports how many of its frames are in (<ScrollFilm/> sets data-loaded).
    const film = () => {
      const el = document.querySelector<HTMLElement>(".film-in");
      return el ? Number(el.dataset.loaded ?? 0) : 1;
    };

    // No scrolling under the screen: wheel and touch stop here, before the page or smooth scrolling sees them.
    // (Hiding the page's overflow instead would remove the scrollbar and shift the layout when it comes back.)
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    root.addEventListener("wheel", block, { passive: false });
    root.addEventListener("touchmove", block, { passive: false });

    const t0 = performance.now();
    let shown = 0;
    let shot = 0;
    let nextCut = t0;
    let raf = 0;
    const timers: number[] = [];

    const show = (i: number) => {
      shots[shot]?.classList.remove("on");
      shot = i;
      shots[shot].classList.add("on");
    };

    const finish = () => {
      numRef.current!.textContent = "100";
      lblRef.current!.textContent = "Action";
      show(shots.length - 1);
      root.style.setProperty("--lp", "1");
      timers.push(
        window.setTimeout(() => {
          // Fly: pin the viewfinder where it is, then move it onto the film card.
          const from = vf.getBoundingClientRect();
          const card = document.querySelector<HTMLElement>(".film-card");
          const to = card?.getBoundingClientRect();
          const onScreen = to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;
          Object.assign(vf.style, { position: "fixed", left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, margin: "0" });
          html.classList.remove("intro-on");
          html.classList.add("intro-out");
          window.dispatchEvent(new Event("rf:intro-end"));
          root.classList.add("go");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              vf.classList.add("fly");
              if (onScreen) Object.assign(vf.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
              else vf.classList.add("fade");
            }),
          );
          timers.push(
            window.setTimeout(() => {
              html.classList.remove("intro-out");
              html.classList.add("intro-done");
              vf.classList.add("fade");
            }, 1150),
            window.setTimeout(() => root.classList.add("gone"), 1600),
          );
        }, 280),
      );
    };

    const tick = (now: number) => {
      const t = now - t0;
      const target = 0.15 * fonts + 0.25 * (stills / shots.length) + 0.6 * Math.min(1, film());
      // Never jumps ahead of what loaded by more than a little, and creeps on by itself so it never looks stuck.
      const want = Math.max(Math.min(target, 1), Math.min(t / MAX_MS, target + 0.12));
      shown += (want - shown) * 0.07;
      if (shown > 0.995) shown = 1;
      root.style.setProperty("--lp", shown.toFixed(3));
      numRef.current!.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      const label = LABELS.filter(([at]) => shown >= at).pop()![1];
      if (lblRef.current!.textContent !== label) lblRef.current!.textContent = label;
      const frames = Math.floor(t / (1000 / 24));
      tcRef.current!.textContent = `00:00:${String(Math.floor(frames / 24)).padStart(2, "0")}:${String(frames % 24).padStart(2, "0")}`;
      // Fast cuts that slow down as the counter fills, like a reel spinning down.
      if (now >= nextCut) {
        show((shot + 1) % (shots.length - 1));
        nextCut = now + 90 + 300 * shown * shown * shown;
      }
      if ((target >= 0.999 && shown >= 1 && t >= MIN_MS) || t >= MAX_MS) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      root.removeEventListener("wheel", block);
      root.removeEventListener("touchmove", block);
      // `intro-on` stays if this unmounts mid-way: it only hides landing-page parts, and a remount (React's dev
      // double mount, or coming back to the page) picks the intro up again.
    };
  }, []);

  return (
    <>
      <div ref={rootRef} className="intro" aria-hidden suppressHydrationWarning>
        <i className="intro-lid intro-lid-t" />
        <i className="intro-lid intro-lid-b" />
        <div className="intro-mid">
          <div ref={vfRef} className="intro-vf">
            {[...SHOTS, END].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className={`intro-shot${i === 0 ? " on" : ""}`} decoding="async" fetchPriority={i < 3 ? "high" : "auto"} />
            ))}
            <span className="intro-hud intro-rec"><i />REC</span>
            <span className="intro-hud intro-ratio">9:16</span>
            <span ref={tcRef} className="intro-hud intro-tc">00:00:00:00</span>
            <i className="intro-corner" />
          </div>
          <p className="intro-wm">
            {[...brand].map((c, i) => (
              <span key={i} style={{ "--i": i } as CSSProperties}>{c}</span>
            ))}
          </p>
        </div>
        <div className="intro-bar">
          <span ref={lblRef}>Loading the reel</span>
          <span ref={numRef} className="intro-num">00</span>
        </div>
        <i className="intro-line" />
      </div>
    </>
  );
}
