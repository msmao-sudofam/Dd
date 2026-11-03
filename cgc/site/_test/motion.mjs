// Scroll-reveal check: after scrolling the whole page every .rv element is revealed, nothing stays hidden
// with reduced motion, and the console stays clean. URL defaults to the dev server on :4173.
import {chromium} from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({channel: 'chrome', headless: true});
let failed = false;
for (const [name, opts] of [['desktop', {viewport: {width: 1440, height: 900}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}], ['reduced', {viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}]]) {
  const page = await browser.newPage(opts), errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL, {waitUntil: 'load'});
  const total = await page.evaluate(() => document.querySelectorAll('.rv').length);
  for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
  await page.waitForTimeout(1200);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.rv:not(.in)')].filter(e => !e.closest('[hidden],details:not([open])') &&getComputedStyle(e).opacity < 0.99).map(e => e.className + ' ' + (e.textContent || '').trim().slice(0, 30)));
  const ok = hidden.length === 0 && errors.length === 0 && (name !== 'reduced' || total === 0);
  failed ||= !ok;
  console.log(name, ok ? 'PASS' : 'FAIL', {reveal: total, stillHidden: hidden.slice(0, 5), errors: errors.slice(0, 5)});
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
