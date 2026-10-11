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
- [ ] Provider adapter interface (`submit`, `status`, `parseResult`) + fal, replicate, self (RunPod), mock adapters
- [ ] Seed 4–6 models (cheap, mid, premium, i2v, t2i) with credit_cost ≈ 3x API cost
- [ ] Moderation (OpenAI omni-moderation + local blocklist, consent checkbox for faces)
- [ ] `/api/generate`: validate → balance → moderation → debit → submit → insert job
- [ ] `/api/webhooks/fal` (+ replicate, self): verify signature → re-upload to storage → succeed, or fail + refund
- [ ] Generate page: model picker, prompt, image upload, duration/aspect (9:16 default), live status, library grid + download
- [ ] Tests: Vitest (adapters, signature verify, refund), Playwright generate 9:16 + forced failure refund
- [ ] Commit `phase 2: ...`

## Phase 3 — Payments
- [ ] Stripe Checkout for packs (Starter/Creator/Pro) + monthly plan
- [ ] `/api/webhooks/stripe` idempotent on `stripe_event_id`
- [ ] Mock Stripe adds credits instantly
- [ ] Billing page: balance, ledger history, buy more
- [ ] Tests: purchase adds credits exactly once even if webhook fires twice
- [ ] Commit `phase 3: ...`

## Phase 4 — Presets
- [ ] Preset gallery homepage with categories + autoplay previews
- [ ] 15–20 launch presets (product ads, camera moves, effects, UGC)
- [ ] Preset run flow: upload photo / subject → generate (≤3 clicks)
- [ ] Admin (role-gated) CRUD for presets + models
- [ ] Tests: new user picks preset → upload → clip in ≤3 clicks
- [ ] Commit `phase 4: ...`

## Phase 5 — Margin + growth
- [ ] Self-hosted Wan/LTX endpoint adapter (RunPod Serverless) as "Fast" tier
- [ ] Referrals: both sides credited after referee's first purchase
- [ ] Watermark free-tier outputs
- [ ] Abuse limits: 1 bonus per device/IP fingerprint, per-user rate limit, disposable email block
- [ ] Admin margin dashboard (revenue vs cost_usd by model per day)
- [ ] Tests
- [ ] Commit `phase 5: ...`

## Phase 6 — Launch polish
- [ ] Landing page (video wall, pricing, FAQ)
- [ ] Legal pages (Terms, Privacy, Acceptable Use, Refunds)
- [ ] SEO pages `/presets/[slug]` + sitemap/robots
- [ ] DEPLOY.md (Vercel CLI not logged in)
- [ ] HANDOFF.md
- [ ] Commit `phase 6: ...`

## NEEDS FROM M
All features run against mocks today. Add these to `.env.local` (and Vercel) to switch each one to real:
- [ ] Supabase project: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`; run migrations; enable Google provider (Google Cloud OAuth client id/secret)

## Decisions / notes
- Docker isn't available in the build sandbox, so the Supabase CLI stack can't run. Migrations are tested against plain
  Postgres 16 with a small auth/storage shim (`tests/sql/supabase-shim.sql`).
- Next.js 16: `middleware.ts` is now `src/proxy.ts`. Cache Components is disabled to keep auth'd pages simple (all dynamic).
- Mock backend = JSON file DB (`.data/mock-db.json`) + HMAC-signed session cookie; it mirrors the SQL ledger rules.
- Signup bonus = 24 credits = one 6s "Fast" clip.
