"""Static media injection; concept illustrations are separate from documented company photos."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent
def esc(s):return html.escape(str(s),quote=True)
def slider(i,before,after,balt,aalt,caption,title='',concept=False):
 head=f'<div class="pair-head"><h3>{esc(title)}</h3><span class="concept-label">Illustrative concept / generated visualization</span></div>' if concept else ''
 note='<p class="concept-note">Concept visualization. Not a photograph of a CGC project.</p>' if concept else ''
 def responsive(path):return f' srcset="{esc(path.replace(".webp","-sm.webp"))} 768w, {esc(path)} 1536w" sizes="(max-width:760px) calc(100vw - 40px), calc(100vw - 80px)"' if concept else ''
 return f'''<figure class="pair">{head}<div class="comparison"><img src="{esc(before)}"{responsive(before)} alt="{esc(balt)}" width="1536" height="1024" loading="lazy"><img class="after" src="{esc(after)}"{responsive(after)} alt="{esc(aalt)}" width="1536" height="1024" loading="lazy"><span class="tag">BEFORE</span><span class="tag">AFTER</span></div><label for="compare-{i}">Drag to compare / use arrow keys<input id="compare-{i}" type="range" min="0" max="100" value="50" aria-label="Before and after divider, comparison {i+1}"></label><figcaption>{esc(caption)}</figcaption>{note}</figure>\n'''
def build():
 manifest=json.loads((ROOT/'media/manifest.json').read_text(encoding='utf-8-sig'));files={f['id']:f for f in manifest['files'] if f['keep']}
 concepts=manifest.get('concept_pairs',[])
 labels=['Storefront','Office fronts','Curtain wall']
 pairs='<div class="concept-tabs" role="tablist" aria-label="Illustrative glazing studies" hidden>'+''.join(f'<button id="concept-tab-{i}" role="tab" aria-selected="{str(i==0).lower()}" aria-controls="concept-panel-{i}">{esc(labels[i] if i<len(labels) else p["title"])}</button>' for i,p in enumerate(concepts))+'</div><div class="pairs-grid" id="concept-panels">\n'
 for i,p in enumerate(manifest.get('concept_pairs',[])):
  pairs+=slider(i,p['before'],p['after'],p['before_alt'],p['after_alt'],p['caption'],p['title'],True).replace('<figure class="pair">',f'<figure class="pair" id="concept-panel-{i}" role="tabpanel" aria-labelledby="concept-tab-{i}">',1)
 pairs+='</div><details class="documented-pairs"><summary>See the actual jobsite comparisons</summary><p>Original CGC photographs. The camera positions differ between visits.</p><div class="pairs-grid">'
 for i,p in enumerate(manifest.get('documented_pairs',manifest['pairs']),len(manifest.get('concept_pairs',[]))):
  b,a=files[p['before']],files[p['after']];pairs+=slider(i,'media/'+b['file'],'media/'+a['file'],'Before: '+b['caption'],'After: '+a['caption'],p['caption'])
 pairs+='</div></details>'
 gallery='<div class="gallery-grid">\n'
 ordered=[files[k] for k in manifest.get('featured_photos',[]) if k in files]
 ordered += [f for f in files.values() if f not in ordered]
 for f in ordered:
  scale=min(1,1600/max(f['width'],f['height']));full_width=round(f['width']*scale)
  thumb_width=round(f['width']*min(1,640/max(f['width'],f['height'])))
  gallery+=f'''<figure class="gallery-item" data-category="{esc(f['category'])}"><button data-full="media/{esc(f['file'])}" aria-label="Enlarge: {esc(f['caption'])}"><img src="media/{esc(f['thumb'])}" srcset="media/{esc(f['thumb'])} {thumb_width}w, media/{esc(f['file'])} {full_width}w" sizes="(max-width:760px) calc(100vw - 40px), 55vw" alt="{esc(f['caption'])}" width="640" height="{round(f['height']/f['width']*640)}" loading="lazy" decoding="async"></button><figcaption>{esc(f['caption'])}</figcaption></figure>\n'''
 gallery+='</div><div class="actions"><button id="more-work">Show more work</button></div><details class="field-films"><summary>Field clips / glass handling and installation</summary><div class="videos">\n'
 for i,v in enumerate(manifest['videos']):
  gallery+=f'''<figure><video id="clip-{i}" muted loop playsinline preload="none" data-poster="media/{esc(v['poster'])}" aria-label="{esc(v['caption'])} Silent field clip."><source data-src="media/{esc(v['webm'])}" type="video/webm"><source data-src="media/{esc(v['mp4'])}" type="video/mp4"><track kind="captions" src="media/{esc(v['captions'])}" srclang="en" label="English" default></video><button class="video-toggle" aria-controls="clip-{i}">Play clip</button><noscript><img src="media/{esc(v['poster'])}" alt="{esc(v['caption'])}" loading="lazy"><a href="media/{esc(v['mp4'])}">Open field clip</a></noscript><figcaption>{esc(v['caption'])} Silent field clip.</figcaption></figure>\n'''
 gallery+='</div></details>'
 path=ROOT/'index.html';text=path.read_text(encoding='utf-8')
 for name,markup in [('GALLERY',gallery),('PAIRS',pairs)]:
  pattern=f'<!--{name}:START-->.*?<!--{name}:END-->'
  if len(re.findall(pattern,text,re.S))!=1:raise ValueError(f'Expected one {name} marker pair')
  text=re.sub(pattern,lambda _:f'<!--{name}:START-->\n{markup}\n<!--{name}:END-->',text,flags=re.S)
 path.write_text(text,encoding='utf-8');return len(files),len(manifest['videos'])
if __name__=='__main__':print('Gallery photos / loops:',build())
