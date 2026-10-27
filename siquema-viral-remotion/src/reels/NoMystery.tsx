import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Reel, prog } from "../lib/fx";
import { ANTON, C, INTER, sec } from "../lib/theme";

// 8 cards x 0.9 s = 7.2 s, + the NO MYSTERY slam + 0.5 s loop = 9.5 s
export const NO_MYSTERY_DUR = sec(9.5);

const CARDS = [
  { dose: "200 mg", name: "Caffeine" },
  { dose: "350 mg", name: "L-Theanine" },
  { dose: "500 mg", name: "L-Tyrosine" },
  { dose: "2 g", name: "L-Carnitine" },
  { dose: "100 mg", name: "Capsimax®" },
  { dose: "75 mg", name: "GBB" },
  { dose: "50 mg", name: "AstraGin®" },
  { dose: "40 mg", name: "Grains of Paradise" },
];
const STEP = 27; // 0.9 s
const END_AT = CARDS.length * STEP; // 216
const THEMES = [
  { bg: C.cream, fg: C.ink, accent: C.red },
  { bg: C.red, fg: C.cream, accent: C.cream },
  { bg: C.dark, fg: C.cream, accent: C.brightRed },
];

const CUTS = CARDS.map((_, n) => n * STEP).filter((x) => x > 0);
const themeAt = (f: number) => (f >= END_AT ? THEMES[2] : THEMES[Math.min(CARDS.length - 1, Math.floor(f / STEP)) % 3]);

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(CARDS.length - 1, Math.floor(f / STEP));
  const end = f >= END_AT;
  const th = themeAt(f);
  const local = f - i * STEP;
  const k = i === 0 && f < STEP ? 1 : prog(local, 0, 6, E.back);
  const card = CARDS[i];
  const ek = prog(f, END_AT, 7);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: th.bg }}>
        {!end ? (
          <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", transform: `scale(${0.82 + 0.18 * k})` }}>
            <div style={{ fontFamily: ANTON, fontSize: card.dose.length > 5 ? 250 : 300, lineHeight: 1, color: th.accent }}>{card.dose.toUpperCase()}</div>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: card.name.length > 12 ? 74 : 92, lineHeight: 1.1, color: th.fg, marginTop: 24, letterSpacing: "-0.02em" }}>
              {card.name}
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 26, color: th.fg, opacity: 0.5, marginTop: 30 }}>
              {i + 1} / {CARDS.length}
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: 600,
              width: "100%",
              textAlign: "center",
              fontFamily: ANTON,
              fontSize: 210,
              lineHeight: 0.98,
              color: th.fg,
              transform: `scale(${2 - ek})`,
            }}
          >
            NO
            <br />
            <span style={{ color: th.accent }}>MYSTERY.</span>
          </div>
        )}
        <Caption text="every dose in our pre-workout:" top={260} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const NoMystery: React.FC = () => (
  <Reel
    dur={NO_MYSTERY_DUR}
    printColor={(f) => themeAt(f).fg}
    hits={[...CUTS, END_AT]}
    sfx={[...CUTS.map((at) => ({ at, s: "pop" as const })), { at: END_AT, s: "impact" }]}
  >
    <Body />
  </Reel>
);
