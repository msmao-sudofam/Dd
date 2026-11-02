# THE THRESHOLD v4 — delivery (2026-11-02)

Generated concept film, not a CGC project. Silent, 16 s, 8 x 2 s, 24 fps. Installed in the hero, local only:
nothing pushed, deployed or promoted.

## Model and pipeline

- Video: **MiniMax H3 FL2VA Pruned 20B** (`minimax_h3_fl2va_pruned`) through Pinokio WanGP's in-process API
  (`C:/pinokio/api/wan.git/app`), first-frame conditioning only, native **832x480, 124 frames, 24 fps, 20 steps**, preset
  defaults. Script `_work/threshold-v4/render_h3.py`; every render, seed, prompt and setting is in
  `_work/threshold-v4/render-log.json`.
- Prompts: the v4 shot-card H3 prompts verbatim, except S05 (`prompt_S05_closed.txt`, closed start) and S08
  (`prompt_S08_r2.txt`, continuous pullback, constant light).
- Keyframes: Qwen-Image-Edit-2511 (ComfyUI) from the entrance reference. New for v4: S01, S03 (crop), S05 (closed);
  v3 keyframes reused for S02, S04, S06, S07, S08 after checking them against their cards. See `REVIEW-LOG.md`.
- Edit (`_work/threshold-v4/assemble.py`): 48 consecutive native frames per shot, no speed change, interpolation,
  freeze, reverse or animated zoom. Desktop: 832x468 crop, Lanczos to 1600x900. Phone: one fixed 270x480 window per
  shot, Lanczos to 720x1280.

## Shots

| Shot | Required | Observed | Source | Verdict |
| --- | --- | --- | --- | --- |
| S01 | True rightward truck along the polished glass edge | Rightward truck along the glass edge: edge drifts left (~4% over 5 s), blurred background shifts less, no zoom | `_work/threshold-v4/renders/S01_S01_v4_s9102_s7101.mp4` f20-67 | Pass |
| S02 | Rightward truck beside the pane; near mullion drifts left | Rightward truck beside the pane: near mullion moves left, reflected tree holds its size, glass rigid | `_work/threshold-v4/renders/S02_S02_reflection_v01_s7201.mp4` f60-107 | Pass |
| S03 | Downward slide; horizontal seam rises on screen | Camera slides down the mullion; transom rises on screen; mullion width constant; far lobby nearly still | `_work/threshold-v4/renders/S03_S03_v4_joint_crop_s7302.mp4` f20-67 | Pass |
| S04 | Short floor-level push toward the fixed threshold | Low forward push toward the threshold (~6% growth over 5 s) with near terrazzo moving faster; sill and light band steady | `_work/threshold-v4/renders/S04_S04_threshold_v01_s7401.mp4` f40-87 | Pass |
| S05 | Locked camera; one hinged leaf opens through a small rigid arc (owner-approved closed start) | Locked camera (0 px). Closed right leaf begins to open on its right-jamb hinges; free edge with pull comes toward camera; pull attached, left leaf still. Owner-approved closed start | `_work/threshold-v4/renders/S05_S05CLOSED_v4_s9222_s7512.mp4` f36-83 | Pass |
| S06 | Short level push through the existing clear opening | Short level push into the open doorway: near jambs and leaves expand outward with depth, lobby stays put; leaves move only with the camera | `_work/threshold-v4/renders/S06_S06_passage_v01_s7601.mp4` f76-123 | Pass |
| S07 | Restrained rightward interior truck, then settle | Restrained rightward interior truck: foreground door frame moves left faster than the column and lobby, then eases | `_work/threshold-v4/renders/S07_S07_interior_v01_s7701.mp4` f76-123 | Pass |
| S08 | Genuine restrained exterior pullback at blue hour | Continuous blue-hour pullback (~2% per 2 s) with parallax; doors still; lobby brightness drifts down ~4% gradually, no pulse. Revised prompt prompt_S08_r2.txt; seeds 7801 (held after 1%) and 7802 (back-and-forth) rejected | `_work/threshold-v4/renders/S08_S08_exterior_v01_s7803.mp4` f40-87 | Pass |

**Zero held plates, zero zoomed stills, zero accepted wrong-action shots.**

## Deviations and limits (honest list)

- **S05 starts closed**, not 15-20° ajar as the card says. In four H3 renders from an ajar start (two keyframes, two
  prompt wordings) the leaf always swung shut. The owner approved a closed start on 2026-11-02; the action (one
  leaf opening on fixed hinges, camera locked) is unchanged.
- **Resolution**: H3's native output is 832x480; the delivered 1600x900 and 720x1280 are Lanczos upscales and look
  soft at full screen (fine texture like terrazzo is visibly smooth). No AI upscaler was used.
- **Travel is gentle** on S01 (~1.7% of frame width per 2 s) and S06 (modest push), below the cards' numeric blocking
  targets, which the cards call plausible rather than exact. Direction and type of move are correct.
- **S08** lobby brightness drifts down ~4% over its 2 s (gradual, no pulse).
- Freebuff's qualification clips (`threshold-v3/07_abtest`) were not used as production sources.

## Files

- Installed: `site/assets/film/threshold-v4/` (desktop/mobile MP4 + WebM, AVIF/WebP posters, `captions.vtt`, `edit.json`).
- v3 (`site/assets/film/threshold-v3/`) is **rejected** (S01 push instead of truck, S03 substitute action, S05/S08 held
  plates) and kept only for rollback.
- Hero sources updated: `_work/architectural-hero.html`, `_work/architectural.js` (via `_work/threshold-v4/wire_hero.py`),
  rebuilt with `python cgc/_work/architectural.py`. S05 chapter renamed "A door opens".

## Verification (local, 2026-11-02)

`site/_test/film-v4.mjs` against the dev server, Chrome headless:
- Desktop 1440x900 and phone 390x844: page requests `threshold-v4/desktop.mp4` / `mobile.mp4` (200), video plays and
  advances 3.0 s in 3 s, chapter label follows, pause/play works, CC track showing, pauses when the tab is hidden and
  when scrolled off-screen, 0 console errors. Screenshots `site/_test/results/film-v4-desktop.png`, `film-v4-phone.png`.
- Reduced motion (runtime emulation): no film request, poster only, video never loads.
- API suite: 31/31 passed.
