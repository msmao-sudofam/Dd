import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Reel } from "../../lib/fx";
import { C, INTER } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, Figure, Shaker, defaultMap as map } from "../draw2d";
import { B, BONES, CROWD, SIGN, STORY_DUR, chalkAt, crowdJump, poseAt, signUp } from "../rig";

// PR DAY in /dankoe: white line figure with dot joints on pure black, the crowd as a row of dots.
// One red accent: the bar turns red at lockout.
const W = "#F5F5F5";

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const locked = f >= B.lock;
  const c = chalkAt(f);
  const up = signUp(f);
  const joints = Array.from(new Set(BONES.flat())).map((j) => map(pose[j]));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <text x={540} y={470} textAnchor="middle" fontFamily={INTER} fontSize={28} fill={W} opacity={0.55} letterSpacing="0.4em">
          PR DAY
        </text>
        <line x1={120} y1={1292} x2={960} y2={1292} stroke={W} strokeWidth={2} opacity={0.6} />
        <Shaker f={f} body="none" lid="none" stroke={W} width={2.5} />
        <Figure pose={pose} stroke={W} width={3} head={{ fill: "none", r: 0.12 }} />
        {joints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill={W} />
        ))}
        {c ? <circle cx={540} cy={map([0, c.y])[1]} r={c.r * 360} fill="none" stroke={W} strokeWidth={2} opacity={c.alpha} /> : null}
        <Barbell f={f} bar={locked ? C.brightRed : W} plate="none" plateStroke={locked ? C.brightRed : W} width={3} />
        {/* the crowd: a row of dots that rise when the bar locks out */}
        {CROWD.flatMap((x, i) =>
          [0, 1].map((row) => {
            const cx = 540 + x * 330 + row * 165 - 80;
            const cy = 1430 + row * 50 - crowdJump(f, i + row) * 260;
            return <circle key={`${i}-${row}`} cx={cx} cy={cy} r={8} fill={W} opacity={row ? 0.55 : 0.9} />;
          }),
        )}
        {up > 0 ? (
          <text x={540} y={1380 - 30 * up} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={40} fill={W} opacity={up} letterSpacing="0.1em">
            {SIGN}
          </text>
        ) : null}
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const DanKoeStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printColor={W} grain={0.03} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
