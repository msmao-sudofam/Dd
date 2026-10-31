# CGC architectural revision QA — October 31, 2026

Preview: https://cgc-glazing-bcvesobuw-sdvsfbs.vercel.app/

| Check | Result |
| --- | --- |
| API regression suite (unchanged API in visual revision) | 31/31 |
| Functional browser scenarios | 10/10 |
| Viewports | 360, 390, 430, 1440 |
| Horizontal overflow / console errors | 0 / 0 at every width |
| Automated WCAG A/AA violations | 0 public page at four widths; functional legal checks also 0 |
| Measured controls under 44px / inputs under 16px | 0 / 0 |
| Concept tabs | Click, ArrowRight, Home/End mapping and panel selection |
| Hero | Generated concept disclosed; no automatic film loading; manual actual footage + CC |
| Field clips | Deferred poster/source loading, autoplay only in view, manual pause retained |
| Reduced motion | Poster retained; no hero film source loaded |
| JavaScript off / 320 CSS-pixel reflow | Passed |
| Header | 60px desktop and phone |
| Lighthouse mobile | 89 Performance / 100 Accessibility / 100 Best Practices / 100 SEO |
| FCP / LCP / TBT / CLS | 1.2s / 3.8s / 0ms / 0 |
| Static injection | Idempotent; unique element IDs |
| Offline storyboard file | 8 shots, 3 embedded images, working JSON download |
| Storyboard at 390 / 1440 | 0 external requests, 0 script errors, 0 overflow |

Evidence: `_test/results/v4-*`, `functional.json`, `threshold-handoff-*`. Screenshots were visually compared with `_work/ARCHITECTURAL-LOCK.md`: bold display hierarchy, white/graphite/steel-blue roles, rigid media, ruled scope index and honest separation of concepts from real projects. Responsive images and deferred field media raised the first performance result from 78 to 89. Final header revision was measured again at 89.

The hero poster and comparison studies are generated illustrations, not documented jobs. Actual CGC photographs and field footage remain separately identified. The requested generated intro is not complete: the user will generate it with local models using the standalone Threshold handoff.

Cloud storage, live CRM authentication, email delivery, public protection settings, production and DNS remain owner steps. Local tests do not establish cloud persistence. 320 CSS pixels approximates 400% reflow at a 1280px viewport; browser toolbar zoom was not separately automated. Lighthouse is a local lab result, not field measurement.
