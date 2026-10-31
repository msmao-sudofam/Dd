const motion=matchMedia('(prefers-reduced-motion: reduce)');
let started=false;
function fallback(){document.body.classList.add('static-film');document.querySelector('#scene').hidden=true;const im=document.querySelector('.film-image');im.src='media/cgc_DeP_8slkrom_02-thumb.webp';im.alt='Finished restaurant storefront with black frames and glass';}
function start(){if(started||motion.matches)return;started=true;init().catch(fallback)}
if(!window.WebGLRenderingContext)fallback();
else if(!motion.matches){for(const event of ['scroll','wheel','touchstart','pointerdown','keydown'])addEventListener(event,start,{once:true,passive:true});if(scrollY>0)start();}
document.querySelectorAll('[data-stage]').forEach((button,i)=>button.addEventListener('click',()=>{const f=document.querySelector('#film'),s=document.querySelector('.film-sticky');scrollTo({top:f.offsetTop+[.235,.44,.645,.815,.98][i]*(f.offsetHeight-s.clientHeight),behavior:'smooth'})}));
async function init(){
 const THREE=await import('three');const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
 const canvas=document.querySelector('#scene'),film=document.querySelector('#film'),sticky=document.querySelector('.film-sticky');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x263542);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
 const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x263542,45,90);const camera=new THREE.PerspectiveCamera(45,1,.1,120);
 const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment();const environment=pmrem.fromScene(env,.04);scene.environment=environment.texture;env.dispose();pmrem.dispose();
 const mat=(color,props={})=>new THREE.MeshStandardMaterial({color,...props});const concrete=mat(0x363b40,{roughness:.95}),floor=mat(0x545b60,{roughness:.9}),metal=mat(0xb8bcc2,{metalness:.9,roughness:.35,emissive:0x34404a,emissiveIntensity:.3}),wood=mat(0x987450,{roughness:1}),back=mat(0x3c4448);
 const glass=new THREE.MeshPhysicalMaterial({color:0x9ec9d6,metalness:.05,roughness:.06,transparent:true,opacity:.28,transmission:.15,thickness:.15,envMapIntensity:1.8,side:THREE.DoubleSide,depthWrite:false});
 function box(w,h,d,x,y,z,m,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o}
 // Opening 16u x 7u, 1u = 2ft. Facade 30u x 12u.
 box(7,12,.6,-11.5,6,-.3,concrete);box(7,12,.6,11.5,6,-.3,concrete);box(16,5,.6,0,9.5,-.3,concrete);box(16.6,.3,.8,0,7.15,0,concrete);
 box(45,.2,18,0,-.2,4,floor);box(45,.28,.4,0,-.16,10,floor);box(16,.12,8,0,-.05,-4,back);box(16,7,.2,0,3.5,-8,back);box(16,.2,8,0,7,-4,back);box(5,1.6,1.3,2,.8,-5.5,mat(0x777a72));
 // Sky gradient is confined to the scene, not a UI decoration.
 const skyCanvas=document.createElement('canvas');skyCanvas.width=4;skyCanvas.height=128;const ctx=skyCanvas.getContext('2d'),g=ctx.createLinearGradient(0,0,0,128);g.addColorStop(0,'#101a2a');g.addColorStop(1,'#283b4a');ctx.fillStyle=g;ctx.fillRect(0,0,4,128);const skyTexture=new THREE.CanvasTexture(skyCanvas);const sky=box(100,70,.1,0,20,-20,new THREE.MeshBasicMaterial({map:skyTexture}));
 const ambient=new THREE.HemisphereLight(0xdceaf4,0x13181e,.6);scene.add(ambient);const sun=new THREE.DirectionalLight(0xcbdbe8,1.3);sun.position.set(-8,14,12);scene.add(sun);
 const boards=[];for(let i=0;i<4;i++){const b=box(3.97,6.97,.12,-6+i*4,3.5,.15,wood);boards.push(b);for(let j=0;j<6;j++)box(.018,6.8,.012,-1.8+j*.65,0,.07,mat(0x715d44),b)}
 const verticals=[];for(const x of [-8,-4,0,4,8]){const v=box(.10,7,.23,x,3.5,.18,metal);verticals.push(v)}
 const sill=box(16,.10,.23,0,.05,.18,metal),head=box(16,.1,.23,0,6.95,.18,metal),transom=box(16,.10,.23,0,5.5,.18,metal);
 const lites=[];for(let i=0;i<4;i++){for(let j=0;j<2;j++){if(i===1&&j===0)continue;const h=j?1.35:5.35;const pane=box(3.85,h,.04,-6+i*4,j?6.23:2.78,.18,glass.clone());lites.push(pane)}}
 const doors=new THREE.Group();scene.add(doors);const hinges=[];for(let i=0;i<2;i++){const hinge=new THREE.Group();hinge.position.set(i===0?-3.95:-.05,0,.22);doors.add(hinge);const dir=i===0?1:-1;const leaf=new THREE.Group();hinge.add(leaf);box(1.88,5.3,.045,dir*.96,2.75,0,glass.clone(),leaf);for(const x of [0,1.92])box(.08,5.4,.18,dir*x,2.75,0,metal,leaf);for(const y of [.08,5.42])box(1.92,.1,.18,dir*.96,y,0,metal,leaf);box(1.5,.065,.10,dir*.96,2.7,.14,metal,leaf);hinges.push(hinge)}
 const perimeter=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8,0,.33),new THREE.Vector3(-8,7,.33),new THREE.Vector3(8,7,.33),new THREE.Vector3(8,0,.33),new THREE.Vector3(-8,0,.33)]);const seal=new THREE.Line(perimeter,new THREE.LineBasicMaterial({color:0xe8eef2}));scene.add(seal);
 const dimGroup=new THREE.Group();scene.add(dimGroup);function line(points){const geom=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const l=new THREE.LineSegments(geom,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.4}));dimGroup.add(l)}
 line([[-8,7.8,.4],[8,7.8,.4],[-8,7.5,.4],[-8,8.1,.4],[8,7.5,.4],[8,8.1,.4],[-8.8,0,.4],[-8.8,7,.4],[-9.1,0,.4],[-8.5,0,.4],[-9.1,7,.4],[-8.5,7,.4]]);
 const streak=box(.4,6.9,.02,-8,3.5,.4,new THREE.MeshBasicMaterial({color:0xd6edf5,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false}));streak.rotation.z=-.25;
 const strips=[];for(const x of [-5,0,5])strips.push(box(3,.035,.3,x,6.85,-3,mat(0x101317,{emissive:0xffd294,emissiveIntensity:0})));const lights=[];for(const x of [-5,3]){const light=new THREE.PointLight(0xffd99a,0,20,1.2);light.position.set(x,5,-3);scene.add(light);lights.push(light)}
 const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,3.5,26),new THREE.Vector3(-14,4,16),new THREE.Vector3(8,3,9),new THREE.Vector3(0,4,20)]),look=new THREE.CatmullRomCurve3([new THREE.Vector3(0,4,0),new THREE.Vector3(0,3.5,0),new THREE.Vector3(1,3.5,0),new THREE.Vector3(0,3.5,0)]);
 const titles=['Rough opening.','Framed.','Glazed.','Sealed.','Open for business.'],specs=['R.O. 32′-0″ W × 14′-0″ H · FIELD MEASURED · PLUMB / LEVEL / SQUARE','2″ × 4-1/2″ ALUMINUM STOREFRONT · CENTER-SET · ANCHORED + SHIMMED','1″ INSULATED LOW-E · TEMPERED WHERE REQUIRED (CBC 2406)','PERIMETER SEALANT + BACKER ROD · DOORS HUNG · HARDWARE SET','PUNCH CLEARED · TURNED OVER'];
 let progress=0,target=0,visible=true,raf=0,lastStage=-2,lastTime=performance.now();const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ramp=(a,b)=>clamp((progress-a)/(b-a));
 function resize(){const w=sticky.clientWidth,h=sticky.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?76:45;camera.updateProjectionMatrix();request()}
 function scroll(){target=clamp(-film.getBoundingClientRect().top/(film.offsetHeight-sticky.clientHeight));request()}
 function render(now){const dt=Math.min(250,now-lastTime);lastTime=now;raf=0;if(!visible||motion.matches)return;progress+=(target-progress)*(1-Math.exp(-dt*.012));if(Math.abs(target-progress)<.0001)progress=target;const p=progress;
 for(let i=0;i<4;i++){boards[i].visible=p<.22;boards[i].position.y=3.5-ramp(.08+i*.008,.19+i*.008)*14;boards[i].rotation.x=ramp(.08,.24)*.2}
 for(let i=0;i<verticals.length;i++){const v=verticals[i],s=Math.max(.001,ramp(.25+i*.018,.36+i*.018));v.scale.y=s;v.position.y=3.5*s;v.visible=p>=.25}sill.visible=head.visible=transom.visible=p>=.25;transom.scale.x=Math.max(.001,ramp(.37,.45));head.scale.x=sill.scale.x=Math.max(.001,ramp(.25,.33));
 lites.forEach((lite,i)=>{const t=ramp(.45+i*.018,.51+i*.018);lite.visible=t>0;lite.position.z=.18+(1-t)*2;lite.material.opacity=t*.28});
 dimGroup.visible=p>=.08&&p<.3;document.querySelector('.dims').hidden=!dimGroup.visible;streak.visible=p>.51&&p<.65;streak.position.x=-8+ramp(.51,.65)*16;
 seal.visible=p>=.65;const draw=ramp(.65,.76)*4;seal.geometry.setDrawRange(0,Math.max(0,Math.floor(draw)+1)); // Draw partial segment endpoint for a continuous perimeter trace.
 const pts=[[-8,0],[-8,7],[8,7],[8,0],[-8,0]];const arr=seal.geometry.attributes.position;for(let i=0;i<5;i++){arr.setXYZ(i,...pts[i],.33)}const segment=Math.min(3,Math.floor(draw)),f=draw-segment;if(draw<4){arr.setXYZ(segment+1,pts[segment][0]+(pts[segment+1][0]-pts[segment][0])*f,pts[segment][1]+(pts[segment+1][1]-pts[segment][1])*f,.33);seal.geometry.setDrawRange(0,segment+2)}arr.needsUpdate=true;
 doors.visible=p>=.72;doors.position.y=(1-ramp(.72,.79))*1.4;hinges[1].rotation.y=-ramp(.77,.82)*Math.PI/9;
 const on=ramp(.82,.96);strips.forEach(s=>s.material.emissiveIntensity=on*4);lights.forEach(l=>l.intensity=on*35);ambient.intensity=.6-on*.2;renderer.setClearColor(new THREE.Color(0x263542).lerp(new THREE.Color(0x101925),on));sky.material.color.setScalar(1-on*.4);
 camera.position.copy(path.getPointAt(clamp(p)));camera.lookAt(look.getPointAt(clamp(p)));
 // Fit the full opening with a wider portrait FOV; preserve the specified camera path.
 if(camera.aspect<1){const distance=camera.position.distanceTo(look.getPointAt(clamp(p)));camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(11/(distance*camera.aspect)));camera.updateProjectionMatrix()}
 document.querySelector('.intro').style.opacity=String(1-clamp((p-.025)/.06));document.querySelector('.intro').style.visibility=p>.09?'hidden':'visible';
 const stage=p<.08?-1:p<.25?0:p<.45?1:p<.65?2:p<.82?3:4;if(stage!==lastStage){lastStage=stage;document.querySelector('#stage-title').textContent=stage<0?'One opening. Every phase.':titles[stage];document.querySelector('#stage-spec').textContent=stage<0?'SCROLL TO BUILD · 32′ × 14′ STOREFRONT STUDY':specs[stage];document.querySelectorAll('[data-stage]').forEach((b,i)=>b.setAttribute('aria-current',String(stage===i)));document.querySelector('#hero-cta').hidden=stage!==4}
 renderer.render(scene,camera);if(progress!==target)request();}
 function request(){if(!raf&&visible&&!motion.matches)raf=requestAnimationFrame(render)}
 document.body.classList.remove('static-film');document.querySelectorAll('[data-stage]').forEach((b,i)=>b.onclick=()=>{const t=[.16,.35,.55,.74,.94][i];window.scrollTo({top:film.offsetTop+t*(film.offsetHeight-sticky.clientHeight),behavior:'smooth'})});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){scroll();request()}else if(raf){cancelAnimationFrame(raf);raf=0}},{threshold:0}).observe(film);
 addEventListener('resize',resize);addEventListener('scroll',scroll,{passive:true});motion.addEventListener('change',()=>{document.body.classList.toggle('static-film',motion.matches);canvas.hidden=motion.matches;if(!motion.matches){resize();scroll()}});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('static-film');canvas.hidden=true});resize();scroll();
}
