// Browser check (Playwright): heading wrap + reduced-motion scrolling/shuffle.
// Not matched by tests/*.test.cjs; run with: node tests/reduced-motion-headings.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
const LABELS = '.slot-label,.reading-card-front strong,.position-clarifier strong,.detail-title h1';
function midWordBreaks(selector) {
  const bad = [];
  for (const el of document.querySelectorAll(selector)) {
    if (!el.getBoundingClientRect().width) continue;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let node;
    while ((node = walker.nextNode())) {
      const re = /\S+/g; let m;
      while ((m = re.exec(node.data))) {
        let prev = null;
        for (let i = 0; i < m[0].length; i++) {
          const r = document.createRange(); r.setStart(node, m.index + i); r.setEnd(node, m.index + i + 1);
          const top = Math.round(r.getClientRects()[0]?.top ?? NaN);
          // A break is acceptable after a dash, or where the browser inserted a hyphen (hyphens:auto).
          if (prev !== null && top !== prev && !/[-–—\/]/.test(m[0][i - 1]) && getComputedStyle(el).hyphens !== 'auto') bad.push(`${m[0].slice(0, i)}|${m[0].slice(i)}`);
          if (prev !== null && top !== prev && getComputedStyle(el).hyphens === 'auto' && m[0].length < 9 && !/[-–—\/]/.test(m[0][i - 1])) bad.push(`short word split ${m[0]}`);
          prev = top;
        }
      }
    }
  }
  return bad;
}
(async () => {
  await new Promise(r => server.listen(8767, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const width of [320, 390, 768, 1024, 1180, 1280, 1440, 1920]) for (const motion of ['reduce', 'no-preference']) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: motion });
      await ctx.addInitScript(require('./helpers/majors-first.cjs')); // two clarifiers available under the rule
      await ctx.addInitScript(() => {
        window.__smooth = 0;
        const st = window.scrollTo.bind(window); window.scrollTo = (a, b) => { if (a?.behavior === 'smooth') window.__smooth++; return st(a, b); };
        const si = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function (a) { if (a?.behavior === 'smooth') window.__smooth++; return si.call(this, a); };
      });
      const page = await ctx.newPage();
      const check = async (name, fn) => { try { await fn(); } catch (e) { failures.push(`${width}/${motion} ${name}: ${e.message.replace(/\s+/g,' ').slice(0,300)}`); } };
      await page.goto('http://127.0.0.1:8767/');
      await page.locator('.home-actions [data-go="reading"]').click();
      await page.locator('[data-spread="seven"]').click();
      const t = Date.now();
      await page.locator('#shuffleCardsBtn').click();
      await page.waitForFunction(() => !document.getElementById('shuffleCardsBtn').disabled);
      const shuffleMs = Date.now() - t;
      await page.locator('#stageDrawBtn').click();
      await page.waitForFunction(() => state.drawSettled === true);
      await page.locator('#primaryClarifierAction').click();
      await page.locator('#primaryClarifierAction').click();
      await page.locator('#backToReadingTop').click();
      if (motion === 'reduce') {
        await check('no smooth scroll under reduced motion', async () => assert.equal(await page.evaluate(() => window.__smooth), 0));
        await check('shuffle does not hold the user for an invisible animation', async () => assert.ok(shuffleMs < 500, `${shuffleMs}ms`));
      }
      for (const [spreadId, ids] of [['seven', [76, 75, 70, 2, 10, 57, 77]], ['celtic', [76, 75, 70, 2, 10, 57, 77, 74, 62, 12]]]) {
        await page.evaluate(({ spreadId, ids }) => {
          Object.assign(state, { spreadId, spreadSize: ids.length, drawnCardIds: ids, drawnAt: '2026-10-25T00:00:00.000Z', view: 'draw', drawSettled: true, clarifierReadingAt: '2026-10-25T00:00:00.000Z', firstLayerClarifiers: [62, 61, 48, 5, 12, 74, 34, 13, 15, 16].slice(0, ids.length), additionalClarifierReadingAt: '2026-10-25T00:00:00.000Z', additionalClarifierLayers: [{ number: 2, cards: [6, 9, 17, 18, 20, 21, 19, 3, 4, 7].slice(0, ids.length) }] });
          render();
        }, { spreadId, ids });
        await check(`${spreadId} labels break only between words`, async () => assert.deepEqual(await page.evaluate(midWordBreaks, LABELS), []));
        await check(`${spreadId} no horizontal page overflow`, async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false));
      }
      await page.evaluate(() => openCard(77, 'draw', 6));
      await check('detail title breaks only between words', async () => assert.deepEqual(await page.evaluate(midWordBreaks, LABELS), []));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (failures.length) { console.error(failures.join('\n')); console.error(`FAIL ${failures.length}`); process.exit(1); }
  console.log('PASS reduced-motion + heading-wrap browser checks (8 widths x 2 motion prefs)');
})();
