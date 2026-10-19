# Slop

Things that make a video look AI-made or like a supplement scam. `scripts/gate.py`
detects the ones marked **[code]** in animation/overlay code. The rest you catch on
the contact sheet.

## Ban list

- ~~Glowing bodies~~: bloom, glow, or neon on a body, a product, or data **[code]**
- ~~Orbit rings~~: rings, halos, or particles circling the product or a body part **[code]**
- ~~Numbers racing up~~: count-up or odometer animations **[code]**
- ~~Red glowing hotspots~~ on a body ("fat zones", "burn zones") **[code: pure red]**
- ~~Body scans, x-ray or thermal views of a body~~
- ~~Before/after bodies~~, side-by-side or as a wipe
- ~~Bounce, elastic, or overshoot easing~~ on type or product **[code]**
- ~~Glitch, RGB split, chromatic aberration, hue cycling~~ **[code]**
- ~~Slam zooms, whip pans, and camera shake added in post~~ **[code]**
- ~~Flashing red, countdown timers, WARNING banners~~ **[code]**
- ~~Sparkles, lens flares, confetti, particle bursts, fire particles~~ **[code]**
  (the name means heat; that doesn't mean fake fire)
- ~~Stock whooshes, chimes, bells, risers on every cut~~ **[code: sfx filenames]**
- ~~AI-generated tubs, labels, scoops, or "customers"~~
- ~~AI-drawn text inside generated images~~ (letters melt, it gives the game away)
- ~~3D tub spinning on a gradient~~

## Swap table: instead of → do this

| Instead of | Do |
|---|---|
| Glow, bloom, neon on data | Flat color, hairlines, real light in the shot |
| Bounce, elastic, overshoot | Ease-out, settle, hold |
| Glitch, RGB split, hue cycling | Name it in type. A hard cut. |
| Red glowing hotspots on a body | Nothing. Point at the real thing (the label, the scoop) with a hairline. |
| Orbit rings, halos | A still number with its source, or the real object, in focus |
| Count-up to a scary number | The number is already there when the shot starts, with its source line under it |
| Slam, whip, shake in post | A real camera move, or a cut on the beat |
| Flashing red, countdowns, WARNING | Calm color. Never flash. |
| Fire particles for "quema" | Real heat: sweat, chalk dust, breath, a real flame on set if you want fire |
| Before/after body | The workout itself, the scoop, the shaker, the face mid-set |
| Stock whoosh/chime on every cut | Room tone, real foley (scoop, lid, shaker, plates), or silence. Soft clicks only. |
| 3D tub on gradient | The real tub on a real gym floor, natural light |

## Allowing a banned pattern on purpose

If a banned pattern really is the right call, put a comment on that line with the
reason, and mention it when you present the render:

```python
draw.text(..., fill=(255, 0, 0))  # gate: allow pure-red, label red is #FF0000, sampled from label photo
```
