# PS2 Style — reusable art direction

PS2-style early-2000s low-poly game cutscene animation.

## Signature and non-negotiables
- Clearly **low-poly 3D** character/object geometry, box/cylinder/extrusion silhouettes, period-appropriate low-resolution textures, simple Lambert-style lighting, limited shadow complexity and a lower-resolution internal render composited to output.
- Feature soft bilinear upscaling and modest banding/dither; don't confuse PS2-era aesthetics with sharp modern voxel art or hyper-real PBR. Faces and props should have deliberately limited texture detail but remain identifiable.
- Distinguish setting from style: not every topic needs dusk skies, pink fog or an empty plaza. Recreate the actual script environment with retro game-design language.
## Adapt visuals to any script
- Characters may have painted facial texture, blocky hair and rigged simple joints; give characters distinctive clothing, posture, and important facial/prop features so the audience recognizes them across shots.
- Architecture, product models, interfaces and vehicles should have recognizable shape first; poly reduction is a constraint on the *depicted subject*, not an excuse to substitute wrong objects.
- If a subject requires detailed realism, prioritize understandable low-poly shape and disclose that it's stylistic, not a scan.
## Motion language
- Game-cutscene framing: slightly mechanical walk cycles, over-the-shoulder shots, limited but deliberate camera push, small low-poly impact particles and simple keyframe acting.
## Captions, if enabled
- Retro game-style subtitling, readable border/drop shadow, naturally fitted to aspect. Avoid HUDs unless requested or story needs game mechanics.
## Failure checks
- No high-poly glossy plastic, pure pixel-art sprites, texture noise hiding subject, or mismatched identity between shots.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Render low-poly WebGL at about 1/4 of output dimensions (e.g. 270x480 for 9:16) with `antialias:false`, 16-64 pixel procedural textures, intentionally limited texture filtering, simple 5-8-sided cylinders, boxes and hard faceting.
- Optional 15-bit color emulation: quantize RGB in steps of 8 with light ordered dithering, then bilinear upscale to full output. Preserve distinguishable model shapes despite softness.
- Prefer flat Lambert-like materials, strong ambient and one directional light, painted shadow blobs, inexpensive sprite dust. Use fog, cutscene wobble, and textured face cards only when the subject requires them.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
