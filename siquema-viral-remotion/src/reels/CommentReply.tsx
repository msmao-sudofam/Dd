import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { E, PopCaption, Reel, prog } from "../lib/fx";
import { C, INGREDIENTS, INTER, MONO, NET, OTHER_INGREDIENTS, SERVING, SERVINGS, sec } from "../lib/theme";

export const COMMENT_DUR = sec(10);

export const commentSchema = z.object({
  username: z.string(),
  comment: z.string(),
});

const READ_AT = 36;
const READ_STEP = 14;
const readFrame = (i: number) => READ_AT + i * READ_STEP;
const OTHER_AT = readFrame(INGREDIENTS.length) + 4;
const CAPTION_AT = 200;

const LABEL_TOP = 560;
const ROW_H = 52;

const Sticker: React.FC<z.infer<typeof commentSchema>> = ({ username, comment }) => (
  <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div
      style={{
        maxWidth: 900,
        background: "#fff",
        borderRadius: 24,
        padding: "20px 30px 24px 22px",
        display: "flex",
        gap: 18,
        alignItems: "flex-start",
        boxShadow: "0 12px 40px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          width: 78,
          height: 78,
          flex: "0 0 78px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#d9d9d9,#a9a9a9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 30,
          color: "#fff",
        }}
      >
        {(username.replace(/^@/, "")[0] ?? "?").toUpperCase()}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 30, color: "#777" }}>Reply to {username}&apos;s comment</div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 48,
            lineHeight: 1.2,
            color: C.ink,
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {comment}
        </div>
      </div>
    </div>
  </div>
);

const Body: React.FC<z.infer<typeof commentSchema>> = (props) => {
  const f = useCurrentFrame();
  const cur = f >= READ_AT ? Math.min(INGREDIENTS.length - 1, Math.floor((f - READ_AT) / READ_STEP)) : -1;
  const reading = f >= READ_AT && f < OTHER_AT;
  const otherOn = f >= OTHER_AT && f < CAPTION_AT;
  const barK = reading ? prog(f, readFrame(cur), 5, E.out) : 0;

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Sticker {...props} />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: LABEL_TOP,
          background: "#fff",
          border: `4px solid ${C.ink}`,
          padding: "18px 26px 16px",
          fontFamily: INTER,
          color: C.ink,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 800, fontSize: 48, letterSpacing: "-0.02em" }}>Supplement Facts</span>
          <span style={{ fontFamily: MONO, fontSize: 20, color: "#666" }}>Sí Quema</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 21, marginTop: 4 }}>
          {SERVING} · {SERVINGS} · {NET}
        </div>
        <div style={{ height: 10, background: C.ink, margin: "10px 0 4px" }} />
        <div style={{ position: "relative" }}>
          {reading ? (
            <div
              style={{
                position: "absolute",
                left: -12,
                right: -12,
                top: cur * ROW_H + 4,
                height: ROW_H - 8,
                background: "rgba(229,32,47,.12)",
                borderLeft: `6px solid ${C.brightRed}`,
                transform: `scaleX(${0.6 + 0.4 * barK})`,
                transformOrigin: "left center",
              }}
            />
          ) : null}
          {INGREDIENTS.map((ing, i) => {
            const on = reading && i === cur;
            const done = f >= readFrame(i);
            const pop = on ? 1 + 0.2 * (1 - prog(f, readFrame(i), 6)) : 1;
            return (
              <div key={ing.name} style={{ position: "relative", height: ROW_H, display: "flex", alignItems: "center", borderBottom: "1px solid #ddd" }}>
                <span style={{ fontWeight: 500, fontSize: 25, whiteSpace: "nowrap" }}>{ing.name}</span>
                <span style={{ fontWeight: 500, fontSize: 19, color: "#777", marginLeft: 10, whiteSpace: "nowrap", flex: 1, overflow: "hidden" }}>({ing.note})</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 27,
                    color: done ? C.red : C.ink,
                    display: "inline-block",
                    transform: `scale(${pop})`,
                    transformOrigin: "right center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ing.dose}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontWeight: 500,
            fontSize: 18,
            lineHeight: 1.35,
            marginTop: 10,
            padding: "4px 6px",
            background: otherOn ? "rgba(229,32,47,.12)" : "transparent",
          }}
        >
          <b>Other ingredients:</b> {OTHER_INGREDIENTS}
        </div>
      </div>
      <PopCaption text="every dose is on the label." top={1238} at={CAPTION_AT} />
    </AbsoluteFill>
  );
};

export const CommentReply: React.FC<z.infer<typeof commentSchema>> = (props) => (
  <Reel
    dur={COMMENT_DUR}
    fda
    hits={[CAPTION_AT]}
    sfx={[
      { at: 6, s: "pop", v: 0.3 },
      ...INGREDIENTS.map((_, i) => ({ at: readFrame(i), s: "tick" as const })),
      { at: OTHER_AT, s: "tick" },
      { at: CAPTION_AT, s: "pop" },
      { at: CAPTION_AT, s: "impact", v: 0.4 },
    ]}
  >
    <Body {...props} />
  </Reel>
);
