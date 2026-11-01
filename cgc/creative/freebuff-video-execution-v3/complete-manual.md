# CGC — FREEBUFF EXECUTION ORDER
## 0. Execute this task until the hero is installed

Prepared November 1, 2026. This order supersedes every earlier CGC video handoff and overrides any old suggestion to continue website performance audits. The owner explicitly wants actual video generation, visual quality review and installation in the hero.

**Your job is to do the production work with the installed local Wan2GP application. Do not produce another plan and call that done. Do not stop after reading this file, choosing a model, making a storyboard, running calibration or reporting website scores.** Those are intermediate steps. Continue through an accepted, playable hero using newly generated footage.

### What counts as complete

All of these must exist and have been verified:

1. Clean, consistent start images and actual new video shots rendered through Wan2GP. Preserve settings, prompts, model IDs, seeds and output paths. A slideshow, contact sheet, prompt file or re-encode of the existing film does not count as new generation.
2. The generated motion has been visually inspected. Reject deformed frames, floating or duplicated handles, changing window counts, swimming glass, wrong camera movement and inconsistent architecture. Apply the shot's controlled revisions or simpler fallback, then inspect again.
3. A coherent 16-second film assembled from accepted shots, with a dedicated phone composition, clean posters and captions matching what the finished edit shows.
4. The CGC hero references the new versioned files through its actual source generator. The rebuilt site plays that new film; it is not silently using the previous Reflection Run files from cache.
5. Targeted playback verification is complete on desktop and phone: new media URL, successful response, visible motion, pause/play, captions, honest concept disclosure, off-screen/hidden-tab pause and a working reduced-motion poster.
6. A final delivery note lists the new asset paths, selected model, rejected/fallback shots, visual-review evidence, integration changes and remaining genuine blockers. Include a screenshot of the installed hero and a usable local preview URL if supported.

These are internal production gates, not separate user-approval gates. The owner has already asked you to generate and install the film. Do not finish a turn with “ready to generate,” “shall I continue?” or a calibration-only summary when you can continue. If a generation is queued, monitor it to completion; starting a queue is not delivering video.

### Verified local setup — use this installation

GPU checked November 1, 2026: **NVIDIA GeForce RTX 5080, 16,303 MiB VRAM**. Disk presence was verified, but these specific models were not test-rendered by the author of this handoff. Verify runtime compatibility using the installed application's own working presets and exported settings.

Primary Wan2GP application:

```text
C:/pinokio/api/wan.git/app
```

Preferred first candidate — installed preset and both model phases:

```text
finetunes/i2v_2_2_gguf_q4_k_m.json
UI name: Wan2.2 Image2video 14B GGUF Q4_K_M
ckpts/Wan2.2-I2V-A14B-HighNoise-Q4_K_M.gguf
ckpts/Wan2.2-I2V-A14B-LowNoise-Q4_K_M.gguf
```

Both GGUF files are approximately 8.99 GiB each. The two file sizes are not a promise that both phases fit simultaneously in 16GB VRAM. Use the preset's supported offloading/memory behavior, confirm the correct model pair and do not invent guidance/step values.

Installed comparison candidates:

```text
defaults/minimax_h3_fl2va_pruned.json
UI name: MiniMax H3 FL2VA Pruned 20B
ckpts/MiniMax-H3-FL2VA-pruned_rank8_int8_convrot.safetensors

defaults/minimax_h3_ref2va_pruned.json
UI name: MiniMax H3 Ref2VA Pruned 20B
ckpts/MiniMax-H3-Ref2VA-pruned_rank8_int8_convrot.safetensors
```

Each H3 transformer file is approximately 19.61 GiB, so confirm its installed memory/offload profile on the 16GB GPU. Matching H3 heads, video/audio VAEs, encoder and accelerator files were found in the same application. Their presence does not substitute for a successful loading/render test.

For this film, begin with the **Wan 2.2 I2V A14B Q4_K_M** preset. This is the starting recommendation, not a claim that it has already beaten every installed model. **H3 FL2VA** is the comparison candidate for animating the accepted first frames. **H3 Ref2VA** is useful only if a tested reference-conditioned path is needed; do not switch to it just because it sounds more advanced.

There is a second, older installation:

```text
C:/Users/Moqui/talking-head/repos/Wan2GP
```

That installation has Wan 2.1 I2V 480p 14B and talking-head models. Do not mistake it for the Pinokio installation above or conclude that the A14B/H3 models are missing because you searched only this folder.

There is also:

```text
C:/Users/Moqui/ComfyUI/models/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors
```

The previous CGC film was rendered with that 5B checkpoint through **ComfyUI**, according to `cgc/_work/wan_film.py` and the film record. Running that helper again would not demonstrate that you used Wan2GP. The owner requested Wan2GP: use it as the renderer. Do not silently switch applications or declare success based on the old 5B render path.

### First actions — start a real generation

1. Locate the CGC checkout. Known path: `C:/Users/Moqui/Projects/Dd`; public site: `cgc/site`. Read `cgc/STATUS.md`, `cgc/BRIEF.md` and the current `cgc/_work/architectural.py`. Check the working tree and preserve other pending edits.
2. Inspect the existing bad film and its raw source clips if present. Name the actual visible defects. Read the source settings rather than assuming that the file called “final” is good.
3. Open or launch the installed Wan2GP through its existing launcher/environment. Inspect `C:/pinokio/api/wan.git/start.js` if needed to learn the real entrypoint. Reuse its Python environment. Use its existing UI or supported local API/queue; inspect actual installed help/schema before submitting. Do not fabricate endpoints or silently download another application.
4. Extract the embedded entrance reference and board from this HTML. Generate the clean shot keyframes locally using an installed image tool or the receiving environment's available image capability. If good, consistent clean frames already exist, review and reuse them instead of inventing another building.
5. Export a working settings template for the installed A14B preset. Set up one calibration job from section 6, submit it and wait for the actual output. Keep prompts short and shot-specific. Record the precise job/output ID and paths.
6. Inspect the result, make the bounded corrections below, then proceed with the production shots. Do not spend the session writing more plans or investigating site metrics.

Do not change the user's global app settings, upgrade software, install new checkpoints, enter keys, call paid/cloud generators or alter security settings as an unannounced workaround. If an existing runtime cannot start, use the existing launcher/environment and inspect the concrete error before claiming a missing dependency.

### Bounded model choice — pick, then produce

Use the same accepted S02 reflection image and S06 open-doorway image to compare models. Start with A14B. If its native outputs meet the geometry and motion gates, you may proceed immediately rather than benchmarking everything.

If A14B is poor or H3 is already known to run well, make at most two short H3 FL2VA comparison clips using those same two images and movement intents. Use each model's own valid native settings. Compare native output and elapsed time, not compressed delivery files and not just still thumbnails. Different model seeds are not directly comparable; the matched input image and shot intent are the controls.

Choose the model that gives rigid architecture, visible correct motion and a consistent entrance at a workable local runtime. Record a brief reason and move on. Do not conduct an open-ended model study. Do not download LTX/Hunyuan/other weights just to expand the comparison. Do not fall back automatically to the previously rejected 5B production path without explaining the actual reason.

For H3, adapt the shot motion to its installed native prompt format; do not assume the Wan prompt field conventions are identical. Its local FL2VA template includes `integrated_multimodal_description`, `overall_soundscape` and `non_diegetic_music`. Describe one shot, preserve the supplied first frame and keep sound simple; strip audio from the web deliverable. Use local conditioning, not a hosted prompt-enhancement service. Validate its installed template rather than inventing settings.

### Production loop — keep working through it

For S01 through S08:

1. Review the clean start frame against the common entrance. Correct topology before rendering motion.
2. Submit the actual image-to-video job through Wan2GP. Save its exact prompt and exported settings. Wait for completion and verify the output exists and is playable.
3. Watch the shot at normal speed. Inspect the first, quarter, middle, three-quarter and last frames, then scrub the complete retained range for brief failures. Use the available video viewer/browser or extract frames/contact sheets and actually view the images; filenames and metadata are not visual review.
4. Apply the detailed shot's pass/fail rubric. Wrong motion, warped glass or a different building is a rejection even if one frame looks attractive.
5. Try the main prompt and at most two controlled revisions, changing one causal factor per revision. Use the documented simpler fallback where necessary and identify it honestly. A fallback is still a render/edit decision to execute, not permission to stop at a recommendation.
6. Save the accepted result and its clean edit range. Continue to the next shot.

Calibration, model comparison and shot acceptance do not require asking the user to approve every intermediate result. Continue autonomously within the authorized task. If no installed model can produce an acceptable essential shot, report the actual failed jobs and specific limitation; do not declare a bad film complete.

### What visual review must establish

- Macro shots have visible material detail and purposeful camera motion. No free-floating laser, watery pane or generic still zoom masquerading as a truck.
- Framing stays straight and consistent. Handles remain attached. Mullion widths and bay/door counts do not change during a shot.
- The door has a fixed hinge and a small rigid opening arc. If that fails, render the already-open-door camera-only fallback. Do not show a sliding or bending hinged leaf.
- The passage moves through a real clear opening, not through intact glass. The room does not stretch like a tunnel.
- The eight shots belong to the same architectural world. The last exterior is actually blue hour if the edit/captions claim blue hour; otherwise change the shot or describe the accepted result accurately.
- The assembled desktop AND phone film is watched from start to finish, including every cut and the loop join. A single contact sheet is not enough to judge motion quality.

`ffprobe`, frame counts, VMAF, file size and Lighthouse do not prove creative quality. They can support technical checks after a visually accepted film exists. Never use a good compression score as evidence that the original generated motion looks good.

### Install the accepted film — mandatory

The current hero already contains a generated **Reflection Run** film. The user is dissatisfied and wants the new, better-directed result. Do not respond “a generated film already exists” and stop. Do not just recompress, re-caption or re-audit that existing film.

Save the new deliverables under a new versioned folder so the old film remains available for rollback, for example:

```text
cgc/site/assets/film/threshold-v3/desktop.mp4
cgc/site/assets/film/threshold-v3/mobile.mp4
cgc/site/assets/film/threshold-v3/desktop-poster.webp
cgc/site/assets/film/threshold-v3/mobile-poster.webp
cgc/site/assets/film/threshold-v3/captions.vtt
cgc/site/assets/film/threshold-v3/edit.json
```

Generate WebM alternatives if the existing delivery workflow can do so without becoming the new project. Usable MP4 desktop/phone outputs and installation are mandatory; endless codec comparisons are not.

Update `cgc/_work/architectural-hero.html` and `cgc/_work/architectural.js` as needed, then rebuild through `python cgc/_work/architectural.py`. Reference the NEW files. Update the poster to an accepted frame from the new film, the caption track, video description, duration/progress and chapter list to match the new eight-shot edit. Do not retain the old five-shot chapter timing for the new film. Preserve the existing bright design, generated-concept disclosure, controls and real-work gallery.

Test the integrated page, not a standalone video player alone. Confirm `currentSrc` points to the new versioned desktop/phone file, the network response is successful, playback advances and the visible content matches the accepted new film. Verify the poster, captions, pause/resume and reduced-motion behavior. Save proof of the installed hero.

### No website-audit detour

Until the generated film is installed and its playback verified, the following are OUT OF SCOPE:

- Lighthouse runs or repeated website audits.
- Poster-format A/B tests, AVIF/WebP studies and LCP experiments.
- Recompressing the previous film as a substitute for new generation.
- General SEO, CRM, form, layout, gallery, font or legal-page work.
- Fixing unrelated development-server analytics 404s or deployment configuration.
- A new storyboard/handoff rewrite in place of operating the renderer.

After installation, perform only the targeted smoke checks needed for the changed hero: desktop/phone source and crop, playback, pause, captions, disclosure, reduced-motion/static fallback and no introduced page errors. Fix a real blocker to viewing the new hero. Do not turn those checks into another multi-hour website optimization task. A broader audit can be requested separately after the video task is delivered.

### Delivery and genuine blockers

Your final message must say which model actually rendered the new film, where the accepted shots/master/web assets are, what failed or used a fallback, which generator files changed, how the integrated hero was visually verified and where to open it locally. Do not claim deployment if you only ran a local preview. Do not push or promote production.

Stop early only for a concrete blocking condition that prevents authorized progress: unavailable renderer access, a reproducible runtime/dependency failure, insufficient hardware after supported adjustments, or lack of any way to visually inspect the outputs. Report the exact attempted command/job, relevant error, completed files and the one action needed to unblock. “Audits passed,” “prompts ready,” “queue submitted” and “model comparison complete” are not completion or blockers.

**Finish line: a newly generated, visually reviewed film playing in the CGC hero.**

## Production detail follows

The remaining manual supplies the original art direction and exact eight shot cards. Section 0 controls scope, application choice, checkpoints and the definition of done. Where older wording suggests returning intermediate reports or general website audits, follow section 0 instead and continue the production task.


# CGC — THE THRESHOLD
## Detailed local-video production handoff / version 3

Prepared November 1, 2026. Audience: Freebuff, executing the authorized generation and hero-installation task through the installed Wan2GP application.

This replaces the earlier short production brief. The owner says the first videos were poor. The actual failed files have not been supplied here, so do not pretend to have diagnosed their particular defects. Start by watching them and use the diagnostic procedure below.

## 1. Read this before generating anything

Make a deliberate architectural film, not a slideshow with random motion. The glass and metal are the subject. The camera discovers an entrance through increasingly wider views. The building remains rigid. The impact comes from framing, controlled parallax, scale changes between shots and a strong edit.

The deliverable is eight separately generated shots assembled into a 16-second website hero. Each edited shot is two seconds. Final timeline: 24fps, 384 frames, frames 0–383 inclusive. Generate at the selected model's supported native settings first. Final edit rate is not an instruction to force an unsuitable model-generation rate.

Do not paste this manual into the model's prompt box. For image-to-video, paste only the selected shot's MOTION PROMPT. The motion prompt assumes an accepted, clean start image already establishes the architecture. For text-to-image, use that shot's CLEAN KEYFRAME PROMPT plus the common visual reference. All the other detail is direction for the operator and acceptance criteria for the result.

Make three calibration clips before the eight-shot production batch. A perfect-looking still with warped motion is a failed shot. A stable clip with almost invisible camera motion also fails the intended shot. The target is visible but controlled movement.

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

## 6. Calibration gate — test before the full batch

Use one clean framing-joint image based on shot 03. Use the same supported resolution, native duration and fixed seed for A/B comparisons. Keep the exported baseline settings unchanged unless that setting is the variable under test. Do not apply a blanket CFG, step count or motion-LoRA value across unrelated models.

TEST A — STATIC CONTROL. The building should remain stable over time.

```text
Locked-off close view of the aluminum framing joint. The camera is completely stationary. The frame, gasket, glass and lighting remain unchanged throughout the shot.
```

TEST B — VISIBLE SIMPLE MOVE. Change the prompt only; use the same start image and settings as A.

```text
The camera trucks slowly to the right across the fixed aluminum framing joint. The nearby vertical mullion drifts left in the image while the more distant glass background shifts less. The rigid frame and gasket remain unchanged. One continuous level move, fixed focus.
```

TEST C — FORWARD DEPTH. Use a separate clean doorway image with the door already open; do not include a moving door.

```text
The camera makes one short smooth push forward through the already-open doorway. The near jamb moves outward at the edge of the image while the distant lobby changes more slowly. The camera passes through the clear opening. The door, columns, glazing and lighting remain fixed.
```

Watch all three at normal speed and frame by frame. Inspect the first, quarter, middle, three-quarter and final frames; then scrub the full clip. Sampled frames alone can miss a brief failure.

Pass A only if there is no visible frame bending, new hardware, exposure pulse or drifting floor texture. Pass B only if the mullion stays rigid AND the camera translation is readable. Pass C only if the opening remains the same shape and the camera stays on a clear path.

If A fails, stop. Resolve the input quality or model/workflow baseline before attempting complex movement. If A passes and B fails, simplify or change the motion method. If B produces only a zoom, try the short alternate prompt once; then use a supported camera/control path if available. More adjectives are not the fix.

Do not produce the eight production clips until there is a stable static baseline, a stable lateral move and a stable short push. Save calibration failures; they are useful evidence, not deliverables.

When switching among the user's other local models, keep the accepted keyframe and visual objective, but re-run calibration with that model's working configuration. For an image-conditioned workflow, begin with the main motion prompt. For a workflow that handles short prompts better, substitute the short alternate. For a distilled or accelerated preset, preserve its matching configuration rather than copying full-model step/guidance values. For an end-frame or control-capable model, test the extra conditioning on one calibration clip before using it across production. If only text-to-video is available, do not present eight independently imagined buildings as reference-consistent output; identify the missing image-conditioning path first.

## 7. Clean-keyframe preparation

The storyboard sheet contains numbers, gutters and small panels. It must never be passed directly as the video start image. Do not enlarge a tiny panel and treat it as a final high-quality frame. Generate an unnumbered, full-frame keyframe for each shot using the entrance reference and the shot's keyframe prompt.

Prepare one accepted 16:9 image for each shot at a size the selected image/video workflow can use without a destructive crop. Do not stretch a 3:2 image into 16:9. Inspect at the intended delivery crop before generating video.

Reject a keyframe if the door appears attached to glass with no plausible hinge, a pull handle floats, a mullion changes width halfway up, the floor has impossible joins, or the requested camera has no clear doorway to pass through. Video generation rarely repairs structural defects already in the starting image.

For matching entrance views, make edits or reference-conditioned variants from the accepted architecture rather than eight independent text-only buildings. A common seed is a reproducibility aid, not an identity lock.

Do not force a distant final wide image into a macro shot as an end frame. End-frame conditioning, if supported, should describe a small achievable movement with unchanged topology. If start/end constraints cause melting, remove the end frame and shorten the move.

## 8. How to use each shot card

Each card gives: editorial purpose, start composition, fixed elements, allowed movement, blocked source timing, intended finish, clean-keyframe prompt, main image-to-video prompt, short alternate, optional timeline wording, rejection tests, fallback and cut instructions.

Use the main motion prompt first. Use the short alternate if a capable model ignores or muddies the longer prompt. Timeline wording is an optional experiment only after the installed model/workflow is shown to follow timed prompts; it is not a promise of second-accurate control.

Source timing uses a nominal four-second generation for explanation. Adapt to the closest legal native source duration. Normalize the timing percentages if the source is another length. Generate a usable movement segment, not four seconds of a still and one final twitch. The edit selects the best stable two seconds; it need not retain the whole source or every setup/settle beat.

Keep a short handle before and after the retained movement whenever the source allows it. Do not slow or speed a broken shot to conceal a defect. Save exact in/out times in the edit manifest.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
The camera trucks slowly to the right along the fixed polished glass edge. The nearby edge drifts slightly left in the image while the dark background shifts less. A narrow natural reflection changes with the viewing angle. The pane stays rigid and straight. One continuous level move with steady light and fixed focus.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Slow rightward camera truck along the stationary glass edge. Gentle parallax, rigid glass, fixed focus and steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: the existing polished glass edge is already visible) (middle: one slow rightward camera truck creates gentle parallax) (end: the edge remains straight beside a slightly wider pale-blue reflection)
```

#### Reject the result if

A glowing line detached from glass; a bending edge; the pane rotating or sliding by itself; a laser sweep; pulsing exposure; no visible parallax. A digital zoom alone does not meet this shot.

#### Simpler fallback

Keep the geometry almost locked and use an even shorter lateral travel across a clearly visible bevel. If macro material detail is unstable, start at a slightly wider close-up with the frame edge in view. Do not replace it with an abstract graphic and call that photographed glass.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
The camera trucks slowly to the right parallel to the stationary glass facade. The nearby graphite mullion moves left across the image while the reflected distant tree changes more gently with the viewing angle. The glass plane and framing remain rigid. Fixed camera orientation, steady daylight, one continuous lateral move.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Rightward camera truck beside fixed glazing. The near mullion drifts left; the distant reflection shifts less. Rigid frames, steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: oblique view of sky and a tree reflected in fixed glass) (middle: the camera trucks right and the near mullion drifts left) (end: the same mullion remains straight near center-right)
```

#### Reject the result if

Reflection swimming like water; a tree growing or multiplying; an orbit that reveals a new facade; sky changing to clouds or night; a stationary camera with only a texture sweep; glass becoming opaque without a viewpoint reason.

#### Simpler fallback

Use a cleaner pane with one strong mullion and a simpler sky reflection. Reduce camera travel before adding controls. If the model cannot maintain transparency, choose a more oblique reference with less visible interior while keeping the material recognizable.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
The camera slides slowly downward along the fixed vertical aluminum member. The horizontal framing joint rises slightly in the image as the camera descends. The frame width, gasket and glass remain unchanged and rigid. Fixed focus and constant daylight. One short, smooth vertical camera move.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Slow downward camera slide past the rigid framing joint. The horizontal seam moves upward on screen. Fixed focus, steady light.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: the framing joint is sharply visible) (middle: the camera slides down, making the horizontal seam rise slightly) (end: the same joint and gasket remain sharp and unchanged)
```

#### Reject the result if

Frame widening, merging or flexing; gasket becoming a snake-like line; a digital zoom replacing the slide; joint moving downward when the specified camera move should make it rise; autofocus blur hiding instability.

#### Simpler fallback

Use the stable rightward-truck calibration result as an alternate joint shot. Maintain the cut to the horizontal threshold line. A stable simple truck is preferable to a failed vertical move.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
The low camera makes one short smooth push forward toward the fixed entrance threshold. Nearby terrazzo detail shifts slightly faster than the frame ahead. The threshold, seal and floor joints remain rigid and unchanged. The diagonal sunlight and exposure stay constant. Fixed angle and focus.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Short floor-level push toward the fixed threshold. Natural near/far parallax, rigid floor joints and steady sunlight.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: low view of threshold and diagonal sunlight) (middle: a small forward dolly creates floor parallax) (end: a closer stable threshold detail, without crossing the opening)
```

#### Reject the result if

Floor swimming or stretching; seam moving independent of camera; time-lapse sunlight; camera passing through the sill; sudden tilt into a new interior; extra gasket strands appearing.

#### Simpler fallback

Use a very small lateral slide across the same threshold, with the daylight already fixed in the start frame. Keep all movement within a clearly visible patch of known floor.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
Locked camera. The slightly ajar glass entrance door slowly opens outward a little farther on its existing fixed hinges, then settles. Only that rigid door leaf rotates; its pull handle stays attached. The surrounding frame, other door, floor, camera and lighting remain completely still.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Static camera. One existing glass door rotates outward slightly on its fixed hinges. The leaf and attached handle stay rigid. Everything else stays still.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: static camera, existing door slightly ajar) (middle: only that leaf rotates outward through a small arc about its fixed hinge) (end: the door settles a little farther open; camera and building stay fixed)
```

#### Reject the result if

Sliding door behavior; bending glass; moving hinge axis; floating/duplicated handle; new hands; the opposite leaf moving; camera pushing in; glass changing topology. This shot has a stricter pass gate than the material inserts.

#### Simpler fallback

Use a clean start frame with the door already open and NO door animation. Perform a very small camera-only rightward truck outside the opening. Label this the S05 camera-only fallback. Keep the opening visually readable. Do not spend repeated batches trying to rescue a bad hinge.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
The camera makes one smooth short push forward through the already-open clear doorway. The nearby jamb moves outward toward the image edge faster than the distant lobby. The door stays open and motionless. Columns, floor joints and glass framing remain rigid. Level camera, fixed lens, steady light; finish just inside the same entrance.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Short level dolly forward through the already-open doorway. Stronger near-jamb parallax, gentler distant-lobby change. Fixed door and rigid building.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: open doorway with a clear path) (middle: the camera pushes straight forward, near jamb drifting toward the edge) (end: just inside the same lobby, with all architecture unchanged)
```

#### Reject the result if

Camera crossing intact glass; portal morph; growing corridor; floor sliding like a treadmill; perspective zoom without meaningful parallax; a door closing across the path; a newly invented room.

#### Simpler fallback

Stop the camera outside the threshold and use a shorter push. Cut directly to the accepted interior shot 07. A convincing approach plus an edit is stronger than an impossible passage.

#### Editorial cut

Use a naturally passing jamb edge if it exists. Otherwise make a clean hard cut to the interior at a matching level and direction. Do not demand a continuous simulated one-take between incompatible viewpoints.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
Inside the lobby, the camera makes a very short slow truck to the right, then eases toward a calm hold. The nearby white column drifts slightly left while the distant glass office fronts shift less. The room, framing, floor joints and lighting remain unchanged. Level view and fixed lens; no forward fly-through.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Very slow short rightward truck inside the fixed lobby. Gentle near-column parallax, then a calm hold. Rigid architecture and steady daylight.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: wide stable interior with glass office fronts) (middle: a small rightward camera truck reveals depth around a fixed column) (end: settle on the same sunlit room)
```

#### Reject the result if

Indistinguishable from shot 06; office fronts assembling themselves; new furniture/people; breathing columns; sliding sunlight; a zoom into a completely different office.

#### Simpler fallback

Use a locked-off interior with one naturally reflective depth cue and a deliberate short hold. Label it as a hold; do not claim camera motion. The edit still needs a different shot size from 06.

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

#### MAIN MOTION PROMPT — paste this alone into I2V

```text
At blue hour, the camera makes a short slow pullback from the existing glass entrance and eases into a stable final view. The entrance becomes slightly smaller with natural depth parallax. The white facade, graphite frames, doors, planting and warm interior lights remain fixed and unchanged. No orbit or time-lapse.
```

#### SHORT ALTERNATE — substitute, do not append

```text
Slow short pullback from the fixed blue-hour entrance, then hold. Steady warm interior lights, rigid facade, no time-of-day change.
```

#### OPTIONAL TIMELINE — only for a tested compatible workflow

```text
(start: finished entrance already at blue hour) (middle: one restrained straight pullback) (end: a clean stable wide hold of the same building)
```

#### Reject the result if

Different facade or door count; daylight suddenly changing; rapidly switching lights; drone lift or spinning orbit; melted frame divisions; a generated CGC logo; a fake customer sign.

#### Simpler fallback

A fixed wide ending with no generated camera move, or a slightly closer already-accepted entrance angle with a tiny pullback. Preserve identity over spectacle. Label any hold in the edit log.

#### Editorial cut

For the main edit, end cleanly on the wide view. Test a match cut back to 01 separately. If there is no matching dark edge, keep an intentional loop cut or produce the optional closing insert after acceptance; do not invent a looping camera teleport.

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
| Door slides or duplicates | Hinge geometry and number of simultaneous actions | Locked camera with a small opening arc; otherwise already-open-door fallback | Combine door, camera, lighting and focus moves |
| Lighting pulses | Auto enhancement, source highlights, temporal stability | Keep light fixed; compare without enhancement if currently active | Add animated glints and exposure ramps |
| Building changes across shots | Keyframes, matching viewpoints, reference use | Re-establish common architecture before any more video | Hide incompatible columns with dissolves |
| Motion too fast | Actual native FPS/duration and selected edit range | Generate a smaller travel at the same native timing; retain a gentler segment | Relabel FPS and unintentionally change duration |
| Ghosted glass edges after interpolation | Compare native output against processed output | Remove the interpolation and inspect cadence, or process only a proven-stable clip | Treat processing artifacts as original geometry |
| GPU memory failure | Supported size, source length and installed offload options | Use the app's working lower-cost preset for this model on a duplicated task | Download arbitrary optimizers or force 4K |
| Different model looks like a different film | Accepted keyframe, motion, grade and model baseline | Re-run the same calibration trio and one matching shot before switching production | Spread all eight shots across untested models |

Keep the model's exported defaults for the first controlled comparison. If a baseline is already a custom accelerated preset, record it and its dependencies. Do not assume distilled and full models share step/guidance settings. Change only an exposed, supported setting and keep a record of what changed.

## 12. Review rubric and stop rules

Review each candidate at normal speed, then frame by frame at delivery scale. Use a table with one row per candidate. Score 0, 1 or 2 for each category:

- Geometry: 0 bends/additions; 1 a questionable detail; 2 rigid, credible structure.
- Motion: 0 wrong/missing; 1 partially readable; 2 the specified move is clearly visible.
- Continuity: 0 different building/materials; 1 an uncertain match; 2 a clear match to accepted keyframes.
- Temporal quality: 0 flicker/ghosting/melting; 1 a questionable moment; 2 stable throughout the retained range.
- Edit usefulness: 0 no usable start/end; 1 a limited cut; 2 a clean two-second range with useful handles.

Accept only 9/10 or 10/10 with geometry and temporal quality both 2/2 and no obvious wrong action. A pretty frame does not compensate for a bad hinge. A high score is an operator judgment, not an automated proof.

Try one baseline and no more than two planned revisions of a failed shot before using its simpler fallback or changing to another already-installed, tested model. Record the reason. Do not keep regenerating a vague prompt and hoping the next seed fixes every problem.

Stop and report a dependency if the installed workflow cannot condition on an image or produce a stable camera move. Do not substitute an animated still crop and label it generated scene motion. A 2D animatic is allowed only if explicitly identified as a temporary edit preview.

## 13. Assembly and cuts

Final main edit: S01 00:00–00:02; S02 00:02–00:04; S03 00:04–00:06; S04 00:06–00:08; S05 00:08–00:10; S06 00:10–00:12; S07 00:12–00:14; S08 00:14–00:16.

Cut by shape and movement, not by an automatic transition preset. The glass edge leads to the reflection; a dark mullion leads to the joint; a horizontal seam leads to the threshold; the threshold leads to the open door; the jamb masks the passage; the passage opens into the interior; a deliberate cut changes daylight to blue hour.

Use hard cuts first. Add a practical mullion wipe only where the actual accepted clip provides the occluding edge. Do not invent a wipe that reveals incompatible architecture. A dissolve between the day interior and blue-hour exterior should not make columns or door handles double up.

If a shot cannot supply two stable seconds, use the simpler replacement or adjust the edit honestly. Do not repeat frozen frames for half the shot without documenting the hold. The final sequence should show a real progression in shot size and space; adjacent shots 06 and 07 must not be two indistinguishable corridor pushes.

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
CGC_Threshold_v3/
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

Candidate log columns: shot, version, model, seed, start image, main/short prompt, changed variable, source FPS, source frames, score, rejected defect, accepted in, accepted out, reviewer note. Label unknowns instead of inventing values.

## 18. Website integration — after the generated film is accepted

The current CGC site is white, graphite and steel blue. Its hero already contains the generated Reflection Run film and a concept poster, but the user wants a better-directed replacement. Generate the new Threshold film, inspect it and install it as required by section 0. Existing film playback is not proof that this replacement task is complete.

If the repository is available, read `cgc/STATUS.md` and `cgc/_work/architectural.py`. The site is under `cgc/site/`. Build changes through the current generator; editing the HTML alone will be overwritten on rebuild. Preserve facts from BRIEF.md, exact consent copy, unchecked SMS consent, form payload/API schema, gallery evidence, legal links, CRM and SEO.

Keep the generated-concept disclosure visible. Never place synthetic footage in the real-work gallery as if it documented a CGC job. Keep the supplied logo unchanged. Website copy must not claim awards, client results, years or statistics not in the brief.

Hero requirements: poster first; muted playsinline video; working pause/play and captions; pause off-screen or when the tab is hidden; no autoplay or automatic hero-video loading for reduced-motion visitors; stable dimensions; readable HTML headline; no loading gate or scroll trap; no flashing.

After installation, perform the targeted hero smoke checks in section 0. Check the desktop and phone crops with the real HTML text and controls, pause/play, CC, reduced-motion/static fallback and whether the new files actually play. Do not run Lighthouse or general website audits as part of this video-production task.

Commit small changes on the current branch. Do not push, change DNS, change Deployment Protection, create or enter credentials, attach domains or promote production. No messages or publishing to other services are authorized by this handoff.

## 19. What Rebuff must return

Calibration, clean-keyframe review and edit review are internal checkpoints. Complete them and continue without stopping for routine approval. The final delivery is the accepted generated film installed and verified in the CGC hero, plus web assets, posters, captions, settings exports and edit manifest. Intermediate reports do not complete the task.

If a shot uses the fallback, say which one and why. If a workflow cannot run, say exactly what is missing. If a file is only a plan, an animatic or a still, label it that way. Do not say video is generated until playable video files exist and have been inspected.

The standard is a coherent entrance film with visible, purposeful movement and rigid, believable glass architecture. The standard is not eight pretty images with unrelated animation.
