# Lego Style — reusable art direction

Lego Style, generic interlocking toy-brick stop-motion-inspired 3D animation.

## Signature and non-negotiables
- Scenes assembled from physically intelligible **interlocking plastic bricks, studs, plates, slopes, hinges and cylindrical elements**, using stable stud pitch and brick height. No brand logos or exact proprietary minifigure copies unless appropriately supplied/authorized.
- Glossy injection-molded plastic with soft studio lighting, tile seams and little assembly clearances. Main subjects, sets and effects must visibly be brick-built, not ordinary smooth meshes given stud decals.
- Bright toy-brick colors are common but adapt them to the script and supplied branding; desert, sci-fi, underwater, factory, city and abstract scenes all valid.
## Adapt visuals to any script
- Maintain scale and recognizable shape of script objects by selecting suitable brick assemblies. For human action, design distinctive original brick-built figures using color, costume, hair/helmet pieces and poses.
- Signature snap-together transitions are useful for creation/build-up stories, but don't automatically rebuild the world every six seconds. Use stop-motion-like holds and controlled assembly for important transformations.
## Motion language
- Brick snapping with slight bounce, limited-hinge body articulation, physical clatter-inspired movement (no claimed audio if none supplied), stepwise smoke/debris built from rounded or translucent brick pieces.
## Captions, if enabled
- Playful, highly readable type; brick tile behind captions only when space and contrast allow. Avoid hiding studs and focal story action.
## Failure checks
- No shapeless smooth geometry, impossible brick intersections, floating studs, generic minifigure trademark copies or irrelevant construction montages.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Define consistent `studPitch = 1`, base brick height about 1.2, plate height about 0.4, and cylinders for studs (radius ~0.3, rise ~0.18). Use rounded boxes for molded bricks, coherent clearances and consistent slopes/plates.
- A plastic baseline: physical roughness ~0.28, clearcoat ~0.6. Instance repeated studs rather than thousands of independent draw calls; use constrained hinge pivots for limbs.
- Snap motion: for an actual assembly beat, animate groups of pieces dropping in a few discrete waves, with small bounced settle. Don't repeat this intro for every unrelated story beat.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
