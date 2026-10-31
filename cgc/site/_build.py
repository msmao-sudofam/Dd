"""Static media injection; concept illustrations are separate from documented company photos."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent
def esc(s):return html.escape(str(s),quote=True)
def slider(i,before,after,balt,aalt,caption,title='',concept=False):
 head=f'<div class="pair-head"><h3>{esc(title)}</h3><span class="concept-label">Illustrative concept / generated visualization</span></div>' if concept else ''
 note='<p class="concept-note">Concept visualization. Not a photograph of a CGC project.</p>' if concept else ''
 return f'''<figure class="pair">{head}<div class="comparison"><img src="{esc(before)}" alt="{esc(balt)}" width="1536" height="1024" loading="lazy"><img class="after" src="{esc(after)}" alt="{esc(aalt)}" width="1536" height="1024" loading="lazy"><span class="tag">BEFORE</span><span class="tag">AFTER</span></div><label for="compare-{i}">Drag to compare / use arrow keys<input id="compare-{i}" type="range" min="0" max="100" value="50" aria-label="Before and after divider, comparison {i+1}"></label><figcaption>{esc(caption)}</figcaption>{note}</figure>\n'''
def build():
 manifest=json.loads((ROOT/'media/manifest.json').read_text(encoding='utf-8-sig'));files={f['id']:f for f in manifest['files'] if f['keep']}
 pairs='<div class="pairs-grid">\n'
 for i,p in enumerate(manifest.get('concept_pairs',[])):
  pairs+=slider(i,p['before'],p['after'],p['before_alt'],p['after_alt'],p['caption'],p['title'],True)
 pairs+='</div><details class="documented-pairs"><summary>See the actual jobsite comparisons</summary><p>Original CGC photographs. The camera positions differ between visits.</p><div class="pairs-grid">'
 for i,p in enumerate(manifest.get('documented_pairs',manifest['pairs']),2):
  b,a=files[p['before']],files[p['after']];pairs+=slider(i,'media/'+b['file'],'media/'+a['file'],'Before: '+b['caption'],'After: '+a['caption'],p['caption'])
 pairs+='</div></details>'
 gallery='<div class="gallery-grid">\n'
 for f in files.values():
  gallery+=f'''<figure class="gallery-item" data-category="{esc(f['category'])}"><button data-full="media/{esc(f['file'])}" aria-label="Enlarge: {esc(f['caption'])}"><img src="media/{esc(f['thumb'])}" alt="{esc(f['caption'])}" width="640" height="{round(f['height']/f['width']*640)}" loading="lazy" decoding="async"></button><figcaption>{esc(f['caption'])}</figcaption></figure>\n'''
 gallery+='</div><div class="actions"><button id="more-work">Show more work</button></div><div class="videos">\n'
 for i,v in enumerate(manifest['videos']):
  gallery+=f'''<figure><video id="clip-{i}" muted loop playsinline preload="none" poster="media/{esc(v['poster'])}" aria-label="{esc(v['caption'])} Silent field clip."><source src="media/{esc(v['webm'])}" type="video/webm"><source src="media/{esc(v['mp4'])}" type="video/mp4"><track kind="captions" src="media/{esc(v['captions'])}" srclang="en" label="English" default></video><button class="video-toggle" aria-controls="clip-{i}">Play clip</button><figcaption>{esc(v['caption'])} Silent field clip.</figcaption></figure>\n'''
 gallery+='</div>'
 path=ROOT/'index.html';text=path.read_text(encoding='utf-8')
 for name,markup in [('GALLERY',gallery),('PAIRS',pairs)]:
  pattern=f'<!--{name}:START-->.*?<!--{name}:END-->'
  if len(re.findall(pattern,text,re.S))!=1:raise ValueError(f'Expected one {name} marker pair')
  text=re.sub(pattern,lambda _:f'<!--{name}:START-->\n{markup}\n<!--{name}:END-->',text,flags=re.S)
 path.write_text(text,encoding='utf-8');return len(files),len(manifest['videos'])
if __name__=='__main__':print('Gallery photos / loops:',build())
