# CGC hero film: new H3 concepts (2026-11-02)

Why v4 was replaced, in the owner's words: soft / AI-fake, boring / too slow, wrong concept (an empty lobby door
does not say what CGC does). These concepts show the glazing work itself, cut faster (3-4 shots in 5 s) and
render at H3's native 1344x768 instead of 832x480.

All are **generated concept films, not CGC projects**, and must keep that label on the site.

| ID | Name | Idea | Before / after |
| --- | --- | --- | --- |
| A | The Lift | Crane hoists a curtain-wall unit at golden hour; glaziers walk it into the open bay; crane-up reveals the sealed facade | Open floor edge -> continuous glass |
| B | Storefront | Boarded-up retail opening transforms into a lit floor-to-ceiling glass storefront at dusk on one slow dolly | Plywood -> finished storefront |
| C | Light Up | Blue-hour drone ascent; interior lights switch on floor by floor behind the curtain wall | Dark mirror -> glowing tower |
| D | The Seal | Macro craft: suction lifter, pane set on blocks, gasket rolled in, rack focus to the street | Loose glass -> sealed, clear view |
| E | Reflection | One mirror panel pulls back into a whole building reflecting the sky | One panel -> whole skin |

Prompts: `prompts/*.txt` (official H3 structure: look, scene overview, timed storyboard, camera, audio, negatives).

## Workflow (ComfyUI native, best practice found 2026-11-02)

Official ComfyUI template `video_minimax_h3_i2v` (covers text-to-video and first/last-frame), as an API graph in
`_work/hero-h3/render_comfy.py`:

- Model `minimax_h3_fl2va_pruned_int8_convrot` (hard-linked from the identical WanGP checkpoint, 932/932 tensors match)
- Text encoder `qwen3vl_32b_minimax_h3_nvfp4_awq` (NVFP4 suits the RTX 5080), video VAE int8, audio VAE fp32
- `res_multistep` + `simple`, 20 steps, BasicGuider (guidance-distilled), 24 fps, 1344x768 (H3's native 768p canvas)
- Drafts: lightx2v `minimax_h3_fl2v_turbo_8step` LoRA at 8 steps (`--turbo`)
- Optional later: FastH3 8-step checkpoint (speed), community latent upscaler / Spectrum (javawock7618 FLF workflow),
  multiframe reference for anchoring keyframes. Going above 1344x768 is slower without adding detail (Comfy docs).

Licensing note: Comfy's docs say commercial use of locally generated H3 output needs a MiniMax commercial license
(sold through Comfy); Comfy Cloud generations include it. The owner must decide this before a film goes live.
