import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Label, PopCaption, Reel, hash, prog } from "../lib/fx";
import { ANTON, C, FLAVORS, INGREDIENTS, INTER, sec } from "../lib/theme";

export const CHALK_DUR = sec(8);

const STRIP_AT = 36;
const STRIP_STEP = 22.5; // 0.75 s per flavor
const stripFrame = (i: number) => Math.round(STRIP_AT + i * STRIP_STEP);
const ROWS_AT = 126;
const ROW_STEP = 4;
const CAPTION_AT = 196;

const FLAVOR_BG: Record<string, string> = {
  MANGO: "linear-gradient(90deg,#FFB627,#F68A1E)",
  WATERMELON: "linear-gradient(90deg,#FF5C6E,#E5202F)",
  "KIWI STRAWBERRY": "linear-gradient(90deg,#8CC63F 0px,#8CC63F 420px,#E5202F 520px,#E5202F 940px)",
  "CUCUMBER LIME": "linear-gradient(90deg,#B9E36B,#5DBB46)",
};

const BOARD = "#1D2621";

const ChalkDust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => {
        const x = (hash(i) * 1080 + f * (0.3 + hash(i + 7) * 0.8)) % 1080;
        const y = (hash(i + 50) * 1920 - f * (0.2 + hash(i + 9) * 0.6) + 3840) % 1920;
        const r = 2 + hash(i + 90) * 5;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: 999, background: "#fff", opacity: 0.08 + hash(i + 30) * 0.22, filter: "blur(1px)" }}
          />
        );
      })}
    </>
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const stripsOut = prog(f, ROWS_AT - 8, 8, E.in);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(1200px 1600px at 540px 860px, #2A352F, ${BOARD} 880px, #0F1512 1600px)` }}>
        {/* chalk smudges */}
        <AbsoluteFill style={{ background: "radial-gradient(500px 220px at 324px 1382px, rgba(255,255,255,.05), transparent), radial-gradient(420px 180px at 810px 576px, rgba(255,255,255,.04), transparent)" }} />
        <ChalkDust />

        {/* flavor strips */}
        {f < ROWS_AT ? (
          <div style={{ position: "absolute", left: 70, right: 70, top: 470, opacity: 1 - stripsOut, transform: `translateY(${-60 * stripsOut}px)` }}>
            <Label color={C.cream} style={{ opacity: 0.8, marginBottom: 18, fontSize: 30 }}>
              ours tastes like
            </Label>
            {FLAVORS.map((fl, i) => {
              const on = f >= stripFrame(i);
              const k = prog(f, stripFrame(i), 7, E.settle);
              return (
                <div
                  key={fl}
                  style={{
                    height: 130,
                    marginBottom: 22,
                    borderRadius: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: ANTON,
                    fontSize: 92,
                    letterSpacing: "0.01em",
                    background: on ? FLAVOR_BG[fl] : "transparent",
                    border: on ? "none" : "4px dashed rgba(243,238,230,.28)",
                    color: on ? C.ink : "rgba(243,238,230,.22)",
                    transform: `scale(${on ? 0.94 + 0.06 * k : 0.94})`,
                    boxShadow: "none",
                  }}
                >
                  {fl}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* plain-English rows */}
        {f >= ROWS_AT - 2 ? (
          <div style={{ position: "absolute", left: 70, right: 70, top: 250 }}>
            {INGREDIENTS.map((ing, i) => {
              const k = prog(f, ROWS_AT + i * ROW_STEP, 7);
              return (
                <div key={ing.name} style={{ height: 88, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, borderBottom: "2px solid rgba(243,238,230,.12)", paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: INTER, fontWeight: 800, fontSize: 32, color: C.cream }}>
                    <span>{ing.name}</span>
                    <span style={{ color: "#FFB627" }}>{ing.dose}</span>
                  </div>
                  <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 25, color: C.cream, opacity: 0.7, marginTop: 2 }}>{ing.note}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        {f < ROWS_AT ? <Caption text="if your pre-workout tastes like chalk..." top={260} /> : null}
        <PopCaption text="tastes good. hides nothing." top={1090} at={CAPTION_AT} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TastesLikeChalk: React.FC = () => (
  <Reel
      dur={CHALK_DUR}
      fda
      printColor={C.cream}
      hits={[...FLAVORS.map((_, i) => stripFrame(i)), CAPTION_AT]}
      sfx={[
        ...FLAVORS.map((_, i) => ({ at: stripFrame(i), s: "pop" as const })),
        { at: ROWS_AT - 6, s: "whoosh", v: 0.35 }, // gate: allow stock-sfx, synthesized, requested in the brief
        ...INGREDIENTS.map((_, i) => ({ at: ROWS_AT + i * ROW_STEP, s: "tick" as const, v: 0.25 })),
        { at: CAPTION_AT, s: "pop" },
      ]}
  >
    <Body />
  </Reel>
);
