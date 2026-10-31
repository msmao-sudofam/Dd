# The Threshold v2 — detailed local-video handoff

Send **CGC-Threshold-v2-Complete-Handoff.html** alone to Rebuff.

The offline HTML embeds the existing generated storyboard, entrance reference and supplied logo; 9,410 words of operator direction; eight detailed motion cards; eight keyframe prompts; main, short and optional timeline motion prompts; calibration, review and finishing procedures. It supersedes the earlier short motion directions. It contains a creative manifest, not an importable Wan2GP queue or completed video.

Build: `python cgc/creative/the-threshold-v2/build-handoff.py`.

Sources: `PRODUCTION-MANUAL.md` and `shot-cards.py`; the builder embeds media from the existing v1 handoff. `complete-manual.md` and `creative-manifest.json` are generated supporting sources, also downloadable from the single-file HTML. The HTML includes instructions for extracting text without loading base64 images into an agent's context.

Application notes were checked against the upstream WanGP PROMPTS, SETTINGS and CLI docs on October 31, 2026; links are in the handoff. Exact installed model, settings and failed outputs remain unknown and must be inspected locally by the receiving operator.

Validation at 390 and 1440: 0 document overflow, 0 external requests, 0 script errors, 0 automated WCAG A/AA violations; all three embedded images loaded; 8 shots and 24 copy controls present; Markdown/JSON downloads matched embedded content; the documented Python text extractor reproduced the complete manual. The source file was visually inspected. Website code and hosting were not changed for this handoff.
