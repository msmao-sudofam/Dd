# THE THRESHOLD — A14B vs H3 motion proof

Date: 2026-11-01. Question: can either installed model produce the two hardest
motions — the glass-reflection truck (S02) and the hinged-door opening (S05) —
to the standard written in `creative/freebuff-video-execution-v3/complete-manual.md`?
Only a model that does may render the replacement film.

## Method

- **Same start frame per shot for both arms.** S02: `01_keyframes/S02_reflection_v01.png`.
  S05: `01_keyframes/S05_door_final.png` (the accepted entrance frame, unmodified).
- **Each model's own native settings**, as the manual requires. No prompt enhancer,
  no upscaling, no post-processing, no shared negative prompt (H3 exposes none).
- **Same seed (5605)** for every clip. Different model seeds are not comparable;
  the matched input image and shot intent are the controls.
- **Renderer:** WanGP in-process API (`shared.api`), the Pinokio install at
  `C:/pinokio/api/wan.git/app`. Model loaded once per arm.
- Judged against the S02 and S05 cards, plus objective checks: feature tracking
  for the near mullion, static-region phase correlation for camera lock, and
  first/middle/last frame comparison at delivery scale.

| arm | model type | native size | frames | steps | clip length |
| --- | --- | --- | --- | --- | --- |
| A14B | `i2v_2_2_gguf_q4_k_m` (Wan2.2 I2V 14B Q4_K_M) | 1280x720 | 49 @ 16 fps | 20 | 3.06 s |
| H3 | `minimax_h3_fl2va_pruned` (MiniMax H3 FL2VA Pruned 20B) | 832x480 | 124 @ 24 fps | 20 | 5.17 s |

H3 prompt uses its own three-part format (`integrated_multimodal_description`,
`overall_soundscape`, `non_diegetic_music`); audio is generated and discarded.
A14B uses the Wan positive + negative fields.

## Results

| clip | model | elapsed | motion observed | card verdict |
| --- | --- | --- | --- | --- |
| `S02_v01.mp4` | A14B | (production run) | view scales outward from centre; reflected tree and planter grow; mullion drifts left | **FAIL** — push/zoom, not the specified lateral truck |
| `S02_h3_r1.mp4` | H3 | 297.9 s | lateral drift, near mullion moves left, reflected tree holds its size, frame rigid | **PASS** — truck reads correctly |
| `S05_a14b_r1.mp4` | A14B | 806.7 s | right leaf rotates rigidly but **closes** | FAIL — wrong action |
| `S05_h3_r1.mp4` | H3 | 187.5 s | right leaf rotates rigidly but **closes** | FAIL — wrong action |
| `S05_a14b_r3.mp4` | A14B | 894.9 s | left leaf swings to ~85-90 deg toward camera, then returns toward closed | FAIL — over-swings, does not settle farther open |
| `S05_h3_r2.mp4` | H3 | 484.8 s (contended) | left leaf opens ~25 deg and settles; pull attached; camera locked | **PASS** — one action, modest arc, settles |

Both r1 door clips closed the leaf: given a ~70-degree-open start, both models
treated it as a state to settle. The corrected prompt opened the *closed* left
leaf instead — the card's actual action — and there the models diverged.

### Measurements

- **S02 near-mullion travel:** A14B -5.8% of width, H3 -6.5% (full native clip).
  Both move the correct way; neither reaches the card's 8-12%, which is a 2-second
  figure and softened by the card's own "plausible rather than exact pixel
  prescription" line. A 2 s excerpt is roughly 2.5-4%.
- **S02 scale change:** A14B visibly enlarges the reflected tree and planter
  (push), H3 holds their size (truck). This is the discriminator, not travel.
- **Camera lock, S05:** phase correlation on the static right region gives
  **0 px / 0 px** drift for both `S05_a14b_r3` and `S05_h3_r2`. The cameras are
  genuinely locked; the difference is the leaf, not the camera.
- **Change localisation, S05 r1:** left third 7.7% (A14B) vs 3.3% (H3) — H3 holds
  the frame steadier even before the prompt fix.

## Rubric (0/1/2 per category; accept 9/10+ with geometry and temporal at 2)

| clip | geometry | motion | continuity | temporal | edit use | total | verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A14B S02 | 2 | 0 (push, not truck) | 2 | 2 | 2 | 8 | reject |
| H3 S02 | 2 | 2 | 2 | 2 | 2 | 10 | accept |
| A14B S05 r3 | 2 | 0 (over-swing, returns) | 2 | 2 | 1 | 7 | reject |
| H3 S05 r2 | 2 | 2 | 2 | 2 | 2 | 10 | accept |

## Conclusion

**H3 is the model that produces correct motion on both shots; A14B does not.**
Only H3 may render a replacement film. It is also 3-4.7x faster per clip
(187-298 s vs 807-895 s) at its native 832x480.

## What this means for the film

- The installed film's S02 is the A14B push, not the specified truck, and its
  S05 is a held plate. Both are disqualifying under this test, so the film
  cannot be repaired piecemeal by swapping one shot: a replacement means an
  H3 pass over the shots that carry motion.
- **Resolution tradeoff, unresolved by this test:** H3's native output is
  832x480. The hero delivers 1600x900, so an H3 replacement needs a 2x upscale
  and will be softer than the current A14B master. That is a quality decision,
  not a motion decision.
- H3 generates stereo audio on every clip. It must be stripped for the silent
  web film, and no audio may be used to imply a sound design that does not exist.

## Artifacts

All clips and review frames: `cgc/_work/threshold-v3/07_abtest/`
- `review/s02-full.jpg` — A14B push vs H3 truck, start/end full frames
- `review/door-final.jpg` — door start/60%/end, A14B r3 vs H3 r2
- `review/*-sheet.jpg` — six-frame sheets per clip
- `render-log.json` — elapsed time, settings and outputs per run

Scripts: `abtest_render.py` (harness), `abtest_review.py` (sheets + metrics),
`abtest_keyframe.py` (the two failed ajar-frame edits, kept as evidence).

## Caveats recorded honestly

- The S05 card's start composition asks for a leaf already ajar 15-20 degrees.
  Two attempts to build that frame with Qwen-Image-Edit invented a horizontal
  member and duplicated pulls, so both were rejected. The test therefore starts
  from the accepted frame with the left leaf closed — a documented deviation in
  start state, not in the motion being judged.
- The first A14B r2 attempt (tag r2) was starved by two unrelated Wan renders
  running on the same GPU (`media/wan_hero.py`, `render.py keyframe --shot 02`)
  and never completed. It was stopped and rerun clean as r3; that failure is
  environmental, not a model result.
- A14B r3 is 3.06 s at 16 fps; the retained 2 s window is a normal edit decision
  and does not change the over-swing finding, which happens inside that window.
