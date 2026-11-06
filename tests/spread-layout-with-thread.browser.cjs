/* Spread layouts survive the Golden Thread overlay (Issue #49 audit, 6 Nov 2026).
 * The connector inserts <svg class="gtc-overlay"> and <canvas class="gtc-sparkle"> as the board's first
 * children; position rules written with :nth-child shifted every position by two, scrambling the Celtic
 * Cross, Relationship and Seven V on presenter-uat.html. Checks each position's computed placement at
 * desktop width, with the thread mounted, on both pages.
 * Run: node tests/spread-layout-with-thread.browser.cjs   Requires: playwright + chromium */
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
// [row, column] per position, from reading-stage.css.
const EXPECT = {
  celtic: [[2, 2], [2, 3], [3, 2], [2, 1], [1, 2], [2, 4], [4, 5], [3, 5], [2, 5], [1, 5]],
  relationship: [[1, 1], [1, 3], [1, 2], [2, 1], [2, 3]]
};
const SEVEN_MARGINS = [0, 60, 120, 180, 120, 60, 0];
server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch();
  let pass = 0, fail = 0;
  const check = async (name, fn) => { try { await fn(); console.log('PASS ', name); pass++; } catch (e) { console.log('FAIL ', name, '—', e.message); fail++; } };
  for (const pageName of ['presenter-uat.html', 'index.html']) for (const spreadId of ['celtic', 'relationship', 'seven']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:${server.address().port}/${pageName}`);
    await page.evaluate(s => { const at = '2026-11-06T01:00:00.000Z'; const n = { celtic: 10, relationship: 5, seven: 7 }[s];
      Object.assign(state, { spreadId: s, spreadSize: n, drawnCardIds: Array.from({ length: n }, (_, i) => 22 + i), drawnAt: at, drawnOrientations: { readingAt: at, reversed: [] }, drawSettled: true, drawPhase: 'settled', clarifierReadingAt: null, firstLayerClarifiers: [], additionalClarifierReadingAt: null, additionalClarifierLayers: [] }); go('draw'); }, spreadId);
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => { const b = document.querySelector('.spread-board');
      return { overlay: !!b.querySelector(':scope > svg.gtc-overlay'), firstChild: b.firstElementChild.tagName.toLowerCase(),
        cells: [...b.querySelectorAll(':scope > .reading-position')].map(p => { const s = getComputedStyle(p); return { row: s.gridRowStart, col: s.gridColumnStart, mt: parseFloat(s.marginTop) }; }) }; });
    await check(`${pageName} · ${spreadId}: every position in its intended place${info.overlay ? ' (thread overlay mounted)' : ''}`, async () => {
      if (pageName === 'presenter-uat.html') assert.ok(info.overlay && info.firstChild === 'svg', 'thread overlay is the first child');
      if (EXPECT[spreadId]) EXPECT[spreadId].forEach(([r, c], i) => assert.deepEqual([info.cells[i].row, info.cells[i].col], [String(r), String(c)], `position ${i + 1}`));
      else SEVEN_MARGINS.forEach((m, i) => assert.equal(info.cells[i].mt, m, `position ${i + 1} V offset`));
    });
    await page.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
