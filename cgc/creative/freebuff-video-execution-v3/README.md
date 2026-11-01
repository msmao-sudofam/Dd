# Freebuff video execution handoff v3

Send **CGC-Freebuff-GENERATE-AND-INSTALL-v3.html** alone to Freebuff. This supersedes the earlier v1/v2 handoffs.

The first section is a mandatory execution order: use the installed Pinokio Wan2GP, generate the new shots, visually inspect/correct them, assemble the film, install versioned assets in the current CGC hero and verify that the page actually plays the new files. Model selection and calibration are internal checkpoints, not stopping points. Lighthouse, poster optimization and unrelated website work are explicitly deferred.

The same file embeds the storyboard, entrance reference, supplied logo, detailed eight-shot motion cards, keyframe/main/alternate prompts, acceptance rubric, fallbacks and export/integration instructions. It contains approximately 11,700 words. It is the execution specification, not a rendered video or automatically executable Wan2GP queue.

## Verified inventory

Read-only inspection November 1, 2026 found:

- RTX 5080 / 16,303 MiB VRAM.
- Primary app: `C:/pinokio/api/wan.git/app`.
- Installed Wan2.2 I2V A14B high/low Q4_K_M GGUF files and a matching `i2v_2_2_gguf_q4_k_m.json` preset.
- Installed MiniMax H3 FL2VA/Ref2VA pruned int8 files and matching defaults.
- A separate older Wan2GP under `C:/Users/Moqui/talking-head/repos/Wan2GP`.
- The previous CGC helper uses Wan2.2 TI2V 5B through ComfyUI, which does not demonstrate use of Wan2GP.

Weights and preset presence were verified; this handoff task did not load or benchmark those candidates. A14B is the first candidate, H3 FL2VA the bounded comparison. The actual best result must be chosen from inspected renders, not a presumed ranking.

## Build and validation

Build: `python cgc/creative/freebuff-video-execution-v3/build-handoff.py`.

`EXECUTION-ORDER.md` controls scope and definition of done. `PRODUCTION-MANUAL.md` and `shot-cards.py` provide detailed direction. The builder embeds the existing reference images from v1. Generated `complete-manual.md` and `creative-manifest.json` are also available through the HTML download buttons.

Standalone checks at 390 and 1440: no overflow, external requests or script errors; all three images loaded; manifest v3 and eight shots present; execution order precedes production details; the START NOW clipboard action contains generation and installation instructions; Markdown download matches the full embedded manual. The first screen was visually inspected.

No renderer was launched, generation submitted, website changed or deployment performed during this handoff edit. Existing pending Freebuff poster/hero edits were preserved. Nothing was pushed.
