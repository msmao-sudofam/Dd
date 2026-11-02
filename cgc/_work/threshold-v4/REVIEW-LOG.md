# Threshold v4 — H3 render review log

Model: MiniMax H3 FL2VA Pruned 20B (`minimax_h3_fl2va_pruned`) via Pinokio WanGP in-process API.
Native 832x480, 124 frames @ 24 fps, 20 steps, preset defaults. Prompts verbatim from the v4 shot cards.
Script: `render_h3.py`. Metrics: `review.py` (strips + tracked motion in `review/`). Every verdict below
also comes from looking at the frames, not only the numbers.

## Qualification

| Test | Clip | Observed | Verdict |
| --- | --- | --- | --- |
| S02 truck (Freebuff, 2026-11-01) | `../threshold-v3/07_abtest/S02_h3_r1.mp4` | Lateral move, near mullion moves left, reflected tree keeps its size; travel smaller than the card target; small jump in the last frames | Pass (use frames before ~f110) |
| S05 hinge (Freebuff r2) | `../threshold-v3/07_abtest/S05_h3_r2.mp4` | Locked camera (0 px drift); left leaf opens ~25° and settles. Starts closed, not ajar; pull sits on the hinge side; interior behind the leaf shifts | Not accepted for production; re-test from an ajar start |
| S05 hinge, attempt 1 (v4) | `renders/S05_S05b_door_ajar_v01_s7501.mp4` | Camera locked (0 px). The ajar leaf narrows on screen but its hinge line shifts ~50 px and the pull slides from the hinge side to the free edge: not a rigid rotation. Keyframe already had the pull beside the hinge | **Fail**. New keyframe with hinge on the right jamb, pull at the free edge |
| S03 slide, attempt 1 | `renders/S03_S03_joint_final_s7301.mp4` | Static until ~f60, then ~2% upward drift with the door's bottom rail reshaping. Keyframe is a door bottom corner at the floor, not the card's mid-height mullion/transom joint | **Fail**. Rebuild the keyframe as a real joint, re-render |
| S03 slide, attempt 2 | `renders/S03_S03_v4_joint_crop_s7302.mp4` (new joint keyframe) | Camera descends along the mullion; the transom rises steadily across the frame while the far lobby barely moves (real near/far parallax). Mullion width constant (50 px), joint rigid. Slight 1-2% scale creep over the full 5 s | **Pass** (subject to full-speed watch). Production source: use a 48-frame window from the early part |
| S05 hinge, attempt 2 (v4) | `renders/S05_S05_v4_s9102_s7502.mp4` (new keyframe) | Camera locked. Leaf starts ~20° ajar, then swings **closed** to flush with the frame | **Fail**: wrong direction. End frames S05END s9211/s9212 tried as last-frame anchors: Qwen did not open the leaf wider (one added a floating handle), not used |
| S05 hinge, attempt 3 (v4, revised prompt "keeps swinging OPEN... never closes", seeds 7503/7504) | `renders/S05_S05_v4_s9102_s7503.mp4`, `..._s7504.mp4` | Camera locked in both. In both seeds the ajar leaf swings shut to flush with the frame by the last frame | **Fail**: wrong direction. Bounded attempts for the ajar start are used up |

## Keyframes (v4)

Generated with Qwen-Image-Edit-2511 from the entrance reference (`keyframes_v4.py`). Concept stills, not CGC photos.

| Shot | Chosen start | Why | Rejected |
| --- | --- | --- | --- |
| S01 | `keyframes/S01_v4_s9102.png` | Real polished glass edge with green edge tint near centre, dark mullion, no hardware | v3 `S01_edge_v01` (a pull-handle close-up, which the card forbids); s9101 (edge at 67%) |
| S03 | `keyframes/S03_v4_joint_crop.png` | 768x432 crop of s9102 (Lanczos 2x) putting the mullion/transom crossing at 55% / 60%, glass in all four quadrants | v3 joint (door bottom corner at the floor); s9101 (whole door frame, no close joint) |
| S05 | `keyframes/S05_v4_s9102.png` | Right leaf ~20° ajar, hinged on its right jamb, pull near the free edge | s9101 (ambiguous hinge side). End frames S05END s9201 (reframed camera, would cause a morph) and s9202 (leaf barely moved, edge smear) not used |
| S08 | v3 `S08_exterior_v01.png` | Already a genuine blue-hour still of the same entrance; v3's failure was the held plate, not this image | v4 S08 s9101/9102/9301/9302: Qwen kept daylight and sun on the columns |
| S02, S04, S06, S07 | v3 keyframes | Match their cards | — |

## S05 status

With the card's ajar start, H3 closes the leaf in all four v4 renders (two keyframes, two prompt wordings). The only
H3 clip that shows a correct rigid opening is Freebuff's `S05_h3_r2`, which starts with the leaf closed. Not
substituted; waiting for the owner's decision on the start position.

**Owner decision (2026-11-02):** S05 may start with the leaf closed; the action stays "one hinged leaf opens through a
small rigid arc, camera locked". New start `keyframes/S05CLOSED_v4_s9222.png` (both leaves closed, right leaf hinged at
the right jamb, pull at its free edge), prompt `prompt_S05_closed.txt`. Production batch 1 queued with it:
S05 x2 seeds, S01, S02, S04, S06, S07, S08 (card prompts verbatim, log `batch1.log`).
