// Static studies become keyboard-operated tabs; without JS every study remains visible.
const conceptTabs=$$('.concept-tabs [role=tab]'),conceptPanels=$$('#concept-panels>.pair');
function selectConcept(index,focus=false){conceptTabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;conceptPanels[i].hidden=!active});if(focus)conceptTabs[index].focus()}
if(conceptTabs.length){$('.concept-tabs').hidden=false;conceptTabs.forEach((tab,i)=>{tab.onclick=()=>selectConcept(i);tab.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%conceptTabs.length;else if(e.key==='ArrowLeft')next=(i-1+conceptTabs.length)%conceptTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=conceptTabs.length-1;else return;e.preventDefault();selectConcept(next,true)}});selectConcept(0)}

// The generated concept film plays muted on load. The poster remains the fallback for reduced motion and failed playback.
const filmVideo=$('#intro-film'),filmToggle=$('#film-toggle');let filmLoaded=false;
// The poster <img> stays the only poster download and the LCP candidate. The video is revealed once it has a frame, so it never paints over the poster and never fetches a second poster copy.
const filmChapters=[[0,'Plywood to storefront'],[4.77,'Lifted into place'],[9.53,'The seal'],[12.63,'Lit floor by floor'],[17.4,'One clean skin'],[22.17,'The entrance']];
function filmButton(){filmToggle.textContent=filmVideo.paused?'Play concept film':'Pause film';filmToggle.setAttribute('aria-pressed',String(!filmVideo.paused))}
function loadFilm(){if(filmLoaded)return;filmLoaded=true;filmVideo.src=matchMedia('(max-width:760px)').matches?'assets/film/reel/mobile.mp4':'assets/film/reel/desktop.mp4';filmVideo.load()}
function startFilm(){if(reduced.matches||document.hidden)return;loadFilm();filmVideo.play().catch(()=>{})}
filmToggle.onclick=()=>{if(filmVideo.paused){loadFilm();filmVideo.play().then(filmButton).catch(filmButton)}else{filmVideo.pause();filmButton()}};
filmVideo.addEventListener('loadeddata',()=>{filmVideo.classList.add('ready','poster-ready');$('#hero-image-label').textContent='Concept film / generated visualization';filmButton()});filmVideo.addEventListener('play',filmButton);filmVideo.addEventListener('pause',filmButton);
filmVideo.addEventListener('timeupdate',()=>{const t=filmVideo.currentTime,d=filmVideo.duration||1,chapter=filmChapters.filter(c=>t>=c[0]).length-1;$('#film-chapter').textContent='0'+(chapter+1)+' / '+filmChapters[chapter][1];$('#film-progress').style.width=(t/d*100)+'%';$('#film-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:'+String(Math.round(d)).padStart(2,'0')});
filmVideo.addEventListener('error',()=>{filmVideo.classList.remove('ready','poster-ready');$('#hero-image-label').textContent='Concept film / generated visualization';filmToggle.textContent='Retry concept film'});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){filmVideo.pause();filmButton()}},{threshold:.1}).observe($('.film-stage'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){filmVideo.pause();filmButton()}});reduced.addEventListener('change',()=>{if(reduced.matches){filmVideo.pause();filmButton()}});
$('#film-captions').onclick=()=>{const t=filmVideo.textTracks[0];if(!t)return;const on=t.mode!=='showing';t.mode=on?'showing':'hidden';$('#film-captions').setAttribute('aria-pressed',String(on));$('#film-captions').setAttribute('aria-label',on?'CC / Hide film captions':'CC / Show film captions')};
// Start after load so the 2 MB reel never competes with the poster (the LCP) and first paint.
const queueFilm=()=>setTimeout(startFilm,600);
if(document.readyState==='complete')queueFilm();else addEventListener('load',queueFilm,{once:true});

// Scroll reveal. Progressive: elements are only hidden after this runs, and never with reduced motion.
if(!reduced.matches&&'IntersectionObserver' in window){
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.section-head,.section>.wrap>.eyebrow,.section>.wrap>h2,.section>.wrap>p.muted,.concept-tabs,#concept-panels,.documented-pairs .pairs-grid>*,.service,.gallery-item,.process>div,.tool-grid>*,.bid-grid>*,.faq details,.footer-title').forEach(el=>{el.classList.add('rv');el.style.setProperty('--d',([...el.parentNode.children].indexOf(el)%4)*.07+'s');io.observe(el)});
document.documentElement.classList.add('motion')}

// S1 scroll film: frames load only once the section is near, and scroll position picks the frame.
const build=$('#build');
if(build&&!reduced.matches){
const canvas=build.querySelector('canvas'),ctx=canvas.getContext('2d'),N=81,small=matchMedia('(max-width:760px)').matches,frames=[],steps=$$('.build-steps li'),bar=build.querySelector('.build-bar span');let shown=-1,loaded=false;
if(small){canvas.width=960;canvas.height=540}
const src=i=>'assets/film/build/'+(small?'m':'d')+String(i+1).padStart(3,'0')+'.webp';
const draw=i=>{for(let j=i;j>=0;j--)if(frames[j]?.complete&&frames[j].naturalWidth){if(j!==shown){ctx.drawImage(frames[j],0,0,canvas.width,canvas.height);shown=j}return}};
const progress=()=>{const r=build.getBoundingClientRect(),run=r.height-innerHeight;return Math.min(1,Math.max(0,-r.top/(run||1)))};
const tick=()=>{const p=progress(),i=Math.round(p*(N-1));draw(i);bar.style.width=p*100+'%';steps.forEach((s,k)=>s.classList.toggle('on',p>=k/steps.length-.001))};
const load=()=>{if(loaded)return;loaded=true;for(let i=0;i<N;i++){const im=new Image();im.decoding='async';im.onload=()=>{if(i===0||Math.abs(i-Math.round(progress()*(N-1)))<3)tick()};im.src=src(i);frames[i]=im}};
build.classList.add('scrub');
new IntersectionObserver(es=>{if(es[0].isIntersecting)load()},{rootMargin:'150% 0px'}).observe(build);
let raf=0;addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;if(loaded)tick()})},{passive:true});addEventListener('resize',tick)}

// S2 walk-in loop: loads and plays only while on screen, never with reduced motion.
const walk=$('.walk-film video');
if(walk&&!reduced.matches)new IntersectionObserver(es=>{if(es[0].isIntersecting){if(!walk.src){walk.src=matchMedia('(max-width:760px)').matches?'assets/film/walk/mobile.mp4':'assets/film/walk/desktop.mp4'}walk.play().catch(()=>{})}else walk.pause()},{threshold:.25}).observe(walk);

// Clear header while the hero film is behind it; frosted once the page scrolls past.
const header=$('header');new IntersectionObserver(es=>header.classList.toggle('clear',es[0].isIntersecting),{rootMargin:'-60px 0px 0px 0px',threshold:0}).observe($('.film-stage'));

// Before/after sliders: mouse hover follows, touch drags only on a sideways swipe (vertical scrolling passes through),
// eased toward the target every frame, and one glide on first view so visitors see it moves.
$$('.pair').forEach(pair=>{const cmp=pair.querySelector('.comparison'),input=pair.querySelector('input');if(!cmp||!input)return;
const tags=cmp.querySelectorAll('.tag');let pos=+input.value,target=pos,raf=0,touch=null,glided=false,glideT0=0;
const hint=document.createElement('p');hint.className='compare-hint';hint.setAttribute('aria-hidden','true');hint.textContent=matchMedia('(hover:hover)').matches?'Move across the image to compare':'Swipe across the image to compare';cmp.after(hint);
const paint=()=>{cmp.style.setProperty('--split',pos+'%');input.value=Math.round(pos);if(tags[0])tags[0].style.opacity=Math.min(1,pos/18);if(tags[1])tags[1].style.opacity=Math.min(1,(100-pos)/18)};
const loop=()=>{if(glideT0){const k=Math.min(1,(performance.now()-glideT0)/2200);target=50+Math.sin(k*Math.PI*2)*24*(1-k*.3);if(k>=1){glideT0=0;target=50}}
pos+=(target-pos)*.18;paint();raf=Math.abs(target-pos)>.05||glideT0?requestAnimationFrame(loop):0};
const go=v=>{target=Math.max(0,Math.min(100,v));if(!raf)raf=requestAnimationFrame(loop)};
const at=e=>{const r=cmp.getBoundingClientRect();return (e.clientX-r.left)/r.width*100};
cmp.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){glideT0=0;go(at(e));return}
if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;
if(!touch.drag){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){touch=null;return}if(Math.abs(dx)>8){touch.drag=true;cmp.setPointerCapture(e.pointerId);cmp.classList.add('dragging')}}
if(touch&&touch.drag){glideT0=0;go(touch.start+dx/cmp.getBoundingClientRect().width*100)}});
cmp.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touch={x:e.clientX,y:e.clientY,start:pos,drag:false}});
const end=()=>{touch=null;cmp.classList.remove('dragging')};cmp.addEventListener('pointerup',end);cmp.addEventListener('pointercancel',end);
input.addEventListener('input',()=>{glideT0=0;target=pos=+input.value;paint()});paint();
if(!reduced.matches)new IntersectionObserver((es,o)=>{if(es[0].isIntersecting&&!glided&&!pair.hidden){glided=true;glideT0=performance.now();go(50);o.disconnect()}},{threshold:.6}).observe(cmp)});

// Live glass pane: the drawing follows the calculator inputs.
const pane=$('.pane');if(pane){const dw=$('.dim-w'),dh=$('.dim-h'),layers=$('.layers'),ll=$('.layers-label');
const fmt=i=>{const f=Math.floor(i/12),r=+(i%12).toFixed(2);return f+'′'+(r?'-'+r+'″':'')};
const draw=()=>{const w=+$('#wf').value*12+ +$('#wi').value,h=+$('#hf').value*12+ +$('#hi').value;if(!(w>0&&h>0))return;
const box=pane.parentNode,bw=box.clientWidth-36,bh=box.clientHeight-46,sc=Math.min(bw/w,bh/h);pane.style.setProperty('--pw',Math.max(6,w*sc)+'px');pane.style.setProperty('--ph',Math.max(6,h*sc)+'px');
dw.textContent=fmt(w);dh.textContent=fmt(h);const m=$('#makeup'),igu=m.selectedIndex===3,t=+m.value;
layers.innerHTML=igu?'<i style="width:8px"></i><i class="air" style="width:16px"></i><i style="width:8px"></i>':`<i style="width:${8*t}px"></i>`;
ll.textContent=m.options[m.selectedIndex].text.split(':')[0].replace(' monolithic','')};
$('#weight-form').addEventListener('input',draw);addEventListener('resize',draw);draw()}

// Scope hover loops: real CGC field clips only, desktop hover, loaded on first hover.
const LOOPS={'Interior glass & office fronts':'frameless-glass-offices-walkthrough','Entrances & doors':'interior-glass-black-frame-walkthrough','Service & repair':'glass-on-rack-truck'};
if(matchMedia('(hover:hover)').matches&&!reduced.matches)$$('.service').forEach(s=>{const name=s.querySelector('h3')?.textContent.trim(),clip=LOOPS[name],img=s.querySelector('img');if(!clip||!img)return;let v;
s.addEventListener('mouseenter',()=>{if(!v){v=document.createElement('video');v.className='loop';v.muted=v.loop=v.playsInline=true;v.setAttribute('aria-hidden','true');v.src='media/'+clip+'.mp4';s.append(v)}
Object.assign(v.style,{left:img.offsetLeft+'px',top:img.offsetTop+'px',width:img.offsetWidth+'px',height:img.offsetHeight+'px'});v.play().then(()=>s.classList.add('playing')).catch(()=>{})});
s.addEventListener('mouseleave',()=>{s.classList.remove('playing');v&&v.pause()})});

// ===== v10 high-end layer =====
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduced.matches;
// Loader: counts to 100 as the hero poster and fonts arrive (1.3s minimum, 2.6s maximum), then lifts like a curtain.
const loader=$('#loader');
if(loader&&document.documentElement.classList.contains('loading')){const root=document.documentElement,count=$('.ld-count'),bar=$('.ld-bar'),t0=performance.now();root.style.overflow='hidden';
 let ready=false,shown=0;Promise.all([document.fonts.ready,new Promise(r=>{const im=$('.cinema-poster img');im.complete?r():(im.addEventListener('load',r,{once:true}),im.addEventListener('error',r,{once:true}))})]).then(()=>ready=true);
 const step=()=>{const el=performance.now()-t0,cap=ready&&el>1300||el>2600?100:Math.min(92,el/1300*92);shown+=(cap-shown)*.12;if(cap===100&&shown>99.4)shown=100;
  count.textContent=String(Math.round(shown)).padStart(3,'0');bar.style.setProperty('--p',shown+'%');
  if(shown<100)return requestAnimationFrame(step);
  loader.classList.add('done');root.classList.remove('loading');root.style.overflow='';setTimeout(()=>loader.remove(),1100)};requestAnimationFrame(step)}
else if(loader)loader.remove();

// Buttons: label roll (duplicated label), dark/light sweep colour, magnetic pull on fine pointers.
$$('.btn').forEach(b=>{if(b.matches('[type=submit]'))return;const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
 if(tn){const s=document.createElement('span'),label=tn.textContent.trim();s.className='bl';s.innerHTML=`<span class="bl-i" data-t="${label.replace(/"/g,'&quot;')}">${label}</span>`;tn.replaceWith(s,' ')}
 if(b.closest('#film,#install,footer,header,.build-film'))b.classList.add('on-dark');
 if(fine){b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.35}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')}});

// Footer logo draws when the footer arrives.
const foot=$('footer');if(foot&&!reduced.matches)new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){foot.classList.add('drawn');o.disconnect()}},{threshold:.25}).observe(foot);

// Section headlines: words rise out of a mask.
if(!reduced.matches){const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('split-in');sio.unobserve(e.target)}}),{threshold:.35});
 $$('.section h2').forEach(h=>{let i=0;[...h.childNodes].forEach(n=>{if(n.nodeType!==3)return;const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.append(w);return}const s=document.createElement('span');s.className='sw';s.innerHTML=`<i style="--i:${i++}">${w.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</i>`;f.append(s)});n.replaceWith(f)});h.classList.add('split');sio.observe(h)})}

// Scroll progress line.
const bar=document.createElement('div');bar.id='progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
const prog=()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?scrollY/h:0})`};addEventListener('scroll',prog,{passive:true});prog();

// Cursor ring with context labels, and inertial scrolling, on fine pointers only.
if(fine){const c=document.createElement('div');c.id='cursor';c.setAttribute('aria-hidden','true');document.body.append(c);let x=-100,y=-100,cx=x,cy=y;
 addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;c.classList.add('on');const el=e.target.closest?.('.comparison,.gallery-item,a,button,summary,label,input,select,textarea');
  const lab=el?.matches('.comparison')?'Move':el?.matches('.gallery-item')?'View':'';c.textContent=lab;c.classList.toggle('label',!!lab);c.classList.toggle('link',!lab&&!!el)},{passive:true});
 document.addEventListener('pointerleave',()=>c.classList.remove('on'));
 (function loop(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
 if(window.Lenis){const lenis=new Lenis({autoRaf:true,lerp:.1,anchors:{offset:-92}});window.lenis=lenis}}
