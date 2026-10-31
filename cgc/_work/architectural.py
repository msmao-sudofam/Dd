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
text=text.replace('<footer><div class="wrap">','<footer><div class="wrap"><div class="footer-title"><a href="#bid">Send the set.<span aria-hidden="true">↗</span></a></div>')
text=text.replace('See what glass changes.','The difference<br>is clear.').replace('Matched concept studies. Move the divider to see the change. Original CGC jobsite comparisons are below.','Explore three illustrated glazing concepts. Move the divider to compare. Actual CGC jobsite photographs are available below.').replace('One trade.<br>Every phase.','One trade.<br>All phases.').replace('The work speaks.','From the field.').replace('A clear scope.<br>A clear way forward.','Plans to punch.').replace('Scope. Schedule. Straight answers.','Before you<br>send the plans.')
path.write_text(text,encoding='utf-8')
print('Built current architectural revision.')
