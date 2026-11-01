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


# CGC — THE THRESHOLD
## Detailed local-video production handoff / version 4

Prepared November 1, 2026. Audience: Freebuff, executing the authorized generation and hero-installation task through the installed Wan2GP application.

This replaces the earlier short production brief. The owner rejected the v3 film. Its delivery note records wrong camera actions and two held plates. Inspect those real outputs and the delivery record; section 0 revokes their acceptance and requires an H3 redo.

## 1. Read this before generating anything

Make a deliberate architectural film, not a slideshow with random motion. The glass and metal are the subject. The camera discovers an entrance through increasingly wider views. The building remains rigid. The impact comes from framing, controlled parallax, scale changes between shots and a strong edit.

The deliverable is eight separately generated shots assembled into a 16-second website hero. Each edited shot is two seconds. Final timeline: 24fps, 384 frames, frames 0–383 inclusive. Generate at the selected model's supported native settings first. Final edit rate is not an instruction to force an unsuitable model-generation rate.

Do not paste this manual into the model's prompt box. For image-to-video, paste only the selected shot's MOTION PROMPT. The motion prompt assumes an accepted, clean start image already establishes the architecture. For text-to-image, use that shot's CLEAN KEYFRAME PROMPT plus the common visual reference. All the other detail is direction for the operator and acceptance criteria for the result.

Run the three mandatory H3 qualification clips in section 0 before the eight-shot production batch. A perfect-looking still with warped motion is a failed shot. A stable clip with almost invisible camera motion also fails the intended shot. The target is visible but controlled movement.

Do not generate one 16-second request containing eight scenes. Do not feed the numbered storyboard sheet to image-to-video. Do not use a different building for each shot. Do not generate the logo or headlines into the footage. Do not hide failed shots under dissolves, blur, interpolation or music.

## 2. What is known and what you must inspect

The verified application paths, GPU and downloaded model inventory are in section 0. Inspect the active build, selected checkpoint, native frame rate/resolution, active LoRAs and conditioning controls in that installation. File presence alone does not prove a successful render. Wan2GP is the application, so record the actual model selected within it.

Before touching a model setting, record the active model and export its working settings. Use the locally installed version's supported controls. Do not upgrade the application, download checkpoints, add motion LoRAs or change the user's working environment merely because this manual names a possible capability.

Record this run sheet; leave genuinely unknown values as unknown until checked:

```text
Application/version or commit:
Model display name:
Model/checkpoint identifier or filename:
Model family and size:
Mode: image-to-video / text-to-video / control-video
GPU and usable VRAM:
Start-image support:
End-image support:
Reference-image support:
Camera/depth/control support actually exposed:
Native output width × height:
Native FPS:
Valid source frame count and resulting duration:
Sampler / solver / scheduler:
Steps and guidance values exported from this model:
High/low noise stages, if applicable:
Active LoRAs and weights:
Caching / quantization / acceleration options:
Prompt enhancer and prompt-splitting behavior:
Fixed test seed:
Exported settings filename:
Output directory:
```

Before regenerating, inspect up to three of the existing poor results. Save their first/middle/last frames, actual prompt, start image and settings if available. Name the specific defect and the first time it becomes visible. Compare with the original start image. If the start image is already structurally wrong, repair that before changing the video prompt. If the start image is sound but a feature changes during motion, treat that as a temporal/conditioning problem to test. Do not assume every poor result has the same cause.

Wan2GP implementation notes, checked against its current upstream documentation; your installed version may differ:

- Keep a shot's text together. Multiline processing can produce separate queue jobs or windows. Confirm the one-prompt behavior in the installed UI.
- Disable automatic prompt enhancement for the calibration comparison, or save the expanded prompt too. Record any later change.
- Use an exported settings file as the model-specific template. Negative prompts, end images and control inputs are conditional capabilities, not universal controls.
- Inspect native rate, legal frame counts and actual output shape. Do not assume every model accepts the same resolution, frames or FPS.
- If local CLI support matches the documented version, validate an exported queue with `python wgp.py --process saved_queue.zip --dry-run`. Create the queue through the actual app first. This is a conditional command, not a fabricated ready-to-run queue.

Sources: https://github.com/deepbeepmeep/WanGP/blob/main/docs/PROMPTS.md ; https://github.com/deepbeepmeep/WanGP/blob/main/docs/SETTINGS.md ; https://github.com/deepbeepmeep/WanGP/blob/main/docs/CLI.md

Everything below is the original CGC art direction and operator plan. Numeric movement ranges are visual targets for blocking and review, not promises that a text model exposes exact camera coordinates.

## 3. The creative idea

THE THRESHOLD starts with a sliver of reflected light. We discover that the line belongs to the edge of a pane. The view moves across glass, then down a precise framing joint to the threshold. A door opens in a separate, simple shot. We cross the clear opening, see the interior glass and end outside at blue hour with warm light behind the finished entrance.

The eight-shot rhythm is: EDGE → REFLECTION → JOINT → THRESHOLD → DOOR → PASSAGE → SPACE → EXTERIOR.

The first four shots feel close and tactile. The last four open out into space. Shots should have a clear beginning, one readable movement and an ending that gives the editor something solid to cut on. Calm does not mean motionless. Dramatic does not mean an uncontrolled fly-through.

Use restrained real-world optics. No drone dive, impossible orbit through a mullion, glass exploding into place, giant lens flare, holographic blueprint or magical building assembly. Those effects are outside this film's concept.

## 4. Architecture and image lock

Use the embedded entrance reference as the anchor. It is an illustrative generated scene, not a real CGC project. The storyboard provides mood and shot order; it does not override the anchor's actual door geometry.

Keep these features consistent:

- White square columns and white precast facade; no new arches, curved walls or wood cladding.
- Slim graphite aluminum framing. Straight members with consistent width; believable joints and black gaskets.
- Clear glass with steel-blue sky reflections. Reflection and transmitted interior can coexist without the whole pane turning opaque or liquid.
- Stainless vertical pull handles. Same count, shape, height and attachment points in matching entrance views.
- Pale terrazzo floor. Stable aggregate, joints, threshold position and horizon.
- Warm linear interior lighting. No animated light strips or pulsating exposure.
- California trees and sparse planting outside. No added traffic, signs, people, logos or text.

Daylight shots 01–07 share one sun direction: from outside camera-left, crossing the threshold diagonally. Reflections follow camera angle and existing scene geometry. Do not command a separate reflection animation and a separate lighting animation on top of the camera move.

Shot 08 is an intentional blue-hour cut. Prepare its lighting in the clean start image. Do not ask the model to turn afternoon into night while changing camera angle in the same shot.

For each clean keyframe, note the visible column, mullion and handle counts. Between related entrance shots, compare those counts and the hinge side. Macro shots can hide the wider building, but their material and gasket details must still look like the same system.

## 5. Camera language and movement budget

Coordinates used in this document refer to the viewed image: x=0 is left, x=100 is right, y=0 is top, y=100 is bottom. A subject location such as x=40% is a compositional target. It is not a Wan2GP parameter.

For a rightward camera truck across fixed architecture, nearby objects should generally drift left on screen faster than distant objects. A pan turns the camera from a fixed position; a truck translates it. A push moves the camera forward through space; a zoom changes the lens. Do not replace a requested truck with a digital zoom and call it complete.

Default camera behavior:

- One main camera movement per shot. No simultaneous orbit, push, tilt and focus rack.
- No roll. Keep columns vertical and the horizon level. Intentional perspective comes from viewpoint, not bent architecture.
- No handheld shake. This is a controlled slider/dolly language.
- Fixed focus for calibration. Add a focus rack only after the motion is stable, and only where the shot calls for it.
- Moderate parallax. Use roughly 5–12% frame-width displacement of a clear near feature in a retained two-second section for lateral shots. Far features should move less. Treat the range as a review guide, not exact tracking data.
- For forward shots, look for a modest scale change and visible floor parallax. Avoid a whole-room expansion that resembles a rubber tunnel.
- If a change in perspective requires inventing large unseen geometry, shorten the travel or build a new accepted keyframe instead of demanding more from the same view.

The model-facing prompt will describe the movement plainly. The operator uses the detailed blocking to decide whether the result actually did it.

## 6. H3 qualification gate — actual scripted actions

Use the installed H3 FL2VA workflow and the three mandatory tests in section 0: S02 rightward reflection truck, S03 downward slide with seam rising, and S05 real hinge opening with locked camera. Export the actual native settings and render playable clips. Do not substitute the old A14B calibration results or run a model-ranking study instead.

Inspect every test at normal speed and frame by frame. All three must meet their scripted motion and rigid-geometry requirements before production. Make the bounded repairs in section 0, then report any genuinely unmet action. Do not accept a different action or a still to make the gate appear passed.

## 7. Clean-keyframe preparation

The storyboard sheet contains numbers, gutters and small panels. It must never be passed directly as the video start image. Do not enlarge a tiny panel and treat it as a final high-quality frame. Generate an unnumbered, full-frame keyframe for each shot using the entrance reference and the shot's keyframe prompt.

Prepare one accepted 16:9 image for each shot at a size the selected image/video workflow can use without a destructive crop. Do not stretch a 3:2 image into 16:9. Inspect at the intended delivery crop before generating video.

Reject a keyframe if the door appears attached to glass with no plausible hinge, a pull handle floats, a mullion changes width halfway up, the floor has impossible joins, or the requested camera has no clear doorway to pass through. Video generation rarely repairs structural defects already in the starting image.

For matching entrance views, make edits or reference-conditioned variants from the accepted architecture rather than eight independent text-only buildings. A common seed is a reproducibility aid, not an identity lock.

Do not force a distant final wide image into a macro shot as an end frame. End-frame conditioning, if supported, should describe a small achievable movement with unchanged topology. If start/end constraints cause melting, remove the end frame and shorten the move.

## 8. How to use each strict shot card

The main prompt states the required action. The H3 prompt wraps that action in the installed FL2VA template's structure; paste it as one complete prompt. The short alternate is a simpler wording for the SAME action, not a different shot. Optional timeline wording is only for a tested compatible workflow.

Each card defines the start, fixed objects, allowed movement, temporal beats and finish. Its recovery paragraph requires re-rendering the same action. No recovery paragraph authorizes a held image, wrong camera vector, different physical action or synthetic image transformation.

Source timing describes an approximately four-second native-supported generation; adapt the frame count to the installed model and select a genuinely moving two-second range. Do not create the range from one still. Ordinary clean cuts and cadence conversion are allowed; wrong-action reversal or interpolation to conceal failure is not.

## 9. Shot-by-shot production cards

### S01 — The line becomes glass

Final edit: 00:00–00:02 / frames 0–47

#### Editorial purpose

Hook the viewer with a real material detail. It should take a moment to recognize the object, then become unmistakably a glass edge. Do not begin with a generic empty black screen.

#### Accepted start composition

Extreme macro. One polished glass edge sits near x=58%, almost vertical, running from y=15% to y=88%. A graphite mullion or dark background fills the rest. A narrow cool-white highlight is visible on the actual edge. Retain enough texture to establish glass; do not make a free-floating neon line.

#### What stays fixed

The pane, edge thickness and its relationship to the frame. The edge stays straight and stationary in the world. Light source and exposure remain fixed. No new panes, particles, dust animation, hand, text or logo.

#### Exactly what moves

One small rightward camera truck with fixed orientation. Target roughly 6–8% frame-width leftward drift of the edge during the retained two seconds. The background moves less. Let the highlight vary naturally with viewpoint; do not separately animate it upward.

#### Source timing / normalize to native duration

- 0–15%: establish the existing illuminated edge; no fade from a different scene.

- 15–80%: continue one smooth lateral travel. The glass edge remains resolved and rigid; focus does not hunt.

- 80–100%: a slightly broader steel-blue reflection appears beside the edge because of the new view. End still looking at glass, not at an unrelated building.

#### Intended finish

Edge near x=50%; the pale-blue reflected area occupies more of the right half. Preserve the same edge thickness. The end should offer a light/dark boundary suitable for the next cut.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic extreme macro along the polished edge of a stationary clear architectural glass pane beside a graphite aluminum frame. The edge is a straight near-vertical line at about three-fifths of the image width, visible from near top to near bottom. Narrow real white reflection on the edge, dark graphite background, restrained steel-blue reflected sky. Material texture and a believable thin edge, fixed focus, clean 16:9 composition. No text, numbering, border, people, floating neon or lens-flare streak. Match the glass and graphite metal of the supplied entrance reference.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera trucks slowly to the right along the fixed polished glass edge. The nearby edge drifts slightly left in the image while the dark background shifts less. A narrow natural reflection changes with the viewing angle. The pane stays rigid and straight. One continuous level move with steady light and fixed focus. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
The camera trucks slowly to the right along the fixed polished glass edge. The nearby edge drifts slightly left in the image while the dark background shifts less. A narrow natural reflection changes with the viewing angle. The pane stays rigid and straight. One continuous level move with steady light and fixed focus.
```

#### SHORTER WORDING — same action, do not append

```text
Slow rightward camera truck along the stationary glass edge. Gentle parallax, rigid glass, fixed focus and steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: the existing polished glass edge is already visible) (middle: one slow rightward camera truck creates gentle parallax) (end: the edge remains straight beside a slightly wider pale-blue reflection)
```

#### Reject the result if

A glowing line detached from glass; a bending edge; the pane rotating or sliding by itself; a laser sweep; pulsing exposure; no visible parallax. A digital zoom alone does not meet this shot. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Repair or generate a true polished glass-edge keyframe with near/far depth cues. Re-render a rightward truck using the concise prompt or a supported lateral camera guide. A push, handle-only macro, static bevel or 2D zoom is not an acceptable replacement. If the rightward truck still fails, mark S01 unmet.

#### Editorial cut

Hard-cut on the pale-blue reflection into shot 02. Align a similar vertical boundary; do not morph the macro edge into a facade.

#### Portrait composition

Keep the illuminated edge around the center of a separately composed portrait image. Do not crop the edge off-screen simply to preserve the wide composition.

### S02 — Follow the reflection

Final edit: 00:02–00:04 / frames 48–95

#### Editorial purpose

Increase the spatial clues. The viewer now sees the exterior world in glass and begins to understand the entrance system.

#### Accepted start composition

Close oblique view of one stationary glass pane. A graphite mullion stands near x=72%. Steel-blue sky occupies the upper reflected area, one tree is recognizable toward x=40%. A glimpse of the transmitted interior may remain visible; it is not a mirrored metal sheet.

#### What stays fixed

Glass plane, frame dimensions, tree position in the world and light source. No wind animation for this first pass. No new reflections of people, cars or buildings. The reflected tree may shift optically with camera angle; it must not liquefy or slide as an independent texture.

#### Exactly what moves

Continue rightward camera translation parallel to the facade. Maintain the same oblique viewing direction; do not add an orbit. Near mullion drifts left roughly 8–12% of the image width in the usable section. Distant reflected detail changes more subtly. Reflection behavior should remain physically plausible rather than satisfy an exact pixel prescription.

#### Source timing / normalize to native duration

- 0–15%: recognize the pane, sky and tree without a large focus change.

- 15–85%: steady rightward truck; the solid mullion provides the motion reference.

- 85–100%: the dark mullion approaches the center-right cut position. No sudden acceleration or end-frame snap.

#### Intended finish

The same mullion reaches about x=60–64%; the reflected sky/tree still belong to the same environment. The image remains a close surface study, not a pullback to a whole building.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic close oblique view of the supplied entrance glazing: clear fixed pane, slim graphite vertical mullion toward the right, soft steel-blue sky and one California tree reflected in the pane. Warm lobby remains subtly visible through the glass. Straight mullion, realistic gasket and physically coherent transparent/reflected layers. Neutral whites and graphite, no signs, people, text, border or new architecture. Compose a clean full 16:9 frame with usable near/far depth cues.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera trucks slowly to the right parallel to the stationary glass facade. The nearby graphite mullion moves left across the image while the reflected distant tree changes more gently with the viewing angle. The glass plane and framing remain rigid. Fixed camera orientation, steady daylight, one continuous lateral move. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
The camera trucks slowly to the right parallel to the stationary glass facade. The nearby graphite mullion moves left across the image while the reflected distant tree changes more gently with the viewing angle. The glass plane and framing remain rigid. Fixed camera orientation, steady daylight, one continuous lateral move.
```

#### SHORTER WORDING — same action, do not append

```text
Rightward camera truck beside fixed glazing. The near mullion drifts left; the distant reflection shifts less. Rigid frames, steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: oblique view of sky and a tree reflected in fixed glass) (middle: the camera trucks right and the near mullion drifts left) (end: the same mullion remains straight near center-right)
```

#### Reject the result if

Reflection swimming like water; a tree growing or multiplying; an orbit that reveals a new facade; sky changing to clouds or night; a stationary camera with only a texture sweep; glass becoming opaque without a viewpoint reason. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Simplify the reflection and strengthen the near-mullion/far-background depth cues in the keyframe. Re-render the same rightward truck. Do not replace translation with a pan, zoom or moving reflection texture. Report S02 unmet if H3 cannot maintain both motion and geometry.

#### Editorial cut

Match the dark mullion to shot 03’s vertical member. Use a direct edit, not an animated transformation from reflection into metal.

#### Portrait composition

Use a centered mullion and one readable reflected tree. A crop showing only blank blue glass loses the purpose of this shot.

### S03 — Precision at the joint

Final edit: 00:04–00:06 / frames 96–143

#### Editorial purpose

Make the trade visible through fit and material. This is also the calibration shot because its simple rigid shapes make deformation easy to detect.

#### Accepted start composition

Close view of a believable graphite vertical/horizontal framing joint. Vertical member near x=55%; horizontal member crosses near y=60%. A black gasket is visible beside the clear glass. Use consistent member width and realistic meeting geometry.

#### What stays fixed

All aluminum, joint topology, gasket, screws if already present, glass and lighting. No assembly, extending frame members, tightening screws or sealant being applied. Do not invent a connection detail not visible in the approved keyframe.

#### Exactly what moves

One short downward camera slide parallel to the fixed vertical member. Because the camera moves down, the horizontal joint should drift upward in the image, roughly y=60% toward y=48–52% in the retained section. No simultaneous focus rack in the base version. Keep the actual frame edges sharp.

#### Source timing / normalize to native duration

- 0–15%: static recognition of the joint; focus already on the intended detail.

- 15–85%: one downward slide. The horizontal feature rises on screen, with a small credible background parallax.

- 85–100%: settle on the joint/gasket relationship. No new hardware appears when the camera stops.

#### Intended finish

Same joint, slightly higher on screen; same frame thickness and gasket location. The horizontal seam is a deliberate visual handoff to the threshold in shot 04.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic macro of a real-looking vertical and horizontal graphite aluminum entrance-frame junction matching the common reference. Black gasket seated beside clear glass; subtle metal surface finish, square flush alignment. Vertical member near center-right, horizontal member across the lower middle, clean directional daylight. Sufficient depth of field to see the joint. No tools, hands, labels, logos, numbers, border or decorative hardware.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera slides slowly downward along the fixed vertical aluminum member. The horizontal framing joint rises slightly in the image as the camera descends. The frame width, gasket and glass remain unchanged and rigid. Fixed focus and constant daylight. One short, smooth vertical camera move. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
The camera slides slowly downward along the fixed vertical aluminum member. The horizontal framing joint rises slightly in the image as the camera descends. The frame width, gasket and glass remain unchanged and rigid. Fixed focus and constant daylight. One short, smooth vertical camera move.
```

#### SHORTER WORDING — same action, do not append

```text
Slow downward camera slide past the rigid framing joint. The horizontal seam moves upward on screen. Fixed focus, steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: the framing joint is sharply visible) (middle: the camera slides down, making the horizontal seam rise slightly) (end: the same joint and gasket remain sharp and unchanged)
```

#### Reject the result if

Frame widening, merging or flexing; gasket becoming a snake-like line; a digital zoom replacing the slide; joint moving downward when the specified camera move should make it rise; autofocus blur hiding instability. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Use the accepted joint keyframe with a consistent endpoint showing the horizontal seam HIGHER on screen, or a supported downward camera guide. Re-render the downward slide. Do not use calibration B, a rightward truck, reverse playback or a held frame. If the seam still moves the wrong way, S03 fails.

#### Editorial cut

Match the joint’s horizontal line to the threshold line at the start of shot 04. Keep the line on a similar vertical portion of the frame so the edit feels deliberate.

#### Portrait composition

Center the joint and keep both members visible. Do not use a portrait crop that removes the horizontal member and reduces the shot to an unexplained dark stripe.

### S04 — Light at the threshold

Final edit: 00:06–00:08 / frames 144–191

#### Editorial purpose

Move from a material detail to the point where outside meets inside. The diagonal daylight becomes the visual direction for entering the building.

#### Accepted start composition

Very low close view of the real-looking threshold and base of a fixed frame. The horizontal threshold crosses the lower-middle image. Pale terrazzo has a sharp diagonal band of sunlight coming from camera-left. The vertical jamb remains visible near one edge for depth.

#### What stays fixed

Threshold profile, gasket, floor joint lines, aggregate texture, frame base and sun direction. No wet look, liquid reflections, moving sealant, new dirt or debris. The sun does not travel through hours during this short shot.

#### Exactly what moves

One short forward push toward the threshold. Keep the lens aimed level-to-slightly-down as established in the keyframe. Target a modest 5–8% apparent increase in a nearby threshold feature, with small floor parallax. Do not lower the camera through the floor or tilt up into the lobby in the same source.

#### Source timing / normalize to native duration

- 0–15%: the threshold and diagonal light are already present.

- 15–85%: gentle forward dolly; near floor details move more than the frame farther ahead.

- 85–100%: arrive near, but do not collide with, the threshold. Hold the same light and exposure.

#### Intended finish

A closer, still coherent threshold detail. Leave the diagonal sun stripe visible as a guide into the doorway shot. The camera has not crossed into a different room yet.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic floor-height close-up at the base of the reference graphite entrance. Believable fixed threshold and black seal, clear glass above, pale terrazzo with fine aggregate and straight stable joints. One hard diagonal sunlight stripe enters from outside left. A frame jamb at the edge gives depth. Dry clean materials, restrained reflections, no hands, tools, text, signs or border. Landscape 16:9.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The low camera makes one short smooth push forward toward the fixed entrance threshold. Nearby terrazzo detail shifts slightly faster than the frame ahead. The threshold, seal and floor joints remain rigid and unchanged. The diagonal sunlight and exposure stay constant. Fixed angle and focus. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
The low camera makes one short smooth push forward toward the fixed entrance threshold. Nearby terrazzo detail shifts slightly faster than the frame ahead. The threshold, seal and floor joints remain rigid and unchanged. The diagonal sunlight and exposure stay constant. Fixed angle and focus.
```

#### SHORTER WORDING — same action, do not append

```text
Short floor-level push toward the fixed threshold. Natural near/far parallax, rigid floor joints and steady sunlight.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: low view of threshold and diagonal sunlight) (middle: a small forward dolly creates floor parallax) (end: a closer stable threshold detail, without crossing the opening)
```

#### Reject the result if

Floor swimming or stretching; seam moving independent of camera; time-lapse sunlight; camera passing through the sill; sudden tilt into a new interior; extra gasket strands appearing. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Repair the threshold image and shorten the travel while preserving a real FORWARD push and depth parallax. Keep the floor and sunlight fixed. A lateral move, zoomed image or still plate cannot replace this shot. Mark it unmet if the required push fails.

#### Editorial cut

The next doorway composition should preserve the diagonal light direction. Cut before any floor-level camera collision, not after it.

#### Portrait composition

Keep the sill, diagonal light and a piece of the jamb in view. A portrait image of only terrazzo is too abstract at this point in the sequence.

### S05 — A door opens — one action only

Final edit: 00:08–00:10 / frames 192–239

#### Editorial purpose

Deliver one unmistakable physical action. Separate door motion from the later camera push so the model does not have to solve both at once.

#### Accepted start composition

A three-quarter view of the accepted entrance. The active door leaf is already slightly ajar, approximately 15–20 degrees, with its hinge side and handle clearly readable. Pick the leaf and hinge side that actually match the reference. Record that side before generating; do not impose a contradictory new door.

#### What stays fixed

Camera position, orientation, lens and focus. Facade, opposite leaf, hinge axis, floor and interior light remain fixed. The active leaf retains its rectangular shape; its handle remains attached to the same points. No visible person or new hand.

#### Exactly what moves

Only the existing active leaf rotates outward a modest additional 10–15 degrees about the fixed hinge axis. It does not translate sideways, scale or change width. The handle traces a short arc with the leaf, not an independent straight-line path. Keep the opening small enough that the hidden side of the door is not a large new invention.

#### Source timing / normalize to native duration

- 0–15%: the slightly ajar leaf is already visible; camera is locked.

- 15–80%: one slow outward hinge rotation. No second opening, recoil or camera move.

- 80–100%: settle on the slightly wider opening. Other objects and exposure stay unchanged.

#### Intended finish

Same camera and entrance, active leaf a little farther open. Hinge axis stays in the same image location. The clear doorway is obvious and prepares the next shot, which begins with an already-open door.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic three-quarter view of the common white precast and graphite glass entrance. One existing door leaf is slightly ajar, roughly fifteen to twenty degrees, with a visible plausible hinge attachment and one long stainless pull. Match the reference door count, handle positions, frame divisions and white columns. Warm interior, diagonal daylight on terrazzo, stationary eye-level camera. No people, hands, signs, text or border. Clean 16:9 frame.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. Locked camera. The slightly ajar glass entrance door slowly opens outward a little farther on its existing fixed hinges, then settles. Only that rigid door leaf rotates; its pull handle stays attached. The surrounding frame, other door, floor, camera and lighting remain completely still. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
Locked camera. The slightly ajar glass entrance door slowly opens outward a little farther on its existing fixed hinges, then settles. Only that rigid door leaf rotates; its pull handle stays attached. The surrounding frame, other door, floor, camera and lighting remain completely still.
```

#### SHORTER WORDING — same action, do not append

```text
Static camera. One existing glass door rotates outward slightly on its fixed hinges. The leaf and attached handle stay rigid. Everything else stays still.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: static camera, existing door slightly ajar) (middle: only that leaf rotates outward through a small arc about its fixed hinge) (end: the door settles a little farther open; camera and building stay fixed)
```

#### Reject the result if

Sliding door behavior; bending glass; moving hinge axis; floating/duplicated handle; new hands; the opposite leaf moving; camera pushing in; glass changing topology. This shot has a stricter pass gate than the material inserts. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Repair the hinge topology and use a consistent start/end pair if the installed H3 mode supports it. Keep the camera locked and reduce only the opening arc, not the action itself. Re-render an actual hinged-leaf rotation. An already-open doorway, camera-only truck, static image, scale drift or moving opposite leaf fails. If the rigid opening cannot be generated, S05 remains unmet and the replacement film is incomplete.

#### Editorial cut

Cut while the doorway is clearly open. Shot 06 starts farther along the same clear route, not by flying through a closed pane. Match hinge side and handle count, rather than insisting on an exact frame-for-frame continuous move.

#### Portrait composition

Keep the active leaf, fixed hinge and central clear passage inside the crop. If both hinge and opening cannot fit, create a dedicated portrait view or use the already-open-door fallback.

### S06 — Cross the clear opening

Final edit: 00:10–00:12 / frames 240–287

#### Editorial purpose

The main spatial payoff: the viewer moves from outside into the lobby. It should feel like a short physical dolly, not a teleport or drone tunnel.

#### Accepted start composition

Camera centered on an already-open, unobstructed doorway. The active leaf is safely away from the path and does not move. A near jamb is visible along one side; a second column and glass office fronts create a deeper background. Camera height is low but not floor-scraping, roughly waist height in visual feel.

#### What stays fixed

Door leaf, hinges, facade, column spacing, ceiling lights and floor joints. No doors move during this shot. The camera path must stay inside an actual opening visible in the start image. Never pass through a clear glass pane and call it a doorway.

#### Exactly what moves

One level forward translation into the clear opening. Keep yaw, pitch, roll and focal length fixed. Near jamb expands/drifts toward the outside edge faster than the distant lobby. Use a short travel: enough for obvious near/far parallax and a slight scale increase, without revealing an entire unseen building.

#### Source timing / normalize to native duration

- 0–15%: establish the open route and near jamb.

- 15–85%: smooth forward push. A real jamb may briefly occlude one edge but not wipe the entire screen into a different layout.

- 85–100%: camera is just inside the threshold, looking into the same room. No sharp turn or acceleration.

#### Intended finish

A slightly more interior viewpoint; the same floor joints and columns still align. The doorway frame is nearer the sides of the image. The room has not expanded or changed shape.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic view from just outside the common entrance, looking through an existing already-open doorway into the lobby. White square columns and graphite interior office fronts, pale terrazzo floor joints leading straight inside. The open door is fixed safely off the route; a near jamb remains visible at one side for parallax. Warm interior lights and consistent outside-left sunlight. Clean clear path, stable wide-lens perspective without fisheye. No people, text or border.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera makes one smooth short push forward through the already-open clear doorway. The nearby jamb moves outward toward the image edge faster than the distant lobby. The door stays open and motionless. Columns, floor joints and glass framing remain rigid. Level camera, fixed lens, steady light; finish just inside the same entrance. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
The camera makes one smooth short push forward through the already-open clear doorway. The nearby jamb moves outward toward the image edge faster than the distant lobby. The door stays open and motionless. Columns, floor joints and glass framing remain rigid. Level camera, fixed lens, steady light; finish just inside the same entrance.
```

#### SHORTER WORDING — same action, do not append

```text
Short level dolly forward through the already-open doorway. Stronger near-jamb parallax, gentler distant-lobby change. Fixed door and rigid building.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: open doorway with a clear path) (middle: the camera pushes straight forward, near jamb drifting toward the edge) (end: just inside the same lobby, with all architecture unchanged)
```

#### Reject the result if

Camera crossing intact glass; portal morph; growing corridor; floor sliding like a treadmill; perspective zoom without meaningful parallax; a door closing across the path; a newly invented room. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Improve the clearly visible open route, preserve the same rigid building and shorten the forward translation. Re-render an actual passage through the clear opening. Do not stop outside and replace the passage with a cut or a still. If a physically coherent passage cannot be shown, S06 fails.

#### Editorial cut

Cut from the actual generated opening in S05 to this actual generated clear passage. Match hinge side, door position and floor continuity. Do not pass through glass, teleport, or replace the passage with a cut between two still viewpoints.

#### Portrait composition

The path is centered. The viewer must see it is an opening, with a jamb and floor cue. Keep the leaf away from the cropped central route.

### S07 — The space beyond

Final edit: 00:12–00:14 / frames 288–335

#### Editorial purpose

Release the tension of the close-ups with a calm interior view. This shot must be wider and slower than shot 06, with a clear endpoint for the interior sequence.

#### Accepted start composition

A wide interior showing at least one recognizable white column, graphite glass office fronts on the right and a broad patch of sunlight on the same terrazzo. Camera is already inside and level. Do not add furniture or a different office layout just to fill the frame.

#### What stays fixed

Column count and position, office-front divisions, ceiling fixtures, floor texture, sun direction and exposure. No doors, people, furnishings or lights move. Glass reflections remain tied to the viewpoint.

#### Exactly what moves

One restrained sideways camera move to the right, smaller than the preceding forward push. A near column edge drifts left perhaps 3–5% of frame width; the distant office fronts shift less. Fixed focal length and focus. This is not a second corridor fly-through.

#### Source timing / normalize to native duration

- 0–15%: the wider room is readable immediately.

- 15–80%: a slow short lateral drift reveals a little more depth around the fixed column.

- 80–100%: the movement eases into a nearly still architectural hold. Do not freeze the texture abruptly.

#### Intended finish

A composed view of the same glass office fronts and sunlit floor. The room remains stable. There is room in the edit to feel a short visual pause before the exterior cut.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic wide interior of the same white commercial lobby. Recognizable square white columns, graphite glass office fronts to the right, pale terrazzo and warm linear ceiling lights. One defined afternoon sunlight patch from outside-left. Restrained level architectural camera and straight verticals, enough depth around a near column for small parallax. No people, new furniture, labels, logo, text or border. Landscape 16:9.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. Inside the lobby, the camera makes a very short slow truck to the right, then eases toward a calm hold. The nearby white column drifts slightly left while the distant glass office fronts shift less. The room, framing, floor joints and lighting remain unchanged. Level view and fixed lens; no forward fly-through. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
Inside the lobby, the camera makes a very short slow truck to the right, then eases toward a calm hold. The nearby white column drifts slightly left while the distant glass office fronts shift less. The room, framing, floor joints and lighting remain unchanged. Level view and fixed lens; no forward fly-through.
```

#### SHORTER WORDING — same action, do not append

```text
Very slow short rightward truck inside the fixed lobby. Gentle near-column parallax, then a calm hold. Rigid architecture and steady daylight.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: wide stable interior with glass office fronts) (middle: a small rightward camera truck reveals depth around a fixed column) (end: settle on the same sunlit room)
```

#### Reject the result if

Indistinguishable from shot 06; office fronts assembling themselves; new furniture/people; breathing columns; sliding sunlight; a zoom into a completely different office. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Strengthen the near-column/far-office-front depth cues and reduce travel while retaining a clearly visible RIGHTWARD interior truck. Re-render. A locked-off room, still plate, zoom or forward corridor push is not a fallback. Mark S07 unmet if the correct motion cannot be produced.

#### Editorial cut

Direct intentional cut to the exterior at blue hour. A time-of-day and viewpoint change is allowed here. Do not dissolve incompatible columns together.

#### Portrait composition

Prioritize a near column edge and the glass office front; preserve floor depth. If a crop hides both features, compose a new portrait keyframe.

### S08 — The entrance, resolved

Final edit: 00:14–00:16 / frames 336–383

#### Editorial purpose

A clean final architectural view with warm light behind the glazing. The door and frame are now part of a complete place. This supplies a strong poster candidate and an honest ending.

#### Accepted start composition

Wide three-quarter exterior of the SAME entrance at blue hour, prepared as its own clean still. Keep reference columns, opening proportions, mullion pattern and handle count. Interior is already warmly lit. The sky and facade are fully established at the start; no day-to-night transformation.

#### What stays fixed

Entire building, entrance leaves, lights, planting and sky illumination. No new upper story, additional bays, illuminated signage or changing landscaping. Do not fabricate a specific client building.

#### Exactly what moves

One short slow pullback along the existing view direction. No orbit, tilt or rising drone move. The entrance becomes only modestly smaller, roughly 5–8% in apparent height across the retained range. Near planting, if present, may separate through parallax; the facade must remain rigid.

#### Source timing / normalize to native duration

- 0–15%: already blue hour with steady warm interior light.

- 15–80%: restrained pullback; the same entrance remains the unmistakable focus.

- 80–100%: ease toward a clean final hold. Leave a stable poster frame. Do not force a dark wipe unless a real fixed foreground mullion actually exists in the accepted source.

#### Intended finish

The same entrance held cleanly with warm interior light and steel-blue exterior. No written end card inside the generated scene. The website headline and CTA remain HTML.

#### CLEAN KEYFRAME PROMPT — image creation only

```text
Photorealistic wide three-quarter exterior at blue hour of the entrance from the supplied reference. Same white precast square columns, graphite mullion pattern, clear glass leaves and stainless pulls, warm linear interior lighting. Pale steel-blue sky and restrained California planting. Building proportions and opening counts match the accepted day reference. Clean dry architecture, no signs, people, vehicles, logo, border or added story. 16:9 composition with the entrance clearly framed.
```

#### H3 FL2VA PROMPT — primary execution prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. At blue hour, the camera makes a short slow pullback from the existing glass entrance and eases into a stable final view. The entrance becomes slightly smaller with natural depth parallax. The white facade, graphite frames, doors, planting and warm interior lights remain fixed and unchanged. No orbit or time-lapse. Preserve the supplied geometry, materials and composition except for the specified real camera/door movement. No scene change, digital image zoom, freeze frame or additional action.
overall_soundscape: Quiet natural ambience only. No speech.
non_diegetic_music: None.
```

#### BASE MOTION — same action without model wrapper

```text
At blue hour, the camera makes a short slow pullback from the existing glass entrance and eases into a stable final view. The entrance becomes slightly smaller with natural depth parallax. The white facade, graphite frames, doors, planting and warm interior lights remain fixed and unchanged. No orbit or time-lapse.
```

#### SHORTER WORDING — same action, do not append

```text
Slow short pullback from the fixed blue-hour entrance, then hold. Steady warm interior lights, rigid facade, no time-of-day change.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: finished entrance already at blue hour) (middle: one restrained straight pullback) (end: a clean stable wide hold of the same building)
```

#### Reject the result if

Different facade or door count; daylight suddenly changing; rapidly switching lights; drone lift or spinning orbit; melted frame divisions; a generated CGC logo; a fake customer sign. Any single-image pan/zoom, held plate or different camera action/direction is an automatic rejection, regardless of visual appeal.

#### Recovery — same scripted action required

Prepare a consistent blue-hour start frame with stationary doors and stable warm lighting, then re-render a genuine restrained PULLBACK. Use a consistent endpoint or supported camera control if available. Do not substitute a graded still, scale drift, fixed ending or a different facade. If either the pullback or rigidity fails, S08 remains unmet.

#### Editorial cut

End on the clean final frames of the genuinely generated pullback. A brief natural settle is allowed; a held plate is not. Test an intentional loop cut separately rather than invent a camera teleport or copy a static ending.

#### Portrait composition

Show the entrance and one recognizable white column, not the whole facade squeezed into portrait. Preserve warm interior detail and a stable place for the website crop.

## 10. Negative prompting and prompt discipline

Use a dedicated negative field only if the selected model exposes and uses it. Do not paste a huge defect list into the positive prompt or assume every model interprets negatives the same way.

Suggested compact starting negative, conditional on support:

```text
warped architecture, bending frames, duplicated handles, liquid glass, changing floor texture, flicker, camera shake, people, text, logos
```

If the actual failure is repeated handles, focus that revision on handle stability. If the camera stays still, adding more negative words about architecture is unlikely to create camera translation. Change one causal factor at a time and compare the result.

Keep claims out of prompts. The film is illustrative. No client name, years in business, project total, awards, review stars or invented branding belongs in a generated shot.

## 11. Failure diagnosis and one-variable recovery

| Observed result | Inspect first | Next controlled experiment | Do not do |
| --- | --- | --- | --- |
| Almost still despite a move | Is the start view capable of parallax? Is the motion prompt actually used? | Use the short motion prompt with the same seed; choose a view with a near jamb and far lobby | Stack ten camera verbs |
| Digital zoom instead of translation | Near/far feature displacement | State a rightward truck and expected leftward near-feature drift; try exposed camera control if supported | Call scale change alone a dolly |
| Glass ripples or becomes water | Source detail, reflection complexity, amount of travel | Shorter fixed-plane move; simpler reflection; stable light | Ask the glass or reflection to flow |
| Mullions bend | Is static control A already unstable? | Remove extra effects/controls from a duplicated baseline, or reduce movement | Upscale or interpolate the bent frames |
| New windows, handles or doors appear | Accepted keyframe and conditioning/crop | Rebuild the keyframe or shorten revealed area; compare one changed factor | Add a conflicting final facade image |
| Door slides or duplicates | Hinge geometry and number of simultaneous actions | Repair hinge keyframe and test a small rigid opening with locked camera; otherwise mark the action unmet | Combine door, camera, lighting and focus moves |
| Lighting pulses | Auto enhancement, source highlights, temporal stability | Keep light fixed; compare without enhancement if currently active | Add animated glints and exposure ramps |
| Building changes across shots | Keyframes, matching viewpoints, reference use | Re-establish common architecture before any more video | Hide incompatible columns with dissolves |
| Motion too fast | Actual native FPS/duration and selected edit range | Generate a smaller travel at the same native timing; retain a gentler segment | Relabel FPS and unintentionally change duration |
| Ghosted glass edges after interpolation | Compare native output against processed output | Remove the interpolation and inspect cadence, or process only a proven-stable clip | Treat processing artifacts as original geometry |
| GPU memory failure | Supported size, source length and installed offload options | Use the app's working lower-cost preset for this model on a duplicated task | Download arbitrary optimizers or force 4K |
| Different model looks like a different film | Accepted keyframe, motion, grade and model baseline | Re-run the same calibration trio and one matching shot before switching production | Spread all eight shots across untested models |

Keep the model's exported defaults for the first controlled comparison. If a baseline is already a custom accelerated preset, record it and its dependencies. Do not assume distilled and full models share step/guidance settings. Change only an exposed, supported setting and keep a record of what changed.

## 12. Strict acceptance — every hard gate passes

For each shot, mark six binary gates PASS or FAIL: correct scripted action; correct direction; correct starting subject/composition; rigid geometry and hardware; temporal/lighting stability; genuine generated scene motion with coherent depth. Also check consistent architecture and a usable two-second range. Any failed gate rejects the shot.

Do not average scores to excuse a failure. Motion must be correct, not merely visible. A pretty push cannot pass a truck requirement. The seam moving down cannot pass a required downward camera slide that should make it rise. An open-door still cannot pass the hinged-opening requirement.

Try the main H3 prompt, up to two focused prompt/conditioning revisions, and a repaired keyframe where justified. Continue production when the requirement passes. If H3 still fails, preserve outputs and report the exact unmet requirement; do not install a noncompliant substitute. The owner must explicitly change the script before a different shot can be treated as acceptable.

## 13. Assembly and cuts

Final main edit: S01 00:00–00:02; S02 00:02–00:04; S03 00:04–00:06; S04 00:06–00:08; S05 00:08–00:10; S06 00:10–00:12; S07 00:12–00:14; S08 00:14–00:16.

Cut by shape and movement, not by an automatic transition preset. The glass edge leads to the reflection; a dark mullion leads to the joint; a horizontal seam leads to the threshold; the threshold leads to the open door; the jamb masks the passage; the passage opens into the interior; a deliberate cut changes daylight to blue hour.

Use hard cuts first. Add a practical mullion wipe only where the actual accepted clip provides the occluding edge. Do not invent a wipe that reveals incompatible architecture. A dissolve between the day interior and blue-hour exterior should not make columns or door handles double up.

If a shot cannot supply two stable seconds of the required action, re-render it. Do not adjust the action, substitute another clip, repeat frozen frames, apply a Ken Burns move or document a hold as if documentation made it acceptable. The final sequence should show a real progression in shot size and space; adjacent shots 06 and 07 must not be two indistinguishable corridor pushes.

First build an ungraded, silent cut. Check direction, continuity and pacing. Then match white balance, exposure and contrast. Preserve highlight texture in glass and floor; do not crush graphite metal into featureless black or use an orange/teal grade. No generated text. Keep the website headline as live HTML.

## 14. Loop treatment and stronger alternate opening

Main deliverable: a readable 16-second film with a clean wide ending. A loop is an edit requirement, not an excuse to demand an impossible continuous camera journey through eight viewpoints.

Option A: an intentional cut from the final dark frame edge to the opening glass-edge macro. Test the join at normal speed and one frame at a time. If the light and edge positions do not match, adjust the retained frames or choose another ending.

Option B: build a very short separate closing insert based on shot 01 at the final exterior lighting. A real mullion crosses the lens and hides the cut to that insert. Generate this only after the main sequence works; do not add a ninth complex shot to the first test batch.

Optional social opening: start on shot 05's visible door opening, then cut to 01–04 material detail and return to 06–08. Website default stays the quieter line-to-space sequence. Do not make both edits until one complete film has passed review.

## 15. Mobile composition

Create the 16:9 edit first. For 9:16 at the same height, only the central 31.6% of a 16:9 frame remains. A vague 60% action-safe region is not enough. Draw the actual portrait crop on every approved keyframe before generating a portrait version.

Keep the glass edge, the joint, threshold and open doorway visible inside that crop. If they are lost, create a separately composed portrait keyframe using the same architecture and motion intent. Do not stretch or squeeze the facade. Avoid automatic crop motion that competes with the generated camera move.

For the mobile passage, place the clear doorway near center and keep the opening wider than the camera's apparent path. For the final exterior, prioritize the entrance and one recognizable column instead of trying to fit the entire building. Review with the actual website text, controls and bottom bar.

## 16. Frame rate, source duration and finishing

Record actual native dimensions, frame count and rate from the accepted outputs. Duration depends on frames and playback rate. Do not force a source's frames to play at 24fps without checking whether that changes its speed. Conform the edit deliberately and inspect cadence.

Final edited rate: 24fps. Final length: 384 frames. Start with a silent master. If frame interpolation is used for cadence, apply it only to geometry-stable shots and reject doubled edges or ghosted handles. If it causes defects, remove it. Upscaling cannot restore missing structural detail or fix wrong motion.

Delivery targets, after generation at a model-supported size:

- Desktop: 1600×900, 24fps, 16 seconds, silent H.264 MP4 with yuv420p and faststart; equivalent WebM if practical. Aim for ≤4MB per web file without damaging glass edges.
- Phone: separately composed 720×1280, 24fps, 16 seconds, silent MP4/WebM. Aim for ≤3MB each.
- Desktop and phone posters: clean stable accepted frames as WebP, with smaller responsive exports.
- Captions: UTF-8 WebVTT describing the actual accepted sequence, not the intended sequence if a shot changed.
- Edit manifest: exact source files, in/out times, FPS, model/workflow/seed/settings exports, generation dates, acceptance notes and concept attribution. No credentials.

These are web-delivery targets, not claims that every local checkpoint can natively generate those dimensions. Inspect the compressed encodes at 100% for broken thin frames, muddy reflections and banding before calling them final.

## 17. Filenames and candidate log

Use readable versioned names. Never overwrite the user's existing renders or their working app settings.

```text
CGC_Threshold_v4/
  00_environment/run-sheet.json
  00_environment/exported-model-settings.json
  01_keyframes/S01_edge_start_v01.png
  01_keyframes/S02_reflection_start_v01.png
  ...
  02_calibration/A_static_seed-NATIVESEED.mp4
  02_calibration/B_truck_seed-NATIVESEED.mp4
  02_calibration/C_push_seed-NATIVESEED.mp4
  03_candidates/S01_v01_MODEL_seed-NATIVESEED.mp4
  03_candidates/S01_v01_settings.json
  04_accepted/S01_edge.mp4
  ...
  05_edit/threshold-main-master.mp4
  05_edit/edit.json
  06_web/hero-desktop.mp4
  06_web/hero-desktop.webm
  06_web/hero-mobile.mp4
  06_web/hero-mobile.webm
  06_web/hero-desktop-poster.webp
  06_web/hero-mobile-poster.webp
  06_web/hero-captions.vtt
  review-log.csv
```

Candidate log columns: shot, version, model, seed, start image, H3/main/short prompt, changed variable, source FPS, source frames, each hard gate PASS/FAIL, rejected defect, accepted in, accepted out, reviewer note. Label unknowns instead of inventing values.

## 18. Website integration — after the generated film is accepted

The current CGC site is white, graphite and steel blue. Its local hero contains the rejected Threshold v3 film; the deployed preview may still show an older film. Generate the strict H3 Threshold v4 replacement, inspect it and install it only when every shot passes section 0. Existing film playback is not proof that this replacement task is complete.

If the repository is available, read `cgc/STATUS.md` and `cgc/_work/architectural.py`. The site is under `cgc/site/`. Build changes through the current generator; editing the HTML alone will be overwritten on rebuild. Preserve facts from BRIEF.md, exact consent copy, unchecked SMS consent, form payload/API schema, gallery evidence, legal links, CRM and SEO.

Keep the generated-concept disclosure visible. Never place synthetic footage in the real-work gallery as if it documented a CGC job. Keep the supplied logo unchanged. Website copy must not claim awards, client results, years or statistics not in the brief.

Hero requirements: poster first; muted playsinline video; working pause/play and captions; pause off-screen or when the tab is hidden; no autoplay or automatic hero-video loading for reduced-motion visitors; stable dimensions; readable HTML headline; no loading gate or scroll trap; no flashing.

After installation, perform the targeted hero smoke checks in section 0. Check the desktop and phone crops with the real HTML text and controls, pause/play, CC, reduced-motion/static fallback and whether the new files actually play. Do not run Lighthouse or general website audits as part of this video-production task.

Commit small changes on the current branch. Do not push, change DNS, change Deployment Protection, create or enter credentials, attach domains or promote production. No messages or publishing to other services are authorized by this handoff.

## 19. What Rebuff must return

Calibration, clean-keyframe review and edit review are internal checkpoints. Complete them and continue without stopping for routine approval. The final delivery is the accepted generated film installed and verified in the CGC hero, plus web assets, posters, captions, settings exports and edit manifest. Intermediate reports do not complete the task.

Confirm that no held plates, zoomed stills, wrong-action clips or revoked fallbacks are included. If an essential shot remains unmet, say so and do not claim completion. If a workflow cannot run, say exactly what is missing. If a file is only a plan, an animatic or a still, label it that way. Do not say video is generated until playable video files exist and have been inspected.

The standard is a coherent entrance film with visible, purposeful movement and rigid, believable glass architecture. The standard is not eight pretty images with unrelated animation.
