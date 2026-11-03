# CGC site: SEO audit (2026-11-03)

**Business type:** local service business with a service area (commercial glazing contractor in Wildomar, CA, serving Southern California).
**How it was run:** the plugin's crawler refuses local addresses, and the Vercel preview is behind Deployment Protection. So the checks ran against the local build (`site/`), using Lighthouse 13.6 (with compression on, as Vercel serves it), the project's axe and Playwright tests, and a manual pass over each audit category.

## Scores (final Lighthouse run, all 5 pages)

Each cell reads Performance / Accessibility / Best Practices / SEO.

| Page | Mobile | Desktop |
| --- | --- | --- |
| Home | 90 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Privacy, Terms, Accessibility, License | 100 / 100 / 100 / 100 (each) | 100 / 100 / 100 / 100 (each) |

Before these fixes, the homepage on mobile scored performance 78, and the subpages scored 96 for Best Practices. The mobile performance figure swings by ±10 because a GPU video render was running on the same machine; desktop is a steady 100.

## What was fixed

| Finding | Severity | Fix |
| --- | --- | --- |
| The hero reel (2.2 MB) began downloading before the poster had painted, which blocked the main thread for 350 ms | High | The film now starts 600 ms after `load`, so the poster stays the first paint |
| `/favicon.ico` returned 404 on every subpage, logging a console error that cost Best Practices points | Medium | Root `favicon.ico`, plus icon links on the subpages |
| The fonts were carrying the Latin Extended-A character set, which no page uses (147 KB in total) | Medium | Trimmed to Latin-1 plus the arrows actually used: now 117 KB, and ↓ ↔ ↗ now render in the brand font |
| Phones downloaded full-size gallery photos (about 370 KB wasted) | Medium | Added a 900 px middle size to `srcset` (48 images) |
| The title didn't name the region | Medium | Changed to "Commercial Glazing Contractor in Southern California \| CGC Inc." |
| The schema had no `WebSite` entity, logo, image or `sameAs` | Medium | Added a `WebSite` entity; added logo, image, Instagram `sameAs`, `knowsAbout`, and a typed `areaServed` |
| The subpages had no social preview tags | Low | Added Open Graph and Twitter tags, each page using its own title, description and URL |

## Already in place (verified)

- **Basics:** robots.txt (blocks `/crm` and `/api`), a sitemap with all 5 public pages, a canonical tag on every page, and unique titles and descriptions.
- **Structure:** one H1 per page, and a clean H2/H3 order.
- **Structured data:** JSON-LD with `GeneralContractor`, five `Service` items and an `FAQPage` whose answers match the visible FAQ.
- **Crawling and security:** llms.txt, security headers (CSP, nosniff, frame-deny), and `noindex` on the CRM.
- **Accessibility:** axe finds 0 violations on every page.

## Not checked / needs the owner

- **Live production:** crawling the live site, Core Web Vitals field data (CrUX) and Google Search Console all need a public URL or Google credentials.
- **Google Business Profile, reviews and citations:** these happen off the site.
- **Unverified facts:** opening hours, a street address and geo coordinates aren't verified, so the schema leaves them out on purpose.
- **H1:** "We put the glass in." is brand copy with no keyword in it. The title, kicker, description and H2s carry the keywords instead. Rewording the H1 is the owner's call.
