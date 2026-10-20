---
name: design-reference-sites
description: Ground any design deliverable in real-world examples from 10 curated galleries before building it — landing pages, hero sections, pricing pages, testimonials/social proof, marketing emails, slide decks/reports, social posts, paid ads, navbars/menus, and OG/link-preview images. Use whenever asked to design, redesign, or critique a website, section, email, deck, social post, ad, or share image, or when the user says "make it look professional", "use real examples", or "design references".
---

# Design Reference Sites

Ten curated galleries of what the best-known brands actually ship. Before
designing anything, pull real references from the matching gallery, extract the
patterns, then build. Don't design from a blank slate.

## 1. Route the deliverable to a gallery

| Building…                                         | Gallery                    | What it holds |
|---------------------------------------------------|----------------------------|---------------|
| Full landing page / homepage / site               | https://land-book.com      | Large landing-page gallery, filterable by industry, style, type, typography, color, platform |
| Hero / above-the-fold section                     | https://supahero.io        | Library of homepage hero sections only |
| Pricing page / plans table                        | https://pricingpages.design| How top companies lay out and structure pricing for revenue |
| Testimonials, logo walls, metrics, case-study strips | https://socialproofexamples.com | ~200 ways to show social proof, each with a note on why it works |
| Marketing / lifecycle email                       | https://reallygoodemails.com | Large library of marketing emails from successful brands |
| Slide deck, report, brand guidelines              | https://deck.gallery       | Decks, reports and brand guidelines (e.g. Nike, Burger King) |
| Social media post / carousel                      | https://posts.design       | Real brand social posts (870+ brands), filterable by style and colour |
| Paid ads (Instagram, Facebook, LinkedIn)          | https://adfolio.design     | Real B2B/SaaS ads with a note on why each works |
| Navbar / mega-menu / dropdown                     | https://navbar.gallery     | Simple navbars to large dropdowns with whole sections inside |
| OG image / link preview / social share card       | https://ogimage.gallery    | Images shown when a link is shared, built to be clickable |

A full page usually needs several: land-book for the overall page, then
supahero for the hero, socialproofexamples for proof, pricingpages for pricing,
navbar.gallery for the nav, and ogimage.gallery for the share image.

## 2. Collect references

1. Fetch the gallery (WebFetch, or a browser tool if available). Use its
   filters, such as industry, style or colour, to narrow to the user's niche
   and brand mood.
2. Pick **3–5** strong examples, ideally from brands close to the user's
   audience. Open each one's detail page or the live site.
3. If the user's brand has a design system, colours or fonts, keep them. The
   references inform structure and patterns, not branding.

**If a gallery can't be reached** (network policy, DNS failure, paywall):
- Say which host failed. Don't invent examples or claim you looked at them.
- Fall back to, in order: a `refero` MCP search (`refero_search_screens`,
  `refero_search_sites`, `refero_search_styles`) if connected; WebSearch for
  `"<gallery name>" <category>` plus fetching the brands' own live pages; or
  ask the user for screenshots from the gallery.
- If nothing is reachable, build from the pattern checklists in
  `references/patterns.md` and label the result "not grounded in live
  references".

## 3. Extract patterns, then build

For each reference, note in a short table: layout/structure, hierarchy (what
the eye hits first, second, third), copy pattern (headline formula, CTA
wording), visual treatment (type scale, colour, imagery, whitespace) and
**why it works**. Then:

- State the 2–3 patterns you're adopting and which reference each came from.
- Build with them, adapted to the user's content and brand. Never clone a
  reference's copy, imagery or logo.
- Check the result against the matching checklist in `references/patterns.md`.

## 4. Deliver

Give the build, plus a short "References used" list: gallery → example →
pattern taken. That lets the user see the choices and swap references.
