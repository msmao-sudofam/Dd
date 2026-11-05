# Animation Studio styles, for SÍ QUEMA

`animation-studio` (`.claude/skills/animation-studio`) is a third-party style pack with 10 looks.
It decides how a piece looks. This skill still decides whether it ships: everything in
`principles.md`, `slop.md`, `compliance.md` and `sources.json` applies, and every render
goes through `scripts/gate.py` and the godfather check.

Reviewed 2026-11-05: instructions plus one optional local renderer
(`scripts/render_video.mjs`). It installs nothing, makes no network calls, and blocks
remote page requests. Nothing in it changes these rules.

## Which style, for what

| Style | Call | Use it for | Rules on top |
|---|---|---|---|
| `/chalkboard` | **current** | Ingredient explainers, "what's in the scoop", label breakdowns | Chalk dust is soft haze, never specks or sparkles. Draw the real label rows, not a redrawn tub. |
| `/flatvector` | **current** | Ritual (scoop → shake → set), flavor cards, price/offer cards | Brand palette (`brand/brand.md`). Flat shapes only: never a drawn tub or label. Use the real product photo as a still card if the product must appear. |
| `/dankoe` | **current** | One idea per reel: "9 numbers vs 1", focus vs jitters, the routine | Turn orbit rings and constellations off (orbit is banned). White lines on black, one red accent allowed for the dose. |
| `/comicart` | **watch** | Before-the-set vs mid-set energy as panels, "wrong label / right label" | No before/after bodies. No invented dialogue or customer quotes. Starbursts only on a real beat, never on a claim. |
| `/pixelart` | **watch** | Gym "level up" hooks, flavor select screen | No sparkles, no pixel camera shake (both banned). Never a pixel tub or pixel label: show the real product as a still card. |
| `/zackdfilms` | **watch** | Explaining a mechanism the label names (what caffeine is, what a spice is) | No bodies, organs, heat maps or "fat cells". No 3D tub. Only facts from `sources.json`. |
| `/glowsketch` | **retired** | — | Glow on lines and data is on the ban list. |
| `/cgimotion` | **retired** | — | Bloom, plus 3D renders of the product. Real footage only. |
| `/ps2` | **retired** | — | Built around low-poly 3D product and people models: an AI-looking tub and fake people. |
| `/legostyle` | **retired** | — | Reads cheap, and a brick tub is still a fake tub. |

`watch` means the plan has to say why this style is the right call (same rule as `moves.json`).

## Settings that override the pack's defaults

- **Format:** 1080×1920 at **30 fps** (the pack defaults to 24 fps).
- **Text:** keep it between y=220 and y=1500. The fine print `200 mg caffeine per serving · 18+` goes on every piece.
- **Claims:** any benefit word (energy, focus, thermogenic…) or a line ending in `*` needs the full FDA line on screen (`compliance.md`).
- **Numbers:** only from `sources.json`. The pack's "preserve the user's script" never overrides that.
- **Audio:** no music in the file; M Mo adds the trending sound in the app. SFX are synthesized or real foley only.
- **Product:** never generated, redrawn or modeled in any style. Real photos or footage only, shown as they are.

## How to ask for one

```
Use Animation Studio /flatvector for SÍ QUEMA
Script: [script]
```

Claude then loads this file and the siquema-motion rules before planning, picks moves by
id, and runs the gate before showing anything.
