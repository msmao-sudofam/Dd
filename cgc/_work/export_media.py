import glob,os,json
from PIL import Image,ImageOps
ROOT='C:/Users/Moqui/Projects/Dd/cgc'
OUT=ROOT+'/site/media'
os.makedirs(OUT,exist_ok=True)
F=sorted(glob.glob(ROOT+'/_raw/ig/*.jpg'))
S='storefront';C='curtain-wall';I='interior-glass';D='doors';FR='frameless';P='in-progress';T='crew-trucks';O='other'
K={
1:('storefront-after-ono-bbq-01',S,'after',5,'Finished black-framed storefront and canopy at Ono Hawaiian BBQ, corner view from the parking lot.'),
2:('storefront-during-ono-bbq-scaffold-01',S,'during',3,'Ono Hawaiian BBQ building under scaffolding with red steel canopy frame, storefront framing visible behind.'),
4:('in-progress-wood-facade-dark-frames-01',P,'during',3,'Plywood-sheathed wall with dark aluminum storefront frames set in the openings and caution tape across the glass.'),
6:('interior-glass-during-film-hallway-01',I,'during',3,'Long interior corridor of floor-to-ceiling glass with protective film still on, concrete floor and ceiling grid.'),
7:('crew-truck-cgc-f450-01',T,'none',4,'CGC branded flatbed truck with glass rack and license number on the door.'),
8:('doors-after-aluminum-pair-01',D,'after',4,'Pair of aluminum-framed glass entrance doors with pull handles and sidelites.'),
9:('doors-before-haven-house-rollup-01',D,'before',3,'Haven House Year-Round Emergency Shelter: blue roll-up door closing the opening under the sign.'),
10:('storefront-after-haven-house-01',S,'after',4,'Haven House Year-Round Emergency Shelter: black-framed glass storefront in the same opening, interior visible.'),
11:('in-progress-brick-plywood-bays-01',P,'during',3,'Wood-framed bays at a covered walkway, plywood infill with an exposed ceiling.'),
12:('in-progress-brick-colonnade-01',P,'during',3,'Long view down a brick building colonnade with plywood-infilled storefront bays.'),
13:('storefront-before-brick-boarded-grid-01',S,'before',3,'Aluminum storefront frame grid in a brick wall, openings boarded with plywood.'),
14:('storefront-before-brick-boarded-grid-02',S,'before',3,'Aluminum storefront frame grid in a brick wall, openings boarded with plywood, front view.'),
15:('in-progress-brick-colonnade-02',P,'during',3,'Brick building under a concrete colonnade, aluminum framing set with plywood infill.'),
16:('in-progress-brick-colonnade-03',P,'during',3,'Brick colonnade, storefront framing visible along the covered walk.'),
17:('storefront-before-brick-corner-picnic-01',S,'before',4,'Aluminum storefront framing at a building corner, plywood infill, picnic table at right.'),
18:('storefront-before-brick-door-bay-01',S,'before',4,'Storefront framing with plywood infill at a door bay, palm plant and tool bag in front.'),
19:('storefront-before-brick-side-wall-01',S,'before',4,'Aluminum framing with plywood infill in a large opening on a brick side wall, teal paint patch at right.'),
20:('in-progress-brick-framing-close-01',P,'during',3,'Close view of aluminum storefront framing with plywood infill and framing exposed above.'),
21:('curtain-wall-after-brick-corner-02',C,'after',4,'Glazed corner of the building with tinted glass in an aluminum grid, one panel still boarded.'),
22:('storefront-after-brick-door-bay-01',S,'after',4,'Glazed storefront with tinted glass at the door bay, plywood door infill still in place.'),
23:('storefront-after-brick-side-wall-01',S,'after',4,'Large glazed opening on a brick side wall with graffiti, aluminum grid and reflective tinted glass.'),
24:('curtain-wall-after-brick-corner-01',C,'after',4,'Glazed corner of aluminum storefront with tinted glass, view along the walk.'),
25:('curtain-wall-after-brick-corner-picnic-01',C,'after',4,'Glazed building corner with tinted glass in the aluminum grid, one plywood panel remaining up top, picnic table at right.'),
26:('doors-after-black-frame-office-front-01',D,'after',5,'Black-framed glass office front with a glass door and pull handle, marble-look floor.'),
27:('interior-glass-after-black-frame-corridor-01',I,'after',5,'Run of black-framed glass office fronts and doors along a corridor, marble-look floor.'),
28:('doors-after-frosted-door-01',D,'after',4,'Black-framed frosted-glass door with long pull handle and exit sign above.'),
29:('interior-glass-after-lobby-storefront-01',I,'after',5,'Black-framed glass partition and sliding entrance doors in a finished lobby with polished concrete floor.'),
31:('interior-glass-after-office-corner-01',I,'after',4,'Black-framed glass office room along an open corridor with a ladder inside.'),
32:('interior-glass-after-office-corner-02',I,'after',4,'Black-framed glass offices with a ladder inside, view toward the entrance glass.'),
33:('interior-glass-after-corridor-01',I,'after',4,'Black-framed glass wall and door along a corridor with linear lights overhead.'),
36:('crew-truck-glass-rack-01',T,'none',3,'CGC truck with an A-frame rack carrying glass lites inside a shop.'),
37:('other-rollup-counter-glass-01',O,'none',3,'Service counter opening with a roll-down shutter and glass behind it, county office signage above.'),
38:('other-service-window-glass-01',O,'none',3,'Service counter window with glass and a reflection of a worker inside the office.'),
40:('frameless-during-film-glass-01',FR,'during',3,'Frameless glass partition with film applied in an office under construction.'),
41:('frameless-during-office-frame-01',FR,'during',3,'Dark metal frame and glass at an office window room, carpet tiles on the floor.'),
42:('interior-glass-during-office-fronts-01',I,'during',3,'Row of black-framed glass office fronts in an open office, drywall sheet leaning against a wall.'),
44:('frameless-during-glass-room-01',FR,'during',3,'Frameless glass room with materials on the floor.'),
45:('frameless-during-glass-offices-01',FR,'during',4,'Frameless glass office with door pulls, floor protection and city view.'),
46:('frameless-during-glass-offices-02',FR,'during',3,'Frameless glass offices under construction with setting dots and floor covering.'),
47:('frameless-during-glass-corner-01',FR,'during',4,'Frameless glass corner office with double pull handles, protective paper on the floor.'),
48:('frameless-during-glass-offices-03',FR,'during',3,'Frameless glass partitions with setting dots, high-rise windows behind.'),
49:('frameless-during-glass-offices-04',FR,'during',3,'Frameless glass offices with a worker in a safety vest and ladders.'),
50:('frameless-during-glass-corridor-01',FR,'during',4,'Frameless glass wall and door, polished floor, ceiling open above.'),
59:('in-progress-bifold-wall-exterior-01',P,'during',3,'Wood-sheathed building with two openings holding black aluminum folding glass walls.'),
61:('doors-during-bifold-glass-wall-01',D,'during',4,'Black aluminum folding glass wall set in a wood-framed opening, caution tape across the glass.'),
63:('doors-during-bifold-glass-wall-02',D,'during',4,'Folding glass wall panels in the opening, view from outside.'),
65:('doors-during-bifold-interior-01',D,'during',3,'Folding glass wall from inside, blue protective tape on the sill, trucks outside.'),
67:('doors-during-bifold-interior-02',D,'during',3,'Folding glass wall from inside with a service door panel.'),
69:('in-progress-timber-interior-01',P,'during',3,'Interior of a wood-framed building with glass walls at the far end and ladders on the slab.'),
71:('doors-during-bifold-interior-03',D,'during',4,'Folding glass wall from inside a wood-framed shell, daylight through the glass.'),
72:('doors-during-bifold-interior-04',D,'during',4,'Folding glass wall with a transom bar, view from inside.'),
73:('doors-during-bifold-interior-05',D,'during',4,'Five-panel black folding glass wall seen from inside at an angle.'),
74:('in-progress-bifold-wall-exterior-02',P,'during',3,'Wood-sheathed building with glass wall openings, view across the dirt pad.'),
76:('doors-during-bifold-exterior-01',D,'during',4,'Black aluminum folding glass wall in a wood-framed opening, view from outside.'),
77:('doors-during-bifold-exterior-02',D,'during',4,'Black aluminum folding glass wall in a wood-framed opening, angled view.'),
78:('storefront-during-ono-bbq-scaffold-02',S,'during',3,'Ono Hawaiian BBQ building front under scaffolding with steel frame.'),
79:('storefront-during-ono-bbq-scaffold-03',S,'during',3,'Scaffolded building corner with storefront glazing visible at ground level.'),
80:('storefront-during-ono-bbq-scaffold-04',S,'during',3,'Scaffolded building with red steel beams and glazed storefront at the base.'),
83:('storefront-during-ono-bbq-scaffold-05',S,'during',3,'Scaffolded corner of the building, glass in place at the ground floor.'),
84:('storefront-after-ono-bbq-02',S,'after',5,'Ono Hawaiian BBQ finished storefront with wood-slat canopy and black-framed glass, low sun.'),
85:('storefront-after-ono-bbq-03',S,'after',4,'Glass storefront run under the canopy along the walk at Ono Hawaiian BBQ.'),
86:('doors-after-ono-bbq-entrance-01',D,'after',5,'Pair of black aluminum glass entrance doors with accessibility sign under the canopy.'),
87:('storefront-after-ono-bbq-04',S,'after',4,'Storefront glass and sign band at Ono Hawaiian BBQ seen from the corner.'),
88:('storefront-after-ono-bbq-05',S,'after',4,'Glass storefront at the side of the Ono Hawaiian BBQ building next to a teal wall.'),
89:('storefront-after-ono-bbq-06',S,'after',3,'Building side with teal wall, black panel and a door under a small awning.'),
}
def post(i):
    return os.path.basename(F[i])[4:-4].rsplit('_',1)[0]
photos=[];name_by_idx={}
for i,v in sorted(K.items()):
    n,cat,ba,q,cap=v
    im=ImageOps.exif_transpose(Image.open(F[i])).convert('RGB')
    w,h=im.size
    s=min(1,1600/max(w,h))
    big=im.resize((round(w*s),round(h*s)),Image.LANCZOS) if s<1 else im
    big.save(f'{OUT}/{n}.webp','WEBP',quality=78,method=6)
    s2=640/max(w,h)
    im.resize((round(w*s2),round(h*s2)),Image.LANCZOS).save(f'{OUT}/{n}_sm.webp','WEBP',quality=78,method=6)
    photos.append({'file':f'media/{n}.webp','thumb':f'media/{n}_sm.webp','w':big.width,'h':big.height,'category':cat,'before_after':ba,'caption':cap,'quality':q,'source_post':post(i)})
    name_by_idx[i]=f'media/{n}.webp'
pairs=[
(17,25,'Building corner under a concrete overhang: aluminum framing with plywood infill, then tinted glass set in the same grid (picnic table at right in both).'),
(19,23,'Large opening in a brick side wall: framing with plywood infill, then glazed with reflective tinted glass (teal paint patch on the wall in both).'),
(18,22,'Door bay and storefront run under the colonnade: plywood-infilled framing, then glazed bays (palm plant and tool bag in the before shot).'),
(9,10,'Haven House Year-Round Emergency Shelter: blue roll-up door in the opening, then a black-framed glass storefront in the same opening.'),
]
pj=[{'before':name_by_idx[a],'after':name_by_idx[b],'note':n} for a,b,n in pairs]
hero=[name_by_idx[i] for i in (84,1,85,87,88)]
json.dump({'photos':photos,'pairs':pj,'videos':[],'hero_candidates':hero},open(OUT+'/manifest.json','w'),indent=1)
print(len(photos))
