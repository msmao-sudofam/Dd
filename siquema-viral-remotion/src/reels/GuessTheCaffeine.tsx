import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Caption, E, PopCaption, Reel, clamp, hash, prog } from "../lib/fx";
import { ANTON, C, INTER, sec } from "../lib/theme";

export const GUESS_DUR = sec(8.5);

export const guessSchema = z.object({
  /** File in public/ (e.g. "scoop.mp4"). null = built-in background until the clip is added. */
  scoopSrc: z.string().nullable(),
});

const COUNT_AT = 45; // 3-2-1, 30 frames each
const REVEAL_AT = 135;
const ANSWER_AT = 165;
const COMMENT_AT = 205;
const CHIPS = [
  { k: "A)", v: "100 mg" },
  { k: "B)", v: "200 mg" },
  { k: "C)", v: "350 mg" },
];
const CORRECT = 1;

/** Stand-in background: dark, warm, drifting powder. Replaced by scoop.mp4 when present. */
const PowderBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(900px 1100px at 540px 1190px, #5a0d14, ${C.dark} 770px)` }}>
      {Array.from({ length: 90 }, (_, i) => {
        const x = hash(i) * 1080;
        const y0 = hash(i + 100) * 1920;
        const y = (y0 - f * (0.6 + hash(i + 200) * 1.6) + 1920 * 4) % 1920;
        const r = 2 + hash(i + 300) * 7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((f + i * 13) / 30) * 12,
              top: y,
              width: r,
              height: r,
              borderRadius: 999,
              background: C.cream,
              opacity: 0.08 + hash(i + 400) * 0.25,
              filter: `blur(${hash(i + 500) * 2}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Body: React.FC<z.infer<typeof guessSchema>> = ({ scoopSrc }) => {
  const f = useCurrentFrame();
  const revealed = f >= REVEAL_AT;
  const rk = prog(f, REVEAL_AT, 8, E.settle);
  const n = Math.floor((f - COUNT_AT) / 30); // 0,1,2 -> "3","2","1"
  const inCount = f >= COUNT_AT && f < REVEAL_AT;
  const ck = inCount ? (f - COUNT_AT - n * 30) / 30 : 0;
  const drift = interpolate(f, [0, GUESS_DUR], [1, 1.06], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        {scoopSrc ? (
          <OffthreadVideo src={staticFile(scoopSrc)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <PowderBg />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,8,9,.72) 0px, rgba(11,8,9,.25) 576px, rgba(11,8,9,.35) 1056px, rgba(11,8,9,.85) 1920px)",
        }}
      />

      {/* 3-2-1 */}
      {inCount ? (
        <div
          style={{
            position: "absolute",
            top: 470,
            width: "100%",
            textAlign: "center",
            fontFamily: ANTON,
            fontSize: 380,
            lineHeight: 1,
            color: C.cream,
            transform: `scale(${1.35 - 0.35 * E.out(Math.min(1, ck * 3))})`,
            opacity: 1 - Math.max(0, (ck - 0.75) * 4),
            textShadow: "0 12px 50px rgba(0,0,0,.5)",
          }}
        >
          {3 - n}
        </div>
      ) : null}

      {/* answer chips */}
      <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {CHIPS.map((c, i) => {
          const isRight = i === CORRECT;
          const on = revealed && isRight;
          const dim = revealed && !isRight;
          return (
            <div
              key={c.k}
              style={{
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 60,
                padding: "16px 48px",
                borderRadius: 999,
                minWidth: 480,
                textAlign: "center",
                background: on ? C.brightRed : "#fff",
                color: on ? "#fff" : C.ink,
                opacity: dim ? 1 - 0.65 * rk : 1,
                transform: `scale(${on ? 1 + 0.1 * rk : 1})`,
                boxShadow: "0 8px 30px rgba(0,0,0,.3)",
              }}
            >
              {c.k} {c.v}
            </div>
          );
        })}
      </div>

      {f < ANSWER_AT ? <Caption text="guess how much caffeine is in this scoop" top={260} /> : null}
      <PopCaption text="it's on the label. every dose is." top={260} at={ANSWER_AT} until={COMMENT_AT} />
      <PopCaption text="comment what you guessed" top={260} at={COMMENT_AT} />
    </AbsoluteFill>
  );
};

export const GuessTheCaffeine: React.FC<z.infer<typeof guessSchema>> = (props) => (
  <Reel
      dur={GUESS_DUR}
      hits={[COUNT_AT, COUNT_AT + 30, COUNT_AT + 60, REVEAL_AT, ANSWER_AT, COMMENT_AT]}
      printColor={C.cream}
      sfx={[
        { at: COUNT_AT, s: "tick", v: 0.6 },
        { at: COUNT_AT + 30, s: "tick", v: 0.6 },
        { at: COUNT_AT + 60, s: "tick", v: 0.6 },
        { at: REVEAL_AT, s: "pop" },
        { at: REVEAL_AT, s: "impact", v: 0.5 },
        { at: ANSWER_AT, s: "pop" },
        { at: COMMENT_AT, s: "pop" },
      ]}
  >
    <Body {...props} />
  </Reel>
);
