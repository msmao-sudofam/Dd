#!/usr/bin/env node
/**
 * Local deterministic HTML->PNG frames->MP4 renderer.
 * No dependency installation, downloads, external services or remote content.
 * Requires Node 18+, Playwright+Chromium in CURRENT WORKSPACE, FFmpeg/FFprobe.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, renameSync, copyFileSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { basename, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
function parseArgs(argv) {
  const flags = new Set(['preview', 'overwrite', 'keep-frames']);
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const s = argv[i];
    if (!s.startsWith('--')) throw new Error(`Unknown argument: ${s}`);
    const key = s.slice(2);
    if (flags.has(key)) opts[key] = true;
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opts[key] = argv[++i];
    else throw new Error(`Missing value for --${key}`);
  }
  return opts;
}
function need(c, message) { if (!c) throw new Error(message); }
function program(name) {
  const r = spawnSync(name, ['-version'], {encoding:'utf8',timeout:10000});
  need(!r.error && r.status === 0, `${name} is missing or unusable; install it and add it to PATH.`);
}
function probe(file) {
  const r = spawnSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',file], {encoding:'utf8',timeout:20000});
  need(r.status === 0, `ffprobe could not inspect ${file}: ${(r.stderr||'').slice(-800)}`);
  return JSON.parse(r.stdout);
}
async function run(programName, argv) {
  await new Promise((ok,fail)=>{
    const child=spawn(programName, argv, {stdio:['ignore','pipe','pipe']});
    let last='';
    for (const stream of [child.stdout,child.stderr]) stream.on('data', b => {last=(last+b.toString()).slice(-12000);});
    child.on('error',fail);
    child.on('close',code => code === 0 ? ok() : fail(new Error(`${programName} returned ${code}:\n${last.slice(-2500)}`)));
  });
}
async function openLocalServer(html) {
  const root=dirname(html);
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.glb':'model/gltf-binary','.wasm':'application/wasm'};
  const server=createServer(async (req,res)=>{
    try{
      const raw=new URL(req.url,'http://127.0.0.1').pathname;
      const rel=decodeURIComponent(raw).replace(/^\/+/, '');
      const filepath=resolve(root,rel);
      if(filepath!==root && !filepath.startsWith(root+sep)){res.writeHead(403);res.end();return;}
      const bytes=await readFile(filepath);
      res.writeHead(200,{'Content-Type':mime[extname(filepath).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(bytes);
    }catch(e){res.writeHead(404);res.end('File not found');}
  });
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
  return {server,url:`http://127.0.0.1:${server.address().port}/${encodeURIComponent(basename(html))}`};
}
async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) {
    console.log('node render_video.mjs --html animation.html --seconds 12 --width 1080 --height 1920 --fps 24 --output final.mp4 [--preview] [--audio voice.wav --audio-kind narration|music] [--keep-frames] [--overwrite]');
    return;
  }
  for (const key of ['html','seconds','width','height','output']) need(o[key],`Required: --${key}`);
  const html=resolve(o.html), output=resolve(o.output);
  const seconds=Number(o.seconds), width=Number(o.width), height=Number(o.height), fps=Number(o.fps||24);
  need(existsSync(html), `HTML source does not exist: ${html}`);
  need(Number.isFinite(seconds) && seconds >= .1 && seconds <= 600, 'Duration must be 0.1-600 seconds.');
  need(Number.isInteger(width) && Number.isInteger(height) && width>=64 && width<=4096 && height>=64 && height<=4096, 'Unsupported render dimensions.');
  need(Number.isFinite(fps) && Number.isInteger(fps) && fps>=1 && fps<=60, 'FPS must be integer 1..60.');
  const n=Math.round(seconds*fps), actual=n/fps;
  need(n>=1, 'No frames to render.');
  if (existsSync(output) && !o.preview && !o.overwrite) throw new Error(`Output exists; use another filename or --overwrite explicitly: ${output}`);
  const audio=o.audio?resolve(o.audio):null;
  const audioKind=o['audio-kind']||'narration';
  need(['narration','music'].includes(audioKind),'--audio-kind must be narration or music');
  if(audio){
    need(existsSync(audio),`Audio file is missing: ${audio}`);
    program('ffprobe');
    const meta=probe(audio);
    need(meta.streams.some(x=>x.codec_type==='audio'),`No audio stream found: ${audio}`);
    const duration=Number(meta.format?.duration||meta.streams.find(x=>x.codec_type==='audio')?.duration||0);
    if(audioKind==='narration' && duration>actual + 0.015) throw new Error(`Narration is ${duration.toFixed(3)}s but video is ${actual.toFixed(3)}s. Extend --seconds; will not cut speech.`);
  }
  if(!o.preview){program('ffmpeg');program('ffprobe');}
  const projectRequire=createRequire(resolve(process.cwd(),'package.json'));
  let playwright;
  try{playwright=projectRequire('playwright');}
  catch(e){
    try{playwright=projectRequire('playwright-core');}
    catch(_){
      if(process.env.PLAYWRIGHT_MODULE_PATH){playwright=projectRequire(resolve(process.env.PLAYWRIGHT_MODULE_PATH));}
      else throw new Error('Playwright is not installed in the working project. Run: npm install --save-dev playwright && npx playwright install chromium');
    }
  }
  mkdirSync(dirname(output),{recursive:true});
  const previewsDir=join(dirname(output),'previews');
  mkdirSync(previewsDir,{recursive:true});
  const reportPath=join(dirname(output),'render_report.json');
  const report={source:html,output, mode:o.preview?'preview':'final', width,height,fps,requested_seconds:seconds,frames:n,actual_seconds:actual,audio:audio||null,audio_kind:audio?audioKind:null,status:'starting',started_at:new Date().toISOString(),preview_frames:[]};
  let browser,framesDir, tempVideo, localServer;
  try{
    const chromeExecutable=process.env.CHROME_EXECUTABLE?resolve(process.env.CHROME_EXECUTABLE):undefined;
    if(chromeExecutable) need(existsSync(chromeExecutable),`CHROME_EXECUTABLE does not exist: ${chromeExecutable}`);
    browser=await playwright.chromium.launch({headless:true,...(chromeExecutable?{executablePath:chromeExecutable}:{}),args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce'});
    let page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e).slice(0,500)));
    // A skill pack shouldn't retrieve fonts, scripts, or assets from the internet without consent.
    localServer=await openLocalServer(html);
    const localOrigin=new URL(localServer.url).origin;
    await page.route('**/*', route => {
      const requested=new URL(route.request().url());
      return requested.origin===localOrigin ? route.continue() : route.abort('blockedbyclient');
    });
    try{
      await page.goto(localServer.url,{waitUntil:'load',timeout:30000});
    }catch(navErr){
      if(!String(navErr).includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw navErr;
      // Some managed browsers block even localhost. Inline-only HTML can still work via setContent.
      report.browser_fallback='setContent: managed Chromium blocked localhost; inline-only HTML fallback';
      await page.close();
      page=await context.newPage();
      page.on('pageerror',e=>errors.push(String(e).slice(0,500)));
      await page.route('**/*', route => route.abort('blockedbyclient'));
      await page.setContent(readFileSync(html,'utf8'),{waitUntil:'load',timeout:30000});
    }
    await page.waitForFunction('window.ready === true && typeof window.renderFrame === "function"',null,{timeout:60000});
    await page.evaluate('document.fonts && document.fonts.ready');
    async function frame(f,path) {
      await page.evaluate(async f=>{await window.renderFrame(f);},f);
      if(errors.length) throw new Error(`Browser JavaScript error: ${errors.slice(0,3).join(' | ')}`);
      await page.screenshot({path,type:'png',animations:'disabled',fullPage:false});
    }
    const points=[1,Math.max(1,Math.round(n*.10)),Math.max(1,Math.round(n*.40)),Math.max(1,Math.round(n*.90)),n];
    if(o.preview){
      for(const f of [...new Set(points)]){
        const name=`frame_${String(f).padStart(6,'0')}.png`;
        const out=join(previewsDir,name);
        await frame(f,out);
        report.preview_frames.push(out);
      }
      report.status='previews_created';
      report.note='Preview is NOT an MP4. Review images and run without --preview for final export.';
      console.log(`Preview complete: ${report.preview_frames.length} frames in ${previewsDir}`);
    } else {
      framesDir=o['keep-frames']?join(dirname(output),'frames'):mkdtempSync(join(tmpdir(),'animationstudio-frames-'));
      mkdirSync(framesDir,{recursive:true});
      for(let f=1; f<=n; f++){
        const name=`frame_${String(f).padStart(6,'0')}.png`;
        const dest=join(framesDir,name);
        await frame(f,dest);
        if(points.includes(f)){
          const preview=join(previewsDir,name);
          copyFileSync(dest,preview);
          report.preview_frames.push(preview);
        }
        if(f % 48===0 || f===n) console.log(`Rendered ${f}/${n} frames`);
      }
      tempVideo=join(dirname(output),`.animationstudio_${process.pid}_silent.mp4`);
      await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-start_number','1','-i',join(framesDir,'frame_%06d.png'),'-frames:v',String(n),'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',tempVideo]);
      if(audio){
        const mux=['-hide_banner','-loglevel','error','-y','-i',tempVideo];
        if(audioKind==='music') mux.push('-stream_loop','-1');
        mux.push('-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(actual),'-movflags','+faststart',output);
        await run('ffmpeg',mux);
      } else renameSync(tempVideo,output);
      need(existsSync(output) && statSync(output).size>4096,`Output MP4 missing or empty: ${output}`);
      const m=probe(output);
      const v=m.streams.find(s=>s.codec_type==='video');
      need(v && v.codec_name==='h264',`Wrong video codec: ${v?.codec_name}`);
      need(v.width===width && v.height===height,`Wrong resolution: ${v.width}x${v.height}`);
      const rate=String(v.avg_frame_rate||'').split('/').map(Number);
      if(rate.length===2 && rate[1]) need(Math.abs(rate[0]/rate[1]-fps)<.02,'Frame-rate validation failed.');
      const duration=Number(m.format.duration||0);
      need(Math.abs(duration-actual)<Math.max(.20,1/fps*2),`Unexpected length: ${duration}s vs ${actual}s`);
      if(audio) need(m.streams.some(x=>x.codec_type==='audio'),'Audio stream not muxed');
      report.status='verified_mp4';
      report.verified={codec:v.codec_name, width:v.width,height:v.height,duration_seconds:duration, fps:v.avg_frame_rate,has_audio:m.streams.some(x=>x.codec_type==='audio'),bytes:statSync(output).size};
      console.log(`Verified: ${output} (${width}x${height}, ${duration.toFixed(2)}s)`);
    }
  }catch(err){report.status='failed';report.error=String(err.stack||err);throw err;}
  finally{
    report.finished_at=new Date().toISOString();
    writeFileSync(reportPath,JSON.stringify(report,null,2));
    if(browser) await browser.close().catch(()=>{});
    if(localServer) await new Promise(resolve=>localServer.server.close(resolve));
    if(framesDir && !o['keep-frames']) rmSync(framesDir,{recursive:true,force:true});
    if(tempVideo && existsSync(tempVideo)) rmSync(tempVideo,{force:true});
  }
}
main().catch(e=>{console.error(`Render failed: ${e.message}`);process.exitCode=1;});
