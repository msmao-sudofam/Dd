"""Publish the approved concept originals without modifying the source images."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'creative/video-concepts-2026-10-31'
assets = root / 'site/assets/concepts'
for name in ('curtain-wall-before', 'curtain-wall-after', 'entrance-light'):
    image = Image.open(source / f'{name}.png').convert('RGB')
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    image.save(assets / f'{name}.webp', quality=82, method=6)

path = root / 'site/media/manifest.json'
manifest = json.loads(path.read_text(encoding='utf-8'))
pair = {
    'before': 'assets/concepts/curtain-wall-before.webp',
    'after': 'assets/concepts/curtain-wall-after.webp',
    'title': 'From boarded bays to daylight.',
    'caption': 'Curtain wall / a matched corner-building concept.',
    'before_alt': 'Illustrative concept: plywood boards cover the openings of a white two-story corner office building.',
    'after_alt': 'Illustrative concept: the same corner office building with steel-blue glazing and graphite mullions.'
}
if not any(p['before'] == pair['before'] for p in manifest['concept_pairs']):
    manifest['concept_pairs'].append(pair)
path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')

path = assets / 'provenance.json'
provenance = json.loads(path.read_text(encoding='utf-8'))
for name in ('curtain-wall-before', 'curtain-wall-after', 'entrance-light'):
    provenance['files'][name] = f'creative/video-concepts-2026-10-31/{name}.png'
provenance['additional_prompts'] = 'creative/video-concepts-2026-10-31/IMAGE-PROMPTS.json'
path.write_text(json.dumps(provenance, indent=2), encoding='utf-8')
print('Published three generated concept assets; source originals preserved.')
