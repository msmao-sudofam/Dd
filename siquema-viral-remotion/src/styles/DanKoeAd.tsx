import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Reel, prog } from "../lib/fx";
import { C, EXAMPLE_BLEND, INGREDIENTS, INTER, MONO, sec } from "../lib/theme";

// Animation Studio /dankoe — one idea: a blend label gives you 1 number, ours gives you 9.
export const DANKOE_AD_DUR = sec(8);

const WHITE = "#F5F5F5";
const BLEND = { x: 540, y: 620 };
const HIDDEN = [
  { x: 380, y: 520 },
  { x: 700, y: 520 },
  { x: 330, y: 700 },
  { x: 750, y: 700 },
  { x: 540, y: 780 },
];
const HUB = { x: 540, y: 950 };
const NODE_AT = 40;
const NODE_STEP = 9;
const nodeFrame = (i: number) => NODE_AT + i * NODE_STEP;
const TALLY_AT = nodeFrame(INGREDIENTS.length) + 10;
// nine dose nodes on two columns under the hub
// short display names so each label fits beside its node
const SHORT = ["Caffeine", "N-Acetyl L-Carnitine", "L-Carnitine L-Tartrate", "L-Tyrosine", "L-Theanine", "Capsimax®", "GBB", "AstraGin®", "Grains of Paradise"];
const nodePos = (i: number) => ({ x: i % 2 === 0 ? 400 : 680, y: 1040 + Math.floor(i / 2) * 78 + (i % 2) * 39 });

const Line: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; at: number; dur?: number; dashed?: boolean; opacity?: number }> = ({
  a,
  b,
  at,
  dur = 10,
  dashed,
  opacity = 0.9,
}) => {
  const f = useCurrentFrame();
  const k = at <= 0 ? 1 : prog(f, at, dur, E.inOut);
  if (k <= 0) return null;
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={a.x + (b.x - a.x) * k}
      y2={a.y + (b.y - a.y) * k}
      stroke={WHITE}
      strokeWidth={2.5}
      strokeDasharray={dashed ? "4 10" : undefined}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const tally = prog(f, TALLY_AT, 10);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the blend: one node, five ingredients you can't read (dashed, no numbers) */}
        {HIDDEN.map((h, i) => (
          <React.Fragment key={i}>
            <Line a={BLEND} b={h} at={0} dashed opacity={0.45} />
            <circle cx={h.x} cy={h.y} r={6} fill="none" stroke={WHITE} strokeWidth={2} opacity={0.5} />
          </React.Fragment>
        ))}
        <circle cx={BLEND.x} cy={BLEND.y} r={9} fill={WHITE} />

        {/* ours: a hub with nine readable doses */}
        <Line a={BLEND} b={HUB} at={NODE_AT - 18} dur={14} opacity={0.35} />
        <circle cx={HUB.x} cy={HUB.y} r={9} fill={WHITE} opacity={prog(f, NODE_AT - 6, 6)} />
        {INGREDIENTS.map((ing, i) => {
          const p = nodePos(i);
          const on = prog(f, nodeFrame(i) + 8, 6);
          return (
            <React.Fragment key={ing.name}>
              <Line a={HUB} b={p} at={nodeFrame(i)} dur={9} opacity={0.6} />
              <circle cx={p.x} cy={p.y} r={6} fill={i === 0 ? C.brightRed : WHITE} opacity={on} />
            </React.Fragment>
          );
        })}
      </svg>

      {/* labels: small, understated */}
      <div style={{ position: "absolute", top: BLEND.y - 72, width: "100%", textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 36, color: WHITE }}>
        {EXAMPLE_BLEND.line} · {EXAMPLE_BLEND.amount}
      </div>
      <div style={{ position: "absolute", top: BLEND.y + 22, width: "100%", textAlign: "center", fontFamily: MONO, fontSize: 26, color: WHITE, opacity: 0.6 }}>
        {EXAMPLE_BLEND.label}
      </div>
      <div style={{ position: "absolute", top: HUB.y - 62, width: "100%", textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 36, color: WHITE, opacity: prog(f, NODE_AT - 6, 6) }}>
        Sí Quema
      </div>
      {INGREDIENTS.map((ing, i) => {
        const p = nodePos(i);
        const on = prog(f, nodeFrame(i) + 8, 6);
        const left = i % 2 === 0;
        return (
          <div
            key={ing.name}
            style={{
              position: "absolute",
              top: p.y - 17,
              ...(left ? { right: 1080 - p.x + 20, textAlign: "right" as const } : { left: p.x + 20 }),
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: 27,
              color: WHITE,
              opacity: on,
              whiteSpace: "nowrap",
            }}
          >
            {left ? (
              <>
                {SHORT[i]} <span style={{ color: i === 0 ? C.brightRed : WHITE, fontWeight: 800 }}>{ing.dose}</span>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 800 }}>{ing.dose}</span> {SHORT[i]}
              </>
            )}
          </div>
        );
      })}

      {/* the tally: the point of the piece */}
      <div style={{ position: "absolute", top: 1385, width: "100%", textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 54, color: WHITE, opacity: tally, letterSpacing: "0.02em" }}>
        1 number <span style={{ opacity: 0.5 }}>vs</span> <span style={{ color: C.brightRed, fontWeight: 800 }}>9</span>
      </div>

      <Caption text="count the numbers" top={260} />
    </AbsoluteFill>
  );
};

export const DanKoeAd: React.FC = () => (
  <Reel
    dur={DANKOE_AD_DUR}
    printColor="#F5F5F5"
    grain={0.04}
    sfx={[...INGREDIENTS.map((_, i) => ({ at: nodeFrame(i) + 8, s: "tick" as const, v: 0.18 })), { at: TALLY_AT, s: "pop" as const, v: 0.3 }]}
  >
    <Body />
  </Reel>
);
