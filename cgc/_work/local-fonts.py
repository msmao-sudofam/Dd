from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote
from fontTools import subset
S=Path('cgc/site');out=S/'assets/fonts';out.mkdir(exist_ok=True)
for folder,file,name in [('archivo','Archivo[wdth,wght].ttf','archivo'),('jetbrainsmono','JetBrainsMono[wght].ttf','jetbrains-mono')]:
 data=urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/'+quote(file)).read();src=Path('cgc/_work')/(name+'.ttf');src.write_bytes(data)
 font=subset.load_font(str(src),subset.Options());sub=subset.Subsetter();sub.populate(unicodes=list(range(32,384))+list(range(0x2000,0x2070))+[0x2192,0x00d7]);sub.subset(font);font.flavor='woff2';font.save(str(out/(name+'.woff2')))
 (out/(name+'-OFL.txt')).write_bytes(urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/OFL.txt').read())
css="@font-face{font-family:Archivo;src:url('/assets/fonts/archivo.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%;font-display:swap}@font-face{font-family:'JetBrains Mono';src:url('/assets/fonts/jetbrains-mono.woff2') format('woff2');font-weight:100 800;font-display:swap}"
(S.parent/'_work/font.css').write_text(css,encoding='utf-8')
print('Local variable fonts ready')
