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
| S03 slide, attempt 1 | `renders/S03_S03_joint_final_s7301.mp4` | Static until ~f60, then ~2% upward drift with the door's bottom rail reshaping. Keyframe is a door bottom corner at the floor, not the card's mid-height mullion/transom joint | **Fail**. Rebuild the keyframe as a real joint, re-render |
