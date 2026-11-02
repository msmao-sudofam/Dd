from pathlib import Path
p=Path('cgc/site/crm/index.html');s=p.read_text(encoding='utf-8').replace('label.f{display:block;min-width:0}','label.f{display:block;min-width:0;position:relative}').replace('.sr{position:absolute;', '.sr{position:absolute;left:0;top:0;');p.write_text(s,encoding='utf-8')
