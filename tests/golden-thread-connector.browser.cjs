/* Golden Thread connector — Phase A browser checks (v2, 23 tests).
 * Run: node tests/golden-thread-connector.browser.cjs
 * Requires: npx playwright install chromium
 *
 * Covers: 0/1/2 clarifiers, parenting (3 parents), reveal order
 * (contiguous prefix), animation on new reveals only + pruning,
 * reduced motion, geometry within 2px at 360/390/1280, rapid
 * interaction, dynamic observation, bfcache pagehide->pageshow
 * remount, destroy/cleanup, demo sequencing, no phantom cards.
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
        res.writeHead(404); res.end('not found'); return;
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
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference'
  });
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
  const segmentCount = () => page.locator('svg.gtc-overlay [data-gtc-key]').count();
  const wait = (ms) => page.waitForTimeout(ms || 80);
  const setState = (next) => page.evaluate((s) => window.__gtcDemo.setState(s), next);
  const segmentKeys = () => page.locator('svg.gtc-overlay [data-gtc-key]').evaluateAll(
    (nodes) => nodes.map((n) => n.getAttribute('data-gtc-key'))
  );

  const countAnimsForKey = async (key) => page.evaluate((k) => {
    return document.getAnimations().filter((a) => {
      const t = a.effect && a.effect.target;
      if (!t || !t.closest) return false;
      const g = t.closest('[data-gtc-key]');
      return g && g.getAttribute('data-gtc-key') === k;
    }).length;
  }, key);

  const ensureMainEl = (index) => page.evaluate((i) => {
    const host = document.getElementById('gtcDemo');
    if (host.querySelector(`[data-gtc-main-card="${i}"]`)) return;
    const unit = document.createElement('div');
    unit.className = 'card-unit';
    unit.setAttribute('data-gtc-parent', String(i));
    unit.innerHTML =
      `<div class="reading-card" data-gtc-main-card="${i}" data-index="${i}"></div>` +
      `<div class="clarifier-slot" data-gtc-clarifier="1"></div>` +
      `<div class="clarifier-slot" data-gtc-clarifier="2"></div>`;
    host.appendChild(unit);
  }, index);

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

  const firePageTransition = (type, persisted) => page.evaluate(({ type, persisted }) => {
    if (typeof PageTransitionEvent === 'function') {
      window.dispatchEvent(new PageTransitionEvent(type, { persisted }));
    } else {
      const evt = new Event(type);
      Object.defineProperty(evt, 'persisted', { value: persisted });
      window.dispatchEvent(evt);
    }
  }, { type, persisted });

  // ---- Baseline ----

  await test('1. mount creates one aria-hidden SVG and no cards', async () => {
    await wait();
    if (await overlayCount() !== 1) throw new Error('expected one overlay');
    const aria = await page.locator('svg.gtc-overlay').getAttribute('aria-hidden');
    if (aria !== 'true') throw new Error('overlay must be aria-hidden');
    if (await page.locator('.reading-card').count() !== 2) throw new Error('main cards changed');
    if (await page.locator('.clarifier-slot').count() !== 2) throw new Error('clarifier slots changed');
  });

  // ---- Segment counts ----

  await test('2. 0 clarifiers: one next-segment only', async () => {
    await setState(baseState(true, true, false, false));
    await wait();
    const keys = await segmentKeys();
    if (keys.length !== 1) throw new Error(`expected 1 segment, got ${keys.length}`);
    if (!keys.includes('main:0:next:1')) throw new Error('missing next segment');
  });

  await test('3. 1 clarifier: branch + next', async () => {
    await setState(baseState(true, true, true, false));
    await wait();
    const keys = await segmentKeys();
    if (keys.length !== 2) throw new Error(`expected 2 segments, got ${keys.length}`);
    if (!keys.includes('main:0:clarifier:1')) throw new Error('missing clarifier-1 segment');
    if (!keys.includes('main:0:next:1')) throw new Error('missing next segment');
  });

  await test('4. 2 clarifiers: two branches + next', async () => {
    await setState(baseState(true, true, true, true));
    await wait();
    const keys = await segmentKeys();
    if (keys.length !== 3) throw new Error(`expected 3 segments, got ${keys.length}`);
    if (!keys.includes('main:0:clarifier:2')) throw new Error('missing clarifier-2 segment');
  });

  await test('5. face-down clarifier 2 has no segment', async () => {
    await setState(baseState(true, true, true, false));
    await wait();
    const keys = await segmentKeys();
    if (keys.some((k) => k.endsWith('clarifier:2'))) throw new Error('clarifier 2 received a segment while face down');
  });

  await test('6. unrevealed next main has no segment', async () => {
    await setState(baseState(true, false, false, false));
    await wait();
    if (await segmentCount() !== 0) throw new Error('segment reached an unrevealed main card');
  });

  // ---- P1-C: no skipping ----

  await test('7. P1-C: 0 and 2 revealed, 1 face down -> no segment reaches 2', async () => {
    await ensureMainEl(2);
    await setState({
      spreadId: 'skip',
      mainCards: [
        { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: true },
        { positionIndex: 1, cardId: 1, orientation: 'upright', revealed: false },
        { positionIndex: 2, cardId: 2, orientation: 'upright', revealed: true }
      ],
      clarifiers: {}
    });
    await wait();
    const keys = await segmentKeys();
    if (keys.some((k) => k.endsWith(':2'))) throw new Error('segment connected to skipped main 2');
  });

  await test('8. reversed main card still attaches', async () => {
    await setState(baseState(true, true, false, false));
    await wait();
    if (await segmentCount() < 1) throw new Error('reversed orientation blocked the connector');
  });

  // ---- P1-B: parenting ----

  await test('9. P1-B: three parents, connectors land on correct children', async () => {
    await ensureMainEl(2);
    await setState({
      spreadId: 'parenting',
      mainCards: [
        { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: true },
        { positionIndex: 1, cardId: 1, orientation: 'upright', revealed: true },
        { positionIndex: 2, cardId: 4, orientation: 'upright', revealed: true }
      ],
      clarifiers: {
        0: [{ slot: 1, cardId: 10, revealed: true }],
        1: [{ slot: 1, cardId: 11, revealed: true }],
        2: [{ slot: 1, cardId: 12, revealed: true }]
      }
    });
    await wait(150);
    const measured = await page.evaluate(() => {
      const base = document.getElementById('gtcDemo').getBoundingClientRect();
      const c0 = document.querySelector('[data-gtc-parent="0"] [data-gtc-clarifier="1"]').getBoundingClientRect();
      const c2 = document.querySelector('[data-gtc-parent="2"] [data-gtc-clarifier="1"]').getBoundingClientRect();
      return {
        x0: c0.left - base.left + c0.width / 2,
        x2: c2.left - base.left + c2.width / 2
      };
    });
    const tos = await page.evaluate(() => {
      const out = {};
      document.querySelectorAll('[data-gtc-key]').forEach((g) => {
        out[g.getAttribute('data-gtc-key')] = parseFloat(g.getAttribute('data-gtc-to-x'));
      });
      return out;
    });
    if (!tos['main:0:clarifier:1']) throw new Error('missing parent-0 clarifier segment');
    if (!tos['main:2:clarifier:1']) throw new Error('missing parent-2 clarifier segment');
    if (Math.abs(tos['main:0:clarifier:1'] - measured.x0) > 2) {
      throw new Error(`parent-0 clarifier anchored to wrong child (${tos['main:0:clarifier:1']} vs ${measured.x0})`);
    }
    if (Math.abs(tos['main:2:clarifier:1'] - measured.x2) > 2) {
      throw new Error(`parent-2 clarifier anchored to wrong child (${tos['main:2:clarifier:1']} vs ${measured.x2})`);
    }
  });

  // ---- P1-A: animation on new reveals only + pruning ----

  await test('10. P1-A: new segment animates once, old segments do not restart, animations pruned', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.reset();
      window.__gtcDemo.connector.options.forceReducedMotion = false;
      window.__gtcDemo.mount();
    });
    await wait(100);
    await setState(baseState(true, true, false, false)); // creates main:0:next:1 (new -> animates)
    await wait(900); // let it finish + settle
    const oldKey = 'main:0:next:1';
    const oldBefore = await countAnimsForKey(oldKey);
    if (oldBefore !== 0) throw new Error(`old segment still tracked as animating after finish (${oldBefore})`);
    await setState(baseState(true, true, true, false)); // creates main:0:clarifier:1 (new -> animates)
    await wait(40);
    const newKey = 'main:0:clarifier:1';
    const newDuring = await countAnimsForKey(newKey);
    const oldDuring = await countAnimsForKey(oldKey);
    if (newDuring < 1) throw new Error('newly created segment did not animate');
    if (oldDuring > 0) throw new Error('existing segment restarted animation');
    await wait(900);
    const remaining = await page.evaluate(() => window.__gtcDemo.connector._animations.length);
    if (remaining !== 0) throw new Error(`_animations not pruned after finish (${remaining} left)`);
  });

  // ---- Reduced motion ----

  await test('11. reduced motion: no WAAPI animations on overlay', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.connector.options.forceReducedMotion = true;
      window.__gtcDemo.reset();
      window.__gtcDemo.mount();
    });
    await setState(baseState(true, true, true, true));
    await wait(60);
    const running = await page.evaluate(() => {
      const svg = document.querySelector('svg.gtc-overlay');
      return document.getAnimations().filter((a) => svg && svg.contains(a.effect.target)).length;
    });
    if (running !== 0) throw new Error('reduced motion started WAAPI animations');
    await page.evaluate(() => { window.__gtcDemo.connector.options.forceReducedMotion = false; });
  });

  // ---- State integrity + rapid interaction ----

  await test('12. state not mutated by mount/update/destroy', async () => {
    const before = await page.evaluate(() => JSON.stringify(window.__gtcDemo.state));
    await page.evaluate(() => {
      window.__gtcDemo.render();
      window.__gtcDemo.connector.update(window.__gtcDemo.state);
      window.__gtcDemo.connector.destroy();
      window.__gtcDemo.mount();
    });
    const after = await page.evaluate(() => JSON.stringify(window.__gtcDemo.state));
    if (before !== after) throw new Error('reading state mutated');
  });

  await test('13. rapid reveal taps keep one overlay', async () => {
    for (let i = 0; i < 12; i++) await page.click('#reveal0').catch(() => {});
    await wait(150);
    if (await overlayCount() !== 1) throw new Error('duplicate overlay after rapid taps');
  });

  // ---- Destroy / cleanup ----

  await test('14. destroy removes overlay and host class', async () => {
    await page.evaluate(() => window.__gtcDemo.connector.destroy());
    if (await overlayCount() !== 0) throw new Error('overlay survived destroy');
    const hasClass = await page.locator('#gtcDemo').evaluate((el) => el.classList.contains('gtc-host'));
    if (hasClass) throw new Error('gtc-host class survived destroy');
  });

  await test('15. repeated mount/destroy leaves one overlay', async () => {
    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        window.__gtcDemo.connector.mount(document.getElementById('gtcDemo'), window.__gtcDemo.state);
        window.__gtcDemo.connector.destroy();
      }
      window.__gtcDemo.mount();
    });
    if (await overlayCount() !== 1) throw new Error('repeated mount/destroy leaked overlays');
  });

  await test('16. destroy is idempotent', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.connector.destroy();
      window.__gtcDemo.connector.destroy();
    });
    if (await overlayCount() !== 0) throw new Error('overlay survived double destroy');
  });

  // ---- P2-D: bfcache ----

  await test('17. pagehide then pageshow(persisted) remounts overlay', async () => {
    await page.evaluate(() => window.__gtcDemo.mount());
    if (await overlayCount() !== 1) throw new Error('precondition: overlay missing');
    await firePageTransition('pagehide', true);
    if (await overlayCount() !== 0) throw new Error('pagehide did not remove overlay');
    await firePageTransition('pageshow', true);
    await wait(80);
    if (await overlayCount() !== 1) throw new Error('pageshow(persisted) did not remount overlay');
  });

  // ---- P2-C: dynamic observation ----

  await test('18. P2-C: new cards observed, released on destroy', async () => {
    await page.evaluate(() => window.__gtcDemo.mount());
    const before = await page.evaluate(() => window.__gtcDemo.connector._observedEls.size);
    await page.evaluate(() => {
      const host = document.getElementById('gtcDemo');
      const unit = document.createElement('div');
      unit.className = 'card-unit';
      unit.setAttribute('data-gtc-parent', '7');
      unit.innerHTML = '<div class="reading-card" data-gtc-main-card="7" data-index="7"></div>';
      host.appendChild(unit);
      window.__gtcDemo.state.mainCards.push({ positionIndex: 7, cardId: 7, orientation: 'upright', revealed: false });
      window.__gtcDemo.render();
    });
    await wait(80);
    const after = await page.evaluate(() => window.__gtcDemo.connector._observedEls.size);
    if (after !== before + 1) throw new Error(`observation count ${before}->${after}, expected +1`);
    const hasNew = await page.evaluate(() => {
      const el = document.querySelector('[data-gtc-main-card="7"]');
      return window.__gtcDemo.connector._observedEls.has(el);
    });
    if (!hasNew) throw new Error('new main card not observed');
    await page.evaluate(() => window.__gtcDemo.connector.destroy());
    const afterDestroy = await page.evaluate(() => window.__gtcDemo.connector._observedEls.size);
    if (afterDestroy !== 0) throw new Error(`observations not released on destroy (${afterDestroy} remain)`);
  });

  // ---- P2-A: geometry within 2px ----

  await test('19. P2-A: geometry within 2px at 360/390/1280', async () => {
    await page.evaluate(() => {
      window.__gtcDemo.connector.options.forceReducedMotion = true;
      window.__gtcDemo.mount();
    });
    for (const width of [360, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await setState({
        spreadId: 'geo',
        mainCards: [
          { positionIndex: 0, cardId: 0, orientation: 'upright', revealed: true },
          { positionIndex: 1, cardId: 1, orientation: 'upright', revealed: true }
        ],
        clarifiers: { 0: [
          { slot: 1, cardId: 2, revealed: true },
          { slot: 2, cardId: 3, revealed: true }
        ] }
      });
      await wait(120);
      const geo = await page.evaluate(() => {
        const container = document.getElementById('gtcDemo');
        const base = container.getBoundingClientRect();
        const anchor = (el, edge) => {
          const r = el.getBoundingClientRect();
          const x = r.left - base.left + r.width / 2;
          const y = edge === 'bottom' ? r.bottom - base.top : r.top - base.top;
          return { x, y };
        };
        const parent = document.querySelector('[data-gtc-parent="0"] [data-gtc-main-card="0"]');
        const clar1 = document.querySelector('[data-gtc-parent="0"] [data-gtc-clarifier="1"]');
        const clar2 = document.querySelector('[data-gtc-parent="0"] [data-gtc-clarifier="2"]');
        const next = document.querySelector('[data-gtc-main-card="1"]');
        const read = (key) => {
          const g = document.querySelector(`[data-gtc-key="${key}"]`);
          if (!g) return null;
          return {
            fromX: parseFloat(g.getAttribute('data-gtc-from-x')),
            fromY: parseFloat(g.getAttribute('data-gtc-from-y')),
            toX: parseFloat(g.getAttribute('data-gtc-to-x')),
            toY: parseFloat(g.getAttribute('data-gtc-to-y'))
          };
        };
        return {
          container: { w: base.width, h: base.height },
          parent: anchor(parent, 'bottom'),
          clar1: anchor(clar1, 'top'),
          clar2: anchor(clar2, 'top'),
          next: anchor(next, 'top'),
          segC1: read('main:0:clarifier:1'),
          segC2: read('main:0:clarifier:2'),
          segNext: read('main:0:next:1')
        };
      });
      const check = (name, a, b) => {
        if (Math.abs(a - b) > 2) throw new Error(`width ${width}: ${name} ${a.toFixed(2)} vs ${b.toFixed(2)}`);
      };
      if (!geo.segC1 || !geo.segC2 || !geo.segNext) {
        throw new Error(`width ${width}: missing expected segments`);
      }
      check('c1 from-x', geo.segC1.fromX, geo.parent.x);
      check('c1 from-y', geo.segC1.fromY, geo.parent.y);
      check('c1 to-x', geo.segC1.toX, geo.clar1.x);
      check('c1 to-y', geo.segC1.toY, geo.clar1.y);
      check('c2 to-x', geo.segC2.toX, geo.clar2.x);
      check('next to-x', geo.segNext.toX, geo.next.x);
      // Genuine containment: endpoints must fall inside the container.
      [geo.segC1, geo.segC2, geo.segNext].forEach((s, i) => {
        [s.fromX, s.toX].forEach((x) => {
          if (x < 0 || x > geo.container.w) throw new Error(`width ${width}: seg ${i} x=${x} outside container 0..${geo.container.w}`);
        });
        [s.fromY, s.toY].forEach((y) => {
          if (y < 0 || y > geo.container.h) throw new Error(`width ${width}: seg ${i} y=${y} outside container 0..${geo.container.h}`);
        });
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
  });

  // ---- Pointer pass-through ----

  await test('20. overlay does not capture pointers', async () => {
    await page.evaluate(() => window.__gtcDemo.mount());
    const pe = await page.locator('svg.gtc-overlay').evaluate((el) => getComputedStyle(el).pointerEvents);
    if (pe !== 'none') throw new Error(`overlay pointer-events must be none, got ${pe}`);
    await page.click('#revealC1').catch(() => {});
    const revealed = await page.locator('[data-gtc-parent="0"] [data-gtc-clarifier="1"]').evaluate((el) => el.classList.contains('revealed'));
    if (!revealed) throw new Error('click was blocked by overlay');
  });

  // ---- Mid-flight destroy ----

  await test('21. mid-flight destroy raises no page error', async () => {
    errors.length = 0;
    await page.evaluate(() => {
      window.__gtcDemo.reset();
      window.__gtcDemo.connector.options.forceReducedMotion = false;
      window.__gtcDemo.mount();
      window.__gtcDemo.revealMain(0);
      window.__gtcDemo.revealClarifier(1);
      window.__gtcDemo.connector.destroy();
    });
    await wait(150);
    if (errors.length) throw new Error('page error during mid-flight destroy: ' + errors[0]);
  });

  // ---- No phantom cards ----

  await test('22. no phantom main cards or clarifier slots', async () => {
    const before = await page.locator('.clarifier-slot').count();
    await page.evaluate(() => window.__gtcDemo.mount());
    const after = await page.locator('.clarifier-slot').count();
    if (before !== after) throw new Error('controller created clarifier slots');
    if (await page.locator('.reading-card').count() < 2) throw new Error('controller removed main cards');
  });

  // ---- P1-D: demo sequencing ----

  await test('23. P1-D demo: clarifier 2 stays face down until clarifier 1', async () => {
    await page.evaluate(() => { window.__gtcDemo.reset(); window.__gtcDemo.mount(); });
    await page.evaluate(() => window.__gtcDemo.revealMain(0));
    await page.click('#revealC2').catch(() => {});
    const c2Revealed = await page.locator('[data-gtc-parent="0"] [data-gtc-clarifier="2"]').evaluate((el) => el.classList.contains('revealed'));
    if (c2Revealed) throw new Error('clarifier 2 revealed before clarifier 1');
    const hasSeg = await page.evaluate(() => !!document.querySelector('[data-gtc-key="main:0:clarifier:2"]'));
    if (hasSeg) throw new Error('connector reached clarifier 2 before eligibility');
    await page.click('#revealC1').catch(() => {});
    await page.click('#revealC2').catch(() => {});
    const c2Now = await page.locator('[data-gtc-parent="0"] [data-gtc-clarifier="2"]').evaluate((el) => el.classList.contains('revealed'));
    if (!c2Now) throw new Error('clarifier 2 did not reveal after clarifier 1');
  });

  // ---- Report ----

  await browser.close();
  server.close();
  const passed = results.filter((r) => r.pass).length;
  results.forEach((r) => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : ' — ' + r.error}`));
  console.log(`\n${passed}/${results.length} passed`);
  if (passed !== results.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exit(1); });
