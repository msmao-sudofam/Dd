import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
A='C:/Users/Moqui/Projects/Dd/cgc/site/assets/'
GRAY='#636466'; AMB='#FAAC1A'
R=97; SW=20; CY=107
def pt(cx,deg): a=math.radians(deg); return (cx+R*math.cos(a), CY+R*math.sin(a))
def cpath(cx,gap=38):
    s=pt(cx,-gap); e=pt(cx,gap)
    return f'M{s[0]:.1f} {s[1]:.1f}A{R} {R} 0 1 0 {e[0]:.1f} {e[1]:.1f}'
def gpath(cx=429):
    s=pt(cx,-45); e=pt(cx,7)
    return f'M{s[0]:.1f} {s[1]:.1f}A{R} {R} 0 1 0 {e[0]:.1f} {e[1]:.1f}H{cx+30}'
mark=(f'<g fill="none" stroke-width="{SW}" stroke-linejoin="miter">'
      f'<path stroke="{GRAY}" d="{cpath(326)}"/>'
      f'<path stroke="{AMB}" d="{gpath()}"/>'
      f'<path stroke="{GRAY}" d="{cpath(527)}"/></g>')
font=TTFont('C:/Windows/Fonts/GOTHIC.TTF')
gs=font.getGlyphSet(); cmap=font.getBestCmap(); upm=font['head'].unitsPerEm
CAP=1471
def text_path(txt, x0, base, width, cap, track=0.05):
    names=[cmap[ord(c)] for c in txt]
    sc=cap/CAP; raw=sum(gs[n].width for n in names)+track*upm*(len(txt)-1)
    sx=width/(raw*sc)
    pen=SVGPathPen(gs); x=0
    for n in names:
        tp=TransformPen(pen,(sc*sx,0,0,-sc,x0+x*sc*sx,base)); gs[n].draw(tp); x+=gs[n].width+track*upm
    return pen.getCommands(), sx
d1,s1=text_path('COMMERCIAL GLAZING',2,293,836,45,0.04)
d2,s2=text_path('Contractors Inc.',152,346,538,38,0.02)
full=(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 356" role="img" aria-label="Commercial Glazing Contractors Inc.">'
      f'<title>Commercial Glazing Contractors Inc.</title>{mark}'
      f'<g fill="{GRAY}" stroke="{GRAY}" stroke-width="1.4" stroke-linejoin="round"><path d="{d1}"/><path d="{d2}"/></g></svg>')
open(A+'logo.svg','w').write(full)
open(A+'logo-mark.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="214 -2 410 220" role="img" aria-label="CGC"><title>CGC</title>{mark}</svg>')
print('ok',s1,s2)
