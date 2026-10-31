# CGC redesign QA — October 31, 2026

Preview: https://cgc-glazing-fj5kwdnks-sdvsfbs.vercel.app/

| Check | Result |
| --- | --- |
| API tests | 28/28 |
| Functional browser scenarios | 10/10 |
| Widths | 360, 390, 430, 1440 |
| Overflow / console errors | 0 / 0 at every width |
| Measured controls below 44px / inputs below 16px | 0 / 0 |
| Automated WCAG A/AA violations | 0 main, CRM sample and legal |
| Lighthouse mobile Performance | 85 (previous run 86) |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| FCP / LCP | 1.1s / 4.3s |
| TBT / CLS | 0ms / 0 |
| Production audit vulnerabilities | 0 |
| Film | 16 seconds, silent, 24fps |
| Desktop / phone film size | 3,425,674 / 2,306,580 bytes |
| Reduced motion | Still poster; no automatic film loading |
| JavaScript off / 320px reflow | Passed |
| Manifest injection | Idempotent |
| Deployed app-browser film | Playing; readyState 4; no media error |

Evidence: `qa/v2-*` screenshots, `v2-qa.json`, `v2-lighthouse.report.html/json` and `functional.json`. All captured hero/concept/scopes/gallery/form/CRM states were visually inspected. The film's source is supplied 720px phone footage; it is an edited real-video montage, not generated video.

The two generated before/after studies are labeled illustrative concepts; actual CGC photos remain in the documented work gallery. Four web assets plus provenance are under `assets/concepts/`. The prompts are in IMAGE-PROMPTS.md in the handoff outputs.

Cloud storage, real CRM authentication and email delivery still require owner configuration and a launch test. The preview retains Vercel authentication. Reflow was checked to 320 CSS pixels (400% equivalent at a 1280px viewport); browser-toolbar zoom was not separately automated.
