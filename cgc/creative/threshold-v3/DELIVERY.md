# THE THRESHOLD — v3 delivery note

Generated concept film, installed in the CGC hero and verified locally. Not deployed, not pushed, not promoted. Illustrative visualization, not a completed CGC project.

## What rendered it

- Renderer: **WanGP** (Pinokio install, `C:/pinokio/api/wan.git/app`), preset **Wan2.2 Image2video 14B GGUF Q4_K_M** (`i2v_2_2_gguf_q4_k_m`), both high/low noise phases, 20 steps, uniPC, guidance 3.5/3.5, flow shift 5, 16 fps native, **1280×720**, 49 frames per shot.
- GPU: RTX 5080, 16,303 MiB. Peak use during 720p renders ≈ 15.1 GB.
- Start frames: **Qwen-Image-Edit-2511** (ComfyUI, `qwen_image_edit_2511_fp8mixed`, 28 steps, cfg 4.0) conditioned on crops of the supplied entrance reference, so every shot keeps the same building. S08 was graded deterministically for blue hour (`grade_dusk.py`), since the edit model would not change time of day.
- The previous five-shot Reflection Run film used ComfyUI + Wan 2.2 TI2V 5B; this film does not.

## Files

Accepted shots: `cgc/_work/threshold-v3/04_accepted/` (S01–S08).
Candidates and revisions: `cgc/_work/threshold-v3/03_candidates/`, review sheets in `03_candidates/review/`.
Calibration: `cgc/_work/threshold-v3/02_calibration/` (A static, B truck, C push, all 720p).
Keyframes: `cgc/_work/threshold-v3/01_keyframes/`.
Master and web encode: `cgc/_work/threshold-v3/05_edit/`, `06_web/`.
Installed assets: `cgc/site/assets/film/threshold-v3/` (desktop/mobile MP4 + WebM, AVIF/WebP posters, captions, edit.json). The old `assets/film/wide.mp4` and `portrait.mp4` remain for rollback.

## What was accepted, and what fell back

| Shot | Result |
| --- | --- |
| S01 | Accepted. Slow push on the frame/pull macro rather than the card's pure truck; rigid, stable reflections. |
| S02 | Accepted. Near mullion drifts left with real parallax; reflected tree stays coherent. |
| S03 | **Fallback.** The card's downward slide moved the horizontal seam *down* twice (v01 and the short-alternate v02), which the card explicitly rejects. Used its documented alternate: the stable rightward truck from calibration B on the same joint keyframe. |
| S04 | Accepted. Rigid threshold rail, stable aggregate, constant sun stripe. |
| S05 | **Held plate.** The door beat failed twice: v01 (camera-only fallback) and v02 (wider reference framing) both swung and bent the leaves. Used a 2 s plate from the accepted open-door keyframe with a 3% scale drift. No door animation is claimed. |
| S06 | Accepted. Push through the clear opening with real near/far parallax; slight leaf drift only. |
| S07 | Accepted. Restrained rightward drift, column parallax, stable light. |
| S08 | **Held plate.** The pullback (v01) and the locked-off variant (v02) both kept moving the leaves and drifting exposure. Used the blue-hour graded still as the documented fixed-ending fallback, with a 3% scale drift. |

Calibration gates: static A was rigid but drifted slightly (noted); truck B and push C passed. Both door shots that needed the model to hold or move a leaf failed, which is the main limitation of this render.

## Assembly

`05_edit/threshold-v3-master.mp4`: 1600×900, 24 fps, 384 frames, 16.000 s, silent, 8 × 2 s hard cuts.
Delivery: `desktop.mp4` 1600×900 (2.9 MB, CRF 25), `desktop.webm` (2.3 MB), `mobile.mp4` 720×1280 centre crop (1.5 MB), `mobile.webm` (0.9 MB), posters, `captions.vtt`, `edit.json`.
Source cadence is 16 fps; the edit conforms to 24 fps by frame duplication. No interpolation was used.

## Integration

Changed through the generator, then rebuilt with `python cgc/_work/architectural.py`:
- `cgc/_work/architectural-hero.html` — versioned poster sources, captions track, updated video description.
- `cgc/_work/architectural.js` — new 8-chapter list, 2 s chapter divisor, versioned desktop/mobile sources.

## Verification (local, Chromium)

`http://127.0.0.1:4180/` via a range-capable static server (`_work/threshold-v3/serve_range.py`); Python's plain `http.server` cannot seek MP4s.

- Desktop 1440×900: `currentSrc` = `assets/film/threshold-v3/desktop.mp4`, 1600×900, duration 16 s, playback advances, AVIF poster (1600×900) is the only poster fetched, no horizontal overflow.
- Phone 390×844: `currentSrc` = `assets/film/threshold-v3/mobile.mp4`, 720×1280, small AVIF poster (768×432), no overflow.
- Chapters: 1 s → 01, 9.4 s → 05 "The doors stand open", 15.2 s → 08. Progress and time read 00:09 / 00:16.
- Pause/resume works; CC toggles the caption track to `showing`; disclosure and concept label remain.
- Console: only the pre-existing local `/_vercel/insights/script.js` 404; no errors from the film.

Screenshots: `hero-desktop-1440.png`, `hero-desktop-stage.png`, `hero-phone-390.png`.

Reduced motion is enforced in code (autoplay returns early and the video never receives a src, leaving the AVIF poster); it was not emulated at runtime in this pass.

## Not done

No Lighthouse, no deployment, no DNS, no production promotion, no commit. S05 and S08 are holds, not generated camera moves. The phone film is a centre crop of the 16:9 edit, not a separately composed portrait render.
