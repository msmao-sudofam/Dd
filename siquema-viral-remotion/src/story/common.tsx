import React from "react";
import { useCurrentFrame } from "remotion";
import { Caption, PopCaption, type Sfx } from "../lib/fx";
import { B, END_LINE, HOOK } from "./rig";

/** Hook on the cover, then the one label line at the end. Same in every style. */
export const StoryCaptions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {f < B.endLine ? <Caption text={HOOK} top={260} /> : null}
      <PopCaption text={END_LINE} top={260} at={B.endLine} />
    </>
  );
};

/** Sound cues on the story beats (synthesized SFX). */
export const STORY_SFX: Sfx[] = [
  { at: B.clap + 6, s: "pop", v: 0.3 },
  { at: B.grab, s: "tick", v: 0.4 },
  { at: B.rack, s: "tick", v: 0.4 },
  { at: B.lock, s: "impact", v: 0.7 },
  { at: B.cheer + 6, s: "pop", v: 0.45 },
  { at: B.endLine, s: "pop", v: 0.35 },
];
