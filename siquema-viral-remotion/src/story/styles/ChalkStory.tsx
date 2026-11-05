import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { E, Reel, hash, prog } from "../../lib/fx";
import { CAVEAT } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, ChalkCloud, Figure, Shaker, defaultMap as map } from "../draw2d";
import { B, CROWD, SIGN, STORY_DUR, barY, crowdJump, poseAt, signUp } from "../rig";

// PR DAY in /chalkboard: a greenboard lesson. Stick-figure lifter, force vs weight arrows, chalk crowd.
const IVORY = "#F2EEE3";
const YEL = "#F2D45C";
const PINK = "#F4A6B8";

const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="chalk-s">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="holes" />
      <feComposite in="SourceGraphic" in2="holes" operator="in" />
    </filter>
  </svg>
);

const Arrow: React.FC<{ x: number; y1: number; y2: number; color: string; label: string; k: number }> = ({ x, y1, y2, color, label, k }) => {
  if (k <= 0) return null;
  const y = y1 + (y2 - y1) * k;
  const dir = Math.sign(y2 - y1);
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${x - 16} ${y - dir * 22} L ${x} ${y} L ${x + 16} ${y - dir * 22}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <text x={x + 24} y={(y1 + y) / 2} fontFamily={CAVEAT} fontSize={40} fill={color} style={{ fontWeight: 700 }}>
        {label}
      </text>
    </g>
  );
};

/** Everything drawn in chalk: rendered three times with small jitter (stable for 2 frames). */
const Drawing: React.FC<{ f: number }> = ({ f }) => {
  const pose = poseAt(f);
  const lifting = prog(f, B.grab, 10);
  const by = map([0, barY(f)])[1];
  const up = signUp(f);
  return (
    <g>
      {/* title */}
      <text x={90} y={470} fontFamily={CAVEAT} fontSize={74} fill={IVORY} style={{ fontWeight: 700 }}>
        PR 101
      </text>
      <line x1={90} y1={486} x2={300} y2={486} stroke={YEL} strokeWidth={5} strokeLinecap="round" />
      {f >= B.lock ? (
        <text x={90} y={1262} fontFamily={CAVEAT} fontSize={46} fill={YEL} style={{ fontWeight: 700 }}>
          FORCE {">"} WEIGHT ✓
        </text>
      ) : null}
      {/* floor with hatching */}
      <line x1={110} y1={1292} x2={970} y2={1292} stroke={IVORY} strokeWidth={6} strokeLinecap="round" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={120 + i * 40} y1={1296} x2={100 + i * 40} y2={1322} stroke={IVORY} strokeWidth={3} opacity={0.6} />
      ))}
      <Shaker f={f} body="none" lid="none" stroke={IVORY} width={5} />
      <Figure pose={pose} stroke={IVORY} width={9} head={{ fill: "none", r: 0.13 }} />
      <ChalkCloud f={f} color={IVORY} ring />
      <Barbell f={f} bar={IVORY} plate="none" plateStroke={IVORY} width={8} />
      {/* force vs weight, drawn on as the bar moves */}
      {f < B.endLine ? (
        <>
          <Arrow x={900} y1={by} y2={by - 110} color={YEL} label="force" k={lifting * prog(f, B.grab, 14, E.inOut)} />
          <Arrow x={180} y1={by} y2={by + 110} color={PINK} label="weight" k={lifting * prog(f, B.grab + 6, 14, E.inOut)} />
        </>
      ) : null}
      {/* chalk crowd: heads + bodies, arms up after the lift */}
      {CROWD.map((x, i) => {
        const cx = 540 + x * 330;
        const cy = 1440 - crowdJump(f, i) * 320;
        const cheering = f >= B.cheer;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy - 40} r={22} fill="none" stroke={IVORY} strokeWidth={5} />
            <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 40} stroke={IVORY} strokeWidth={5} />
            <line x1={cx} y1={cy} x2={cx - 26} y2={cheering ? cy - 46 : cy + 24} stroke={IVORY} strokeWidth={5} strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={cx + 26} y2={cheering ? cy - 46 : cy + 24} stroke={IVORY} strokeWidth={5} strokeLinecap="round" />
            {i === 5 && up > 0 ? (
              <g transform={`translate(0 ${-110 * up})`}>
                <rect x={cx - 130} y={cy - 150} width={260} height={74} rx={6} fill="none" stroke={YEL} strokeWidth={6} />
                <text x={cx} y={cy - 98} textAnchor="middle" fontFamily={CAVEAT} fontSize={54} fill={YEL} style={{ fontWeight: 700 }}>
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

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2);
  const passes = [
    { dx: 0, dy: 0, a: 0.85 },
    { dx: (hash(seed) - 0.5) * 3, dy: (hash(seed + 9) - 0.5) * 3, a: 0.4 },
    { dx: (hash(seed + 3) - 0.5) * 3, dy: (hash(seed + 5) - 0.5) * 3, a: 0.4 },
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(1300px 1700px at 540px 800px, #34503F, #2f4538 600px, #22362A 1500px)" }}>
      <Defs />
      {/* wooden frame and chalk tray, like a real classroom board */}
      <AbsoluteFill style={{ border: "26px solid #7A5230", boxShadow: "inset 0 0 0 4px #5C3C22" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1858, height: 18, background: "#5C3C22", borderRadius: 4 }} />
      <AbsoluteFill style={{ background: "radial-gradient(520px 140px at 760px 700px, rgba(255,255,255,.05), transparent), radial-gradient(420px 120px at 300px 1060px, rgba(255,255,255,.045), transparent)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "url(#chalk-s)" }}>
        {passes.map((p, i) => (
          <g key={i} transform={`translate(${p.dx} ${p.dy})`} opacity={p.a}>
            <Drawing f={f} />
          </g>
        ))}
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const ChalkStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand printColor={IVORY} grain={0.07} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
