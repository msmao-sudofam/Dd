# Current state and evidence

Captured November 2, 2026. This summary reconciles known local files; no new website tests, video-quality review or deployment verification was performed for this export.

## Website

Static CGC site, lead API, CRM, legal pages, SEO files, media library and build scripts exist. Latest design direction is white / graphite / steel blue. The original Three.js installation hero and dark amber interface were superseded by user feedback. Amber remains in the supplied logo.

Current local hero references threshold-v3 assets. Freebuff's delivery calls that film installed locally, not deployed. STATUS.md also describes an older live Reflection Run preview and contains contradictory historical descriptions. Do not infer that the newest local film is what an online URL serves. Verify deployment identity and actual media if deployment work becomes authorized. No production client-domain launch is established here.

Recorded preview in STATUS.md: https://cgc-glazing-wtwmodxmt-sdvsfbs.vercel.app/ . Treat as historical; it was not opened during transfer. Vercel project cgc-glazing, scope sdvsfbs. Prior status reports note a separate accidentally created project named site. Do not deploy to it or delete it as part of this handoff. Prior token/link incidents are recorded in STATUS.md; do not repeat protection-bypass or credential-download commands.

## Render history and why the user rejected it

1. Reflection Run: earlier five-shot 16-second generated film. Sources and provenance: creative/reflection-run-film-2026-10-31 and _work/film-* / site/assets/film. It does not implement the later eight-shot Threshold script.
2. Threshold v3: Freebuff rendered with Wan2.2 I2V A14B Q4_K_M, native 1280x720, 49 frames, 16fps; edited eight shots into 16 seconds at 24fps. DELIVERY.md documents S01 wrong move, S03 alternate truck instead of downward slide, and S05/S08 held plates with scale drift. The user explicitly rejected these substitutions. Folder names such as 04_accepted describe the previous operator's choices, not current user approval.
3. Strict H3 redo v4: creative/freebuff-h3-redo-v4/CGC-Freebuff-H3-STRICT-REDO-v4.html is the operative strict-redo handoff for Threshold. It requires H3 qualification, faithful camera/action and no still substitutes. Read the whole package before another production run.
4. A/B evidence now exists: creative/threshold-v3/AB-MODEL-TEST.md and _work/threshold-v3/07_abtest. The report claims H3 passed S02 truck and revised S05 door-opening tests, while A14B failed. It records S05 starting closed rather than 15–20 degrees ajar, S02 travel below the earlier numerical target, and H3 native output 832x480 with a delivery-resolution tradeoff. These are report claims and documented deviations, not an independent quality approval in this transfer. Inspect full clips against the strict v4 criteria. Presence of passing test claims is not proof that all eight replacement shots or the replacement hero have been delivered.

## New alternate concepts (plans, not rendered films)

- In Plain Sight: creative/in-plain-sight/CGC-In-Plain-Sight-Concept.html. Six-shot, 16-second interior-glass room reveal; generated room reference and board, detailed H3/keyframe prompts and motion gates. Commit 5074b95.
- From the Opening Up: creative/from-the-opening-up/CGC-From-the-Opening-Up.html. Eight-shot, 24-second storefront installation into an existing shell: empty opening, sill, upright, full empty frame, glass seating, seal, supported door alignment, finished facade. New generated eight-panel board, 4,313-word brief, detailed prompts. Tests I05 and I07 first. Board ambiguities and required corrections are explicitly documented. Commit 6c25075.
- Older concepts and Threshold versions remain in creative/ for provenance. The latest concept does not automatically supersede the active script. Neither new alternate has generated video or hero integration.

Document tests for the new concept HTML packages passed offline at 390/1440: zero overflow, console errors or axe violations; embedded images and prompt/download controls work. That validates documents, not film motion or the current website.

## Installed rendering environment (local paths, not portable assets)

- GPU previously inspected: RTX 5080 / 16,303 MiB VRAM.
- Wan2GP: C:/pinokio/api/wan.git/app. Installed presets include Wan2.2 I2V A14B high/low Q4_K_M, MiniMax H3 FL2VA Pruned and H3 Ref2VA Pruned. H3 large weights require working memory/offload settings; do not assume full GPU fit.
- ComfyUI: C:/Users/Moqui/ComfyUI. Previously found Wan2.2 TI2V 5B and Qwen-Image-Edit-2511. Another older Wan2GP exists under C:/Users/Moqui/talking-head/repos/Wan2GP.
- Model weights, application installs, process memory and external model output folders are not in these archives. Freebuff must enumerate any additional task outputs it saved elsewhere.

## Remaining work

Reconcile Freebuff's complete current export and inspect actual motion before treating any replacement as done. The user wants generated video matching the script exactly. Confirm which concept is selected before a conflicting new film run. Complete production, review and optional hero wiring for the selected concept; preserve honest generated-concept labels. Do not replace hard shots with stills or a new storyboard.

Website launch still requires owner-controlled infrastructure and verification listed in START-HERE and STATUS.md. Prior QA numbers are historical. Re-test only what the next changes warrant, plus required final launch checks; do not use audit work to avoid video production.
