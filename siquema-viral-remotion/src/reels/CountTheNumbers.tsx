import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption, E, Label, Reel, prog } from "../lib/fx";
import { DoseRow, ExampleBlendCard } from "../lib/labels";
import { ANTON, C, EXAMPLE_BLEND, INGREDIENTS, INTER, sec } from "../lib/theme";

export const COUNT_DUR = sec(8);

const SPLIT = 820;
const TICK_AT = 30;
const TICK_STEP = 7.5; // 0.25 s per dose row
const tickFrame = (i: number) => Math.round(TICK_AT + i * TICK_STEP);
const COMPARE_AT = 100;
const BIG_AT = 150;

const Tag: React.FC<{ children: React.ReactNode; top: number; at: number; bg: string; color: string; left?: number; size?: number }> = ({ children, top, at, bg, color, left, size = 76 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = prog(f, at, 7, E.settle);
  return (
    <div style={{ position: "absolute", top, ...(left === undefined ? { width: "100%", textAlign: "center" } : { left }), transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 2) }}>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: size, background: bg, color, padding: "10px 34px", borderRadius: 18 }}>{children}</span>
    </div>
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const count = INGREDIENTS.filter((_, i) => f >= tickFrame(i)).length;
  const lastTick = count > 0 ? tickFrame(count - 1) : -99;
  const bump = Math.max(0, 1 - (f - lastTick) / 6);
  const shake = f >= TICK_AT && f < tickFrame(8) + 6 ? Math.sin(f * 2.3) * 6 * bump : 0;
  const dimRows = prog(f, COMPARE_AT + 8, 6);
  const big = prog(f, BIG_AT, 7, E.out);

  return (
    <AbsoluteFill>
      {/* TOP: example blend label */}
      <AbsoluteFill style={{ background: "#CFCAC2", height: SPLIT }}>
        <Label style={{ position: "absolute", left: 70, top: 455, color: "#555" }}>{EXAMPLE_BLEND.label}</Label>
        <ExampleBlendCard width={560} scale={0.62} style={{ position: "absolute", left: 70, top: 500 }} />
        <div style={{ position: "absolute", left: 680, right: 70, top: 470, textAlign: "center", transform: `translateX(${shake}px)`, opacity: 1 - prog(f, COMPARE_AT - 4, 4) }}>
          <Label style={{ color: "#555" }}>numbers:</Label>
          <div style={{ fontFamily: ANTON, fontSize: 230, lineHeight: 1.05, color: "#7a756d" }}>1</div>
        </div>
      </AbsoluteFill>

      {/* BOTTOM: Sí Quema */}
      <AbsoluteFill style={{ background: C.cream, top: SPLIT }}>
        <div style={{ position: "absolute", left: 70, top: 34, fontFamily: ANTON, fontSize: 76, color: C.ink, lineHeight: 1 }}>SÍ QUEMA</div>
        <div style={{ position: "absolute", right: 70, top: 20, display: "flex", alignItems: "baseline", gap: 14 }}>
          <Label style={{ color: "#555" }}>numbers:</Label>
          <span style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: C.red, display: "inline-block", transform: `scale(${1 + 0.18 * bump})` }}>{count}</span>
        </div>
        {/* empty label lines waiting to fill (the cover frame reads as a label) */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 150 }}>
          {INGREDIENTS.map((ing, i) => (
            <div key={ing.name} style={{ height: 47, display: "flex", alignItems: "center", gap: 16, opacity: f >= tickFrame(i) ? 0 : 0.5 }}>
              <div style={{ width: 300 + ((i * 97) % 220), height: 14, borderRadius: 7, background: "#DCD4C7" }} />
              <div style={{ flex: 1, borderBottom: "3px dotted #DCD4C7" }} />
              <div style={{ width: 90, height: 14, borderRadius: 7, background: "#DCD4C7" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 150 }}>
          {INGREDIENTS.map((ing, i) => {
            const k = prog(f, tickFrame(i), 5, E.settle);
            const isCaff = i === 0;
            return (
              <DoseRow
                key={ing.name}
                name={ing.name}
                dose={ing.dose}
                size={31}
                style={{
                  height: 47,
                  opacity: (f >= tickFrame(i) ? Math.min(1, k * 2) : 0) * (isCaff ? 1 : 1 - dimRows),
                  transform: `translateX(${(1 - k) * 60}px)`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      <Tag top={600} left={650} size={54} at={COMPARE_AT} bg={C.ink} color={C.cream}>
        Caffeine: <span style={{ color: C.brightRed }}>?</span>
      </Tag>
      <Tag top={1160} at={COMPARE_AT + 12} bg={C.red} color="#fff">
        Caffeine: 200 mg
      </Tag>

      {f < COMPARE_AT ? <Caption text="count the numbers on each label" top={260} /> : null}

      {f >= BIG_AT ? (
        <AbsoluteFill style={{ background: C.dark, opacity: Math.min(1, big * 3) }}>
          <div
            style={{
              position: "absolute",
              top: 560,
              width: "100%",
              textAlign: "center",
              fontFamily: ANTON,
              fontSize: 300,
              lineHeight: 1,
              color: C.cream,
              transform: `scale(${2.4 - 1.4 * big})`,
            }}
          >
            1 <span style={{ fontSize: 150 }}>VS</span> <span style={{ color: C.brightRed }}>9.</span>
          </div>
          <Label color={C.cream} style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", opacity: prog(f, BIG_AT + 12, 8) * 0.8, fontSize: 30 }}>
            numbers on the label
          </Label>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const CountTheNumbers: React.FC = () => (
  <Reel
      dur={COUNT_DUR}
      printColor={(f) => (f >= BIG_AT ? C.cream : C.ink)}
      hits={[COMPARE_AT, COMPARE_AT + 12, BIG_AT]}
      sfx={[
        ...INGREDIENTS.map((_, i) => ({ at: tickFrame(i), s: "tick" as const })),
        { at: COMPARE_AT, s: "pop" },
        { at: COMPARE_AT + 12, s: "pop" },
        { at: BIG_AT - 4, s: "whoosh", v: 0.35 }, // gate: allow stock-sfx, synthesized, requested in the brief
        { at: BIG_AT, s: "impact" },
      ]}
  >
    <Body />
  </Reel>
);
