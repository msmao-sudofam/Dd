# Compliance: what a SÍ QUEMA video can say

SÍ QUEMA is a dietary supplement. Ads get judged by the FTC (truth in advertising),
the FDA (supplement claims), and Meta/TikTok ad policy. This is the working rulebook,
not legal advice. When a claim is unclear, leave it out and ask M Mo.

## Never (gate FAILs on these)

**Weight-loss and fat-loss claims, in any language. This is M Mo's rule for the brand.**
- EN: lose weight, weight loss, fat loss, burn fat, fat burning, melt fat, shred fat,
  drop pounds, lose X lbs, slim down, flat belly, belly fat, get skinny
- ES: bajar de peso, perder peso, pérdida de peso, adelgazar, quemar grasa,
  quema grasa, quemagrasa, derretir grasa, grasa abdominal, panza plana, kilos menos

**Disease claims:** cure, treat, prevent, heal, diagnose, or any disease or
condition (diabetes, obesity, thyroid, cholesterol, blood pressure...).

**Fake proof:** "clinically proven", "doctor recommended", "FDA approved" (the FDA
doesn't approve supplements), "guaranteed results", "#1" unless `sources.json`
backs it.

**Personal-attribute "you" lines** (Meta policy): "Are you overweight?", "Hate your body?"

**AI people as testimonials.** A generated face never carries a customer quote.

## Careful (gate WARNs; only OK if it's verbatim from the real label)

- "fat burner" / "thermogenic fat burner". The product category may be printed on
  the label. Show it only as part of the real label shot, never as a headline or VO.
- metabolism, metabolismo, thermogenic, termogénico, energy, energía, focus,
  enfoque, endurance, appetite, apetito. These are structure/function claims, and
  each one needs the disclaimer below.

## Always

**FDA disclaimer:** any benefit claim (energy, focus, metabolism, thermogenic...)
means this text appears on screen, readable, for at least 2 seconds:

> *These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.*

In a Spanish-first video, add the Spanish line too:

> *Estas declaraciones no han sido evaluadas por la Administración de Alimentos y Medicamentos. Este producto no está destinado a diagnosticar, tratar, curar o prevenir ninguna enfermedad.*

**Real label only.** Ingredient amounts come off the real Supplement Facts panel
(photo in `brand/assets/label/`) and go into `sources.json` before they go on screen.

**Safe ground** that needs no proof: flavor, taste, the gym, the culture, the
ritual (scoop, shake, go), the price, the people (filmed, with permission), the
heat of the workout ("Sí, quema" said about the set, not the body).
