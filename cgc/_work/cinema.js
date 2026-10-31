const filmVideo=$('#intro-film'),filmToggle=$('#film-toggle');
let filmLoaded=false,filmInView=true,filmPausedByUser=false;
const filmChapters=['Clear divisions','Glass on the rack','In the field','Office fronts'];
function filmButton(){filmToggle.textContent=filmVideo.paused?'Play film':'Pause film';filmToggle.setAttribute('aria-pressed',String(!filmVideo.paused))}
function loadFilm(){if(filmLoaded)return;filmLoaded=true;filmVideo.src=matchMedia('(max-width:760px)').matches?'assets/film/portrait.mp4':'assets/film/wide.mp4';filmVideo.load()}
function playFilm(){loadFilm();filmVideo.play().then(filmButton).catch(()=>{filmButton()})}
filmToggle.onclick=()=>{if(filmVideo.paused){filmPausedByUser=false;playFilm()}else{filmPausedByUser=true;filmVideo.pause();filmButton()}};
filmVideo.addEventListener('loadeddata',()=>{filmVideo.classList.add('ready');filmButton()});filmVideo.addEventListener('play',filmButton);filmVideo.addEventListener('pause',filmButton);
filmVideo.addEventListener('timeupdate',()=>{const t=filmVideo.currentTime,chapter=Math.min(3,Math.floor(t/4));$('#film-chapter').textContent='0'+(chapter+1)+' / '+filmChapters[chapter];$('#film-progress').style.width=(t/16*100)+'%';$('#film-time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:16'});
filmVideo.addEventListener('error',()=>{filmVideo.classList.remove('ready');$('#film-chapter').textContent='CGC / commercial glazing';filmToggle.textContent='Replay film'});
new IntersectionObserver(entries=>{filmInView=entries[0].isIntersecting;if(!filmInView){filmVideo.pause();filmButton()}else if(!reduced.matches&&!filmPausedByUser){setTimeout(()=>{if(filmInView&&!reduced.matches&&!filmPausedByUser&&!document.hidden)playFilm()},1800)}},{threshold:.15}).observe($('#film'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){filmVideo.pause();filmButton()}else if(filmInView&&!reduced.matches&&!filmPausedByUser)playFilm()});
reduced.addEventListener('change',()=>{if(reduced.matches){filmVideo.pause();filmButton()}});

$('#film-captions').onclick=()=>{const t=filmVideo.textTracks[0];if(!t)return;const on=t.mode!=='showing';t.mode=on?'showing':'hidden';$('#film-captions').setAttribute('aria-pressed',String(on));$('#film-captions').setAttribute('aria-label',on?'CC / Hide film captions':'CC / Show film captions')};
