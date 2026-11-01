# From the Opening Up

New CGC storefront installation concept: eight shots, 24 seconds, 576 edited frames at 24fps. Open `CGC-From-the-Opening-Up.html` for the complete offline package. It embeds the generated storyboard, full 4,313-word brief, keyframe/H3 prompts, exact action and camera requirements, production JSON and download controls.

This is a concept and handoff, not a generated film. It does not replace the current hero or another active production assignment. The building shell already exists; CGC's depicted scope is the glazing installation.

`IMAGE-PROMPT.json` records the exact built-in image-generation prompt and original image path. `storyboard.png` is copied unchanged from that generated output. The board is illustrative; the brief identifies geometry and start-pose corrections needed before production. Never represent it as an actual CGC project.

Rebuild from repository root:

```powershell
python cgc/creative/from-the-opening-up/build.py
node cgc/creative/from-the-opening-up/verify.mjs
```

Document QA passed at 390px and 1440px: zero horizontal overflow, zero console errors, zero external requests and zero axe violations. All 16 prompt-copy buttons exist; I05 H3 clipboard content was verified against the source. Markdown/JSON downloads match their source documents, allowing for Markdown line endings. Embedded storyboard loads offline. Screenshots were visually reviewed. Evidence is in `verification/`.

Actual video generation, motion review and website integration remain unperformed. Production must qualify glass seating and supported door alignment before the full batch; no held stills, digital zooms, wrong camera moves or action substitutions count as passes.
