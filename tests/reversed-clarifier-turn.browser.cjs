/* Reversed clarifiers stay upside down after their turn (Issue #49 audit, 6 Nov 2026).
 * The clarifier fold-in animation holds its last frame; without reversals.css's reversed keyframes
 * a reversed clarifier's picture landed upright while its label said "reversed".
 * Run: node tests/reversed-clarifier-turn.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r);
});
server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch();
  let pass = 0, fail = 0;
  for (const pageName of ['index.html', 'presenter-uat.html']) for (const motion of ['no-preference', 'reduce']) {
    const name = `${pageName} (${motion}): reversed clarifiers 1 and 2 are upside down after turning`;
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: motion });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/${pageName}`);
      await page.evaluate(() => { const at = '2026-11-06T01:00:00.000Z'; Object.assign(state, { spreadId: 'guidance', spreadSize: 1, drawnCardIds: [0], drawnAt: at, drawnOrientations: { readingAt: at, reversed: [17, 56] }, drawSettled: true, drawPhase: 'settled', clarifierReadingAt: null, firstLayerClarifiers: [], additionalClarifierReadingAt: null, additionalClarifierLayers: [] }); go('draw'); });
      await page.waitForTimeout(500);
      await page.evaluate(() => { state.clarifierReadingAt = state.drawnAt; state.firstLayerClarifiers = [17]; renderDraw(); });
      await page.waitForTimeout(5000);
      await page.evaluate(() => { state.additionalClarifierReadingAt = state.drawnAt; state.additionalClarifierLayers = [{ number: 2, cards: [56] }]; clarifierTurnPending = true; try { renderDraw(); } finally { clarifierTurnPending = false; } });
      await page.waitForTimeout(5000);
      const t = await page.evaluate(() => [...document.querySelectorAll('.position-clarifier.is-reversed img')].map(i => getComputedStyle(i).transform));
      assert.equal(t.length, 2, 'two reversed clarifiers on screen');
      t.forEach(m => assert.equal(m, 'matrix(-1, 0, 0, -1, 0, 0)', 'picture rotated 180°'));
      console.log('PASS ', name); pass++;
    } catch (e) { console.log('FAIL ', name, '—', e.message); fail++; }
    await page.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
