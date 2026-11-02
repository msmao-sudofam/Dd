from pathlib import Path
import hashlib,subprocess,json
p=Path('cgc/site/index.html');before=hashlib.sha256(p.read_bytes()).hexdigest();subprocess.run(['python','cgc/site/_build.py'],check=True);assert before==hashlib.sha256(p.read_bytes()).hexdigest();print('Build idempotent:',before)
m=json.loads(Path('cgc/site/media/manifest.json').read_text());out=[]
for v in m['videos']:
 for fmt in ['mp4','webm']:
  p=Path('cgc/site/media')/v[fmt];j=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_streams','-show_format','-of','json',str(p)],text=True));vid=next(s for s in j['streams'] if s['codec_type']=='video');assert min(vid['width'],vid['height'])==1080;assert 6<=float(j['format']['duration'])<=10.1;assert p.stat().st_size<=4000000;assert not any(s['codec_type']=='audio' for s in j['streams']);out.append({'file':p.name,'bytes':p.stat().st_size,'width':vid['width'],'height':vid['height'],'seconds':j['format']['duration']})
Path('cgc/site/_test/results/media-qa.json').write_text(json.dumps(out,indent=2));print('All 10 video encodes: 1080 short side, 6 seconds, no audio, max',max(v['bytes'] for v in out),'bytes')
