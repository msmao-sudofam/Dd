# CGC build brief (shared by all agents — read first)

## Verified facts (sources noted). Use ONLY these. No invented reviews, awards, years, stats.
- Legal name: **Commercial Glazing Contractors Inc.** (Corporation). Brand/handle: CGC Incorporated, @cgc_incorporated
- CSLB License **#1109661**, class **C-17 Glazing**, status Active, issued 2023-09-05, expires 2027-09-30 (CSLB, checked 2026-10-30)
- Contractor's bond $25,000, Western Surety Co. Workers' comp: State Compensation Insurance Fund (CSLB)
- RMO / CEO / President: Nathan Paul Hernandez. Officer: Kelly Elizabeth Hernandez (CSLB)
- Mailing address on license: 22746 Queensbury Ct, Wildomar, CA 92595 (home-style address — show city "Wildomar, CA" publicly, full address only in legal pages' contact block)
- Phone **(714) 650-4185** · Email **nathan@cgcontractorsinc.com** (current site + IG)
- Services (their words): storefront, curtain wall, tenant improvements, commercial service work; "we do all phases of commercial glazing"
- Real jobs seen on IG: Ono Hawaiian BBQ Temecula (Oct 2026); Haven House Year-Round Emergency Shelter (roll-up + storefront); tenant improvement for Pacific Tusk Builders / Irvine Company tenant (Jan 2025); Meritage Homes 20,130 SF office TI with Pacific Tusk (FB shoutout); job for Esplanade Builders (Mar 2025); tilt-up work (Aug 2024); interior glass office fronts, frameless glass, all-glass conference rooms, aluminum storefront doors, glass handling on rack trucks.
- Service area: Southern California / Inland Empire / Orange County (Wildomar base, 714 number). Say "Southern California" — don't list cities as served unless shown above (Temecula, Irvine, Riverside are seen).

## Domains (GoDaddy, client account)
- Primary: **cgcontractorsinc.com** (email lives here — MX records must be preserved)
- Redirect to primary: commercialglazingcontractorsinc.com, cgclimited.com

## Architecture (Vercel project, folder `cgc/site/`)
```
cgc/site/
  index.html            main site (one file, inline CSS/JS) — built by lead
  privacy/index.html    legal pages (legal agent)
  terms/index.html
  accessibility/index.html
  license/index.html
  crm/index.html        CRM app (crm agent), noindex
  api/lead.js           POST lead intake (crm agent)
  api/leads.js          GET/PATCH leads for CRM, auth via CRM_KEY env (crm agent)
  media/                web-ready images/video + manifest.json (media agent)
  assets/logo.svg       recreated vector logo (media agent)
  vercel.json, robots.txt, sitemap.xml, llms.txt
```
Raw media: `cgc/_raw/ig/*.jpg` (90 photos, filename = cgc_<postcode>_<index>), `cgc/_raw/video/*.mp4` (+ .info.json with captions/dates), `cgc/_raw/logo.png` (210x89), `cgc/_raw/glass-cubicle.jpg`.

## Design tokens (direction lock — do not drift)
Primary reference: Andercore (dark industrial control panel). Borrowed: Exo Ape monumental display type over full-bleed architecture.
```css
:root{
  --bg:#0a0b0d;        /* page canvas */
  --bg-2:#111317;      /* recessed band */
  --line:#262a31;      /* 1px hairlines, grid seams */
  --fg:#f3f4f6;        /* primary text */
  --mute:#8b9099;      /* secondary text, labels */
  --steel:#636466;     /* logo gray — mullion/metal role */
  --amber:#faac1a;     /* logo amber — CTA + logo + active state ONLY */
  --glass:#9ec9d6;     /* glass tint — decorative in hero/diagrams only */
  --f-display:"Archivo",system-ui,sans-serif;  /* wdth 112, wght 600-800, tracking -0.03em on display */
  --f-body:"Archivo",system-ui,sans-serif;     /* wdth 100, 400/500 */
  --f-mono:"JetBrains Mono",ui-monospace,monospace; /* spec labels, badges, uppercase 11-12px, +0.08em */
}
```
Google Fonts: `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500&display=swap`
Rules: cards 0 radius, buttons 4px radius; amber never as a background surface except the primary button; no shadows; 1px hairlines; photography desaturated slightly with dark overlay; mono labels like `C-17 · LIC 1109661`.
Never: gradient blobs, glassmorphism cards, emoji, stock-photo people, fake testimonials, "AI" mentions.

## Voice
Blunt, short, trade-literate. Talk to GCs, PMs, owners. No hype words ("cutting-edge", "seamless", "elevate", "unparalleled").
