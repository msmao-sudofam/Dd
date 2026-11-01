from pathlib import Path
import base64,html,json,re,runpy
root=Path(__file__).resolve().parent
shots=runpy.run_path(str(root/'shots.py'))['SHOTS']
assert len(shots)==8 and sum(s['end']-s['start'] for s in shots)==24
assert [s['start'] for s in shots]==[0,2,5,8,10,14,17,21]
esc=lambda s:html.escape(str(s),quote=True)
def render(text):
    output=[];para=[];code=[];inside=False
    def flush():
        if para:output.append('<p>'+esc(' '.join(para))+'</p>');para.clear()
    for line in text.splitlines():
        if line.startswith('```'):
            flush()
            if inside:output.append('<pre>'+esc('\n'.join(code))+'</pre>');code=[]
            inside=not inside;continue
        if inside:code.append(line);continue
        if not line.strip():flush();continue
        if line.startswith('#'):
            flush();n=min(4,len(line)-len(line.lstrip('#')));title=line.lstrip('#').strip();ident=re.sub('[^a-z0-9]+','-',title.lower()).strip('-');output.append(f'<h{n} id="{ident}">{esc(title)}</h{n}>');continue
        if line.startswith('- '):flush();output.append('<p class="bullet">'+esc(line[2:])+'</p>');continue
        para.append(line)
    flush();return '\n'.join(output)
cards=[]
for s in shots:
    lines=[f'### I{s["id"]} / {s["title"]}',f'{s["start"]:02d}–{s["end"]:02d}s / frames {s["frames"][0]}–{s["frames"][1]} / {(s["end"]-s["start"])*24} edited frames']
    for k,label in [('start_state','Start state'),('action','Required physical action'),('end_state','End state'),('camera','Camera')]:lines.extend(['#### '+label,s[k]])
    for k,label in [('keyframe','Clean start-frame prompt'),('h3_prompt','H3 motion prompt')]:lines.extend(['#### '+label,'```text\n'+s[k]+'\n```'])
    for k,label in [('reject','Reject if'),('recovery','Recovery: preserve the action'),('portrait','Phone composition')]:lines.extend(['#### '+label,s[k]])
    cards.append('\n\n'.join(lines))
brief=(root/'BRIEF.md').read_text(encoding='utf-8').replace('SHOT_CARDS','\n\n'.join(cards))
manifest=dict(title='FROM THE OPENING UP',company='Commercial Glazing Contractors Inc.',created='2026-11-01',version=1,status='Storyboard and directions only; no rendered video',selected_for_production=False,fps=24,frames=576,duration_seconds=24,shot_count=8,chapter_boundaries_seconds=[0,2,5,8,10,14,17,21,24],qualification_shots=['I05 glass seating','I07 supported door alignment'],quality_substitutions_allowed=False,shots=shots)
content=render(brief)
for s in shots:
    label='I'+s['id']+' / '+s['title'];ident=re.sub('[^a-z0-9]+','-',label.lower()).strip('-');heading=f'<h3 id="{ident}">{esc(label)}</h3>'
    controls='<div class="actions">'+''.join(f'<button data-shot="{s["id"]}" data-kind="{k}">{name}</button>' for k,name in [('keyframe','Copy start-frame prompt'),('h3_prompt','Copy H3 motion')])+'</div>'
    content=content.replace(heading,heading+controls)
board='data:image/png;base64,'+base64.b64encode((root/'storyboard.png').read_bytes()).decode()
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>CGC / From the Opening Up — installation film</title><style>
*{box-sizing:border-box}html{font:16px/1.65 Arial,sans-serif;color:#172126;background:#fff;scroll-padding-top:20px}body{margin:0}header{padding:20px 5%;border-bottom:1px solid #cbd3d8;font:12px/1.6 monospace;color:#39586c}main{max-width:1200px;margin:auto;padding:40px 32px}h1{font-size:clamp(48px,8vw,108px);letter-spacing:-.055em;line-height:.95;max-width:1000px}h2{font-size:30px;line-height:1.2;border-top:1px solid #cbd3d8;margin-top:48px;padding-top:28px}h3{font-size:29px;line-height:1.2;border-top:3px solid #39586c;margin-top:48px;padding-top:24px}h4{margin:24px 0 12px}p{max-width:940px;overflow-wrap:anywhere}a{color:inherit;overflow-wrap:anywhere}figure{margin:24px 0}figure img{display:block;width:min(100%,920px);height:auto}figcaption{font-size:13px;color:#526169;margin-top:12px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}button,.button{display:inline-flex;align-items:center;justify-content:center;background:#39586c;color:#fff;border:1px solid #39586c;border-radius:4px;padding:12px 18px;font:14px/1.4 Arial,sans-serif;min-height:48px;min-width:44px;cursor:pointer;text-decoration:none}:focus-visible{outline:3px solid #39586c;outline-offset:4px}.note,pre{background:#edf1f3;border:1px solid #cbd3d8;padding:20px}.note{border-left:3px solid #39586c}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.7 monospace}.bullet{padding-left:20px;position:relative}.bullet:before{content:'•';position:absolute;left:0}.status{min-height:24px;font-size:13px}footer{border-top:1px solid #cbd3d8;padding:24px 5%;color:#526169;font-size:12px}@media(max-width:700px){main{padding:28px 20px}h1{font-size:55px}h2{font-size:26px}h3{font-size:25px}.actions>*{flex-grow:1}pre{padding:14px;font-size:12px}}@media print{.actions,.status{display:none}main{padding:0}}
</style></head><body><header>CGC / ALTERNATE INSTALLATION FILM / NOVEMBER 1, 2026</header><main><h1>FROM THE<br>OPENING UP.</h1><p>An empty opening. A frame set true. Glass seated by hand. A finished entrance.</p><p><strong>8 shots / 24 seconds / 576 frames / 24fps</strong></p><p class="note">New generated storyboard and production directions. No video rendered. This is an illustrative storefront installation into an existing shell, not footage of an actual CGC job. Preserve the current hero until a concept is selected and its film passes review.</p><div class="actions"><a class="button" href="#board">View storyboard</a><a class="button" href="#eight-shot-cards">Go to shot prompts</a><button id="save-text">Save full brief</button><button id="save-json">Save production JSON</button></div><p class="status" id="status" role="status" aria-live="polite"></p><section id="board"><h2>The installation story.</h2><figure><img id="board-image" src="BOARD_DATA" width="1024" height="1536" alt="Eight-panel storefront installation storyboard: empty opening, sill, upright member, empty aluminum frame, glass placement, perimeter seal, door fitting and finished storefront"><figcaption>Read left to right, top to bottom. Concept only. Correct continuity and action-start gaps in clean keyframes before generation; see the brief below.</figcaption></figure><div class="actions"><button id="save-board">Save storyboard PNG</button></div></section><article>CONTENT</article></main><footer>All production prompts, storyboard artwork and instructions are embedded in this offline file. No external dependencies.</footer><script id="concept-manifest" type="application/json">MANIFEST</script><script id="full-manual" type="application/json">MANUAL</script><script>
const manifest=JSON.parse(document.getElementById('concept-manifest').textContent),manual=JSON.parse(document.getElementById('full-manual').textContent),status=document.getElementById('status');
function save(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.getElementById('save-text').onclick=()=>save('CGC-From-the-Opening-Up-Brief.md',manual,'text/markdown');document.getElementById('save-json').onclick=()=>save('CGC-From-the-Opening-Up-Production.json',JSON.stringify(manifest,null,2),'application/json');document.getElementById('save-board').onclick=()=>{const a=document.createElement('a');a.href=document.getElementById('board-image').src;a.download='CGC-From-the-Opening-Up-Storyboard.png';a.click()};
document.querySelectorAll('[data-shot]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(manifest.shots.find(s=>s.id===b.dataset.shot)[b.dataset.kind]);status.textContent='Prompt copied.'}catch{status.textContent='Copy the visible prompt or save the full brief.'}});
</script></body></html>'''
js=lambda v:json.dumps(v,ensure_ascii=False).replace('<',r'\u003c')
page=page.replace('CONTENT',content).replace('MANIFEST',js(manifest)).replace('MANUAL',js(brief)).replace('BOARD_DATA',board)
(root/'CGC-From-the-Opening-Up.html').write_text(page,encoding='utf-8')
(root/'full-brief.md').write_text(brief,encoding='utf-8')
(root/'production.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(dict(shots=8,seconds=24,frames=576,words=len(brief.split()),html_bytes=len(page.encode())),indent=2))
