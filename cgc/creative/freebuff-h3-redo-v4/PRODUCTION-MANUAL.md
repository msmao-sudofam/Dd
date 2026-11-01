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

The eight detailed cards follow this manual in the same file. They supersede the earlier version's general motion paragraphs.

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
