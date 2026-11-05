import React from "react";
import { BAR_HALF, BONES, CROWD, PLATE_R, PLATE_X, Pose, SIGN, SIGN_HOLDER, V2, barY, chalkAt, crowdJump, shakerAt, signUp, toScreen } from "./rig";
import { MONO } from "../lib/theme";

export type Map = (p: V2) => V2;
export const defaultMap: Map = (p) => toScreen(p, 360, 540, 1290);

/** The lifter as bones + head, in any stroke treatment. */
export const Figure: React.FC<{
  pose: Pose;
  map?: Map;
  stroke: string;
  width: number;
  head?: { fill: string; stroke?: string; r?: number };
  dash?: string;
  opacity?: number;
  filter?: string;
  extra?: React.SVGProps<SVGLineElement>;
}> = ({ pose, map = defaultMap, stroke, width, head, dash, opacity = 1, filter, extra }) => {
  const h = map(pose.head);
  const r = (head?.r ?? 0.12) * Math.abs(map([1, 0])[0] - map([0, 0])[0]);
  return (
    <g opacity={opacity} filter={filter}>
      {BONES.map(([a, b]) => {
        const p = map(pose[a]);
        const q = map(pose[b]);
        return <line key={`${a}-${b}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} {...extra} />;
      })}
      <circle cx={h[0]} cy={h[1]} r={r} fill={head?.fill ?? "none"} stroke={head?.stroke ?? stroke} strokeWidth={width} strokeDasharray={dash} />
    </g>
  );
};

/** Barbell: bar line + two plates per side. */
export const Barbell: React.FC<{ f: number; map?: Map; bar: string; plate: string; plateStroke?: string; width?: number; dash?: string }> = ({
  f,
  map = defaultMap,
  bar,
  plate,
  plateStroke,
  width = 8,
  dash,
}) => {
  const y = barY(f);
  const a = map([-BAR_HALF, y]);
  const b = map([BAR_HALF, y]);
  const s = Math.abs(map([1, 0])[0] - map([0, 0])[0]);
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={bar} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      {[-1, 1].flatMap((side) =>
        PLATE_X.map((px, i) => {
          const c = map([side * px, y]);
          const r = (i === 0 ? PLATE_R : PLATE_R * 0.8) * s;
          return <rect key={`${side}-${i}`} x={c[0] - 0.035 * s} y={c[1] - r} width={0.07 * s} height={r * 2} rx={0.02 * s} fill={plate} stroke={plateStroke} strokeWidth={plateStroke ? width * 0.5 : 0} strokeDasharray={dash} />;
        }),
      )}
    </g>
  );
};

/** Generic shaker bottle (never the product). */
export const Shaker: React.FC<{ f: number; map?: Map; body: string; lid: string; stroke?: string; width?: number }> = ({ f, map = defaultMap, body, lid, stroke, width = 0 }) => {
  const s = shakerAt(f);
  const c = map([s.x, s.y]);
  const k = Math.abs(map([1, 0])[0] - map([0, 0])[0]);
  const w = 0.13 * k;
  const h = 0.3 * k;
  return (
    <g transform={`translate(${c[0]} ${c[1]}) rotate(${(-s.tilt * 180) / Math.PI})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={w * 0.25} fill={body} stroke={stroke} strokeWidth={width} />
      <rect x={-w * 0.55} y={-h - w * 0.35} width={w * 1.1} height={w * 0.4} rx={w * 0.12} fill={lid} stroke={stroke} strokeWidth={width} />
    </g>
  );
};

/** Chalk cloud from the clap: a few soft overlapping puffs. */
export const ChalkCloud: React.FC<{ f: number; map?: Map; color: string; ink?: string; ring?: boolean }> = ({ f, map = defaultMap, color, ink, ring }) => {
  const c = chalkAt(f);
  if (!c) return null;
  const k = Math.abs(map([1, 0])[0] - map([0, 0])[0]);
  const t = 1 - c.alpha / 0.8; // 0 → 1 over the puff's life
  const shrink = Math.min(1, (1 - t) * 2.2);
  // three opaque puffs that drift up and out from the hands, away from the chest, then shrink away
  // none rise straight up: two drift up and out to the sides, one low and out on a diagonal
  const puffs: [number, number, number][] = [
    [-0.24 - 0.4 * t, 0.1 + 0.32 * t, 0.075],
    [0.24 + 0.42 * t, 0.06 + 0.36 * t, 0.06],
    [0.3 + 0.3 * t, -0.12 - 0.18 * t, 0.045],
  ];
  return (
    <g>
      {puffs.map(([dx, dy, rr], i) => {
        const q = map([c.x + dx, c.y + dy]);
        const r = (rr + 0.06 * t) * k * shrink;
        return <circle key={i} cx={q[0]} cy={q[1]} r={r} fill={ring ? "none" : color} stroke={ring ? color : ink} strokeWidth={ring ? 5 : ink ? 6 : 0} strokeDasharray={ring ? "18 10" : undefined} />;
      })}
    </g>
  );
};

/** Crowd: a row of simple figures in front of the platform, jumping after the lift. */
export const Crowd: React.FC<{
  f: number;
  y?: number;
  skin: string[];
  shirt: string[];
  outline?: string;
  outlineW?: number;
  signBg: string;
  signFg: string;
  signFont: string;
}> = ({ f, y = 1420, skin, shirt, outline, outlineW = 0, signBg, signFg, signFont }) => {
  const up = signUp(f);
  return (
    <g>
      {CROWD.map((x, i) => {
        const px = 540 + x * 320;
        const jy = -crowdJump(f, i) * 320;
        const holder = i === SIGN_HOLDER;
        return (
          <g key={i} transform={`translate(${px} ${y + jy})`}>
            <path d="M -62 120 Q -62 20 0 20 Q 62 20 62 120 Z" fill={shirt[i % shirt.length]} stroke={outline} strokeWidth={outlineW} />
            <circle cx={0} cy={-18} r={36} fill={skin[i % skin.length]} stroke={outline} strokeWidth={outlineW} />
            {f >= 156 && !holder ? (
              <>
                <line x1={-44} y1={40} x2={-70} y2={-40 - (i % 2) * 14} stroke={skin[i % skin.length]} strokeWidth={18} strokeLinecap="round" />
                <line x1={44} y1={40} x2={70} y2={-40 - ((i + 1) % 2) * 14} stroke={skin[i % skin.length]} strokeWidth={18} strokeLinecap="round" />
              </>
            ) : null}
            {holder && up > 0 ? (
              <g transform={`translate(0 ${-120 * up})`}>
                <line x1={0} y1={0} x2={0} y2={80} stroke={outline ?? "#5b4636"} strokeWidth={8} />
                <rect x={-130} y={-70} width={260} height={74} rx={8} fill={signBg} stroke={outline} strokeWidth={outlineW} />
                <text x={0} y={-20} textAnchor="middle" fontFamily={signFont} fontSize={46} fill={signFg}>
                  {SIGN}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** Small top-left HUD label used by several styles. */
export const HudLabel: React.FC<{ x: number; y: number; children: React.ReactNode; color: string; font?: string; size?: number }> = ({ x, y, children, color, font = MONO, size = 26 }) => (
  <text x={x} y={y} fontFamily={font} fontSize={size} fill={color} letterSpacing="0.06em">
    {children}
  </text>
);
