import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Reel, hash } from "../../lib/fx";
import { ANTON } from "../../lib/theme";
import { StoryCaptions, STORY_SFX } from "../common";
import { Barbell, ChalkCloud, Figure, Shaker, defaultMap as map } from "../draw2d";
import { B, CROWD, SIGN, STORY_DUR, crowdJump, poseAt, signUp } from "../rig";

// PR DAY in /flatvector: editorial night city, moon, flat lifter (no outlines), crowd with phones up.
const P = { sky: "#14254A", sky2: "#1C3364", moon: "#F3E3C2", moon2: "#E2CBA0", city: "#0F1C38", city2: "#172B52", win: "#F6C55A", floor: "#26324F", wood: "#9A6A44", wood2: "#7E5536", skin: "#E8A97E", skinS: "#C98B5E", red: "#D7192A", redS: "#A8121F", ink: "#121826", hair: "#2B1C14" };

const Skyline: React.FC<{ base: number; fill: string; seed: number; win: boolean }> = ({ base, fill, seed, win }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => {
      const w = 90 + Math.floor(hash(i + seed) * 60);
      const h = 180 + Math.floor(hash(i + seed + 40) * 300);
      const x = i * 112 - 30;
      return (
        <g key={i}>
          <rect x={x} y={base - h} width={w} height={h} fill={fill} />
          {win
            ? Array.from({ length: Math.floor(h / 46) }, (_, j) =>
                [0, 1, 2].map((k) => (hash(i * 13 + j * 3 + k + seed) > 0.55 ? <rect key={`${j}-${k}`} x={x + 14 + k * 26} y={base - h + 20 + j * 44} width={14} height={20} fill={P.win} /> : null)),
              )
            : null}
        </g>
      );
    })}
  </g>
);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const up = signUp(f);
  const torsoA = map([(pose.shL[0] + pose.shR[0]) / 2, (pose.shL[1] + pose.shR[1]) / 2]);
  const torsoB = map(pose.pelvis);
  const head = map(pose.head);
  return (
    <AbsoluteFill style={{ background: P.sky }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect y={700} width={1080} height={700} fill={P.sky2} />
        {/* moon: base + shade plane */}
        <circle cx={820} cy={620} r={120} fill={P.moon} />
        <path d="M 820 500 A 120 120 0 0 1 820 740 A 90 120 0 0 0 820 500 Z" fill={P.moon2} />
        <Skyline base={1290} fill={P.city2} seed={3} win={false} />
        <Skyline base={1290} fill={P.city} seed={11} win />
        {/* floor + platform */}
        <rect y={1290} width={1080} height={630} fill={P.floor} />
        <rect x={240} y={1284} width={600} height={30} fill={P.wood} />
        <rect x={240} y={1300} width={600} height={14} fill={P.wood2} />
        <Shaker f={f} body="#F3EEE6" lid={P.ink} />
        {/* flat lifter: shade plane under the base shapes, no outlines */}
        <g transform="translate(6 4)">
          <Figure pose={pose} stroke={P.skinS} width={36} head={{ fill: P.skinS, stroke: P.skinS, r: 0.12 }} />
        </g>
        <Figure pose={pose} stroke={P.skin} width={34} head={{ fill: P.skin, stroke: P.skin, r: 0.12 }} />
        <line x1={torsoA[0]} y1={torsoA[1] + 12} x2={torsoB[0]} y2={torsoB[1]} stroke={P.red} strokeWidth={92} strokeLinecap="round" />
        <line x1={torsoA[0] + 22} y1={torsoA[1] + 20} x2={torsoB[0] + 22} y2={torsoB[1]} stroke={P.redS} strokeWidth={34} strokeLinecap="round" />
        <line x1={map(pose.hipL)[0]} y1={map(pose.hipL)[1]} x2={map(pose.hipR)[0]} y2={map(pose.hipR)[1]} stroke={P.ink} strokeWidth={60} strokeLinecap="round" />
        <path d={`M ${head[0] - 48} ${head[1] - 6} Q ${head[0] - 40} ${head[1] - 60} ${head[0]} ${head[1] - 58} Q ${head[0] + 48} ${head[1] - 56} ${head[0] + 46} ${head[1] - 2} Q ${head[0]} ${head[1] - 30} ${head[0] - 48} ${head[1] - 6} Z`} fill={P.hair} />
        <ChalkCloud f={f} color="#EDE6DA" />
        <Barbell f={f} bar="#C9CDD4" plate={P.red} width={12} />
        {/* crowd silhouettes with phones up after the lift */}
        {CROWD.map((x, i) => {
          const cx = 540 + x * 330;
          const cy = 1460 - crowdJump(f, i) * 300;
          const shade = i % 2 ? "#0B1222" : "#111A30";
          return (
            <g key={i}>
              <path d={`M ${cx - 70} ${cy + 140} Q ${cx - 70} ${cy + 20} ${cx} ${cy + 20} Q ${cx + 70} ${cy + 20} ${cx + 70} ${cy + 140} Z`} fill={shade} />
              <circle cx={cx} cy={cy - 20} r={42} fill={shade} />
              {f >= B.cheer && i !== 5 ? (
                <>
                  <line x1={cx + 40} y1={cy + 40} x2={cx + 64} y2={cy - 60} stroke={shade} strokeWidth={22} strokeLinecap="round" />
                  <rect x={cx + 50} y={cy - 112} width={30} height={52} rx={6} fill="#26324F" />
                  <rect x={cx + 54} y={cy - 106} width={22} height={38} rx={3} fill={P.win} />
                </>
              ) : null}
              {i === 5 && up > 0 ? (
                <g transform={`translate(0 ${-120 * up})`}>
                  <rect x={cx - 4} y={cy - 70} width={8} height={90} fill={shade} />
                  <rect x={cx - 140} y={cy - 150} width={280} height={84} rx={10} fill={P.red} />
                  <text x={cx} y={cy - 92} textAnchor="middle" fontFamily={ANTON} fontSize={54} fill={P.moon}>
                    {SIGN}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      <StoryCaptions />
    </AbsoluteFill>
  );
};

export const FlatStory: React.FC = () => (
  <Reel dur={STORY_DUR} push={0.05} printBand printColor="#F3E3C2" grain={0.04} sfx={STORY_SFX}>
    <Body />
  </Reel>
);
