# Glow Sketch — reusable art direction

Glow Sketch, dotted luminous line drawings on dark backgrounds.

## Signature and non-negotiables
- Near-black environment with fine luminous *dotted contour lines*, subtle solid guide line under the dots, sparsely lit interior silhouettes and restrained gold (or story-motivated warm) emphasis.
- Objects must remain recognizable from distinctive contour/feature lines; do not replace all subjects with anonymous circles. Vary dot density and contour weight to clarify important objects.
- Dark fields and edge glows create depth, but bright filled surfaces should be rare. Avoid saturating the entire scene with glow.
## Adapt visuals to any script
- Draw actual subject forms and their interactions: an engine part, person profile, software concept, molecule, building, or abstract idea using precise dotted diagrams. Let the most important narrative evidence receive the warm focal light.
- Background can be minimal or a ghosted environment suggested by a few dotted depth planes. Different scripts should produce different framing, not the same gold orb or portal.
## Motion language
- Slow contour-tracing, sparing luminous pulses, drifting parallax, expansion rings only for meaningful beats. Preserve a calm elegant energy unless action calls for acceleration.
## Captions, if enabled
- Understated sans-serif text, small phrases, soft onset, accent on one important term; keep high contrast with dark background.
## Failure checks
- Avoid pure neon tubing (must have dotted/stippled character), muddy purple-on-black contrast, excess bloom and giant decorative orbs that don't depict the script.

## Procedural implementation notes (starting points, not hardcoded scene content)
- SVG or Canvas is suitable. Start near black `#07060b`, use dotted strokes such as `stroke-dasharray="1 10"` with round caps, line weight proportional to output shape (roughly 5-6 px on 1080-wide designs).
- Add a thin continuous guide path beneath dotted contours at about half opacity, a separate blurred glow (`feGaussianBlur` ~5 on 1080 scale), and sparse dim stippling for interior details; avoid uniform thickness across all objects.
- Gold focal light can begin around `#ffc85a` and fade to transparent through a radial blur. Reserve impact rings/particles for actual story emphasis.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
