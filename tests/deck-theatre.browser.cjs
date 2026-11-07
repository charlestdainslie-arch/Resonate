/* Deck theatre: 78-card deck, cinematic shuffle and deal (6 Nov 2026).
 * Run: node tests/deck-theatre.browser.cjs   Requires: playwright + chromium
 * Checks, on presenter-uat.html, for 1/3/5/7/10-card spreads at 390 and 1280 px:
 *   - 78 cards in the deck on the table; empty outlines until dealt
 *   - integrity: dealt cards == top of the shuffled data deck == the reading's cards; no duplicates
 *   - the animation draws no randomness from Math.random; the shuffle takes exactly 77 numbers from
 *     crypto.getRandomValues (secure randomness for live draws, approved 7 Nov 2026) and none from Math.random
 *   - every flying card lands on its slot (within 1 px), slots dealt in position order
 *   - one deal per double tap; buttons locked while busy; Skip finishes quickly
 *   - reduced motion: no flights, immediate deal; leaving mid-deal commits nothing
 *   - frame timing during shuffle + deal at 4x CPU slowdown (reported; a coarse stand-in for a phone)
 * Writes test-results/deck-theatre.json. */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const SPREADS = { guidance: 1, three: 3, relationship: 5, seven: 7, celtic: 10 };
let base;
async function openTable(browser, spread, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/presenter-uat.html');
  await page.evaluate(() => go('reading'));
  await page.locator(`[data-spread="${spread}"]`).click();
  await page.waitForSelector('.dt-deck');
  // Instrument: Math.random calls, commits, flight landings.
  await page.evaluate(() => {
    const real = Math.random; window.__rand = 0; Math.random = function () { window.__rand++; return real(); };
    const gv = crypto.getRandomValues.bind(crypto); window.__crypto = 0; crypto.getRandomValues = function (a) { window.__crypto++; return gv(a); };
    const c = commitDraw; window.__commits = 0; commitDraw = function () { window.__commits++; window.__randAtCommit = window.__rand; return c.apply(this, arguments); };
    window.__landings = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (!n.classList || !n.classList.contains('dt-flyer')) return;
      const i = +n.dataset.dealIndex; const a = n.getAnimations()[0];
      if (a) a.finished.then(() => { const slot = document.querySelectorAll('.stage-board > .stage-position')[i].querySelector('.stage-card').getBoundingClientRect(); const f = n.getBoundingClientRect();
        window.__landings.push({ i, dx: Math.abs(f.left - slot.left), dy: Math.abs(f.top - slot.top), dw: Math.abs(f.width - slot.width), dh: Math.abs(f.height - slot.height) }); }).catch(() => {});
    }))).observe(document.body, { childList: true, subtree: true });
  });
  return { page, errors };
}
const idle = page => page.waitForFunction(() => !window.ResonateDeckTheatre.busy, null, { timeout: 30000 });
server.listen(0, '127.0.0.1', async () => {
  base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const results = []; let pass = 0, fail = 0;
  const check = async (name, fn) => { try { const r = await fn(); console.log('PASS ', name + (r ? '  ' + r : '')); pass++; } catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 300)); fail++; } };

  for (const [spread, n] of Object.entries(SPREADS)) for (const width of [390, 1280]) {
    await check(`${spread} (${n}) @${width}: shuffle + deal, integrity and landing`, async () => {
      const { page, errors } = await openTable(browser, spread, width);
      const rest = await page.evaluate(() => ({ deck: document.querySelectorAll('.dt-deck .dt-card').length, awaiting: document.querySelectorAll('.stage-position.dt-await').length, slots: document.querySelectorAll('.stage-board > .stage-position').length }));
      assert.equal(rest.deck, 78, 'full deck on the table'); assert.equal(rest.awaiting, rest.slots, 'all positions empty before the deal');
      await page.locator('#shuffleCardsBtn').click();
      assert.equal(await page.locator('#stageDrawBtn').isDisabled(), true, 'deal locked while shuffling');
      await idle(page);
      const randShuffle = await page.evaluate(() => ({ math: window.__rand, crypto: window.__crypto }));
      assert.deepEqual(randShuffle, { math: 0, crypto: 77 }, 'shuffle took 77 secure numbers (Fisher–Yates of 78) and no Math.random; animation used none');
      const top = await page.evaluate(() => state.shuffledDeck.slice(0, state.spreadSize));
      await page.locator('#stageDrawBtn').click();
      await page.locator('#stageDrawBtn').click({ force: true, timeout: 1000 }).catch(() => {});   // double tap
      await page.waitForFunction(() => state.view === 'draw', null, { timeout: 30000 });
      const r = await page.evaluate(() => ({ drawn: [...state.drawnCardIds], dealt: window.__resonateDealt, commits: window.__commits, randDeal: window.__randAtCommit, landings: window.__landings }));
      assert.deepEqual(r.dealt, top, 'dealt = top of the shuffled deck'); assert.deepEqual(r.drawn, top, 'reading = dealt cards');
      assert.equal(new Set(r.drawn).size, n, 'no duplicate card ids');
      assert.equal(r.commits, 1, 'one deal for a double tap');
      assert.equal(r.randDeal, 0, 'dealing used no Math.random before the reading was committed');
      assert.equal(r.landings.length, n, 'one flight per position');
      assert.deepEqual(r.landings.map(l => l.i), [...Array(n).keys()], 'dealt in position order');
      r.landings.forEach(l => assert.ok(l.dx <= 1 && l.dy <= 1 && l.dw <= 1 && l.dh <= 1, 'card lands on its slot: ' + JSON.stringify(l)));
      await page.waitForFunction(() => state.drawSettled, null, { timeout: 30000 });
      assert.equal(await page.locator('.dt-theatre').count(), 0, 'theatre removed after the deal');
      assert.deepEqual(errors, []);
      results.push({ spread, width, landings: r.landings });
      await page.close();
      return `max landing error ${Math.max(...r.landings.map(l => Math.max(l.dx, l.dy, l.dw, l.dh))).toFixed(2)} px`;
    });
  }
  await check('reduced motion: no flights, immediate deal, same integrity', async () => {
    const { page, errors } = await openTable(browser, 'celtic', 390, { reduced: true });
    await page.locator('#shuffleCardsBtn').click();
    const top = await page.evaluate(() => state.shuffledDeck.slice(0, state.spreadSize));
    await page.locator('#stageDrawBtn').click();
    await page.waitForFunction(() => state.view === 'draw', null, { timeout: 5000 });
    assert.deepEqual(await page.evaluate(() => state.drawnCardIds), top);
    assert.equal(await page.evaluate(() => window.__landings.length), 0, 'no flights');
    assert.deepEqual(errors, []); await page.close();
  });
  await check('Skip finishes the shuffle and the deal quickly, same integrity', async () => {
    const { page, errors } = await openTable(browser, 'celtic', 390);
    await page.locator('#shuffleCardsBtn').click(); await page.waitForTimeout(300);
    let t0 = Date.now(); await page.locator('.dt-skip').click(); await idle(page); const skipShuffle = Date.now() - t0;
    const top = await page.evaluate(() => state.shuffledDeck.slice(0, state.spreadSize));
    await page.locator('#stageDrawBtn').click(); await page.waitForTimeout(400);
    t0 = Date.now(); await page.locator('.dt-skip').click(); await page.waitForFunction(() => state.view === 'draw', null, { timeout: 8000 }); const skipDeal = Date.now() - t0;
    assert.ok(skipShuffle < 1500, 'shuffle skip ' + skipShuffle); assert.ok(skipDeal < 3000, 'deal skip ' + skipDeal);
    assert.deepEqual(await page.evaluate(() => state.drawnCardIds), top);
    assert.deepEqual(errors, []); await page.close();
    return `shuffle skip ${skipShuffle} ms, deal skip ${skipDeal} ms`;
  });
  await check('leaving the table mid-deal commits nothing and leaves no theatre', async () => {
    const { page, errors } = await openTable(browser, 'celtic', 390);
    await page.locator('#stageDrawBtn').click(); await page.waitForTimeout(1500);
    await page.evaluate(() => go('reading'));
    await page.waitForTimeout(4000);
    assert.equal(await page.evaluate(() => state.view), 'reading');
    assert.equal(await page.evaluate(() => window.__commits), 0, 'no late deal');
    assert.equal(await page.locator('.dt-theatre').count(), 0);
    assert.deepEqual(errors, []); await page.close();
  });
  for (const [w, h] of [[360, 800], [412, 915]]) {
    await check(`Android ${w}x${h}: rotate to landscape mid-shuffle and mid-deal; still the right cards on the right slots`, async () => {
      const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/presenter-uat.html'); await page.evaluate(() => go('reading'));
      await page.locator('[data-spread="celtic"]').click(); await page.waitForSelector('.dt-deck');
      await page.locator('#shuffleCardsBtn').click(); await page.waitForTimeout(700);
      await page.setViewportSize({ width: h, height: w }); await idle(page);
      const top = await page.evaluate(() => state.shuffledDeck.slice(0, state.spreadSize));
      await page.locator('#stageDrawBtn').click(); await page.waitForTimeout(1800);
      await page.setViewportSize({ width: w, height: h });
      await page.waitForFunction(() => state.view === 'draw', null, { timeout: 40000 });
      assert.deepEqual(await page.evaluate(() => state.drawnCardIds), top);
      await page.waitForFunction(() => state.drawSettled, null, { timeout: 30000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no sideways scroll');
      assert.deepEqual(errors, []); await page.close();
    });
    await check(`Android ${w}x${h}: rapid taps give one shuffle and one deal`, async () => {
      const { page, errors } = await openTable(browser, 'three', w);
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => { for (let i = 0; i < 6; i++) document.getElementById('shuffleCardsBtn').click(); });
      assert.equal(await page.evaluate(() => state.shuffleCount), 1, 'one shuffle for six taps');
      await idle(page);
      await page.evaluate(() => { for (let i = 0; i < 6; i++) document.getElementById('stageDrawBtn').click(); });
      await page.waitForFunction(() => state.view === 'draw', null, { timeout: 30000 }); await page.waitForTimeout(800);
      assert.equal(await page.evaluate(() => window.__commits), 1, 'one deal for six taps');
      assert.deepEqual(errors, []); await page.close();
    });
    await check(`Android ${w}x${h}: reset — leave mid-shuffle, come back, shuffle and draw normally`, async () => {
      const { page, errors } = await openTable(browser, 'relationship', w);
      await page.setViewportSize({ width: w, height: h });
      await page.locator('#shuffleCardsBtn').click(); await page.waitForTimeout(600);
      await page.locator('.back-link').first().click();
      assert.equal(await page.evaluate(() => state.view), 'reading');
      assert.equal(await page.locator('.dt-theatre').count(), 0, 'theatre gone');
      await page.locator('[data-spread="relationship"]').click(); await page.waitForSelector('.dt-deck');
      assert.equal(await page.evaluate(() => window.ResonateDeckTheatre.busy), false, 'not stuck busy');
      assert.equal(await page.locator('#shuffleCardsBtn').isDisabled(), false);
      await page.locator('#shuffleCardsBtn').click(); await idle(page);
      await page.locator('#stageDrawBtn').click(); await page.waitForFunction(() => state.view === 'draw', null, { timeout: 30000 });
      assert.deepEqual(errors, []); await page.close();
    });
  }
  await check('Skip pressed repeatedly and between phases never leaves the table busy', async () => {
    const { page, errors } = await openTable(browser, 'seven', 390);
    for (const at of [0, 120, 500, 900]) {
      await page.locator('#shuffleCardsBtn').click(); await page.waitForTimeout(at);
      await page.evaluate(() => { const b = document.querySelector('.dt-skip'); for (let i = 0; i < 3; i++) b && b.click(); });
      await idle(page);
    }
    assert.equal(await page.evaluate(() => window.ResonateDeckTheatre.busy), false);
    await page.locator('#stageDrawBtn').click(); await page.waitForTimeout(250);
    await page.evaluate(() => { const b = document.querySelector('.dt-skip'); for (let i = 0; i < 3; i++) b && b.click(); });
    await page.waitForFunction(() => state.view === 'draw', null, { timeout: 8000 });
    assert.deepEqual(errors, []); await page.close();
  });
  await check('frame timing, shuffle + deal, Celtic Cross @390 with 4x CPU slowdown (reported)', async () => {
    const { page, errors } = await openTable(browser, 'celtic', 390);
    const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluate(() => { window.__frames = []; let last = performance.now(); (function f(t) { window.__frames.push(t - last); last = t; if (window.__frames.length < 4000) requestAnimationFrame(f); })(performance.now()); });
    await page.locator('#shuffleCardsBtn').click(); await idle(page);
    await page.locator('#stageDrawBtn').click(); await page.waitForFunction(() => state.view === 'draw', null, { timeout: 60000 });
    const f = await page.evaluate(() => window.__frames.slice(2));
    const s = [...f].sort((a, b) => a - b), p = q => s[Math.floor(q * (s.length - 1))];
    const stats = { frames: f.length, median: +p(0.5).toFixed(1), p95: +p(0.95).toFixed(1), over50: f.filter(x => x > 50).length };
    results.push({ timing_cpu4x: stats });
    assert.deepEqual(errors, []); await page.close();
    return JSON.stringify(stats);
  });
  fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'test-results', 'deck-theatre.json'), JSON.stringify(results, null, 1));
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
