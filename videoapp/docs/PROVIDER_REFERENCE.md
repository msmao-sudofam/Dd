# Provider reference (researched 2026-10-11)

Vendor doc sites were blocked from the build sandbox, so this was sourced from the official npm
packages (`@fal-ai/client@1.10.1`, `stripe@23.0.0`, `@supabase/ssr@0.12.7`, `openai@7.32.0`,
`replicate@1.4.0`), the Supabase/RunPod docs repos on GitHub, and web-search summaries of fal
pricing pages. **Prices marked (search) must be re-checked on fal.ai before going live** — update
`api_cost_usd` / `credit_cost_per_second` in the admin Models page or `src/lib/seed-data.ts`.

## fal.ai queue
- Submit: `POST https://queue.fal.run/{endpoint_id}?fal_webhook=<url>` with `Authorization: Key $FAL_KEY`.
  Returns `{ request_id, status, response_url, status_url, cancel_url }`.
- Status: `GET {status_url}` → `IN_QUEUE | IN_PROGRESS | COMPLETED`. Result: `GET {response_url}`.
  Status/result URLs use only `owner/alias` (e.g. `fal-ai/kling-video/requests/{id}`), so we build them from the app root.
- Webhook body: `{ request_id, gateway_request_id, status: "OK"|"ERROR", payload, error?, payload_error? }`.
- Webhook signature: headers `X-Fal-Webhook-Request-Id`, `-User-Id`, `-Timestamp`, `-Signature` (hex).
  Message = `request_id \n user_id \n timestamp \n sha256_hex(raw_body)`, Ed25519, keys from
  `https://rest.fal.ai/.well-known/jwks.json` (fallback `rest.alpha.fal.ai`), ±300 s tolerance.

## Seeded fal models
| slug | endpoint | type | $/s (source) | notes |
|---|---|---|---|---|
| ltx-fast | `fal-ai/ltx-2.3/text-to-video/fast` | t2v | 0.06 (search) | durations 6/8/10, 9:16 + 16:9 |
| wan-26 | `wan/v2.6/text-to-video` | t2v | 0.10 @720p (search) | durations 5/10/15 |
| kling-3 | `fal-ai/kling-video/v3/standard/text-to-video` | t2v | 0.168 conservative (search, conflicting) | audio off |
| veo-31 | `fal-ai/veo3.1` | t2v | 0.40 w/ audio @720p (search) | duration format `"8s"` |
| ltx-i2v | `fal-ai/ltx-2.3/image-to-video/fast` | i2v | 0.06 (search) | `image_url` |
| kling-3-i2v | `fal-ai/kling-video/v3/standard/image-to-video` | i2v | 0.168 conservative | `start_image_url`, no aspect param |
| flux-schnell | `fal-ai/flux/schnell` | t2i | ~0.003 / image (search) | `image_size: portrait_16_9` |

Video output: `{ video: { url } }`. Image output: `{ images: [{ url }] }`.

## Replicate (backup)
`POST /v1/models/{owner}/{name}/predictions` `{ input, webhook, webhook_events_filter: ["completed"] }`.
Webhook verification: headers `webhook-id`, `webhook-timestamp`, `webhook-signature` (`v1,<b64>` list);
HMAC-SHA256 of `${id}.${timestamp}.${body}` with base64-decoded secret (strip `whsec_`) from
`GET /v1/webhooks/default/secret`.

## RunPod Serverless (self-hosted tier)
`POST https://api.runpod.ai/v2/{ENDPOINT_ID}/run` `{ input, webhook }` → `{ id, status }`.
`GET /v2/{ENDPOINT_ID}/status/{id}` → `{ status: IN_QUEUE|IN_PROGRESS|COMPLETED|FAILED|CANCELLED|TIMED_OUT, output, error }`.
No webhook signatures — we put a secret token in the webhook URL. Results kept 30 min, so we copy outputs immediately.

## Stripe (stripe-node 23, API `2026-09-30.endive`)
- Checkout with inline `price_data`; subscription mode adds `recurring: { interval: "month" }` and
  `subscription_data.metadata`. `payment_method_types` param was removed in v23 — omit it.
- Webhook: `stripe.webhooks.constructEvent(await req.text(), sig, secret)`.
- Packs: `checkout.session.completed` (+ `checkout.session.async_payment_succeeded`), require `payment_status === "paid"`.
- Subscriptions: `invoice.paid`; subscription id/metadata at `invoice.parent.subscription_details.{subscription,metadata}`
  (top-level `invoice.subscription` no longer exists).

## Supabase
- Keys: `sb_publishable_…` (browser) and `sb_secret_…` (server). Legacy anon/service_role keys still accepted by our env loader.
- `@supabase/ssr` 0.12: `setAll(cookies, headers)` — apply the cache headers on the response.
- Next 16: middleware is `src/proxy.ts`; call `supabase.auth.getClaims()` immediately.

## OpenAI moderation
`POST /v1/moderations` `{ model: "omni-moderation-latest", input: [{type:"text",text}, {type:"image_url",image_url:{url}}] }`.
Image inputs only score violence / self-harm / sexual — minors and real-person checks are enforced by our own rules too.
