from pathlib import Path
from PIL import Image
import json,shutil
R=Path('cgc');A=R/'site/assets/concepts';A.mkdir(parents=True,exist_ok=True)
root=Path('C:/Users/Moqui/.codex/generated_images/01a190ad-17bb-7351-9cf3-6aed3b7f0565')
assets={'storefront-after':'exec-ba25bf23-3f39-4e6a-a9dc-eeb25bc17522.png','storefront-before':'exec-ed359eea-3716-4897-9f34-04eebea394f6.png','office-after':'exec-fa29725e-30cd-489a-8ee9-b440d5f9d266.png','office-before':'exec-61e0680c-804f-4300-96fa-b1e16b7cf9b4.png'}
for name,file in assets.items():
 im=Image.open(root/file).convert('RGB');im.save(A/(name+'.webp'),quality=86,method=6)
 provenance={'method':'Built-in image generation; matching before frames edited from generated after frames.','disclosure':'Illustrative concept — generated visualization, not a CGC project photograph.','files':assets,'constraints':'Matching camera/facade and surroundings. No brands, logos, people or invented client identity.'}
(A/'provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')
p=R/'site/media/manifest.json';j=json.loads(p.read_text());j['documented_pairs']=j['pairs'];j['concept_pairs']=[{'before':'assets/concepts/storefront-before.webp','after':'assets/concepts/storefront-after.webp','title':'A new face for the building.','caption':'Storefront / from board-up to glazed entrance.','before_alt':'Illustrative concept: plywood boards cover a white stucco storefront opening.','after_alt':'Illustrative concept: graphite-framed glass storefront and double entrance doors in the same facade.'},{'before':'assets/concepts/office-before.webp','after':'assets/concepts/office-after.webp','title':'Defined space. Open sightlines.','caption':'Office fronts / from open floor to glass enclosure.','before_alt':'Illustrative concept: open office conference area with a table and chairs.','after_alt':'Illustrative concept: the same conference area enclosed by clear glass partitions and doors.'}];p.write_text(json.dumps(j,indent=2),encoding='utf-8')
print('Saved four concept images and provenance')
