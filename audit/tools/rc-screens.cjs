// Release-candidate screens (Chas / Si Aye directive, 9 Nov 2026, item 2.3-2.4): all five spreads at Samsung
// widths (360x780, 412x915, touch, 2x), on the app code in APP_ROOT (a clean checkout of APP_SHA). For each spread
// it loads a recorded QA sample with clarifiers (qa-loader.js) and captures:
//   1. the spread board, with each clarifier in its slot under its card;
//   2. the first clarified position's reading ("Together");
//   3. the Golden Thread (top 1600 CSS px);
//   4. Max's player open, with the Clarify / Finish controls.
// And checks: no horizontal page scroll; every card fully inside the viewport width; Max's Clarify and Finish
// controls visible on screen; no page errors. Screens are what the page renders, not audio.
// Usage: NODE_PATH=<playwright> APP_ROOT=<checkout> APP_SHA=<sha> node audit/tools/rc-screens.cjs <out-dir>
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const APP = path.resolve(process.env.APP_ROOT || path.join(__dirname, '..', '..'));
const SHA = process.env.APP_SHA || '(unknown)';
const OUT = path.resolve(process.argv[2]); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => { const f = path.join(APP, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const SPREADS = [['one-card', 'B01'], ['three-card', 'TC-04'], ['relationship', 'RC-02'], ['seven-card', 'SC-01A'], ['celtic-cross', 'B06']];
const SIZES = [[360, 780], [412, 915]];
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }];
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak() {}, cancel() {}, pause() {}, resume() {}, speaking: false }, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const report = { appCommit: SHA, cases: [] };
  for (const [spread, sid] of SPREADS) for (const [w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const name = k => `${spread}-${sid}-${w}-${k}.png`;
    await page.goto(base + '/presenter-uat.html?qa=' + sid); await page.waitForSelector('#qaBanner');
    await page.evaluate(() => document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; }));
    await page.waitForTimeout(400);
    const geo = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const cardsOut = [...document.querySelectorAll('.spread-board img')].filter(i => { const r = i.getBoundingClientRect(); return r.width && (r.left < -0.5 || r.right > vw + 0.5); }).length;
      const slots = [...document.querySelectorAll('.position-clarifiers')].map(s => s.querySelectorAll('img').length);
      return { horizontalScroll: document.documentElement.scrollWidth > vw + 1, cardsOutsideWidth: cardsOut, clarifierSlotsWithCards: slots.filter(n => n > 0).length, clarifierCards: slots.reduce((a, b) => a + b, 0) };
    });
    await page.locator('.spread-board').screenshot({ path: path.join(OUT, name('1-spread')) });
    const clarified = page.locator('.reading-meaning:has(.synthesis-lead)').first();
    if (await clarified.count()) await clarified.screenshot({ path: path.join(OUT, name('2-together')) });
    const tb = await page.evaluate(() => { const e = document.querySelector('.reading-golden-thread'); if (!e) return null; const r = e.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
    if (tb && tb.h) await page.screenshot({ path: path.join(OUT, name('3-golden-thread')), fullPage: true, clip: { x: 0, y: tb.y, width: w, height: Math.min(tb.h, 1600) } });
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player'); await page.waitForTimeout(500);
    const max = await page.evaluate(() => {
      const vis = id => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; };
      return { clarifyVisible: vis('mcClarifyGo'), finishVisible: vis('mcFinish'), playVisible: vis('mcPlay'), clarifyLabel: document.getElementById('mcClarifyGo')?.textContent.trim() || null, horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
    });
    await page.screenshot({ path: path.join(OUT, name('4-max')) });
    const c = { spread, sample: sid, width: w, height: h, ...geo, max, errors };
    report.cases.push(c); console.log(JSON.stringify(c));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'rc-screens.json'), JSON.stringify(report, null, 1));
  await browser.close(); server.close();
});
