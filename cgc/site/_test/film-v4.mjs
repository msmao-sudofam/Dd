// Threshold v4 hero playback smoke test (desktop + phone + reduced motion). Needs `npm run dev:crm` on :4173.
import {chromium} from 'playwright';
const URL = 'http://127.0.0.1:4173/';
const browser = await chromium.launch({channel: 'chrome', headless: true});
const out = {};
for (const [name, opts] of [['desktop', {viewport: {width: 1440, height: 900}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}], ['reduced', {viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}]]) {
  const ctx = await browser.newContext(opts); const page = await ctx.newPage();
  const errors = [], media = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  page.on('response', r => { if (/assets\/film\//.test(r.url())) media.push(`${r.status()} ${r.url().split('/assets/film/')[1]}`); });
  await page.goto(URL); await page.waitForTimeout(4000);
  const v = page.locator('#intro-film');
  const s1 = await v.evaluate(e => ({src: e.currentSrc.split('/assets/film/')[1] || '', t: e.currentTime, paused: e.paused, w: e.videoWidth, h: e.videoHeight}));
  await page.waitForTimeout(3000);
  const t2 = await v.evaluate(e => e.currentTime);
  await page.screenshot({path: `_test/results/film-v4-${name}.png`});
  const r = {start: s1, advanced: +(t2 - s1.t).toFixed(2), chapter: await page.locator('#film-chapter').textContent(), errors, media: [...new Set(media)]};
  if (name !== 'reduced') {
    await page.locator('#film-toggle').click(); await page.waitForTimeout(500);
    const ta = await v.evaluate(e => e.currentTime); await page.waitForTimeout(1000);
    r.pausedAfterToggle = await v.evaluate(e => e.paused) && (await v.evaluate(e => e.currentTime)) === ta;
    await page.locator('#film-captions').click(); await page.waitForTimeout(300);
    r.captionsMode = await v.evaluate(e => e.textTracks[0] && e.textTracks[0].mode);
    await page.locator('#film-toggle').click(); await page.waitForTimeout(500);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', {value: true, configurable: true}); Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true}); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(500); r.pausedWhenHidden = await v.evaluate(e => e.paused);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', {value: false, configurable: true}); Object.defineProperty(document, 'visibilityState', {value: 'visible', configurable: true}); document.dispatchEvent(new Event('visibilitychange')); });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(800);
    r.pausedOffscreen = await v.evaluate(e => e.paused);
  }
  out[name] = r; await ctx.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close();
