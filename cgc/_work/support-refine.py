from pathlib import Path
import json
p=Path('cgc/site/crm/index.html');s=p.read_text(encoding='utf-8').replace('</style>', '.toast{color:#fff}input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #39586c;outline-offset:2px}</style>',1);p.write_text(s,encoding='utf-8')
p=Path('cgc/site/manifest.webmanifest');j=json.loads(p.read_text());j['theme_color']='#ffffff';j['background_color']='#ffffff';p.write_text(json.dumps(j),encoding='utf-8')
p=Path('cgc/_work/bright-support.py');s=p.read_text(encoding='utf-8-sig').replace('.lane-toggle button[aria-pressed=true],.tag.hot{color:#fff}', '.lane-toggle button[aria-pressed=true]{color:#fff}.tag.hot{color:#9a3e2c;border-color:#9a3e2c}.toast{color:#fff}');p.write_text(s,encoding='utf-8')
