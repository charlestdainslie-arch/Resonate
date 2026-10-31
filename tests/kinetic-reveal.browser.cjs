/* Kinetic reel reveal (Issue #48) — browser checks on kinetic-uat.html.
 * Run: node tests/kinetic-reveal.browser.cjs   (Playwright + Chromium)
 * Compares against index.html (the app without the reveal) using seeded draws.
 */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
function serve() { return new Promise(r => { const s = http.createServer((req, res) => { let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html'; const f = path.join(ROOT, u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); }); }
const SEED = seed => { let a = seed >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const SPREADS = ['guidance', 'three', 'relationship', 'seven', 'celtic'];

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let passed = 0; const failures = [];
  async function page(w, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 860 : 900 }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(SEED, opts.seed || 7);
    const p = await ctx.newPage(); p.__errors = [];
    p.on('pageerror', e => p.__errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/attribute d: Expected number/.test(m.text())) p.__errors.push(m.text()); });
    await p.goto(`${base}/${opts.plain ? 'index.html' : 'kinetic-uat.html'}`); await p.waitForTimeout(300);
    return { ctx, p };
  }
  async function check(name, fn) {
    try { await fn(); passed++; console.log('PASS', name); }
    catch (e) { failures.push(`FAIL ${name}: ${e.message.split('\n')[0]}`); console.log('FAIL', name, '—', e.message.split('\n')[0]); }
  }
  async function toStage(p, spread) {
    await p.getByRole('button', { name: 'Get a Reading', exact: true }).first().click(); await p.waitForTimeout(150);
    await p.locator(`[data-spread="${spread}"]`).click(); await p.waitForTimeout(150);
    await p.locator('#shuffleCardsBtn').click(); await p.waitForFunction(() => !document.querySelector('#shuffleCardsBtn')?.disabled, null, { timeout: 10000 });
  }
  // Watches every frame: drawn cards never change, reels hold only symbols, nothing spins after settle.
  async function watch(p) {
    await p.evaluate(() => {
      window.__w = { ids: [], changed: false, maxReels: 0, cardImgInReel: 0, reelAfterSettle: 0 };
      const tick = () => {
        const ids = (state.drawnCardIds || []).join(',');
        if (state.view === 'draw') { if (!window.__w.ids.length) window.__w.ids = [ids]; else if (ids !== window.__w.ids[0]) window.__w.changed = true; }
        const reels = document.querySelectorAll('.kr-reel');
        window.__w.maxReels = Math.max(window.__w.maxReels, reels.length);
        reels.forEach(r => { window.__w.cardImgInReel += r.querySelectorAll('img').length; });
        if (state.drawSettled && reels.length) window.__w.reelAfterSettle++;
        window.__wRaf = requestAnimationFrame(tick);
      };
      tick();
    });
  }

  // 1. Every spread at four widths: frozen cards, reels then reveal, faces match the draw.
  for (const w of [360, 390, 768, 1280]) for (const sp of SPREADS) {
    await check(`${sp} at ${w}px: reels spin, stop, cards flip to exactly the drawn cards`, async () => {
      const { ctx, p } = await page(w, { seed: w + sp.length });
      await toStage(p, sp);
      await watch(p);
      const t0 = Date.now();
      await p.locator('#stageDrawBtn').click();
      await p.waitForFunction(() => state.drawSettled, null, { timeout: 15000 });
      const ms = Date.now() - t0;
      await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({
        w: window.__w, n: currentSpread().positions.length, ids: state.drawnCardIds.slice(),
        faces: [...document.querySelectorAll('.reading-card')].map(el => Number(el.dataset.readingCard)),
        revealed: document.querySelectorAll('.reading-card.revealed').length, facedown: document.querySelectorAll('.reading-card.is-facedown').length,
        reelsLeft: document.querySelectorAll('.kr-reel').length, skip: !!document.getElementById('krSkip'),
        waiting: !!document.querySelector('#readingInterpretation.waiting'),
        unique: new Set(state.drawnCardIds).size, sideScroll: document.documentElement.scrollWidth > innerWidth + 1,
        status: document.getElementById('drawStatus')?.textContent
      }));
      assert.ok(!r.w.changed, 'drawn cards changed during animation');
      assert.equal(r.w.maxReels, r.n, `one reel per position (saw ${r.w.maxReels})`);
      assert.equal(r.w.cardImgInReel, 0, 'reels show no tarot card faces');
      assert.equal(r.w.reelAfterSettle, 0, 'no reel visible after settle');
      assert.deepEqual(r.faces, r.ids, 'each position shows its drawn card');
      assert.equal(r.unique, r.n, 'no repeated card');
      assert.equal(r.revealed, r.n); assert.equal(r.facedown, 0); assert.equal(r.reelsLeft, 0);
      assert.ok(!r.skip, 'Skip removed'); assert.ok(!r.waiting, 'reading text shown');
      assert.ok(!r.sideScroll, 'no page side-scroll');
      assert.match(r.status, /Your spread is ready/);
      assert.ok(ms < 7000, `settles in under 7 s (${ms} ms)`);
      assert.deepEqual(p.__errors, []);
      await ctx.close();
    });
  }

  // 2. Same seed: identical cards and reading text with and without the reveal.
  for (const sp of ['three', 'celtic']) {
    await check(`${sp}: same cards and same reading text as the app without the reveal`, async () => {
      const grab = async plain => {
        const { ctx, p } = await page(390, { seed: 4242, plain });
        await toStage(p, sp); await p.locator('#stageDrawBtn').click();
        await p.waitForFunction(() => state.drawSettled, null, { timeout: 15000 }); await p.waitForTimeout(300);
        const out = await p.evaluate(() => ({ ids: state.drawnCardIds.join(','), text: document.getElementById('readingInterpretation').innerText.replace(/Planetary positions calculated for[^\n]*/, '') }));
        await ctx.close(); return out;
      };
      const a = await grab(false), b = await grab(true);
      assert.equal(a.ids, b.ids); assert.equal(a.text, b.text);
    });
  }

  // 3. Clarifiers after the reveal follow the app's own rules: up to two layers, no repeats.
  for (const sp of ['three', 'relationship']) {
    await check(`${sp}: clarifier layers 1 and 2 after the reveal, no reels, no repeats`, async () => {
      const { ctx, p } = await page(390, { seed: 99 });
      await toStage(p, sp); await p.locator('#stageDrawBtn').click();
      await p.waitForFunction(() => state.drawSettled, null, { timeout: 15000 });
      for (const n of [1, 2]) {
        await p.locator('#primaryClarifierAction').click();
        await p.waitForFunction(n => n === 1 ? state.firstLayerClarifiers?.length : state.additionalClarifierLayers?.length, n, { timeout: 15000 });
        await p.waitForTimeout(600);
        assert.equal(await p.locator('.kr-reel').count(), 0, 'no reel on clarifiers');
      }
      const r = await p.evaluate(() => {
        const all = [...state.drawnCardIds, ...(state.firstLayerClarifiers || []).flat(), ...(state.additionalClarifierLayers || []).flatMap(l => l.cards || [])].map(c => typeof c === 'object' && c ? (c.id ?? c.cardId) : c).filter(v => v != null);
        return { n: state.drawnCardIds.length, total: all.length, unique: new Set(all).size, third: !!document.querySelector('#primaryClarifierAction:not([disabled])') && /clarif/i.test(document.querySelector('#primaryClarifierAction')?.textContent || '') };
      });
      assert.equal(r.total, r.n * 3, `cards + two clarifier layers (${r.total})`);
      assert.equal(r.unique, r.total, 'no card repeated across reading and clarifiers');
      assert.deepEqual(p.__errors, []);
      await ctx.close();
    });
  }

  // 4. Reduced motion: no reels at all, instant reveal.
  await check('reduced motion: no reels, cards revealed straight away', async () => {
    const { ctx, p } = await page(390, { reduced: true });
    await toStage(p, 'celtic'); await watch(p);
    await p.locator('#stageDrawBtn').click();
    await p.waitForFunction(() => state.drawSettled, null, { timeout: 3000 });
    const w = await p.evaluate(() => window.__w);
    assert.equal(w.maxReels, 0);
    assert.equal(await p.locator('#krSkip').count(), 0);
    await ctx.close();
  });

  // 5. Skip: settles at once, nothing left running.
  await check('Skip animation settles every card at once and leaves no timers', async () => {
    const { ctx, p } = await page(390);
    await toStage(p, 'celtic'); await p.locator('#stageDrawBtn').click();
    await p.waitForTimeout(500);
    assert.ok(await p.locator('.kr-reel').count() > 0, 'spinning before skip');
    await p.locator('#krSkip').click();
    const r = await p.evaluate(() => ({ settled: state.drawSettled, revealed: document.querySelectorAll('.reading-card.revealed').length, n: state.drawnCardIds.length, reels: document.querySelectorAll('.kr-reel').length, timers: drawTimers.length }));
    assert.ok(r.settled); assert.equal(r.revealed, r.n); assert.equal(r.reels, 0); assert.equal(r.timers, 0);
    await p.waitForTimeout(5500);
    assert.equal(await p.locator('.kr-glint').count(), 0, 'no late glints');
    assert.deepEqual(p.__errors, []);
    await ctx.close();
  });

  // 6. Back mid-spin: timers cancelled, no late work, a fresh draw works.
  await check('Back to spreads mid-spin cancels everything; next draw is clean', async () => {
    const { ctx, p } = await page(390);
    await toStage(p, 'seven'); await p.locator('#stageDrawBtn').click();
    await p.waitForTimeout(600);
    await p.getByRole('button', { name: /Back to spreads/ }).first().click();
    await p.waitForTimeout(5000);
    const r = await p.evaluate(() => ({ view: state.view, timers: drawTimers.length, reels: document.querySelectorAll('.kr-reel,.kr-glint').length }));
    assert.notEqual(r.view, 'draw'); assert.equal(r.timers, 0); assert.equal(r.reels, 0);
    await p.locator('[data-spread="three"]').click(); await p.waitForTimeout(150);
    await p.locator('#stageDrawBtn').click();
    await p.waitForFunction(() => state.drawSettled, null, { timeout: 15000 });
    assert.equal(await p.locator('.reading-card.revealed').count(), 3);
    assert.deepEqual(p.__errors, []);
    await ctx.close();
  });

  // 7. Rapid input: hammering Draw and tapping cards mid-spin never double-draws or breaks.
  await check('rapid taps: Draw ×5 then card taps mid-spin — one draw, no errors', async () => {
    const { ctx, p } = await page(390);
    await toStage(p, 'relationship');
    await p.evaluate(() => { window.__starts = 0; const s = startDraw; startDraw = function () { window.__starts++; return s.apply(this, arguments); }; document.getElementById('stageDrawBtn').onclick = startDraw; });
    // Five real taps on the Draw button's spot, 40 ms apart: once the reading appears, later taps land on the page.
    const box = await p.locator('#stageDrawBtn').boundingBox();
    for (let i = 0; i < 5; i++) { await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(40); }
    assert.equal(await p.evaluate(() => window.__starts), 1, 'Draw ran once');
    assert.equal(await p.evaluate(() => window.__kineticReveal.runId), 1, 'one reel run');
    // Later taps may land on a spinning card, which opens its detail page (as in the app). Then come back.
    await p.waitForTimeout(400);
    if (await p.evaluate(() => state.view) === 'draw' && !(await p.evaluate(() => state.drawSettled))) await p.locator('.reading-card').first().click();
    await p.waitForTimeout(300);
    if (await p.evaluate(() => state.view) === 'detail') await p.getByRole('button', { name: /Back to reading|Return to reading/ }).first().click();
    await p.waitForTimeout(600);
    assert.equal(await p.evaluate(() => state.view), 'draw', 'back on the reading');
    assert.equal(await p.evaluate(() => state.drawSettled), true, 'reading settled');
    assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('.reading-card')].map(e => Number(e.dataset.readingCard))), await p.evaluate(() => state.drawnCardIds.slice()), 'same cards after returning');
    const r = await p.evaluate(() => ({ view: state.view, settled: state.drawSettled, reels: document.querySelectorAll('.kr-reel').length, timers: drawTimers.length }));
    assert.equal(r.reels, 0); assert.equal(r.timers, 0);
    assert.deepEqual(p.__errors, []);
    await ctx.close();
  });

  // 8. The normal app page is untouched.
  await check('index.html does not load the reveal', async () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.ok(!/kinetic/.test(html));
  });

  await browser.close(); server.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} kinetic reveal checks`);
})();
