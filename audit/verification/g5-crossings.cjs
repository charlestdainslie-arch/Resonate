// Item 5b — G5: which Golden Thread strands pass over which card pictures, measured on the real SVG paths.
// Renders the recorded S3 draw (audit/samples/celtic/draw-record.json) on presenter-uat.html at 1280 px, reduced motion
// (strands drawn still, so geometry is final), samples each strand path every 2 px with getPointAtLength, and reports
// every card picture (main or clarifier) a strand crosses, excluding the two cards it connects.
// Usage: NODE_PATH=<playwright dir> node g5-crossings.cjs <repo-root> <out.json> <out.png>
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [ROOT, OUTJ, OUTP] = process.argv.slice(2);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const rec = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/samples/celtic/draw-record.json'), 'utf8'));
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
srv.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(`http://127.0.0.1:${srv.address().port}/presenter-uat.html`);
  await p.evaluate(r => {
    const at = '2026-11-06T01:00:00.000Z';
    const ids = r.positions.map(x => x.card.id), c1 = r.positions.map(x => x.clarifier1 ? x.clarifier1.id : null), c2 = r.positions.map(x => x.clarifier2 ? x.clarifier2.id : null);
    const rev = r.positions.flatMap(x => [x.card, x.clarifier1, x.clarifier2]).filter(c => c && c.orientation === 'reversed').map(c => c.id);
    Object.assign(state, { spreadId: 'celtic', spreadSize: ids.length, drawnCardIds: ids, drawnAt: at, drawnOrientations: { readingAt: at, reversed: rev }, drawSettled: true, drawPhase: 'settled',
      clarifierReadingAt: at, firstLayerClarifiers: c1, additionalClarifierReadingAt: at, additionalClarifierLayers: [{ number: 2, cards: c2 }] });
    go('draw');
  }, rec);
  await p.waitForTimeout(1500);
  const res = await p.evaluate(() => {
    const board = document.querySelector('.spread-board'), svg = board.querySelector('svg.gtc-overlay'), base = svg.getBoundingClientRect();
    const pos = [...board.querySelectorAll(':scope > .reading-position')];
    const pics = [];
    pos.forEach((el, i) => {
      const main = el.querySelector('.reading-card-front img');
      if (main) pics.push({ id: `main:${i}`, name: main.alt, r: main.getBoundingClientRect() });
      el.querySelectorAll('.position-clarifier > img').forEach((img, k) => pics.push({ id: `main:${i}:clarifier:${k + 1}`, name: img.alt, r: img.getBoundingClientRect() }));
    });
    const ends = key => { let m = /^main:(\d+):clarifier:(\d+)$/.exec(key); if (m) return [`main:${m[1]}`, key];
      m = /^main:(\d+):next:(\d+)$/.exec(key); if (m) { const from = pics.filter(x => x.id.startsWith(`main:${m[1]}:clarifier:`)).map(x => x.id).sort().pop() || `main:${m[1]}`; return [from, `main:${m[2]}`]; } return []; };
    const name = id => (pics.find(x => x.id === id) || {}).name;
    const out = [];
    svg.querySelectorAll('[data-gtc-key]').forEach(g => {
      const key = g.getAttribute('data-gtc-key'), path = g.querySelector('path'), len = path.getTotalLength(), skip = ends(key);
      const hits = {};
      for (let s = 0; s <= len; s += 2) {
        const pt = path.getPointAtLength(s), x = base.left + pt.x, y = base.top + pt.y;
        pics.forEach(pc => { if (skip.includes(pc.id)) return; const r = pc.r; if (x > r.left + 2 && x < r.right - 2 && y > r.top + 2 && y < r.bottom - 2) hits[pc.id] = (hits[pc.id] || 0) + 2; });
      }
      out.push({ key, from: name(skip[0]), to: name(skip[1]), strand_length_px: Math.round(len),
        crosses: Object.entries(hits).map(([id, px]) => ({ picture: name(id), id, px_inside: px })) });
    });
    return { viewport: innerWidth, pictures: pics.length, strands: out };
  });
  await p.locator('.spread-scroll').screenshot({ path: OUTP });
  fs.writeFileSync(OUTJ, JSON.stringify(res, null, 1));
  const crossing = res.strands.filter(s => s.crosses.length);
  console.log(`pictures ${res.pictures}, strands ${res.strands.length}, strands crossing another card's picture: ${crossing.length}`);
  crossing.forEach(s => console.log(`  ${s.from}  →  ${s.to}  crosses: ${s.crosses.map(c => `${c.picture} (${c.px_inside}px)`).join('; ')}`));
  await b.close(); srv.close();
});
