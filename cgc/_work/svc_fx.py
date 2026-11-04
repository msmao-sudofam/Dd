# Hover motion graphic per service row (line drawings animated by CSS when the row gets .live).
G='#C99A3E'
def gl(x,y,w,h,cls='i gl',t=0):return f'<rect class="{cls}" style="--t:{t:.2f}s" x="{x}" y="{y}" width="{w}" height="{h}"/>'
def d(path,t,gold=False,cls='d'):return f'<path class="{cls}" style="--t:{t:.2f}s"{" stroke=%s" % repr(G).replace(chr(39),chr(34)) if gold else ""} d="{path}" pathLength="1"/>'
sf=(d('M40 22h200M40 16v12M240 16v12',0,True)+''.join(gl(x,58,50,92,t=.9+i*.08) for i,x in enumerate([40,90,140,190]))+''.join(gl(x,34,50,24,t=.8+i*.06) for i,x in enumerate([40,90,140,190]))
 +d('M40 150V34h200v116',.2)+d('M90 34v116M140 34v116M190 34v116',.5)+d('M40 58h200',.7)+d('M14 150h252',.1)+d('M181 94v24',1.3,True)
 +'<g clip-path="url(#fx-sf)"><rect class="sh" x="-40" y="20" width="22" height="140"/></g><clipPath id="fx-sf"><rect x="40" y="34" width="200" height="116"/></clipPath>')
cw=d('M14 156h252',0)+d('M70 156V14h140v142',.1)+d('M105 14v142M140 14v142M175 14v142M70 49.5h140M70 85h140M70 120.5h140',.3)
for r in range(4):
    for c in range(4):
        if (r,c)==(3,3):continue
        cw+=f'<rect class="i up gl" style="--t:{.5+r*.3+c*.07:.2f}s" x="{71+c*35}" y="{121.5-r*35.5}" width="33" height="33.5"/>'
cw+=d('M192 0v15',1.55,True)+'<rect class="i drop gl" style="--t:1.7s;--dy:-60px" x="176" y="15" width="33" height="33.5"/>'
ig=d('M10 150h260',0)+d('M20 24h240',.15)
for i,x in enumerate([40,90,140,190]):
    door=' door' if i==2 else ''
    ig+=f'<g class="i sl{door}" style="--t:{.35+i*.16:.2f}s;--dx:{230-x}px"><rect class="gl on" x="{x}" y="26" width="48" height="124"/><rect class="fr" x="{x}" y="26" width="48" height="124"/>'+(f'<path class="pull" d="M{x+8} 80v26"/>' if door else '')+'</g>'
en=d('M0 150h280M100 150L40 170M180 150L240 170',0)+'<rect class="i glow" style="--t:.6s" x="62" y="32" width="156" height="118"/>'+d('M60 150V30h160v120',.15)+d('M50 30h180',.35,True)
en+=f'<g class="i leaf l" style="--t:.5s"><rect class="gl on" x="62" y="32" width="78" height="118"/><rect class="fr" x="62" y="32" width="78" height="118"/><path class="pull" d="M132 76v30"/></g>'
en+=f'<g class="i leaf r" style="--t:.5s"><rect class="gl on" x="140" y="32" width="78" height="118"/><rect class="fr" x="140" y="32" width="78" height="118"/><path class="pull" d="M148 76v30"/></g>'
sr=(d('M14 156h252',0)+d('M70 150V20h140v130',.1)+'<rect class="i gl old" style="--t:.3s" x="71" y="21" width="138" height="128"/>'
 +''.join(d(p,.55+i*.07,cls='d cr') for i,p in enumerate(['M120 70l-22-18-14 4','M120 70l18-30 10-12','M120 70l34 6 22 18','M120 70l-6 34-16 30','M120 70l-30 22-12 2','M120 70l22 40 12 10']))
 +'<rect class="i drop gl new" style="--t:1.75s;--dy:-150px" x="71" y="21" width="138" height="128"/>'
 +'<g clip-path="url(#fx-sr)"><rect class="sh" x="-40" y="10" width="22" height="160"/></g><clipPath id="fx-sr"><rect x="71" y="21" width="138" height="128"/></clipPath>'
 +d('M226 132l7 7 14-16',2.3,True))
FX={'Storefront':sf,'Curtain wall':cw,'Interior glass & office fronts':ig,'Entrances & doors':en,'Service & repair':sr}
