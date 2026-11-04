// CGC showreel v2: the louder cut. Every visual is a pure function of t (motion-studio contract).
// A 0-1.3 type slam · B 1.3-4.6 S1 full-bleed + scope cycler · C 4.6-7.4 three strips · D 7.4-10.6 G circle reveal
// E 10.6-12.4 S2 whip + push · F 12.4-15 end card.
const L={slam:'GLASS.',scopes:['Storefront','Curtain wall','Interior glass','Entrances'],strips:['01 / The build','02 / Walk in','03 / Entrance'],d:'Make an|entrance.',e:'Plans|to punch.',cta:'Send plans<br>for a bid.',concept:'Concept film / generated visualization. Not a completed CGC project.'};
window.SCENE={duration:15,fps:30,width:1080,height:1920};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,k)=>a+(b-a)*k;
const E={out3:k=>1-(1-k)**3,in3:k=>k**3,inOut3:k=>k<.5?4*k**3:1-(-2*k+2)**3/2,outExpo:k=>k>=1?1:1-2**(-10*k),outBack:k=>1+2.70158*(k-1)**3+1.70158*(k-1)**2};
const prog=(t,t0,d,e=E.out3)=>e(clamp((t-t0)/d));
let seed=7;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const $=s=>document.querySelector(s);
const S1='clips/S1_scroll_the_build.webm',S2='clips/S2_scroll_walk_in.webm',G='clips/G_entrance.webm';
const words=(txt,cls)=>`<div class="${cls}">${txt.split('|').map(l=>l.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ')).join('<br>')}</div>`;
document.body.innerHTML=`
<div id="A" class="scene"><div class="slam">${L.slam}</div></div>
<div id="B" class="scene"><video src="${S1}" muted preload="auto"></video><div class="shade"></div><div class="cycler">${L.scopes.map(s=>`<span>${s}</span>`).join('')}</div></div>
<div id="C" class="scene">${[S1,S2,G].map((s,i)=>`<div class="strip"><video src="${s}" muted preload="auto"></video><p class="mono">${L.strips[i]}</p></div>`).join('')}</div>
<div id="D" class="scene"><video src="${G}" muted preload="auto"></video><div class="shade"></div>${words(L.d,'big')}</div>
<div id="E" class="scene"><video src="${S2}" muted preload="auto"></video><div class="shade"></div>${words(L.e,'big')}</div>
<div id="end"><div class="logo"><span id="mark"></span><img class="word" src="img/word.svg" alt=""></div><p class="cta">${L.cta}</p><p class="meta mono">(714) 650-4185 · CSLB C-17 #1109661</p></div>
<p id="concept" class="mono">${L.concept}</p><div id="flash"></div><canvas id="grain" width="540" height="960"></canvas>`;
const vids=[...document.querySelectorAll('video')];
window.READY=false;
(async()=>{$('#mark').innerHTML=await (await fetch('img/mark.svg')).text();
 await document.fonts.load('600 100px Geist');await document.fonts.load('500 28px "Geist Mono"');
 await Promise.all(vids.map(v=>new Promise(r=>v.readyState>=2?r():v.addEventListener('loadeddata',r,{once:true}))));window.READY=true})();
const gx=$('#grain').getContext('2d'),tiles=[];for(let k=0;k<4;k++){const id=gx.createImageData(540,960);for(let i=0;i<id.data.length;i+=4){const v=rng()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}tiles.push(id)}
const seek=(v,t)=>new Promise(r=>{t=clamp(t,0,v.duration-.04);if(Math.abs(v.currentTime-t)<.004)return r();v.addEventListener('seeked',r,{once:true});v.currentTime=t});
const show=(id,on)=>{$(id).style.visibility=on?'visible':'hidden'};
const stagger=(root,t0,leave)=>[...root.querySelectorAll('.w')].forEach((w,j)=>{const k=prog(t0,j*.06,.5,E.outExpo);w.style.opacity=k*(1-leave);w.style.transform=`translateY(${(1-k)*80-leave*60}px)`;w.style.filter=`blur(${(1-k)*10+leave*8}px)`});
window.renderFrame=async t=>{
 const jobs=[];
 // A: the slam
 show('#A',t<1.3);if(t<1.3){const k=prog(t,.1,.4,E.outExpo),s=$('#A .slam');s.style.transform=`scale(${lerp(1.5,1,k)*lerp(1,1.04,clamp(t/1.3))})`;s.style.filter=`blur(${(1-k)*14}px)`;s.style.opacity=k}
 // B: S1 at 2.4x, push, scope words cycle
 show('#B',t>=1.3&&t<4.6);if(t>=1.3&&t<4.6){const v=$('#B video'),u=t-1.3;jobs.push(seek(v,2+u*2.4));v.style.transform=`scale(${lerp(1.02,1.14,u/3.3)})`;
  [...document.querySelectorAll('#B .cycler span')].forEach((s,i)=>{const t0=1.45+i*.78,k=prog(t,t0,.3,E.outExpo),out=i<3?prog(t,t0+.62,.16,E.in3):prog(t,4.35,.2,E.in3);s.style.opacity=k*(1-out);s.style.transform=`translateY(${(1-k)*120-out*120}px)`})}
 // C: three strips slide in from alternating sides
 show('#C',t>=4.6&&t<7.4);if(t>=4.6&&t<7.4){[...document.querySelectorAll('#C .strip')].forEach((st,i)=>{const k=prog(t,4.6+i*.12,.55,E.outExpo),dir=i%2?1:-1,out=prog(t,7.1+i*.04,.25,E.in3);
  st.style.transform=`translateX(${dir*(1-k)*1080+(-dir)*out*1080}px)`;const v=st.querySelector('video');jobs.push(seek(v,[4,2,1.2][i]+(t-4.6)));v.style.transform=`scale(${lerp(1.18,1.05,k)})`;st.querySelector('p').style.opacity=prog(t,4.95+i*.12,.3)})}
 // D: G revealed by an expanding circle, headline staggers in
 show('#D',t>=7.4&&t<10.6);if(t>=7.4&&t<10.6){const d=$('#D'),k=prog(t,7.4,.7,E.outExpo);d.style.clipPath=`circle(${k*120}% at 50% 46%)`;const v=$('#D video');jobs.push(seek(v,(t-7.4)*1.55));v.style.transform=`scale(${lerp(1.25,1.06,k)})`;stagger(d,t-7.6,prog(t,10.25,.3,E.in3))}
 // E: S2 whips in from the right with motion blur, fast push
 show('#E',t>=10.45&&t<12.4);if(t>=10.45&&t<12.4){const e=$('#E'),k=prog(t,10.45,.3,E.out3),out=prog(t,12.1,.3,E.in3);e.style.transform=`translateX(${(1-k)*1080}px)`;e.style.filter=`blur(${(1-k)*24+out*10}px)`;e.style.opacity=1-out;
  const v=$('#E video');jobs.push(seek(v,4+(t-10.45)*3));v.style.transform=`scale(${lerp(1.04,1.3,E.inOut3(clamp((t-10.45)/1.95)))})`;stagger(e,t-10.7,0)}
 await Promise.all(jobs);
 // white flash on the two hard cuts
 $('#flash').style.opacity=Math.max(1-clamp(Math.abs(t-1.3)/.1),1-clamp(Math.abs(t-7.4)/.1))*.9;
 $('#concept').style.opacity=t>1.3&&t<12.3?.85:0;
 // F: end card (same build as the v1 reels)
 const e0=12.1;show('#end',t>=e0-.05);
 [...document.querySelectorAll('#mark path[pathLength]')].forEach((p,i)=>{p.style.strokeDasharray=1;p.style.strokeDashoffset=1-prog(t,e0+.1+i*.16,.9,E.inOut3)});
 $('#end .word').style.clipPath=`inset(0 ${(1-prog(t,e0+.6,.8,E.outExpo))*100}% 0 0)`;
 const ck=prog(t,e0+.9,.6,E.outExpo);$('#end .cta').style.cssText=`opacity:${ck};transform:translateY(${(1-ck)*60}px);filter:blur(${(1-ck)*8}px)`;
 $('#end .meta').style.opacity=prog(t,e0+1.3,.5);$('#end').style.transform=`scale(${lerp(1,1.03,clamp((t-e0)/2.9))})`;
 gx.putImageData(tiles[Math.floor(t*24)%4],0,0)};
if(!location.search.includes('render')){const t0=performance.now();(function loop(){if(window.READY)renderFrame(((performance.now()-t0)/1000)%15);requestAnimationFrame(loop)})()}
