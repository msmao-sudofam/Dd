# HANDOFF — Reelforge (white-label AI video platform)

All six phases of `BUILD_PLAN.md` are built and pass their tests, **against mocks**. No API keys were available in the
build environment, so nothing has hit a real provider, Stripe, or Supabase yet, and **$0 was spent**.
`PROGRESS.md` has the phase checklists, the decisions made along the way, and the "NEEDS FROM M" list.

The brand name is a placeholder: set `NEXT_PUBLIC_BRAND_NAME` and replace `public/watermark.png`.

## What's built
| Area | Where |
|---|---|
| Next.js 16 App Router + TS + Tailwind v4 app | `videoapp/` (Vercel root directory) |
| Auth: email/password + Google (Supabase), mock cookie auth without keys | `src/lib/auth`, `src/app/(auth)`, `src/app/auth/callback`, `src/proxy.ts` |
| Schema + RLS + atomic credit ledger (`apply_credit_delta`) | `supabase/migrations/*.sql`, seed in `supabase/seed.sql` (generated: `npm run gen:seed`) |
| Data layer: Supabase implementation + file-backed mock with the same ledger rules | `src/lib/db/{supabase,mock}.ts` |
| Provider adapters (`submit` / `status` / `parseResult` / `verifyWebhook`): fal, Replicate, self-hosted RunPod, mock | `src/lib/providers/` |
| Generation engine: validate → balance → moderation → debit → submit; webhook or poll → re-upload → succeed, or fail + refund | `src/lib/generation.ts`, `src/app/api/{generate,jobs,uploads,webhooks}` |
| Moderation: local rules (NSFW, minors, public figures, trademarked IP) + OpenAI omni-moderation (text + images); consent checkbox logged per upload | `src/lib/moderation.ts` |
| 8 models (Draft/self-hosted, LTX Fast, Wan 2.6, Kling 3, Veo 3.1, 2× image-to-video, FLUX) | `src/lib/seed-data.ts`, pricing notes in `docs/PROVIDER_REFERENCE.md` |
| Stripe: 3 credit packs + monthly plan, idempotent webhook, customer portal, mock checkout | `src/lib/billing.ts`, `src/app/api/billing`, `src/app/api/webhooks/stripe` |
| 20 launch presets, gallery with categories, 3-click runner, SEO pages `/presets/[slug]` | `src/app/presets`, `src/components/presets` |
| Admin (role-gated): presets + models CRUD (with uploads), integration status, margin dashboard | `src/app/admin` |
| Growth: referrals (credited on first purchase), free-tier watermark (ffmpeg), 1 bonus per device / 3 per IP, disposable-email block, rate limits | `src/lib/{referrals,postprocess,signup,abuse,disposable-domains}.ts` |
| Landing page (9:16 video wall, how it works, presets, pricing, FAQ), legal pages, sitemap/robots | `src/app/page.tsx`, `src/app/legal`, `src/app/{sitemap,robots}.ts` |
| PostHog funnel (`signed_up` → `generation_started/succeeded/failed` → `purchase_completed`) + client pageviews | `src/lib/analytics.ts`, `src/components/analytics.tsx` |
| Self-hosted LTX worker for RunPod | `workers/runpod-ltx/`, `docs/SELF_HOSTED.md` |

## Run it locally
```bash
cd videoapp
npm install
npm run dev:mock     # no keys needed → http://localhost:3000
```
Mock mode: a JSON DB in `.data/`, sample videos after 5 s, and instant "purchases". To make yourself admin, set
`ADMIN_EMAILS=you@example.com` in `.env.local`. On the Create page, the "force fail" checkbox exercises the refund path.

With real keys: `cp .env.example .env.local`, fill it in, then `npm run dev`.

## Tests
```bash
npm run typecheck && npm run lint
npm test            # Vitest: 53 tests. Includes SQL migration tests against local Postgres (skipped if none on :5432)
npm run test:e2e    # Playwright: 18 flows on a production build in mock mode
```
Last run: **53/53 unit/SQL and 18/18 e2e passing**, lint and typecheck clean. Each phase's "Done when" is an e2e test:
- **P1** sign up → log out → log in → see balance (`tests/e2e/phase1-auth.spec.ts`)
- **P2** 9:16 clip lands in library; a forced failure refunds (`phase2-generate.spec.ts`)
- **P3** purchase credits exactly once with the signed webhook delivered twice (`phase3-payments.spec.ts`)
- **P4** new user: preset → consent → photo → clip in 3 clicks (`phase4-presets.spec.ts`)
- **P5** profit per model on the margin dashboard; Draft runs through the self adapter (`phase5-growth.spec.ts`)
- **P6** landing, legal, sitemap, mobile layout (`phase6-launch.spec.ts`)

The SQL tests need a Postgres on `127.0.0.1:5432` with user/password `postgres`/`postgres` (or set `TEST_PG_URL`).

## Environment variables
| Var | What | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public base URL; also used to build provider webhook URLs | Your Vercel URL / domain |
| `NEXT_PUBLIC_BRAND_NAME` | White-label brand name | You |
| `SESSION_SECRET` | Signs mock sessions; salts fingerprint hashes | `openssl rand -hex 32` |
| `ADMIN_EMAILS` | Comma-separated admin emails | You |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | DB, auth, storage | Supabase → Settings → API Keys (legacy anon / service_role also accepted) |
| `FAL_KEY` | Main model gateway | fal.ai → Dashboard → Keys (add billing) |
| `REPLICATE_API_TOKEN`, `REPLICATE_WEBHOOK_SECRET` | Backup gateway (no Replicate models are seeded yet) | replicate.com → API tokens; `GET /v1/webhooks/default/secret` |
| `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, `SELF_WEBHOOK_SECRET` | Self-hosted Draft tier | RunPod → Settings → API keys; your endpoint id; any random string |
| `OPENAI_API_KEY` | Moderation (the endpoint is free) | platform.openai.com → API keys |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments (use **test** keys first) | Stripe → Developers → API keys / Webhooks |
| `RESEND_API_KEY`, `EMAIL_FROM` | "Your video is ready" emails | resend.com → API keys; verify your sending domain |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Analytics | PostHog → Project settings |
| `LEGAL_COMPANY_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL` | Shown on the legal pages | You |
| `MOCK_BACKEND`, `MOCK_PROVIDERS`, `MOCK_STRIPE` | `true` forces a mock even when keys exist | Optional |
| `RATE_LIMIT_PER_MINUTE` / `_PER_DAY`, `SIGNUP_MAX_PER_IP` | Abuse limits (defaults 6 / 200 / 3) | Optional |

## Known issues and limits
- **Prices aren't verified.** Vendor doc sites were blocked during the build, so fal prices came from search summaries.
  Kling v3 pricing in particular was conflicting, so I used the conservative value. Check them on fal.ai and fix
  `api_cost_usd` in Admin → Models; the min-margin column turns red below 60%.
- **Preview videos are placeholders.** All 20 presets use 5 per-category placeholder clips. Generate a real preview
  per preset and upload it in Admin.
- **Legal pages are plain-language templates.** Have a lawyer review them before launch.
- **Moderation is partly keyword-based.** Public-figure and IP detection use keyword lists, which a determined user can
  get around (misspellings, or a celebrity photo uploaded with an innocent prompt). OpenAI moderation doesn't detect
  identities. For scale, consider a face/celebrity-recognition check on uploads, such as AWS Rekognition
  `RecognizeCelebrities`.
- **Replicate is backup only.** The adapter exists, but no Replicate model is seeded.
- **The Draft tier is untested on a GPU.** The RunPod worker (`workers/runpod-ltx`) is written to the diffusers LTX
  API, but it hasn't been run on real hardware.
- **Mock backend is single-process only.** It's a local JSON file, fine for dev and tests, not for Vercel. Production
  needs Supabase.
- **In production, models without keys are hidden.** With real Supabase keys, a model whose provider has no key is
  hidden, so no fake outputs can be served. Set `MOCK_PROVIDERS=true` on staging if you want mocks there.
- **Vercel preview protection blocks provider webhooks.** Job polling still completes jobs. See DEPLOY.md §3.
- **The Supabase CLI stack was never run** (no Docker in the build environment). Migrations were tested on plain
  Postgres 16 with a shim for the `auth`/`storage` schemas. Run `supabase db push` on a fresh project first, before
  pointing real users at it.

## Go live: exact steps for M
1. Create the accounts: Supabase, fal.ai (with billing), Stripe, Vercel, PostHog, Resend, OpenAI, and a domain.
2. Follow **DEPLOY.md** §1–3 with Stripe **test** keys and make a preview deploy.
3. Run the go-live prompt from BUILD_PLAN §6: turn mocks off, run one smoke generation per model (keep the total
   ≤ $2), and record the real cost per clip in Admin → Models.
4. Make and upload real preview videos for all 20 presets. Replace `public/watermark.png` with your logo.
5. Get a lawyer to review `src/lib/legal.ts`, and set `LEGAL_COMPANY_NAME` and `NEXT_PUBLIC_SUPPORT_EMAIL`.
6. Check that each provider's terms allow resale/white-label (BUILD_PLAN §0).
7. Stripe: activate the account, switch to **live** keys and a live webhook endpoint (same 4 events), and enable the
   Customer Portal.
8. Vercel: add the custom domain, then set `NEXT_PUBLIC_APP_URL` to it. In Supabase Auth, update the Site URL and
   Redirect URLs. Deploy with `vercel --prod`.
9. Optional: deploy the RunPod Draft worker (docs/SELF_HOSTED.md) to unlock the cheap tier.
