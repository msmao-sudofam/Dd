"""Service-row stills on the local ComfyUI (Krea 2 Turbo). Generated illustrations, not CGC project photos.
  python render.py            # all trades, seeds 11 and 22 -> raw/<trade>_<seed>.png, prompts in raw/prompts.json
"""
import json, sys, shutil, urllib.parse, urllib.request
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'leadgen/mockups'))
from render_heroes import graph, post, wait, COMFY

STYLE = ("professional architectural photography, Southern California, graphite black aluminum framing, "
         "clear glass with soft reflections, dusk with warm interior light, cinematic, slightly desaturated, "
         "sharp detail, 35mm lens, no people, no text, no logos, no signage")
SHOTS = {
    'storefront': "street-level view of a new commercial storefront with floor-to-ceiling glass and black aluminum mullions, a glass entry door, warm lit retail interior visible through the glass, clean concrete sidewalk",
    'curtain-wall': "looking up at a modern mid-rise office building with a unitized glass curtain wall, crisp grid of mullions, the glass reflecting a dusk sky with soft clouds",
    'interior': "inside a bright modern office suite, frameless glass office fronts and glass partitions with slim black frames along a corridor, polished concrete floor, linear ceiling lights",
    'entrances': "a pair of tall frameless glass entrance doors with long vertical stainless steel pulls at a modern commercial lobby, warm lobby light glowing through, stone paving outside",
    'service': "close view of a single new clear glass pane freshly installed in a black aluminum storefront frame, fresh black gaskets, a suction cup glass lifter resting on the sill, clean work, soft daylight",
}
out = Path(__file__).resolve().parent / 'raw'; log = {}
for trade, shot in SHOTS.items():
    for seed in (11, 22):
        prompt = f"{shot}, {STYLE}"
        img = wait(post('/prompt', {'prompt': graph(prompt, seed, 1664, 1024)})['prompt_id'])
        q = urllib.parse.urlencode({'filename': img['filename'], 'subfolder': img['subfolder'], 'type': 'output'})
        dst = out / f'{trade}_{seed}.png'
        with urllib.request.urlopen(f'{COMFY}/view?{q}') as r, open(dst, 'wb') as f: shutil.copyfileobj(r, f)
        log[dst.name] = dict(seed=seed, prompt=prompt, model='krea2_turbo_fp8_scaled', steps=8, size=[1664, 1024])
        print('saved', dst.name, flush=True)
(out / 'prompts.json').write_text(json.dumps(log, indent=2), encoding='utf-8')
