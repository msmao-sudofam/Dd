import glob,os,collections
from PIL import Image,ImageDraw,ImageFont
SP=os.path.dirname(os.path.abspath(__file__))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',14)
g=collections.OrderedDict()
for f in sorted(glob.glob(SP+'/vf/*.jpg')):
    k=os.path.basename(f).rsplit('_',1)[0]; g.setdefault(k,[]).append(f)
keys=list(g)
for s in range(0,len(keys),4):
    rows=keys[s:s+4]; W=1800; S=Image.new('RGB',(W,len(rows)*(240*2+40)),'white'); d=ImageDraw.Draw(S)
    for r,k in enumerate(rows):
        y=r*(520); d.text((4,y+2),k,fill='black',font=font)
        for i,f in enumerate(g[k][:20]):
            im=Image.open(f); im.thumbnail((135,240)); x=(i%13)*138; yy=y+20+(i//13)*245
            S.paste(im,(x,yy)); d.text((x+2,yy+2),f'{i*2.5:.0f}s',fill='yellow',font=font)
    S.save(f'{SP}/sheets/vid_{s//4}.jpg',quality=85)
