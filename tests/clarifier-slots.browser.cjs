// Clarifier slots (Playwright). Chas's 28 Oct UAT: after the first clarifier, the second slot waits face down
// beside it at the same size, and the second clarifier turns over in that slot. Nothing resizes or moves.
// Every spread at 360, 390, 768, 1280 and 1920px. Run with: node tests/clarifier-slots.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8778;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = ['http:', '', '127.0.0.1:' + port, ''].join('/');
const SPREADS = ['guidance', 'three', 'relationship', 'seven', 'celtic'];
const configs = {
  360: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  390: { ...devices['Pixel 7'] },
  768: { viewport: { width: 768, height: 1024 } },
  1280: { viewport: { width: 1280, height: 900 } },
  1920: { viewport: { width: 1920, height: 1080 } },
};
// Every position's clarifier boxes, relative to the top of their own position (a longer card title in an
// earlier position may push later rows down, which is not the jump being tested).
const boxes = page => page.evaluate(() => [...document.querySelectorAll('.spread-board .reading-position')].map(pos => {
  const top = pos.getBoundingClientRect().top;
  return [...pos.querySelectorAll('.position-clarifier img, .position-clarifier-slot .clarifier-back')].map(e => {
    const r = e.getBoundingClientRect();
    return [Math.round(r.left), Math.round(r.top - top), Math.round(r.width), Math.round(r.height)];
  });
}));
const turnFinished = page => page.evaluate(() => Promise.all([...document.querySelectorAll('.clarifier-turn img, .clarifier-turn .clarifier-back-cover')]
  .flatMap(e => e.getAnimations()).map(a => a.finished)));

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  let passed = 0;
  for (const [width, device] of Object.entries(configs)) for (const spread of SPREADS) for (const motion of width === '390' || width === '1280' ? ['reduce', 'no-preference'] : ['reduce']) {
    const page = await browser.newPage({ ...device, reducedMotion: motion });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(BASE);
      await page.evaluate(s => { state.spreadId = s; state.spreadSize = currentSpread().positions.length; go('reading'); }, spread);
      await page.locator(`[data-spread="${spread}"]`).click();
      await page.locator('#stageDrawBtn').click();
      await page.waitForFunction(() => state.drawSettled, null, { timeout: 15000 });
      const positions = await page.evaluate(() => state.drawnCardIds.length);
      await page.evaluate(() => drawFirstLayerClarifiers());
      const one = await boxes(page);
      assert.equal(await page.locator('.position-clarifier-slot').count(), positions, 'one waiting slot per position');
      assert.match(await page.locator('.position-clarifier-slot').first().innerText(), /CLARIFIER 2[\s\S]*Not drawn yet/);
      one.forEach((pair, i) => {
        assert.equal(pair.length, 2, `position ${i + 1}: clarifier 1 and the waiting slot`);
        assert.deepEqual([pair[0][2], pair[0][3]], [pair[1][2], pair[1][3]], `position ${i + 1}: slot is the same size as clarifier 1`);
        assert.ok(pair[1][0] > pair[0][0], `position ${i + 1}: slot is to the right of clarifier 1`);
      });
      await page.evaluate(() => drawNextClarifierLayer());
      assert.equal(await page.locator('.clarifier-turn').count(), motion === 'reduce' ? 0 : positions, 'turn plays only with motion');
      await turnFinished(page);
      const two = await boxes(page);
      assert.deepEqual(two, one, 'clarifier 2 lands exactly where the slot was; clarifier 1 does not move: ' + JSON.stringify(one.flat().map((b, i) => [b, two.flat()[i]]).filter(([a, c]) => String(a) !== String(c)).slice(0, 3)));
      assert.equal(await page.locator('.position-clarifier-slot').count(), 0, 'no waiting slot once both are drawn');
      if (motion !== 'reduce') {
        const settled = await page.evaluate(() => [...document.querySelectorAll('.clarifier-turn')].every(t =>
          getComputedStyle(t.querySelector('img')).transform === 'none' || getComputedStyle(t.querySelector('img')).transform === 'matrix(1, 0, 0, 1, 0, 0)'));
        assert.ok(settled, 'turned cards finish flat');
      }
      await page.evaluate(() => renderDraw());
      assert.equal(await page.locator('.clarifier-turn').count(), 0, 'returning to the reading does not replay the turn');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal scroll');
      assert.deepEqual(errors, []);
      passed++;
    } catch (e) { failures.push(`${spread}@${width} ${motion}: ${e.message.split('\n')[0]}`); }
    await page.close();
  }
  await browser.close();
  server.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} clarifier-slot cases: same size and place before and after the second clarifier (5 spreads, 5 widths)`);
})();
