# Chalkboard — reusable art direction

Chalkboard Style, hand-drawn chalk educational animation.

## Signature and non-negotiables
- Authentic blackboard/greenboard surface, eraser residue and chalk dust with visible, slightly broken chalk strokes. Create outlines with layered near-identical jittered passes, irregular edges and sparse grain — not clean vector lines.
- Progressively **draw concepts into existence**; reveal strokes, circle crucial parts, add arrows and handwritten annotations. Hatching creates mass rather than glossy shading. Colors remain restrained: ivory chalk with optional yellow, cyan or pink accent when they improve explanation.
- An actual wooden frame/tray/eraser is OPTIONAL; only show them when composition benefits. Avoid wasting small vertical frames on a giant permanent border.
## Adapt visuals to any script
- Convert people/places/objects into easily recognizable chalk diagrams, with distinct silhouette/props and contextual settings. A science explanation could use formulas and labeled diagrams; a narrative could use story panels, location sketches and character actions.
- Do not reduce every script to generic stick figures and arrows. Illustrations should depict the named subjects, with just enough chalk detail to prove the statement.
- Use visual metaphors only when direct depiction would be unclear.
## Motion language
- Line draws, hand-sketch wobble, chalk flick, cross-hatching reveal, selective eraser wipe; pacing follows narration, not continuous random scribbling.
## Captions, if enabled
- Handwritten chalk lettering with grain and just a few words per phrase. On-screen labels/formulas are allowed even with captions off when essential to teaching.
## Failure checks
- No perfect vector curves, smooth filled gradients, unreadable text, too much noisy flicker, or gratuitous chalk tray obscuring the action.

## Procedural implementation notes (starting points, not hardcoded scene content)
- A greenboard base may use `#2f4538` to `#253a2e` with subtle eraser smudges. Draw 3 overlapping chalk strokes: e.g., main stroke alpha 0.85, two imperfect thinner passes alpha ~0.45 at jitter ±1-2 screen-space px (scaled to canvas); stable jitter in groups of 2 frames.
- Composite speckled noise using destination-out on the chalk-only layer; retain readable white ivory contours; soft dust glow from a low-opacity blurred duplicate. Reuse precomputed grain layers rather than creating 90,000 random dots every frame.
- Reveal path points progressively (`getPointAtLength`), then hatch shadows with diagonal strokes clipped to object. Prefer contextual diagram labels and drawn arrows to random decorative scribbles.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
