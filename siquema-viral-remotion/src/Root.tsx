import { Composition } from "remotion";
import { ContactSheet, SHEET_DUR, SHEET_H, SHEET_W } from "./ContactSheet";
import { FPS, H, W } from "./lib/theme";
import { CommentReply, COMMENT_DUR, commentSchema } from "./reels/CommentReply";
import { CountTheNumbers, COUNT_DUR } from "./reels/CountTheNumbers";
import { FinePrint, FINE_PRINT_DUR } from "./reels/FinePrint";
import { GuessTheCaffeine, GUESS_DUR, guessSchema } from "./reels/GuessTheCaffeine";
import { HardToSay, HARD_DUR } from "./reels/HardToSay";
import { LegallyHidden, LEGALLY_HIDDEN_DUR } from "./reels/LegallyHidden";
import { NoMystery, NO_MYSTERY_DUR } from "./reels/NoMystery";
import { TastesLikeChalk, CHALK_DUR } from "./reels/TastesLikeChalk";

const v = { fps: FPS, width: W, height: H };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LegallyHidden" component={LegallyHidden} durationInFrames={LEGALLY_HIDDEN_DUR} {...v} />
      <Composition
        id="GuessTheCaffeine"
        component={GuessTheCaffeine}
        durationInFrames={GUESS_DUR}
        schema={guessSchema}
        defaultProps={{ scoopSrc: null }}
        {...v}
      />
      <Composition id="CountTheNumbers" component={CountTheNumbers} durationInFrames={COUNT_DUR} {...v} />
      <Composition id="TastesLikeChalk" component={TastesLikeChalk} durationInFrames={CHALK_DUR} {...v} />
      <Composition id="HardToSay" component={HardToSay} durationInFrames={HARD_DUR} {...v} />
      <Composition id="NoMystery" component={NoMystery} durationInFrames={NO_MYSTERY_DUR} {...v} />
      <Composition id="FinePrint" component={FinePrint} durationInFrames={FINE_PRINT_DUR} {...v} />
      <Composition
        id="CommentReply"
        component={CommentReply}
        durationInFrames={COMMENT_DUR}
        schema={commentSchema}
        defaultProps={{ username: "@username", comment: "your question here" }}
        {...v}
      />
      <Composition id="ContactSheet" component={ContactSheet} durationInFrames={SHEET_DUR} fps={FPS} width={SHEET_W} height={SHEET_H} />
    </>
  );
};
