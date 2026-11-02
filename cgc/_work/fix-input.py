from pathlib import Path
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8-sig').replace('.pair input{width:100%;min-height:44px;', '.pair input{width:100%;min-height:44px;font-size:16px;');p.write_text(s,encoding='utf-8')
p=Path('cgc/site/_test/qa.mjs');s=p.read_text(encoding='utf-8-sig').replace('[0,.16,.35,.55,.74,.94]','[0,.235,.44,.645,.815,.98]').replace('waitForTimeout(850)','waitForTimeout(1800)');p.write_text(s,encoding='utf-8')
