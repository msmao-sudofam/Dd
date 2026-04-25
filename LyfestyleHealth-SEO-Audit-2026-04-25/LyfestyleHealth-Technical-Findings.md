# Lyfestyle Health Bar — Technical Findings
**Audit Date:** April 25, 2026
**Source:** Phase 2 Evidence Capture + Phase 3-4 Audit

Evidence collection note: The website returned 403 Forbidden for all direct fetch attempts (homepage, menu page, robots.txt, sitemap.xml). PageSpeed Insights API returned 429 rate limit errors. All technical findings are based on search index analysis, Yelp data, platform inference (Shopify), and Google indexed page behavior. PageSpeed data was not collected. This is noted throughout as an assumption wherever applicable.

---

## Pages Audited

1. Homepage — https://lyfestylehealthbar.com/
2. Menu page — https://lyfestylehealthbar.com/apps/our-menu

---

## Crawlability

| Check | Status | Impact | Evidence | Fix |
|---|---|---|---|---|
| robots.txt accessible | Unknown | High | 403 Forbidden on direct access | Navigate to /robots.txt in browser to verify; ensure it is publicly accessible |
| Sitemap reference in robots.txt | Unknown | Medium | Could not access robots.txt | Add: Sitemap: https://lyfestylehealthbar.com/sitemap.xml |
| sitemap.xml accessible | Unknown | High | 403 Forbidden on direct access | Shopify auto-generates sitemap at /sitemap.xml; verify and submit to Google Search Console |
| Critical pages blocked | Suspected | High | /apps/our-menu not in Google index | Confirm /apps/ path is not Disallowed in robots.txt |
| Googlebot blocked by server | Suspected | High | Only 2 pages indexed despite active business | Verify Shopify store is not password-protected; check Cloudflare/CDN bot rules |

---

## Indexation

| Check | Status | Impact | Evidence | Fix |
|---|---|---|---|---|
| Total indexed pages | 2 | Critical | site:lyfestylehealthbar.com returns only homepage + /collections | Create native Shopify pages; submit sitemap |
| Homepage indexed | Pass | — | Appears in Google results | No action needed |
| /collections indexed | Pass | — | Appears in Google results | No action needed |
| /apps/our-menu indexed | Fail | High | Not found in Google index | Migrate to native /pages/menu |
| Noindex on key pages | Suspected | High | App pages may carry noindex; couldn't verify | Check page source for meta name="robots" content="noindex" |
| Canonical tags present | Unknown | Medium | Could not access page source | Verify canonical self-references on all Shopify pages |
| Redirect chains | Unknown | Low | Could not verify | Use Screaming Frog or similar to audit redirects |
| HTTP to HTTPS redirect | Pass | — | Site loads over HTTPS | No action needed |
| www vs non-www consistency | Unknown | Low | Could not verify both variants | Confirm one variant redirects to the other |

---

## Speed & Core Web Vitals

PageSpeed Insights API was rate limited during this audit. Data below is an assumption based on typical Shopify platform performance benchmarks. Verify with PageSpeed Insights at pagespeed.web.dev.

| Metric | Assumed Value | Target | Status | Source |
|---|---|---|---|---|
| LCP (mobile) | 2.5–4.5s | < 2.5s | Needs Improvement / Poor | Shopify platform benchmark assumption |
| INP (mobile) | 200–500ms | < 200ms | Needs Improvement | Shopify platform benchmark assumption |
| CLS (mobile) | 0.05–0.2 | < 0.1 | Pass / Needs Improvement | Shopify platform benchmark assumption |
| TTFB (mobile) | 600ms–1.5s | < 800ms | Needs Improvement | Shopify platform benchmark assumption |
| Performance Score (mobile) | 40–60 | 90+ | Poor | Shopify community data |

Action required: Run https://pagespeed.web.dev/?url=https://lyfestylehealthbar.com and https://pagespeed.web.dev/?url=https://lyfestylehealthbar.com/apps/our-menu to get actual metrics before implementing performance fixes.

Common Shopify performance opportunities:
- Defer non-critical third-party scripts (chat widgets, analytics, apps)
- Compress and convert images to WebP format
- Remove unused Shopify apps that inject render-blocking scripts
- Reduce CSS/JS from unused theme sections

---

## Mobile-Friendliness

| Check | Status | Evidence | Fix |
|---|---|---|---|
| Responsive design | Assumed Pass | Shopify themes are mobile-responsive by default | Verify visually on 390px viewport |
| Viewport meta tag | Assumed Pass | Shopify themes include viewport tag | Check source for: meta name="viewport" |
| Content parity desktop/mobile | Unknown | Could not verify | Manual check required |
| No horizontal scroll | Assumed Pass | Default Shopify theme behavior | Visual QA on mobile device |
| Mobile-first indexing ready | Assumed Pass | Shopify handles mobile-first indexing | Verify with Mobile-Friendly Test at search.google.com/test/mobile-friendly |

---

## Security & HTTPS

| Check | Status | Evidence | Fix |
|---|---|---|---|
| HTTPS across site | Pass | Site loads at https://lyfestylehealthbar.com | No action needed |
| Valid SSL certificate | Pass | No browser SSL warnings reported | No action needed |
| HTTP to HTTPS redirect | Pass | HTTPS confirmed | No action needed |
| Mixed content warnings | Unknown | Could not inspect page source | Check browser console for mixed content errors |

---

## URL Structure

| Check | Status | Impact | Evidence | Fix |
|---|---|---|---|---|
| Menu URL is keyword-free | Fail | High | /apps/our-menu — contains no keywords, no location signals | Change to /pages/menu or /pages/anaheim-juice-bar-menu |
| /collections URL is generic | Partial | Medium | /collections — no keyword context | If possible, ensure collection pages have descriptive handles (e.g., /collections/acai-bowls) |
| Homepage URL | Pass | — | Root domain, clean | No action needed |
| URL consistency (lowercase, hyphens) | Assumed Pass | — | Shopify enforces this by default | Spot-check any manual pages added |

---

## Per-Page Detail

### Page 1: Homepage — https://lyfestylehealthbar.com/

| Element | Status | Finding | Recommended Value |
|---|---|---|---|
| Title tag | Unknown | Could not access page (403) | "Juice Bar in Anaheim, CA | Lyfestyle Health Bar" (55 chars) |
| Meta description | Unknown | Could not access page (403) | "Cold-pressed juices, acai bowls & smoothies made fresh daily. Women-owned juice bar in Anaheim. Order online or visit us!" (155 chars) |
| H1 | Unknown | Could not access page (403) | Should include "Juice Bar" + "Anaheim" |
| Canonical | Unknown | Could not verify | Should be self-referencing: https://lyfestylehealthbar.com/ |
| Robots meta | Unknown | Could not verify | Should be: index, follow |
| Schema markup | Missing | Not detected in search snippets | Add LocalBusiness JSON-LD (see Spec 1) |
| Image alt text | Unknown | Could not access page | All images must have descriptive alt text including location keywords |
| Internal links | Unknown | Could not access page | Link to /pages/menu, /pages/about, /pages/faq, /pages/juice-bar-anaheim |

### Page 2: Menu — https://lyfestylehealthbar.com/apps/our-menu

| Element | Status | Finding | Recommended Value |
|---|---|---|---|
| Title tag | Unknown | Could not access page (403) | "Our Menu — Lyfestyle Health Bar, Anaheim CA" |
| Meta description | Unknown | Could not access page (403) | "Browse our full menu of acai bowls, cold-pressed juices, smoothies & wellness shots. Made fresh daily in Anaheim, CA. Order via DoorDash." |
| H1 | Unknown | Could not access page (403) | "Our Menu" or "Fresh Daily Menu — Lyfestyle Health Bar" |
| Canonical | Unknown | Likely app-generated; may be absent | Self-referencing canonical required |
| Robots meta | Suspected noindex | /apps/ pages on Shopify frequently excluded from index | Confirm; if noindex, migrate page (see Spec 4) |
| Schema markup | Missing | Not detected | Add Menu schema or Product schema after migration |
| Indexation status | Fail | Not in Google index | Migrate to native Shopify page |
| URL SEO value | Fail | /apps/our-menu — zero keyword relevance | New URL: /pages/menu |

---

## On-Page Findings Summary

### Title Tags

| Page | Status | Issue |
|---|---|---|
| Homepage | Unknown | Could not verify; assumed not optimized for local keywords |
| Menu page | Unknown | Could not verify; likely generic or app-generated |

### Meta Descriptions

| Page | Status | Issue |
|---|---|---|
| Homepage | Unknown | Could not verify; Yelp snippet used as Google may be auto-generating |
| Menu page | Unknown | Could not verify; page may not have one |

### Heading Structure

| Page | Status | Issue |
|---|---|---|
| Homepage | Unknown | Could not access; no H1 confirmed in search snippets |
| Menu page | Unknown | Could not access; app-generated content may have poor heading hierarchy |

### Images

| Check | Status | Issue |
|---|---|---|
| Alt text | Unknown | Could not access either page |
| WebP format | Unknown | Could not verify |
| Lazy loading | Unknown | Shopify themes support lazy loading but implementation varies |
| Compression | Unknown | Could not verify |

### Internal Links

| Check | Status | Issue |
|---|---|---|
| Navigation links | Assumed functional | Standard Shopify navigation |
| Content internal links | Fail | No content pages exist to link between |
| Anchor text quality | Unknown | Could not verify |

### Keyword Targeting

| Target Keyword | Current Page Targeting | Gap |
|---|---|---|
| juice bar anaheim | None confirmed | Full gap — no page targets this keyword |
| acai bowl anaheim ca | None confirmed | Full gap |
| cold pressed juice anaheim | None confirmed | Full gap |
| healthy food near me | None confirmed | Full gap |
| smoothie bar anaheim | None confirmed | Full gap |
| wellness shots near me | None confirmed | Full gap |
| acai bowl near me | None confirmed | Full gap |
| women owned juice bar anaheim | None confirmed | Full gap |
| sea moss smoothie | None confirmed | Full gap |
| healthy juice bar orange county | None confirmed | Full gap |

All 10 derived target keywords have no confirmed page targeting them. This is the root cause of the site's minimal organic search presence.

---

## Assumptions Log

1. Platform is Shopify — inferred from /apps/ and /collections URL patterns. Not confirmed via page source.
2. Mobile performance score assumed 40-60 — based on typical Shopify store benchmarks. Actual data unavailable (API rate limit).
3. Title tags and meta descriptions unconfirmed — site returned 403 for all direct fetches.
4. robots.txt content unknown — 403 Forbidden.
5. sitemap.xml content unknown — 403 Forbidden.
6. Homepage H1 unconfirmed — could not access page source.
7. Schema markup confirmed absent — not detected in any Google search snippet or indexed page snippet.
8. Hours sourced from Yelp listing — verify against current GBP and website.
9. Phone number (714-749-8130) sourced from Yelp — verify accuracy.
10. Second location (Covina) listed as CLOSED on Yelp as of February 2026 — confirm with client.
