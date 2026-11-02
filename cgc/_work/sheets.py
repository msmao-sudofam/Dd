import glob,os
from PIL import Image,ImageDraw,ImageFont
SP=os.path.dirname(__file__)+'/sheets'
files=sorted(glob.glob('C:/Users/Moqui/Projects/Dd/cgc/_raw/ig/*.jpg'))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',18)
cw,ch=400,400
for s in range(0,len(files),12):
    sheet=Image.new('RGB',(cw*4,(ch+26)*3),'white');d=ImageDraw.Draw(sheet)
    for i,f in enumerate(files[s:s+12]):
        im=Image.open(f);w,h=im.size;im.thumbnail((cw,ch))
        x=(i%4)*cw;y=(i//4)*(ch+26)
        sheet.paste(im,(x+(cw-im.width)//2,y+26))
        d.text((x+4,y+3),os.path.basename(f)[4:-4]+f' {w}x{h}',fill='black',font=font)
    sheet.save(f'{SP}/sheet_{s//12:02d}.jpg',quality=85)
print(len(files))
