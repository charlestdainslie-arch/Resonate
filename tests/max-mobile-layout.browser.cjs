/* Max on Samsung-sized screens: nothing clipped, nothing covered (Chas's Samsung UAT, 8 Nov 2026, P2).
 * "Celtic Cross first card clipped on the left edge" and "the floating control overlapping the caption panel".
 * All five spreads at 360x800, 384x854 and 412x915, on presenter-uat.html with fixed QA readings:
 *   - opening Max: the strip starts at card 1; card 1's picture, border and highlight are fully inside the strip's
 *     visible area and the screen; no sideways page scroll
 *   - every card visible in the strip keeps its proportions (picture ratio as designed) and is not cut top/bottom
 *   - the caption, Play and the clarify bar do not overlap: each is the topmost element at its own centre,
 *     the caption ends above the controls, the controls above the bar
 *   - after clarifying a card inside Max (as far as the rule allows), the picked card and its clarifiers are
 *     fully inside the strip once it has scrolled to them; a reversed card is shown rotated
 * Screenshots: test-results/max-mobile-<spread>-<width>-{open,clarified}.png
 * Run: node tests/max-mobile-layout.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const CASES = [['guidance', 'S01'], ['three', 'S04'], ['relationship', 'S07'], ['seven', 'S10'], ['celtic', 'S13'], ['celtic', 'CC-02']];
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }]; let t = null;
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak(u) { t = setTimeout(() => u.onend && u.onend(), 10); }, cancel() { clearTimeout(t); }, pause() {}, resume() {}, speaking: false }, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};
// Box of an image including its border and, if any, its outline and glow, against the strip's visible box.
const geometry = (page, sel) => page.evaluate(sel => {
  const strip = document.querySelector('.mc-player .mc-cards'), s = strip.getBoundingClientRect();
  const clip = getComputedStyle(strip).overflowX === 'visible' ? { left: 0, right: innerWidth, top: -1e9, bottom: 1e9 } : s;
  return [...document.querySelectorAll(sel)].map(img => {
    const r = img.getBoundingClientRect(), cs = getComputedStyle(img);
    const out = cs.outlineStyle !== 'none' ? parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset) : 0;
    return { l: r.left - out, r: r.right + out, t: r.top - out, b: r.bottom + out, w: r.width, h: r.height, rotated: /matrix\(-1/.test(cs.transform), clipL: Math.max(clip.left, 0), clipR: Math.min(clip.right, innerWidth), clipT: clip.top, clipB: clip.bottom, reversed: img.classList.contains('is-reversed') };
  });
}, sel);
const topmost = (page, sel) => page.evaluate(sel => { const el = document.querySelector(sel); const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= 0 && r.bottom <= innerHeight && !!hit && el.contains(hit); }, sel);

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0; const failures = [];
  for (const [w, h] of [[360, 800], [384, 854], [412, 915]]) for (const [spread, id] of CASES) {
    const name = `${spread} ${id} ${w}x${h}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(base + '/presenter-uat.html?qa=' + id);
      await page.waitForSelector('#qaBanner');
      await page.locator('#mcFloat').tap();
      await page.waitForSelector('.mc-player');
      await page.waitForTimeout(700);
      assert.equal(await page.evaluate(() => document.querySelector('.mc-player .mc-cards').scrollLeft), 0, 'the strip starts at card 1');
      const first = (await geometry(page, '.mc-player .mc-card .mc-main'))[0];
      assert.ok(first.l >= first.clipL - 0.5 && first.r <= first.clipR + 0.5, `card 1 incl. border and highlight inside the strip and screen: ${JSON.stringify(first)}`);
      assert.ok(first.l >= 0, 'card 1 not off the left edge');
      for (const g of await geometry(page, '.mc-player .mc-card .mc-main')) {
        if (g.r < g.clipL || g.l > g.clipR) continue;            // scrolled off sideways on a wide spread: not shown
        assert.ok(Math.abs(g.w / g.h - 0.58) < 0.02, 'card proportions kept');
        assert.ok(g.t >= g.clipT - 0.5 && g.b <= g.clipB + 0.5, 'not cut at top or bottom');
        if (g.reversed) assert.ok(g.rotated, 'a reversed card is shown rotated');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('.mc-player').scrollWidth > innerWidth), false, 'no sideways page scroll');
      for (const sel of ['#mcCaption', '#mcPlay', '#mcClarifyGo', '#mcFinish']) assert.ok(await topmost(page, sel), `${sel} uncovered and on screen`);
      const order = await page.evaluate(() => ['mcCaption', 'mcPlay', 'mcClarifyBar'].map(id => document.getElementById(id).getBoundingClientRect()).map(r => [r.top, r.bottom]));
      assert.ok(order[0][1] <= order[1][0] && order[1][1] <= order[2][0] + 0.5, 'caption above controls above the clarify bar: ' + JSON.stringify(order));
      await page.screenshot({ path: path.join(OUT, `max-mobile-${spread}-${id}-${w}-open.png`) });
      // Clarify the last card inside Max as far as the rule allows, then check its group is fully visible.
      const n = await page.evaluate(() => state.drawnCardIds.length), pick = n - 1;
      if (n > 1) await page.locator(`.mc-pick [data-pick="${pick}"]`).tap();
      for (let k = 0; k < 3; k++) {
        if (!(await page.evaluate(i => clarifyStepFor(i), pick))) break;
        await page.locator('#mcClarifyGo').tap();
        await page.waitForFunction(() => document.querySelector('.mc-player')?.classList.contains('is-finished'), null, { timeout: 60000 });
      }
      await page.waitForTimeout(700);
      const group = await page.evaluate(i => { const c = document.querySelectorAll('.mc-player .mc-card')[i]; c.querySelectorAll('img').forEach((img, k) => img.dataset.mcTest = 'g' + k); return c.querySelectorAll('img').length; }, pick);
      assert.ok(group >= 2, 'the picked card shows its clarifier(s)');
      await page.evaluate(() => { const b = document.querySelector('.mc-body'); if (b) b.scrollTop = 0; });
      const gs = await geometry(page, '[data-mc-test]');
      for (const g of gs) {
        assert.ok(g.l >= g.clipL - 0.5 && g.r <= g.clipR + 0.5, 'picked card and clarifiers inside the strip horizontally: ' + JSON.stringify(g));
        if (g.reversed) assert.ok(g.rotated, 'reversed clarifier rotated');
      }
      for (const sel of ['#mcCaption', '#mcPlay', '#mcClarifyGo']) assert.ok(await topmost(page, sel), `${sel} still uncovered after clarifying`);
      await page.screenshot({ path: path.join(OUT, `max-mobile-${spread}-${id}-${w}-clarified.png`) });
      assert.deepEqual(errors.filter(e => !/manifest\.json/.test(e)), []);
      console.log('PASS ', name); pass++;
    } catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); failures.push(name); await page.screenshot({ path: path.join(OUT, `max-mobile-${spread}-${id}-${w}-FAIL.png`) }).catch(() => {}); }
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + failures.length} passed${failures.length ? '\n' + failures.join('\n') : ''}`);
  process.exit(failures.length ? 1 : 0);
});
