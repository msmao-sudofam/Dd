# Flat Vector — reusable art direction

Flat Vector, clean layered 2D editorial illustration animation.

## Signature and non-negotiables
- Sophisticated **shape design**, large clean silhouette masses, 2–3 flat-value planes per object, almost no outlines, no photoreal gradient shading; subtle grain is optional and should not undermine crispness.
- Roundness is **content-dependent**, not universal: use crisp forms for devices, architecture or technical scenes; use softer curves for editorial people. Strong hierarchy, careful negative space, consistent shape vocabulary.
- Colors are a coherent limited palette based on topic and brand, not always navy/orange/red.
## Adapt visuals to any script
- Depict actual things and causality with tailored sets, characters, diagrams, UI mock-ups and props. Simplify details without making the wrong object; demonstrate factual relationships using position, scale and movement.
- Plan different compositions across scenes: wide establishing shot, close-up explanatory detail, object transformation, process steps and scene-specific backgrounds as appropriate.
## Motion language
- Polished easing, masked reveals, shape morphs, parallax pans and deliberate camera moves. Avoid visual clutter and endless bouncing widgets.
## Captions, if enabled
- Readable modern bold sans-serif type, limited words at once, aligned to safe zone. No forced pill background unless visual contrast calls for it.
## Failure checks
- No dark vector outlines everywhere, faux 3D shine, gradients masquerading as flat color, generic stock-illustration people, or palette-only changes to one template.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Construct all visible volume from solid-color shapes and 2-3 clipped shade planes: a darker shadow mass, base mass and restrained light plane; avoid lighting gradients and bevel effects.
- Choose 6-8 related colors by visual purpose: background family, readable skin/material values, two role-specific accents, with one clear focal accent. Low-opacity reusable grain (~3-6%) can unify layers without looking dirty.
- Morph silhouette curves using explicit intermediate shapes, masked reveals and clean 2D camera parallax. Layout decisions should derive from actual script elements and aspect ratio.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
