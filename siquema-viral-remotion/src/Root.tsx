import { Composition, Folder } from "remotion";
import { ChalkboardAd, CHALK_AD_DUR } from "./styles/ChalkboardAd";
import { ComicArtAd, COMIC_AD_DUR } from "./styles/ComicArtAd";
import { DanKoeAd, DANKOE_AD_DUR } from "./styles/DanKoeAd";
import { FlatVectorAd, FLAT_AD_DUR } from "./styles/FlatVectorAd";
import { PixelArtAd, PIXEL_AD_DUR } from "./styles/PixelArtAd";
import { ZackDAd, ZACKD_AD_DUR } from "./styles/ZackDAd";
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
      {/* One example ad per Animation Studio style that SÍ QUEMA allows (see siquema-motion/animation-studio.md) */}
      <Folder name="StyleExamples">
        <Composition id="StyleChalkboard" component={ChalkboardAd} durationInFrames={CHALK_AD_DUR} {...v} />
        <Composition id="StyleFlatVector" component={FlatVectorAd} durationInFrames={FLAT_AD_DUR} {...v} />
        <Composition id="StyleDanKoe" component={DanKoeAd} durationInFrames={DANKOE_AD_DUR} {...v} />
        <Composition id="StyleComicArt" component={ComicArtAd} durationInFrames={COMIC_AD_DUR} {...v} />
        <Composition id="StylePixelArt" component={PixelArtAd} durationInFrames={PIXEL_AD_DUR} {...v} />
        <Composition id="StyleZackD" component={ZackDAd} durationInFrames={ZACKD_AD_DUR} {...v} />
      </Folder>
      <Composition id="ContactSheet" component={ContactSheet} durationInFrames={SHEET_DUR} fps={FPS} width={SHEET_W} height={SHEET_H} />
    </>
  );
};
