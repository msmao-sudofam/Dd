from pathlib import Path
import re,json
S=Path('cgc/site');p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8-sig');s=s.replace('css=\'\'\'','css=\'\'\'');s=s.replace("html=html.replace('CSS',css)","css=(S.parent/'_work/font.css').read_text(encoding='utf-8')+css\nhtml=html.replace('CSS',css)")
s=re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">.*?rel="stylesheet">','<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>',s)
s=s.replace('src="media/cgc_DeP_8slkrom_02.webp"','src="media/cgc_DeP_8slkrom_02-thumb.webp" srcset="media/cgc_DeP_8slkrom_02-thumb.webp 640w, media/cgc_DeP_8slkrom_02.webp 1200w" sizes="100vw"')
s=s.replace('min-height:780px;height:calc(100dvh - 60px)','min-height:0;height:calc(100dvh - 60px)').replace('.static-film .film-sticky{min-height:700px}', '.static-film .film-sticky{min-height:0;height:calc(100dvh - 116px)}')
s=s.replace('aria-label="{e(t)}"','aria-label="0{i+1} / {e(t)}"')
p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/seo.py');s=p.read_text(encoding='utf-8-sig').replace("connect-src 'self' https://cdn.jsdelivr.net", "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net");p.write_text(s,encoding='utf-8')
fontcss=(Path('cgc/_work/font.css')).read_text(encoding='utf-8')
for p in [S/'crm/index.html',*[S/x/'index.html' for x in ['privacy','terms','license','accessibility']]]:
 s=p.read_text(encoding='utf-8-sig');s=re.sub(r'<link[^>]+(?:href="https://fonts\.[^"]+"|href="https://fonts\.[^>]+)[^>]*>','',s);s=s.replace('<style>','<style>'+fontcss,1);p.write_text(s,encoding='utf-8')
