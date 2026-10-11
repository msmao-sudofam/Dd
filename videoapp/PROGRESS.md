# PROGRESS

Source of truth for the autonomous build described in `BUILD_PLAN.md` §6.
Resume from the first unticked item.

App lives in `videoapp/` (Next.js 16 App Router + TS + Tailwind v4).
Runs fully offline in mock mode: `MOCK_BACKEND=true` (file-backed DB + cookie auth instead of Supabase)
and `MOCK_PROVIDERS=true` (sample video after 5s, Stripe adds credits instantly).

## Phase 1 — Skeleton + auth
- [x] Scaffold Next.js + Tailwind + Supabase client (`@supabase/ssr`)
- [x] Backend abstraction: Supabase implementation + mock (file DB) implementation
- [x] Email/password + Google login (Supabase Auth); mock auth when keys missing
- [x] Migrations for profiles, credit_ledger, models, presets, jobs with RLS
- [x] Atomic `apply_credit_delta` Postgres function; balance only changes via ledger
- [x] Signup trigger: profile + `signup_bonus`
- [x] `.env.example` with every key
- [x] Tests: SQL migration test (local Postgres), Vitest ledger tests, Playwright signup→login→balance
- [x] Commit `phase 1: ...`

## Phase 2 — Generation engine
- [x] Provider adapter interface (`submit`, `status`, `parseResult`) + fal, replicate, self (RunPod), mock adapters
- [x] Seed 4–6 models (cheap, mid, premium, i2v, t2i) with credit_cost ≈ 3x API cost
- [x] Moderation (OpenAI omni-moderation + local blocklist, consent checkbox for faces)
- [x] `/api/generate`: validate → balance → moderation → debit → submit → insert job
- [x] `/api/webhooks/fal` (+ replicate, self): verify signature → re-upload to storage → succeed, or fail + refund
- [x] Generate page: model picker, prompt, image upload, duration/aspect (9:16 default), live status, library grid + download
- [x] Tests: Vitest (adapters, signature verify, refund), Playwright generate 9:16 + forced failure refund
- [x] Commit `phase 2: ...`

## Phase 3 — Payments
- [x] Stripe Checkout for packs (Starter/Creator/Pro) + monthly plan
- [x] `/api/webhooks/stripe` idempotent on `stripe_event_id`
- [x] Mock Stripe adds credits instantly
- [x] Billing page: balance, ledger history, buy more
- [x] Tests: purchase adds credits exactly once even if webhook fires twice
- [x] Commit `phase 3: ...`

## Phase 4 — Presets
- [x] Preset gallery homepage with categories + autoplay previews
- [x] 15–20 launch presets (product ads, camera moves, effects, UGC)
- [x] Preset run flow: upload photo / subject → generate (≤3 clicks)
- [x] Admin (role-gated) CRUD for presets + models
- [x] Tests: new user picks preset → upload → clip in ≤3 clicks
- [x] Commit `phase 4: ...`

## Phase 5 — Margin + growth
- [x] Self-hosted Wan/LTX endpoint adapter (RunPod Serverless) as "Fast" tier
- [x] Referrals: both sides credited after referee's first purchase
- [x] Watermark free-tier outputs
- [x] Abuse limits: 1 bonus per device/IP fingerprint, per-user rate limit, disposable email block
- [x] Admin margin dashboard (revenue vs cost_usd by model per day)
- [x] Tests
- [x] Commit `phase 5: ...`

## Phase 6 — Launch polish
- [ ] Landing page (video wall, pricing, FAQ)
- [ ] Legal pages (Terms, Privacy, Acceptable Use, Refunds)
- [ ] SEO pages `/presets/[slug]` + sitemap/robots
- [ ] DEPLOY.md (Vercel CLI not logged in)
- [ ] HANDOFF.md
- [ ] Commit `phase 6: ...`

## NEEDS FROM M
All features run against mocks today. Add these to `.env.local` (and Vercel) to switch each one to real:
- [ ] `FAL_KEY` (fal.ai → Dashboard → Keys; add billing). Then re-check prices in docs/PROVIDER_REFERENCE.md (sourced from search; Kling v3 pricing conflicting) and run one smoke generation per model (≤ $2 total).
- [ ] `OPENAI_API_KEY` for moderation (free endpoint). Without it only the local keyword rules run and images are not scanned.
- [ ] `RESEND_API_KEY` + verified sending domain → `EMAIL_FROM` ("your video is ready" emails; currently logged to console).
- [ ] Optional backup: `REPLICATE_API_TOKEN` + `REPLICATE_WEBHOOK_SECRET` (GET /v1/webhooks/default/secret). No Replicate models are seeded yet.
- [ ] Stripe TEST keys: `STRIPE_SECRET_KEY` (sk_test_…) and `STRIPE_WEBHOOK_SECRET` (`stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally; a Dashboard webhook endpoint on Vercel) subscribed to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.deleted`. Enable the Customer Portal in Stripe settings.
- [ ] **Real preset preview videos.** All 20 presets use 5 per-category placeholder clips (`public/presets/placeholder-*.mp4`).
  Run each preset once on fal (or MOMOBEAST) and upload the result in Admin → Presets → "upload preview".
- [ ] Self-hosted Draft tier: build/push `workers/runpod-ltx`, create a RunPod Serverless endpoint, then set
  `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, `SELF_WEBHOOK_SECRET` (see docs/SELF_HOSTED.md). Measure real GPU cost/clip and
  update the Draft model's `api_cost_usd` in Admin → Models.
- [ ] Replace `public/watermark.png` with the real brand logo (keep it wide, ~420×90, semi-transparent backdrop).
- [ ] Supabase project: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`; run migrations; enable Google provider (Google Cloud OAuth client id/secret)

## Decisions / notes
- Docker isn't available in the build sandbox, so the Supabase CLI stack can't run. Migrations are tested against plain
  Postgres 16 with a small auth/storage shim (`tests/sql/supabase-shim.sql`).
- Next.js 16: `middleware.ts` is now `src/proxy.ts`. Cache Components is disabled to keep auth'd pages simple (all dynamic).
- Mock backend = JSON file DB (`.data/mock-db.json`) + HMAC-signed session cookie; it mirrors the SQL ledger rules.
- Providers whose key is missing fall back to the mock adapter per job (job.provider records which adapter ran).
- Lost webhooks / localhost dev: polling `/api/jobs?ids=` reconciles pending jobs with the provider's status API;
  jobs pending > 30 min are failed + refunded.
- No real generation smoke test was run (no FAL_KEY) — $0 spent.
- Stripe idempotency: ledger `stripe_event_id` stores a per-payment key (`cs:<session>` / `in:<invoice>`), stronger than the
  raw event id (two different events for one payment can't double-credit). Raw event ids are logged in `stripe_events`.
- Prices are inline `price_data` (no Stripe Dashboard products needed). Pack prices live in `src/lib/pricing.ts`.
- 3-click preset flow: tile → consent checkbox → choose photo (choosing the photo uploads AND starts the job; the
  cost is printed on the upload button beforehand). Fast presets cost 24 credits = the signup bonus.
- Images are downscaled in the browser to ≤2048px/3.5 MB (Vercel's ~4.5 MB request cap).
- Presets are checked against the same IP/public-figure rules as user prompts when saved in admin.
- Production safety: with a real Supabase backend, models whose provider has no key are hidden/unusable (no silent mock
  outputs to paying users). `MOCK_PROVIDERS=true` overrides for staging.
- Signup bonus is now granted by the app (`claimSignupBonus`), not the DB trigger: max 1 per device cookie, 3 per IP
  (`SIGNUP_MAX_PER_IP`), stored as salted hashes. Disposable email domains are rejected at signup.
- Referral: `?ref=CODE` cookie (30 days) → `referred_by` on new accounts (<1h old) → both get 50 credits on the
  referee's first purchase/subscription payment; idempotent per referee.
- Watermark: free-plan jobs (`input_json.watermark`) get `public/watermark.png` burned in bottom-right via ffmpeg-static;
  if ffmpeg fails the clean file is stored (never fail a paid generation over a watermark).
- Margin: revenue = credits spent on non-failed jobs × (cash in ÷ all credits issued incl. free ones); cost includes failed jobs.
- Signup bonus = 24 credits = one 6s "Fast" clip.
