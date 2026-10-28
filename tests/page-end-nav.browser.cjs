// End-of-page navigation (Playwright, phone emulation). Chas's 28 Oct UAT: a finished reading and the Journal
// must end with ways back to the reading, to a new spread and to Home, not only the journal buttons.
// Run with: node tests/page-end-nav.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8779;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = ['http:', '', '127.0.0.1:' + port, ''].join('/');
const view = page => page.evaluate(() => state.view);
const labels = page => page.locator('.page-end-nav button').allInnerTexts();
// The nav must be the last set of controls on the page.
const isLast = page => page.evaluate(() => {
  const nav = document.querySelector('.page-end-nav');
  const after = [...document.querySelectorAll('#app button')].filter(b => !nav.contains(b) && b.offsetParent && !b.closest('.menu-overlay') && (nav.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  return after.length === 0;
});

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  let passed = 0;
  const check = async (name, fn) => {
    const page = await browser.newPage({ ...devices['Pixel 7'], reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    try { await fn(page); assert.deepEqual(errors, []); passed++; console.log('PASS ' + name); }
    catch (e) { failures.push(`${name}: ${e.message.split('\n')[0]}`); }
    await page.close();
  };
  const finishedReading = async (page, spread) => {
    await page.goto(BASE);
    await page.evaluate(() => go('reading'));
    await page.locator(`[data-spread="${spread}"]`).tap();
    await page.locator('#stageDrawBtn').tap();
    await page.waitForFunction(() => state.drawSettled);
    await page.evaluate(() => { drawFirstLayerClarifiers(); drawNextClarifierLayer(); });
  };
  for (const spread of ['guidance', 'three', 'relationship', 'seven', 'celtic']) {
    await check(`${spread}: reading ends with back to top, new reading and Home`, async page => {
      await finishedReading(page, spread);
      assert.deepEqual(await labels(page), ['↑ Back to the top of this reading', 'Start a New Reading', 'Home']);
      assert.ok(await isLast(page), 'nav is the last control on the page');
      await page.locator('.page-end-nav button', { hasText: 'Back to the top' }).tap();
      await page.waitForTimeout(300);
      assert.ok(await page.locator('.spread-scroll').evaluate(e => e.getBoundingClientRect().top < innerHeight), 'spread back in view');
      await page.locator('.page-end-nav button', { hasText: 'Start a New Reading' }).tap();
      assert.equal(await view(page), 'reading');
    });
  }
  await check('reading: Home', async page => {
    await finishedReading(page, 'three');
    await page.locator('.page-end-nav button', { hasText: 'Home' }).tap();
    assert.equal(await view(page), 'home');
  });
  await check('Journal ends with back to the current reading, new reading and Home', async page => {
    await finishedReading(page, 'three');
    const drawn = await page.evaluate(() => [...state.drawnCardIds]);
    await page.locator('#saveReadingJournal').tap();
    await page.locator('#openJournal').tap();
    assert.equal(await view(page), 'saved');
    assert.deepEqual(await labels(page), ['Back to your current reading', 'Start a New Reading', 'Home']);
    assert.ok(await isLast(page), 'nav is the last control on the page');
    await page.locator('.page-end-nav button', { hasText: 'Back to your current reading' }).tap();
    assert.equal(await view(page), 'draw');
    assert.deepEqual(await page.evaluate(() => [...state.drawnCardIds]), drawn);
    await page.evaluate(() => go('saved'));
    await page.locator('.page-end-nav button', { hasText: 'Home' }).tap();
    assert.equal(await view(page), 'home');
  });
  await check('Journal with no reading this visit offers only new reading and Home', async page => {
    await page.goto(BASE);
    await page.evaluate(() => go('saved'));
    assert.deepEqual(await labels(page), ['Start a New Reading', 'Home']);
    await page.locator('.page-end-nav button', { hasText: 'Start a New Reading' }).tap();
    assert.equal(await view(page), 'reading');
  });
  await check('a reading reopened from the Journal ends with the same three', async page => {
    await finishedReading(page, 'seven');
    await page.locator('#saveReadingJournal').tap();
    await page.locator('#openJournal').tap();
    await page.locator('[data-open-reading]').first().tap();
    assert.equal(await view(page), 'draw');
    assert.deepEqual(await labels(page), ['↑ Back to the top of this reading', 'Start a New Reading', 'Home']);
  });
  await browser.close();
  server.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} end-of-page navigation checks (reading and Journal, phone)`);
})();
