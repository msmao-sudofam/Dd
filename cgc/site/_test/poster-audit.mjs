import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.CGC_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch();const results=[];
for(const width of [360,390,430,1440]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844}});
  const page=await context.newPage();const posters=[];const errors=[];
  page.on('response',r=>{if(/\/entrance-light(?:-sm)?\.(avif|webp)$/.test(r.url()))posters.push({file:r.url().split('/').pop(),status:r.status(),type:r.headers()['content-type']})});
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>{const v=document.querySelector('#intro-film');return v.readyState>=2&&!v.paused});
  const expected=width<=760?'entrance-light-sm.avif':'entrance-light.avif';
  assert.equal(posters.length,1);assert.equal(posters[0].file,expected);assert.equal(posters[0].type,'image/avif');assert.equal(posters[0].status,200);
  assert.deepEqual(errors,[]);assert.equal(await page.locator('#intro-film').getAttribute('poster'),null);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.waitForFunction(()=>document.querySelector('#intro-film').currentTime>=.5);
  await page.screenshot({path:`_test/results/mobile-avif-hero-${width}.png`});
  results.push({width,posters,film:'playing',consoleErrors:errors,overflow:0});await context.close();
}
for(const mode of ['reduced-motion','no-js','playback-failure']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='reduced-motion'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
  const page=await context.newPage();let films=0;page.on('request',r=>{if(/\/assets\/film\/.*\.mp4$/.test(r.url()))films++});
  if(mode==='playback-failure')await page.route('**/assets/film/*.mp4',route=>route.abort());
  await page.goto(base);await page.locator('.cinema-poster img').evaluate(i=>i.decode());
  if(mode==='playback-failure')await page.waitForFunction(()=>document.querySelector('#intro-film').error!==null);
  else assert.equal(films,0);
  assert.equal(await page.locator('#intro-film').evaluate(v=>getComputedStyle(v).opacity),'0');
  assert(await page.locator('.cinema-poster img').isVisible());
  await page.screenshot({path:`_test/results/mobile-avif-${mode}.png`});results.push({mode,posterVisible:true,videoOpacity:0,filmRequests:films});await context.close();
}
await browser.close();await fs.writeFile('_test/results/mobile-avif-poster-qa.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
