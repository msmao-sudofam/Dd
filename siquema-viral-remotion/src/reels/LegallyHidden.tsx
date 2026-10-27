import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, E, Label, PopCaption, Reel, clamp, prog } from "../lib/fx";
import { DoseRow, ExampleBlendCard } from "../lib/labels";
import { ANTON, C, EXAMPLE_BLEND, INGREDIENTS, INTER, MONO, SERVING, SERVINGS, sec } from "../lib/theme";

export const LEGALLY_HIDDEN_DUR = sec(9);

const ZOOM_AT = 36;
const CIRCLE_AT = 50;
const Q_AT = [84, 96, 108];
const WHIP_AT = 132;
const TYPE_AT = 150;
const TYPE_STEP = 5.4; // 0.18 s per dose
const CAPTION_AT = 205;

// where the "1,850 mg†" sits on the unzoomed card, and where the camera moves it to
const AMOUNT = { x: 842, y: 802 };
const FOCUS = { x: 540, y: 780 };
const CARD_TOP = 570;

const Questions = ["Caffeine?", "Carnitine?", "Cayenne?"];

const SceneBlend: React.FC = () => {
  const f = useCurrentFrame();
  const z = prog(f, ZOOM_AT, 34, E.inOut);
  const s = 1 + 1.6 * z;
  const tx = (FOCUS.x - AMOUNT.x) * z;
  const ty = (FOCUS.y - AMOUNT.y) * z;
  const band = Math.min(1, z * 2.5); // framing mask is solid early in the push
  const draw = prog(f, CIRCLE_AT, 20, E.inOut);
  const scrim = prog(f, Q_AT[0] - 6, 8);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${AMOUNT.x}px ${AMOUNT.y}px`,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        }}
      >
        <Label style={{ position: "absolute", top: CARD_TOP - 50, width: "100%", textAlign: "center", color: "#555", opacity: f < ZOOM_AT ? 1 : 0 }}>
          {EXAMPLE_BLEND.label}
        </Label>
        <ExampleBlendCard style={{ position: "absolute", left: 130, top: CARD_TOP }} />
      </AbsoluteFill>
      {/* the zoom is framed to a clean band around the blend row: cream above/below, soft fade on the cut edge */}
      <AbsoluteFill style={{ background: C.cream, opacity: band, height: FOCUS.y - 75 }} />
      <AbsoluteFill style={{ background: C.cream, opacity: band, top: FOCUS.y + 55 }} />
      <div style={{ position: "absolute", left: 0, top: FOCUS.y - 75, width: 320, height: 130, opacity: band, background: `linear-gradient(90deg, ${C.cream} 40px, rgba(243,238,230,0) 320px)` }} />
      {/* red circle drawn around 1,850 mg */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ellipse
          cx={FOCUS.x}
          cy={FOCUS.y}
          rx={250}
          ry={92}
          fill="none"
          stroke={C.brightRed}
          strokeWidth={11}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          transform={`rotate(-5 ${FOCUS.x} ${FOCUS.y})`}
        />
      </svg>
      <AbsoluteFill style={{ background: C.cream, opacity: scrim, top: 880 }} />
      {Questions.map((q, i) => {
        const k = prog(f, Q_AT[i], 7, E.settle);
        if (f < Q_AT[i]) return null;
        return (
          <div
            key={q}
            style={{
              position: "absolute",
              top: 950 + i * 120,
              width: "100%",
              textAlign: "center",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 72,
              color: C.ink,
              transform: `scale(${0.6 + 0.4 * k})`,
              opacity: Math.min(1, k * 2),
            }}
          >
            {q} <span style={{ color: C.brightRed }}>? mg</span>
          </div>
        );
      })}
      {/* the example tag stays readable while 1,850 mg fills the screen */}
      <Label style={{ position: "absolute", top: FOCUS.y - 135, width: "100%", textAlign: "center", opacity: prog(f, ZOOM_AT + 22, 8), fontSize: 30, color: "#555" }}>
        {EXAMPLE_BLEND.label}
      </Label>
      {/* hook is the cover; it clears out of the camera move */}
      <div style={{ opacity: 1 - prog(f, ZOOM_AT, 8) }}>
        <Caption text="your pre-workout is legally allowed to hide this" top={260} />
      </div>
    </AbsoluteFill>
  );
};

const SceneOurs: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", fontFamily: ANTON, fontSize: 150, color: C.red, lineHeight: 1 }}>
        OURS:
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 440,
          background: "#fff",
          border: `4px solid ${C.ink}`,
          padding: "22px 30px",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 24, color: "#555", display: "flex", justifyContent: "space-between" }}>
          <span>Sí Quema · Supplement Facts</span>
          <span>{SERVINGS}</span>
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 24, marginTop: 6 }}>{SERVING}</div>
        <div style={{ height: 10, background: C.ink, margin: "12px 0 8px" }} />
        {INGREDIENTS.map((ing, i) => {
          const t0 = TYPE_AT + i * TYPE_STEP;
          const k = interpolate(f, [t0, t0 + TYPE_STEP], [0, 1], clamp);
          const shown = ing.name.slice(0, Math.ceil(k * ing.name.length));
          return (
            <DoseRow
              key={ing.name}
              name={shown || " "}
              dose={k >= 1 ? ing.dose : ""}
              size={34}
              style={{ height: 62, opacity: f >= t0 ? 1 : 0 }}
            />
          );
        })}
      </div>
      <PopCaption text="every dose. on the label." top={1190} at={CAPTION_AT} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const f = useCurrentFrame();
  const w = prog(f, WHIP_AT, 10, E.inOut);
  const blur = Math.sin(w * Math.PI) * 18;
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {w < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${-1080 * w}px)`, filter: `blur(${blur}px)` }}>
          <SceneBlend />
        </AbsoluteFill>
      ) : null}
      {w > 0 ? (
        <AbsoluteFill style={{ transform: `translateX(${1080 * (1 - w)}px)`, filter: `blur(${blur}px)` }}>
          <SceneOurs />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const LegallyHidden: React.FC = () => {
  return (
    <Reel
      dur={LEGALLY_HIDDEN_DUR}
      hits={[CIRCLE_AT + 20, ...Q_AT, WHIP_AT + 10, CAPTION_AT]}
      sfx={[
        { at: ZOOM_AT, s: "whoosh", v: 0.35 }, // gate: allow stock-sfx, synthesized, requested in the brief
        { at: CIRCLE_AT + 20, s: "impact" },
        ...Q_AT.map((at) => ({ at, s: "pop" as const })),
        { at: WHIP_AT - 3, s: "whoosh" }, // gate: allow stock-sfx, synthesized, requested in the brief
        ...INGREDIENTS.map((_, i) => ({ at: Math.round(TYPE_AT + (i + 1) * TYPE_STEP), s: "tick" as const })),
        { at: CAPTION_AT, s: "pop" },
      ]}
    >
      <Body />
    </Reel>
  );
};
