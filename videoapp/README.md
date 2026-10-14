# Reelforge — white-label AI video platform

One product photo in, a 9:16 video ad out. Next.js 16 + Supabase + Stripe + fal.ai, with mock fallbacks for every service.

- **Start here:** [HANDOFF.md](HANDOFF.md): what's built, how to run it, env vars, go-live steps
- Build plan: [BUILD_PLAN.md](BUILD_PLAN.md) · progress log: [PROGRESS.md](PROGRESS.md) · deploy: [DEPLOY.md](DEPLOY.md)
- Provider notes: [docs/PROVIDER_REFERENCE.md](docs/PROVIDER_REFERENCE.md) · self-hosted tier: [docs/SELF_HOSTED.md](docs/SELF_HOSTED.md)

```bash
npm install
npm run dev:mock   # runs with zero keys
npm test && npm run test:e2e
```
