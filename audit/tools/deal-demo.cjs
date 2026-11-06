// Records the deck theatre (shuffle → draw/deal → reveal) for Chas to review visually.
// Usage: NODE_PATH=<playwright> node audit/tools/deal-demo.cjs <out-dir>
// One recording per spread on a phone-sized screen (412×915, like a Samsung), plus Celtic Cross and
// Seven V on desktop (1280×800). Real app page (presenter-uat.html), real draw; nothing staged.
// Writes <out-dir>/<spread>-<width>.webm and a JSON log of what was dealt in each recording.
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.resolve(process.argv[2]);
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const RUNS = [['guidance', 412, 915], ['three', 412, 915], ['relationship', 412, 915], ['seven', 412, 915], ['celtic', 412, 915], ['celtic', 1280, 800], ['seven', 1280, 800]];
server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const log = [];
  for (const [spread, w, h] of RUNS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: OUT, size: { width: w, height: h } }, isMobile: w < 600, hasTouch: w < 600, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/presenter-uat.html');
    await page.evaluate(() => go('reading'));
    await page.locator(`[data-spread="${spread}"]`).click();
    await page.waitForSelector('.dt-deck');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.getElementById('shuffleCardsBtn').click());   // tap without scrolling the page
    await page.waitForFunction(() => !window.ResonateDeckTheatre.busy, null, { timeout: 30000 });
    await page.waitForTimeout(900);
    const top = await page.evaluate(() => state.shuffledDeck.slice(0, state.spreadSize));
    await page.evaluate(() => document.getElementById('stageDrawBtn').click());
    await page.waitForFunction(() => state.view === 'draw', null, { timeout: 60000 });
    await page.waitForFunction(() => state.drawSettled, null, { timeout: 60000 });
    await page.waitForTimeout(2500);
    const drawnIds = await page.evaluate(() => [...state.drawnCardIds]);
    const drawn = await page.evaluate(() => state.drawnCardIds.map(id => cards.find(c => c.id === id).name + (isReversed(cards.find(c => c.id === id)) ? ' (reversed)' : '')));
    const video = page.video();
    await ctx.close();
    const file = path.join(OUT, `${spread}-${w}.webm`);
    await video.saveAs(file); await video.delete();
    log.push({ file: path.basename(file), spread, viewport: `${w}x${h}`, dealtIds: top, reading: drawn, sameCards: JSON.stringify(top) === JSON.stringify(drawnIds), errors });
    console.log('recorded', path.basename(file), errors.length ? 'ERRORS ' + errors[0] : '');
  }
  fs.writeFileSync(path.join(OUT, 'recordings.json'), JSON.stringify(log, null, 1));
  await browser.close(); server.close();
});
