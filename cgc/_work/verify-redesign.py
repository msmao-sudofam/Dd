from pathlib import Path
import hashlib,subprocess,json
p=Path('cgc/site/index.html');h=hashlib.sha256(p.read_bytes()).hexdigest();subprocess.run(['python','cgc/site/_build.py'],check=True);assert h==hashlib.sha256(p.read_bytes()).hexdigest()
for f in ['wide.mp4','portrait.mp4']:
 p=Path('cgc/site/assets/film')/f;j=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_streams','-show_format','-of','json',str(p)],text=True));v=next(x for x in j['streams'] if x['codec_type']=='video');assert not any(x['codec_type']=='audio' for x in j['streams']);assert 15.9<=float(j['format']['duration'])<=16.1;print(f,v['width'],v['height'],p.stat().st_size,'bytes',j['format']['duration'],'seconds')
print('Build idempotent',h)
