import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL=process.env.CGC_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch();const results=[];
for(const width of [360,390,430,1440]){
  const ctx=await browser.newContext({viewport:{width,height:width===1440?1000:844}});
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
  await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`_test/results/v4-hero-${width}.png`});
  await page.waitForFunction(()=>{const v=document.querySelector('#intro-film');return !v.paused&&v.readyState>=2&&!!v.currentSrc},null,{timeout:15000});
  const autoSource=await page.locator('#intro-film').evaluate(v=>v.currentSrc);assert(autoSource.includes(width<761?'portrait.mp4':'wide.mp4'),'Autoplay uses the responsive film source');
  assert.match(await page.locator('#hero-image-label').textContent(),/generated visualization/);
  await page.waitForFunction(()=>document.querySelector('#film-toggle').getAttribute('aria-pressed')==='true');
  const tabs=page.getByRole('tab');await tabs.nth(0).focus();await page.keyboard.press('End');
  assert.equal(await tabs.nth(2).getAttribute('aria-selected'),'true');assert(await page.locator('#concept-panel-2').isVisible());assert(!await page.locator('#concept-panel-0').isVisible());
  await page.keyboard.press('ArrowRight');assert.equal(await tabs.nth(0).getAttribute('aria-selected'),'true');
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,smallTargets:[...document.querySelectorAll('button,a.btn,header a,.mobile-bar a,input[type=range]')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44}).map(e=>e.id||e.textContent.slice(0,40)),smallInputs:[...document.querySelectorAll('input,select,textarea')].filter(e=>e.offsetWidth&&e.name!=='hp'&&e.type!=='checkbox').filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(e=>e.id)}));
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
  for(const id of ['before-after','install','work','bid','faq']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();await page.screenshot({path:`_test/results/v4-${id}-${width}.png`});
  }
  await page.locator('.film-stage').scrollIntoViewIfNeeded();
  if(await page.locator('#intro-film').evaluate(v=>v.paused))await page.locator('#film-toggle').click();
  await page.waitForFunction(()=>{const v=document.querySelector('#intro-film');return !v.paused&&v.readyState>=2},null,{timeout:15000});
  const source=await page.locator('#intro-film').evaluate(v=>v.currentSrc);assert(source.includes(width<761?'portrait.mp4':'wide.mp4'),'Resumed film keeps the responsive source');
  await page.locator('#film-toggle').click();await page.waitForFunction(()=>document.querySelector('#film-toggle').getAttribute('aria-pressed')==='false');assert(await page.locator('#intro-film').evaluate(v=>v.paused),'Pause control stops the film');
  await page.locator('#film-toggle').click();await page.waitForFunction(()=>{const v=document.querySelector('#intro-film');return !v.paused&&v.readyState>=2&&document.querySelector('#film-toggle').getAttribute('aria-pressed')==='true'});
  await page.locator('#film-captions').click();assert.equal(await page.locator('#film-captions').getAttribute('aria-pressed'),'true');
  if(width===390){
    await page.locator('.field-films>summary').click();await page.locator('#clip-0').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const v=document.querySelector('#clip-0');return v.readyState>=2&&!v.paused&&!!v.poster});
    await page.locator('#clip-0 + button').click();assert(await page.locator('#clip-0').evaluate(v=>v.paused));
    await page.locator('#bid').scrollIntoViewIfNeeded();assert(await page.locator('#clip-0').evaluate(v=>v.paused));
  }
  results.push({width,...layout,consoleErrors:errors,axe:violations,manualFilm:true,keyboardTabs:true});await ctx.close();
}
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await ctx.newPage();await page.goto(baseURL);assert(await page.locator('#intro-film').evaluate(v=>v.paused&&!v.currentSrc));await page.screenshot({path:'_test/results/v4-reduced-motion.png'});results.push({reducedMotion:true,posterVisible:await page.locator('.cinema-poster img').isVisible(),filmSourceLoaded:false});
await browser.close();await fs.writeFile('_test/results/v4-qa.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
for(const r of results.filter(r=>r.width)){assert.equal(r.overflow,0);assert.deepEqual(r.smallTargets,[]);assert.deepEqual(r.smallInputs,[]);assert.deepEqual(r.consoleErrors,[]);assert.deepEqual(r.axe,[])}
