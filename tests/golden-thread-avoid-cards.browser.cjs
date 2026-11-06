/* Golden Thread G5 (Issue #49): no strand crosses another card's picture, in every spread.
 * Run: node tests/golden-thread-avoid-cards.browser.cjs   Requires: playwright + chromium
 * On presenter-uat.html (where the live thread runs), for each spread × width (360, 390, 1280) × draw
 * (clarifier-heavy and plain): renders the reading, then samples every strand and the entry strand along
 * its real SVG path every 2 px and counts
 *   - picture crossings: inside another card's picture (main or clarifier), the two joined cards excluded
 *     → must be 0 with avoidCards on;
 *   - text crossings: over titles / captions / buttons of other positions → reported, not asserted.
 * The same layout is also measured with avoidCards switched off ("before"), so both come from one run.
 * Writes test-results/golden-thread-avoid-cards.json. */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const SPREADS = { guidance: 1, three: 3, relationship: 5, seven: 7, celtic: 10 };
// Clarifier-heavy: Majors in every base and clarifier-1 slot, so every position has two clarifiers.
// Plain: Minors only, no clarifiers.
function draw(kind, n) {
  if (kind === 'plain') return { base: Array.from({ length: n }, (_, i) => 22 + i * 5), c1: [], c2: [], reversed: [22 + 5] };
  const base = Array.from({ length: n }, (_, i) => i), c1 = Array.from({ length: n }, (_, i) => 10 + i), c2 = Array.from({ length: n }, (_, i) => 40 + i);
  return { base, c1, c2, reversed: [base[0], c1[0], c2[n - 1]] };
}
const MEASURE = () => {
  const board = document.querySelector('.spread-board'), svg = board && board.querySelector('svg.gtc-overlay');
  if (!svg) return null;
  const base = svg.getBoundingClientRect();
  const pos = [...board.querySelectorAll(':scope > .reading-position')];
  const pics = [];
  pos.forEach((el, i) => {
    const m = el.querySelector('.reading-card-front img'); if (m) pics.push({ id: `main:${i}`, pos: i, r: m.getBoundingClientRect() });
    el.querySelectorAll('.position-clarifier > img').forEach((img, k) => pics.push({ id: `main:${i}:clarifier:${k + 1}`, pos: i, r: img.getBoundingClientRect() }));
  });
  const textSel = '.slot-label, .reading-card-front strong, .position-clarifier > strong, .clarifier-layer-label, .clarify-choice, .position-clarifier-slot strong';
  const texts = [];
  pos.forEach((el, i) => el.querySelectorAll(textSel).forEach(t => { const r = t.getBoundingClientRect(); if (r.width > 1) texts.push({ pos: i, r }); }));
  const ends = key => {
    if (key === 'enter') return { ids: ['main:0'], pos: [0] };
    let m = /^main:(\d+):clarifier:(\d+)$/.exec(key); if (m) return { ids: [`main:${m[1]}`, key], pos: [+m[1]] };
    m = /^main:(\d+):next:(\d+)$/.exec(key);
    if (m) { const from = pics.filter(x => x.id.startsWith(`main:${m[1]}:clarifier:`)).map(x => x.id).sort().pop() || `main:${m[1]}`; return { ids: [from, `main:${m[2]}`], pos: [+m[1], +m[2]] }; }
    return { ids: [], pos: [] };
  };
  const strands = [...svg.querySelectorAll('[data-gtc-key], [data-gtc-ring="enter"]')].map(g => {
    const key = g.getAttribute('data-gtc-key') || 'enter', path = g.querySelector('path'), len = path.getTotalLength(), e = ends(key);
    let picPx = 0, textPx = 0; const over = new Set();
    for (let s = 0; s <= len; s += 2) {
      const p = path.getPointAtLength(s), x = base.left + p.x, y = base.top + p.y;
      if (pics.some(pc => !e.ids.includes(pc.id) && x > pc.r.left + 2 && x < pc.r.right - 2 && y > pc.r.top + 2 && y < pc.r.bottom - 2 && over.add(pc.id))) picPx += 2;
      if (texts.some(t => !e.pos.includes(t.pos) && x > t.r.left && x < t.r.right && y > t.r.top && y < t.r.bottom)) textPx += 2;
    }
    return { key, len: Math.round(len), picPx, textPx, over: [...over] };
  });
  return { strands, overflow: document.documentElement.scrollWidth > innerWidth, boardH: Math.round(board.getBoundingClientRect().height) };
};
server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch();
  const results = []; let pass = 0, fail = 0;
  for (const [spreadId, n] of Object.entries(SPREADS)) for (const width of [360, 390, 1280]) for (const kind of ['heavy', 'plain']) {
    const name = `${spreadId} @${width} ${kind}`;
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/presenter-uat.html`);
      const d = draw(kind, n);
      await page.evaluate(([s, n, d]) => { const at = '2026-11-06T01:00:00.000Z';
        Object.assign(state, { spreadId: s, spreadSize: n, drawnCardIds: d.base, drawnAt: at, drawnOrientations: { readingAt: at, reversed: d.reversed }, drawSettled: true, drawPhase: 'settled',
          clarifierReadingAt: d.c1.length ? at : null, firstLayerClarifiers: d.c1, additionalClarifierReadingAt: d.c2.length ? at : null, additionalClarifierLayers: d.c2.length ? [{ number: 2, cards: d.c2 }] : [] });
        go('draw'); }, [spreadId, n, d]);
      await page.waitForTimeout(500);
      const after = await page.evaluate(MEASURE);
      // Same layout, router off: what the thread did before G5.
      const before = await page.evaluate(m => { const c = window.__gtLive.connector; c.options.avoidCards = false; c._render(false); return (0, eval)('(' + m + ')')(); }, MEASURE.toString());
      await page.evaluate(() => { const c = window.__gtLive.connector; c.options.avoidCards = true; c._render(false); });
      const sum = (m, k) => m.strands.reduce((a, s) => a + s[k], 0);
      const row = { spread: spreadId, width, kind, strands: after.strands.length,
        before: { strandsOverPictures: before.strands.filter(s => s.picPx).length, picturePx: sum(before, 'picPx'), textPx: sum(before, 'textPx') },
        after: { strandsOverPictures: after.strands.filter(s => s.picPx).length, picturePx: sum(after, 'picPx'), textPx: sum(after, 'textPx') },
        afterDetail: after.strands.filter(s => s.picPx), overflow: after.overflow, errors };
      results.push(row);
      if (row.after.strandsOverPictures !== 0) throw Error('strand over another card: ' + JSON.stringify(row.afterDetail));
      if (after.overflow) throw Error('horizontal page overflow');
      if (errors.length) throw Error('page error: ' + errors[0]);
      console.log(`PASS  ${name}: ${row.strands} strands; over other pictures before ${row.before.strandsOverPictures} → after 0; text px before ${row.before.textPx} → after ${row.after.textPx}`); pass++;
    } catch (e) { console.log(`FAIL  ${name} — ${e.message.slice(0, 300)}`); fail++; }
    await page.close();
  }
  fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'test-results', 'golden-thread-avoid-cards.json'), JSON.stringify(results, null, 1));
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
