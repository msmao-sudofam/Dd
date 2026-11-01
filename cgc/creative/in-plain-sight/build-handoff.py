"""Build the separate In Plain Sight concept as one offline artifact."""
from pathlib import Path
import json,html,re,runpy,base64

root=Path(__file__).resolve().parent
shots=runpy.run_path(str(root/'shots.py'))['SHOTS']
assert len(shots)==6
assert sum((s['end']-s['start'])*24 for s in shots)==384
assert [s['start'] for s in shots]==[0,2,5,7,10,13]
esc=lambda value:html.escape(str(value),quote=True)
def asset(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
def jsjson(value):return json.dumps(value,ensure_ascii=False).replace('<',r'\u003c')

def render(text):
    out=[];paragraph=[];code=[];inside=False
    def flush():
        if paragraph:out.append('<p>'+esc(' '.join(paragraph))+'</p>');paragraph.clear()
    for line in text.splitlines():
        if line.startswith('```'):
            flush()
            if inside:out.append('<pre>'+esc('\n'.join(code))+'</pre>');code=[]
            inside=not inside;continue
        if inside:code.append(line);continue
        if not line.strip():flush();continue
        if line.startswith('#'):
            flush();level=min(4,len(line)-len(line.lstrip('#')));title=line.lstrip('#').strip();ident=re.sub('[^a-z0-9]+','-',title.lower()).strip('-');out.append(f'<h{level} id="{ident}">{esc(title)}</h{level}>');continue
        if line.startswith('- '):flush();out.append('<p class="bullet">'+esc(line[2:])+'</p>');continue
        paragraph.append(line)
    flush();return '\n'.join(out)

cards=[]
for s in shots:
    bits=[f'### P{s["id"]} / {s["title"]}',f'Final edit: {s["start"]:02d}–{s["end"]:02d} seconds / frames {s["frames"]} / {(s["end"]-s["start"])*24} edited frames at 24fps.']
    for key,title in [('purpose','Story beat'),('composition','Clean start composition'),('fixed','What stays fixed'),('motion','Required camera move'),('finish','Required finish')]:bits += [f'#### {title}',s[key]]
    for key,title in [('keyframe','CLEAN KEYFRAME'),('h3_prompt','H3 MOTION — primary prompt'),('prompt','BASE MOTION'),('short','SHORT MOTION — same action')]:bits += [f'#### {title}','```text\n'+s[key]+'\n```']
    for key,title in [('reject','Reject if'),('recovery','Recovery — same action only'),('cut','Edit transition'),('mobile','Phone composition')]:bits += [f'#### {title}',s[key]]
    cards.append('\n\n'.join(bits))

full=(root/'CONCEPT.md').read_text(encoding='utf-8').replace('SHOT_CARDS','\n\n'.join(cards))
manifest={'title':'IN PLAIN SIGHT','company':'Commercial Glazing Contractors Inc.','version':1,'created':'2026-11-01','scope':'Separate alternate concept; does not supersede strict Threshold v4','status':'New generated storyboard/reference and production prompts; no rendered video','selected_for_production':False,'fps':24,'duration_seconds':16,'frames':384,'chapter_boundaries_seconds':[0,2,5,7,10,13,16],'shot_count':6,'quality_substitutions_allowed':False,'qualification_shots':['P02 corner truck','P04 reflection/transmission truck'],'model_start':'Installed Wan2GP MiniMax H3 FL2VA Pruned; verify actual runtime/preset before generation','shots':shots}
body=render(full)
for s in shots:
    ident=re.sub('[^a-z0-9]+','-',f'P{s["id"]} / {s["title"]}'.lower()).strip('-')
    title='P'+s['id']+' / '+s['title']
    heading=f'<h3 id="{ident}">{esc(title)}</h3>'
    controls='<div class="actions">'+''.join(f'<button data-shot="{s["id"]}" data-kind="{key}">{label}</button>' for key,label in [('h3_prompt','Copy H3 motion'),('short','Copy short motion'),('keyframe','Copy keyframe prompt')])+'</div>'
    body=body.replace(heading,heading+controls)

board=asset(root/'storyboard.png','image/png')
reference=asset(root/'room-reference.png','image/png')
logo=asset(root.parents[1]/'site/assets/logo.svg','image/svg+xml')
timing=''.join(f'<tr><td>P{s["id"]}</td><td>{s["start"]:02d}–{s["end"]:02d}s</td><td>{esc(s["title"])}</td><td>{esc(s["motion"])}</td></tr>' for s in shots)
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>CGC / In Plain Sight — alternate film concept</title><style>
:root{font:16px/1.65 Arial,sans-serif;color:#172126;background:white;--line:#cbd3d8;--blue:#39586c;--mute:#526169}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0}header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:24px 5%;border-bottom:1px solid var(--line)}header img{width:140px;height:auto}header span,.label{font:11px/1.6 monospace;text-transform:uppercase;letter-spacing:.06em;color:var(--mute)}main{max-width:1280px;padding:48px 32px;margin:auto}.title{font-size:clamp(56px,10vw,132px);line-height:.9;font-weight:750;letter-spacing:-.055em;margin:24px 0 30px}.intro{font-size:22px;max-width:800px}p{max-width:920px}.note{padding:20px 24px;border-left:3px solid var(--blue);background:#edf1f3;margin:24px 0}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}button,a.button{min-width:44px;min-height:48px;border:1px solid var(--blue);border-radius:4px;background:var(--blue);color:white;padding:12px 18px;font:14px/1.4 Arial,sans-serif;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}a{color:inherit;text-underline-offset:4px;overflow-wrap:anywhere}:focus-visible{outline:3px solid var(--blue);outline-offset:4px}.facts{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);margin:28px 0}.facts div{padding:20px;border-right:1px solid var(--line)}.facts div:last-child{border:0}.facts b{display:block;font-size:26px}.facts span{font-size:12px;color:var(--mute)}section{padding-top:36px;margin-top:40px;border-top:1px solid var(--line)}section>h2{font-size:36px;line-height:1.1;letter-spacing:-.035em}figure{margin:24px 0}figure img{max-width:100%;height:auto;display:block}.board img{width:min(100%,920px)}figcaption{color:var(--mute);font-size:12px;margin-top:12px}.table-wrap{max-width:100%;overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:12px}th{background:#edf1f3}td:nth-child(2){white-space:nowrap}article h1{font-size:42px;letter-spacing:-.04em;line-height:1.05;margin:48px 0 24px}article h2{border-top:1px solid var(--line);padding-top:28px;margin:48px 0 20px;font-size:29px;line-height:1.2;letter-spacing:-.025em}article h3{border-top:3px solid var(--blue);padding-top:24px;margin:48px 0 22px;font-size:32px;line-height:1.1;letter-spacing:-.03em}article h4{font-size:16px;margin:26px 0 12px}article p{overflow-wrap:anywhere;margin:0 0 18px}article .bullet{padding-left:20px;position:relative}article .bullet:before{content:'•';position:absolute;left:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#edf1f3;border:1px solid var(--line);padding:22px;font:13px/1.7 monospace;margin:16px 0 24px}.status{font-size:13px;min-height:24px}footer{border-top:1px solid var(--line);padding:24px 32px;font-size:12px;color:var(--mute)}@media(max-width:700px){main{padding:32px 20px}header{padding:20px}header span{font-size:9px}.title{font-size:58px}.intro{font-size:18px}.facts{grid-template-columns:1fr 1fr}.facts div{padding:16px;border-bottom:1px solid var(--line)}.facts b{font-size:24px}article h2{font-size:25px}article h3{font-size:28px}pre{padding:16px;font-size:12px}.actions button,.actions a.button{flex-grow:1}.table-wrap table{min-width:620px}.note{padding:18px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{header,.actions,.status{display:none}main{padding:0}h2,h3{break-after:avoid}pre{break-inside:avoid}}
</style></head><body><header><img id="logo-image" src="LOGO_DATA" alt="Commercial Glazing Contractors Inc."><span>Alternate concept / interior glass<br>November 1, 2026</span></header><main><span class="label">New film concept / new reference and six-frame storyboard</span><div class="title">IN PLAIN<br>SIGHT.</div><p class="intro">The view looks open. A camera shift reveals the glass. A room comes into focus without losing the sightline.</p><p>CGC interior glass and office fronts, told through one clear enclosure and six controlled viewpoints.</p><div class="facts"><div><b>6 shots</b><span>One glass room</span></div><div><b>16 seconds</b><span>384 frames / 24fps edit</span></div><div><b>1 location</b><span>Consistent architecture</span></div><div><b>0 door moves</b><span>Camera-led story</span></div></div><p class="note"><strong>Separate concept option.</strong> This does not replace the strict Threshold v4 redo. It contains generated concept stills and production instructions, not a rendered film. Glass stays installed in every shot; the camera reveals it without a transformation.</p><div class="actions"><a class="button" href="#storyboard">View the storyboard</a><a class="button" href="#six-detailed-shot-cards">Go to shot prompts</a><button id="save-text">Save full brief as Markdown</button><button id="save-json">Save production JSON</button></div><p class="status" id="copy-status" role="status" aria-live="polite"></p><section id="storyboard"><h2>See through it.<br>Then see what defines it.</h2><figure class="board"><img id="board-image" src="BOARD_DATA" alt="Six-frame In Plain Sight storyboard: open sightline, glass corner, floor-channel detail, reflection, interior view and full conference-room reveal" width="1024" height="1536"><figcaption>New generated storyboard. Read left to right, top to bottom. Use it for shot intent; create clean unnumbered start frames before video generation.</figcaption></figure><div class="actions"><button data-save-image="board-image" data-filename="CGC-In-Plain-Sight-storyboard.png">Save storyboard PNG</button></div></section><section id="reference"><h2>The continuity reference.</h2><figure><img id="room-reference" src="REFERENCE_DATA" alt="Generated architectural reference of a clear-glass conference room with an oak table, graphite chairs, white columns and left-side office windows" width="1672" height="941"><figcaption>Illustrative architectural concept, not a photograph of completed CGC work. Preserve room, furniture, channels, door and daylight through the shot set.</figcaption></figure><div class="actions"><button data-save-image="room-reference" data-filename="CGC-In-Plain-Sight-reference.png">Save room reference</button><button data-save-image="logo-image" data-filename="CGC-supplied-logo.svg">Save supplied logo</button></div></section><section id="timeline"><h2>The 16-second cut.</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Shot timing table; scroll horizontally on small screens"><table><thead><tr><th>Shot</th><th>Edit</th><th>Beat</th><th>Required movement</th></tr></thead><tbody>TIMING_CONTENT</tbody></table></div></section><article>BODY_CONTENT</article></main><footer>CGC / C-17 · LIC 1109661. Concept pack works offline. All images are illustrative concepts; no video generation, site replacement or deployment is performed by this file.</footer><script type="application/json" id="concept-manifest">MANIFEST_JSON</script><script type="application/json" id="full-manual">MANUAL_JSON</script><script>
const manifest=JSON.parse(document.getElementById('concept-manifest').textContent),manual=JSON.parse(document.getElementById('full-manual').textContent),status=document.getElementById('copy-status');
function save(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.getElementById('save-text').onclick=()=>save('CGC-In-Plain-Sight-Production-Brief.md',manual,'text/markdown');document.getElementById('save-json').onclick=()=>save('CGC-In-Plain-Sight-Production.json',JSON.stringify(manifest,null,2),'application/json');
document.querySelectorAll('[data-save-image]').forEach(b=>b.onclick=()=>{const a=document.createElement('a');a.href=document.getElementById(b.dataset.saveImage).src;a.download=b.dataset.filename;a.click()});
document.querySelectorAll('[data-shot]').forEach(b=>b.onclick=async()=>{const text=manifest.shots.find(s=>s.id===b.dataset.shot)[b.dataset.kind];try{await navigator.clipboard.writeText(text);status.textContent='Prompt copied.'}catch{status.textContent='Copy the visible prompt or save the full Markdown brief.'}});
</script></body></html>'''
page=page.replace('TIMING_CONTENT',timing).replace('BODY_CONTENT',body).replace('MANIFEST_JSON',jsjson(manifest)).replace('MANUAL_JSON',jsjson(full))
page=page.replace('LOGO_DATA',logo).replace('BOARD_DATA',board).replace('REFERENCE_DATA',reference)
out=root/'CGC-In-Plain-Sight-Concept.html';out.write_text(page,encoding='utf-8')
(root/'production.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'full-brief.md').write_text(full,encoding='utf-8')
print(json.dumps({'file':str(out),'bytes':out.stat().st_size,'shots':len(shots),'frames':384,'words':len(full.split())},indent=2))
