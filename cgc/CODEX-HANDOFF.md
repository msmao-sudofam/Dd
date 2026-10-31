# Codex handoff: CGC website build

Read `cgc/BRIEF.md` first. It has the verified facts, design tokens and folder layout. Don't invent anything that isn't in it: no reviews, awards, years in business, project counts or stats.

## Already done (by Claude)
- Research: CSLB license #1109661 (C-17, active), owner/RMO, bond, workers' comp, phone/email. All in BRIEF.md.
- Raw media from the company's own Instagram: `cgc/_raw/ig/` (90 photos), `cgc/_raw/video/` (14 mp4s + `.info.json` captions), `cgc/_raw/logo.png`.
- Direction lock: dark industrial "control panel" look (Andercore) plus monumental display type (Exo Ape). Logo amber is CTA-only. Tokens are in BRIEF.md.

## Where the Claude agents stopped (Oct 30, 2026): pick up from here
**Media (Task A): partly done.**
- Done: `cgc/site/assets/logo.svg` and `logo-mark.svg`. Check them against `cgc/_raw/logo.png`; `cgc/_work/logo.py` made them.
- Done: contact sheets in `cgc/_work/sheets/`:
  - `sheet_00–07.jpg` cover all 90 photos with filenames burned in
  - `pairs.jpg` has candidate before/after pairs
  - `vid_0–3.jpg` are video frame strips
  - scripts: `cgc/_work/sheets.py`, `cgc/_work/vsheet.py`; frame grabs are in `cgc/_work/vf/`
- **Not done:** classification, WebP exports, `media/manifest.json`, video loops, favicon / apple-touch / og.jpg.
- Start by reading the sheets, then do Task A steps 1–4 and finish step 5.

**CRM (Task D): API done, UI not started.**
- Done: `api/lead.js`, `api/leads.js` and `api/_lib/{http,schema,store}.js` (Vercel Blob, `x-crm-key` auth). `package.json` uses `@vercel/blob@^2.8.2`.
- Done: `_test/run.mjs` tests. Run `cd cgc/site && npm i && npm test`; the last run passed 28/28. Read `api/_lib/schema.js` for the exact lead fields and stages, and match the form and CRM UI to it. It wins over the contract in this file if they differ.
- **Not done:** `crm/index.html` (full spec in Task D), `CRM-SETUP.md`, and `_test/dev-server.mjs`. `package.json` already references `dev:crm`; write a tiny local server that serves the site and routes `/api/*` to the handlers with an in-memory store.

**Legal (Task C): done.** See the table below.

## Agent outputs (check before you start; don't redo anything that exists)
| Output | Path | If missing |
| --- | --- | --- |
| Web media + `manifest.json` (categories, captions, before/after pairs, hero candidates, video loops) | `cgc/site/media/` | Do Task A below |
| Logo SVGs, favicon, apple-touch, og.jpg | `cgc/site/assets/` | Do Task A step 5 |
| Legal pages | ✅ DONE: `cgc/site/{privacy,terms,accessibility,license}/index.html` + `cgc/site/LEGAL-NOTES.md` (exact form consent copy at top). Regenerate all four with `python cgc/site/_build_legal.py`; you may need to fix its output path first. The accessibility page promises keyboard access, a reduced-motion fallback, labeled form errors, reflow at 360px/400% zoom and captions; make the main site actually do these. | Skip Task C |
| CRM | `cgc/site/crm/index.html`, `cgc/site/api/lead.js`, `cgc/site/api/leads.js`, `cgc/site/package.json`, `cgc/site/CRM-SETUP.md` | Do Task D |

---

## Task B (main job): build `cgc/site/index.html`
Make it one self-contained HTML file with inline CSS and JS. Media is referenced from `media/` and `assets/`. Use Three.js via an importmap: `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` and `.../examples/jsm/environments/RoomEnvironment.js`.

### 1. Hero: scroll-driven 3D before→after (the wow piece)
Use a pinned section `#film`, about 500vh tall, with a sticky 100vh canvas. Progress p (0 to 1) = scrolled / (height − vh), lerped for smoothness. The scene is one storefront that gets built as you scroll.

Scale: 1 unit = 2 ft.
- **Building:** dark stucco/concrete facade, 30u wide by 12u tall at z=0. Rough opening 16u by 7u (32'-0" × 14'-0") with a 0.3u bulkhead. Build the wall from left, right and header boxes around the opening. Add a sidewalk, a curb and a dusk gradient sky.
- **Interior** (room behind, about 8u deep): floor, back wall, a counter block, and ceiling light strips with emissive intensity 0 until the last stage.

| Stage | p range | Visual | Big title | Mono spec line (HUD) |
| --- | --- | --- | --- | --- |
| 0 Intro | 0–0.08 | Wide frontal shot. Opening is boarded with 4 plywood panels. H1 overlay is visible. | (H1 overlay, below) | — |
| 1 Rough opening | 0.08–0.25 | Plywood drops away. White 40% dimension lines with ticks + DOM labels. | Rough opening. | `R.O. 32'-0" W × 14'-0" H · FIELD MEASURED · PLUMB / LEVEL / SQUARE` |
| 2 Framed | 0.25–0.45 | Clear-anodized aluminum mullions (#b8bcc2, metalness .9, roughness .35). Verticals grow from the sill every 4u (4 bays), then the horizontal transom at 5.5u extends. Center bay is the door bay. | Framed. | `2" × 4-1/2" ALUMINUM STOREFRONT · CENTER-SET · ANCHORED + SHIMMED` |
| 3 Glazed | 0.45–0.65 | Glass lites slide in from z=+2 one at a time and fade up (MeshPhysicalMaterial, tint #9ec9d6, opacity ~.28, env reflections from RoomEnvironment PMREM). An additive reflection streak sweeps across. | Glazed. | `1" INSULATED LOW-E · TEMPERED WHERE REQUIRED (CBC 2406)` |
| 4 Sealed | 0.65–0.82 | A perimeter sealant line draws around the frame (Line drawRange, white). A pair of doors with push bars hangs and one swings open about 20°. | Sealed. | `PERIMETER SEALANT + BACKER ROD · DOORS HUNG · HARDWARE SET` |
| 5 Open | 0.82–1 | Interior lights ramp up with warm point lights, glass glows, sky darkens. | Open for business. | `PUNCH CLEARED · TURNED OVER` plus primary CTA "Send plans for a bid" |

- **Camera** (Catmull-Rom path plus a lookAt path): starts wide frontal at (0, 3.5, 26), moves to a 3/4 angle (-14, 4, 16) for framing, a glass close-up (8, 3, 9) for glazing, and pulls back to (0, 4, 20) at the end.
- **Left progress rail:** 5 stage ticks. The active tick is amber (the only non-CTA amber use; that's allowed because it's an active state).
- **H1 overlay at stage 0:** H1 "We put the glass in." Sub: "Storefront, curtain wall and interior glass for general contractors and property owners across Southern California. C-17 licensed. Bidding now." Buttons: primary amber "Request a bid" → `#bid`, ghost "(714) 650-4185" → `tel:+17146504185`. Label line: `CSLB C-17 · LIC 1109661`.
- **Performance:** pixelRatio min(dpr, 1.75), no shadows. Render only while the section is in view (IntersectionObserver).
- **`prefers-reduced-motion`, or WebGL missing:** render the final stage once as a static frame, or use the best finished storefront photo, and show all stage text as a list.
- **Phones:** the camera path is the same but uses a wider FOV so the opening fits at 360px.

### 2. Sections after the hero (in order)
1. **Proof strip** (mono, hairlines): `CSLB C-17 · LIC #1109661 · ACTIVE · $25K CONTRACTOR'S BOND · WORKERS' COMP ON FILE` and "Recent work: Ono Hawaiian BBQ, Temecula · Haven House shelter · Meritage Homes office TI (with Pacific Tusk Builders) · Esplanade Builders".
2. **Real before/after slider:** use `manifest.pairs` from the company photos, with a draggable divider, keyboard arrows and an `input[type=range]` for accessibility. Headline: "Same opening. Two visits."
3. **What we install:** five rows (0-radius cards, 1px seams), each with a photo, a short blunt description and a mono "what's included" list:
   - Storefront
   - Curtain wall
   - Interior glass & office fronts
   - Entrances & doors
   - Service & repair (broken glass, board-up, door closers)

   Use general trade descriptions only; don't claim specific manufacturers.
4. **Work gallery:** grid from `manifest.json` with category filter chips, a lightbox (keyboard + swipe), and the video loops (muted, autoplay only in view, poster first). Generate the markup at build time (see Task E) so crawlers see the `<img>` tags with alt text.
5. **How we bid (for GCs):** Send plans → Takeoff + scope sheet → Bid with clarifications/exclusions → Shop drawings & submittals → Fabricate + install → Punch & turnover.
6. **Field tool, glass weight calculator:** inputs are width, height (ft/in) and makeup (1/4", 3/8", 1/2" mono; 1" IGU = 1/4+1/2 air+1/4). Output is approx lbs, using 3.27 lb/ft² per 1/4" of glass. Label it "Approximate. Verify with your supplier." It's a useful, honest detail only a glazing company would have.
7. **Bid request form `#bid`:** see the contract below. Show a live "bid ticket" summary card that fills in as they type (mono, like a work order). Include an honeypot field `hp`.
8. **FAQ:** 6 to 8 real buyer questions (do you work as a sub for GCs, what areas, what info for a bid, service/emergency board-up, licensed/insured → link to /license/, lead times are project-dependent). Add FAQPage JSON-LD.
9. **Footer:** logo, phone, email, "Wildomar, CA", license line, links to /privacy/ /terms/ /accessibility/ /license/ /crm/ (small, "Team login"), and the Instagram link.

Also: a sticky mobile bottom bar (Call / Bid / Text) with safe-area padding, and a header ≤ 60px.

### 3. Form contract (POST `/api/lead`, JSON)
```json
{"name":"","company":"","email":"","phone":"","role":"GC|PM|Owner|Architect|Other",
 "projectType":"storefront|curtain-wall|interior-glass|doors|service-repair|other",
 "city":"","scope":"","bidDue":"YYYY-MM-DD","plansLink":"","sms_consent":false,
 "source":"website","utm_source":"","utm_medium":"","utm_campaign":"","hp":""}
```
On success, show the confirmation in place. On failure, fall back to a prefilled `mailto:nathan@cgcontractorsinc.com`.

The SMS checkbox stays **unchecked** by default, with its own consent text. Paste the exact copy from `cgc/site/LEGAL-NOTES.md` → "## Form copy". If that file doesn't exist, use:
> "Text me about this bid. By checking this box you agree to receive texts from Commercial Glazing Contractors Inc. at the number above. Msg & data rates may apply. Frequency varies. Reply STOP to opt out, HELP for help. Consent is not a condition of service. See our Privacy Policy."

Under the submit button: "By submitting, you agree we may contact you about this request. See our Privacy Policy."

### 4. SEO / AI search pack
- Title: `Commercial Glazing Contractor | Storefront & Curtain Wall | CGC Inc.`
- Meta description: 150 characters.
- canonical `https://cgcontractorsinc.com/`, OG/Twitter tags with `assets/og.jpg`, favicons, `manifest.webmanifest`.
- JSON-LD:
  - `GeneralContractor` (or `HomeAndConstructionBusiness`) with name, telephone, email, address (Wildomar, CA 92595), areaServed "Southern California", and `hasCredential` for CSLB #1109661
  - `Service` items for each scope
  - `FAQPage`
  - `BreadcrumbList` on legal pages
- Files: `robots.txt` (Disallow /crm/ and /api/), `sitemap.xml` (home + 4 legal pages), `llms.txt` (plain summary of who they are, services, license, contact).
- `vercel.json`:
  - `cleanUrls: true`
  - security headers (CSP allowing jsdelivr + Google Fonts, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - `X-Robots-Tag: noindex` on /crm
- Vercel Web Analytics: add the `/_vercel/insights/script.js` script tag (cookieless; it matches the privacy policy).

## Task E: tiny build script `cgc/site/_build.py`
Read `media/manifest.json` and inject the gallery, before/after and video markup into `index.html` between `<!--GALLERY:START-->` and `<!--GALLERY:END-->` (and the same for `PAIRS`) so the deployed HTML is fully static. It must be idempotent.

## Task A (only if media agent output is missing)
Contact-sheet every photo and classify it: category, before/after, quality, factual caption. Drop junk such as the T-shirt mockup and screenshots. Then:
- Export WebP at 1600px q78 plus 640px thumbs.
- Make 4 to 6 video loops: 1080 short side with lanczos, 6–10s, ≤4MB, MP4 + WebM, plus posters.
- Write `manifest.json` with `pairs`, `videos` and `hero_candidates`.
- Recreate the logo as SVG: gray #636466 and amber #FAAC1A, two interlocking C's forming "CGC" over "COMMERCIAL GLAZING / Contractors Inc.".

## Task C (only if legal output is missing)
Write privacy (CCPA/CPRA, GPC honored, SMS/TCPA terms, Vercel hosting, no ad pixels, no sale or sharing), terms (California law, Riverside County venue, bid requests aren't contracts), accessibility (WCAG 2.2 AA target, reduced-motion fallback), and license (CSLB data plus a verify link `https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=1109661`). Same tokens; one H1 each; "Last updated: October 30, 2026".

## Task D (only if CRM output is missing)
- **Storage:** Vercel Blob, one JSON per lead.
- **`api/lead.js`:** validation, honeypot, rate limit, optional Resend email via `RESEND_API_KEY` / `LEAD_NOTIFY_TO` / `REPORT_FROM`.
- **`api/leads.js`:** GET/PATCH/POST/soft-DELETE with header `x-crm-key` equal to env `CRM_KEY`.
- **`crm/index.html`:**
  - Pipeline stages: Lead → Plans received → Estimating → Bid sent → Follow-up → Awarded / Lost → Submittals → Glass ordered → Install scheduled → Installed/Punch → Invoiced/Retention → Closed
  - Service fast lane
  - Views: Today (bids due, follow-ups, stale bids), metrics (win rate, $ bid vs awarded), CSV export/import
  - Follow-up message templates
  - Sample-data demo mode
  - Phone-friendly, noindex

## QA (must pass before deploy)
- Playwright at 360, 390, 430, 1440 widths:
  - `scrollWidth − innerWidth = 0`
  - no console errors
  - tap targets ≥ 44px
  - inputs 16px
  - never `maximum-scale=1`
- Scroll the hero through all 5 stages and screenshot each stage at desktop and mobile. Check that the glass and lights read clearly and the HUD text doesn't overlap.
- Reduced-motion run (`emulateMedia({reducedMotion:'reduce'})`) shows the static fallback.
- Lighthouse mobile: performance ≥ 85, accessibility/SEO 100 where possible.
- Every button goes somewhere, and `tel:` / `mailto:` links work.

## Deploy (Vercel CLI, `vercel` is installed)
```bash
cd cgc/site
vercel link        # new project name: cgc-glazing
vercel deploy      # preview first
vercel deploy --prod
```
Don't enter or create any tokens or keys. The owner adds the env vars themselves (`CRM_KEY`, Blob store, Resend), following `CRM-SETUP.md`. New Vercel projects may have Deployment Protection on, so tell the owner to turn it off under Settings → Deployment Protection before the client opens the link.

## Domain (GoDaddy, client account): DON'T change DNS yourself
Write the exact records in `cgc/DNS-PLAN.md` for the owner to apply after confirming:
- **cgcontractorsinc.com** (primary, email lives here):
  - Before touching anything, export or screenshot the current DNS zone and **keep every MX, TXT (SPF/DKIM/DMARC), autodiscover and CNAME record that belongs to email**.
  - Set the apex `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`. Use the values Vercel shows when the domain is added, since they can differ.
  - Add the domain in the Vercel project. Make www redirect to the apex, or the reverse; pick one.
- **commercialglazingcontractorsinc.com** and **cgclimited.com:** add both to the same Vercel project as 308 redirects to `https://cgcontractorsinc.com`, or use GoDaddy forwarding (301, forward only). Their email setup is unknown, so check for MX first.

## Done looks like
- `cgc/site/` deploys cleanly.
- The hero plays all 5 stages smoothly on phone and desktop.
- The form posts to `/api/lead`, or falls back to mailto.
- Legal pages are linked from the footer.
- /crm works in sample mode.
- `DNS-PLAN.md` is written.
- A short `cgc/STATUS.md` lists what's live, what the owner must do (env vars, Deployment Protection, DNS), and what's next (Spanish version, Google Business Profile, review QR).
