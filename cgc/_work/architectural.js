// Static studies become keyboard-operated tabs; without JS every study remains visible.
const conceptTabs=$$('.concept-tabs [role=tab]'),conceptPanels=$$('#concept-panels>.pair');
function selectConcept(index,focus=false){conceptTabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;conceptPanels[i].hidden=!active});if(focus)conceptTabs[index].focus()}
if(conceptTabs.length){$('.concept-tabs').hidden=false;conceptTabs.forEach((tab,i)=>{tab.onclick=()=>selectConcept(i);tab.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%conceptTabs.length;else if(e.key==='ArrowLeft')next=(i-1+conceptTabs.length)%conceptTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=conceptTabs.length-1;else return;e.preventDefault();selectConcept(next,true)}});selectConcept(0)}

// The concept poster is the default. Actual CGC footage plays only on request.
const filmVideo=$('#intro-film'),filmToggle=$('#film-toggle');let filmLoaded=false;
const filmChapters=['Clear divisions','Glass on the rack','In the field','Office fronts'];
function filmButton(){filmToggle.textContent=filmVideo.paused?'Play field film':'Pause film';filmToggle.setAttribute('aria-pressed',String(!filmVideo.paused))}
function loadFilm(){if(filmLoaded)return;filmLoaded=true;filmVideo.src=matchMedia('(max-width:760px)').matches?'assets/film/portrait.mp4':'assets/film/wide.mp4';filmVideo.load()}
filmToggle.onclick=()=>{if(filmVideo.paused){loadFilm();filmVideo.play().then(filmButton).catch(filmButton)}else{filmVideo.pause();filmButton()}};
filmVideo.addEventListener('loadeddata',()=>{filmVideo.classList.add('ready');$('#hero-image-label').textContent='Actual CGC field footage';filmButton()});filmVideo.addEventListener('play',filmButton);filmVideo.addEventListener('pause',filmButton);
filmVideo.addEventListener('timeupdate',()=>{const t=filmVideo.currentTime,chapter=Math.min(3,Math.floor(t/4));$('#film-chapter').textContent='0'+(chapter+1)+' / '+filmChapters[chapter];$('#film-progress').style.width=(t/16*100)+'%';$('#film-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:16'});
filmVideo.addEventListener('error',()=>{filmVideo.classList.remove('ready');$('#hero-image-label').textContent='Architectural concept / generated visualization';filmToggle.textContent='Retry field film'});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){filmVideo.pause();filmButton()}},{threshold:.1}).observe($('.film-stage'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){filmVideo.pause();filmButton()}});reduced.addEventListener('change',()=>{if(reduced.matches){filmVideo.pause();filmButton()}});
$('#film-captions').onclick=()=>{const t=filmVideo.textTracks[0];if(!t)return;const on=t.mode!=='showing';t.mode=on?'showing':'hidden';$('#film-captions').setAttribute('aria-pressed',String(on));$('#film-captions').setAttribute('aria-label',on?'CC / Hide film captions':'CC / Show film captions')};
