from pathlib import Path
from PIL import Image
S=Path('cgc/site');im=Image.open('_work/boarded.png');im.thumbnail((1600,1600));im.save(S/'assets/hero-boarded.webp',quality=78)
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8').replace('src="media/cgc_DeP_8slkrom_02-thumb.webp" srcset="media/cgc_DeP_8slkrom_02-thumb.webp 640w, media/cgc_DeP_8slkrom_02.webp 1200w" sizes="100vw"','src="assets/hero-boarded.webp"').replace('alt="Finished restaurant storefront with black frames and glass"','alt="Illustrated commercial storefront opening with plywood boards"');p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/main.js');s=p.read_text(encoding='utf-8-sig').replace("if(reduced.matches)document.body.classList.add('static-film');","if(reduced.matches){document.body.classList.add('static-film');document.querySelector('.film-image').src='media/cgc_DeP_8slkrom_02-thumb.webp';document.querySelector('.film-image').alt='Finished restaurant storefront with black frames and glass';}");p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/hero.js');s=p.read_text(encoding='utf-8-sig');a=s.index('if(!motion.matches)');b=s.index('async function init()',a);s=s[:a]+'''let started=false;
function fallback(){document.body.classList.add('static-film');document.querySelector('#scene').hidden=true;const im=document.querySelector('.film-image');im.src='media/cgc_DeP_8slkrom_02-thumb.webp';im.alt='Finished restaurant storefront with black frames and glass';}
function start(){if(started||motion.matches)return;started=true;init().catch(fallback)}
if(!window.WebGLRenderingContext)fallback();
else if(!motion.matches){for(const event of ['scroll','wheel','touchstart','pointerdown','keydown'])addEventListener(event,start,{once:true,passive:true});if(scrollY>0)start();}
document.querySelectorAll('[data-stage]').forEach((button,i)=>button.addEventListener('click',()=>{const f=document.querySelector('#film'),s=document.querySelector('.film-sticky');scrollTo({top:f.offsetTop+[.235,.44,.645,.815,.98][i]*(f.offsetHeight-s.clientHeight),behavior:'smooth'})}));
''' +s[b:];p.write_text(s,encoding='utf-8')
p=S/'crm/index.html';s=p.read_text(encoding='utf-8').replace('</style>','main{width:100%;min-width:0}.board{width:100%;max-width:100%;contain:inline-size}\n</style>',1);p.write_text(s,encoding='utf-8')

