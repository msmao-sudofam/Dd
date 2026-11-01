import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(path.join(root,'../../site/package.json'));
const {chromium}=require('playwright');
const {default:AxeBuilder}=await import(pathToFileURL(require.resolve('@axe-core/playwright')).href);
const browser=await chromium.launch(),errors=[],requests=[],results=[];
const evidence=path.join(root,'verification');await mkdir(evidence,{recursive:true});
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
 await page.goto(pathToFileURL(path.join(root,'CGC-From-the-Opening-Up.html')).href);
 const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].map(i=>i.complete&&i.naturalWidth>0),buttons:document.querySelectorAll('[data-shot]').length,broken:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),manifest:JSON.parse(document.getElementById('concept-manifest').textContent)}));
 assert.equal(data.overflow,false);assert.deepEqual(data.images,[true]);assert.equal(data.buttons,16);assert.deepEqual(data.broken,[]);assert.equal(data.manifest.shot_count,8);assert.equal(data.manifest.frames,576);assert.equal(data.manifest.duration_seconds,24);assert.equal(data.manifest.quality_substitutions_allowed,false);assert.deepEqual(data.manifest.chapter_boundaries_seconds,[0,2,5,8,10,14,17,21,24]);
 const axe=await new AxeBuilder({page}).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
 await page.screenshot({path:path.join(evidence,`${width}.png`)});
 await page.locator('#board').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(evidence,`${width}-board.png`)});
 if(width===1440){
  await page.locator('[data-shot="05"][data-kind="h3_prompt"]').click();const clip=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(clip.replaceAll('\r\n','\n'),data.manifest.shots[4].h3_prompt.replaceAll('\r\n','\n'));
  for(const [id,name] of [['save-text','full-brief.md'],['save-json','production.json']]){const pending=page.waitForEvent('download');await page.locator('#'+id).click();const download=await pending;const actual=await readFile(await download.path(),'utf8'),expected=await readFile(path.join(root,name),'utf8');if(id==='save-json')assert.deepEqual(JSON.parse(actual),JSON.parse(expected));else assert.equal(actual.replaceAll('\r\n','\n'),expected.replaceAll('\r\n','\n'))}
 }
 results.push({width,horizontalOverflow:false,loadedImages:1,promptButtons:16,axeViolations:axe.violations.length});await context.close();
}
await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
const report={results,consoleErrors:0,externalRequests:0,clipboard:'I05 H3 exact match',downloads:'Markdown and JSON match source',frames:576,durationSeconds:24};await writeFile(path.join(evidence,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
