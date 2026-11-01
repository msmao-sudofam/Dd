# IN PLAIN SIGHT

## A separate CGC film concept / November 1, 2026

An open-looking meeting area becomes a clearly defined glass room as the camera changes position. The glass never appears, disappears or assembles. It is present throughout; the view reveals it through its edge, channel, reflection and depth.

The Threshold is an entrance journey. This film is an interior-glass story about an almost-invisible boundary. It highlights CGC's verified interior glass and office-front scope without pretending that the generated room is a completed CGC project.

**Creative line:** Clear divisions. Open sightlines.

**Film:** six shots, 16 seconds, silent website master. Edit at 24fps, 384 frames. Desktop 16:9 and a separately considered phone 9:16 composition. White, graphite and restrained steel-blue reflections. Soft late-morning daylight throughout; no day/night change and no moving-door action.

## Scope and relationship to the other film

This is an alternate concept package, not a replacement for the strict Threshold v4 assignment. Do not use it to skip Threshold's hinged-door requirement or silently swap the active hero. If the owner selects this new concept for production, execute these six shots and apply the same strict acceptance standard. The present package contains generated still images and direction, not generated video.

## Why the first two shots matter

The first shot looks through a nearly reflection-free pane at a meeting table. Narrow framing keeps most channels at the edges so the space initially reads as open. The second shot changes viewpoint and exposes the corner/channel. That is the reveal: the room was enclosed all along, but the sightline remained open.

Do not make the model remove a wall, fade glass in, draw a luminous outline, assemble a room, or change transparency independently of viewpoint. A physical glass boundary must remain consistent. The lighting, table and chairs do not move.

## Visual continuity anchor

Use the new embedded room reference: a full-height rectangular clear-glass conference enclosure, narrow graphite top and bottom channels, a pale oak table and six graphite chairs inside, white square columns, exposed white beams, black linear ceiling lights and pale terrazzo continuing through the enclosure. Exterior windows and tree/sky views are on the left.

The far-end door stays closed and motionless in all shots. Do not add people, screens, signage, customer branding or a different furniture plan. Do not invent acoustic, fire, structural or performance specifications. This is a visual concept, not a shop drawing or a verified client installation.

The board is a guide to composition, not an image-to-video input. Generate clean full-resolution unnumbered keyframes using the room reference. Inspect counts, channels, corners and the door before generating motion. Do not upscale a tiny numbered board panel and call it the final keyframe.

## The rhythm

The film alternates wide space and precise detail. Shots 01 and 02 establish the idea; 03 makes the glazing trade tangible; 04 holds both reflection and the view through the pane; 05 changes to an interior viewpoint; 06 resolves the whole enclosure.

Each source generation contains one continuous camera move. Each cut is an editorial cut between separately generated clips. Do not ask a single video generation to discover six camera positions or pass through solid glass.

## Production model and short tests

When selected for production, use the installed Wan2GP at `C:/pinokio/api/wan.git/app`, starting with MiniMax H3 FL2VA Pruned using `defaults/minimax_h3_fl2va_pruned.json`. The transformer file was verified locally at `ckpts/MiniMax-H3-FL2VA-pruned_rank8_int8_convrot.safetensors`; runtime loading must still be proved. GPU: RTX 5080, 16,303 MiB VRAM. Use the installed supported offload configuration; do not assume a 19.61 GiB weight file fits wholly on the GPU.

Export the actual model settings. Do not copy the older A14B/5B step, guidance or LoRA configuration into H3. Do not upgrade software, download alternate models, call paid/cloud generators or enter credentials as an unannounced workaround. Use a real supported local UI/API/queue and preserve existing render files.

Test P02's corner truck and P04's reflected/transmitted view first. They prove this film's central visual claim. The model must preserve one glass plane while camera translation creates coherent depth and optical changes. If both pass, generate the full six-shot set. If either fails, repair the keyframe or supported conditioning and rerender the same action. No wrong-camera substitute or still-image edit can pass.

This concept intentionally has no door-opening action. That is its own script, not a fallback permission for a film that does require one.

## How to use the prompts

Use CLEAN KEYFRAME to create the starting image. Use H3 MOTION as one complete local-model prompt for that shot. BASE MOTION is the same action without the H3 wrapper; SHORT MOTION is a simpler wording, not a different shot. Do not paste this entire production package into the video model.

H3 prompt fields follow the structure found in the installed FL2VA template: integrated_multimodal_description, overall_soundscape and non_diegetic_music. Keep the shot silent in the website delivery; native source audio can be removed in editing.

Use the model's legal native dimensions, source FPS and frame count. Aim for a source of roughly four seconds where supported, with useful lead/trail handles. The final edit has a two-second P01, three-second P02, two-second P03, and three seconds each for P04–P06. Do not force invalid durations or change playback rate accidentally just to hit those edit lengths.

## Six detailed shot cards

### P01 / At first glance

Final edit: 00–02 seconds / frames 0–47 / 48 edited frames at 24fps.

#### Story beat

Establish the open sightline before emphasizing the glass. The pane is already present.

#### Clean start composition

Straight-on medium view from outside the glass wall toward the meeting table. Most top/bottom channels are near the edge of the composition, but the same pane, table and room remain physically present.

#### What stays fixed

Glass, channels, door, furniture, floor, columns, lights and sun direction. No animated opacity.

#### Required camera move

A short straight forward camera push, ending OUTSIDE the fixed glass plane. Show modest real depth parallax; do not cross the pane or substitute lens zoom.

#### Required finish

Slightly closer view of the same table through the same clear pane. The camera has not entered the room.

#### CLEAN KEYFRAME

```text
Photorealistic straight-on medium view from outside an existing clear glass conference wall toward the pale oak table and six graphite chairs of the supplied room reference. Most channels sit near the image edges, so the view feels open, but glass remains installed. White beams, pale terrazzo, left-side windows and soft daylight match the reference. Clean 16:9, no people, text or borders.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera makes one short smooth push forward toward the fixed clear conference wall, stopping outside the glass. The table grows modestly in view with natural near/far parallax. All glass, channels, chairs and lighting remain fixed. No zoom and no movement through the pane. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
The camera makes one short smooth push forward toward the fixed clear conference wall, stopping outside the glass. The table grows modestly in view with natural near/far parallax. All glass, channels, chairs and lighting remain fixed. No zoom and no movement through the pane.
```

#### SHORT MOTION — same action

```text
Short forward dolly toward the fixed glass wall, stopping outside it. Natural depth parallax, stable room, fixed lens.
```

#### Reject if

Camera passes through glass; glass disappears; table/chair count changes; whole-frame digital scaling; no forward travel.

#### Recovery — same action only

Repair the camera start/path and shorten travel while retaining a real forward dolly outside the pane. Rerender the same action; no held plate.

#### Edit transition

Cut to a different exterior angle in P02. Do not morph the wall or pretend the two shots are one continuous camera take.

#### Phone composition

Center the table sightline and keep enough frame context to establish a meeting room.

### P02 / Give it an edge

Final edit: 02–05 seconds / frames 48–119 / 72 edited frames at 24fps.

#### Story beat

Reveal the glass boundary through a shift in viewpoint. This is the principal qualification shot.

#### Clean start composition

Exterior three-quarter view with a near vertical glass corner around x=70%, table deeper behind it and the floor channel visible. The corner is real, not a line drawn onto the image.

#### What stays fixed

All panes, corner junctions, channels, furniture, door, window views and daylight.

#### Required camera move

True rightward camera truck with fixed orientation. The near glass corner drifts left toward x=55–60%, with greater displacement than the distant table. No orbit, pan or independent glass-opacity animation.

#### Required finish

The corner/channel is unmistakable while the view through the pane remains open. Room identity is unchanged.

#### CLEAN KEYFRAME

```text
Photorealistic exterior three-quarter close view of the same clear glass conference room. A sharp real glass corner is near the right side; narrow graphite floor channel and table behind it provide depth. Same pale oak table, graphite chairs, terrazzo, white columns and left windows. Subtle coherent reflection and transmission, not an opaque mirror. Clean 16:9, no drawn outlines or text.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera trucks smoothly to the right beside the fixed glass room. The nearby glass corner and floor channel drift left in the image faster than the table behind them. The pane remains clear, rigid and installed throughout. One level lateral translation with fixed orientation and steady daylight; no zoom or opacity change. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
The camera trucks smoothly to the right beside the fixed glass room. The nearby glass corner and floor channel drift left in the image faster than the table behind them. The pane remains clear, rigid and installed throughout. One level lateral translation with fixed orientation and steady daylight; no zoom or opacity change.
```

#### SHORT MOTION — same action

```text
Rightward truck past the fixed glass corner. The near corner drifts left more than the far table. Rigid transparent glass, fixed lens.
```

#### Reject if

Only a pan or zoom; glowing/drawn edge; glass appearing or vanishing; corner bending; furniture shifting; camera moving the wrong direction.

#### Recovery — same action only

Strengthen near/far cues in a repaired keyframe and use the same rightward movement with supported camera/endpoint control if available. Rerender; do not fade in the glass to fake the reveal.

#### Edit transition

Match the corner’s base to the floor-channel detail in P03 with a clean cut.

#### Phone composition

Keep the corner near center and the table visible behind it. Do not crop away the depth relationship.

### P03 / The quiet detail

Final edit: 05–07 seconds / frames 120–167 / 48 edited frames at 24fps.

#### Story beat

Show the physical craft behind the almost-invisible boundary.

#### Clean start composition

Low macro of the clear pane seated in a narrow graphite floor channel, with a believable corner or joint and continuous pale terrazzo on both sides.

#### What stays fixed

Pane thickness, channel profile, joint location, floor aggregate and lighting. No installation action.

#### Required camera move

One small rightward camera slide along the channel at a constant low height. Near joint moves left against more distant floor detail. Fixed focus; no simultaneous tilt or light sweep.

#### Required finish

A slightly shifted view of the same physical joint, retaining the glass seated in the channel.

#### CLEAN KEYFRAME

```text
Photorealistic low macro of the supplied conference-room glass meeting its narrow graphite floor channel at a precise corner. Fine clear-glass thickness, realistic seated edge, pale terrazzo continuous inside and outside. Fixed soft daylight and true material texture. Clean 16:9 with enough depth for a short lateral slide, no tools, people, text, glowing edge or border.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The low camera slides slowly to the right along the stationary graphite glass channel. The nearby joint moves left with gentle depth parallax against the terrazzo. The pane, seated edge and channel remain rigid and unchanged. Fixed camera height, focus and lighting; one short lateral move. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
The low camera slides slowly to the right along the stationary graphite glass channel. The nearby joint moves left with gentle depth parallax against the terrazzo. The pane, seated edge and channel remain rigid and unchanged. Fixed camera height, focus and lighting; one short lateral move.
```

#### SHORT MOTION — same action

```text
Low rightward slider move along the fixed glass channel. Near joint drifts left; rigid materials, fixed focus and light.
```

#### Reject if

Channel reshapes; glass levitates or becomes a blade; floor swims; digital pan over one still; tilt replaces the slide.

#### Recovery — same action only

Repair the joint/texture keyframe and reduce travel while retaining a true lateral camera slide. No static macro substitute.

#### Edit transition

Cut from the channel line to a longer glass plane in P04, preserving the graphite/clear material contrast.

#### Phone composition

Retain the pane, seated edge and channel together; avoid a crop containing only blank floor.

### P04 / Two views, one pane

Final edit: 07–10 seconds / frames 168–239 / 72 edited frames at 24fps.

#### Story beat

Show reflected exterior trees and transmitted meeting-room space in the same glass surface.

#### Clean start composition

Long oblique corridor view along the fixed conference glass. A near channel/edge anchors the foreground. Left-side window/tree reflections and the table beyond the pane are both legible.

#### What stays fixed

Room topology, pane, table/chairs, exterior trees and light. No wind or separate reflection-texture animation in the base version.

#### Required camera move

Rightward camera truck parallel to the glass plane. Near fixed frame shifts left more than distant room features; reflections change coherently with viewpoint. Keep both transmission and reflection recognizable.

#### Required finish

A different view angle along the same pane, with the same room visible behind the reflection. The glass is not uniformly opaque.

#### CLEAN KEYFRAME

```text
Photorealistic long oblique corridor view along the same conference enclosure. Thin graphite edge in the near foreground, tree and window reflections visible on the clear pane, pale oak table and graphite chairs visible through it. White beams, columns and terrazzo match the reference. Restrained real optics, no independent mirror wall, text, people or border. Landscape 16:9.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera trucks slowly to the right parallel to the fixed glass wall. The near graphite edge drifts left more than the distant table. Reflections of the left-side windows and trees shift naturally with viewpoint while the meeting room remains visible through the rigid pane. Steady light and fixed lens; no separate reflection sweep or zoom. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
The camera trucks slowly to the right parallel to the fixed glass wall. The near graphite edge drifts left more than the distant table. Reflections of the left-side windows and trees shift naturally with viewpoint while the meeting room remains visible through the rigid pane. Steady light and fixed lens; no separate reflection sweep or zoom.
```

#### SHORT MOTION — same action

```text
Rightward truck along clear fixed glass. Coherent reflection parallax and visible room beyond; rigid framing and steady light.
```

#### Reject if

Watery glass; room disappears behind an opaque mirror; reflections slide independently; tree duplicates; wrong camera move or changing channel widths.

#### Recovery — same action only

Simplify the reflection in a repaired keyframe and reduce travel while preserving a true rightward truck and both optical layers. Re-render; no 2D reflection overlay.

#### Edit transition

Cut to the inside viewpoint in P05. Make the new camera position clear; never travel through the intact pane.

#### Phone composition

Show one near edge plus enough transmitted table and reflected window to preserve the idea.

### P05 / Inside the line

Final edit: 10–13 seconds / frames 240–311 / 72 edited frames at 24fps.

#### Story beat

Reverse the point of view: enclosure does not end the sightline.

#### Clean start composition

Camera already inside the same conference room, looking outward through its clear glass toward the open office. A portion of the same oak table is in foreground; white columns/window geometry re-establish the view.

#### What stays fixed

All furniture, door, glass, open-office layout and daylight. No moving person or opening door.

#### Required camera move

A short LEFTWARD camera truck inside the room. Foreground table edge shifts right more than distant office columns. Fixed camera orientation. This deliberate view change occurs at a cut, not by passing through glass.

#### Required finish

A shifted inside view with a clear sightline through the same fixed pane to the office. No newly invented room.

#### CLEAN KEYFRAME

```text
Photorealistic interior viewpoint from inside the reference conference room, looking out through stationary clear glass into the same bright office. Small part of the pale oak table in near foreground, white square columns and left-side exterior windows beyond, graphite glass channels matching the reference. Stable layout and soft late-morning light. Clean 16:9, no people, signs, borders or extra furniture.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. Inside the conference room, the camera trucks gently to the left. The nearby oak table edge moves right in the image faster than the distant office columns. The glass wall, closed door, chairs and lighting stay fixed. Maintain an open clear sightline and one level lateral translation; no forward passage or zoom. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
Inside the conference room, the camera trucks gently to the left. The nearby oak table edge moves right in the image faster than the distant office columns. The glass wall, closed door, chairs and lighting stay fixed. Maintain an open clear sightline and one level lateral translation; no forward passage or zoom.
```

#### SHORT MOTION — same action

```text
Short leftward camera truck inside the fixed room. Near table shifts right more than far columns. Clear glass, stable layout, fixed lens.
```

#### Reject if

Camera trucks right; room layout changes; glass disappears; table slides itself; door opens; uniform whole-image shift without parallax.

#### Recovery — same action only

Repair foreground/background depth cues and re-render the same LEFTWARD truck. Do not substitute a second forward corridor move or a held interior plate.

#### Edit transition

Cut back outside to a wide view in P06, matching the room’s material and furniture arrangement.

#### Phone composition

Keep a near table edge and at least one distant column or window cue visible through the glazing.

### P06 / A room in plain sight

Final edit: 13–16 seconds / frames 312–383 / 72 edited frames at 24fps.

#### Story beat

Resolve the complete glass room and the connected open office as the final architectural image.

#### Clean start composition

Wide exterior three-quarter view of the entire same enclosure and adjacent corridor, close to the clean reference. A foreground planter or column edge provides a near-depth cue. Table, six chairs, channels and far door are stable.

#### What stays fixed

Entire room, closed door, hardware, furniture, plants, column spacing and lighting.

#### Required camera move

One restrained straight pullback away from the enclosure. The near foreground feature changes position/scale faster than the room; the enclosure becomes modestly smaller with true perspective parallax. No orbit, crane rise or image-only scaling.

#### Required finish

The complete enclosure and more corridor visible. A brief natural settle after the actual pullback is allowed; a still-image ending is not.

#### CLEAN KEYFRAME

```text
Photorealistic wide exterior three-quarter view of the complete glass conference enclosure from the supplied reference. Same oak table and six graphite chairs, slim graphite top/floor channels, stationary far door, pale terrazzo, white square columns and exposed beams. Left windows and restrained tree reflections; a near planter or column edge for depth. Beautiful soft late-morning daylight, clean 16:9, no people, signs, text or border.
```

#### H3 MOTION — primary prompt

```text
integrated_multimodal_description: [Shot 1] One continuous photorealistic architectural shot from the supplied clean first frame. The camera makes one short smooth pullback from the complete glass conference room. A near planter or column edge shifts more than the enclosure, creating real depth parallax as the room becomes slightly smaller. Every glass pane, channel, chair and the closed door stays fixed. Level view, fixed lens, steady light; finish with a brief natural settle. The glass is already installed and the door remains closed. Preserve the same room and furniture. No scene change, digital still-image transformation or extra action.
overall_soundscape: Quiet interior room tone. No speech.
non_diegetic_music: None.
```

#### BASE MOTION

```text
The camera makes one short smooth pullback from the complete glass conference room. A near planter or column edge shifts more than the enclosure, creating real depth parallax as the room becomes slightly smaller. Every glass pane, channel, chair and the closed door stays fixed. Level view, fixed lens, steady light; finish with a brief natural settle.
```

#### SHORT MOTION — same action

```text
Short straight pullback from the fixed glass room. Visible near/far parallax, rigid enclosure, steady light. No image-only zoom.
```

#### Reject if

Whole still scales uniformly; door swings; chairs multiply; room grows or changes bay widths; orbit or crane replaces the pullback.

#### Recovery — same action only

Use a consistent endpoint and a simpler near-depth cue, then rerender the genuine pullback. Do not make a held ending or Ken Burns zoom.

#### Edit transition

End on the real generated wide view. A clean intentional cut back to P01 can form the website loop; do not dissolve away the glass.

#### Phone composition

Compose the enclosure and table around the portrait center; show one complete glass corner and enough floor/corridor to read the room.

## Strict visual acceptance

Every shot must pass: correct subject/composition; correct camera action and direction; rigid glass/frame/channel geometry; unchanged room identity/furniture; stable light and reflections; genuine generated scene motion. A pretty frame does not waive a failed move. A digital zoom cannot stand in for a truck or pullback.

Watch the full clip at normal speed and scrub the retained section frame by frame. Inspect first, quarter, middle, three-quarter and final frames too. Those sampled frames assist review; they do not replace watching the movement. Check near and far features for coherent parallax, not uniform whole-image scaling.

No held plates, Ken Burns effects, still-image pans, reverse playback to disguise wrong direction, changing room geometry or optical-flow smoothing to hide a failure. A brief natural settle after a real move is allowed; a shot built from one frame is not. Correct the input, concise prompt or supported control and rerender the same action. After bounded controlled attempts, report the exact unmet requirement rather than quietly relaxing the script.

Keep native source clips and a per-shot review record: required action, observed action, settings/seed, changed variable, pass/fail gates, accepted in/out and defects. Do not use a compression score or website audit as creative-quality evidence.

## Edit and sound

Use clean shape/depth cuts. The first direct view cuts to the corner reveal; the corner cuts to the floor-channel macro; the channel cuts to a long glass-plane reflection; the outside view cuts to an inside viewpoint; the last cut returns outside to resolve the full room.

Do not morph one room layout into another or make channels/doors dissolve between shots. Keep the table and chair arrangement recognizable. Match the white balance and daylight. Do not ask a model to independently animate light, glass opacity and camera position at once.

The website film is silent. For an optional social edit, use restrained original/licensed room tone and one soft tonal change at the corner reveal, not fake installation sounds. No generated speech is needed. Keep CGC's actual logo and any words in post-production or live HTML, never generated into the architecture.

Optional live-HTML copy: “Clear divisions. Open sightlines.” Primary action can remain “Send plans for a bid.” These are conceptual descriptions, not claims about a completed job or a new company slogan that must replace existing copy.

## Crop and loop

For phone, the same-height 9:16 crop retains only the central 31.6% of a 16:9 frame. Check the actual crop on every keyframe. If the glass corner, floor channel or near/far relationship disappears, make a separately composed portrait keyframe. Do not squeeze the room or add automatic reframing that fights the generated move.

The main 16-second edit can end with a real pullback settling briefly on the room. For a loop, test an intentional cut from the resolved room to the first direct sightline. Do not force a magical continuous orbit or fade the glass away. A clean deliberate edit is allowed; falsely claiming a perfect loop is not.

## Web delivery and installation, if selected

Produce a silent 1600×900 desktop master and a 720×1280 phone version, 24fps, 16 seconds / 384 frames. Generate at native supported sizes first; the delivery targets are not a claim that every model natively supports them. MP4 H.264 yuv420p with faststart; WebM if practical. Aim for roughly ≤4MB desktop and ≤3MB phone without destroying thin edges. Compress only after the generated motion passes.

Use clean posters from the accepted film, matching the actual first image/crop. Suggested captions, revised to the accepted edit:

```text
00:00–00:05: A clear view of a meeting table; the camera shifts and reveals the glass corner.
00:05–00:07: Close detail of clear glass seated in its graphite floor channel.
00:07–00:10: Trees reflect in the pane while the meeting room remains visible through it.
00:10–00:13: From inside the enclosure, sightlines continue into the open office.
00:13–00:16: The camera pulls back to reveal the complete glass room.
```

Use a new folder such as `cgc/site/assets/film/in-plain-sight-v1/`. Preserve all Threshold work. Update the actual generator inputs, chapter list and timing only after the owner selects this concept and every new shot passes. Unequal shot lengths mean the old two-second chapter divisor is wrong; use the boundaries 0, 2, 5, 7, 10, 13 and 16 seconds.

Keep the generated-concept disclosure visible. Keep synthetic footage separate from documented CGC work. Preserve the site palette, consent text, form, CRM and legal content. Verify the actual new media URL, playback, captions, pause/play, off-screen/hidden-tab pause and runtime reduced-motion poster on desktop and phone. No Lighthouse, poster A/B studies or unrelated website audits before generation and integration are complete. Do not push, deploy/promote production, alter DNS or Deployment Protection, create credentials or publish elsewhere under this concept brief.

## What is included now

A newly generated full-resolution room reference; a newly generated six-frame board; exact per-shot keyframe, H3 and motion prompts; edit timings; quality gates; and this one-file offline handoff. No new video was generated or installed in this concept-design task.
