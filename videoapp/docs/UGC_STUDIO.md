# UGC Ad Studio

Brands turn a product into talking-creator ads: script → AI creator → voice → captions → finished edit.

## Flow (`/ugc` → `/ugc/new`)
1. **Product** — name, what it is, up to 3 benefits, audience, offer, tone, product photo (consent logged).
2. **Script** — 4 angles written for the product (problem→solution, first impressions, 3 reasons, POV, old vs new,
   routine). Claude (`claude-opus-5-5`, structured outputs, server-side refusal fallback) when `ANTHROPIC_API_KEY` is set;
   deterministic hook-formula templates otherwise. Every line is editable. Rules baked into the prompt: no invented results,
   stats, reviews, medical/financial claims, competitors or celebrities.
3. **Creator** — 8 fictional AI adults (+ voices) or **your own face** (selfie + logged "this is me" consent; private to you).
   Up to 3 creators; each films every picked script.
4. **Format** — 9:16 / 4:5 / 1:1, bold or clean captions, standard or premium creator model, b-roll cutaway,
   "AI-generated" label (on by default), end-card button text. Exact credit cost shown before generating.

## Pipeline (one `jobs` row, `kind = 'ugc'`)
| Stage | fal endpoint | Output |
|---|---|---|
| voice | `fal-ai/elevenlabs/tts/turbo-v2.5` | `audio.url` |
| composite (if product photo) | `fal-ai/nano-banana/edit` (creator portrait + product) | `images[0].url` |
| avatar | `fal-ai/kling-video/ai-avatar/v2/standard` · premium `fal-ai/bytedance/omnihuman/v1.5` | `video.url` |
| broll (if photo + enabled) | `fal-ai/ltx-2.3/image-to-video/fast` | `video.url` |
| assemble | local ffmpeg + libass (bundled Inter TTFs in `assets/fonts`) | final mp4 |

- Each stage completes via webhook **or** poll; `claimJobRequest` guarantees a stage result advances the pipeline once.
- Any stage failure → job `refunded`; `cost_usd` records the stages that actually ran.
- Assembly: cover-crop to aspect, b-roll overlay after the hook while the voice continues, pop-in captions (word groups
  timed by word length), on-screen hook, AI label, 1.6 s darkened end card with product name + CTA; free plan watermark.
- Credits: `src/lib/ugc/config.ts` → `estimateUgcCost` (same ≥3x worst-case markup rule as every model).
  Per-stage prices were read from fal.ai on 2026-10-12 (go-live Step 2); see `docs/PROVIDER_REFERENCE.md`.

## Placeholders to replace (go-live Step 4 batch)
- 8 creator portraits `public/ugc/actors/*.jpg` → generate fictional adult personas (e.g. nano-banana / FLUX),
  9:16, natural selfie lighting, matching each creator's `setting`; upload via storage and set `portrait_url`.
- Optional `preview_video_url` per creator (a 3 s talking sample).
