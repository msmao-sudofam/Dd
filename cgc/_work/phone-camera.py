from pathlib import Path
p=Path('cgc/_work/hero.js');s=p.read_text(encoding='utf-8').replace('boards[i].visible=p<.25','boards[i].visible=p<.22').replace("if(camera.aspect<1){camera.position.z+=18;camera.lookAt(0,3.7,0)}", "if(camera.aspect<1){const distance=camera.position.distanceTo(look.getPointAt(clamp(p)));camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(11/(distance*camera.aspect)));camera.updateProjectionMatrix()}")
s=s.replace(' // Fit full storefront in portrait while preserving the path and angle.',' // Fit the full opening with a wider portrait FOV; preserve the specified camera path.')
p.write_text(s,encoding='utf-8')
