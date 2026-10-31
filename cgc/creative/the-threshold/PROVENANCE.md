# The Threshold — provenance

Illustrative architectural storyboard, not a completed CGC project and not generated video.

- Board: built-in image generation, October 31, 2026. Original retained at `C:/Users/Moqui/.codex/generated_images/01a190ad-17bb-7351-9cf3-6aed3b7f0565/exec-96d7142b-eb39-4839-9af1-1414227dc3b9.png`; project copy `storyboard.png`.
- Reference: `../video-concepts-2026-10-31/entrance-light.png`, previously generated entrance concept. Used to anchor materials and architecture.
- Logo: supplied project `site/assets/logo.svg`, embedded unchanged in the handoff.
- Eight per-shot still and motion prompts: `production.json`; same content embedded in `CGC-The-Threshold-Handoff.html`.
- Full storyboard generation prompt: `STORYBOARD-PROMPT.txt`.
- Build: `python cgc/creative/the-threshold/build-handoff.py`.
- Delivery: send **CGC-The-Threshold-Handoff.html** alone. All reference images, logo, text and prompts are embedded. It does not call a remote generator, require a key, or include executable local-model workflows.
