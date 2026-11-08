/* CC-03 / BT-03 (Si Aye, 8 Nov 2026): Option B with the seeker's real Clarity taps, on presenter-uat.html at a
 * Samsung size (412x915, touch). Speech is a stand-in that logs the lines handed to it (not audio).
 *   LIVE-B06: B06 (Celtic Cross). The seeker taps "✦ Draw Clarity card" at positions 1, 3, 5, 9 (the app's own
 *     secure draw). Each card is a Minor not already in the reading; each position's "Together" names all four
 *     cards; the Golden Thread follows 32 cards and names every Clarity card; Max, played to the end and then
 *     Finished, speaks every Clarity card, and the close comes once, after Finish.
 *   LIVE-B01: B01 (one card). The seeker taps Clarify in Max's bar; the same checks.
 *   REPLAY-*: the draws recorded as evidence (audit/deep-recheck/live/live-samples.json) replay to exactly the
 *     Golden Thread and reading recorded in audit/deep-recheck/live/clarity-live.json.
 * Run: node tests/clarity-live.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const { renderSample } = require('./helpers/qa-render.cjs');
const LIVE_DIR = path.join(ROOT, 'audit', 'deep-recheck', 'live');
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }]; window.__spoken = []; let t = null;
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak(u) { window.__spoken.push(u.text); t = setTimeout(() => u.onend && u.onend(), 5); }, cancel() { clearTimeout(t); }, pause() {}, resume() {}, speaking: false }, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};
const count = page => page.evaluate(() => window.__spoken.length);
const ended = (page, n) => page.waitForFunction(n => { const r = document.querySelector('.mc-player'); return r && window.__spoken.length > n && r.classList.contains('is-finished') && !r.classList.contains('is-talking'); }, n, { timeout: 120000 });
async function playToEnd(page) { const n = await count(page); await page.waitForTimeout(1000); if ((await count(page)) === n) await page.locator('#mcPlay').tap(); await ended(page, n); }
const CLOSE = /signing off/i;

async function liveChecks(page, due, spoken) {
  const r = await page.evaluate(due => {
    document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; });
    const thread = document.querySelector('.reading-golden-thread').innerText;
    return { thread, cards: due.map(p => { const id = readingClarity()[p], c = cards.find(x => x.id === id), lead = document.querySelector(`.reading-meaning[data-position="${p}"] .synthesis-lead`).innerText;
      const second = state.additionalClarifierLayers.find(l => l.number === 2).cards;
      const four = [state.drawnCardIds[p], state.firstLayerClarifiers[p], second[p], id].map(x => cards.find(k => k.id === x).name);
      return { p, id, name: c.name, arcana: c.arcana, inLead: four.every(n => lead.includes(n)) }; }),
      all: state.drawnCardIds.length + state.firstLayerClarifiers.filter(x => x != null).length + (state.additionalClarifierLayers.find(l => l.number === 2)?.cards || []).filter(x => x != null).length + readingClarity().filter(x => x != null).length };
  }, due);
  for (const c of r.cards) {
    assert.ok(c.id != null, `position ${c.p + 1}: no Clarity card drawn`);
    assert.notEqual(c.arcana, 'Major', `position ${c.p + 1}: ${c.name} is Major`);
    assert.ok(c.inLead, `position ${c.p + 1}: Together does not name all four cards`);
    assert.ok(r.thread.includes(c.name), `Golden Thread does not name ${c.name}`);
    assert.ok(spoken.some(l => l.includes(c.name)), `Max never spoke ${c.name}`);
  }
  assert.equal(new Set(r.cards.map(c => c.id)).size, r.cards.length, 'two positions drew the same Clarity card');
  assert.match(r.thread, new RegExp(`follows ${r.all} revealed cards across this reading, including every clarifier and Clarity card`));
  return r;
}

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0; const failures = [];
  const check = async (name, fn) => {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    try { await fn(page); assert.deepEqual(errors, []); console.log('PASS ', name); pass++; }
    catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); failures.push(name); }
    await ctx.close();
  };

  await check('LIVE-B06 seeker taps Clarity at positions 1, 3, 5, 9; reading, Golden Thread (32 cards) and Max take in all four', async page => {
    await page.goto(base + '/presenter-uat.html?qa=B06'); await page.waitForSelector('#qaBanner');
    const due = await page.evaluate(() => clarifierPlan().pendingClarity);
    assert.deepEqual(due, [0, 2, 4, 8]);
    const usedBefore = await page.evaluate(() => readingUsedIds());
    for (const p of due) { await page.locator(`.clarity-due[data-clarify-position="${p}"]`).tap(); await page.waitForFunction(p => readingClarity()[p] != null, p); }
    assert.equal(await page.locator('.clarity-due').count(), 0, 'a Clarity button is still offered after its card was drawn');
    const ids = await page.evaluate(() => readingClarity().filter(x => x != null));
    ids.forEach(id => assert.ok(!usedBefore.includes(id), `Clarity card ${id} was already in the reading`));
    await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player');
    const n0 = await count(page); await playToEnd(page);
    const before = (await page.evaluate(() => window.__spoken)).slice(n0);
    assert.ok(!before.some(l => CLOSE.test(l)), 'Max signed off before Finish reading');
    const n1 = await count(page); await page.locator('#mcFinish').tap(); await playToEnd(page);
    const after = (await page.evaluate(() => window.__spoken)).slice(n1);
    assert.equal(after.filter(l => CLOSE.test(l)).length, 1, 'the close did not come exactly once after Finish');
    const r = await liveChecks(page, due, before.concat(after));
    assert.equal(r.all, 32);
  });

  await check("LIVE-B01 seeker taps Clarify in Max's bar; reading, Golden Thread and Max take in all four", async page => {
    await page.goto(base + '/presenter-uat.html?qa=B01'); await page.waitForSelector('#qaBanner');
    const due = await page.evaluate(() => clarifierPlan().pendingClarity);
    assert.deepEqual(due, [0]);
    await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player');
    assert.match(await page.locator('#mcClarifyGo').innerText(), /Clarity card/);
    const n0 = await count(page); await page.locator('#mcClarifyGo').tap(); await ended(page, n0);
    const clar = (await page.evaluate(() => window.__spoken)).slice(n0);
    assert.ok(!clar.some(l => CLOSE.test(l)), 'Max signed off before Finish reading');
    const n1 = await count(page); await page.locator('#mcFinish').tap(); await playToEnd(page);
    const after = (await page.evaluate(() => window.__spoken)).slice(n1);
    assert.equal(after.filter(l => CLOSE.test(l)).length, 1);
    await page.locator('#mcClose').tap();
    const r = await liveChecks(page, due, clar.concat(after));
    assert.equal(r.all, 4);
  });

  if (fs.existsSync(path.join(LIVE_DIR, 'live-samples.json'))) {
    const recorded = JSON.parse(fs.readFileSync(path.join(LIVE_DIR, 'clarity-live.json'), 'utf8'));
    for (const s of JSON.parse(fs.readFileSync(path.join(LIVE_DIR, 'live-samples.json'), 'utf8'))) {
      await check(`REPLAY-${s.liveOf} recorded evidence draw replays to the recorded reading and Golden Thread`, async page => {
        await page.goto(base + '/presenter-uat.html'); await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
        const r = await renderSample(page, s), want = recorded.cases.find(c => c.sample === s.liveOf);
        assert.deepEqual(r.valid, []);
        assert.equal(r.goldenThread, want.goldenThreadAfter);
        assert.equal(r.pageText, want.pageTextAfter);
      });
    }
  } else { console.log('FAIL  REPLAY recorded evidence missing:', LIVE_DIR); failures.push('REPLAY'); }

  console.log(`\n${pass} passed, ${failures.length} failed`);
  await browser.close(); server.close();
  process.exit(failures.length ? 1 : 0);
});
