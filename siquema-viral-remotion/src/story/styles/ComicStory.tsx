import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { E, Reel, hash, prog } from "../../lib/fx";
import { BANGERS } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, ChalkCloud, Crowd, Figure, Shaker, defaultMap as map } from "../draw2d";
import { B, STORY_DUR, poseAt } from "../rig";

// PR DAY in /comicart: an inked pop-art panel. Ben-Day sky, inked city, a burst on the PR beat.
const INK = "#141414";
const SKY = "#57A8E6";
const YEL = "#F7D33C";
const RED = "#D7192A";
const SKIN = "#F2C49B";

const Dots: React.FC<{ id: string; color: string; r: number; opacity: number }> = ({ id, color, r, opacity }) => (
  <>
    <defs>
      <pattern id={id} width={24} height={42} patternUnits="userSpaceOnUse">
        <circle cx={6} cy={10} r={r} fill={color} />
        <circle cx={18} cy={31} r={r} fill={color} />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} opacity={opacity} />
  </>
);

const City: React.FC = () => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const w = 100 + Math.floor(hash(i) * 50);
      const h = 220 + Math.floor(hash(i + 30) * 260);
      const x = i * 120 - 20;
      return (
        <g key={i}>
          <rect x={x} y={1290 - h} width={w} height={h} fill="#2E5BBA" stroke={INK} strokeWidth={8} />
          {Array.from({ length: Math.floor(h / 70) }, (_, j) =>
            [0, 1].map((k) => <rect key={`${j}-${k}`} x={x + 18 + k * (w / 2 - 6)} y={1290 - h + 26 + j * 66} width={26} height={34} fill={YEL} stroke={INK} strokeWidth={4} />),
          )}
        </g>
      );
    })}
  </g>
);

const Burst: React.FC<{ k: number }> = ({ k }) => {
  const pts = Array.from({ length: 22 }, (_, i) => {
    const r = i % 2 ? 120 : 190;
    const a = (i / 22) * Math.PI * 2;
    return `${Math.cos(a) * r},${Math.sin(a) * r * 0.62}`;
  }).join(" ");
  return (
    <g transform={`translate(780 640) scale(${0.6 + 0.4 * k}) rotate(-8)`} opacity={k > 0 ? 1 : 0}>
      <polygon points={pts} fill={YEL} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <text x={0} y={22} textAnchor="middle" fontFamily={BANGERS} fontSize={76} fill={RED} stroke={INK} strokeWidth={3}>
        SÍ QUEMA!
      </text>
    </g>
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const burst = prog(f, B.lock, 6, E.settle);
  const pressing = f >= B.press && f < B.lock + 10;
  const torsoA = map([(pose.shL[0] + pose.shR[0]) / 2, (pose.shL[1] + pose.shR[1]) / 2]);
  const torsoB = map(pose.pelvis);
  return (
    <AbsoluteFill style={{ background: SKY }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Dots id="sky-dots" color="#2E7BC0" r={5} opacity={0.5} />
        <City />
        {/* speed lines while the bar goes up */}
        {pressing
          ? Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return <line key={i} x1={540 + Math.cos(a) * 320} y1={700 + Math.sin(a) * 320} x2={540 + Math.cos(a) * 620} y2={700 + Math.sin(a) * 620} stroke={INK} strokeWidth={6} />;
            })
          : null}
        {/* ground */}
        <rect x={0} y={1290} width={1080} height={630} fill={YEL} stroke={INK} strokeWidth={8} />
        <Dots id="ground-dots" color="#E0A800" r={6} opacity={0.6} />
        <rect x={250} y={1282} width={580} height={22} fill="#8A5A34" stroke={INK} strokeWidth={8} />
        <Shaker f={f} body="#FFFFFF" lid={INK} stroke={INK} width={6} />
        {/* inked lifter: black outline pass, then color pass */}
        <Figure pose={pose} stroke={INK} width={44} head={{ fill: INK, r: 0.15 }} />
        <Figure pose={pose} stroke={SKIN} width={28} head={{ fill: SKIN, stroke: SKIN, r: 0.13 }} />
        <line x1={torsoA[0]} y1={torsoA[1] + 10} x2={torsoB[0]} y2={torsoB[1]} stroke={INK} strokeWidth={96} strokeLinecap="round" />
        <line x1={torsoA[0]} y1={torsoA[1] + 10} x2={torsoB[0]} y2={torsoB[1]} stroke={RED} strokeWidth={80} strokeLinecap="round" />
        <path d={`M ${map(pose.head)[0] - 46} ${map(pose.head)[1] - 10} Q ${map(pose.head)[0]} ${map(pose.head)[1] - 80} ${map(pose.head)[0] + 46} ${map(pose.head)[1] - 10}`} fill={INK} />
        <ChalkCloud f={f} color="#FFFFFF" />
        <Barbell f={f} bar={INK} plate={RED} plateStroke={INK} width={14} />
        <Crowd f={f} skin={[SKIN, "#C98B5E", "#8D5A3B"]} shirt={[RED, "#2E5BBA", YEL, "#3E8E3A"]} outline={INK} outlineW={7} signBg="#FFFFFF" signFg={RED} signFont={BANGERS} />
        <Burst k={burst} />
        {/* panel border */}
        <rect x={20} y={20} width={1040} height={1880} fill="none" stroke={INK} strokeWidth={16} />
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const ComicStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printColor={INK} grain={0.05} hits={[B.lock]} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
