# Production workflow — run for every style

## A. Script decomposition
- Treat every sentence, named object, action, change, comparison, and payoff as potential scene information. Extract beats from the actual script; use natural syntax rather than mechanical one-scene-per-sentence rules.
- For each beat record: `id, start_sec, end_sec, narration_text, purpose, subject, action, location, visual_metaphor, camera, required_text, art_style_details, transition, continuity_keys`.
- Preserve causal and factual relationships. Use visual proof of the exact claim: e.g., "battery runs out" means show a decreasing battery reading and a consequence, not random gears spinning.
- Choose scene count for readability: a 5-second single gag might be one scene; a 45-second explainer may contain many shot changes. 3–5 seconds per beat is a heuristic, not a mandate.
- The first visible shot must clearly establish the subject/tension/interesting result, when suitable for the script. Don't add exaggerated "viral" tropes that conflict with serious, educational, or calm tone.

## B. Continuity bible
Record consistent character traits (silhouette, proportion, clothes, distinctive facial/hair details), props, typography, backgrounds, color choices, light direction and size. Characters must not change appearance between shots unless script directs it. Every object/scene should use the chosen style's geometry, textures, edges, motion and lighting, not just its palette.

## C. Style-specific execution
Open the selected command's `STYLE.md`. Style invariants outrank visual shortcuts. Translate the script into that medium's native grammar: pixels, chalk strokes, dotted glow, retro polygons, comic ink, flat vector, constellation diagrams, cinematic CGI, studs/bricks, or rounded explainer 3D. Preserve meaningful variety across subjects and backgrounds. Avoid repetition and "same video with a different color filter."

## D. Storyboard and proof
Before full render, write a shot list and small editable storyboard manifest `project.json`. For each scene, explain what the viewer understands visually, without needing to hear the voiceover. If a scene is decorative instead of informative or entertaining, replace it. Plan suitable scene transitions; don't force the same motion template on every scene.

## E. Build
- Create local HTML/CSS/SVG/Canvas 2D and/or three.js scene code with deterministic `window.renderFrame(f)` (1-indexed; never depend on wall-clock, `requestAnimationFrame`, or unseeded random numbers). `window.ready=true` only after assets/fonts initialize. `renderFrame` must render any frame in any order, including the last frame first.
- Use actual dimensions chosen by the user, and recompute the scene layout, safe zones and font sizes for the target frame. Avoid mere central cropping of a landscape layout into portrait.
- When assets require dependencies, check availability first. Make no network calls without user permission or configured environment. Avoid Remotion, Blender, stock imagery, and generative image/video services unless the user explicitly switches the production method.
- When object geometry is too complicated for quick native modeling, prefer a simplified but **recognizable and content-specific** shape over an inaccurate generic blob. Don't claim high realism if only simple procedural meshes are achievable.

## F. Audio and captions
- Supplied narration: keep audio intact. Supplied music: mix modestly, never drown dialogue; do not manufacture or claim to possess music. If neither provided, silent animation is valid.
- Captions only when requested: accurately transcribe supplied narration/script, show small readable phrases matched to actual content; prioritize visual safe area. If captions off, avoid forced quote overlays. Essential diagrams labels remain.
- Don't invent voiceovers, copyrighted background music, audio cues, or extra narration. For requested sound effects, use only user-provided/legally available assets or disclose unavailability.

## G. Preview, iterate, render, verify
Follow `RENDERING_AND_QA.md`. Inspect 10%, 40%, and 90% keyframes plus opening and transition frames; fix composition, continuity and legibility. Render and probe the real MP4. Report exact file paths and what was actually produced.

## H. Subsequent turns
For edits, examine prior project manifest/source, apply only specified changes, regenerate affected scenes as needed, preserve prior audio/script/style and other scenes, then verify output. Never ask the same input questions again unless relevant details have changed.
