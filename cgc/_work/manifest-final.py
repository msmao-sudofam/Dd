from pathlib import Path
import json
p=Path('cgc/site/media/manifest.json');j=json.loads(p.read_text());j={k:v for k,v in j.items() if not k.startswith('alternate_')};p.write_text(json.dumps(j,indent=2),encoding='utf-8')
