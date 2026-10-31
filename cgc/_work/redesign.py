from pathlib import Path
import re,runpy
R=Path(__file__).resolve().parents[1];S=R/'site'
# Base generator retains facts, schema, consent and existing form/calculator markup.
runpy.run_path(str(R/'_work/site.py'))
p=S/'index.html';text=p.read_text(encoding='utf-8')
css=(R/'_work/font.css').read_text(encoding='utf-8')+(R/'_work/bright.css').read_text(encoding='utf-8-sig')
text=re.sub(r'<style>.*?</style>',lambda _:'<style>'+css+'</style>',text,count=1,flags=re.S)
text=re.sub(r'<script type="importmap">.*?</script>','',text,flags=re.S);text=re.sub(r'<script type="module">.*?</script>','',text,flags=re.S);text=re.sub(r'<noscript><style>.*?</style></noscript>','',text,flags=re.S)
hero='''<section id="film" aria-label="CGC field film"><picture class="cinema-poster"><source media="(max-width:760px)" srcset="assets/film/portrait-poster.webp"><img class="cinema-poster" src="assets/film/wide-poster.webp" alt="CGC clear glass conference-room fronts in a commercial interior" width="1600" height="900" fetchpriority="high"></picture><video id="intro-film" class="cinema-video" muted loop playsinline preload="none" aria-label="Sixteen-second silent film of CGC office fronts, glass handling and installation"><track kind="captions" src="assets/film/captions.vtt" srclang="en" label="English"></video><div class="film-content wrap"><div class="film-top"><span><i aria-hidden="true"></i> COMMERCIAL GLAZING / SOUTHERN CALIFORNIA</span><span>CGC / FIELD NOTES — 01</span></div><div class="film-copy"><h1>We put the<br>glass in.</h1><p>Storefront, curtain wall and interior glass.<br>Built for general contractors and property owners across Southern California.</p><div class="actions"><a class="btn primary" href="#bid">Send plans for a bid <span aria-hidden="true">↗</span></a><a class="btn" href="tel:+17146504185">(714) 650-4185</a></div></div><div class="film-bottom"><p class="film-label" id="film-chapter">01 / Clear divisions</p><div class="film-progress" aria-hidden="true"><span id="film-progress"></span></div><span class="film-count" id="film-time">00:00 / 00:16</span><button id="film-toggle" class="film-toggle" aria-controls="intro-film" aria-pressed="false">Play film</button><button id="film-captions" class="film-cc" aria-pressed="false" aria-label="CC / Show film captions">CC</button><a class="film-link" href="#before-after">Explore the work ↓</a></div></div></section>'''
text=re.sub(r'<section id="film".*?(?=<section class="proof">)',lambda _:hero,text,flags=re.S)
text=text.replace('01 / In the field','01 / Before meets after').replace('Same opening.<br>Two visits.','See what glass changes.').replace('Actual company photos. Move the divider to compare the opening before and after glazing.','Matched concept studies. Move the divider to see the change. Original CGC jobsite comparisons are below.').replace('02 / Scope of work','02 / What we install').replace('All phases.<br>Commercial glazing.','One trade.<br>Every phase.').replace('03 / Work, documented','03 / Real projects. Real photographs.').replace('From the jobsite.','The work speaks.').replace('Storefronts, office fronts and the work in between. Photos and field clips from CGC.','From storefronts to office fronts. The photographs and field clips in this gallery are CGC’s actual work.').replace('04 / For general contractors','04 / From plans to punch').replace('Send the set.<br>Let’s define the scope.','A clear scope.<br>A clear way forward.').replace('05 / Field tool','05 / Know the weight').replace('06 / Estimating','06 / Put the plans in motion')
text=text.replace('content="#0a0b0d"','content="#ffffff"')
main=(R/'_work/main.js').read_text(encoding='utf-8-sig');main=re.sub(r'// Static content.*?\n(?=\$\$)', '',main,flags=re.S)
a=main.index("let filter='all'");b=main.index("const box=$('#lightbox')",a)
main=main[:a]+'''let filter='all',shown=12;
function workFilter(){const items=$$('.gallery-item').filter(x=>filter==='all'||x.dataset.category===filter);$$('.gallery-item').forEach(x=>x.hidden=true);items.slice(0,shown).forEach(x=>x.hidden=false);const more=$('#more-work');more.hidden=shown>=items.length;more.textContent='Show more work ('+Math.min(shown,items.length)+' / '+items.length+')';}
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;shown=12;$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));workFilter()});$('#more-work').onclick=()=>{shown+=12;workFilter()};workFilter();
'''+main[b:]
main+='\n'+(R/'_work/cinema.js').read_text(encoding='utf-8-sig')
# Replace only the public behavior script; retain structured SEO data and analytics.
text=re.sub(r'<script>.*?</script>',lambda _:'<script>'+main+'</script>',text,count=1,flags=re.S)
p.write_text(text,encoding='utf-8')
runpy.run_path(str(S/'_build.py'),run_name='__main__')
print('Built bright architectural redesign')
