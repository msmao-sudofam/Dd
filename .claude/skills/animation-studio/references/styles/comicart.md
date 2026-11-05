# Comic Art — reusable art direction

Comic Art, animated pop-art panels with ink and Ben-Day print textures.

## Signature and non-negotiables
- Strong black ink outlines, flat red/blue/yellow/cream/black forms, Ben-Day halftone shading, bold panel compositions and punchy held poses.
- Panel borders, speedlines, starbursts, speech bubbles and onomatopoeia are **narrative devices**, not mandatory decorations. One full-frame cinematic comic shot is allowed; use panels when a juxtaposition adds meaning.
- Edges are inked and slightly imperfect; print-dot shading conveys depth without soft gradients.
## Adapt visuals to any script
- Each scene must depict specific action/story subjects, not only generic superhero faces. For explainers, divide the argument into contrasted panels (before/after, wrong/right, process stages); for human narratives, use expressive characters and compositional tension.
- Adapt palette harmonies to readability; keep a comic printing identity even if a brand color must be represented.
- Speech bubbles, labels or sound words are allowed as story devices without subtitles; do not insert invented spoken dialogue when captions are off or user requested no text.
## Motion language
- Snappy pop-in, panel wipes, hard cuts, impact holds, directional ink speed lines. Use dramatic changes only where script delivers a cause or surprise.
## Captions, if enabled
- Short narration boxes and/or clear comic bubbles. Synchronize actual supplied words rather than making up promotional slogans.
## Failure checks
- No generic yellow burst in every shot, no randomly generated dialogue, no UI text overlapping comic frames and no weak thin outlines.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Build panels in SVG or Canvas with thick near-black strokes (around 8-12 px at 1080 width), clipped panel contents, a limited bold print palette and no photoreal gradients.
- Ben-Day dots may use a 24 px grid with offset rows and 5-8 px dot radii at 1080-wide design scale; reduce density at mobile scale so important faces remain visible.
- Reserve jagged starburst/SFX lettering for impacts; use held poses and abrupt compositions rather than random elastic deformation. Print texture should complement, not obscure, key details.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
