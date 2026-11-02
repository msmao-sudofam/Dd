from pathlib import Path
p=Path('cgc/_work/hero.js');s=p.read_text(encoding='utf-8-sig').replace('let progress=0,target=0,visible=true,raf=0,lastStage=-2','let progress=0,target=0,visible=true,raf=0,lastStage=-2,lastTime=performance.now()').replace('function render(){raf=0;','function render(now){const dt=Math.min(250,now-lastTime);lastTime=now;raf=0;').replace('progress+=(target-progress)*.14','progress+=(target-progress)*(1-Math.exp(-dt*.012))').replace('camera.position.z+=10','camera.position.z+=18').replace('metalness:.9,roughness:.35','metalness:.9,roughness:.35,emissive:0x34404a,emissiveIntensity:.3').replace('light.intensity=on*18','light.intensity=on*35').replace('l.intensity=on*18','l.intensity=on*35')
s=s.replace("mat(0xffebc4,{emissive:0xffebc4,emissiveIntensity:0})","mat(0x101317,{emissive:0xffd294,emissiveIntensity:0})")
s=s.replace('ramp(.08+i*.012,.22+i*.01)','ramp(.08+i*.008,.19+i*.008)')
p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8-sig').replace('@media(max-width:700px){header','@media(max-width:700px){.film-sticky{height:calc(100dvh - 116px)}header');p.write_text(s,encoding='utf-8')
