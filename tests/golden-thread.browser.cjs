// Golden Thread weave preview (Playwright, golden-thread-uat.html only).
// Plays: all 5 spreads at 390 (Pixel 7) and 1280px — waits for settle, lights every paragraph, never alters
// text colour/opacity, and leaves nothing behind (layer, classes, host class) within budget. #32's filament
// must also be gone (F1). Lifecycle at 390 and 1280: reduced motion, live reduced switch, Escape, navigation
// away, pagehide, replay on a new reading, no replay after a clarifier or card-detail return, not before
// settle, and taps passing through. Writes test-results/golden-thread.json. Run: node tests/golden-thread.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.UAT_OUTPUT_DIR || path.join(root, 'test-results'));
fs.mkdirSync(out, { recursive: true });
const port = 8777;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
const BASE = process.env.GT_BASE_URL || ['http:', '', '127.0.0.1:' + port, ''].join('/');
const PAGE = BASE.replace(/\/?$/, '/') + 'golden-thread-uat.html';
const SPREADS = ['guidance', 'three', 'relationship', 'seven', 'celtic'];
const configs = { 390: { ...devices['Pixel 7'] }, 1280: { viewport: { width: 1280, height: 900 } } };
const KNOWN_CONSOLE = /<path> attribute d: Expected number/; // pre-existing app.js icon, reported on #32
const results = [];
function record(id, label, ok, detail) { results.push({ id, label, pass: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${label}${detail ? ' — ' + JSON.stringify(detail) : ''}`); }

async function draw(browser, width, spread, { reduced = false } = {}) {
  const page = await browser.newPage({ ...configs[width], reducedMotion: reduced ? 'reduce' : 'no-preference' });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !KNOWN_CONSOLE.test(m.text())) page.errors.push(m.text()); });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.ResonateGoldenThreadWire && typeof go === 'function');
  await page.evaluate(() => {
    window.__maxLayers = 0; window.__everLayer = false;
    new MutationObserver(() => { const n = document.querySelectorAll('.gt-layer').length; window.__maxLayers = Math.max(window.__maxLayers, n); if (n) window.__everLayer = true; })
      .observe(document.documentElement, { childList: true, subtree: true });
    go('reading');
  });
  await page.click(`[data-spread="${spread}"]`);
  await page.locator('#stageDrawBtn').click();
  return page;
}
const toThread = page => page.evaluate(() => document.querySelector('.reading-golden-thread')?.scrollIntoView({ block: 'start' }));
const layers = page => page.evaluate(() => document.querySelectorAll('.gt-layer').length);
const residue = page => page.evaluate(() => ({ layer: document.querySelectorAll('.gt-layer').length, lit: document.querySelectorAll('.gt-lit').length, host: document.querySelectorAll('.gt-host').length }));
const clean = r => r.layer === 0 && r.lit === 0 && r.host === 0;
const textStyle = page => page.evaluate(() => [...document.querySelectorAll('.reading-golden-thread p, .reading-golden-thread strong, .reading-golden-thread h2')].map(n => { const s = getComputedStyle(n); return s.color + '|' + s.opacity; }).join(';'));

(async () => {
  if (!process.env.GT_BASE_URL) await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true });
  try {
    // ---- Play-through, every spread at phone and desktop width
    for (const width of [390, 1280]) for (const spread of SPREADS) {
      const page = await draw(browser, width, spread);
      await page.waitForFunction(() => state.drawSettled === true);
      const before = await textStyle(page);
      const paragraphs = await page.locator('.reading-golden-thread .golden-card-reading, .reading-golden-thread .golden-thread-summary').count();
      await toThread(page);
      await page.waitForSelector('.gt-layer', { timeout: 2000 });
      let maxLit = 0, during = null;
      const t0 = Date.now();
      while (await layers(page)) {
        maxLit = Math.max(maxLit, await page.evaluate(() => document.querySelectorAll('.gt-lit').length));
        if (!during && await page.evaluate(() => document.querySelector('.gt-layer')?.dataset.phase === 'hold')) during = await textStyle(page);
        if (Date.now() - t0 > 7000) break;
        await page.waitForTimeout(80);
      }
      const took = Date.now() - t0;
      await page.waitForTimeout(700); // CSS border ease-back
      const after = await textStyle(page), r = await residue(page);
      const filament = await page.locator('.rm-filament').count();
      record(`P-${spread}@${width}`, 'Plays after settle, lights every paragraph, text unchanged, clears fully',
        clean(r) && maxLit === paragraphs && took < 6000 && before === after && (!during || during === before) && filament === 0 && !page.errors.length,
        { paragraphs, maxLit, tookMs: took, residue: r, textChanged: before !== after || (during && during !== before), filament, errors: page.errors });
      await page.close();
    }

    for (const width of [390, 1280]) {
      // ---- Reduced motion: nothing is ever created
      let page = await draw(browser, width, 'three', { reduced: true });
      await page.waitForFunction(() => state.drawSettled === true); await toThread(page); await page.waitForTimeout(1200);
      record(`L1@${width}`, 'Reduced motion creates nothing', !(await page.evaluate(() => window.__everLayer)) && clean(await residue(page)));
      await page.close();

      // ---- Not before settle: scrolling there while cards turn waits
      page = await draw(browser, width, 'celtic');
      await toThread(page); await page.waitForTimeout(300);
      const early = await page.evaluate(() => ({ settled: state.drawSettled, layer: document.querySelectorAll('.gt-layer').length }));
      await page.waitForFunction(() => state.drawSettled === true);
      await page.waitForSelector('.gt-layer', { timeout: 2000 }).catch(() => null);
      record(`L2@${width}`, 'Waits for the reading to settle, then plays', !early.settled && early.layer === 0 && await layers(page) === 1, early);
      // ---- Escape ends it at once
      await page.keyboard.press('Escape'); await page.waitForTimeout(50);
      record(`L3@${width}`, 'Escape clears at once', clean(await residue(page)));
      await page.close();

      // ---- Live reduced-motion switch mid-weave
      page = await draw(browser, width, 'relationship');
      await page.waitForFunction(() => state.drawSettled === true); await toThread(page); await page.waitForSelector('.gt-layer');
      await page.waitForTimeout(300); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(150);
      record(`L4@${width}`, 'Live switch to reduced motion clears', clean(await residue(page)));
      await page.close();

      // ---- Navigation away mid-weave, then replay on a new reading (one layer at most)
      page = await draw(browser, width, 'three');
      await page.waitForFunction(() => state.drawSettled === true); await toThread(page); await page.waitForSelector('.gt-layer');
      await page.evaluate(() => go('home')); await page.waitForTimeout(80);
      const afterNav = await residue(page);
      await page.evaluate(() => go('reading')); await page.click('[data-spread="guidance"]'); await page.locator('#stageDrawBtn').click();
      await page.waitForFunction(() => state.drawSettled === true); await toThread(page);
      const replayed = await page.waitForSelector('.gt-layer', { timeout: 2000 }).then(() => true, () => false);
      record(`L5@${width}`, 'Navigation clears; a new reading replays once', clean(afterNav) && replayed && await page.evaluate(() => window.__maxLayers) === 1, { afterNav });
      // ---- Taps pass through the layer
      const hit = await page.evaluate(() => { const r = document.querySelector('.gt-layer').getBoundingClientRect(); const n = document.elementFromPoint(r.left + 10, Math.min(innerHeight - 5, Math.max(5, r.top + 120))); return n?.closest('.gt-layer') ? 'layer' : (n?.className || n?.tagName); });
      record(`L6@${width}`, 'Taps pass through the decoration', hit !== 'layer', { hit });
      // ---- pagehide clears
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))); await page.waitForTimeout(50);
      record(`L7@${width}`, 'pagehide clears', clean(await residue(page)));
      await page.close();

      // ---- No replay after a clarifier re-render or card-detail return
      page = await draw(browser, width, 'three');
      await page.waitForFunction(() => state.drawSettled === true); await toThread(page); await page.waitForSelector('.gt-layer');
      await page.waitForFunction(() => !document.querySelector('.gt-layer'), null, { timeout: 7000 });
      await page.evaluate(() => { window.__everLayer = false; document.getElementById('primaryClarifierAction').click(); });
      await page.waitForTimeout(2500); await toThread(page); await page.waitForTimeout(900);
      const afterClarifier = await page.evaluate(() => window.__everLayer);
      await page.evaluate(() => document.querySelector('.reading-card[data-reading-card]')?.click()); await page.waitForTimeout(300);
      await page.evaluate(() => document.getElementById('backBtn')?.click()); await page.waitForTimeout(500);
      await toThread(page); await page.waitForTimeout(900);
      const afterDetail = await page.evaluate(() => window.__everLayer);
      record(`L8@${width}`, 'No replay after a clarifier or card-detail return', !afterClarifier && !afterDetail && clean(await residue(page)) && !page.errors.length, { afterClarifier, afterDetail, errors: page.errors });
      await page.close();
    }
  } finally {
    await browser.close();
    if (!process.env.GT_BASE_URL) await new Promise(r => server.close(r));
  }
  fs.writeFileSync(path.join(out, 'golden-thread.json'), JSON.stringify(results, null, 2));
  const pass = results.filter(r => r.pass).length;
  console.log(`\n${pass}/${results.length} ${pass === results.length ? 'PASS' : 'FAIL'}`);
  if (pass !== results.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
