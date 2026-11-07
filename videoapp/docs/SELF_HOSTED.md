# Self-hosted "Draft" tier (RunPod Serverless)

The `draft-self` model (provider `self`) runs open-weight LTX-Video on your own RunPod Serverless endpoint.
It's the cheapest tier: ~10 credits for 5 s vs 24 for the fal "Fast" tier, at roughly $0.01–0.03 of GPU time.

## How it plugs in
`src/lib/providers/self.ts` implements the same adapter interface as fal/Replicate:
- `submit` → `POST https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/run` with `{ input, webhook }`.
  The webhook is `/api/webhooks/self?token=$SELF_WEBHOOK_SECRET` (RunPod doesn't sign webhooks).
- `status` → `GET /v2/$RUNPOD_ENDPOINT_ID/status/{id}` (also used by the poll-based reconciler).
- Output: the worker returns `{ video_url }` — a normal URL or a `data:video/mp4;base64,…` URL. The app copies it into
  Supabase Storage either way (RunPod only keeps results for 30 minutes).

## Deploy
1. `cd workers/runpod-ltx && docker build -t <registry>/ltx-worker:1 . && docker push <registry>/ltx-worker:1`
   (the image bakes the weights in; it's big — build on a machine with a fast connection, not MOMOBEAST over Wi-Fi).
2. RunPod → Serverless → New Endpoint → custom image. GPU: L40S or A100 80GB. Min workers 0, max 3, FlashBoot on,
   execution timeout 600 s.
3. Set `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, `SELF_WEBHOOK_SECRET` (any long random string) in Vercel.
4. Admin → Models → Draft: set `api_cost_usd` to the real per-clip GPU cost once you've measured it
   (RunPod bills per second; check the endpoint's metrics after ~20 jobs).

Until those keys exist, Draft jobs run on the mock provider in dev and the model is hidden in production.

## Testing presets on MOMOBEAST
The same `handler.py` runs locally with `python handler.py --test_input '{"input": {"prompt": "…"}}'`
(RunPod SDK local test mode) on any 24 GB+ NVIDIA GPU — use that to iterate on preset prompts for free.
