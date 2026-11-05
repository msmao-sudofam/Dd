import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Reel, prog } from "../lib/fx";
import { BANGERS, EXAMPLE_BLEND, INGREDIENTS, INTER, MONO, sec } from "../lib/theme";

// Animation Studio /comicart — wrong label vs right label, two inked panels.
// Watch-style reason: a side-by-side comparison is what comic panels are built for, and the
// contrast (one hidden number vs nine doses) is the whole message. No people, no dialogue.
export const COMIC_AD_DUR = sec(8);

const INK = "#141414";
const PAPER = "#F6EEDC";
const YEL = "#F7D33C";
const BLUE = "#2E5BBA";
const RED = "#D7192A";
const PANEL2_AT = 36;
const ROW_AT = 52;
const ROW_STEP = 9;
const COUNT_AT = ROW_AT + INGREDIENTS.length * ROW_STEP + 10;

/** Ben-Day dot field (offset rows) for flat print shading. */
const Dots: React.FC<{ color: string; r?: number; opacity?: number }> = ({ color, r = 6, opacity = 0.35 }) => {
  const id = `dots-${color.replace("#", "")}-${r}`;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id={id} width={24} height={42} patternUnits="userSpaceOnUse">
          <circle cx={6} cy={10} r={r} fill={color} />
          <circle cx={18} cy={31} r={r} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
};

const Panel: React.FC<{ top: number; height: number; rot: number; bg: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  height,
  rot,
  bg,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      top,
      height,
      background: bg,
      border: `10px solid ${INK}`,
      transform: `rotate(${rot}deg)`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const CaptionBox: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = YEL }) => (
  <div
    style={{
      position: "absolute",
      left: -4,
      top: -4,
      background: bg,
      border: `6px solid ${INK}`,
      padding: "4px 18px",
      fontFamily: BANGERS,
      fontSize: 52,
      letterSpacing: "0.03em",
      color: INK,
    }}
  >
    {children}
  </div>
);

/** Narration box for the count (a claim goes in a caption box, never a starburst). */
const CountBox: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", right: 64, top: 902, transform: `translateY(${(1 - k) * 30}px) rotate(1deg)`, opacity: k, background: YEL, border: `6px solid ${INK}`, padding: "2px 18px", fontFamily: BANGERS, fontSize: 46, letterSpacing: "0.03em", color: INK }}>
    9 DOSES. ALL ON THE LABEL.
  </div>
);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const p2 = prog(f, PANEL2_AT, 9, E.settle);
  const count = prog(f, COUNT_AT, 7, E.settle);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Dots color="#D9C9A8" r={3} opacity={0.6} />

      {/* panel 1: the wrong label */}
      <Panel top={430} height={470} rot={-1.2} bg={RED}>
        <Dots color="#8E0F1A" r={6} opacity={0.5} />
        <CaptionBox>WRONG LABEL</CaptionBox>
        <div style={{ position: "absolute", left: 120, right: 120, top: 120, background: PAPER, border: `8px solid ${INK}`, padding: "20px 26px", fontFamily: INTER, color: INK }}>
          <div style={{ fontWeight: 800, fontSize: 40 }}>Supplement Facts</div>
          <div style={{ height: 10, background: INK, margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 32 }}>
            <span>{EXAMPLE_BLEND.line}</span>
            <span>{EXAMPLE_BLEND.amount}</span>
          </div>
          <div style={{ fontFamily: BANGERS, fontSize: 64, color: RED, marginTop: 6, letterSpacing: "0.04em" }}>??? ??? ???</div>
        </div>
        <div style={{ position: "absolute", bottom: 18, width: "100%", textAlign: "center", fontFamily: MONO, fontSize: 22, color: PAPER }}>{EXAMPLE_BLEND.label}</div>
      </Panel>

      {/* panel 2: the right label, wipes in */}
      <Panel top={930} height={460} rot={1} bg={BLUE} style={{ transform: `rotate(1deg) scale(${1 + 0.03 * (1 - p2)})` }}>
        <Dots color="#1C3D82" r={6} opacity={0.55} />
        <CaptionBox>RIGHT LABEL</CaptionBox>
        <div style={{ position: "absolute", left: 60, right: 60, top: 88, background: PAPER, border: `8px solid ${INK}`, padding: "12px 22px", fontFamily: INTER, color: INK }}>
          {INGREDIENTS.map((ing, i) => {
            const on = f >= ROW_AT + i * ROW_STEP;
            return (
              <div key={ing.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 29, lineHeight: "35px", opacity: on ? 1 : 0.12 }}>
                <span style={{ fontWeight: 500 }}>{ing.name}</span>
                <span style={{ fontWeight: 800, color: RED }}>{ing.dose}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      {f >= COUNT_AT ? <CountBox k={count} /> : null}
      <Caption text="wrong label vs right label" top={260} />
    </AbsoluteFill>
  );
};

export const ComicArtAd: React.FC = () => (
  <Reel
    dur={COMIC_AD_DUR}
    hits={[PANEL2_AT, COUNT_AT]}
    grain={0.06}
    sfx={[
      { at: PANEL2_AT, s: "pop" as const },
      ...INGREDIENTS.map((_, i) => ({ at: ROW_AT + i * ROW_STEP, s: "tick" as const, v: 0.2 })),
      { at: COUNT_AT, s: "pop" as const, v: 0.5 },
    ]}
  >
    <Body />
  </Reel>
);
