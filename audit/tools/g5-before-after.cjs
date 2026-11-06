// G5 before/after screenshots: the same recorded draws rendered by two checkouts of the app.
// Usage: NODE_PATH=<playwright> node audit/tools/g5-before-after.cjs <before-root> <after-root> <out-dir>
// Draws: S3 (audit/samples/celtic/draw-record.json) and a clarifier-heavy Seven V. Reduced motion, so the
// final geometry is captured. Writes <out-dir>/<before|after>-<draw>-<width>.png.
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [BEFORE, AFTER, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const serve = root => new Promise(res => { const s = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1', () => res(s)); });
const s3 = JSON.parse(fs.readFileSync(path.join(AFTER, 'audit/samples/celtic/draw-record.json'), 'utf8'));
const DRAWS = {
  'S3-celtic': { spreadId: 'celtic', base: s3.positions.map(p => p.card.id), c1: s3.positions.map(p => p.clarifier1 ? p.clarifier1.id : null), c2: s3.positions.map(p => p.clarifier2 ? p.clarifier2.id : null),
    reversed: s3.positions.flatMap(p => [p.card, p.clarifier1, p.clarifier2]).filter(c => c && c.orientation === 'reversed').map(c => c.id) },
  'seven-heavy': { spreadId: 'seven', base: [0, 1, 2, 3, 4, 5, 6], c1: [10, 11, 12, 13, 14, 15, 16], c2: [40, 41, 42, 43, 44, 45, 46], reversed: [0, 10, 46] }
};
(async () => {
  const browser = await chromium.launch();
  for (const [label, root] of [['before', BEFORE], ['after', AFTER]]) {
    const srv = await serve(root);
    for (const [name, d] of Object.entries(DRAWS)) for (const width of [1280, 390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await page.goto(`http://127.0.0.1:${srv.address().port}/presenter-uat.html`);
      await page.evaluate(d => { const at = '2026-11-06T01:00:00.000Z';
        Object.assign(state, { spreadId: d.spreadId, spreadSize: d.base.length, drawnCardIds: d.base, drawnAt: at, drawnOrientations: { readingAt: at, reversed: d.reversed }, drawSettled: true, drawPhase: 'settled',
          clarifierReadingAt: at, firstLayerClarifiers: d.c1, additionalClarifierReadingAt: at, additionalClarifierLayers: [{ number: 2, cards: d.c2 }] }); go('draw'); }, d);
      await page.waitForTimeout(700);
      await page.locator('.spread-scroll').screenshot({ path: path.join(OUT, `${label}-${name}-${width}.png`) });
      await page.close();
    }
    srv.close();
  }
  await browser.close();
  console.log('done:', fs.readdirSync(OUT).length, 'screenshots');
})();
