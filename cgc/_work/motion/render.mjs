// motion-studio render.mjs, Windows adaptations: playwright from site/node_modules, temp dir via os.tmpdir, numbered
// contact-sheet frames (Windows ffmpeg has no glob), and hardware GL instead of swiftshader.
import { chromium } from '../../site/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : (a[i + 1] === undefined || a[i + 1].startsWith('--') ? true : a[i + 1]); };
const [scene, out] = a;
if (!scene || !out) { console.error('usage: node render.mjs scene.html out.mp4 [opts]'); process.exit(1); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const root = path.dirname(path.resolve(scene));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const size = fs.statSync(f).size, range = req.headers.range, type = MIME[path.extname(f)] || 'application/octet-stream';
  if (range) { const [s, e] = range.replace('bytes=', '').split('-'); const st = +s, en = e ? +e : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${st}-${en}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': en - st + 1 });
    return fs.createReadStream(f, { start: st, end: en }).pipe(res); }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const URL0 = `http://127.0.0.1:${server.address().port}/${path.basename(scene)}`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page0 = await browser.newPage(); await page0.goto(URL0);
const S = await page0.evaluate(() => window.SCENE || {}); await page0.close();
const W = +opt('w', S.width || 1080), H = +opt('h', S.height || 1920), FPS = +opt('fps', S.fps || 30);
const DUR = +opt('dur', S.duration || 10), FROM = +opt('from', 0), TO = +opt('to', DUR);
const alpha = !!opt('alpha', false), preview = +opt('preview', 0);
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(URL0 + '?render');
await page.waitForFunction(() => typeof window.renderFrame === 'function' && (window.READY === undefined || window.READY === true), null, { timeout: 60000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
const shot = async (t) => {
  await page.evaluate(async (t) => { await window.renderFrame(t); await new Promise(r => requestAnimationFrame(() => r())); }, t);
  return page.screenshot({ type: alpha ? 'png' : 'jpeg', quality: alpha ? undefined : 95, omitBackground: alpha });
};
const ff = (args) => new Promise((res, rej) => spawn('ffmpeg', args, { stdio: 'inherit' }).on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
if (preview) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prev-'));
  for (let i = 0; i < preview; i++) fs.writeFileSync(path.join(dir, `p${String(i).padStart(3, '0')}.jpg`), await shot(FROM + (TO - FROM) * (i + 0.5) / preview));
  const cols = Math.min(preview, W > H ? 3 : 4), rows = Math.ceil(preview / cols);
  await ff(['-v', 'error', '-y', '-i', path.join(dir, 'p%03d.jpg'), '-vf', `scale=${W > H ? 480 : 270}:-1,tile=${cols}x${rows}:padding=6:color=0x222222`, '-frames:v', '1', out.replace(/\.\w+$/, '.jpg')]);
  console.log('preview ->', out.replace(/\.\w+$/, '.jpg')); await browser.close(); server.close(); process.exit(0);
}
const enc = alpha ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le']
  : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
const p = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', alpha ? 'png' : 'mjpeg', '-i', '-', ...enc, '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round((TO - FROM) * FPS), t0 = Date.now();
for (let i = 0; i < n; i++) { const buf = await shot(FROM + i / FPS); if (!p.stdin.write(buf)) await new Promise(r => p.stdin.once('drain', r));
  if (i % FPS === 0) process.stdout.write(`\r${i}/${n} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
p.stdin.end(); await new Promise(r => p.on('close', r));
console.log(`\n${out}  ${W}x${H}@${FPS}  ${n} frames`); await browser.close(); server.close();
