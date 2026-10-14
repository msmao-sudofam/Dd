# BUILD_PLAN.md — White-Label AI Video Platform

> Drop this file in an empty project folder and tell Claude Code: "Read BUILD_PLAN.md and execute Phase 1. Stop at the end of each phase so I can test."

---

## 0. Reality check (read first)

- **Do not train a model.** Training a video foundation model costs millions in GPU time. Higgsfield doesn't do it either. They wrap third-party models (Kling, Veo, Seedance, Hailuo/MiniMax, Wan, etc.) and sell **presets, UX, and convenience** on top.
- **What you're actually building:** your brand on top of model APIs, plus a credit system with markup. Your moat is presets/templates (camera moves, ad formats, effects) and distribution (TikTok/IG), not the model.
- **Phase 2 margin play:** self-host an open-weight model (Wan 2.x / LTX) on rented serverless GPUs for cheap tiers. Not your home PC — MOMOBEAST is for testing presets, not serving paying customers.
- **Check each provider's terms** allow resale/white-label before launch. Most API providers (fal.ai, Replicate, Kling API) allow building products on top; verify current terms.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript + Tailwind | Deploys clean to Vercel |
| Hosting | Vercel | You already deploy through it |
| Auth + DB + Storage | Supabase (Postgres, Auth, Storage) | One service, row-level security |
| Payments | Stripe (Checkout + webhooks) | Credit packs + subscriptions |
| Model gateway | **fal.ai** (primary), Replicate (backup) | One API key → dozens of video/image models, async queue + webhooks |
| Self-hosted (Phase 5) | RunPod Serverless or Modal running Wan/LTX | Cheaper per clip at volume |
| Moderation | Provider-side filters + OpenAI moderation on prompts + image check on uploads | Required — see §7 |
| Analytics | PostHog | Funnel: signup → first gen → purchase |
| Email | Resend | Receipts, "your video is ready" |

---

## 2. Core data model

```
profiles        id, email, credits_balance, plan, created_at, referral_code, referred_by
credit_ledger   id, user_id, delta (+/-), reason (purchase|generation|refund|signup_bonus|referral), job_id, stripe_event_id, created_at
models          id, slug, provider (fal|replicate|self), provider_model_id, type (t2v|i2v|t2i|i2i), credit_cost, max_duration, enabled
presets         id, slug, name, thumbnail_url, preview_video_url, model_id, prompt_template, params_json, category, is_featured
jobs            id, user_id, model_id, preset_id, input_json, status (queued|running|succeeded|failed|refunded), provider_request_id, output_url, credits_charged, cost_usd, error, created_at, completed_at
```

Rules:
- `credits_balance` only changes through `credit_ledger` inserts inside a Postgres function (atomic, no race conditions).
- Charge credits when the job is **submitted**; auto-refund on failure.
- Store `cost_usd` per job so you can see real margin per model.

---

## 3. Phases (have Claude Code stop after each)

### Phase 1 — Skeleton + auth (day 1)
- Scaffold Next.js + Tailwind + Supabase client.
- Email + Google login via Supabase Auth.
- Supabase migrations for all tables in §2, with RLS (users only read their own rows).
- Signup trigger: create profile + 1 small `signup_bonus` (enough for ~1 cheap generation).
- `.env.example` with every key needed. No secrets committed.
- **Done when:** I can sign up, log in, and see my credit balance.

### Phase 2 — Generation engine (days 2–4)
- `/api/generate`: validate input → check balance → moderation check → debit credits → submit to fal queue with webhook URL → insert job.
- `/api/webhooks/fal`: verify signature → download output → re-upload to Supabase Storage (provider URLs expire) → mark job succeeded, or failed + refund.
- Provider adapter interface (`submit`, `status`, `parseResult`) so fal / Replicate / self-hosted are swappable.
- Seed `models` with 4–6 models: one cheap fast tier, one mid, one premium, plus image-to-video and text-to-image. Look up current model IDs and per-second pricing on fal at build time; set `credit_cost` at **3x API cost** to start.
- Generate page: model picker, prompt, image upload, duration/aspect (9:16 default), live job status (Supabase realtime), library grid of past outputs with download.
- **Done when:** I can generate a 9:16 clip, see it land in my library, and a forced failure refunds me.

### Phase 3 — Payments (days 5–6)
- Stripe Checkout for credit packs (e.g. Starter / Creator / Pro) + optional monthly plan that grants credits each cycle.
- `/api/webhooks/stripe`: idempotent on `stripe_event_id`, credits added via ledger.
- Billing page: balance, ledger history, buy more.
- Use Stripe test mode end to end before going live.
- **Done when:** a test card purchase adds credits exactly once, even if the webhook fires twice.

### Phase 4 — Presets = the product (days 7–10)
- Preset gallery homepage: autoplaying preview tiles, categories (Camera Moves, Product Ads, UGC, Effects, Viral Trends).
- Each preset = locked model + prompt template + params; user only uploads a photo and/or types a short subject.
- Launch presets (start with 15–20):
  - **Product ad pack** (for small brands — your real buyer): product photo → 360 spin, unboxing, hero shot, "floating on water", lifestyle scene.
  - **Camera moves:** crash zoom, orbit, dolly in, FPV fly-through, bullet time.
  - **Effects:** explode/disintegrate, melt, turn into figurine, inflate.
  - **UGC-style:** person holding product, talking-head intro (only with user's own photo).
- Admin page (role-gated) to add/edit presets and models without code.
- Build and test presets on MOMOBEAST/fal before publishing; every preset needs a real preview video.
- **Done when:** a new user can pick a preset, upload one photo, and get a usable clip in under 3 clicks.

### Phase 5 — Margin + growth (weeks 3–4)
- Self-hosted Wan/LTX endpoint on RunPod Serverless or Modal, wired through the adapter as the "Fast / cheap" tier.
- Referral system: both sides get credits after referee's first purchase (not signup — prevents farming).
- Watermark on free-tier outputs (small logo corner) = free ads every time someone posts.
- Abuse limits: 1 signup bonus per device/IP fingerprint, rate limit per user, block disposable emails.
- Margin dashboard (admin): revenue vs `cost_usd` by model, per day.
- **Done when:** I can see profit per model and the cheap tier runs on my own endpoint.

### Phase 6 — Launch polish
- Landing page (one finished page, 9:16 video wall, pricing, FAQ), legal pages (Terms, Privacy, Acceptable Use, Refund policy).
- SEO pages per preset (`/presets/[slug]`) with the preview video — free search traffic.
- Deploy to Vercel, custom domain, Stripe live mode.

---

## 4. Unit economics (fill in real numbers at build time)

```
API cost per 5s clip (model X)      = $A
Credits charged                     = C
Price per credit (from your packs)  = $P
Gross margin per clip               = (C × P) − A     → target ≥ 60%
```
- Rule of thumb: price premium models at 3x cost, cheap models at 4–5x (users don't notice, volume is there).
- Failed jobs refund the user but you may still get billed — track it.
- Free credits are your CAC. Cap them.

---

## 5. TikTok / Instagram ad plan

The product makes its own ads. Every preset output is content.

**Organic (start week 1 of build, not after launch):**
- Account per platform under the brand. 2–3 posts/day.
- Formats that work for AI video tools:
  1. "I turned this $10 product photo into a commercial" — before/after split.
  2. Preset showcase: same photo through 5 presets, fast cuts.
  3. "Brand owners are paying $2k for this ad. Took me 30 seconds." — aim at Shopify/small biz owners.
  4. Trend hijack: recreate whatever AI effect is viral that week as a preset, post within 48h.
  5. Behind-the-scenes building it (founder content — student running multiple businesses is a hook).
- Bio link → landing page with free credits.

**Paid (once organic shows which hooks retain):**
- Boost winning organic posts (Spark Ads on TikTok, boosted Reels on Meta) rather than making new ad creative.
- Optimize for purchase, not signup. Small daily budget per ad set, kill anything with weak cost per purchase after ~3 days, scale winners.
- Retarget site visitors who generated but didn't buy.

**Disclosure:** label AI-generated content where platforms require it (TikTok and Meta both have AI-content labeling rules; check current policies).

**Your unfair advantage:** you already run multiple stores and client sites. Use your own brands (LYFESTYLE, SI QUEMA, dropship store) and NOCTURNE clients as the first case studies.

---

## 6. Autonomous run instructions (for Claude Code)

**Run all phases 1 → 6 in order without stopping between them.** Rules:

1. **Track progress in `PROGRESS.md`.** Before each phase, write its checklist. Tick items as they're done. If a session ends mid-build, the next session reads `PROGRESS.md` and resumes from the first unticked item.
2. **Never stop for missing API keys.** If a key in `.env.local` is empty, build the feature anyway against a mock adapter (`MOCK_PROVIDERS=true` returns a sample video after 5s; mock Stripe adds credits instantly). Log every missing key in `PROGRESS.md` under "NEEDS FROM M". Real providers switch on the moment keys are added.
3. **Each phase's "Done when" line is the acceptance test.** Write an automated test for it (Vitest for logic, Playwright for flows). Don't move to the next phase until it passes (against mocks if keys are missing).
4. **Commit to git after every phase** with message `phase N: <summary>`.
5. **Look things up, don't guess.** Pull current fal.ai model IDs/pricing, Stripe API usage, and Supabase docs at build time.
6. **Spend no real money.** Stripe stays in test mode. No real generations on fal/Replicate except one smoke test per model, max total cost $2, and only if a key is present.
7. **Don't deploy to production.** Phase 6 ends with a working Vercel preview deploy (via the Vercel CLI if logged in, otherwise leave a `DEPLOY.md` with exact steps). Live Stripe + custom domain is M's call.
8. **Stop only for** a destructive action, a decision that can't be undone, or a blocker with no workaround. Write it in `PROGRESS.md` and ask.
9. **Finish with `HANDOFF.md`:** what's built, how to run it locally, every env var and where to get it, test results, known issues, and the exact steps for M to go live.

### Master prompt (paste once into Claude Code)
```
Read BUILD_PLAN.md fully. Execute Phases 1 through 6 in order, following Section 6 rules exactly. Create PROGRESS.md first with every phase's checklist, then build. Don't stop between phases. Use mocks for any missing API keys and list what you need from me in PROGRESS.md. End with HANDOFF.md.
```

### Resume prompt (if the session ends or runs out of context)
```
Read BUILD_PLAN.md and PROGRESS.md. Resume from the first unticked item and continue through Phase 6 following Section 6 rules.
```

### Go-live prompt (after you add real keys)
```
Read HANDOFF.md. All keys are now in .env.local. Turn off MOCK_PROVIDERS, run the full test suite against real providers in Stripe test mode, run one smoke generation per model, and report results and real cost per clip.
```

Setup on the Windows PC (Command Prompt):
```
mkdir C:\Users\Moqui\projects\videoapp
cd C:\Users\Moqui\projects\videoapp
:: put BUILD_PLAN.md in this folder, then:
claude
```
Accounts to create before Phase 2: Supabase, fal.ai (add billing), Stripe, Vercel project, PostHog, Resend, domain.

---

## 7. Things that will kill this if ignored

- **Deepfakes / real people:** block generating identifiable public figures; only allow face uploads with a "this is me or I have consent" checkbox, logged. This is the #1 legal and payment-processor risk.
- **NSFW:** hard block. Stripe will shut you down otherwise.
- **Minors:** zero tolerance in uploads and prompts; enforce via moderation.
- **Copyright:** block prompts for trademarked characters/brands in presets.
- **Chargebacks:** clear refund policy, credits non-refundable once used, show cost before every generation.
- **Provider dependency:** adapter layer (Phase 2) so if one API raises prices or bans you, you swap in a day.
