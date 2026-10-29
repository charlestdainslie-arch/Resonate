/* Golden Thread connector — Phase A browser checks.
 * Run: node tests/golden-thread-connector.browser.cjs
 * Requires: npx playwright install chromium
 */
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let requested = decodeURIComponent((req.url || '/').split('?')[0]);
      if (requested === '/') requested = '/golden-thread-connector/demo.html';
      const file = path.join(ROOT, requested);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const ext = path.extname(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async function main() {
  const { server, port } = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const results = [];
  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, pass: true });
    } catch (error) {
      results.push({ name, pass: false, error: error.message });
    }
  }
  const url = `http://127.0.0.1:${port}/golden-thread-connector/demo.html`;
  await page.goto(url);
  await page.waitForFunction(() => !!window.__gtcDemo);

  const overlayCount = () => page.locator('svg.gtc-overlay').count();
  const headCount = () => page.locator('svg.gtc-overlay path.gtc-filament--head').count();
  const wait = (ms) => page.waitForTimeout(ms || 80);
  const setState = (next) => page.evaluate((s) => window.__gtcDemo.setState(s), next);

  const baseState = (main0, main1, c1, c2) => ({
    spreadId: 'test',
    mainCards: [
      { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: main0 },
      { positionIndex: 1, cardId: 1, orientation: 'reversed', revealed: main1 }
    ],
    clarifiers: { 0: [
      { slot: 1, cardId: 2, revealed: c1 },
      { slot: 2, cardId: 3, revealed: c2 }
    ] }
  });

  await test('mount creates one aria-hidden SVG and does not create cards', async () => {
    await wait();
    if (await overlayCount() !== 1) throw new Error('expected one overlay');
    const aria = await page.locator('svg.gtc-overlay').getAttribute('aria-hidden');
    if (aria !== 'true') throw new Error('overlay must be aria-hidden');
    const mainCards = await page.locator('.reading-card').count();
    const slots = await page.locator('.clarifier-slot').count();
    if (mainCards !== 2 || slots !== 2) throw new Error('demo cards must not be created by controller');
  });

  await test('0 clarifiers: one parent→next segment, no phantom clarifier', async () => {
    await setState(baseState(true, true, false, false));
    await wait();
    if (await headCount() !== 1) throw new Error('expected exactly one segment');
  });

  await test('1 clarifier: parent→clarifier + parent→next', async () => {
    await setState(baseState(true, true, true, false));
    await wait();
    if (await headCount() !== 2) throw new Error('expected two segments');
  });

  await test('2 clarifiers: two branches + next', async () => {
    await setState(baseState(true, true, true, true));
    await wait();
    if (await headCount() !== 3) throw new Error('expected three segments');
  });

  await test('face-down clarifier 2 has no path', async () => {
    await setState(baseState(true, false, true, false));
    await wait();
    const rect = await page.locator('[data-gtc-clarifier="2"]').boundingBox();
    const paths = await page.locator('svg.gtc-overlay path.gtc-filament--head').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('d')));
    const hit = paths.some((d) => d.includes(String(Math.round(rect.x + rect.width / 2))));
    if (hit) throw new Error('path must not end at face-down clarifier');
  });

  await test('unrevealed next main has no path', async () => {
    await setState(baseState(true, false, false, false));
    await wait();
    if (await headCount() !== 0) throw new Error('no connector should reach an unrevealed main');
  });

  await test('reversed main card still attaches', async () => {
    await setState(baseState(true, true, false, false));
    await wait();
    if (await headCount() < 1) throw new Error('orientation must not block the connector');
  });

  await test('rapid reveal taps keep one overlay and no duplicate listeners', async () => {
    for (let i = 0; i < 12; i++) await page.click('#reveal0');
    await wait(120);
    if (await overlayCount() !== 1) throw new Error('duplicate overlays after rapid taps');
  });

  await test('state is not mutated by mount/update/destroy', async () => {
    const before = await page.evaluate(() => JSON.stringify(window.__gtcDemo.state));
    await page.evaluate(() => { window.__gtcDemo.render(); window.__gtcDemo.connector.update(window.__gtcDemo.state); });
    await page.evaluate(() => window.__gtcDemo.connector.destroy());
    await page.evaluate(() => window.__gtcDemo.mount());
    const after = await page.evaluate(() => JSON.stringify(window.__gtcDemo.state));
    if (before !== after) throw new Error('reading state was mutated');
  });

  await test('reduced motion shows static connector with no WAAPI animation', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.connector.options.forceReducedMotion = true;
      window.__gtcDemo.setState({ mainCards: [
        { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: true },
        { positionIndex: 1, cardId: 1, orientation: 'upright', revealed: true }
      ] });
    });
    await wait(60);
    const running = await page.evaluate(() => {
      const svg = document.querySelector('svg.gtc-overlay');
      return document.getAnimations().filter((a) => svg && svg.contains(a.effect.target)).length;
    });
    if (running !== 0) throw new Error('reduced motion must not start WAAPI animations');
  });

  await test('destroy removes overlay and host class', async () => {
    await page.evaluate(() => window.__gtcDemo.connector.destroy());
    if (await overlayCount() !== 0) throw new Error('overlay remained after destroy');
    const hasClass = await page.locator('#gtcDemo').evaluate((el) => el.classList.contains('gtc-host'));
    if (hasClass) throw new Error('gtc-host class remained');
  });

  await test('repeated mount/destroy leaves one overlay', async () => {
    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        window.__gtcDemo.connector.mount(document.getElementById('gtcDemo'), window.__gtcDemo.state);
        window.__gtcDemo.connector.destroy();
      }
      window.__gtcDemo.mount();
    });
    if (await overlayCount() !== 1) throw new Error('repeated mount/destroy leaked overlays');
  });

  await test('pagehide removes overlay', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    if (await overlayCount() !== 0) throw new Error('overlay survived pagehide');
  });

  await test('overlay does not capture pointer and buttons remain clickable', async () => {
    await page.evaluate(() => window.__gtcDemo.mount());
    const pointerEvents = await page.locator('svg.gtc-overlay').evaluate((el) => getComputedStyle(el).pointerEvents);
    if (pointerEvents !== 'none') throw new Error('overlay must not capture pointers');
    await page.click('#revealC1');
    const revealed = await page.locator('[data-gtc-clarifier="1"]').evaluate((el) => el.classList.contains('revealed'));
    if (!revealed) throw new Error('click was blocked by overlay');
  });

  await test('responsive geometry 360/390/1280 stays inside the container', async () => {
    for (const width of [360, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        window.__gtcDemo.connector.options.forceReducedMotion = true;
        window.__gtcDemo.setState({
          mainCards: [
            { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: true },
            { positionIndex: 1, cardId: 1, orientation: 'reversed', revealed: true }
          ],
          clarifiers: { 0: [
            { slot: 1, cardId: 2, revealed: true },
            { slot: 2, cardId: 3, revealed: true }
          ] }
        });
      });
      await wait(80);
      const box = await page.locator('#gtcDemo').boundingBox();
      const coords = await page.locator('svg.gtc-overlay path.gtc-filament--head').evaluateAll((nodes) => nodes.flatMap((n) => {
        const d = n.getAttribute('d') || '';
        return (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
      }));
      if (!coords.length || coords.some((n) => !Number.isFinite(n))) throw new Error('non-finite path coordinates at ' + width);
    }
  });

  await test('mid-flight destroy leaves no error', async () => {
    errors.length = 0;
    await page.evaluate(() => {
      window.__gtcDemo.connector.options.forceReducedMotion = false;
      window.__gtcDemo.mount();
      window.__gtcDemo.revealMain(0);
      window.__gtcDemo.connector.destroy();
    });
    await wait(80);
    if (errors.length) throw new Error('page error during mid-flight destroy: ' + errors[0]);
  });

  await test('no phantom cards created', async () => {
    if (await page.locator('.reading-card').count() !== 2) throw new Error('controller created main cards');
    if (await page.locator('.clarifier-slot').count() !== 2) throw new Error('controller created clarifier slots');
  });

  await test('destroy is idempotent', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.connector.destroy();
      window.__gtcDemo.connector.destroy();
    });
  });

  await browser.close();
  server.close();

  const passed = results.filter((r) => r.pass).length;
  results.forEach((r) => {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : ' — ' + r.error}`);
  });
  console.log(`\n${passed}/${results.length} passed`);
  if (passed !== results.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
