from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import json,subprocess
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'site/media'; OUT.mkdir(exist_ok=True)
# Contact sheets sheet_00-07 and all four video strips reviewed October 30, 2026.
rows={}
def add(group, entries, category, phase='after'):
 for num,caption in entries.items(): rows[f'cgc_{group}_{num:02}.jpg']={'category':category,'phase':phase,'caption':caption,'quality':'good','keep':True}
add('C2Y6aCyLl_L',{1:'Commercial Glazing Contractors logo on white.',2:'Glazed restaurant storefront with black frames and a covered walkway.',3:'Scaffolding around a building with exposed red steel columns.',4:'T-shirt artwork proof with company logos.',5:'Black storefront frames below exposed plywood sheathing.',6:'Bare truck chassis in a parking lot.',7:'Interior glass partition below exposed ductwork and ceiling panels.'},'storefront','in-progress')
add('C3b1y5eOqaZ',{1:'Company rack truck parked beside a building.'},'field','not-applicable')
add('DAjvfXrSnHz',{1:'Pair of aluminum-framed glass doors with pull handles.'},'doors')
add('DCxlgcIyiln',{1:'Closed blue roll-up shutter beneath the Haven House sign.'},'service-repair','before')
add('DCxs8HIPbmH',{1:'Black-framed glass entrance beneath the Haven House sign.'},'storefront')
add('DG6hOoNSqdD',{1:'Plywood enclosure beneath a concrete overhang.',2:'Brick facade with plywood-covered openings and concrete columns.',9:'Aluminum frame in a brick opening still covered with plywood.',10:'Plywood-backed aluminum frame in a brick wall.',11:'Corner of a brick building with boarded openings.',12:'Concrete columns in front of boarded storefront openings.',13:'Corner storefront framing with plywood behind the mullions.',14:'Plywood-backed storefront frame beside a concrete column.',15:'Tall aluminum frame in a boarded brick-wall opening.',16:'Long run of aluminum framing over plywood beneath an overhang.'},'storefront','before')
add('DHW_j3mSr-w',{1:'Corner aluminum storefront with dark glass installed.'},'storefront')
add('DHXAGWlyCZr',{1:'Aluminum entrance doors and reflective glass in a brick facade.',2:'Reflective glass lites in two brick-wall openings.',9:'Glazed corner storefront beneath a concrete canopy.',10:'Aluminum-framed corner glazing beside a concrete column.'},'storefront')
add('DLWALw-S1JO',{2:'Black-framed interior glass office fronts beside a marble-pattern floor.',9:'Long corridor of black-framed interior glass partitions.',10:'Narrow black-framed door with an opaque panel and exit sign.',11:'Black-framed glazed corner with double doors.',12:'Double glass doors and transom in an interior corner.',13:'Interior glass office fronts beneath an exposed black ceiling.',14:'Glazed office corner beside a corridor with polished concrete.',15:'Black-framed glass partitions along an interior corridor.'},'interior-glass')
add('DMEU2KxS4Bx',{1:'Service counter opening with a closed blind and chairs.',2:'Handwritten glass dimensions and hole-location sketch.',9:'Glass and aluminum frames loaded on a rack truck.',10:'Glass installed across a service counter with a closed blind behind it.',11:'Glazed service counter with the blind raised.'},'service-repair')
add('DN9RxPOErIV',{3:'Frameless interior glass panels with protective film and floor tape.',9:'Interior glass office fronts beneath exposed white roof framing.'},'interior-glass','in-progress')
add('DNltS0CyJju',{3:'Black-framed glass office doorway beside patterned carpet.',11:'Row of black-framed glass offices under a suspended ceiling.',13:'Interior glass partition in front of unfinished cabinetry.',15:'Frameless glass partition with cardboard on the floor.'},'interior-glass','in-progress')
add('DNluK6fyyT7',{2:'Frameless glass corner with temporary installation markers.',9:'Long interior glass wall with protective markers on the panels.',10:'Glass office corner with materials laid on floor protection.',11:'Interior glass partition with a ladder and exposed ceiling.',12:'Wide interior glass enclosure with floor protection.',13:'Frameless glass wall beside an unfinished corridor.'},'interior-glass','in-progress')
add('DOhqbb3kaAB',{2:'Bare truck chassis parked in a lot.',9:'Rear of a white truck cab before a body is installed.',10:'Front of a white cab-over truck in a parking lot.',11:'Truck cab interior with seats and steering wheel.',12:'Dashboard and steering wheel of a truck.',13:'View through a truck windshield.',14:'Truck driver door and side mirror.',15:'Close view of a truck wheel and cab step.'},'field','not-applicable')
add('DOlwI2BibWc',{2:'Black storefront glazing below a plywood-sheathed facade.',9:'Two black-framed storefront openings in wood-framed construction.',10:'Black-framed glazed entrance with caution tape.',11:'Black storefront doors below exposed timber framing.',12:'Black-framed glass wall in an unfinished timber opening.',13:'Corner entrance with black framing and caution tape.',14:'Interior view of storefront glazing under exposed timber.',15:'Black-framed entrance viewed from inside an unfinished room.',16:'Black glass entrance doors with a pull handle.',17:'Interior view of a narrow glazed entrance bay.',18:'Storefront glass beyond open timber ceiling framing.',19:'Wide view of storefront glazing from an unfinished interior.',20:'Black-framed glazed doors viewed from a timber-framed room.',21:'Storefront doors and transom viewed from inside.',22:'Angled interior view of a glass entrance door.',23:'Exterior of two glazed openings below plywood sheathing.',24:'Black storefront entrance below exposed wood framing.',25:'Close exterior view of black glass entrance doors.',26:'Black-framed doors and transom with an unfinished wood header.'},'storefront','in-progress')
add('DYGLmbJGRcL',{2:'Building facade with scaffolding and exposed steel columns.',9:'Corner glass storefront behind scaffolding.',10:'Glazed facade behind scaffolding with strong sunlight.',11:'Storefront glazing behind scaffolding and sun glare.',12:'Scaffolded glazed corner obscured by sun glare.',13:'Scaffolding around a glazed corner and red steel canopy.'},'storefront','in-progress')
add('DeP_8slkrom',{2:'Restaurant storefront with black glass frames and exterior canopy.',9:'Reflective storefront glass beside a covered walkway.',10:'Pair of black-framed glass entrance doors.',11:'Corner restaurant entrance with black framing and sidewalk.',12:'Restaurant glazing and canopy viewed along the side wall.',13:'Side service door and metal canopy beside a turquoise wall.'},'storefront')
drops={'cgc_C2Y6aCyLl_L_01.jpg':'Logo asset, not project photography','cgc_C2Y6aCyLl_L_04.jpg':'T-shirt artwork proof','cgc_C2Y6aCyLl_L_06.jpg':'Truck sale detail unrelated to installed work','cgc_DMEU2KxS4Bx_02.jpg':'Field-note snapshot, not project photography','cgc_DYGLmbJGRcL_11.jpg':'Strong sun glare','cgc_DYGLmbJGRcL_12.jpg':'Strong sun glare'}
for f in rows:
 if 'DOhqbb3kaAB' in f: drops[f]='Truck sale detail unrelated to installed work'
for f,reason in drops.items(): rows[f].update(keep=False,quality='reject',reject_reason=reason)
for f in ['cgc_DYGLmbJGRcL_09.jpg','cgc_DYGLmbJGRcL_10.jpg']: rows[f]['quality']='fair'
files=[]
for src in sorted((ROOT/'_raw/ig').glob('*.jpg')):
 r={'id':src.stem,'source':src.name,**rows[src.name]}; im=ImageOps.exif_transpose(Image.open(src)).convert('RGB'); r.update(width=im.width,height=im.height)
 if r['keep']:
  for size,suffix in [(1600,''),(640,'-thumb')]:
   copy=im.copy(); copy.thumbnail((size,size)); copy.save(OUT/(src.stem+suffix+'.webp'),'WEBP',quality=78,method=6)
  r.update(file=src.stem+'.webp',thumb=src.stem+'-thumb.webp')
 files.append(r)
def ID(x):return 'cgc_'+x
pairs=[{'before':ID('DG6hOoNSqdD_13'),'after':ID('DHW_j3mSr-w_01'),'caption':'Corner opening: plywood-backed framing to installed glass.'},{'before':ID('DG6hOoNSqdD_15'),'after':ID('DHXAGWlyCZr_02'),'caption':'Brick-wall openings: boarded to glazed. Views are from different positions.'}]
clips=[('cgc_DD8NdeCy3QF_0',0,'Glass panels secured to a rack truck.'),('cgc_DEY5eDKpqKD_0',0,'Interior glass installation with ladders and floor protection.'),('cgc_DH30nzbPmKe_0',0,'Interior glass partitions along an office corridor.'),('cgc_DLV_167SUbo_1',0,'Black-framed interior office fronts and glass doors.'),('cgc_DNltQTcyJAj_4',6,'Frameless glass conference room under ceiling light strips.')]
videos=[]
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
for name,start,caption in clips:
 src=str(ROOT/'_raw/video'/(name+'.mp4')); base=OUT/name
 scale="scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1080,-2)':flags=lanczos,fps=24"
 common=['-ss',str(start),'-i',src,'-t','6','-an','-vf',scale]
 for ext,codec in [('mp4',['-c:v','libx264','-preset','fast','-b:v','1700k','-maxrate','2100k','-bufsize','3000k','-pix_fmt','yuv420p','-movflags','+faststart']),('webm',['-c:v','libvpx-vp9','-b:v','1500k','-deadline','good','-cpu-used','4'])]:
  target=str(base)+'.'+ext
  if not Path(target).exists():run(common+codec+[target])
  assert Path(target).stat().st_size<=4_000_000
 poster=name+'-poster.webp';run(['-ss',str(start),'-i',src,'-frames:v','1','-vf','scale=640:-2',str(OUT/poster)])
 vtt=name+'.vtt';(OUT/vtt).write_text('WEBVTT\n\n00:00.000 --> 00:06.000\n'+caption+' No audio.\n',encoding='utf-8')
 videos.append({'id':name,'mp4':name+'.mp4','webm':name+'.webm','poster':poster,'captions':vtt,'caption':caption,'duration':6,'audio':False,'short_side':1080,'source':name+'.mp4','start':start})
manifest={'files':files,'pairs':pairs,'videos':videos,'hero_candidates':[ID('DeP_8slkrom_02'),ID('DeP_8slkrom_11'),ID('DHXAGWlyCZr_09')],'notes':'All 90 raw photos classified from contact sheets. Captions describe visible content only. Pair viewpoints differ; not a pixel-aligned survey.'}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
assets=ROOT/'site/assets'; logo=Image.open(ROOT/'_raw/logo.png').convert('RGBA')
for size,name in [(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
 im=Image.new('RGBA',(size,size),'#0a0b0d'); mark=logo.crop((45,0,164,55));mark.thumbnail((int(size*.85),int(size*.85)));im.alpha_composite(mark,((size-mark.width)//2,(size-mark.height)//2));im.convert('RGB').save(assets/name)
Image.open(assets/'icon-192.png').save(assets/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])
og=ImageOps.fit(Image.open(OUT/(ID('DeP_8slkrom_02')+'.webp')),(1200,630));og=Image.blend(og,Image.new('RGB',og.size,'#0a0b0d'),.56);d=ImageDraw.Draw(og);font='C:/Windows/Fonts/arialbd.ttf';d.text((60,70),'CGC / C-17 / LIC 1109661',font=ImageFont.truetype(font,24),fill='#faac1a');d.text((60,170),'We put the\nglass in.',font=ImageFont.truetype(font,82),fill='white',spacing=0);d.text((60,490),'COMMERCIAL GLAZING CONTRACTORS INC.',font=ImageFont.truetype(font,25),fill='white');d.text((60,540),'SOUTHERN CALIFORNIA  /  (714) 650-4185',font=ImageFont.truetype(font,21),fill='white');og.save(assets/'og.jpg',quality=88)
print(len(files),'classified;',sum(r['keep'] for r in files),'exported;',len(videos),'loops')
