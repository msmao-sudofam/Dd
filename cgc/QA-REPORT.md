# CGC QA evidence

See STATUS.md for the full outcome and owner tasks.

| Check | Result |
| --- | --- |
| API tests | 28 / 28 |
| Browser functional scenarios | 10 / 10 |
| Public widths | 360, 390, 430, 1440 |
| Horizontal overflow | 0px at each width |
| Console errors | 0 at each width |
| Measured tap controls below 44px | 0 |
| Inputs below 16px | 0 |
| Automated WCAG violations | 0 public/CRM sample/legal |
| Lighthouse mobile performance | 88 |
| Lighthouse accessibility / best practices / SEO | 100 / 100 / 100 |
| FCP / LCP | 1.2s / 3.8s |
| Total blocking time / layout shift | 0ms / 0 |
| Production dependency vulnerabilities | 0 |
| Video formats verified | 10 / 10 |
| Video duration / short side | 6s / 1080px |
| Largest video file | 1,372,999 bytes |
| Build injection | Idempotent |

Screenshots: hero-1440-1 through -5 and hero-360-1 through -5 show rough opening, framed, glazed, sealed and open. Stage 0 is the introduction. All were inspected. Additional screenshots include bid widths, CRM sample and reduced motion. `lighthouse.report.html` is the complete local mobile lab report. JSON files retain measured responsive/accessibility, functional and media results.

Reflow was measured down to 320 CSS pixels, corresponding to 400% zoom on a 1280px desktop viewport. Actual browser toolbar zoom was not separately automated. These checks support the stated behaviors but are not an independent accessibility certification. Cloud Blob storage, real CRM authentication and email delivery require owner configuration and a launch test. Preview remains protected by Vercel authentication.
