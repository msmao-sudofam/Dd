import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Label, Reel, hash, prog } from "../lib/fx";
import { ANTON, C, INTER, sec } from "../lib/theme";

export const HARD_DUR = sec(8.5);

const PAIRS = [
  { name: "N-Acetyl L-Carnitine HCl", plain: "carnitine, form #1", dose: "1 g" },
  { name: "Gamma-Butyrobetaine HCl", plain: "the one that makes you sweat", dose: "75 mg" },
  { name: "Astragalus & Panax notoginseng ext.", plain: "AstraGin®, helps absorption*", dose: "50 mg" },
  { name: "Aframomum melegueta (seed) ext.", plain: "grains of paradise, a spice", dose: "40 mg" },
];
const PAIR_AT = 0; // first name is on the cover frame
const PAIR_STEP = 50; // ~1.7 s per name
const pairFrame = (i: number) => PAIR_AT + i * PAIR_STEP;
const SCRAMBLE = 14;
const CARD_DELAY = 17;
const CAPTION_AT = 200;

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&?";
const scramble = (text: string, k: number, f: number) =>
  text
    .split("")
    .map((ch, i) => {
      if (ch === " " || i / text.length < k) return ch;
      return GLYPHS[Math.floor(hash(i * 31 + f) * GLYPHS.length)];
    })
    .join("");

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(PAIRS.length - 1, Math.max(0, Math.floor((f - PAIR_AT) / PAIR_STEP)));
  const p = PAIRS[idx];
  const t0 = pairFrame(idx);
  const active = f >= PAIR_AT && f < CAPTION_AT;
  const sk = idx === 0 ? 1 : Math.min(1, (f - t0) / SCRAMBLE);
  const card = prog(f, t0 + CARD_DELAY, 9, E.back);
  const nameIn = idx === 0 ? 1 : prog(f, t0, 6);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at 50% 48%, #3a0a10 0%, ${C.dark} 70%)` }}>
        {active ? (
          <>
            <Label color={C.cream} style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", opacity: 0.55 }}>
              {`${idx + 1} / ${PAIRS.length}`}
            </Label>
            <div
              style={{
                position: "absolute",
                left: 70,
                right: 70,
                top: 580,
                textAlign: "center",
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 66,
                lineHeight: 1.12,
                color: C.cream,
                opacity: nameIn,
                transform: `translateY(${(1 - nameIn) * 40}px)`,
                minHeight: 160,
              }}
            >
              {scramble(p.name, sk, f)}
            </div>
            {f >= t0 + CARD_DELAY ? (
              <div
                style={{
                  position: "absolute",
                  left: 100,
                  right: 100,
                  top: 820,
                  background: C.cream,
                  borderRadius: 26,
                  padding: "30px 40px 34px",
                  transform: `translateY(${(1 - card) * 120}px) rotate(${(1 - card) * -3}deg)`,
                  opacity: Math.min(1, card * 2),
                  boxShadow: "0 30px 80px rgba(0,0,0,.45)",
                }}
              >
                <Label style={{ color: "#666" }}>translation:</Label>
                <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: C.ink, marginTop: 10 }}>{p.plain}</div>
                <div style={{ fontFamily: ANTON, fontSize: 96, lineHeight: 1, color: C.red, marginTop: 16 }}>{p.dose.toUpperCase()}</div>
              </div>
            ) : null}
          </>
        ) : null}

        {f >= CAPTION_AT ? (
          <div style={{ position: "absolute", top: 620, width: "100%", textAlign: "center", fontFamily: ANTON, fontSize: 130, lineHeight: 1.02, color: C.cream, transform: `scale(${1.3 - 0.3 * prog(f, CAPTION_AT, 7)})` }}>
            HARD TO SAY.
            <br />
            <span style={{ color: C.brightRed }}>EASY TO READ.</span>
          </div>
        ) : null}

        <Caption text="try saying these out loud" top={260} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const HardToSay: React.FC = () => (
  <Reel
      dur={HARD_DUR}
      fda
      printColor={C.cream}
      hits={[...PAIRS.map((_, i) => pairFrame(i) + CARD_DELAY), CAPTION_AT]}
      sfx={[
        ...PAIRS.flatMap((_, i) => [
          ...(i > 0 ? [{ at: pairFrame(i) - 2, s: "whoosh" as const, v: 0.25 }] : []),
          { at: pairFrame(i) + CARD_DELAY, s: "pop" as const },
        ]),
        { at: CAPTION_AT, s: "impact", v: 0.5 },
      ]}
  >
    <Body />
  </Reel>
);
