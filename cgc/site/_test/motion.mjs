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
  // Concept films: the S1 scrub ran to the end and S2 loaded, or, with reduced motion, both stay stills.
  const films = await page.evaluate(() => ({scrub: document.querySelector('#build').classList.contains('scrub'), bar: parseFloat(document.querySelector('.build-bar span').style.width) || 0, walk: !!document.querySelector('.walk-film video').getAttribute('src')}));
  const filmsOk = name === 'reduced' ? !films.scrub && !films.walk : films.scrub && films.bar > 0 && films.walk;
  // Before/after slider: mouse hover moves the divider on desktop; a phone tap must not.
  let slider = true;
  if (name !== 'reduced') {
    await page.evaluate(() => document.querySelector('#concept-panel-0 .comparison').scrollIntoView({behavior: 'instant', block: 'center'})); await page.waitForTimeout(3000);
    const box = await page.locator('#concept-panel-0 .comparison').boundingBox(), val = () => page.evaluate(() => +document.querySelector('#compare-0').value);
    if (name === 'desktop') { await page.mouse.move(box.x + box.width * .85, box.y + box.height / 2); await page.waitForTimeout(800); slider = await val() > 75; }
    else { const v0 = await val(); await page.touchscreen.tap(box.x + box.width * .2, box.y + box.height / 2); await page.waitForTimeout(600); slider = await val() === v0; }
  }
  const ok = slider && hidden.length === 0 && errors.length === 0 && filmsOk && (name !== 'reduced' || total === 0);
  failed ||= !ok;
  console.log(name, ok ? 'PASS' : 'FAIL', {slider, films, reveal: total, stillHidden: hidden.slice(0, 5), errors: errors.slice(0, 5)});
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
