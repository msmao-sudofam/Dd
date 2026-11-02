"""Rebuild the hero concept poster: 1600x900 AVIF/WebP plus the 768x432 phone pair.

Source is the generated concept still used by the approved hero. The AVIF is the
modern-browser source; the WebP stays the <img> fallback so older browsers keep
the same picture. Sizes match the original 16:9 poster, so CSS object-fit still
handles the wide desktop crop.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
src = root / 'creative/video-concepts-2026-10-31/entrance-light.png'
out = root / 'site/assets/concepts'

im = Image.open(src).convert('RGB')
wide = im.resize((1600, 900), Image.LANCZOS)
phone = im.resize((768, 432), Image.LANCZOS)

wide.save(out / 'entrance-light.avif', 'AVIF', quality=58)
wide.save(out / 'entrance-light.webp', 'WEBP', quality=78, method=6)
phone.save(out / 'entrance-light-sm.avif', 'AVIF', quality=58)
phone.save(out / 'entrance-light-sm.webp', 'WEBP', quality=74, method=6)

for name in ('entrance-light.avif', 'entrance-light.webp',
             'entrance-light-sm.avif', 'entrance-light-sm.webp'):
    p = out / name
    print(f'{name:26} {p.stat().st_size / 1024:7.1f} KB')
