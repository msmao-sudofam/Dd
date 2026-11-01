# The Reflection Run — generated concept film

**Status: completed generated concept film, ready for website review.**
It is an illustrative visualization, **not a completed CGC project** and not evidence that CGC installed the building shown.

The site hero now autoplays this film muted on load. The delivered files are compressed for web delivery and the video paints the same poster as the hero picture before its first frame, so the poster remains the LCP candidate. The real CGC photographs and field clips remain in the separate Work gallery.

## What was delivered

| Deliverable | Path | Spec |
| --- | --- | --- |
| Desktop film | `../../site/assets/film/wide.mp4` | 1600×900, 24 fps, 16.04 s, silent, H.264 High, CRF 28, 3.02 MB |
| Phone film | `../../site/assets/film/portrait.mp4` | 720×1100, 24 fps, 16.04 s, silent, H.264 High, CRF 28, 1.47 MB |
| Posters | `../../site/assets/film/wide-poster.webp`, `portrait-poster.webp` | first-shot stills |
| Captions | `../../site/assets/film/captions.vtt` | five cues incl. generated-concept disclosure |
| Edit record | `../../site/assets/film/edit.json` and `film.json` | timings, keyframes, seeds, prompts |

Five shots, 3.2 seconds each:

| Shot | Time | Source keyframe | Action |
| --- | --- | --- | --- |
| B01 A world in the edge | 00:00.0–00:03.2 | entrance-light crop | sunlight and reflections at the glass entrance |
| B02 The moving mirror | 00:03.2–00:06.4 | curtain-wall-after crop | lateral glide along the reflective facade |
| B03 Reflection becomes a place | 00:06.4–00:09.6 | entrance-light crop | open glass entrance and sunlit lobby |
| B05 The invisible corner | 00:09.6–00:12.8 | office-after crop | reflections resolve into a glass conference room |
| B06 Reveal the building | 00:12.8–00:16.0 | curtain-wall-after crop | pullback to the complete facade |

The edit follows **Film B / The Reflection Run** in `../video-concepts-2026-10-31/VIDEO-STORYBOARDS.md`. It uses five of the six boards; the optional macro B01 was replaced by a close entrance crop because no clean full-resolution macro keyframe existed. The generated clips did not produce a true blue-hour B06; the caption and edit record say afternoon light rather than claiming blue hour.

## Web delivery encode

The delivered MP4s are a web re-encode of the CRF 24 edit masters: x264 `-preset slower -crf 28`, H.264 High, `yuv420p`, `+faststart`, no audio. Dimensions, 24 fps timing, the five cuts and the captions are unchanged. The desktop file fell from 5.38 MB to 3.02 MB (43.9% smaller); the phone file fell from 2.56 MB to 1.47 MB (42.7% smaller). VMAF against the previous masters scored 91.8 desktop / 92.3 phone; SSIM was 0.982 / 0.983. Key frames were inspected at 1:1. The video poster mirrors the hero picture so the poster remains the LCP image while the first frame decodes; JavaScript-off and reduced motion keep the picture fallback.

## How it was generated

- Local ComfyUI (no account, key or cloud video service), native Wan nodes.
- **Wan 2.2 TI2V 5B fp16**, `umt5-xxl-encoder-fp8-e4m3fn-scaled` text encoder, `wan2.2_vae`.
- 1280×704 native, 121 frames per shot at 24 fps, 20 steps, CFG 5, `uni_pc` / `simple`, shift 8.
- Seeds: B02 `1109661`; B01, B03, B05, B06 `4409661`.
- Each shot was generated from a clean 16:9 crop of an existing generated concept still, not from a storyboard sheet. Crop rectangles are recorded in `film.json`.
- Source generations are silent 5.04 s clips. The edit keeps 77 frames per shot starting at frame 12, then grades, crops to portrait, and concatenates.
- No generated logos, text, client names or invented project details appear in the film.

The render/assembly helper is `../../_work/render_film.py`; the ComfyUI API helper is `../../_work/wan_film.py`. Both are local build tooling and are not required to serve the site. Raw generations and keyframe crops are under `../../_work/film-raw/` and `../../_work/film-src/` and are not part of the deploy.

## Disclosure and playback

- The hero overlay reads **Concept film / generated visualization**.
- A visible line beneath the player reads: “Generated concept film. Illustrative visualization, not a completed CGC project. See actual CGC work.”
- The first caption cue repeats the disclosure; the video `aria-label` also states it.
- The film **autoplays muted** on load; the poster remains until playback is ready and as the fallback. Play/pause, CC, progress and chapters remain available. Out-of-view and hidden-tab playback pause. Reduced-motion and JavaScript-off keep the poster and never load the film source.
- The real project gallery and field clips are separate and unchanged.

## Verification

- Compressed-film browser QA: **360 / 390 / 430 / 1440** autoplay with the responsive `portrait.mp4` / `wide.mp4`, 0 px overflow, 0 console errors, 0 automated WCAG A/AA violations, pause/play, CC and keyboard tabs passed. Reduced motion kept the poster without loading the film; JavaScript-off at 390px kept the poster visible with video opacity 0 and no film source.
- Lighthouse 13.6.0 mobile, three runs: **88–90 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 1.35 s, LCP 3.68–3.83 s, TBT 0 ms, CLS 0. A click-to-play baseline under the same current environment also measured 88–90 with LCP 3.83–3.90 s, so the earlier 90-vs-88 gap was environment variance. Page transfer fell from 3,258 KiB for the uncompressed autoplay build to 2,190 KiB; the film remains 1.47 MB on phone and 3.02 MB on desktop.
- `npm test`: **31/31 API tests passed** (no cloud credentials used).
- `_test/functional.mjs`: **10/10 scenarios passed**, including bid POST, mailto fallback, calculator, slider keys, lightbox, legal pages and CRM sample edits.
- `_test/qa.mjs`: 360 / 390 / 430 / 1440 — **0 px overflow, 0 console errors, 0 automated WCAG A/AA violations, 0 measured controls under 44 px, 0 inputs under 16 px**. Reduced-motion test: poster visible, film source not loaded.
- Film-specific check: compressed desktop source 1600×900, portrait 720×1100, 16.04 s, muted and looping; chapter `05 / Reveal the building` reached on seek; fifth caption cue present; concept label and disclosure present.

These are local lab tests plus a protected Vercel preview deployment; no production promotion was performed. The film has not been reviewed by the owner.

## Limitations

- Native model output is 1280×704; the 1600×900 master is an upscale, not a 4K or newly filmed commercial.
- Motion is intentionally restrained; the model cannot guarantee real construction sequencing. The film is a concept, not a record of installation.
- The portrait version is a centre crop of the 16:9 shots, reframed per shot, not a separately generated 9:16 production.
- No sound design was mixed. The website loop is silent; a social version would need original or licensed audio.
- The separate **The Threshold** eight-shot handoff in `../the-threshold/` remains an alternative direction and is not this film.
