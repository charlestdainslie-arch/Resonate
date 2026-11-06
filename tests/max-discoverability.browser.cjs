/* ▶ Watch Max is findable on a phone (Samsung UAT, 6 Nov 2026).
 * Chas, Celtic Cross on a Samsung, card 5 of 10: the ribbon said "tap Watch Max" but the launcher was
 * at the top of the reading, off screen. Checks on presenter-uat.html at Samsung sizes, through the real
 * deck theatre (Shuffle, Draw) with clarifiers:
 *   - while cards are still revealing, the floating button is hidden
 *   - once revealed, at card 5 (top launcher off screen) the floating ▶ Watch Max is visible, on screen
 *     and the topmost element where it is tapped
 *   - at the top of the reading (launcher visible) the floating button hides (no duplicate)
 *   - tapping it opens Max: captions change on Play, Pause shows Resume, Replay restarts at part 1,
 *     closing brings the button back; Max's script includes the clarifiers
 * Screenshots: test-results/max-discoverability-<width>-*.png
 * Run: node tests/max-discoverability.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const majorsFirst = require('./helpers/majors-first.cjs');
const inView = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }, sel);
server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0, fail = 0;
  for (const [w, h] of [[360, 800], [412, 915]]) {
    const name = `Samsung-size ${w}x${h}, Celtic Cross with clarifiers`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(majorsFirst);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(base + '/presenter-uat.html');
      await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} go('reading'); });
      await page.locator('[data-spread="celtic"]').click();
      await page.waitForSelector('.dt-deck');
      await page.evaluate(() => document.getElementById('shuffleCardsBtn').click());
      await page.waitForFunction(() => !window.ResonateDeckTheatre.busy, null, { timeout: 30000 });
      await page.evaluate(() => document.getElementById('stageDrawBtn').click());
      await page.waitForFunction(() => state.view === 'draw', null, { timeout: 60000 });
      // While revealing: hidden.
      if (!(await page.evaluate(() => state.drawSettled))) {
        await page.evaluate(() => document.querySelectorAll('.reading-position')[4].scrollIntoView({ block: 'center' }));
        assert.equal(await inView(page, '#mcFloat'), false, 'floating button hidden while cards are revealing');
      }
      await page.waitForFunction(() => state.drawSettled, null, { timeout: 60000 });
      // Chas's view: card 5 of 10, launcher at the top off screen.
      await page.evaluate(() => document.querySelectorAll('.reading-position')[4].scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      assert.equal(await inView(page, '#mcOpen'), false, 'top launcher is off screen at card 5 (the reported problem)');
      assert.equal(await inView(page, '#mcFloat'), true, 'floating ▶ Watch Max visible at card 5');
      assert.equal(await page.evaluate(() => { const b = document.getElementById('mcFloat').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && !!e.closest('#mcFloat'); }), true, 'nothing covers it');
      const box = await page.locator('#mcFloat').boundingBox();
      assert.ok(box.height >= 44 && box.x + box.width <= w && box.y + box.height <= h, 'thumb-sized and fully on screen: ' + JSON.stringify(box));
      await page.screenshot({ path: path.join(OUT, `max-discoverability-${w}-card5.png`) });
      // Top of the reading: launcher visible, floating button hides.
      await page.evaluate(() => document.getElementById('mcOpen').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      assert.equal(await inView(page, '#mcFloat'), false, 'no duplicate while the top launcher is visible');
      // Clarifiers (Majors dealt first, so the rule applies), then back to card 5.
      for (let i = 0; i < 2; i++) {
        const has = await page.locator('#primaryClarifierAction').count();
        if (!has || !/Clarifier/.test(await page.locator('#primaryClarifierAction').innerText())) break;
        await page.evaluate(() => document.getElementById('primaryClarifierAction').click());
        await page.waitForFunction(() => state.drawSettled, null, { timeout: 60000 }); await page.waitForTimeout(1500);
      }
      const chapters = await page.evaluate(() => [...new Set(ResonatePresenter.buildScript().map(p => p.chapter))]);
      assert.ok(chapters.includes('c1'), "Max's script includes the clarifiers: " + chapters.join(','));
      await page.evaluate(() => document.querySelectorAll('.reading-position')[4].scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      assert.equal(await inView(page, '#mcFloat'), true, 'floating button still there after clarifiers');
      // Tap it: Max opens, plays with captions, pauses, replays, closes.
      await page.locator('#mcFloat').tap();
      await page.waitForSelector('.mc-player');
      assert.equal(await inView(page, '#mcFloat'), false, 'hidden while Max is open');
      await page.locator('#mcSound').tap();                       // muted: captions-only timing, no device speech
      const before = await page.locator('#mcCaption').innerText();
      await page.locator('#mcPlay').tap();
      await page.waitForFunction(b => document.getElementById('mcCaption').innerText !== b, before, { timeout: 8000 });
      assert.match(await page.locator('#mcPlay').innerText(), /Pause/, 'playing');
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `max-discoverability-${w}-player.png`) });
      await page.locator('#mcPlay').tap();
      assert.match(await page.locator('#mcPlay').innerText(), /Resume/, 'paused');
      await page.locator('#mcReplay').tap();
      await page.waitForFunction(() => /^Part 1 of/.test(document.getElementById('mcPart').textContent), null, { timeout: 5000 });
      await page.locator('#mcClose').tap();
      await page.waitForSelector('.mc-player', { state: 'detached' });
      await page.waitForTimeout(500);
      assert.equal(await inView(page, '#mcFloat'), true, 'back after closing Max');
      // Leaving the reading removes it.
      await page.evaluate(() => go('home')); await page.waitForTimeout(500);
      assert.equal(await page.locator('#mcFloat').count(), 0, 'gone away from the reading');
      assert.deepEqual(errors.filter(e => !/manifest\.json/.test(e)), []);
      console.log('PASS ', name); pass++;
    } catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 300)); fail++; }
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
