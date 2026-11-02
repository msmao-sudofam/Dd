import subprocess,os,json
from PIL import Image
R='C:/Users/Moqui/Projects/Dd/cgc'
O=R+'/site/media'
# (src, start, dur, name, caption)
V=[
('DLV_167SUbo_1',0,8,'interior-glass-black-frame-walkthrough','Walkthrough of finished black-framed glass office fronts and doors along a corridor.'),
('DH30nzbPmKe_0',0,8,'frameless-glass-offices-walkthrough','Walkthrough of finished frameless glass offices and conference room with tile floor.'),
('DEY5eDKpqKD_0',0,8,'glass-partition-install','Installers setting interior glass partitions with a ladder and glazing cart.'),
('DMOIt5SykOJ',0,8,'glass-rack-truck-loaded','Glass lites loaded on an A-frame rack truck inside a warehouse.'),
('DD8NdeCy3QF_0',0,8,'glass-on-rack-truck','Tempered glass lites strapped on the rack of a CGC truck.'),
('DG6iGSeyGQy_0',2,8,'storefront-framing-walkaround','Walkaround of aluminum storefront framing with plywood infill along a brick building.'),
]
out=[]
for src,ss,d,name,cap in V:
    f=f'{R}/_raw/video/cgc_{src}.mp4'
    pr=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',f],capture_output=True,text=True).stdout.strip().split(',')
    w,h=int(pr[0]),int(pr[1])
    short=min(w,h);tgt=min(short,1080)
    vf=f'scale=-2:{tgt}:flags=lanczos' if w>=h else f'scale={tgt}:-2:flags=lanczos'
    mp4=f'{O}/{name}.mp4';wb=f'{O}/{name}.webm';po=f'{O}/{name}-poster.webp'
    c=['ffmpeg','-y','-v','error','-ss',str(ss),'-t',str(d),'-i',f,'-vf',vf,'-an']
    subprocess.run(c+['-c:v','libx264','-pix_fmt','yuv420p','-crf','26','-preset','slow','-movflags','+faststart',mp4],check=True)
    subprocess.run(c+['-c:v','libvpx-vp9','-crf','36','-b:v','0','-pix_fmt','yuv420p',wb],check=True)
    subprocess.run(['ffmpeg','-y','-v','error','-ss',str(ss),'-i',f,'-frames:v','1','-vf',vf,f'{O}/_p.png'],check=True)
    im=Image.open(f'{O}/_p.png');im.save(po,'WEBP',quality=78);ow,oh=im.size;im.close();os.remove(f'{O}/_p.png')
    print(name,ow,oh,os.path.getsize(mp4)//1024,os.path.getsize(wb)//1024,'KB')
    out.append({'mp4':f'media/{name}.mp4','webm':f'media/{name}.webm','poster':f'media/{name}-poster.webp','caption':cap,'seconds':d,'w':ow,'h':oh})
m=json.load(open(O+'/manifest.json'));m['videos']=out;json.dump(m,open(O+'/manifest.json','w'),indent=1)
