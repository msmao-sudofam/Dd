"""Rebuild the approved facts/forms, then apply the current architectural design."""
from pathlib import Path
import re, runpy

root=Path(__file__).resolve().parents[1]
runpy.run_path(str(root/'_work/redesign.py'))
path=root/'site/index.html'
text=path.read_text(encoding='utf-8')
css=(root/'_work/font.css').read_text(encoding='utf-8')+(root/'_work/architectural.css').read_text(encoding='utf-8')
text=re.sub(r'<style>.*?</style>',lambda _:'<style>'+css+'</style>',text,count=1,flags=re.S)
hero=(root/'_work/build-hero.html').read_text(encoding='utf-8')
# The concept reel becomes a mid-page film break: same player, no hero copy.
reel=re.sub(r'\s*<div class="hero-copy">.*?</div>\s*</div>\s*</div>','',(root/'_work/architectural-hero.html').read_text(encoding='utf-8'),count=1,flags=re.S).replace('aria-label="Commercial glazing introduction"','aria-label="Concept reel"')
text=re.sub(r'<section id="film".*?(?=<section class="proof">)',lambda _:hero,text,flags=re.S)
text=text.replace('shown=12','shown=6').replace('shown+=12','shown+=6')
script=re.search(r'<script>(.*?)</script>',text,re.S).group(1)
script=script[:script.index("const filmVideo=$('#intro-film')")]
# The old slider jumped to any touch and fought native image drag; architectural.js owns the sliders now.
old=script[script.index("$$('.pair input').forEach"):]
script=script.replace(old[:old.index('\n')+1],'',1)
script=script+(root/'_work/architectural.js').read_text(encoding='utf-8')
text=re.sub(r'<script>.*?</script>',lambda _:'<script>'+script+'</script>',text,count=1,flags=re.S)
text=text.replace('<img src="assets/logo.svg" alt="Commercial Glazing Contractors Inc." width="210" height="89">','<img class="footer-logo" src="assets/logo-v3-dark.svg" alt="Commercial Glazing Contractors Inc." width="300" height="40" loading="lazy">')
text=text.replace('<footer><div class="wrap">','<footer><div class="wrap"><div class="footer-title"><a href="#bid">Send the set.<span aria-hidden="true">↗</span></a></div>')
text=text.replace('See what glass changes.','The difference<br>is clear.').replace('Matched concept studies. Move the divider to see the change. Original CGC jobsite comparisons are below.','Explore three illustrated glazing concepts. Move the divider to compare. Actual CGC jobsite photographs are available below.').replace('One trade.<br>Every phase.','One trade.<br>All phases.').replace('The work speaks.','From the field.').replace('A clear scope.<br>A clear way forward.','Plans to punch.').replace('Scope. Schedule. Straight answers.','Before you<br>send the plans.')
# Concept films S1 (scroll scrub above the field gallery) and S2 (walk-in loop in the FAQ's open left column, so the bid form stays near its heading).
text=text.replace('<section class="section" id="work">',reel+'<section class="section" id="work">',1)
text=text.replace('<div class="faq">',(root/'_work/walk-film.html').read_text(encoding='utf-8').strip()+'<div class="faq">',1)
# Charcoal header: light logo and mark, and the browser chrome matches.
text=text.replace('srcset="assets/logo-v3-mark.svg"><img src="assets/logo-v3.svg"','srcset="assets/logo-v3-mark-dark.svg"><img src="assets/logo-v3-dark.svg"',1).replace('<meta name="theme-color" content="#ffffff">','<meta name="theme-color" content="#1b2329">')
text=text.replace('href="/assets/fonts/archivo.woff2"','href="/assets/fonts/geist.woff2"')
# Logo draw-in: the rings are inline SVG (strokes can animate), the wordmark is its own file.
brand='<a class="brand" href="#build" aria-label="CGC home">'+(root/'_work/brand-mark.svg').read_text(encoding='utf-8')+'<img class="brand-word" src="assets/logo-v3-word-dark.svg" alt="Commercial Glazing Contractors Inc." width="234" height="46"></a>'
text,n=re.subn(r'<a class="brand" href="#(?:film|build)" aria-label="CGC home">.*?</a>',lambda _:brand,text,count=1,flags=re.S);assert n==1
# Weight tool: drag-to-size lite with a 6 ft person for scale, makeup chips and a handling meter.
a=text.index('<div class="tool-grid">');b=text.index('</div></section><section class="section" id="bid">')
text=text[:a]+(root/'_work/weight-tool.html').read_text(encoding='utf-8')+text[b:]
old="Number($('#makeup').value)";assert text.count(old)==1
text=text.replace(old,"Number($('#makeup input:checked').value)")
# Process icons: one line drawing per step, drawn in when the step scrolls into view (CSS).
ICONS={'Send plans':['M6 3h8l4 4v14H6z','M14 3v4h4','M9 16l6-6','M11 10h4v4'],
 'Takeoff + scope sheet':['M3 17L17 3l4 4L7 21z','M7 13l2 2','M10 10l2 2','M13 7l2 2'],
 'Bid with clarifications / exclusions':['M5 3h14v18H5z','M8 8l1.5 1.5L12 7','M8 14l1.5 1.5L12 13','M14 8h3','M14 14h3'],
 'Shop drawings & submittals':['M5 8h14v12H5z','M5 3v3','M19 3v3','M5 4.5h14','M10 8v12','M5 14h14'],
 'Fabricate + install':['M4 10h16v11H4z','M12 4v6','M8 4h8','M7 13l4 5'],
 'Punch & turnover':['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18','M8 12l3 3 5-6']}
for name,ds in ICONS.items():
    svg='<svg class="step-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+''.join(f'<path d="{d}" pathLength="1"/>' for d in ds)+'</svg>'
    old=f'<div><h3>{name}</h3></div>';assert old in text,name
    text=text.replace(old,f'<div>{svg}<h3>{name}</h3></div>',1)
# High-end layer: first-visit loader (decided in <head>, so no flash), footer logo draw, scopes marquee, Lenis.
markraw=(root/'_work/brand-mark.svg').read_text(encoding='utf-8')
def mark(prefix,cls):return markraw.replace('hm-',prefix+'-').replace('class="brand-mark"',f'class="{cls}"')
head='<script>try{if(sessionStorage.cgcSeen||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no-loader");else{sessionStorage.cgcSeen=1;document.documentElement.classList.add("loading")}}catch(e){document.documentElement.classList.add("no-loader")}</script><noscript><style>#loader{display:none}</style></noscript>'
text=text.replace('</head>',head+'</head>',1)
loader='<div id="loader" aria-hidden="true"><div class="ld-logo">'+mark('ld','ld-mark')+'<img class="ld-word" src="assets/logo-v3-word-dark.svg" alt=""></div><span class="ld-count">000</span><i class="ld-bar"><b></b></i></div>'
text,n=re.subn(r'<body>',lambda _:'<body>'+loader,text,count=1);assert n==1
old='<img class="footer-logo" src="assets/logo-v3-dark.svg" alt="Commercial Glazing Contractors Inc." width="300" height="40" loading="lazy">'
assert old in text;text=text.replace(old,'<span class="footer-logo" role="img" aria-label="Commercial Glazing Contractors Inc.">'+mark('ft','ft-mark')+'<img class="ft-word" src="assets/logo-v3-word-dark.svg" alt="" width="234" height="46" loading="lazy"></span>',1)
scopes=' / '.join(['Storefront','Curtain wall','Interior glass','Office fronts','Entrances','Doors','Service &amp; repair'])+' / '
text=text.replace('<section class="section" id="before-after">','<div class="marquee" aria-hidden="true"><div class="mq-track"><span>'+scopes*2+'</span><span>'+scopes*2+'</span></div></div><section class="section" id="before-after">',1)
assert '<script>const $=' in text;text=text.replace('<script>const $=','<script src="assets/js/lenis.min.js"></script><script>const $=',1)
# Phones (≈370 CSS px at 2-3x) need ~900 px: add a middle size so they stop pulling the 1200+ px original.
from PIL import Image
def mid(m):
    stem=m.group(1);md=root/f'site/media/{stem}-md.webp'
    if not md.exists():
        im=Image.open(root/f'site/media/{stem}.webp');im.thumbnail((900,10000));im.save(md,'WEBP',quality=78,method=6)
    return f'media/{stem}-thumb.webp 480w, media/{stem}-md.webp 900w, media/{stem}.webp 1200w'
text=re.sub(r'media/([\w-]+?)-thumb\.webp 480w, media/\1\.webp 1200w',mid,text)
# Hero strip: licence moves into the film bar (hero html), so the separate proof strip goes; recent jobs move to the field section.
text,n=re.subn(r'<section class="proof">.*?</section>','',text,count=1,flags=re.S);assert n==1
old='The photographs and field clips in this gallery are CGC’s actual work.</p>';assert old in text
text=text.replace(old,'The photographs and field clips in this gallery are CGC’s actual work. Recent: Ono Hawaiian BBQ in Temecula, Haven House shelter, a Meritage Homes office TI with Pacific Tusk Builders, and Esplanade Builders.</p>',1)
assert 'Put us on the bid list.' in text;text=text.replace('Put us on the bid list.','Get the glass priced.',1)
# Service rows: photo plus a motion graphic that plays on hover (or when the row is on screen on touch).
# Row stills are generated illustrations (_work/svc-thumbs/render.py); real photos stay in From the field.
SVC_IMG={'Storefront':('storefront','glass storefront with black aluminum framing at dusk'),'Curtain wall':('curtain-wall','glass curtain wall on an office building'),
 'Interior glass & office fronts':('interior','glass office fronts along an office corridor'),'Entrances & doors':('entrances','pair of glass entrance doors with long pulls'),
 'Service & repair':('service','new glass pane set into a storefront frame with a suction lifter')}
import runpy;FX=runpy.run_path(str(root/'_work/svc_fx.py'))['FX']
for name,svg in FX.items():
    m=re.search(r'(<h3>'+re.escape(name)+r'</h3>.*?)(<img src="media/[^"]+-thumb[^>]*>)',text,re.S);assert m,name
    f,alt=SVC_IMG[name];img=f'<img src="media/svc-{f}.webp" alt="Illustration: {alt}" width="640" height="394" loading="lazy">'
    text=text[:m.start(2)]+'<div class="svc-media">'+img+'<svg class="svc-fx" viewBox="0 0 280 170" aria-hidden="true" focusable="false">'+svg+'</svg></div>'+text[m.end(2):]
old='</article></div></div></section>';assert text.count(old)==1
text=text.replace(old,'</article></div><p class="svc-note mono">Row images are generated illustrations. CGC jobsite photos are in From the field.</p></div></section>',1)
# Line arrow: iOS draws the ↗ character as a blue emoji.
text=text.replace('<span aria-hidden="true">↗</span>','<span aria-hidden="true" class="arr"><svg viewBox="0 0 12 12"><path d="M3 9 9 3M4 3h5v5"/></svg></span>')
path.write_text(text,encoding='utf-8')
print('Built current architectural revision.')
