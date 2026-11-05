import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Reel, hash } from "../../lib/fx";
import { PIXEL } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, ChalkCloud, Figure, Shaker } from "../draw2d";
import { B, CROWD, SIGN, STORY_DUR, V2, crowdJump, meterAt, poseAt, signUp } from "../rig";

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

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
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
        <Figure pose={pose} map={map} stroke="#F2C49B" width={5} head={{ fill: "#F2C49B", r: 0.13 }} />
        {/* shirt + shorts over the bones */}
        <line x1={map(pose.neck)[0]} y1={map(pose.neck)[1] + 2} x2={map(pose.pelvis)[0]} y2={map(pose.pelvis)[1]} stroke={C.red} strokeWidth={11} />
        <line x1={map(pose.hipL)[0]} y1={map(pose.hipL)[1]} x2={map(pose.hipR)[0]} y2={map(pose.hipR)[1]} stroke="#111" strokeWidth={7} />
        <rect x={map(pose.head)[0] - 7} y={map(pose.head)[1] - 8} width={14} height={4} fill="#2A1A12" />
        <ChalkCloud f={f} map={map} color="#F3EEE6" />
        <Barbell f={f} map={map} bar="#C9CDD4" plate={C.red} width={2} />
        <PixelCrowd f={f} />
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const PixelStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} grain={0} printColor="#F3EEE6" sfx={STORY_SFX}>
    <Body />
  </Reel>
);
