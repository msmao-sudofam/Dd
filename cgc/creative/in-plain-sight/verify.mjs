import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(path.join(root,'../../site/package.json'));
const {chromium}=require('playwright');
const {default:AxeBuilder}=await import(pathToFileURL(require.resolve('@axe-core/playwright')).href);
const browser=await chromium.launch();
const errors=[],network=[];
const results=[];
const evidence=path.join(root,'verification');
await mkdir(evidence,{recursive:true});
for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(pathToFileURL(path.join(root,'CGC-In-Plain-Sight-Concept.html')).href);
  const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].map(i=>i.complete&&i.naturalWidth>0),buttons:document.querySelectorAll('[data-shot]').length,broken:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),manifest:JSON.parse(document.getElementById('concept-manifest').textContent)}));
  assert.equal(state.overflow,false);assert.equal(state.images.length,3);assert.ok(state.images.every(Boolean));assert.equal(state.buttons,18);assert.deepEqual(state.broken,[]);
  assert.equal(state.manifest.shot_count,6);assert.equal(state.manifest.frames,384);assert.equal(state.manifest.duration_seconds,16);assert.equal(state.manifest.quality_substitutions_allowed,false);assert.deepEqual(state.manifest.chapter_boundaries_seconds,[0,2,5,7,10,13,16]);
  const axe=await new AxeBuilder({page}).analyze();
  assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact})),[]);
  await page.screenshot({path:path.join(evidence,`${width}.png`)});
  if(width===1440){
    await page.locator('[data-shot="02"][data-kind="h3_prompt"]').click();
    const clipboard=await page.evaluate(()=>navigator.clipboard.readText());
    assert.equal(clipboard.replaceAll('\r\n','\n'),state.manifest.shots[1].h3_prompt.replaceAll('\r\n','\n'));
    for(const [id,file] of [['save-text','full-brief.md'],['save-json','production.json']]){
      const pending=page.waitForEvent('download');await page.locator('#'+id).click();const dl=await pending;
      const actual=await readFile(await dl.path(),'utf8');const expected=await readFile(path.join(root,file),'utf8');
      if(id==='save-json')assert.deepEqual(JSON.parse(actual),JSON.parse(expected));else assert.equal(actual.replaceAll('\r\n','\n'),expected.replaceAll('\r\n','\n'));
    }
  }
  results.push({width,horizontalOverflow:false,loadedImages:3,promptButtons:18,axeViolations:axe.violations.length});
  await context.close();
}
await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
const report={results,consoleErrors:errors.length,externalRequests:network.length,clipboard:'P02 H3 exact match',downloads:'Markdown and JSON exact match',frames:384,durationSeconds:16};
await writeFile(path.join(evidence,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
