import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Reel, hash } from "../../lib/fx";
import { PIXEL } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, Shaker } from "../draw2d";
import { BONES, B, CROWD, Pose, SIGN, STORY_DUR, V2, chalkAt, crowdJump, meterAt, poseAt, signUp } from "../rig";

// PR DAY in /pixelart: a 180x320 logical canvas scaled x6 with crisp edges, sunset city, HUD, pixel crowd.
const S = 60; // logical px per metre (= 360 real px / 6)
const GROUND = 215;
const map = (p: V2): V2 => [Math.round(90 + p[0] * S), Math.round(GROUND - p[1] * S)];
const C = { sky0: "#1B1240", sky1: "#3A1E63", sky2: "#7A3B78", sky3: "#E07A6B", sun: "#FFC66B", city: "#160F2E", win: "#FFD36B", floor: "#2B2244", grid: "#4B3D7A", ui: "#F3EEE6", red: "#E5202F", yel: "#F7D33C" };
const SKIN = ["#F2C49B", "#C98B5E", "#8D5A3B", "#E8B18A"];
const SHIRT = ["#E5202F", "#3E8E3A", "#2E5BBA", "#F7D33C", "#7A3B78"];

const Sky: React.FC = () => (
  <>
    <rect width={180} height={320} fill={C.sky0} />
    {[
      [70, C.sky1],
      [110, C.sky2],
      [140, C.sky3],
    ].map(([y, c]) => (
      <g key={y as number}>
        {Array.from({ length: 45 }, (_, i) => (
          <rect key={i} x={(i * 4 + ((y as number) % 8 ? 2 : 0)) % 180} y={(y as number) - 2} width={2} height={2} fill={c as string} />
        ))}
        <rect y={y as number} width={180} height={320} fill={c as string} />
      </g>
    ))}
    <rect x={118} y={128} width={22} height={22} fill={C.sun} />
    <rect x={114} y={132} width={30} height={14} fill={C.sun} />
    {/* skyline */}
    {Array.from({ length: 14 }, (_, i) => {
      const w = 10 + Math.floor(hash(i) * 8);
      const h = 26 + Math.floor(hash(i + 20) * 40);
      const x = i * 13 - 4;
      return (
        <g key={i}>
          <rect x={x} y={GROUND - 20 - h} width={w} height={h + 40} fill={C.city} />
          {Array.from({ length: Math.floor(h / 6) }, (_, j) =>
            hash(i * 7 + j) > 0.45 ? <rect key={j} x={x + 2 + (j % 2) * 4} y={GROUND - 20 - h + 3 + j * 5} width={2} height={2} fill={C.win} /> : null,
          )}
        </g>
      );
    })}
    {/* platform floor with perspective grid */}
    <rect y={GROUND} width={180} height={320} fill={C.floor} />
    {[GROUND + 5, GROUND + 14, GROUND + 28, GROUND + 50].map((y) => (
      <rect key={y} y={y} width={180} height={1} fill={C.grid} />
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={90} y1={GROUND} x2={-60 + i * 37.5} y2={320} stroke={C.grid} strokeWidth={1} />
    ))}
  </>
);

const PixelCrowd: React.FC<{ f: number }> = ({ f }) => {
  const up = signUp(f);
  return (
    <>
      {CROWD.map((x, i) => {
        const cx = Math.round(90 + x * 60);
        const jy = Math.round(crowdJump(f, i) * 40);
        const y = 254 - jy;
        const cheering = f >= B.cheer;
        return (
          <g key={i}>
            <rect x={cx - 7} y={y + 10} width={14} height={14} fill={SHIRT[i % SHIRT.length]} />
            <rect x={cx - 5} y={y} width={10} height={10} fill={SKIN[i % SKIN.length]} />
            <rect x={cx - 5} y={y} width={10} height={3} fill="#2A1A12" />
            <rect x={cx - 3} y={y + 5} width={2} height={2} fill="#111" />
            <rect x={cx + 1} y={y + 5} width={2} height={2} fill="#111" />
            {cheering && i !== 5 ? (
              <>
                <rect x={cx - 10} y={y - 2} width={3} height={13} fill={SKIN[i % SKIN.length]} />
                <rect x={cx + 7} y={y - 2} width={3} height={13} fill={SKIN[i % SKIN.length]} />
              </>
            ) : null}
            {i === 5 && up > 0 ? (
              <g transform={`translate(0 ${-Math.round(16 * up)})`}>
                <rect x={cx - 1} y={y - 6} width={2} height={14} fill="#5B4636" />
                <rect x={cx - 26} y={y - 18} width={52} height={13} fill={C.ui} />
                <text x={cx} y={y - 8} textAnchor="middle" fontFamily={PIXEL} fontSize={8} fill={C.red} style={{ fontWeight: 700 }}>
                  {SIGN}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </>
  );
};

/** Rasterize a bone onto the logical grid: square w x w stamps at integer positions (no anti-aliasing). */
const pxLine = (a: V2, b: V2, w: number, color: string, key: string) => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  const seen = new Set<string>();
  const out: React.ReactElement[] = [];
  for (let i = 0; i <= n; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / n - w / 2);
    const y = Math.round(a[1] + ((b[1] - a[1]) * i) / n - w / 2);
    const k = `${x},${y}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(<rect key={`${key}-${k}`} x={x} y={y} width={w} height={w} fill={color} />);
  }
  return out;
};
const pxDisc = (c: V2, r: number, color: string, key: string) => {
  const out: React.ReactElement[] = [];
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) out.push(<rect key={`${key}-${x}-${y}`} x={c[0] + x} y={c[1] + y} width={1} height={1} fill={color} />);
  return out;
};

/** The lifter as a sprite on the grid: skin limbs, red shirt block, black shorts, pixel head and hair. */
const PixelLifter: React.FC<{ f: number }> = ({ f }) => {
  const p: Pose = poseAt(f);
  const m = (j: keyof Pose): V2 => map(p[j]);
  const skin = "#F2C49B";
  const limbs = BONES.filter(([a, b]) => !(a === "neck" && b === "pelvis") && !(a === "hipL" && b === "hipR") && !(a === "shL" && b === "shR"));
  const head = m("head");
  return (
    <g>
      {limbs.flatMap(([a, b]) => pxLine(m(a), m(b), 4, skin, `${a}${b}`))}
      {pxLine([m("neck")[0], m("neck")[1] + 3], m("pelvis"), 10, C.red, "torso")}
      {pxLine(m("shL"), m("shR"), 5, C.red, "shoulders")}
      {pxLine(m("hipL"), m("hipR"), 6, "#111", "shorts")}
      {pxDisc([Math.round(head[0]), Math.round(head[1])], 5, skin, "head")}
      <rect x={Math.round(head[0]) - 5} y={Math.round(head[1]) - 6} width={11} height={3} fill="#2A1A12" />
      <rect x={Math.round(head[0]) - 2} y={Math.round(head[1])} width={1} height={1} fill="#111" />
      <rect x={Math.round(head[0]) + 2} y={Math.round(head[1])} width={1} height={1} fill="#111" />
    </g>
  );
};

/** Chalk dust as stepped pixel clusters. */
const PixelDust: React.FC<{ f: number }> = ({ f }) => {
  const c = chalkAt(f);
  if (!c) return null;
  const o = map([c.x, c.y]);
  const r = Math.round(c.r * S);
  return (
    <g opacity={c.alpha > 0.4 ? 1 : 0.6}>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.3;
        const rr = r * (0.55 + (i % 4) * 0.15);
        return <rect key={i} x={Math.round(o[0] + Math.cos(a) * rr)} y={Math.round(o[1] + Math.sin(a) * rr * 0.7)} width={2} height={2} fill="#F3EEE6" />;
      })}
    </g>
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const m = meterAt(f);
  return (
    <AbsoluteFill style={{ background: C.sky0 }}>
      <svg width={1080} height={1920} viewBox="0 0 180 320" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        {/* banner + HUD */}
        <rect x={4} y={72} width={38} height={12} fill={C.city} />
        <rect x={4} y={72} width={38} height={2} fill={C.yel} />
        <rect x={4} y={82} width={38} height={2} fill={C.yel} />
        <text x={23} y={81} textAnchor="middle" fontFamily={PIXEL} fontSize={7} fill={C.ui} style={{ fontWeight: 700 }}>
          PR DAY
        </text>
        <text x={5} y={94} fontFamily={PIXEL} fontSize={5} fill={C.ui}>
          BAR SPEED
        </text>
        <rect x={5} y={97} width={34} height={4} fill={C.city} />
        <rect x={5} y={97} width={Math.round(34 * m)} height={4} fill={m >= 1 ? C.red : C.yel} />
        {f >= B.lock ? (
          <text x={174} y={82} textAnchor="end" fontFamily={PIXEL} fontSize={9} fill={C.yel} style={{ fontWeight: 700 }}>
            PR!
          </text>
        ) : null}
        {/* platform */}
        <rect x={34} y={GROUND - 2} width={112} height={7} fill="#6B4E37" />
        <rect x={34} y={GROUND - 2} width={112} height={1} fill="#8A6A4E" />
        <Shaker f={f} map={map} body="#F3EEE6" lid="#111" />
        <PixelLifter f={f} />
        <PixelDust f={f} />
        <Barbell f={f} map={map} bar="#C9CDD4" plate={C.red} width={2} />
        <PixelCrowd f={f} />
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const PixelStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand grain={0} printColor="#F3EEE6" sfx={STORY_SFX}>
    <Body />
  </Reel>
);
