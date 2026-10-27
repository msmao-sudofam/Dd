# Sí Quema — viral cut reels (Remotion)

8 vertical loop reels, 1080×1920 @ 30 fps, H.264 CRF 18.

| # | Composition | Length | Footage |
|---|---|---|---|
| 1 | `LegallyHidden` | 9 s | none |
| 2 | `GuessTheCaffeine` | 8.5 s | `public/scoop.mp4` (built-in background until it's added) |
| 3 | `CountTheNumbers` | 8 s | none |
| 4 | `TastesLikeChalk` | 8 s | none |
| 5 | `HardToSay` | 8.5 s | none |
| 6 | `NoMystery` | 9.5 s | none |
| 7 | `FinePrint` | 9 s | none |
| 8 | `CommentReply` | 10 s | none (props: `username`, `comment`) |

## Setup (Windows)

```powershell
cd C:\Users\Moqui\Projects\siquema-viral-remotion
npm install
copy C:\Users\Moqui\Downloads\scoop.mp4 public\scoop.mp4   # reel 2
npm run dev        # Remotion Studio preview
```

## Render

```powershell
npm run render                                   # all 8 -> out\<Id>.mp4
npm run render -- NoMystery FinePrint            # only these
npm run render -- CommentReply --username=@maria --comment="is it ok with coffee?"
npm run sheet                                    # out\contact-sheet.jpg (frame 0 + middle of each)
npm run sfx                                      # regenerate the synthesized SFX
```

`CommentReply` with a username is written to `out\CommentReply-<username>.mp4`, so each reply keeps its own file.
`username` and `comment` can also be edited live in Studio's props panel.

Fonts come from `@remotion/google-fonts` (Anton, Inter 500/800, Space Mono).
On a machine that can't reach Google Fonts, set `REMOTION_LOCAL_FONTS=1` to load the same font files from `public/fonts`.

## Rules baked in

- All label numbers live in `src/lib/theme.ts` (`INGREDIENTS`, `WARNINGS`, …), copied verbatim from the label brief. Change them only there, and only from the physical label.
- Every reel shows `200 mg caffeine per serving · 18+`. Reels that show a line ending in `*` (4, 5, 8) also show the FDA disclaimer.
- Text stays between y=220 and y=1500. The fine print sits at the bottom of that zone, so the TikTok caption UI doesn't cover it.
- Frame 0 is the cover: the hook is fully on screen with no fade.
- Loop: in the last 0.5 s, frame 0 slides back in and lands 3 frames before the end.
- Audio is synthesized SFX only (`scripts/make-sfx.mjs`). Add the trending sound in TikTok.
- Claim language: no "fat burner / burn fat / lose weight / clean / all natural / detox / clinically proven", and no before/after.

## Layout

```
src/lib/theme.ts     fonts, colors, verbatim label data
src/lib/fx.tsx       Reel shell (punch zoom, grain, loop-back, fine print, SFX), TikTok captions
src/lib/labels.tsx   generic blend card, dose rows
src/reels/*.tsx      one file per reel
src/ContactSheet.tsx contact sheet composition
scripts/render.mjs   batch render (H.264, CRF 18)
```
