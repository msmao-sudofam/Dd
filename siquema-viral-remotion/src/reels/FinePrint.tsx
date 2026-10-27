import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, E, PopCaption, Reel, clamp, prog } from "../lib/fx";
import { ExampleBlendCard } from "../lib/labels";
import { ANTON, C, EXAMPLE_BLEND, INGREDIENTS, INTER, MONO, SERVING, SERVINGS, WARNINGS, sec } from "../lib/theme";

export const FINE_PRINT_DUR = sec(9);

const FOUND_AT = 90;
const SWAP_AT = 120;
const COUNT_AT = 142;
const COUNT_STEP = 6.5;
const countFrame = (i: number) => Math.round(COUNT_AT + i * COUNT_STEP);
const WARN_AT = 212;
const READABLE_AT = 225;

const LENS_R = 175;
const ZOOM = 2.3;

// Sí Quema mini label geometry (rows are fixed-height so the lens can find them)
const OURS = { left: 190, top: 520, width: 700, rowTop: 612, rowH: 36, warnTop: 958 };
const rowY = (i: number) => OURS.rowTop + i * OURS.rowH + OURS.rowH / 2;
const AMOUNT = { x: 795, y: 748 };
const DOSE_X = 812; // lens sits on the dose column while counting
const WARN = { x: 335, y: OURS.warnTop + 10 };

const BlendMini: React.FC = () => (
  <div style={{ position: "absolute", left: 220, top: 620 }}>
    <div style={{ fontFamily: MONO, fontSize: 18, color: "#666", marginBottom: 8, position: "absolute", top: -30, whiteSpace: "nowrap" }}>{EXAMPLE_BLEND.label}</div>
    <ExampleBlendCard width={640} scale={0.55} />
  </div>
);

const OursMini: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: OURS.left,
      top: OURS.top,
      width: OURS.width,
      height: 520,
      background: "#fff",
      border: `3px solid ${C.ink}`,
      padding: "14px 22px",
      fontFamily: INTER,
      color: C.ink,
      boxSizing: "border-box",
    }}
  >
    <div style={{ fontWeight: 800, fontSize: 34, lineHeight: 1 }}>Supplement Facts</div>
    <div style={{ fontWeight: 500, fontSize: 15, marginTop: 6 }}>
      {SERVING} · {SERVINGS}
    </div>
    <div style={{ height: 8, background: C.ink, margin: "8px 0 0" }} />
    <div style={{ position: "absolute", left: 22, right: 22, top: OURS.rowTop - OURS.top }}>
      {INGREDIENTS.map((ing) => (
        <div key={ing.name} style={{ height: OURS.rowH, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17, borderBottom: "1px solid #ccc" }}>
          <span style={{ fontWeight: 500 }}>{ing.name}</span>
          <span style={{ fontWeight: 800 }}>{ing.dose}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 22, right: 22, top: OURS.warnTop - OURS.top, fontSize: 14, lineHeight: 1.35 }}>
      <b>WARNING:</b> {WARNINGS.join(" ")}
    </div>
  </div>
);

/** Lens position over time. */
const lensAt = (f: number): { x: number; y: number } => {
  if (f < SWAP_AT) {
    const xs = [380, 700, 430, 560, AMOUNT.x];
    const ys = [700, 740, 820, 700, AMOUNT.y];
    const t = [0, 22, 42, 62, 82];
    return {
      x: interpolate(f, t, xs, { ...clamp, easing: E.inOut }),
      y: interpolate(f, t, ys, { ...clamp, easing: E.inOut }),
    };
  }
  if (f < COUNT_AT) {
    const k = prog(f, SWAP_AT + 6, COUNT_AT - SWAP_AT - 6, E.inOut);
    return { x: interpolate(k, [0, 1], [AMOUNT.x, DOSE_X]), y: interpolate(k, [0, 1], [AMOUNT.y, rowY(0)]) };
  }
  if (f < WARN_AT) {
    const n = Math.min(8, Math.max(0, (f - COUNT_AT) / COUNT_STEP));
    const i = Math.floor(n);
    const k = E.inOut(Math.min(1, (n - i) * 2.2));
    return { x: DOSE_X, y: rowY(i) + (i < 8 ? (rowY(i + 1) - rowY(i)) * k : 0) };
  }
  const k = prog(f, WARN_AT, 10, E.inOut);
  return { x: interpolate(k, [0, 1], [DOSE_X, WARN.x]), y: interpolate(k, [0, 1], [rowY(8), WARN.y]) };
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const ours = f >= SWAP_AT;
  const swapK = prog(f, SWAP_AT - 4, 8, E.inOut);
  const { x, y } = lensAt(f);
  const count = f >= COUNT_AT ? INGREDIENTS.filter((_, i) => f >= countFrame(i)).length : ours ? 0 : 1;
  const lastTick = count > 0 && ours ? countFrame(count - 1) : FOUND_AT;
  const bump = Math.max(0, 1 - (f - lastTick) / 6);
  const showBadge = f >= FOUND_AT;
  const Layer = ours ? OursMini : BlendMini;

  return (
    <AbsoluteFill style={{ background: "#E7E0D4" }}>
      <AbsoluteFill style={{ opacity: 1 - Math.sin(swapK * Math.PI) * 0.9 }}>
        <Layer />
        {/* lens: the same layer, magnified around the lens center, clipped to a circle */}
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${LENS_R - 6}px at ${x}px ${y}px)` }}>
          <AbsoluteFill style={{ background: ours ? "#fff" : "#fff" }} />
          <AbsoluteFill style={{ transformOrigin: `${x}px ${y}px`, transform: `scale(${ZOOM})` }}>
            <Layer />
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
      {/* lens rim + handle */}
      <div style={{ position: "absolute", left: x - LENS_R, top: y - LENS_R, width: LENS_R * 2, height: LENS_R * 2 }}>
        <div
          style={{
            position: "absolute",
            left: LENS_R * 1.62,
            top: LENS_R * 1.62,
            width: 60,
            height: 210,
            borderRadius: 30,
            background: C.ink,
            transform: "rotate(-45deg)",
            transformOrigin: "30px 0",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `14px solid ${C.ink}`,
            boxShadow: "inset 0 0 0 3px rgba(255,255,255,.6), inset -20px -30px 60px rgba(0,0,0,.08), 0 20px 50px rgba(0,0,0,.3)",
            background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), transparent 40%)",
          }}
        />
        {showBadge ? (
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: C.brightRed,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: ANTON,
              fontSize: 72,
              transform: `scale(${1 + 0.25 * bump})`,
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            {count}
          </div>
        ) : null}
      </div>

      {f < FOUND_AT ? <Caption text="zoom in on the back of your pre-workout" top={260} /> : null}
      <PopCaption text="found: 1 number." top={260} at={FOUND_AT} until={SWAP_AT} />
      <PopCaption text="now ours." top={260} at={SWAP_AT} until={READABLE_AT} />
      <PopCaption text="even the warnings are readable." top={260} at={READABLE_AT} />
    </AbsoluteFill>
  );
};

export const FinePrint: React.FC = () => (
  <Reel
    dur={FINE_PRINT_DUR}
    hits={[FOUND_AT, SWAP_AT + 4, WARN_AT + 10, READABLE_AT]}
    sfx={[
      { at: 4, s: "whoosh", v: 0.2 },
      { at: FOUND_AT, s: "impact", v: 0.6 },
      { at: FOUND_AT, s: "pop" },
      { at: SWAP_AT - 4, s: "whoosh" },
      ...INGREDIENTS.map((_, i) => ({ at: countFrame(i), s: "tick" as const })),
      { at: WARN_AT + 10, s: "ding", v: 0.35 },
      { at: READABLE_AT, s: "pop" },
    ]}
  >
    <Body />
  </Reel>
);
