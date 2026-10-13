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
- [x] Landing page (video wall, pricing, FAQ)
- [x] Legal pages (Terms, Privacy, Acceptable Use, Refunds)
- [x] SEO pages `/presets/[slug]` + sitemap/robots
- [x] DEPLOY.md (Vercel CLI not logged in)
- [x] HANDOFF.md
- [x] PostHog funnel events (signup → generation → purchase)
- [x] Commit `phase 6: ...`

## NEEDS FROM M
All features run against mocks today. Add these to `.env.local` (and Vercel) to switch each one to real:
- [ ] `FAL_KEY` (fal.ai → Dashboard → Keys; add billing). Then re-check prices in docs/PROVIDER_REFERENCE.md (sourced from search; Kling v3 pricing conflicting) and run one smoke generation per model (≤ $2 total).
- [ ] `OPENAI_API_KEY` for moderation (free endpoint). Without it only the local keyword rules run and images are not scanned.
- [ ] `RESEND_API_KEY` + verified sending domain → `EMAIL_FROM` ("your video is ready" emails; currently logged to console).
- [ ] Optional backup: `REPLICATE_API_TOKEN` + `REPLICATE_WEBHOOK_SECRET` (GET /v1/webhooks/default/secret). No Replicate models are seeded yet.
- [ ] Stripe TEST keys: `STRIPE_SECRET_KEY` (sk_test_…) and `STRIPE_WEBHOOK_SECRET` (`stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally; a Dashboard webhook endpoint on Vercel) subscribed to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.deleted`. Enable the Customer Portal in Stripe settings.
- [x] **Real preset preview videos.** Done in go-live Step 4 on MOMOBEAST (local models, $0): one clip per preset in
  `public/presets/<slug>.mp4`. Replace any of them in Admin → Presets → "upload preview".
- [ ] Self-hosted Draft tier: build/push `workers/runpod-ltx`, create a RunPod Serverless endpoint, then set
  `RUNPOD_API_KEY`, `RUNPOD_ENDPOINT_ID`, `SELF_WEBHOOK_SECRET` (see docs/SELF_HOSTED.md). Measure real GPU cost/clip and
  update the Draft model's `api_cost_usd` in Admin → Models.
- [ ] Replace `public/watermark.png` with the real brand logo (keep it wide, ~420×90, semi-transparent backdrop).
- [ ] Legal review of `src/lib/legal.ts` (Terms, Privacy, AUP, Refunds are templates) + `LEGAL_COMPANY_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL`.
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` for analytics.
- [ ] Vercel: CLI wasn't logged in, so no preview deploy was made — follow DEPLOY.md.
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

## Status
All 6 phases complete against mocks. Final run: 53/53 Vitest (incl. SQL), 18/18 Playwright, lint + typecheck clean.
Next: HANDOFF.md → "Go live".

---

# GO-LIVE (mocks → real services → Vercel preview)

Rules: $5 cap for step 3; step 4 only at the amount M approves; Stripe TEST keys only; never deploy production; never buy
a domain; RunPod Draft hidden; never commit keys; commit "golive step N: …" after each step.
- 2026-10-12: M lifted two of these in his own words: "Push it live all of it" (commits pushed to PR #3, app deployed
  to the production slot). Still in force: Stripe test keys only, no domain purchase, no keys in commits.
- Business goal stated by M the same day: **monthly subscriptions are the main goal.** Pricing now leads with the
  monthly plan (first card, highlighted, the only lime button); packs are labelled one-off.

## Step 0 — Logins & keys
- [x] CLIs installed: supabase 2.120, vercel 63.1, stripe 1.31, gh 2.89 (gh API works via proxy, admin on repo)
- [x] Vercel connector authenticated as moquinmoreno@gmail.com (Hobby)
- [ ] BLOCKED on M: network allowlist + env-var secrets in the cloud environment settings (see list below), then a new session
- [ ] Verify every key works
- How keys reach the app: the container is ephemeral, so keys live as environment variables in the cloud environment
  settings; the session writes `videoapp/.env.local` from them (gitignored) — never pasted into chat or committed.

## Added during go-live prep
- [x] Midnight Studio redesign (Refero) + scroll-film hero — docs/DESIGN.md
- [x] UGC Ad Studio (/ugc, /ugc/new): scripts → AI creators → voice → captions → edit pipeline — docs/UGC_STUDIO.md
- Step 2 must also price the UGC stages (src/lib/ugc/config.ts) from fal's real pricing.
- Step 4 batch must also include 8 UGC creator portraits + the hero film.
- Optional key: `ANTHROPIC_API_KEY` (AI-written UGC scripts; templates otherwise).

## Local Windows session (2026-10-12, MOMOBEAST)
- [x] Node 24.19 / npm 11.17 present; installed supabase 2.120.0 (`~/.local/bin`), vercel 63.1.2 (npm -g), stripe 1.53.1 (winget)
- [x] `npm install`; typecheck + lint clean; Vitest 54 passed / 9 skipped (SQL tests need a local Postgres); Playwright 21/21
- [x] Windows fixes: ffmpeg `subtitles` filter path (drive colon + backslashes) in `src/lib/ugc/assemble.ts`;
  race in the phase 5 watermark e2e (it could read the earlier free job's card)
- [x] Logins: vercel (moquinmoreno-1021, team "kom's projects"), stripe CLI (account `elegantad.carrd.co` — M to confirm
  it is the right account; test mode only)
- [x] `supabase login` — browser flow, approved in M's signed-in Chrome (the CLI needs `--output-format text` and a
  pseudo-terminal when launched from an agent session; it silently refuses to prompt otherwise)
- [x] `.env.local` created (M said "do it all"): app URL, brand, session secret, admin email, Supabase URL + keys,
  `SUPABASE_DB_PASSWORD`. M then supplied `FAL_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY` and `NEXT_PUBLIC_POSTHOG_KEY`
  (OpenAI moderation and the Resend key verified with free calls). Still empty: `STRIPE_SECRET_KEY` (M sent a key id
  starting `mk_`, which is not the `sk_test_` secret) and `STRIPE_WEBHOOK_SECRET`.
- Resend has no verified sending domain yet, so `EMAIL_FROM` is the Resend test sender (`onboarding@resend.dev`),
  which only delivers to the Resend account owner. Real "video ready" emails and Supabase custom SMTP need a domain.
- [x] Mocked runs (`npm run dev:mock`, Playwright e2e) now blank the real keys from `.env.local`, so tests cannot send
  email, analytics or moderation calls to real services. (One e2e run before this fix sent test events to PostHog.)
- [x] `npm run dev:mock` now runs `scripts/dev-mock.mjs`, so it works from cmd/PowerShell (was POSIX `VAR=value` syntax).
- `npm audit`: 5 "high" findings are all one advisory in `braces`, pulled in only by `eslint-config-next` (lint tooling,
  not shipped). The only offered fix is `--force` with breaking changes; left alone.

## Step 1 — Supabase  - [x] (Google sign-in still open)
- Project `reelforge`, ref `slgadvjriexkanskzgva`, us-east-1, free plan, org "moquinmoreno@gmail.com's Org".
- All 5 migrations applied with `supabase db push`; `seed.sql` applied (9 models, 20 presets, 8 UGC actors); buckets
  `outputs` (public) + `uploads` (private) exist; realtime on `jobs`.
- Auth: Site URL = https://reelforge-preview.vercel.app; redirect URLs `https://reelforge-preview.vercel.app/**` and
  `http://localhost:3000/**` (exact `/auth/callback` entries do NOT match `?next=…` — see DEPLOY.md). Confirm email is on.
- Verified against the real project (`npx playwright test -c playwright.live.config.ts`, providers + Stripe mocked):
  auth trigger → profile, login, purchase → ledger RPC, generation → job row → output in the public bucket, forced
  failure → exactly one refund. Real email signup also checked: user, both fingerprints and the 24-credit bonus land.
- Finding: both confirmation emails to Gmail had their one-time link opened ~15 s after sending by something other
  than the test (mail link scanning), so the user's own click lands on `/login?error=auth` although the account IS
  confirmed. The login page now says so.
- Sturdier fix is BUILT BUT NOT ACTIVE: `/auth/confirm` (a button spends the token, so scanners and other devices
  can't burn it) + `supabase/templates/confirmation.html` + `supabase/config.toml`. Supabase refuses template changes
  on the free tier with the built-in mailer ("configure a custom SMTP provider"). Once SMTP (Resend) is set up, run
  `supabase config push` and the new flow is live; nothing else changes.
- [ ] Google provider: needs a Google Cloud OAuth client id/secret pasted into Supabase → Authentication → Providers.
- [ ] Built-in Supabase email is limited to a couple of messages per hour; set up custom SMTP (Resend) before real users.
## Step 2 — fal pricing (≥60% margin)  - [x]
Prices re-read from fal.ai model pages 2026-10-12; table in docs/PROVIDER_REFERENCE.md. Worst-case margin (credit at $0.076):
ltx-fast / ltx-i2v 80%, wan-26 74%, kling-3 / kling-3-i2v 86%, veo-31 67%, flux 92–96%, UGC standard 71%, UGC premium 67%.
- Changed: Kling v3 standard is $0.084/s audio off, not $0.168 (that was Pro with audio) → `api_cost_usd` 0.84 → 0.42.
  Credits left at 8/s until Step 3 confirms the real charge (billing metadata on the page shows a $0.14/s base unit).
- Changed UGC stage costs: voice $0.10 → $0.05 per 1k chars, avatar standard $0.12 → $0.0562/s, premium $0.20 → $0.16/s.
  UGC ad credits are computed from these, so UGC ads got cheaper for users (a ~20 s standard ad with b-roll: about 130 → about 71 credits).
- Unchanged and confirmed: LTX 2.3 fast $0.06/s @1080p, Wan 2.6 $0.10/s @720p, Veo 3.1 $0.40/s with audio, nano-banana ~$0.04.
- FLUX schnell bills per megapixel rounded up: sizes over 1 MP cost $0.006, not $0.003 (margin still > 90%).
## Step 3 — Real smoke test (≤ $5)  - [ ] (blocked: the fal account has no balance)
The test exists: `tests/live/real-providers.spec.ts` (one real generation per model + one UGC ad through the whole
pipeline; skipped unless `SMOKE_REAL=1`; `SMOKE_ONLY=slug,…` reruns a subset without paying twice). First call
(FLUX, $0.003) on 2026-10-12: fal answered 403 "User is locked. Reason: Exhausted balance" → the job was refunded
and recorded at $0 cost, which is the correct behaviour. $0 spent. Top up at fal.ai/dashboard/billing, then run
`npx next dev` and `SMOKE_REAL=1 npx playwright test -c playwright.live.config.ts real-providers`.
Known limit: a library creator's portrait is served by this app, so fal cannot fetch it from localhost or from a
preview behind Vercel login; the smoke test casts an uploaded creator instead. Works once the site is public.
Planned at list prices: ltx-fast 6s $0.36, wan-26 5s $0.50, kling-3 5s $0.42, veo-31 4s $1.60, ltx-i2v 6s $0.36,
kling-3-i2v 5s $0.42, flux $0.003, one ~10 s standard UGC ad without b-roll ≈ $0.61 → ≈ $4.27 (≈ $4.83 if Kling bills $0.14/s).
## Step 4 — Preset previews, creator portraits, hero film  - [x] (made with local models, $0)
M chose local generation on MOMOBEAST instead of fal (the fal estimate was ≈ $8.60–11.10). Done 2026-10-12:
- 20 preset previews: `public/presets/<slug>.mp4` (576×1024, 5.2 s, silent H.264, 96 KB–1.2 MB) + first-frame poster
  `<slug>.jpg` (the teaser's poster is its lit last frame). Source photos: Krea 2 Turbo; motion: MiniMax H3 FL2VA
  pruned PDD in Wan2GP, with each preset's own prompt. About 4 minutes per clip on the RTX 5080.
- 8 UGC creator portraits: `public/ugc/actors/<slug>.jpg` (576×1024), fictional adults matching each creator's
  listed age range and setting.
- Hero film: `media/hero-film.mp4` (plain listing photo → finished ad, 4.5 s) → 72 frames in `public/film/`.
- Catalog: `src/lib/seed-data.ts` points every preset at its own files; `supabase/seed.sql` regenerated and applied.
- Everything shown is fictional and unbranded. Retaken for that reason or for a weak effect: Crash Zoom (the
  first sneaker close-up grew a brand-like stripe), 360 Spin, Orbit, Teaser, Turn into Figurine.
- Caveat: the previews come from a local model, not from the hosted LTX 2.3 / Kling v3 that customers get, and each
  starts from a photo already staged for the effect. They show the preset's look, not a guaranteed result.
- Prompts, scripts, source stills and raw renders: `~/Projects/reelforge-previews` on MOMOBEAST (see its README).
## Step 5 — CI on PRs + pushes  - [x] (green on PR #3: lint/typecheck/unit+SQL and Playwright e2e)
## Step 6 — Vercel preview + webhooks + e2e against preview  - [ ] (preview is up; webhooks + logged-in e2e open)
- Vercel project `reelforge` (team "kom's projects", Hobby). Preview: https://reelforge-preview.vercel.app (stable alias,
  behind Vercel login). Preview env: Supabase keys, app URL, session secret, admin email, `MOCK_PROVIDERS=true`,
  `MOCK_STRIPE=true`, plus (2026-10-12) `FAL_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM` and the PostHog key
  and host. The mocks stay on until fal has balance and the Stripe test key exists. No production env vars are set.
  Redeployed 2026-10-12 with the Step 4 media; all 20 preview clips, portraits and film frames are served.
- INCIDENT: Vercel auto-promoted the project's first deployment to production (twice, the second time despite
  `--target=preview`). Both were removed within about a minute; they had no env vars and, because of the framework
  preset, served only 404s. The production slot now holds an empty "Nothing here" page so app deploys stay previews.
- Fixed for Vercel: `vercel.json` pins the Next.js preset (was "Other" → every route 404); `assets/fonts/**` added to
  `outputFileTracingIncludes` (UGC caption fonts were not shipped with the functions).
- Checked on the preview without logging in: landing page, 20 presets read from Supabase, real-auth signup page,
  `/api/me` → 401.
- 2026-10-12, at M's request ("make the site live so I can see it"): Vercel Authentication switched off for the
  project, so https://reelforge-preview.vercel.app opens for anyone without a Vercel login. It is still a preview
  deployment on mocked providers and mocked Stripe; the production slot still holds the empty placeholder.
  `robots.txt` disallows everything on Vercel previews. Turn the wall back on with
  `vercel project protection enable reelforge --sso`.
- [ ] Logged-in e2e on the preview (M runs it, or after keys): `LIVE_BASE_URL=https://reelforge-preview.vercel.app`.
- [ ] Stripe test webhook endpoint on the preview (needs `STRIPE_SECRET_KEY`; Deployment Protection blocks webhooks
  unless the URL carries the bypass secret).
- [ ] Remove `MOCK_PROVIDERS` from the preview env once Step 3 passes, and `MOCK_STRIPE` once the Stripe test key
  exists, then redeploy.

---

# STAND-OUT FEATURES (2026-10-12, asked for by M)

Three things most AI-video sites don't do. All built, tested in mock mode and against the real Supabase project.

## 1. Try it on your product, before sign-up  - [x]
- Landing section `#try` (`components/landing/try-stage.tsx`): paste a store link or upload a photo → the photo shows
  on the card → the page re-labels itself for that product ("Pick a look for …", "Your photo" on tiles) and a small
  bar (`components/try-bar.tsx`) follows the visitor with "Make my ad free".
- Link reader (`lib/try/net.ts`, `lib/try/product-page.ts`): reads schema.org Product data and Open Graph tags.
  Checked on a real Shopify product page (siquemasupplements.com). It can only reach the public internet: http/https,
  default port, no credentials, every resolved address checked at connect time, redirects re-checked, size and time
  capped. Sites that block bots (Amazon often does) fall back to "upload the photo instead".
- State: table `try_sessions` (migration `20261012000006_try.sql`, applied; service role only) + files in the private
  `uploads` bucket under `try/<id>/`. The browser holds a signed cookie `rf_try`. Everything is deleted after 7 days
  (swept when a new session starts); the Privacy text says so. Consent is required before either path and is logged
  against the user id when the photo is carried into an account.
- Hand-off: sign-up keeps `next=/presets/<slug>`; the preset page offers the previewed photo with one button showing
  the cost (`data-testid="generate-carried"`). It does not start by itself: nothing is charged without a click.

## 2. One free ad frame before sign-up  - [x] built; real output unverified until fal has balance
- `POST /api/try/still` asks `fal-ai/nano-banana/edit` for one 9:16 frame of the visitor's product in one of three
  looks (`lib/try/looks.ts`: Studio hero → hero-shot, Sunlit home → lifestyle-scene, Water splash → liquid-splash),
  shown with a drag-to-compare slider. After sign-up that frame is what the preset animates.
- Cost and limits (env, defaults): about $0.04 per frame; `TRY_STILLS_PER_SESSION=2`, `TRY_STILLS_PER_IP_DAY=4`,
  `TRY_STILLS_PER_DAY=150` (site-wide ceiling, so at most about $6 a day), `TRY_SESSIONS_PER_IP_DAY=6`. A failed
  frame does not use up a free preview.
- With mocked providers (the preview today) the frame is the poster of the matching preset, labelled
  "Sample frame (demo mode)". It is never presented as the visitor's product.

## 3. The feed  - [x]
- `/feed` (`components/feed/feed.tsx`): every preset clip full-screen, one per swipe, only the visible one plays;
  each has "Make this with my product" (or the product's name in try mode). `/feed#<slug>` opens on that clip;
  arrow keys work on desktop. Linked from the header and from under the clip wall ("Swipe through all 20").
- The phone landing page keeps its hero (round 2 fixed it); the feed is one tap away instead of replacing it.

## Tests
- `tests/unit/try.test.ts` (48 cases: address rules, URL rules, capped fetching against a local server, product-page
  parsing) and `tests/e2e/try-and-feed.spec.ts` (preview → sign-up → one-click clip; private links refused; feed).
- Totals: 102 unit tests pass (9 SQL tests skipped locally), 24/24 end-to-end.

## Open
- [ ] Real frame quality and cost: run once fal has balance (`MOCK_PROVIDERS` off), check product fidelity per look.
- Email confirmation: the confirmation link now returns to the page the sign-up started from (`next` is carried
  into `emailRedirectTo`), so the previewed photo is waiting when the link is opened in the same browser. Opened
  on another device, the account works but the preview photo is not there (it is tied to the browser cookie).
- [ ] Looks and copy are first drafts; the design session can restyle `try-stage.tsx`, `try-bar.tsx` and `feed.tsx`
  freely as long as the `data-testid`s stay.

## Production (2026-10-12)
- Production URL: https://reelforge-phi-six.vercel.app (Vercel's default domain; no custom domain bought).
- It runs in **demo mode** until two things exist: fal balance (then remove `MOCK_PROVIDERS`) and the Stripe key
  (then remove `MOCK_STRIPE`). While either is on, a white line above the header says so (`components/demo-banner.tsx`)
  and `robots.txt` disallows everything, so the demo is not indexed. Both switch off by themselves.
- Production env: same keys as the preview, its own `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` = the production URL.
- Deploy: `vercel deploy --prod --yes`. Preview: `vercel deploy --yes --target=preview` + `vercel alias set`.
- Monthly tiers: built on 2026-10-12, see "MONTHLY PLAN TIERS" below.
- Supabase auth: Site URL is now the production URL; allowed redirects are production, preview and localhost
  (`supabase/config.toml` `[auth]`, pushed with `supabase config push`; email confirmations still on).

## MONTHLY PLAN TIERS (2026-10-12)
M's goal is monthly subscriptions, and asked for tiers ("Just do it" to the $19 / $49 / $99 suggestion).

| plan | id | price | credits / month | per credit | worst-case margin |
|---|---|---|---|---|---|
| Solo | `monthly` | $19 | 250 | $0.076 | 67% |
| Growth | `monthly-growth` | $49 | 700 | $0.070 | 64% |
| Studio | `monthly-studio` | $99 | 1,500 | $0.066 | 62% |

- All numbers live in `MONTHLY_PLANS` (`src/lib/pricing.ts`). The entry plan keeps the id `monthly`.
- **Margin check.** Bigger plans cost less per credit, and that discount comes out of margin: credit costs did NOT go
  up. Credit costs are still set against `CREDIT_BASIS_USD` ($0.076, the entry plan); `CREDIT_FLOOR_USD` is now the
  cheapest price anyone can pay (Studio). `tests/unit/pricing.test.ts` fails the build if any pack or plan leaves less
  than `MIN_MARGIN` (60%, before Stripe fees) on any seeded model at any duration, or on any UGC ad. Worst case in the
  table is Veo 3.1 (128 credits for $3.20 of API cost). Stripe's fee (2.9% + 30c) takes Studio to about 60%.
  The API costs behind this are still the published fal prices; Step 3 has not measured them.
- **Changing plan** (`changePlan` in `src/lib/billing.ts`, confirm step on `/billing?change=<id>`): every invoice is a
  full plan price for a full plan's credits, so credits can't be bought below a plan's rate by hopping plans.
  Upgrade = charged the new price now, billing month restarts, new credits arrive with that invoice, nothing prorated.
  Downgrade = nothing charged now, applies from the next renewal. Terms and Refund policy say the same.
- **State.** `profiles.subscription_plan` (migration `20261012000007_plans.sql`, applied to the Supabase project).
  `profiles.plan` is still `monthly` for any subscriber.
- **Stripe.** Each plan bills against a fixed product id (`videoapp_plan_monthly`, `..._growth`, `..._studio`), created
  on first use, so an invoice says which plan it charged.
- **Verified against real Stripe (test mode) on 2026-10-13**, with `scripts/stripe-real-check.mjs`: local dev server
  on the mock DB, real Stripe Checkout (test card 4242), real webhooks through `stripe listen`. 16 of 17 checks pass:
  subscribe to Solo (+250, product `videoapp_plan_monthly`, $19); the confirm step changes nothing by itself; upgrade
  to Growth (one subscription, $49 invoice in full with `billing_reason=subscription_update`, +700 once, billing
  anchor reset); switch down to Solo (no invoice, no credits, next renewal previews at $19); customer portal opens;
  cancel at Stripe drops the plan and keeps credits; Starter pack (+100).
  NOT verified: an actual monthly renewal. It needs a Stripe test clock, and the key used could not create one.
- The key was a throwaway sandbox from `stripe sandbox create` (CLI profile `reelforge-sandbox`, account
  `acct_1UPtcDFPadOlhmYs`, expires 2026-10-20 unless claimed). It is NOT in `.env.local` or on Vercel: preview and
  production still run `MOCK_STRIPE`. M's own Stripe login in the CLI (`elegantad.carrd.co`) is live-mode only and
  was not used. To finish: a real `sk_test_` key from the account M wants, then re-run the script (it also does the
  renewal step) and wire the deployed webhook.
- Pricing UI: three plan cards first (Growth highlighted, the only lime button), packs as a quieter row below. The
  "Save N% per credit" tags are computed from the numbers, against Solo.

## GOOGLE SIGN-IN (2026-10-13)
- M hit Supabase's "Unsupported provider: provider is not enabled" from the "Continue with Google" button, then asked
  for Google sign-in to be set up.
- App: the button is shown only while the Supabase project reports Google as enabled (`googleSignInEnabled()` in
  `src/lib/auth/index.ts`, reads `/auth/v1/settings`, cached 5 minutes). No env flag.
- Google Cloud (M's account): project "Reelforge" (`flawless-age-511507-u6`); consent screen "Reelforge", External,
  published ("In production"), home / privacy / terms links on the production URL, authorized domain
  `reelforge-phi-six.vercel.app`; web client "Reelforge web (Supabase)" with redirect URI
  `https://slgadvjriexkanskzgva.supabase.co/auth/v1/callback`. Scopes are only email + profile, so no verification
  is required.
- Supabase: `[auth.external.google]` enabled with that client (`supabase/config.toml`; id and secret come from
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env.local`).
- Checked: the button is back on production `/signup` and `/login`, and clicking it reaches Google's account
  chooser with no error.
- 2026-10-13: M completed a Google sign-in on production. `/dashboard` then showed M's Gmail address, 24 credits,
  Free plan, and the Admin link, so the `/auth/callback` leg works with a Google user. A Google sign-in page left
  open for hours fails with Google's own "400 malformed" page; a fresh click on "Continue with Google" fixes it.
- Known limit: Google's screen says "continue to slgadvjriexkanskzgva.supabase.co" until there is an own domain
  (then: brand verification, or a Supabase custom domain).

