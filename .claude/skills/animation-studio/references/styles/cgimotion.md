# CGI Motion — reusable art direction

CGI Motion, cinematic 3D game-engine motion with grounded materials.

## Signature and non-negotiables
- Physically plausible 3D material response (metal, rough plastic, glass, cloth etc), deliberate cinematic lighting, spatial depth, coherent camera movement and grounded subject scale. three.js PBR and subtle postprocessing when feasible.
- The source PDF's wet dusk street and glowing skyline are **examples**, not universal requirements. Choose a scene-specific location, hour and practical lighting that makes narrative sense; indoor daylight, lab, stadium, studio, mountains, store, space or night may all be appropriate.
- Realism ceiling: procedural character geometry alone will not produce photoreal humans. When assets are absent, use stylized identifiable characters and honest expectations; prioritize correct action, shape, camera and continuity.
## Adapt visuals to any script
- Reconstruct named props/products/vehicles with recognizable silhouette and accurate distinguishing geometry before microdetail; story beats determine shot size and lighting.
- Use camera to clarify cause/action: close-up of interface/part, tracking shot for movement, wide geography when context matters. Do not impose a 3/4 low dolly on every shot.
## Motion language
- Realistic object arcs, inertia, reflections, soft volumetrics, restrained camera movement and occasional depth of field. Intense impacts only where justified.
## Captions, if enabled
- Trailer-grade bold captions only for energetic scripts; otherwise match story tone and avoid blocking visual evidence.
## Failure checks
- No default mannequin story when character identity matters, extreme bloom, mirror-black unreadable surfaces, clipped main subject, or fake realism claims.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Use three.js with `MeshPhysicalMaterial` and material-specific roughness/metalness; light with a key, fill and rim adapted to the environment, soft sensible shadows and ACES tone mapping if it improves the subject.
- Optional cinematic pass chain `RenderPass -> UnrealBloomPass -> OutputPass`; start conservatively (bloom strength around 0.35-0.5) so highlights and material boundaries remain visible. Realistic environment reflections require local light probes or procedural reflection sources.
- Reserve fog, wet reflections, volumetric dust, motion shake and shallow depth of field for scenes in which they explain space/action. Camera FOV may range ~35-65 degrees depending on shot, not universally 40.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
