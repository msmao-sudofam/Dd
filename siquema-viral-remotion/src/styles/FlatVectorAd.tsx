import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, E, PopCaption, Reel, clamp, prog } from "../lib/fx";
import { ANTON, C, FLAVORS, INTER, sec } from "../lib/theme";

// Animation Studio /flatvector — the ritual: scoop. shake. set.
export const FLAT_AD_DUR = sec(9);

const BEAT = [0, 66, 132, 198]; // scoop, shake, set, flavors
const P = {
  bg: "#F3EEE6",
  bgShade: "#E9E1D4",
  ink: C.ink,
  red: C.red,
  redDark: "#A8121F",
  mango: "#E7950D",
  mangoDark: "#C06E1D",
  mangoLight: "#F6B649",
  steel: "#2B2A2A",
  steelLight: "#4A4747",
};
const FLAVOR_FILL: Record<string, [string, string]> = {
  MANGO: ["#E7950D", "#C06E1D"],
  WATERMELON: ["#DA6024", "#AF4238"],
  "KIWI STRAWBERRY": ["#D06C2F", "#8CB33E"],
  "CUCUMBER LIME": ["#BFD02C", "#A5AC40"],
};

const Word: React.FC<{ text: string; at: number; until: number; color?: string }> = ({ text, at, until, color = P.ink }) => {
  const f = useCurrentFrame();
  if (f < at || f >= until) return null;
  const k = at <= 0 ? 1 : prog(f, at, 8, E.settle);
  return (
    <div
      style={{
        position: "absolute",
        top: 470,
        width: "100%",
        textAlign: "center",
        fontFamily: ANTON,
        fontSize: 190,
        lineHeight: 1,
        color,
        clipPath: `inset(0 0 ${(1 - k) * 100}% 0)`,
        transform: `translateY(${(1 - k) * 40}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Scoop beat: a flat scoop dips into a mango powder pile and lifts a mound out. */
const ScoopScene: React.FC<{ f: number }> = ({ f }) => {
  const dip = interpolate(f, [10, 30, 48], [0, 70, 0], { ...clamp, easing: E.inOut });
  const full = f >= 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {/* powder pile: base, shade plane, light plane */}
      <ellipse cx={540} cy={1240} rx={330} ry={110} fill={P.mango} />
      <path d="M 210 1240 Q 540 1010 870 1240 Z" fill={P.mango} />
      <path d="M 540 1050 Q 760 1120 870 1240 L 540 1240 Z" fill={P.mangoDark} />
      <path d="M 330 1160 Q 430 1080 520 1070 L 470 1140 Z" fill={P.mangoLight} />
      {/* scoop */}
      <g transform={`translate(0 ${dip})`}>
        <rect x={600} y={960} width={330} height={44} rx={22} fill={P.red} transform="rotate(-18 600 980)" />
        <path d="M 360 960 Q 360 1110 490 1110 Q 620 1110 620 960 Z" fill={P.red} />
        <path d="M 490 1110 Q 620 1110 620 960 L 560 960 Q 560 1080 490 1110 Z" fill={P.redDark} />
        {full ? (
          <>
            <path d="M 360 962 Q 490 880 620 962 Z" fill={P.mango} />
            <path d="M 490 905 Q 580 925 620 962 L 490 962 Z" fill={P.mangoDark} />
          </>
        ) : null}
      </g>
    </svg>
  );
};

/** Shake beat: powder falls into a flat shaker, which then tilts side to side. */
const ShakeScene: React.FC<{ f: number }> = ({ f }) => {
  const local = f - BEAT[1];
  const fill = interpolate(local, [6, 26], [0, 1], clamp);
  const tilt = local > 30 ? Math.sin((local - 30) / 3.2) * 9 * interpolate(local, [30, 40, 60, 66], [0, 1, 1, 0], clamp) : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`rotate(${tilt} 540 1180)`}>
        {/* bottle body (generic shaker), lid, liquid */}
        <rect x={395} y={860} width={290} height={480} rx={38} fill="#FFFFFF" />
        <rect x={545} y={860} width={140} height={480} rx={38} fill={P.bgShade} />
        <rect x={395} y={1340 - 400 * fill} width={290} height={400 * fill} rx={30} fill={P.mango} opacity={0.92} />
        <rect x={545} y={1340 - 400 * fill} width={140} height={400 * fill} rx={30} fill={P.mangoDark} opacity={0.6} />
        <rect x={380} y={800} width={320} height={84} rx={22} fill={P.ink} />
        <rect x={470} y={760} width={140} height={52} rx={14} fill={P.ink} />
      </g>
      {/* falling powder stream */}
      {local < 26 ? <rect x={528} y={680} width={24} height={86} rx={12} fill={P.mango} opacity={1 - local / 30} /> : null}
    </svg>
  );
};

/** Set beat: a flat barbell rises off the floor. */
const SetScene: React.FC<{ f: number }> = ({ f }) => {
  const local = f - BEAT[2];
  const lift = interpolate(local, [8, 34], [0, 260], { ...clamp, easing: E.inOut });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect x={0} y={1330} width={1080} height={20} fill={P.bgShade} />
      <g transform={`translate(0 ${-lift})`}>
        <rect x={120} y={1196} width={840} height={20} rx={10} fill={P.steel} />
        {[150, 220, 790, 860].map((x, i) => (
          <g key={x}>
            <rect x={x} y={i % 3 === 0 ? 1056 : 1086} width={70} height={i % 3 === 0 ? 300 : 240} rx={14} fill={P.red} />
            <rect x={x + 42} y={i % 3 === 0 ? 1056 : 1086} width={28} height={i % 3 === 0 ? 300 : 240} rx={10} fill={P.redDark} />
          </g>
        ))}
        <rect x={420} y={1192} width={240} height={28} rx={14} fill={P.steelLight} />
      </g>
    </svg>
  );
};

const FlavorCards: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 470, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
    {FLAVORS.map((fl, i) => {
      const k = prog(f, BEAT[3] + i * 4, 9, E.settle);
      const [a, b] = FLAVOR_FILL[fl];
      return (
        <div
          key={fl}
          style={{
            height: 330,
            borderRadius: 34,
            background: a,
            position: "relative",
            overflow: "hidden",
            transform: `translateY(${(1 - k) * 80}px)`,
            opacity: Math.min(1, k * 2),
          }}
        >
          <div style={{ position: "absolute", right: -60, bottom: -60, width: 260, height: 260, borderRadius: 999, background: b }} />
          <div style={{ position: "absolute", left: 30, bottom: 30, right: 30, fontFamily: ANTON, fontSize: fl.length > 10 ? 54 : 70, lineHeight: 1, color: C.ink }}>
            {fl}
          </div>
        </div>
      );
    })}
  </div>
);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const scene = f < BEAT[1] ? 0 : f < BEAT[2] ? 1 : f < BEAT[3] ? 2 : 3;
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      {scene === 0 ? <ScoopScene f={f} /> : null}
      {scene === 1 ? <ShakeScene f={f} /> : null}
      {scene === 2 ? <SetScene f={f} /> : null}
      {scene === 3 ? <FlavorCards f={f} /> : null}
      <Word text="SCOOP." at={0} until={BEAT[1]} />
      <Word text="SHAKE." at={BEAT[1]} until={BEAT[2]} />
      <Word text="SET." at={BEAT[2]} until={BEAT[3]} color={P.red} />
      {f < BEAT[3] ? <Caption text="scoop. shake. set." top={260} /> : null}
      <PopCaption text="4 flavors. every dose on the label." top={260} at={BEAT[3]} />
      <div
        style={{
          position: "absolute",
          top: 1200,
          width: "100%",
          textAlign: "center",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 40,
          color: C.ink,
          opacity: scene === 3 ? prog(f, BEAT[3] + 20, 8) : 0,
        }}
      >
        200 mg caffeine · 30 servings
      </div>
    </AbsoluteFill>
  );
};

export const FlatVectorAd: React.FC = () => (
  <Reel
    dur={FLAT_AD_DUR}
    grain={0.05}
    sfx={[
      { at: 30, s: "pop" as const, v: 0.35 },
      { at: BEAT[1], s: "tick" as const },
      { at: BEAT[2], s: "tick" as const },
      { at: BEAT[2] + 34, s: "impact" as const, v: 0.5 },
      ...FLAVORS.map((_, i) => ({ at: BEAT[3] + i * 4, s: "pop" as const, v: 0.3 })),
    ]}
  >
    <Body />
  </Reel>
);
