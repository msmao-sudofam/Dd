# ZackD Films — reusable art direction

ZackD Films-inspired smooth stylized 3D educational short animation.

## Signature and non-negotiables
- Cinematic **rounded 3D explainer look**: appealing exaggerated but recognizable forms, smooth vinyl/clay-like materials, soft controlled lighting and readable depth. Rounded does not mean turning every object into an amorphous toy.
- Use recognizable proportions and identity detail in humans, machines, vehicles and creatures. Characters can have expressive eyes/face and readable gestures; exact anatomy should remain sufficiently faithful when an educational claim requires it.
- Warm bright daylight is one option, not a rule. Choose laboratory, room, outdoors, darkness, nighttime, microscopic setting or historical place according to script while preserving soft 3D surface treatment.
## Adapt visuals to any script
- Convert narration into simple *demonstrations*: cutaways, close-up of mechanism, cause/effect comparison, hero framing of the relevant object and a satisfying reveal. Actual on-screen details must relate to what the narration says.
- Distinguish this style from plain CGI Motion: more graphic forms, simpler cleaner environments, friendly surface softness, and quicker educational cutaways rather than glossy high-end commercial photography.
## Motion language
- Smooth cinematic edits between detail shots and 3/4 shots, restrained handheld drift, crisp purposeful object animation, soft smoke/particles only when action needs them.
## Captions, if enabled
- A few words at a time in readable, bold unobtrusive type; preserve composition and avoid obscuring illustrated anatomy or key mechanisms.
## Failure checks
- No bland spheres in place of recognizable subjects, harsh depth-of-field blur hiding the story, impossible proportions, overly aggressive expression or generic repeated outdoor hills.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Soft-but-readable three.js 3D, well-rounded bevels, hero objects using `MeshPhysicalMaterial` (starting roughness ~0.42, clearcoat ~0.35, adjustable); matte supporting environment, broad soft shadows and mildly warm key light.
- Favor simple educational camera grammar: one wider establishing action, then focused mechanism/details, then payoff. Use depth of field with focus on the described object (when supported), rather than globally blurring the frame.
- Use soft smoke sprites and occasional vignette only when relevant. Ensure surface contrast, facial articulation and geometry make the subject recognizable at 9:16 phone size.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
