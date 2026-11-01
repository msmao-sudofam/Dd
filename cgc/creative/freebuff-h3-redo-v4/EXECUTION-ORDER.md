# CGC — FREEBUFF H3 STRICT REDO
## 0. The previous film is rejected — execute the H3 redo

Prepared November 1, 2026. This is the owner's new instruction. It supersedes v1, v2, v3 and every earlier fallback permission, including permissions to use a held plate, a static ending or a different camera action. The owner rejected the delivered film because it did not match the script.

**Use the installed Wan2GP to test H3 and regenerate the film. Match the written shots. No zoomed stills, no held plates, no accepting a push instead of a truck, and no reversing the requested camera direction.** A beautiful shot with the wrong action fails. An honest label on a substitution does not make it acceptable.

This file directs you to execute production, review the actual outputs and install the accepted new film. It does not ask for another handoff, model recommendation or website audit. Continue through internal checkpoints without asking routine permission to proceed. Stop early only for a real blocker or a demonstrated inability to meet the required action; report that precisely instead of calling the task complete.

### Why v3 is not approved

The v3 delivery record admits S01 became a push instead of a truck; S03's downward slide was replaced with a lateral calibration clip; S05 and S08 became held images with a scale drift; some other shots had leaf drift. These do not pass the owner's script. Do not preserve their old “accepted” labels or reuse those clips to avoid rendering the corrected shots.

The files under `cgc/site/assets/film/threshold-v3/` are real video containers, but a video container can contain an animated still. File existence, 24fps, 384 frames, VMAF, successful browser playback and Lighthouse scores do not establish that the scripted scene movement was generated correctly.

### Verified machine and H3 installation

Use the Pinokio Wan2GP installation:

```text
C:/pinokio/api/wan.git/app
GPU: NVIDIA GeForce RTX 5080 / 16,303 MiB VRAM

Primary H3 preset:
defaults/minimax_h3_fl2va_pruned.json
UI name: MiniMax H3 FL2VA Pruned 20B
ckpts/MiniMax-H3-FL2VA-pruned_rank8_int8_convrot.safetensors

Reference-conditioned H3 preset, only if its actual supported input mode is needed:
defaults/minimax_h3_ref2va_pruned.json
UI name: MiniMax H3 Ref2VA Pruned 20B
ckpts/MiniMax-H3-Ref2VA-pruned_rank8_int8_convrot.safetensors
```

Both H3 transformer files were found locally, approximately 19.61 GiB each. They are larger than the GPU's VRAM; use the installed application's supported offload/memory configuration. Matching H3 heads, encoder and VAEs were also found. File presence is not proof that the full workflow runs: submit a real render and inspect the output.

The former first-choice A14B Q4_K_M preset also exists in this app, but **H3 testing is mandatory now**. Do not skip H3 and quietly repeat the same A14B failures. Do not call the older `C:/Users/Moqui/ComfyUI` 5B helper and report that as Wan2GP/H3 generation. Do not accidentally operate the separate older Wan2GP folder under `C:/Users/Moqui/talking-head/repos/`.

Inspect the installed H3 preset and export its working settings. Reuse the actual launcher/environment; `C:/pinokio/api/wan.git/start.js` is available to inspect. Use the actual supported UI or local queue/API. Do not fabricate payloads or mix Wan A14B step/CFG/LoRA settings into H3. Do not upgrade the app, download unrelated models, change global working settings, enter keys or call cloud generators as an unannounced workaround.

### First: prepare valid test images

Use the embedded reference to create clean, unnumbered keyframes. The contact sheet is a visual guide, not a start image. Prior keyframes can be reused only after checking that they actually match the shot's starting composition. A crop of a door handle is not automatically a polished glass-edge macro.

Make the S02 reflection, S03 joint and S05 hinge keyframes precise before H3 testing. Check the actual hinge attachment, handle count, mullion widths, clear opening and near/far depth cues. Repair a bad keyframe rather than asking video generation to invent missing mechanics. Use installed local image tools for keyframes; video rendering must use the H3 path through Wan2GP.

### Mandatory H3 qualification — three real clips

Render these before the full batch. Use short native-supported source durations, initially around four seconds where available. Save the actual settings, inputs, seed and output file for each.

1. **S02 reflection truck:** camera translates right beside fixed glass; the near mullion moves left more than distant features; the pane and reflections remain coherent. A zoom, pan or static reflection sweep fails.
2. **S03 downward slide:** camera moves down the vertical member; the horizontal seam visibly rises on screen. The joint and gasket remain rigid. The opposite direction, a lateral move or a stationary plate fails.
3. **S05 hinged door:** camera is locked. One real rigid leaf opens a little farther around its existing fixed hinge. Handle stays attached; the opposite leaf, frame and camera remain still. An already-open doorway with only camera movement does not satisfy this test.

Use the main motion prompt first. If needed, use the short prompt as a replacement, not as an appended paragraph. Adapt to the installed H3 prompt conventions. The local FL2VA preset uses `integrated_multimodal_description`, `overall_soundscape` and `non_diegetic_music`; a per-shot H3 prompt is included in the shot cards. Do not put unrelated default-template people, dialogue, weather or music into this film. Strip audio for web delivery.

First-frame conditioning is the starting point. If the installed mode supports a last frame, use a geometrically consistent endpoint describing only the required small move. An ending image with different columns or handles encourages a morph and must be rejected. Use reference/depth/camera controls only when the actual installed workflow exposes and supports them. Do not claim such a control was used if it was only written in prose.

Watch each test and scrub the full clip. Save first, quarter, middle, three-quarter and last-frame review images, plus a note on the actual motion. A keyframe contact sheet alone cannot prove that the door moved correctly.

Do not run the eight-shot batch until these three tests pass. If a test fails, make up to two focused revisions to the prompt or conditioning and one repaired-keyframe attempt where justified. Keep a brief change log. If the essential action still fails, report the exact failed test, settings and output evidence. Do not declare H3 incapable without trying it; do not declare success after lowering the requirement.

### Then: regenerate all eight shots

The required actions are non-negotiable:

| Shot | Required action | A failure that must not be accepted |
| --- | --- | --- |
| S01 | True rightward truck along the polished glass edge; visible near/far parallax | A forward push, digital zoom, handle close-up in place of the edge, or glowing line graphic |
| S02 | Rightward truck beside the pane; near mullion drifts left | Pan, zoom, independent sliding reflection or liquid glass |
| S03 | Downward slide; horizontal seam rises on screen | Seam drifting down, lateral calibration clip or still image |
| S04 | Short floor-level forward push toward the fixed threshold | Moving sunlight, stretching floor, zoomed plate or camera through the sill |
| S05 | Locked camera; one hinged door leaf opens through a small rigid arc | Camera-only shot, already-open static doorway, flapping/bending leaves or floating handle |
| S06 | Short level forward dolly through the existing clear opening | Movement through intact glass, room morph, moving leaves or a zoom |
| S07 | Restrained rightward interior truck with column parallax, then natural settling | Static plate, second forward corridor push or breathing columns |
| S08 | Genuine restrained exterior pullback, already at blue hour | Held ending, image-scale drift, daylight mislabeled blue hour, moving doors or exposure pulse |

“Exact” means the specified action, direction, subject, start composition, continuity and constraints must all be honored. The percentage movements in the detailed cards are visual blocking targets, not a claim of pixel-perfect text control. Do not turn a rough percentage tolerance into permission to change the type or direction of movement.

Render every shot afresh with the selected qualifying H3 workflow. Prior v3 acceptance is revoked. The three qualification renders can serve as production sources only if they match the full corresponding shot card, provide the required usable duration and pass the same final inspection. A calibration render with a different action cannot be substituted.

For each candidate:

- Verify it exists and plays, then actually watch it at normal speed.
- Inspect the full retained segment frame by frame. Check geometry, handles, glazing, floor joints, reflections and lighting.
- Compare its actual action against the required-action table and its detailed shot card.
- Reject any wrong action/direction or obvious structural/temporal defect. No “mostly matches,” “close enough” or score averaging.
- Revise the keyframe, concise prompt, supported control or valid endpoint while preserving the required action. Save each attempt and why it failed.
- Do not replace a failed action with a single image, Ken Burns transform, affine pan/zoom, reverse playback, freeze frame or unrelated clip.

A brief natural settle at the end of a genuinely generated camera move is allowed. It is not permission to make a two-second shot from one still. Do not use reverse playback to turn an incorrect move into the requested one unless the user separately approves that edit.

### Visual acceptance is a hard gate

Every shot must pass ALL of these: correct scripted action and direction; rigid believable geometry; consistent building; stable exposure/reflections; genuine scene motion; useful two-second edit segment. If one fails, that shot is not accepted. A technical score or appealing still cannot waive a failed gate.

For true translation, look for coherent depth-dependent parallax and changes in perspective/occlusion. A whole frame scaling uniformly is not enough. If visible movement is only the edit software applying scale or position to one keyframe, it is prohibited.

Keep native render files and the edit/source manifest so the final edit can be traced to actual generated clips. Make a per-shot comparison contact sheet labeled “required / observed / pass or fail,” but also watch the motion; the labels do not certify themselves.

### Assemble and install only after all eight pass

Use the accepted clips to make eight two-second shots, 16 seconds at 24fps. Conform source cadence deliberately; do not change playback speed accidentally. Do not use interpolation, optical flow, blur or compression to conceal wrong movement or warping. Make a separately considered phone composition; reject crops that remove the hinge, glass edge or clear opening needed to understand the shot.

Watch both edits from start to finish, including every transition. Verify the blue-hour ending, door action and each camera direction again in the final crop. Correct captions to describe actual compliant footage. Do not change captions to excuse footage that fails the script.

Keep v3 untouched for rollback, but label it as rejected in the new delivery note. Save new files under:

```text
cgc/site/assets/film/threshold-v4/desktop.mp4
cgc/site/assets/film/threshold-v4/mobile.mp4
cgc/site/assets/film/threshold-v4/desktop-poster.webp
cgc/site/assets/film/threshold-v4/mobile-poster.webp
cgc/site/assets/film/threshold-v4/captions.vtt
cgc/site/assets/film/threshold-v4/edit.json
```

WebM alternatives are useful if practical. Do not let a codec study replace generation. Keep source renders, exact H3 settings, seed/prompt records, review images and the rejected attempts in the work folder.

Only install after all eight shots pass. Update the actual source generator inputs `cgc/_work/architectural-hero.html` and `cgc/_work/architectural.js`, rebuild with `python cgc/_work/architectural.py`, and verify the page requests and visibly plays `threshold-v4` assets. Match the eight chapters, two-second timing, captions, posters and concept disclosure. Preserve the rest of the CGC site and pending edits.

Do a targeted playback smoke check on desktop and phone: actual new URL, successful media response, advancing video, correct visible shot, crop, pause/play, CC, off-screen/hidden-tab pause and runtime-emulated reduced-motion poster without film loading. Do not call a code review of reduced motion a runtime test.

### No detours and no false completion

No Lighthouse, website-wide audit, poster-format A/B test, unrelated SEO/CRM/form/layout refactor or analytics-404 repair before the compliant film is generated, installed and shown working. Do not recompress v3 or copy its two holds into v4. Do not write another production handoff as a substitute for running H3.

The owner has authorized production and integration. Continue through internal review steps without routine “shall I continue?” stops. Do not push, deploy/promote production, change DNS or Deployment Protection, create credentials or publish elsewhere.

If H3 cannot meet a required shot after the bounded attempts, report the precise failure and preserve the outputs; state that the replacement is incomplete. Do not install a knowingly noncompliant substitute or claim the whole task is done. “No acceptable H3 hinged-door output after these actual attempts” is an honest limitation; “used a still, all checks pass” is not.

Your final delivery must list the H3 variant actually used, real render and asset paths, every shot's required/observed motion, review evidence and the installed hero URL/screenshots. It must explicitly confirm that there are **zero held plates, zero zoomed stills and zero accepted wrong-action shots**. If that statement is not true, the film is not complete.

## Production detail follows — strict v4 rules apply throughout

The shot descriptions below remain the script. All earlier fallback permissions have been removed. Recovery means re-rendering the SAME required action, or reporting an unmet requirement; it never means substituting a different shot.
