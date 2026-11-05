import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, E, Reel, clamp, hash, prog } from "../lib/fx";
import { CAVEAT, INGREDIENTS, sec } from "../lib/theme";

// Animation Studio /chalkboard — "what's actually in one scoop?"
export const CHALK_AD_DUR = sec(9);

const IVORY = "#F2EEE3";
const YELLOW = "#F2D45C";
const ROWS_AT = 30;
const ROW_STEP = 12;
const rowFrame = (i: number) => ROWS_AT + i * ROW_STEP;
const CIRCLE_AT = rowFrame(INGREDIENTS.length) + 6;
const NOTE_AT = CIRCLE_AT + 22;
const END_AT = 215;
const ROW_TOP = 680;
const ROW_H = 68;

/** Chalk texture: erodes strokes with a fixed speck pattern so lines read as broken chalk. */
const ChalkDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="chalk">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="holes" />
      <feComposite in="SourceGraphic" in2="holes" operator="in" />
    </filter>
  </svg>
);

/** Text written in chalk: three jittered passes (stable for 2 frames), revealed left to right. */
const ChalkText: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  x: number;
  y: number;
  size?: number;
  color?: string;
  align?: "left" | "right" | "center";
  width?: number;
}> = ({ children, at, dur = 10, x, y, size = 46, color = IVORY, align = "left", width = 940 }) => {
  const f = useCurrentFrame();
  const k = at <= 0 ? 1 : interpolate(f, [at, at + dur], [0, 1], clamp);
  if (k <= 0) return null;
  const seed = Math.floor(f / 2);
  const passes = [
    { dx: 0, dy: 0, a: 0.85 },
    { dx: (hash(seed + at) - 0.5) * 3, dy: (hash(seed + at + 9) - 0.5) * 3, a: 0.45 },
    { dx: (hash(seed + at + 3) - 0.5) * 3, dy: (hash(seed + at + 5) - 0.5) * 3, a: 0.45 },
  ];
  const left = align === "left" ? x : align === "right" ? x - width : x - width / 2;
  return (
    <div style={{ position: "absolute", left, top: y, width, textAlign: align, clipPath: `inset(-20px ${(1 - k) * 100}% -20px -20px)` }}>
      {passes.map((p, i) => (
        <div
          key={i}
          style={{
            position: i ? "absolute" : "relative",
            inset: i ? 0 : undefined,
            transform: `translate(${p.dx}px, ${p.dy}px)`,
            fontFamily: CAVEAT,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.1,
            color,
            opacity: p.a,
            filter: "url(#chalk)",
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
};

/** A chalk line drawing: the same path stroked three times with small jitter, drawn on over time. */
const ChalkPath: React.FC<{ d: string; at: number; dur: number; color?: string; width?: number }> = ({ d, at, dur, color = IVORY, width = 7 }) => {
  const f = useCurrentFrame();
  const k = at <= 0 ? 1 : prog(f, at, dur, E.inOut);
  if (k <= 0) return null;
  const seed = Math.floor(f / 2);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "url(#chalk)" }}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={i ? width * 0.55 : width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={i ? 0.45 : 0.85}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - k}
          transform={i ? `translate(${(hash(seed + i * 7) - 0.5) * 3} ${(hash(seed + i * 11) - 0.5) * 3})` : undefined}
        />
      ))}
    </svg>
  );
};

// a measuring scoop, drawn in chalk (a generic scoop, not the tub)
const SCOOP_BOWL = "M 640 470 C 650 560, 830 560, 840 470 Z";
const SCOOP_HANDLE = "M 838 478 L 990 430 L 996 448 L 842 500";
const MOUND = "M 650 470 C 690 430, 790 430, 830 470";
// loop of chalk around the caffeine dose (row 1)
const CIRCLE = { cx: 930, cy: ROW_TOP + 30, rx: 112, ry: 42 };
const CIRCLE_D = `M ${CIRCLE.cx - CIRCLE.rx} ${CIRCLE.cy} a ${CIRCLE.rx} ${CIRCLE.ry} 0 1 0 ${2 * CIRCLE.rx} 0 a ${CIRCLE.rx} ${CIRCLE.ry} 0 1 0 ${-2 * CIRCLE.rx} 4`;
const HATCH = Array.from({ length: 7 }, (_, i) => `M ${672 + i * 22} 486 l 18 46`).join(" ");

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const end = prog(f, END_AT, 14);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(1300px 1700px at 540px 800px, #34503F, #2f4538 600px, #22362A 1500px)" }}>
      <ChalkDefs />
      {/* eraser smudges */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(420px 120px at 300px 1180px, rgba(255,255,255,.05), transparent), radial-gradient(520px 140px at 760px 620px, rgba(255,255,255,.045), transparent), radial-gradient(380px 90px at 480px 1420px, rgba(255,255,255,.035), transparent)",
        }}
      />

      {/* cover: the scoop and its label are already on the board */}
      <ChalkPath d={SCOOP_BOWL} at={0} dur={1} />
      <ChalkPath d={SCOOP_HANDLE} at={0} dur={1} />
      <ChalkPath d={MOUND} at={0} dur={1} width={5} />
      <ChalkPath d={HATCH} at={0} dur={1} width={3} />
      <ChalkText at={0} x={80} y={450} size={64}>
        1 scoop
      </ChalkText>
      <ChalkText at={0} x={80} y={530} size={44} color={YELLOW}>
        4.5 g · 9 ingredients
      </ChalkText>
      <ChalkPath d="M 80 640 L 1000 640" at={0} dur={1} width={4} />

      {INGREDIENTS.map((ing, i) => (
        <React.Fragment key={ing.name}>
          <ChalkText at={rowFrame(i)} dur={9} x={80} y={ROW_TOP + i * ROW_H} size={50}>
            {ing.name}
          </ChalkText>
          <ChalkText at={rowFrame(i) + 6} dur={5} x={1000} y={ROW_TOP + i * ROW_H} align="right" width={240} color={YELLOW} size={50}>
            {ing.dose}
          </ChalkText>
        </React.Fragment>
      ))}

      {/* circle 200 mg and annotate it */}
      <ChalkPath d={CIRCLE_D} at={CIRCLE_AT} dur={14} color={YELLOW} width={6} />
      <ChalkText at={NOTE_AT} dur={16} x={80} y={ROW_TOP + 9 * ROW_H + 16} size={50} color={YELLOW}>
        200 mg ≈ about two 8-oz cups of coffee
      </ChalkText>

      {/* closing line */}
      <div style={{ opacity: end }}>
        <ChalkText at={END_AT} dur={14} x={540} y={1384} size={62} align="center">
          every dose on the label.
        </ChalkText>
      </div>

      <Caption text="what's actually in one scoop?" top={260} />
    </AbsoluteFill>
  );
};

export const ChalkboardAd: React.FC = () => (
  <Reel
    dur={CHALK_AD_DUR}
    printColor="#F2EEE3"
    grain={0.08}
    sfx={[
      ...INGREDIENTS.map((_, i) => ({ at: rowFrame(i), s: "tick" as const, v: 0.2 })),
      { at: CIRCLE_AT, s: "pop" as const, v: 0.3 },
      { at: END_AT, s: "pop" as const, v: 0.35 },
    ]}
  >
    <Body />
  </Reel>
);
