from pathlib import Path
import json,subprocess
for n in ['cgc_DLV_167SUbo_1','cgc_DD8NdeCy3QF_0','cgc_DEY5eDKpqKD_0','cgc_DNltQTcyJAj_4']:
 j=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_streams','-of','json',str(Path('cgc/_raw/video')/(n+'.mp4'))],text=True));print(n,[(s.get('width'),s.get('height'),s.get('r_frame_rate')) for s in j['streams'] if s['codec_type']=='video'])
