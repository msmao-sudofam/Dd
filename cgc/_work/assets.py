import math,glob,os,json
from PIL import Image,ImageDraw,ImageOps,ImageEnhance,ImageFont
R='C:/Users/Moqui/Projects/Dd/cgc'
A=R+'/site/assets';M=R+'/site/media'
BG=(10,11,13);GRAY=(0x63,0x64,0x66);AMB=(0xFA,0xAC,0x1A)
VB=(214,-2,410,220);r=97;sw=20

def centers(p,q):
    (x1,y1),(x2,y2)=p,q
    mx,my=(x1+x2)/2,(y1+y2)/2;d=math.hypot(x2-x1,y2-y1);h=math.sqrt(r*r-(d/2)**2)
    ux,uy=-(y2-y1)/d,(x2-x1)/d
    return [(mx+ux*h,my+uy*h),(mx-ux*h,my-uy*h)]

def arc_pts(c,p,q):
    # sweep=0 (decreasing angle in y-down coords), large arc (span>180)
    a0=math.atan2(p[1]-c[1],p[0]-c[0]);a1=math.atan2(q[1]-c[1],q[0]-c[0])
    span=(a0-a1)%(2*math.pi)
    return a0,span

def sector(c,a0,span,n=240):
    po=[];pi_=[]
    for k in range(n+1):
        a=a0-span*k/n
        po.append((c[0]+(r+sw/2)*math.cos(a),c[1]+(r+sw/2)*math.sin(a)))
        pi_.append((c[0]+(r-sw/2)*math.cos(a),c[1]+(r-sw/2)*math.sin(a)))
    return po+pi_[::-1]

def shapes():
    out=[]
    for col,p,q,bar in ((GRAY,(402.4,47.3),(402.4,166.7),None),(AMB,(497.6,38.4),(525.3,118.8),((459,108.8,525.3,128.8))),(GRAY,(603.4,47.3),(603.4,166.7),None)):
        best=None
        for c in centers(p,q):
            a0,span=arc_pts(c,p,q)
            if span>math.pi: best=(c,a0,span)
        c,a0,span=best
        out.append((col,sector(c,a0,span),bar))
    return out

def mark(h,pad=0,bg=BG,ss=4):
    sc=h/VB[3]*ss;w=round(VB[2]*sc/ss) # width in px at 1x
    W,H=round(VB[2]*sc),round(VB[3]*sc)
    im=Image.new('RGBA',(W,H),bg+(255,) if bg else (0,0,0,0));d=ImageDraw.Draw(im)
    tf=lambda pt:((pt[0]-VB[0])*sc,(pt[1]-VB[1])*sc)
    for col,poly,bar in shapes():
        d.polygon([tf(p) for p in poly],fill=col)
        if bar:
            x0,y0=tf((bar[0],bar[1]));x1,y1=tf((bar[2],bar[3]));d.rectangle([x0,y0,x1,y1],fill=col)
    return im.resize((W//ss,H//ss),Image.LANCZOS)

def icon(size,frac=0.72):
    im=Image.new('RGB',(size,size),BG)
    mw=int(size*frac);m=mark(10)  # dummy for ratio
    ratio=VB[2]/VB[3]
    m=mark(int(mw/ratio),bg=None)
    m=m.resize((mw,round(mw/ratio)),Image.LANCZOS) if m.width!=mw else m
    im.paste(m,((size-m.width)//2,(size-m.height)//2),m)
    return im
icon(512).save(A+'/icon-512.png')
icon(180).save(A+'/apple-touch-icon.png')
icon(32,0.9).save(A+'/favicon-32.png') if False else None
f=icon(32);f=icon(256,0.86).resize((32,32),Image.LANCZOS);f.save(A+'/favicon-32.png')

# og
src=Image.open(M+'/storefront-after-ono-bbq-02.webp').convert('RGB')
# landscape crop from portrait: take middle band
W,H=1200,630
s=W/src.width;im=src.resize((W,round(src.height*s)),Image.LANCZOS)
top=int((im.height-H)*0.30);im=im.crop((0,top,W,top+H))
im=ImageEnhance.Brightness(im).enhance(0.45)
# left gradient for legibility
ov=Image.new('RGBA',(W,H),(0,0,0,0));od=ImageDraw.Draw(ov)
for x in range(W):
    od.line([(x,0),(x,H)],fill=(10,11,13,int(150*max(0,1-x/W*1.3))))
im=Image.alpha_composite(im.convert('RGBA'),ov)
mk=mark(78,bg=None);im.alpha_composite(mk,(64,56))
d=ImageDraw.Draw(im)
fb=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',74);fs=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',30)
d.text((64,300),'Commercial Glazing',font=fb,fill='white')
d.text((64,384),'Contractors Inc.',font=fb,fill='white')
d.text((64,520),'Storefront · Curtain Wall · Interior Glass — Southern California',font=fs,fill=(235,236,238))
im.convert('RGB').save(A+'/og.jpg',quality=88)
print('ok')
