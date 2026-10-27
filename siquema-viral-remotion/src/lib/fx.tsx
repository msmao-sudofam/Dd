import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, FDA, FINE_PRINT, H, INTER, MONO, SAFE_BOTTOM, W, sec } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  settle: Easing.bezier(0.22, 1, 0.36, 1), // ease-out that never passes its target (brand rule)
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
/** 0→1 progress of a tween that starts at frame `start` and lasts `dur` frames. */
export const prog = (f: number, start: number, dur: number, ease = E.out) =>
  interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: ease });

/** Scale for the punch zoom: 1.05 on each hit, decays over ~0.3 s. */ // gate: allow shake-slam-whip, punch zoom 1→1.05 is in the brief
export const punchScale = (f: number, hits: number[], amount = 0.05) => {
  let s = 1;
  for (const h of hits) {
    const d = f - h;
    if (d >= 0 && d < 10) s = Math.max(s, 1 + amount * Math.exp(-d / 3));
  }
  return s;
};

export const Punch: React.FC<{ hits: number[]; children: React.ReactNode }> = ({ hits, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${punchScale(f, hits)})` }}>{children}</AbsoluteFill>;
};

/** Native TikTok caption: black Inter 800 on white rounded boxes, one box per line. */
export const Caption: React.FC<{
  text: React.ReactNode;
  top: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, top, size = 58, style }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: "center", ...style }}>
    <span
      style={{
        fontFamily: INTER,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.42,
        color: C.ink,
        background: "#fff",
        padding: "6px 18px",
        borderRadius: 14,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {text}
    </span>
  </div>
);

/** Caption that pops in (scale) at `at` and optionally leaves at `until`. Fully visible at frame 0 if at <= 0. */
export const PopCaption: React.FC<{ text: React.ReactNode; top: number; at: number; until?: number; size?: number }> = ({
  text,
  top,
  at,
  until,
  size,
}) => {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until)) return null;
  const k = at <= 0 ? 1 : prog(f, at, 6, E.settle);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: `50% ${top + 40}px`, opacity: Math.min(1, k * 2) }}>
      <Caption text={text} top={top} size={size} />
    </div>
  );
};

/** Bottom-of-safe-zone legal line. 22px, 60% opacity, centered. */
export const FinePrint: React.FC<{ fda?: boolean; color?: string }> = ({ fda, color = C.ink }) => (
  <div
    style={{
      position: "absolute",
      left: 90,
      right: 90,
      bottom: H - SAFE_BOTTOM,
      textAlign: "center",
      fontFamily: INTER,
      fontWeight: 500,
      fontSize: 22,
      lineHeight: 1.35,
      color,
      opacity: 0.6,
    }}
  >
    <div>{FINE_PRINT}</div>
    {fda ? <div style={{ marginTop: 6 }}>{FDA}</div> : null}
  </div>
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 12} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

/**
 * Seamless loop: over the last 0.5 s, a frozen copy of frame 0 slides in over
 * the reel and lands 3 frames before the end, so the last frames match frame 0 exactly.
 */
const LOOP = sec(0.5);
export const LoopBack: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const start = dur - LOOP;
  const x = interpolate(f, [start, dur - 3], [W, 0], { ...clamp, easing: E.inOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={f >= dur - 3 ? { visibility: "hidden" } : undefined}>{children}</AbsoluteFill>
      {f >= start ? (
        <AbsoluteFill style={{ transform: `translateX(${x}px)`, boxShadow: "-30px 0 60px rgba(0,0,0,.35)" }}>
          <Freeze frame={0}>{children}</Freeze>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// SFX are synthesized in scripts/make-sfx.mjs (no stock audio). The brief asks for pops, whooshes and impacts. // gate: allow stock-sfx, synthesized
export type Sfx = { at: number; s: "pop" | "tick" | "whoosh" | "impact"; v?: number }; // gate: allow stock-sfx, synthesized and requested in the brief
const VOL: Record<Sfx["s"], number> = { pop: 0.55, tick: 0.35, whoosh: 0.4, impact: 0.8 }; // gate: allow stock-sfx, synthesized and requested in the brief

/**
 * Standard reel shell. Children must be components that read useCurrentFrame()
 * themselves, so the loop-back can freeze them at frame 0. Adds the punch zoom, // gate: allow shake-slam-whip, in the brief
 * grain, fine print and synthesized SFX; the loop slide gets a soft air pass.
 */
export const Reel: React.FC<{
  dur: number;
  hits?: number[];
  sfx?: Sfx[];
  fda?: boolean;
  /** Fine-print color, or a function of frame (evaluated at frame 0 during the loop-back). */
  printColor?: string | ((f: number) => string);
  grain?: number;
  children: React.ReactNode;
}> = ({ dur, hits = [], sfx = [], fda, printColor, grain, children }) => {
  const f = useCurrentFrame();
  const all: Sfx[] = [...sfx, { at: dur - LOOP - 2, s: "whoosh", v: 0.25 }]; // gate: allow stock-sfx, synthesized, loop slide only
  const pf = f >= dur - LOOP / 2 ? 0 : f;
  const pc = typeof printColor === "function" ? printColor(pf) : printColor;
  return (
    <AbsoluteFill style={{ backgroundColor: C.dark }}>
      <LoopBack dur={dur}>
        <Punch hits={hits}>{children}</Punch>
      </LoopBack>
      <Grain opacity={grain} />
      <FinePrint fda={fda} color={pc} />
      {all.map((x, i) => (
        <Sequence key={i} from={Math.max(0, x.at)} durationInFrames={sec(1)} layout="none">
          <Audio src={staticFile(`sfx/${x.s}.wav`)} volume={x.v ?? VOL[x.s]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Small Space Mono label. */
export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({
  children,
  style,
  color = C.ink,
}) => (
  <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.02em", color, ...style }}>{children}</div>
);

/** Deterministic pseudo-random in [0,1) from an integer. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
