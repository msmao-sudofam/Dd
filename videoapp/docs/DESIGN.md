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
| Mobile: text overlaid on the film with a bottom gradient | animated-website overlay pattern | Stacked layout overflowed 844px viewports |
| Category rows with horizontal strips | Runway Watch screen | 20 presets scan faster by category; strips keep the page short |
| Clips play only when on screen | Craft (performance) | 20+ videos on one page |
| Feature-highlight panel "Brands pay $2k…" with 3 proof points | Morphic feature card + BUILD_PLAN §5 hook | Objection handling (cost, rights, safety) in one sparse block |
| Reduced motion: no pinning, static poster, beats in flow | Craft (accessibility) | No scroll-jacking for users who opt out |

## Media
- `public/film/` holds the hero film (72 frames, 1.9 MB desktop / 1.1 MB mobile): a plain listing photo of a skincare
  bottle that turns into a finished ad, generated locally in go-live Step 4 (first and last frame from Krea 2, motion
  from MiniMax H3). To change it, replace `media/hero-film.mp4` and run `npm run film` (on Windows call
  `python scripts/extract_frames.py …` with the same arguments; `python3` is a Store stub there). Keep it 9:16,
  3–5 s, the first frame a plain product photo.
- Preset previews: one 576×1024, 5 s, silent H.264 clip per preset in `public/presets/<slug>.mp4`, with its first
  frame as the poster (`<slug>.jpg`) so tiles don't jump when the clip starts. The five `placeholder-*` files are
  no longer referenced by the seed catalog.
