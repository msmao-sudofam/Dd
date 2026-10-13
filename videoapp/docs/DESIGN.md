# Design — "Midnight Studio"

Researched with Refero (refero-design skill), plus the animated-website skill's scroll-film technique.
Chosen by M from three reference-locked directions (A Midnight Studio / B Neon Poster / C Lime Lab).

## Research
- **Styles reviewed (full):** Morphic, Bōjka Studio, Mode. **Previews compared:** Krea, Suno, Runway, Pika,
  Frame.io, Gumroad, Synthesia, Replicate, FLORA.
- **Screens:** Runway Watch (category rows), Runway Enterprise, Manus Playbook (template catalog), TikTok Effect House,
  exactly.ai.

## Reference lock
- **Primary: Morphic.** Pure black canvas; Inter only, tight negative tracking on display; image-led rounded clip
  cards (10px) and hero cards (32px); compact UI; ONE saturated interactive colour.
- **Preserve:** black `#000` canvas · `#212121` panels · Inter 700 display at −0.05em · media carries the page ·
  lime appears only on primary actions.
- **Borrow only:** (1) animated-website: sticky canvas frame-scrub with Gaussian dwell pacing + film grain;
  (2) Runway Watch: category rows = narrow title column + horizontal 9:16 strip.
- **Role rules:** lime `#c6ff3d` = filled primary CTA + focus ring only. Active/selected states = white fill, black text.
  Ghost actions = `rgba(100,100,100,.16)` pills. No lime borders, text accents or backgrounds.
- **Reject:** lime section backgrounds, accent-coloured headline word swaps, glows/gradients on surfaces, serif display,
  custom cursor/particles (from animated-website — they fight the lock), cream canvases.

## Tokens (src/app/globals.css)
| Token | Value | Role |
|---|---|---|
| background | `#000000` | canvas |
| surface / surface-2 | `#212121` / `#292929` | panels / hover |
| wash | `rgba(255,255,255,.05)` | feature-highlight card (32px) |
| ghost | `rgba(100,100,100,.16)` | ghost pills, inputs |
| border | `rgba(255,255,255,.08)` | hairlines |
| muted / subtle | `#999` / `#737373` | secondary / tertiary text |
| accent | `#c6ff3d` | **CTA only** |
| radii | 7px button · 10px clip card · 16–20px panels · 32px hero card · pill 100px |
| type | Inter Variable (self-hosted via @fontsource) · `.display` = 700, −0.05em, 0.95 lh |

## Decision ledger
| Decision | Source | Why |
|---|---|---|
| Black canvas, Inter, single CTA colour | Morphic | AI-creative tools users already trust (Runway/Krea/Morphic family); clips pop on black |
| Lime instead of Morphic blue | Existing brand + role rule | Keeps brand equity; still used only as the CTA colour |
| Scroll-scrubbed 9:16 film hero, 3 dwell beats (photo → look → ad) | animated-website skill | Shows the product promise as motion instead of describing it |
| Story-style progress bars on the film | Instagram/TikTok story chrome | Native to the audience; doubles as scroll progress |
| Mobile: first beat sits on black under a shrunken card; later beats overlay the full card with a bottom gradient | animated-website overlay pattern + 2026-10-12 fix | The stage used to pin at `top: 0` under an 86 px header, so the first headline and subtitle fell below the fold |
| Hero card opens small, dim and unlit, then grows into the ad | Krea "no high-key imagery on a dark page" + Apple-style scale-up | The film's first frame is a white listing photo; it was the brightest thing on screen |
| First screen is the whole pitch: full headline, lime action, the film playing by itself, four finished clips floating behind it (2026-10-13) | Suno / Affinity floating media cards; M: "we need to make the hook better" | The old first screen was half a sentence ("One product photo in.") next to a grey listing photo, with the result and the sign-up button two screens of scrolling away |
| Preset showcase: filter chips over one edge-to-edge strip (was five category rows) | fal explore quick chips + Runway Watch strip | Rows with 2 tiles left dead black space and made the page read like a catalog; one strip is ~1,700 px shorter. Active chip = white fill (role rule). All 20 tiles stay in the DOM, filtered with `hidden` |
| Pricing cards: name, scale line, price, per-credit, hairline, 3-item "included" list | Epidemic Sound / JetBrains pricing | Each list item is backed by the Terms or the watermark rule; no invented plan perks or "most popular" badge |
| Fine print as a hairline 4-up row directly under the prices | Morphic hairline surfaces | Promises sit next to the prices they qualify, and two rounded panels no longer stack back to back |
| FAQ: two columns, sticky heading left | Fourthwall / JetBrains FAQ | Uses the 6xl width instead of a narrow centred column floating in black |
| Section eyebrows (Presets, Pricing, Questions) above display headings | Morphic / Krea compact labels | Consistent rhythm between sections |
| Clips play only when on screen | Craft (performance) | 20+ videos on one page |
| Feature-highlight panel "The fine print, up front." with 4 promises | Morphic feature card + honesty rule | Objection handling (price, refunds, rights, consent) using only things the product does today. Replaced "Brands pay $2k… 30 seconds", which wasn't a fact about Reelforge |
| Reduced motion: no pinning, static poster, beats in flow | Craft (accessibility) | No scroll-jacking for users who opt out |

## Copy rules
- **Hero headline:** "One photo. {n} ways to stop the scroll." `{n}` is the number of presets on the page, read from
  the catalog, so it stays true when presets are added or hidden. The line breaks are fixed and the type is sized so
  the middle line fits its column at every width; change the words and the sizes together.
- **No durations.** Generation time hasn't been measured on real providers yet, so no page states one (no "seconds",
  "about a minute", "instantly"). Add real per-model timings only after the smoke test runs.
- **Every number must be true of the product.** Credit counts and prices come from the catalog and pricing code; no
  market-price comparisons, customer counts, reviews or scarcity.

## Media
- `public/film/` holds the hero film (72 frames, 1.9 MB desktop / 1.1 MB mobile): a plain listing photo of a skincare
  bottle that turns into a finished ad, generated locally in go-live Step 4 (first and last frame from Krea 2, motion
  from MiniMax H3). To change it, replace `media/hero-film.mp4` and run `npm run film` (on Windows call
  `python scripts/extract_frames.py …` with the same arguments; `python3` is a Store stub there). Keep it 9:16,
  3–5 s, the first frame a plain product photo.
- Preset previews: one 576×1024, 5 s, silent H.264 clip per preset in `public/presets/<slug>.mp4`, with its first
  frame as the poster (`<slug>.jpg`) so tiles don't jump when the clip starts. The five `placeholder-*` files are
  no longer referenced by the seed catalog.

## Motion and light (added 2026-10-12, at M's request for more "wow")
The lock still holds: black canvas, Inter, lime only on primary actions. One rule was relaxed on purpose: **light may
spill from the media itself**, never from flat colour. That replaces the earlier "no glows" line for these cases only.

| Piece | Where | How it works |
|---|---|---|
| Ambient hero glow | `scroll-film.tsx` | The current film frame is drawn 16 px wide into a second canvas, blurred and masked behind the card, so the page is lit by the film (white at the listing photo, green by the finished ad). Desktop only. |
| Clip wall | `landing/clip-wall.tsx`, `.wall*` | All 20 previews drift in three rows on a tilted plane, edges faded by a mask; pauses on hover. Uses the 288 px twins in `public/presets/sm/` (1.8 MB for all 20). Third row is hidden on phones. |
| Tile tilt + glare | `preset-tile.tsx`, `.tilt` | Tiles lean toward the pointer with a soft-light highlight and a "Try it →" cue. Mouse only. |
| Creator fan | `landing/creator-fan.tsx`, `.fan` | Five library creators as a fanned hand of cards that spreads on hover; back cards are dimmed for depth. |
| Video through type | `.type-fill` | The closing headline is white-on-black text multiplied over `public/media/type-fill.mp4` (six clips side by side), so footage plays inside the letters. |
| Pointer hairline | `.spot` | Card borders brighten under the cursor (pricing, UGC and proof panels). |
| Scroll reveals | `[data-reveal]` + `components/fx.tsx` | One-shot rise-and-unblur (0.6 s, 16 px, 4 px blur), easing `cubic-bezier(.2,.7,.2,1)`, triggered as soon as an element enters the viewport so headings are sharp mid-scroll. Hidden only after the controller mounts, so the page is complete without JavaScript. |
| Hero growth | `scroll-film.tsx`, `.film*` | The card starts at `--start` scale (0.84 desktop; measured on phones so it clears the first headline) and grows with `--grow` (eased scroll) between 30% and 46% of the film. Glow and brightness follow `--lit` (the frame on screen), the phone text-shade follows `--grow`. Captions "Listing photo" / "Finished ad" follow the frame and are counter-scaled so they stay readable. |
| Self-playing film | `scroll-film.tsx` (`AUTO`, `autoPos`) | While the page rests at the top and all 72 frames are loaded, the film plays by itself: photo, 2.8 s to the ad, hold 3.4 s, rewind, repeat. The story bars fill with it (`--bar`). Scrolling past 1.2% of the section hands the film back to the scroll position; returning to the top restarts the loop from the photo. |
| Deck | `scroll-film.tsx` (`DECK_SLOTS`), `.film-deck*`, `HERO_DECK` in `app/page.tsx` | Four finished preset clips (the 288 px twins) float behind the film card, dimmed, each with its look's name from 1024 px up. They share the card's box and scale, drift on their own clocks, lean with the pointer by their depth (`--px`/`--py`, eased in the frame loop, mouse only) and tuck behind the film as it grows; their videos are paused while hidden. |
| Hero load-in | `.hero-words`, `hero-*` and `deck-in` keyframes | Headline words rise and unblur one after another (60 ms apart), then the lines under it, while the card rises and the deck fans out from behind it. Pure CSS with `backwards` fill, so it runs before any script and leaves the scroll transitions alone afterwards. |
| Beat changes | `.beat` | Each beat's lines enter one after another (70 ms apart, rise + unblur) and leave together in 0.28 s. |
| Staggered groups | `[data-reveal="kids"]` | The container stays put and its children come in 80 ms apart (the four promises under the prices). |
| Accordions | `details::details-content` | FAQ answers slide open where the browser can animate to an auto height (`interpolate-size`); elsewhere they snap as before. |
| Press | `btn` utility | Every button dips to 97% while pressed. |
| Header offset | `--hdr`, measured by `fx.tsx` | The film stage pins just below the sticky header (86 px on phones, 56 px from 640 px). |
| Preset strip bleed | `preset-rows.tsx`, `.strip-bleed` | On desktop the strips run to the right edge of the screen; the wrapper uses `overflow-x: clip` because 100vw includes the scrollbar. |
| CTA sheen | `.btn-sheen` | A single light sweep across the lime button on hover. |

- One controller (`components/fx.tsx`, mounted in the root layout) drives reveals, hairlines and tilt with a single
  pointer listener; state lives in data attributes and CSS variables.
- `prefers-reduced-motion`: no reveals, no tilt, the wall stands still, clips stay on their posters; the hero has no
  load-in, no self-playing film and no deck.
- Regenerate the small clips and the type strip with `python web_extras.py` in `~/Projects/reelforge-previews`.
- Still rejected: custom cursors, particles, accent-coloured glows, lime anywhere but the primary action.

## Surfaces added 2026-10-12 (mechanics first; open for restyling)
- **Try stage** (`components/landing/try-stage.tsx`, section `#try` under the hero): link field, upload, consent, look
  chips, a 9:16 card with a drag-to-compare slider. Lime only on the one primary action in each state.
- **Try bar** (`components/try-bar.tsx`): a small fixed pill at the bottom while a visitor has a product in try mode.
- **Feed** (`/feed`, `components/feed/feed.tsx`): full-screen snap feed of the preset clips, 460 px wide on desktop.
- Their `data-testid`s are used by `tests/e2e/try-and-feed.spec.ts`; behaviour is described in PROGRESS.md.
