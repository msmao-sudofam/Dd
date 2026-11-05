# Dan Koe Style — reusable art direction

Dan Koe-inspired minimalist monochrome 2D line-and-dot conceptual animation.

## Signature and non-negotiables
- Strictly two-dimensional **black-and-white conceptual line art**. Thin white lines, small luminous dots, sparse circles/diagram geometry and generous negative space. Absolutely no 3D mesh rendering or photographic texture.
- This is a thoughtful *visual-language influence*, not a copy of a particular existing video. Use the subject's own shapes; make diagrams and abstract relationships legible in the first viewing.
- Use constellation-like paths and orbit rings **only if they communicate the point**, not as a compulsory gimmick. Avoid filling every frame with stars and flower-of-life circles.
## Adapt visuals to any script
- A character may be a few carefully placed gesture lines, but preserve distinctive silhouette/prop and an understandable action. For ideas such as attention, money, time, thought or habits, animate relationships between two or three elements with visible causal change.
- If script names a physical item, construct an accurate reduced outline; don't reduce everything into circles that could represent anything.
## Motion language
- Quiet precise path reveals, dot travel along lines, simple transforms, slow zoom, pause for comprehension. Keep the main contrast in diagram structure, not flashing lights.
## Captions, if enabled
- Small understated white text, one concise thought at a time with clear hierarchy. Required diagram labels stay even when subtitles are off.
## Failure checks
- No gradients, noisy starfields that bury the message, pseudo-3D rotations, identical sacred-geometry graphics regardless of topic, or invisible thin strokes on small phone screens.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Pure black background with white lines; use 1.5-3 px strokes for primary concept links and 4-7 px solid dot nodes at roughly 1080-wide scale. Adjust for small-phone visibility.
- For a recognizable physical outline, sample a path into ~30-40 meaningful nodes and connect them in silhouette order. Decorative cross-links must not make the subject ambiguous; sparse orbit rings and 7-circle geometry are optional.
- Keep animation 2D: line draw-on, dot travel, opacity, translation, scale. No 3D orbit meshes, no filled objects except selected dot markers, no color accent.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
