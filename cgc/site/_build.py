"""Inject crawler-visible project media. Run from any directory; repeat safely."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent
def esc(s):return html.escape(str(s),quote=True)
def build():
 manifest=json.loads((ROOT/'media/manifest.json').read_text(encoding='utf-8-sig'));files={f['id']:f for f in manifest['files'] if f['keep']}
 pairs='<div class="pairs-grid">\n'
 for i,pair in enumerate(manifest['pairs']):
  b,a=files[pair['before']],files[pair['after']]
  pairs+=f'''<figure class="pair"><div class="comparison"><img src="media/{esc(b['file'])}" alt="Before: {esc(b['caption'])}" width="800" height="600" loading="lazy"><img class="after" src="media/{esc(a['file'])}" alt="After: {esc(a['caption'])}" width="800" height="600" loading="lazy"><span class="tag">BEFORE</span><span class="tag">AFTER</span></div><label for="compare-{i}">Compare before and after (arrow keys or drag)<input id="compare-{i}" type="range" min="0" max="100" value="50" aria-label="Before and after divider, comparison {i+1}"></label><figcaption>{esc(pair['caption'])}</figcaption></figure>\n'''
 pairs+='</div>'
 gallery='<div class="gallery-grid">\n'
 for f in files.values():
  gallery+=f'''<figure class="gallery-item" data-category="{esc(f['category'])}"><button data-full="media/{esc(f['file'])}" aria-label="Enlarge: {esc(f['caption'])}"><img src="media/{esc(f['thumb'])}" alt="{esc(f['caption'])}" width="640" height="{round(f['height']/f['width']*640)}" loading="lazy" decoding="async"></button><figcaption>{esc(f['caption'])}</figcaption></figure>\n'''
 gallery+='</div><div class="videos">\n'
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
