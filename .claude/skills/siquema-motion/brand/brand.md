# SÍ QUEMA — brand

**What it is:** DTC thermogenic powder. Shopify store at siquemasupplements.com. Separate
from AGENCÉ; never mix the two stores or their assets. Live catalog, photos, and full
descriptions are in `store.json` (re-fetch with `scripts/fetch_store.py`).

**Products** (fetched 2026-10-19; prices go through `sources.json` like any number):

| Flavor | Store line | One tub | Two-pack | Three-pack |
|---|---|---|---|---|
| Mango | "Sweet up front, clean on the back end. The one everybody starts with." | $34.99 | $66.48 | $99.72 |
| Watermelon | "Light, cold, barely sweet. Drinks like water on a two-hour session." | $34.99 | $66.48 | $99.72 |
| Kiwi Strawberry | "Tart kiwi, ripe strawberry. The loudest flavor in the line." | $34.99 | $66.48 | $99.72 |
| Cucumber Lime | "Pepino con limón y chile, minus the chile. Savory, sharp, zero sugar taste." | $34.99 | $66.48 | $99.72 |
| Variety Pack | One tub of each, 5% off | $132.96 | | |

Per serving (1 scoop, 4.5 g, 30 servings per tub): Caffeine Anhydrous 200 mg ·
N-Acetyl L-Carnitine HCl 1 g · L-Carnitine L-Tartrate 1 g · L-Tyrosine 500 mg ·
L-Theanine 350 mg · Capsimax® Cayenne Extract 100 mg · Gamma-Butyrobetaine HCl 75 mg ·
AstraGin® 50 mg · Grains of Paradise Extract 40 mg. "Nine ingredients, every dose on the
label. No proprietary blends." 30-day money-back guarantee. Free U.S. shipping, ships
from California in 1–2 business days. Every one of these is in `sources.json`.

**Positioning:** bilingual and Latino-led, but built for everyone. Loud, gym-brand energy.

**Voice:** the store copy already nails it. Short, sensory, specific, a little cocky:
"Drinks like water on a two-hour session." "The loudest flavor in the line."
"Nine ingredients, every dose on the label." Spanish sits inside the English naturally
("Pepino con limón y chile, minus the chile"). Never machine-translate. The name is about
heat and intensity ("Sí, quema" said about the set), never "it burns fat".

## The label (sampled from the store photos)

- White tub, white lid.
- **Logo:** "SÍ QUEMA" in black brush/graffiti lettering, ink ≈ `#171515`.
- **Black tribal flames** rising behind the logo, over a **flame gradient** at the
  bottom in the flavor's color.
- **Red banner** with white caps: "ENERGY + FOCUS". Banner red ≈ `#A1201F` in
  shadow; it prints brighter. **"ENERGY + FOCUS" is a benefit claim**, so any shot
  where the label is readable needs the FDA disclaimer in the video (compliance.md).
- Flavor name in brush script, in the flavor color, under the fruit art.
- Fine print: "DIETARY SUPPLEMENT | NET WT. 135g | 30 SERVINGS".

| Token | Value | Source |
|---|---|---|
| Ink (logo, flames) | `#171515` | label, sampled |
| Banner red | `#A1201F` (approx; brighter in print) | label, sampled |
| Tub white | `#F1F1EA` | label, sampled |
| Mango | `#E7950D` flames · `#C06E1D` name | mango/02.jpg |
| Watermelon | `#DA6024` flames · `#AF4238` name | watermelon/02.jpg |
| Kiwi Strawberry | `#D06C2F` flames · light green name (sample unclear) | kiwi-strawberry/02.jpg |
| Cucumber Lime | `#BFD02C` flames · `#A5AC40` name | cucumber-lime/02.jpg |
| Display font (site) | Anton | site CSS |
| Serif (site) | Fraunces | site CSS |
| Body (site) | Inter 400/500/800 | site CSS |
| Mono (site) | Space Mono (use for mono-note-card, supplement-facts callouts) | site CSS |

Values are sampled from 960 px compressed renders, so they're approximate. Swap them for
the print file's values once someone has it.

## ⚠ Open call for M Mo: the store photos are renders

All 17 store photos (`assets/product/`) are 3D/AI-style renders: tubs floating over
glowing podiums, neon color light, fruit-splash explosions, sparks. That's the exact
look `slop.md` bans (glow, particles, generated product). The label art on them is
accurate, so they're good for **label reference and color sampling**.

Until M Mo decides otherwise:
- Store renders may appear only as **still product cards** (end card, price card),
  shown as they are. Never animate their glow, sparks, or splashes, and never extend that look.
- Motion is built on **real footage** of the real tub (scoop, shaker, gym). That
  footage doesn't exist in any connected account yet; it has to be shot.
- No logo file exists outside the label. Cut it from a real label photo or get the
  vector from the designer before using it as a standalone mark.

## Taste

M Mo's general taste: modern, high-contrast, a bit of luxury, even when the energy is loud.
Cinematic over busy.
