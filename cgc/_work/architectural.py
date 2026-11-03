"""Rebuild the approved facts/forms, then apply the current architectural design."""
from pathlib import Path
import re, runpy

root=Path(__file__).resolve().parents[1]
runpy.run_path(str(root/'_work/redesign.py'))
path=root/'site/index.html'
text=path.read_text(encoding='utf-8')
css=(root/'_work/font.css').read_text(encoding='utf-8')+(root/'_work/architectural.css').read_text(encoding='utf-8')
text=re.sub(r'<style>.*?</style>',lambda _:'<style>'+css+'</style>',text,count=1,flags=re.S)
hero=(root/'_work/architectural-hero.html').read_text(encoding='utf-8')
text=re.sub(r'<section id="film".*?(?=<section class="proof">)',lambda _:hero,text,flags=re.S)
text=text.replace('shown=12','shown=6').replace('shown+=12','shown+=6')
script=re.search(r'<script>(.*?)</script>',text,re.S).group(1)
script=script[:script.index("const filmVideo=$('#intro-film')")]+(root/'_work/architectural.js').read_text(encoding='utf-8')
text=re.sub(r'<script>.*?</script>',lambda _:'<script>'+script+'</script>',text,count=1,flags=re.S)
text=text.replace('<img src="assets/logo.svg" alt="Commercial Glazing Contractors Inc." width="210" height="89">','<img class="footer-logo" src="assets/logo-v3-dark.svg" alt="Commercial Glazing Contractors Inc." width="300" height="40" loading="lazy">')
text=text.replace('<footer><div class="wrap">','<footer><div class="wrap"><div class="footer-title"><a href="#bid">Send the set.<span aria-hidden="true">↗</span></a></div>')
text=text.replace('See what glass changes.','The difference<br>is clear.').replace('Matched concept studies. Move the divider to see the change. Original CGC jobsite comparisons are below.','Explore three illustrated glazing concepts. Move the divider to compare. Actual CGC jobsite photographs are available below.').replace('One trade.<br>Every phase.','One trade.<br>All phases.').replace('The work speaks.','From the field.').replace('A clear scope.<br>A clear way forward.','Plans to punch.').replace('Scope. Schedule. Straight answers.','Before you<br>send the plans.')
# Concept films S1 (scroll scrub before the process) and S2 (walk-in loop in the FAQ's open left column, so the bid form stays near its heading).
text=text.replace('<section class="section" id="process">',(root/'_work/build-film.html').read_text(encoding='utf-8')+'<section class="section" id="process">',1)
text=text.replace('<div class="faq">',(root/'_work/walk-film.html').read_text(encoding='utf-8').strip()+'<div class="faq">',1)
# Phones (≈370 CSS px at 2-3x) need ~900 px: add a middle size so they stop pulling the 1200+ px original.
from PIL import Image
def mid(m):
    stem=m.group(1);md=root/f'site/media/{stem}-md.webp'
    if not md.exists():
        im=Image.open(root/f'site/media/{stem}.webp');im.thumbnail((900,10000));im.save(md,'WEBP',quality=78,method=6)
    return f'media/{stem}-thumb.webp 480w, media/{stem}-md.webp 900w, media/{stem}.webp 1200w'
text=re.sub(r'media/([\w-]+?)-thumb\.webp 480w, media/\1\.webp 1200w',mid,text)
path.write_text(text,encoding='utf-8')
print('Built current architectural revision.')
