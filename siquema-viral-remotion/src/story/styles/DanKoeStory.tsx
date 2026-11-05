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
        {c ? (() => {
          // chalk dust as dot travel: a few dots leave the hands along short straight lines (no ring)
          const t = 1 - c.alpha / 0.8;
          const o = map([0, c.y]);
          return [-2.5, -0.6, 0.6, 2.5].map((a, i) => {
            const d = (0.12 + 0.42 * t) * 360;
            const ang = -Math.PI / 2 + a * 0.45;
            const x = o[0] + Math.cos(ang) * d * (i % 2 ? 1 : 1.25);
            const y = o[1] + Math.sin(ang) * d * 0.55 + 40 * t;
            return (
              <g key={i} opacity={1 - t * 0.6}>
                <line x1={o[0] + Math.cos(ang) * 30} y1={o[1] + Math.sin(ang) * 16} x2={x} y2={y} stroke={W} strokeWidth={1.5} strokeDasharray={undefined} opacity={0.4} />
                <circle cx={x} cy={y} r={6} fill={W} />
              </g>
            );
          });
        })() : null}
        <Barbell f={f} bar={locked ? C.brightRed : W} plate="none" plateStroke={locked ? C.brightRed : W} width={3} />
        {/* the crowd: a row of dots that rise when the bar locks out */}
        {CROWD.flatMap((x, i) =>
          [0, 1].map((row) => {
            const cx = 540 + x * 330 + row * 165 - 80;
            const cy = 1392 + row * 38 - crowdJump(f, i + row) * 200;
            const arm = f >= B.cheer && !row ? 1 : 0;
            return (
              <g key={`${i}-${row}`} opacity={row ? 0.55 : 0.9}>
                <circle cx={cx} cy={cy} r={8} fill={W} />
                {arm ? (
                  <>
                    <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 40} stroke={W} strokeWidth={2} />
                    <line x1={cx} y1={cy + 18} x2={cx - 16} y2={cy - 6} stroke={W} strokeWidth={2} strokeLinecap="round" />
                    <line x1={cx} y1={cy + 18} x2={cx + 16} y2={cy - 6} stroke={W} strokeWidth={2} strokeLinecap="round" />
                  </>
                ) : null}
              </g>
            );
          }),
        )}
        {up > 0 ? (
          <text x={540} y={1356} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={40} fill={W} opacity={up} letterSpacing="0.1em">
            {SIGN}
          </text>
        ) : null}
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const DanKoeStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand printColor={W} grain={0.03} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
