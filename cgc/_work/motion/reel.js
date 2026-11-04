// CGC reels: every visual is a pure function of t (motion-studio contract). Pieces: s1, s2, g, sting.
const P={
 s1:{clip:'clips/S1_scroll_the_build.webm',vdur:10,dur:12.4,beats:[[0.15,'Floor by|floor.']],steps:[[0.5,'Open frame'],[3.8,'Glass set'],[7.2,'One clean skin']]},
 s2:{clip:'clips/S2_scroll_walk_in.webm',vdur:10,dur:12.4,beats:[[0.15,'Walk right|in.'],[5.2,'Storefront|to lobby.']]},
 g:{clip:'clips/G_entrance.webm',vdur:5.1,dur:7.5,beats:[[0.15,'Make an|entrance.']]},
 sting:{dur:4.2,end:0.1}}[window.PIECE];
window.SCENE={duration:P.dur,fps:30,width:1080,height:1920};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,k)=>a+(b-a)*k;
const E={out3:k=>1-(1-k)**3,in3:k=>k**3,inOut3:k=>k<.5?4*k**3:1-(-2*k+2)**3/2,outExpo:k=>k>=1?1:1-2**(-10*k)};
const prog=(t,t0,d,e=E.out3)=>e(clamp((t-t0)/d));
let seed=11;const rng=()=>(seed=(seed*16807)%2147483647)/2147483647;
const $=s=>document.querySelector(s),body=document.body;
const END=P.end??P.vdur;
body.innerHTML=`${P.clip?`<p id="label" class="mono">CGC / Commercial glazing</p><div id="heads"></div><div id="steps"></div><div id="frame"><video muted playsinline preload="auto" src="${P.clip}"></video></div><p id="concept" class="mono">Concept film / generated visualization. Not a completed CGC project.</p>`:''}
<div id="end"><div class="logo"><span id="mark"></span><img class="word" src="img/word.svg" alt=""></div><p class="cta">${P.clip?'Send plans<br>for a bid.':'We put the<br>glass in.'}</p><p class="meta mono">(714) 650-4185 · CSLB C-17 #1109661</p></div><canvas id="grain" width="540" height="960"></canvas>`;
// headlines: one element per beat, words wrapped for stagger
const heads=(P.beats||[]).map(([t0,txt])=>{const el=document.createElement('div');el.className='head';el.innerHTML=txt.split('|').map(l=>l.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ')).join('<br>');$('#heads').append(el);return{t0,el,ws:[...el.querySelectorAll('.w')]}});
const steps=(P.steps||[]).map(([t0,txt])=>{const el=document.createElement('span');el.className='mono';el.textContent=txt;$('#steps')?.append(el);return{t0,el}});
const video=$('video');
window.READY=false;
(async()=>{const svg=await (await fetch('img/mark.svg')).text();$('#mark').innerHTML=svg;
 await document.fonts.load('600 100px Geist');await document.fonts.load('500 28px "Geist Mono"');
 if(video)await new Promise(r=>video.readyState>=2?r():video.addEventListener('loadeddata',r,{once:true}));
 window.READY=true})();
const gx=$('#grain').getContext('2d'),tiles=[];for(let k=0;k<4;k++){const id=gx.createImageData(540,960);for(let i=0;i<id.data.length;i+=4){const v=rng()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}tiles.push(id)}
const seek=t=>new Promise(r=>{if(Math.abs(video.currentTime-t)<.004)return r();video.addEventListener('seeked',r,{once:true});video.currentTime=t});
window.renderFrame=async t=>{
 const out=prog(t,END-.3,.35,E.in3);            // everything above the end card leaves together
 if(video){await seek(clamp(t,0,P.vdur-.04));
  const fr=$('#frame'),k=prog(t,.05,.75,E.outExpo);
  fr.style.clipPath=`inset(0 ${(1-k)*50}% 0 ${(1-k)*50}%)`;fr.style.opacity=1-out;fr.style.transform=`translateY(${-out*40}px)`;
  video.style.transform=`scale(${lerp(1,1.06,clamp(t/P.vdur))})`;
  $('#label').style.opacity=prog(t,0,.4)*(1-out);$('#concept').style.opacity=prog(t,.6,.4)*(1-out);
  heads.forEach((h,i)=>{const next=heads[i+1],leave=next?prog(t,next.t0-.35,.3,E.in3):out;
   h.ws.forEach((w,j)=>{const k=prog(t,h.t0+j*.07,.55,E.outExpo);w.style.opacity=k*(1-leave);w.style.transform=`translateY(${(1-k)*60-leave*40}px)`;w.style.filter=`blur(${(1-k)*8}px)`})});
  steps.forEach(s=>{const on=prog(t,s.t0,.4);s.el.style.color=`rgba(255,255,255,${(.32+.68*on)*(1-out)})`})}
 // end card: rings draw, wordmark wipes, CTA rises, meta fades
 const e0=END;const paths=[...document.querySelectorAll('#mark path[pathLength]')];
 paths.forEach((p,i)=>{p.style.strokeDasharray=1;p.style.strokeDashoffset=1-prog(t,e0+.1+i*.16,.9,E.inOut3)});
 $('#end .word').style.clipPath=`inset(0 ${(1-prog(t,e0+.6,.8,E.outExpo))*100}% 0 0)`;
 const ck=prog(t,e0+.9,.6,E.outExpo);$('#end .cta').style.cssText=`opacity:${ck};transform:translateY(${(1-ck)*60}px);filter:blur(${(1-ck)*8}px)`;
 $('#end .meta').style.opacity=prog(t,e0+1.3,.5);
 $('#end').style.transform=`scale(${lerp(1,1.03,clamp((t-e0)/(P.dur-e0)))})`;$('#end').style.transformOrigin='0 50%';
 gx.putImageData(tiles[Math.floor(t*24)%4],0,0)};
if(!location.search.includes('render')){const t0=performance.now();(function loop(){if(window.READY)renderFrame(((performance.now()-t0)/1000)%SCENE.duration);requestAnimationFrame(loop)})()}
