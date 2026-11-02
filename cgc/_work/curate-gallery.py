from pathlib import Path
import json
p=Path('cgc/site/media/manifest.json');j=json.loads(p.read_text());j['featured_photos']=['cgc_DeP_8slkrom_02','cgc_DLWALw-S1JO_15','cgc_DNluK6fyyT7_12','cgc_DHXAGWlyCZr_09','cgc_DAjvfXrSnHz_01','cgc_DCxs8HIPbmH_01','cgc_DNltS0CyJju_11','cgc_DMEU2KxS4Bx_11','cgc_C3b1y5eOqaZ_01','cgc_DOlwI2BibWc_25','cgc_DYGLmbJGRcL_13','cgc_DN9RxPOErIV_09'];p.write_text(json.dumps(j,indent=2),encoding='utf-8')
p=Path('cgc/site/_build.py');s=p.read_text(encoding='utf-8-sig').replace(" for f in files.values():", " ordered=[files[k] for k in manifest.get('featured_photos',[]) if k in files]\n ordered += [f for f in files.values() if f not in ordered]\n for f in ordered:");p.write_text(s,encoding='utf-8')
