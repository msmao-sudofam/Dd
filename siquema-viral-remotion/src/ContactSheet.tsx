import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { INTER, MONO } from "./lib/theme";
import { CommentReply, COMMENT_DUR } from "./reels/CommentReply";
import { CountTheNumbers, COUNT_DUR } from "./reels/CountTheNumbers";
import { FinePrint, FINE_PRINT_DUR } from "./reels/FinePrint";
import { GuessTheCaffeine, GUESS_DUR } from "./reels/GuessTheCaffeine";
import { HardToSay, HARD_DUR } from "./reels/HardToSay";
import { LegallyHidden, LEGALLY_HIDDEN_DUR } from "./reels/LegallyHidden";
import { NoMystery, NO_MYSTERY_DUR } from "./reels/NoMystery";
import { TastesLikeChalk, CHALK_DUR } from "./reels/TastesLikeChalk";

const REELS: { id: string; dur: number; el: React.ReactNode }[] = [
  { id: "1 LegallyHidden", dur: LEGALLY_HIDDEN_DUR, el: <LegallyHidden /> },
  { id: "2 GuessTheCaffeine", dur: GUESS_DUR, el: <GuessTheCaffeine scoopSrc={null} /> },
  { id: "3 CountTheNumbers", dur: COUNT_DUR, el: <CountTheNumbers /> },
  { id: "4 TastesLikeChalk", dur: CHALK_DUR, el: <TastesLikeChalk /> },
  { id: "5 HardToSay", dur: HARD_DUR, el: <HardToSay /> },
  { id: "6 NoMystery", dur: NO_MYSTERY_DUR, el: <NoMystery /> },
  { id: "7 FinePrint", dur: FINE_PRINT_DUR, el: <FinePrint /> },
  { id: "8 CommentReply", dur: COMMENT_DUR, el: <CommentReply username="@username" comment="your question here" /> },
];

const S = 0.25;
const TW = 1080 * S;
const TH = 1920 * S;
const GAP = 16;
const LABEL = 56;
export const SHEET_W = 4 * TW + 5 * GAP;
export const SHEET_H = 4 * (TH + LABEL) + 5 * GAP;

const Tile: React.FC<{ title: string; sub: string; frame: number; children: React.ReactNode }> = ({ title, sub, frame, children }) => (
  <div style={{ width: TW }}>
    <div style={{ height: LABEL, color: "#eee", fontFamily: INTER, fontWeight: 800, fontSize: 18, lineHeight: 1.2, paddingTop: 6 }}>
      {title}
      <div style={{ fontFamily: MONO, fontWeight: 400, fontSize: 14, color: "#999" }}>{sub}</div>
    </div>
    <div style={{ width: TW, height: TH, overflow: "hidden", position: "relative" }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${S})`, transformOrigin: "0 0", position: "absolute" }}>
        <Freeze frame={frame}>{children}</Freeze>
      </div>
    </div>
  </div>
);

/** Frame 0 + middle frame of every reel. Render frame 0 of it: npm run sheet */
export const SHEET_DUR = 600; // long enough that <Freeze> can reach every middle frame
export const ContactSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1a1a", padding: GAP, display: "flex", flexDirection: "row", flexWrap: "wrap", gap: GAP, alignContent: "flex-start" }}>
    {REELS.flatMap((r) => [
      <Tile key={r.id + "0"} title={r.id} sub="frame 0" frame={0}>
        {r.el}
      </Tile>,
      <Tile key={r.id + "m"} title={r.id} sub={`frame ${Math.floor(r.dur / 2)} (middle)`} frame={Math.floor(r.dur / 2)}>
        {r.el}
      </Tile>,
    ])}
  </AbsoluteFill>
);
