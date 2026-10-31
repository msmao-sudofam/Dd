from pathlib import Path
import subprocess,json
R=Path(__file__).resolve().parents[1];O=R/'site/assets/film';O.mkdir(exist_ok=True)
clips=[('cgc_DNltQTcyJAj_4',6,'Clear glass conference-room fronts and entrance doors.'),('cgc_DD8NdeCy3QF_0',12,'Glass panels secured to a glazing rack truck.'),('cgc_DEY5eDKpqKD_0',0,'Interior glass installation with ladders and floor protection.'),('cgc_DLV_167SUbo_1',37,'Black-framed interior entrance doors and glass office fronts.')]
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
for shape,w,h in [('wide',1600,900),('portrait',720,1100)]:
 paths=[]
 for i,(name,start,caption) in enumerate(clips):
  dest=R/'_work'/f'film-{shape}-{i}.mp4';paths.append(dest)
  vf=f'scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},setsar=1,fps=24,eq=contrast=1.04:saturation=0.78:brightness=-0.012,fade=t=in:st=0:d=0.25,fade=t=out:st=3.75:d=0.25'
  run(['-ss',str(start),'-i',str(R/'_raw/video'/(name+'.mp4')),'-t','4','-an','-vf',vf,'-c:v','libx264','-preset','fast','-b:v',('1700k' if shape=='wide' else '1200k'),'-maxrate',('1900k' if shape=='wide' else '1400k'),'-bufsize','2800k','-pix_fmt','yuv420p',str(dest)])
 concat=R/'_work'/f'film-{shape}.txt';concat.write_text('\n'.join("file '"+p.as_posix()+"'" for p in paths),encoding='utf-8')
 run(['-f','concat','-safe','0','-i',str(concat),'-an','-c','copy','-movflags','+faststart',str(O/(shape+'.mp4'))])
 run(['-ss','0.8','-i',str(O/(shape+'.mp4')),'-frames:v','1','-vf',f'scale={min(w,1280)}:-2',str(O/(shape+'-poster.webp'))])
(O/'captions.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'00:{i*4:02}.000 --> 00:{(i+1)*4:02}.000\n{c[2]} Silent footage.' for i,c in enumerate(clips))+'\n',encoding='utf-8')
(O/'edit.json').write_text(json.dumps({'duration':16,'audio':False,'source':'CGC supplied Instagram footage','shots':[{'source':n+'.mp4','start':s,'duration':4,'description':c} for n,s,c in clips]},indent=2),encoding='utf-8')
print('Cinematic film exported:',[(p.name,p.stat().st_size) for p in O.glob('*.mp4')])
