// Static studies become keyboard-operated tabs; without JS every study remains visible.
const conceptTabs=$$('.concept-tabs [role=tab]'),conceptPanels=$$('#concept-panels>.pair');
function selectConcept(index,focus=false){conceptTabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;conceptPanels[i].hidden=!active});if(focus)conceptTabs[index].focus()}
if(conceptTabs.length){$('.concept-tabs').hidden=false;conceptTabs.forEach((tab,i)=>{tab.onclick=()=>selectConcept(i);tab.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%conceptTabs.length;else if(e.key==='ArrowLeft')next=(i-1+conceptTabs.length)%conceptTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=conceptTabs.length-1;else return;e.preventDefault();selectConcept(next,true)}});selectConcept(0)}

// The generated concept film plays muted on load. The poster remains the fallback for reduced motion and failed playback.
const filmVideo=$('#intro-film'),filmToggle=$('#film-toggle');let filmLoaded=false;
// The poster <img> stays the only poster download and the LCP candidate. The video is revealed once it has a frame, so it never paints over the poster and never fetches a second poster copy.
const filmChapters=[[0,'Lifted into place'],[2.25,'Guided into the bay'],[3.92,'The facade, sealed']];
function filmButton(){filmToggle.textContent=filmVideo.paused?'Play concept film':'Pause film';filmToggle.setAttribute('aria-pressed',String(!filmVideo.paused))}
function loadFilm(){if(filmLoaded)return;filmLoaded=true;filmVideo.src=matchMedia('(max-width:760px)').matches?'assets/film/lift-a/mobile.mp4':'assets/film/lift-a/desktop.mp4';filmVideo.load()}
function startFilm(){if(reduced.matches||document.hidden)return;loadFilm();filmVideo.play().catch(()=>{})}
filmToggle.onclick=()=>{if(filmVideo.paused){loadFilm();filmVideo.play().then(filmButton).catch(filmButton)}else{filmVideo.pause();filmButton()}};
filmVideo.addEventListener('loadeddata',()=>{filmVideo.classList.add('ready','poster-ready');$('#hero-image-label').textContent='Concept film / generated visualization';filmButton()});filmVideo.addEventListener('play',filmButton);filmVideo.addEventListener('pause',filmButton);
filmVideo.addEventListener('timeupdate',()=>{const t=filmVideo.currentTime,d=filmVideo.duration||1,chapter=filmChapters.filter(c=>t>=c[0]).length-1;$('#film-chapter').textContent='0'+(chapter+1)+' / '+filmChapters[chapter][1];$('#film-progress').style.width=(t/d*100)+'%';$('#film-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:'+String(Math.round(d)).padStart(2,'0')});
filmVideo.addEventListener('error',()=>{filmVideo.classList.remove('ready','poster-ready');$('#hero-image-label').textContent='Concept film / generated visualization';filmToggle.textContent='Retry concept film'});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){filmVideo.pause();filmButton()}},{threshold:.1}).observe($('.film-stage'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){filmVideo.pause();filmButton()}});reduced.addEventListener('change',()=>{if(reduced.matches){filmVideo.pause();filmButton()}});
$('#film-captions').onclick=()=>{const t=filmVideo.textTracks[0];if(!t)return;const on=t.mode!=='showing';t.mode=on?'showing':'hidden';$('#film-captions').setAttribute('aria-pressed',String(on));$('#film-captions').setAttribute('aria-label',on?'CC / Hide film captions':'CC / Show film captions')};
startFilm();
