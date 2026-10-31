"""One offline production manual, reference media, prompt bank and extraction tools."""
from pathlib import Path
import json, html, re, runpy

here=Path(__file__).resolve().parent
shots=runpy.run_path(str(here/'shot-cards.py'))['SHOTS']
manual=(here/'PRODUCTION-MANUAL.md').read_text(encoding='utf-8')
old=(here.parent/'the-threshold/CGC-The-Threshold-Handoff.html').read_text(encoding='utf-8')
board=re.search(r'id="board-image" src="([^"]+)"',old).group(1)
reference=re.search(r'id="entrance-reference" src="([^"]+)"',old).group(1)
logo=re.search(r'<header><img src="([^"]+)"',old).group(1)
esc=lambda value:html.escape(str(value),quote=True)

def card_markdown(s):
    parts=[f'### S{s["id"]} — {s["title"]}',f'Final edit: {s["edit"]}']
    for key,title in [('purpose','Editorial purpose'),('start','Accepted start composition'),('fixed','What stays fixed'),('move','Exactly what moves')]:parts += [f'#### {title}',s[key]]
    parts += ['#### Source timing / normalize to native duration']+['- '+b for b in s['beats']]
    parts += ['#### Intended finish',s['finish']]
    for key,title in [('keyframe','CLEAN KEYFRAME PROMPT — image creation only'),('prompt','MAIN MOTION PROMPT — paste this alone into I2V'),('short','SHORT ALTERNATE — substitute, do not append'),('timeline','OPTIONAL TIMELINE — only for a tested compatible workflow')]:parts += [f'#### {title}','```text\n'+s[key]+'\n```']
    for key,title in [('reject','Reject the result if'),('fallback','Simpler fallback'),('cut','Editorial cut'),('mobile','Portrait composition')]:parts += [f'#### {title}',s[key]]
    return '\n\n'.join(parts)

cards='\n\n'.join(card_markdown(s) for s in shots)
full=manual.replace('The eight detailed cards follow this manual in the same file. They supersede the earlier version\'s general motion paragraphs.',cards)
assert len(shots)==8
assert all(len(s['prompt'].split())<110 for s in shots)
manifest={'title':'CGC — THE THRESHOLD','version':2,'created':'2026-10-31','deliverable':'Detailed handoff, not generated video','application':'Wan2GP / other installed local workflows','selected_model':None,'selected_settings':None,'model_settings_policy':'Inspect the installed model and export its settings; this JSON is a creative manifest, not an importable app queue.','duration_seconds':16,'edit_fps':24,'edit_frames':384,'calibration_required':['static framing joint','rightward camera truck','short push through already-open doorway'],'reference_assets':'Three full assets are embedded in this HTML. Use the download buttons or parse img data URLs. Do not send the storyboard sheet to image-to-video.','shots':shots}

def render_markdown(text):
    lines=text.splitlines();out=[];para=[];code=[];in_code=False;table=[]
    def flush_para():
        if para:out.append('<p>'+esc(' '.join(para))+'</p>');para.clear()
    def flush_table():
        if table:
            rows=[line.strip().strip('|').split('|') for line in table]
            out.append('<div class="table-wrap" tabindex="0" role="region" aria-label="Failure diagnosis table; scroll horizontally on small screens"><table><thead><tr>'+''.join('<th>'+esc(c.strip())+'</th>' for c in rows[0])+'</tr></thead><tbody>')
            for row in rows[2:]:out.append('<tr>'+''.join('<td>'+esc(c.strip())+'</td>' for c in row)+'</tr>')
            out.append('</tbody></table></div>');table.clear()
    for line in lines:
        if line.startswith('```'):
            flush_para();flush_table()
            if in_code:out.append('<pre>'+esc('\n'.join(code))+'</pre>');code=[]
            in_code=not in_code;continue
        if in_code:code.append(line);continue
        if line.startswith('|'):flush_para();table.append(line);continue
        flush_table()
        if not line.strip():flush_para();continue
        if line.startswith('#'):
            flush_para();level=min(4,len(line)-len(line.lstrip('#')));title=line.lstrip('#').strip();ident='section-'+re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
            out.append(f'<h{level} id="{ident}">{esc(title)}</h{level}>');continue
        if line.startswith('- '):flush_para();out.append('<p class="bullet">'+esc(line[2:])+'</p>');continue
        para.append(line)
    flush_para();flush_table();return '\n'.join(out)

body=render_markdown(full)
# Put copy controls directly after the relevant heading, keeping each model prompt distinct.
for s in shots:
    title='S'+s['id']+' — '+s['title'];ident='section-'+re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
    heading=f'<h3 id="{ident}">{esc(title)}</h3>'
    buttons=f'<div class="shot-actions"><button data-copy-shot="{s["id"]}" data-kind="prompt">Copy S{s["id"]} motion prompt</button><button data-copy-shot="{s["id"]}" data-kind="short">Copy short alternate</button><button data-copy-shot="{s["id"]}" data-kind="keyframe">Copy keyframe prompt</button></div>'
    body=body.replace(heading,heading+buttons)

toc=[]
for line in manual.splitlines():
    if line.startswith('## '):
        title=line[3:];ident='section-'+re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-');toc.append(f'<a href="#{ident}">{esc(title)}</a>')

def jsjson(value):return json.dumps(value,ensure_ascii=False).replace('<','\\u003c')
words=len(full.split())
page='''<!doctype html>
<!-- AGENT READING INSTRUCTIONS: This is a standalone handoff, not generated video. Read the visible article or parse JSON scripts creative-manifest and full-manual. Ignore base64 image bodies when loading text into model context. The JSON is a creative brief, NOT an importable Wan2GP queue. Extract the three img data URLs only if media is needed. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>CGC / The Threshold v2 — detailed Wan2GP handoff</title><style>
:root{font-family:Arial,sans-serif;background:#fff;color:#172126;line-height:1.65;--blue:#39586c;--line:#cbd3d8;--mute:#526169}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0}header{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 4%;border-bottom:1px solid var(--line)}header img{width:140px;height:auto}header span,.label{font:11px/1.6 monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}main{max-width:1320px;margin:auto;padding:48px 32px}.intro-title{font-size:clamp(44px,8vw,100px);line-height:.95;font-weight:750;letter-spacing:-.055em;max-width:1000px;margin:24px 0}.intro{font-size:20px;max-width:840px}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);margin:28px 0}.summary-grid div{padding:20px;border-right:1px solid var(--line)}.summary-grid div:last-child{border:0}.summary-grid b{display:block;font-size:28px}.summary-grid span{font-size:12px;color:var(--mute)}.actions,.shot-actions{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}button,a.button{min-height:48px;min-width:44px;border:1px solid var(--blue);background:var(--blue);color:white;border-radius:4px;padding:12px 18px;display:inline-flex;align-items:center;justify-content:center;font:14px/1.4 Arial,sans-serif;text-decoration:none;cursor:pointer}.shot-actions button{background:white;color:var(--blue);font-size:12px}.status{font-size:13px;min-height:24px}.note{padding:22px;background:#edf1f3;border-left:3px solid var(--blue);max-width:1000px;margin:24px 0}a{color:inherit;text-underline-offset:4px;overflow-wrap:anywhere}:focus-visible{outline:3px solid var(--blue);outline-offset:4px}.toc{display:grid;grid-template-columns:1fr 1fr;gap:0 32px;padding:24px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:32px 0}.toc a{display:flex;align-items:center;min-height:44px;text-decoration:none;font-size:13px;padding:8px 0}.toc a:hover{text-decoration:underline}article{max-width:1040px}article h1{font-size:42px;line-height:1.1;margin:52px 0 24px;letter-spacing:-.04em}article h2{font-size:30px;line-height:1.2;letter-spacing:-.025em;margin:56px 0 24px;padding-top:28px;border-top:1px solid var(--line);max-width:960px}article h3{font-size:34px;line-height:1.1;letter-spacing:-.03em;margin:56px 0 18px;padding:24px 0;border-top:3px solid var(--blue)}article h4{font-size:16px;line-height:1.5;margin:28px 0 12px}article p{margin:0 0 18px;max-width:920px;overflow-wrap:anywhere}article p.bullet{padding-left:20px;position:relative}article p.bullet:before{content:'•';position:absolute;left:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#edf1f3;border:1px solid var(--line);padding:22px;font:13px/1.75 monospace;margin:16px 0 26px;max-width:100%}.table-wrap{max-width:100%;overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line);min-width:140px}th{background:#edf1f3}section.media{border-top:1px solid var(--line);padding-top:36px;margin-top:48px}section.media h2{font-size:32px;line-height:1.2}section.media p{max-width:840px}figure{margin:28px 0}figure img{display:block;max-width:100%;height:auto}.board img{width:min(100%,880px)}figcaption{font-size:12px;color:var(--mute);margin-top:12px}.extract{border-top:1px solid var(--line);padding-top:24px;margin-top:36px}footer{border-top:1px solid var(--line);padding:24px 32px;font-size:12px;color:var(--mute)}[hidden]{display:none!important}@media(max-width:700px){main{padding:28px 20px}header{padding:20px}header span{font-size:9px}.intro{font-size:17px}.summary-grid{grid-template-columns:1fr 1fr}.summary-grid div{padding:16px;border-bottom:1px solid var(--line)}.summary-grid b{font-size:24px}.toc{grid-template-columns:1fr}.intro-title{font-size:48px}article h1{font-size:34px}article h2{font-size:25px}article h3{font-size:29px}article h4{font-size:15px}pre{padding:16px;font-size:12px}.shot-actions{display:grid;grid-template-columns:1fr}.actions button,.actions a.button{flex-grow:1}.note{padding:18px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{header,.actions,.shot-actions,.toc,.status{display:none}main{max-width:none;padding:0}article{max-width:none}pre{break-inside:avoid}article h2,article h3{break-after:avoid}section.media{break-before:page}}
</style></head><body><header><img id="supplied-logo" src="LOGO_DATA" alt="Commercial Glazing Contractors Inc."><span>Production manual v2<br>October 31, 2026 / local models</span></header><main><span class="label">One file / all direction, prompts and reference media embedded</span><div class="intro-title">Make the motion<br>deliberate.</div><p class="intro">THE THRESHOLD — a precise handoff for Wan2GP and other installed local video workflows. Test rigid geometry, then build the camera movement one shot at a time.</p><div class="summary-grid"><div><b>8 shots</b><span>Detailed motion cards</span></div><div><b>16 seconds</b><span>Final 24fps edit</span></div><div><b>3 tests</b><span>Calibration before production</span></div><div><b>WORD_COUNT words</b><span>Operator direction + prompt bank</span></div></div><p class="note"><strong>Give Rebuff this entire HTML file.</strong> It works offline and includes the visual board, entrance reference and logo. Read the operator directions, but paste only the selected shot prompt into the model. No generated video or ready-to-import Wan2GP workflow is included.</p><div class="actions"><a class="button" href="#section-9-shot-by-shot-production-cards">Go to shot cards</a><button id="download-manual">Save full text as Markdown</button><button id="download-manifest">Save creative manifest JSON</button><button id="copy-agent">Copy Rebuff instructions</button></div><p id="copy-status" class="status" role="status" aria-live="polite"></p><details class="extract"><summary>For agents: read this file without loading base64 images into context</summary><p>The complete text is JSON-encoded in the script element with id full-manual. The eight structured shot cards are in creative-manifest. Parse those elements first; the embedded images come later. The download buttons provide readable text and the creative manifest. This avoids treating long image data as language-model input.</p><pre>Python extraction using the standard library:
from html.parser import HTMLParser
from pathlib import Path
import json

class Reader(HTMLParser):
    def __init__(self):
        super().__init__(); self.active = False; self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'script' and dict(attrs).get('id') == 'full-manual':
            self.active = True
    def handle_data(self, text):
        if self.active: self.parts.append(text)
    def handle_endtag(self, tag):
        if tag == 'script': self.active = False

reader = Reader()
reader.feed(Path('CGC-Threshold-v2-Complete-Handoff.html').read_text(encoding='utf-8'))
manual = json.loads(''.join(reader.parts))
print(manual)
</pre></details><nav class="toc" aria-label="Production manual contents">TOC_CONTENT</nav><article id="operator-manual">BODY_CONTENT</article><section class="media" id="embedded-references"><h2>Embedded reference media</h2><p>The storyboard is illustrative guidance. Use the entrance image to establish common materials and architecture. Generate clean unnumbered keyframes for each shot. Neither the sheet nor its small numbered panels are final video input frames.</p><figure class="board"><img id="board-image" src="BOARD_DATA" alt="Eight-shot illustrative Threshold board: glass edge, reflection, frame joint, threshold, doorway, passage, lobby and blue-hour entrance" width="1024" height="1536"><figcaption>Existing generated storyboard retained as the visual reference. Version 2's written motion cards supersede the earlier motion directions.</figcaption></figure><div class="actions"><a class="button" href="BOARD_DATA" download="CGC-Threshold-storyboard.png">Save storyboard PNG</a></div><figure><img id="entrance-reference" src="REFERENCE_DATA" alt="Generated entrance reference: white columns, graphite door frames, stainless pulls and pale terrazzo" width="1672" height="941"><figcaption>Architecture and material anchor; generated concept, not a CGC project photograph.</figcaption></figure><div class="actions"><a class="button" href="REFERENCE_DATA" download="CGC-entrance-reference.png">Save entrance reference</a><a class="button" href="LOGO_DATA" download="CGC-supplied-logo.svg">Save supplied logo</a></div></section><section class="extract"><h2>Sources checked for the application notes</h2><p>Application documentation was checked October 31, 2026. These links are optional; the handoff makes no network request to render. The installed version and its exported model settings remain authoritative for actual supported controls.</p><ul><li><a href="https://github.com/deepbeepmeep/WanGP/blob/main/docs/PROMPTS.md">WanGP official prompt handling</a></li><li><a href="https://github.com/deepbeepmeep/WanGP/blob/main/docs/SETTINGS.md">WanGP official settings reference</a></li><li><a href="https://github.com/deepbeepmeep/WanGP/blob/main/docs/CLI.md">WanGP official CLI and queue reference</a></li></ul></section></main><footer>CGC / C-17 · LIC 1109661. All visual studies are illustrative concepts. This file does not generate video, install software, transmit prompts or change the website.</footer><script type="application/json" id="creative-manifest">MANIFEST_JSON</script><script type="application/json" id="full-manual">MANUAL_JSON</script><script>
const manifest=JSON.parse(document.getElementById('creative-manifest').textContent),manual=JSON.parse(document.getElementById('full-manual').textContent),status=document.getElementById('copy-status');
function saveFile(name,text,type){const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([text],{type}));link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
async function copyText(text){try{await navigator.clipboard.writeText(text);status.textContent='Copied.'}catch{status.textContent='Clipboard unavailable. Save the full Markdown or copy directly from the visible prompt block.'}}
document.getElementById('download-manual').onclick=()=>saveFile('CGC-Threshold-v2-Production-Manual.md',manual,'text/markdown');
document.getElementById('download-manifest').onclick=()=>saveFile('CGC-Threshold-v2-Creative-Manifest.json',JSON.stringify(manifest,null,2),'application/json');
document.getElementById('copy-agent').onclick=()=>copyText('Rebuff: Read this entire handoff using the full-manual JSON element to avoid base64 image data in context. This is version 2 and supersedes the earlier motion directions. Inspect the existing failed renders and export the actual installed Wan2GP model settings. Run the three calibration tests before production. Generate accepted clean keyframes, then eight separate I2V shots using only each selected motion prompt. Apply the pass/fail rubric and simpler fallback after controlled revisions. Do not submit this whole manual as one model prompt. Deliver the silent 16-second edit and web assets only after visual review. Do not alter DNS, credentials, Deployment Protection or production hosting. All detailed instructions and reference assets are in this one file.');
document.querySelectorAll('[data-copy-shot]').forEach(button=>button.onclick=()=>{const shot=manifest.shots.find(s=>s.id===button.dataset.copyShot);copyText(shot[button.dataset.kind])});
</script></body></html>'''

# Replace large data last so normal text replacement never scans a modified asset.
page=page.replace('WORD_COUNT',f'{words:,}').replace('TOC_CONTENT',''.join(toc)).replace('BODY_CONTENT',body).replace('MANIFEST_JSON',jsjson(manifest)).replace('MANUAL_JSON',jsjson(full))
page=page.replace('LOGO_DATA',logo).replace('BOARD_DATA',board).replace('REFERENCE_DATA',reference)
path=here/'CGC-Threshold-v2-Complete-Handoff.html';path.write_text(page,encoding='utf-8')
(here/'complete-manual.md').write_text(full,encoding='utf-8')
(here/'creative-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'words':words,'shots':len(shots),'motion_prompts':len(shots)*3,'keyframe_prompts':len(shots),'bytes':path.stat().st_size,'file':str(path)},indent=2))
