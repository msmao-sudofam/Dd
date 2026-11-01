# CGC mobile re-audit — November 1, 2026

The current AVIF-first poster and generated-film working tree passes the requested mobile audit. This is a local audit, not a new deployment or a production/field measurement. Freebuff's pending poster and hero edits were preserved; its untracked AVIF assets still need to be included in any later release.

## Three mobile Lighthouse passes

Lighthouse **13.6.0**, Chromium **156.0.0.0**, fresh browser launches, runs in sequence. Mobile emulation: **412×823**, DPR **1.75**, simulated throttling, RTT **150ms**, throughput **1638.4Kbps**, CPU slowdown **4×**. Audit categories: Performance, Accessibility, Best Practices and SEO. These mobile settings match the relevant settings in the preceding mobile reports; this was not a new controlled WebP/AVIF A/B experiment.

| Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 88 | 100 | 100 | 100 | 1.356s | 3.903s | 0ms | 0 |
| 2 | 88 | 100 | 100 | 100 | 1.349s | 3.903s | 0ms | 0 |
| 3 | 88 | 100 | 100 | 100 | 1.351s | 3.903s | 0ms | 0 |

Every pass transferred **2,236,154 bytes** in total and requested only `entrance-light-sm.avif` for the hero poster: **35,296-byte file / 36,138-byte transfer** including response overhead. No duplicate WebP hero request was observed.

**Conclusion:** Performance 88 meets the ≥85 target. It is within the earlier reported 88–90 range; these results do not demonstrate a mobile performance gain. Keep the desktop A/B improvement separate from this mobile result.

## Local server and the analytics 404

The existing preview at `http://127.0.0.1:4173/` returned 404 for `/_vercel/insights/script.js`. The repository's `_test/dev-server.mjs` already contains an explicit local analytics placeholder at that route. It was run separately on **127.0.0.1:4183**, with the same site files, to avoid disturbing the existing preview. The existing placeholder was not added or changed, and console-error assertions were not removed or filtered. Actual Vercel Analytics delivery was not tested.

The development server now supplies the correct `image/avif` MIME type. Its startup message now prints the configured port. The responsive QA script accepts `CGC_BASE_URL` so it can exercise the dedicated server without replacing the user's preview server. These are the only implementation changes in this audit task.

Best Practices is **100** on this project dev server. This does not erase or hide the 404 on the other running server. To obtain the same local result later, serve with the project's dev server rather than a generic static server. No production routing or security setting was changed.

## Browser checks

- At **360, 390, 430 and 1440**, one AVIF hero request, HTTP 200 with `image/avif`; no duplicate WebP; correct responsive MP4 autoplay source; no video poster attribute requesting a second image.
- At all four widths: **0 horizontal overflow, 0 console errors, 0 automated WCAG A/AA violations, 0 measured controls under 44px and 0 inputs under 16px** using the project dev server.
- Concept tabs, pause/resume, CC and deferred field-clip checks passed in the existing architectural QA suite.
- Reduced motion: visible AVIF poster, video opacity 0, **0 hero-film requests**.
- JavaScript off: visible AVIF poster, video opacity 0, **0 hero-film requests**.
- Forced MP4 failure: the failed attempt leaves the poster visible and video opacity 0.
- Autoplay and fallback screenshots were visually inspected. Autoplay screenshots wait for playback to advance to avoid capturing the compositor before a frame is presented.

Chromium's AVIF selection was tested. The WebP fallback remains in the picture markup; an older AVIF-incapable browser was not separately tested. API/cloud persistence and email were outside this poster re-audit.

## Reproduce

From `cgc/site` in PowerShell:

```powershell
$env:PORT='4183'
npm run dev:crm
```

In another terminal from that directory:

```powershell
$env:CGC_BASE_URL='http://127.0.0.1:4183/'
node _test/architectural-qa.mjs
node _test/poster-audit.mjs
```

Lighthouse command used, repeated three times with separate report names:

```text
node_modules/.bin/lighthouse.cmd http://127.0.0.1:4183/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=./_test/results/mobile-avif-2026-11-01-1 --chrome-flags="--headless --no-sandbox" --quiet
```

Raw reports: `_test/results/mobile-avif-2026-11-01-1..3.report.html/json`. Summary: `mobile-avif-2026-11-01-summary.json`; poster/fallback evidence: `mobile-avif-poster-qa.json` and `mobile-avif-*.png`; responsive/accessibility evidence: `v4-qa.json`.

## Audited working-tree fingerprints

The source working tree includes Freebuff's uncommitted optimizations, so a Git commit alone would not identify the audited page.

| File under site/ | Bytes | SHA-256 |
| --- | --- | --- |
| `index.html` | 105,371 | `c4c4301c6b6790cc56458f9c9fc03d80b54ee2b4f8fd81bbc6eea0c655761b2c` |
| `assets/concepts/entrance-light.avif` | 115,295 | `0757563135bd8f4417b69f817931bf9f42d0a55a7b2e1d171d75d5d047e7ab66` |
| `assets/concepts/entrance-light-sm.avif` | 35,296 | `77af6d7a9475080c6e091edb72c8399f6daa74355beff7b88cb85288544a1d4b` |
| `assets/concepts/entrance-light.webp` | 154,908 | `5dc5634d94a2addad7c5082d3972db24d211f346ff3b15f298b773ad55414e6e` |
| `assets/concepts/entrance-light-sm.webp` | 44,434 | `accd8edb627e4beb241aa37467fae1cc82423b43dc8ae1ecaeffe88238315cf3` |

No deployment, push, DNS change, credential entry or Deployment Protection change was performed. The handoff HTML was not modified. Only this task's development-server, test and report files were committed; Freebuff's pending production assets/markup remain uncommitted.
