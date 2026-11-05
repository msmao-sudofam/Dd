import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Reel, prog } from "../../lib/fx";
import { INTER } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { InternalBadge } from "../InternalBadge";
import { Barbell, Figure, Shaker, defaultMap as map } from "../draw2d";
import { B, CROWD, SIGN, STORY_DUR, barY, chalkAt, crowdJump, poseAt, signUp } from "../rig";

// INTERNAL TEST: PR DAY in /glowsketch. Retired for SÍ QUEMA (glow is on the ban list). // gate: allow glow, internal test of a retired style, never posted
// Dotted luminous contours on near-black, a warm light pooling under the bar as it rises.
const BG = "#07060B";
const LINE = "#EDE7FF";
const GOLD = "#FFC85A";
const SOFT = 5; // gate: allow glow, internal test only (InternalTests), never posted

const Glowing: React.FC<{ children: React.ReactNode }> = ({ children }) => ( // gate: allow glow, internal test of a retired style, never posted
  <>
    <g filter="url(#soft)" opacity={0.55}>
      {children}
    </g>
    {children}
  </>
);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const by = map([0, barY(f)])[1];
  const lift = prog(f, B.grab, 30);
  const c = chalkAt(f);
  const up = signUp(f);
  const beams = Array.from({ length: 9 }, (_, i) => 330 + i * 52);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: `radial-gradient(420px 360px at 540px ${by + 120}px, rgba(255,200,90,${0.28 * lift}), transparent 300px)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="soft">
            <feGaussianBlur stdDeviation={SOFT} /> {/* gate: allow blur-layer, internal test, never posted */}
          </filter>
        </defs>
        <text x={540} y={470} textAnchor="middle" fontFamily={INTER} fontSize={30} fill={LINE} opacity={0.6} letterSpacing="0.5em">
          PR DAY
        </text>
        {/* dotted platform rings */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={540} cy={1295} rx={250 + i * 70} ry={34 + i * 10} fill="none" stroke={i ? LINE : GOLD} strokeWidth={4} strokeDasharray="1 12" strokeLinecap="round" opacity={0.5 - i * 0.12} />
        ))}
        {/* light falling from the bar while it rises */}
        {lift > 0
          ? beams.map((x, i) => <line key={i} x1={x} y1={by + 20} x2={x + (x - 540) * 0.08} y2={1280} stroke={GOLD} strokeWidth={3} strokeDasharray="2 14" opacity={0.5 * lift} />)
          : null}
        <Glowing> {/* gate: allow glow, internal test of a retired style, never posted */}
          <Figure pose={pose} stroke={LINE} width={8} dash="1 13" head={{ fill: "none", r: 0.13 }} extra={{ strokeLinecap: "round" }} />
          <Figure pose={pose} stroke={LINE} width={1.5} opacity={0.35} head={{ fill: "none", r: 0.13 }} />
          <Barbell f={f} bar={GOLD} plate="none" plateStroke={GOLD} width={8} dash="1 12" />
          <Shaker f={f} body="none" lid="none" stroke={LINE} width={4} />
        </Glowing> {/* gate: allow glow, internal test of a retired style, never posted */}
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
                <line x1={o[0] + Math.cos(ang) * 30} y1={o[1] + Math.sin(ang) * 16} x2={x} y2={y} stroke={LINE} strokeWidth={3} strokeDasharray={"1 10"} opacity={0.4} />
                <circle cx={x} cy={y} r={6} fill={LINE} />
              </g>
            );
          });
        })() : null}
        {/* crowd: dotted heads, rising after the lift */}
        {CROWD.map((x, i) => {
          const cx = 540 + x * 330;
          const cy = 1440 - crowdJump(f, i) * 320;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy - 40} r={24} fill="none" stroke={LINE} strokeWidth={4} strokeDasharray="1 9" strokeLinecap="round" />
              <path d={`M ${cx - 46} ${cy + 60} Q ${cx} ${cy - 20} ${cx + 46} ${cy + 60}`} fill="none" stroke={LINE} strokeWidth={4} strokeDasharray="1 9" strokeLinecap="round" />
              {i === 5 && up > 0 ? (
                <text x={cx} y={cy - 110 - 80 * up} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={44} fill={GOLD} opacity={up}>
                  {SIGN}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <StoryCaptions />
      <InternalBadge />
    </AbsoluteFill>
  );
};

export const GlowStory: React.FC = () => ( // gate: allow glow, internal test of a retired style, never posted
  <Reel dur={STORY_DUR} push={0.05} printBand printColor={LINE} grain={0.05} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
