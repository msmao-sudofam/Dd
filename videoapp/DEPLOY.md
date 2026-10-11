# Deploying to Vercel (preview first)

The Vercel CLI isn't logged in inside the build environment, so these are the exact manual steps.
Nothing here touches Stripe live mode or a custom domain; those stay M's call (see HANDOFF.md → Go live).

## 0. Prereqs
- Node 20+ locally, `npm i -g vercel supabase`
- Accounts: Supabase, fal.ai (billing on), Stripe (test mode), Vercel, PostHog, Resend, OpenAI

## 1. Supabase
```bash
cd videoapp
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                       # applies supabase/migrations/*
psql "$(supabase db url)" -f supabase/seed.sql   # or paste seed.sql into the SQL editor
```
Then, in the Supabase dashboard:
- **Settings → API Keys**: copy the publishable key (`sb_publishable_…`) and a secret key (`sb_secret_…`).
- **Authentication → URL Configuration**: Site URL = your Vercel URL; add `https://<vercel-url>/auth/callback`
  and `http://localhost:3000/auth/callback` to Redirect URLs.
- **Authentication → Providers → Google**: enable, paste the Google Cloud OAuth client id/secret
  (Google Cloud Console → Credentials → OAuth client → Web; authorized redirect URI = the callback URL Supabase shows).
- **Authentication → Email**: keep "Confirm email" on.
- Storage buckets `outputs` (public) and `uploads` (private) are created by migration 2. Realtime on `jobs` by migration 1.
- Make yourself admin: `update profiles set role = 'admin' where email = 'you@…';` (or set `ADMIN_EMAILS`).

## 2. Vercel project
```bash
cd videoapp
vercel link            # create project; Root Directory = videoapp
```
Add env vars (Project → Settings → Environment Variables, Preview + Production) — every name is in `.env.example`.
Minimum for a real preview: `NEXT_PUBLIC_APP_URL` (the preview URL), `SESSION_SECRET`, the three Supabase vars,
`FAL_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY` (sk_test), `STRIPE_WEBHOOK_SECRET`, `ADMIN_EMAILS`.
Leave `MOCK_*` empty.

```bash
vercel deploy          # preview deployment — NOT --prod
```

Function settings: the webhook/jobs routes declare `maxDuration = 300` (downloading + watermarking clips). That needs
Vercel Fluid compute (default on new projects). `ffmpeg-static` (~80 MB) ships with the API functions via
`outputFileTracingIncludes` in `next.config.ts`.

## 3. Webhooks
- **Stripe (test mode)**: Developers → Webhooks → Add endpoint `https://<vercel-url>/api/webhooks/stripe`, events
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`,
  `customer.subscription.deleted`. Put the signing secret in `STRIPE_WEBHOOK_SECRET`, redeploy.
  Enable Settings → Billing → Customer portal.
- **fal / Replicate / RunPod**: nothing to configure — the app passes `https://<NEXT_PUBLIC_APP_URL>/api/webhooks/<provider>`
  with every job. `NEXT_PUBLIC_APP_URL` must be the public URL for these to arrive (polling covers it otherwise).
- Note: Vercel Deployment Protection blocks provider webhooks on preview URLs. Either disable protection for the
  preview, or add a Protection Bypass for Automation and append `?x-vercel-protection-bypass=<secret>` — simplest is to
  test webhooks on a preview with protection off. Job polling still completes jobs if webhooks are blocked.

## 4. Smoke test on the preview
1. Sign up with email, confirm, check you got 24 credits.
2. Run the "Teaser (no photo)" preset (24 credits, fal LTX) — watch it complete and land in Library.
3. Billing → buy Starter with card `4242 4242 4242 4242` → balance +100 exactly once.
4. Admin → Margin shows the job with its cost.

## Local development
```bash
cd videoapp
npm install
npm run dev:mock        # zero keys: file DB, mock providers, mock Stripe → http://localhost:3000
# or, with keys in .env.local:
npm run dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe   # for Stripe webhooks locally
```
