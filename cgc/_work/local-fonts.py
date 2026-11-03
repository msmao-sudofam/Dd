from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote
from fontTools import subset
S=Path('cgc/site');out=S/'assets/fonts';out.mkdir(exist_ok=True)
for folder,file,name in [('archivo','Archivo[wdth,wght].ttf','archivo'),('jetbrainsmono','JetBrainsMono[wght].ttf','jetbrains-mono')]:
 src=Path('cgc/_work')/(name+'.ttf')
 if not src.exists():src.write_bytes(urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/'+quote(file)).read())
 # Latin-1 covers every page (incl. Spanish); Latin Extended-A was unused weight. Arrows ↓ ↔ ↗ → are used in copy.
 font=subset.load_font(str(src),subset.Options());sub=subset.Subsetter();sub.populate(unicodes=list(range(32,256))+list(range(0x2000,0x2070))+list(range(0x2190,0x219A)));sub.subset(font);font.flavor='woff2';font.save(str(out/(name+'.woff2')))
 (out/(name+'-OFL.txt')).write_bytes(urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/OFL.txt').read())
css="@font-face{font-family:Archivo;src:url('/assets/fonts/archivo.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%;font-display:swap}@font-face{font-family:'JetBrains Mono';src:url('/assets/fonts/jetbrains-mono.woff2') format('woff2');font-weight:100 800;font-display:swap}"
(S.parent/'_work/font.css').write_text(css,encoding='utf-8')
print('Local variable fonts ready')
