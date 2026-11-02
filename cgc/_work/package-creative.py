from pathlib import Path
from PIL import Image
import shutil,json,zipfile
src=Path('cgc/creative/video-concepts-2026-10-31')
out=Path('C:/Users/Moqui/Documents/Codex/2026-10-30/you-are-finishing-a-client-website/outputs/creative-video-pack')
out.mkdir(parents=True,exist_ok=True)
for p in src.iterdir():
 if p.is_file():shutil.copy2(p,out/p.name)
for p in out.glob('*.png'):
 im=Image.open(p);im.verify();print(p.name,Image.open(p).size)
assert len(json.loads((out/'IMAGE-PROMPTS.json').read_text()))==5
zip_path=out.parent/'CGC-creative-video-pack.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.iterdir()):
  if p.is_file():z.write(p,arcname='CGC-creative-video-pack/'+p.name)
print('Package ready:',zip_path.name,zip_path.stat().st_size,'bytes')
