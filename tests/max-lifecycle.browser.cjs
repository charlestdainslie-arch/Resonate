/* Max's narration lifecycle and clarifying inside Max (Chas, Samsung UAT, 8 Nov 2026), all five spreads at
 * Samsung sizes (360x800, 412x915), on presenter-uat.html with readings loaded by qa-loader.js.
 * For each spread, starting from a reading as dealt (no clarifiers):
 *   1. Max opens with the clarify bar on screen: a card picker (spreads of 2+), "Clarify this card" and
 *      "Finish reading", each untouched by anything else, without scrolling.
 *   2. The first layer plays to the end and Max does NOT sign off: no "Before I go", no "Take what resonates",
 *      no "signing off"; he ends by inviting clarification.
 *   3. The seeker picks an original card in the bar and taps Clarify: only that card gets Clarifier 1, Max
 *      stays open and narrates just the new clarifier and how it relates to the original, then invites again.
 *      Then "Add second clarifier" and the Clarity card where the rule allows, the same way.
 *   4. In Max's card strip the original sits above, Clarifier 1 below-left, Clarifier 2 below-right.
 *   5. Finish reading: the whole spread together, then the closing question, "Take what resonates, and leave
 *      the rest." and the sign-off, each once, sign-off last. Replay plays one ending, not two.
 *   6. Reopening Max: the full reading ends with exactly one closing.
 * Speech is a stand-in that records every line handed to it (fast, so the test runs quickly). Real audio on a
 * Samsung is Dev's check. Run: node tests/max-lifecycle.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const { SAMPLES } = require('./helpers/qa-samples.cjs');
const SIGN_OFF = [/Before I go/, /Take what resonates/, /signing off/];
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }];
  window.__spoken = [];
  let timer = null;
  const synth = { getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { window.__spoken.push(u.text); timer = setTimeout(() => { u.onend && u.onend(); }, 15); },
    cancel() { clearTimeout(timer); }, pause() {}, resume() {}, speaking: false };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
};
// The five "as dealt" baselines, one per spread.
const CASES = [['guidance', 'S01'], ['three', 'S04'], ['relationship', 'S07'], ['seven', 'S10'], ['celtic', 'S13']];
// Plus the full chain, with the deck's next draws fixed so every step happens: Death, then The Tower and
// Judgement (both Major, so Clarifier 2 and then the Clarity card are due), then Five of Cups as the Clarity card.
const CHAIN = { id: 'CHAIN', spread: 'guidance', base: [13], reversed: [], steps: [], queue: [16, 20, 40] };
const CHAIN_CELTIC = { id: 'CHAIN-CC', spread: 'celtic', base: [0, 41, 45, 50, 55, 60, 65, 70, 75, 30], reversed: [], steps: [], queue: [5, 9, 44] };

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0; const failures = [];
  const all = [];
  for (const [w, h] of [[360, 800], [412, 915]]) { for (const c of CASES) all.push([w, h, ...c]); all.push([w, h, 'guidance', CHAIN], [w, h, 'celtic', CHAIN_CELTIC]); }
  for (const [w, h, spread, id] of all) {
    const inline = typeof id === 'object' ? id : null;
    const name = `${spread} ${w}x${h} (${inline ? inline.id : id})`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const tap = sel => page.locator(sel).tap();
    const spokenSince = async n => (await page.evaluate(() => window.__spoken)).slice(n);
    const playToEnd = async () => { await page.waitForFunction(() => document.querySelector('.mc-player')?.classList.contains('is-finished'), null, { timeout: 120000 }); };
    const onScreenAndTopmost = sel => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth)) return false; const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && el.contains(hit); }, sel);
    try {
      if (inline) {
        await page.goto(base + '/presenter-uat.html');
        await page.evaluate(s => { ResonateQA.load(s); const queue = [...s.queue], o = window.ResonateDeck; window.ResonateDeck = { ...o, drawRemaining: (ids, used, count) => queue.splice(0, count) }; }, inline);
      } else {
        await page.goto(base + '/presenter-uat.html?qa=' + id);
        await page.waitForSelector('#qaBanner');
      }
      const n = await page.evaluate(() => state.drawnCardIds.length);
      await page.locator('#mcFloat').tap();
      await page.waitForSelector('.mc-player');
      // 1. The clarify bar is on screen without scrolling.
      for (const sel of ['#mcClarifyGo', '#mcFinish', ...(n > 1 ? ['.mc-pick [data-pick="0"]'] : [])]) assert.ok(await onScreenAndTopmost(sel), `${sel} on screen and tappable`);
      await page.screenshot({ path: path.join(OUT, `max-lifecycle-${spread}${inline ? "-chain" : ""}-${w}-open.png`) });
      // 2. First layer: no sign-off; ends by inviting clarification.
      await tap('#mcPlay');
      await playToEnd();
      let said = await spokenSince(0);
      SIGN_OFF.forEach(re => assert.ok(!said.some(t => re.test(t)), `no early "${re.source}" after the first layer`));
      assert.match(said[said.length - 1], /tap Finish reading/, 'ends with the invitation');
      assert.match(await page.locator('#mcCaption').innerText(), /Choose a card below and tap Clarify/);
      // 3. Pick a card and clarify it inside Max, as far as the rule allows.
      const pick = inline ? 0 : await page.evaluate(() => { const due = nextDueClarifier(); if (due >= 0) return due; return clarifierPlan().positions.findIndex(p => p.first == null); });
      if (n > 1) { await page.locator(`.mc-pick [data-pick="${pick}"]`).tap(); assert.equal(await page.locator(`.mc-pick [data-pick="${pick}"]`).getAttribute('aria-checked'), 'true'); }
      const label = await page.evaluate(i => positionLabels()[i], pick);
      if (n > 1) assert.ok((await page.locator('#mcPickNote').innerText()).includes(label), 'the note names the picked card');
      const others = await page.evaluate(i => state.drawnCardIds.map((_, k) => k).filter(k => k !== i), pick);
      const steps = [];
      for (let layer = 1; layer <= 3; layer++) {
        const step = await page.evaluate(i => clarifyStepFor(i), pick);
        if (!step) break;
        steps.push(step);
        assert.match(await page.locator('#mcClarifyGo').innerText(), step === 'first' ? /Clarify this card/ : step === 'second' ? /Add second clarifier/ : /Draw Clarity card/);
        const before = (await page.evaluate(() => window.__spoken.length));
        await tap('#mcClarifyGo');
        await page.waitForFunction(() => document.querySelector('.mc-player')?.classList.contains('is-playing'), null, { timeout: 5000 });
        await playToEnd();
        assert.equal(await page.locator('.mc-player').count(), 1, 'Max stays open');
        said = await spokenSince(before);
        const added = await page.evaluate(([i, s]) => { const id = s === 'first' ? state.firstLayerClarifiers[i] : s === 'second' ? readingSecondLayer()[i] : readingClarity()[i]; return cardName(cards.find(c => c.id === id)); }, [pick, step]);
        const kind = step === 'first' ? 'Clarifier 1' : step === 'second' ? 'Clarifier 2' : 'Clarity card';
        assert.ok(said.some(t => t.startsWith(kind) && t.includes(added)), `Max names the new ${kind}: ${added}`);
        const original = await page.evaluate(i => cards.find(c => c.id === state.drawnCardIds[i]).name, pick);
        assert.ok(said.some(t => t.includes(original) && /reinforces|supports|challenges|modifies/.test(t)), `Max relates it to the original (${original})`);
        SIGN_OFF.forEach(re => assert.ok(!said.some(t => re.test(t)), `no sign-off after ${kind}`));
        assert.match(said[said.length - 1], /tap Finish reading/, 'invites again');
        // Only the picked card changed.
        const untouched = await page.evaluate(o => o.every(k => state.firstLayerClarifiers?.[k] == null && readingSecondLayer()[k] == null && readingClarity()[k] == null), others);
        assert.ok(untouched, 'other cards untouched');
      }
      // 4. Card group in Max: original above, Clarifier 1 below-left, Clarifier 2 below-right.
      const g = await page.evaluate(i => {
        const card = document.querySelectorAll('.mc-player .mc-card')[i];
        card.scrollIntoView({ block: 'nearest', inline: 'center' });
        const r = el => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
        const main = r(card.querySelector('.mc-main'));
        const c1 = card.querySelector('[data-slot$="-1"] img'), c2 = card.querySelector('[data-slot$="-2"] img');
        return { main, c1: c1 && r(c1), c2: c2 && r(c2) };
      }, pick);
      assert.ok(g.c1, 'Clarifier 1 shown in Max');
      assert.ok(g.c1.t >= g.main.b - 1 && (g.c1.l + g.c1.r) / 2 < (g.main.l + g.main.r) / 2, 'Clarifier 1 below-left');
      if (g.c2) assert.ok(g.c2.t >= g.main.b - 1 && (g.c2.l + g.c2.r) / 2 > (g.main.l + g.main.r) / 2 && g.c2.l >= g.c1.r - 1, 'Clarifier 2 below-right');
      await page.evaluate(() => document.querySelector('.mc-player').scrollTo(0, 0));
      await page.screenshot({ path: path.join(OUT, `max-lifecycle-${spread}${inline ? "-chain" : ""}-${w}-clarified.png`) });
      // 5. Finish reading: synthesis, then the closing, once, sign-off last.
      const beforeFinish = await page.evaluate(() => window.__spoken.length);
      await tap('#mcFinish');
      await playToEnd();
      said = await spokenSince(beforeFinish);
      assert.equal(said[0], 'Here is your whole spread, brought together.');
      SIGN_OFF.forEach(re => assert.equal(said.filter(t => re.test(t)).length, 1, `"${re.source}" exactly once`));
      assert.match(said[said.length - 1], /signing off\.$/, 'signs off last');
      assert.equal(await page.locator('#mcFinish').isDisabled(), true);
      assert.match(await page.locator('#mcCaption').innerText(), /Your reading is complete/);
      await page.screenshot({ path: path.join(OUT, `max-lifecycle-${spread}${inline ? "-chain" : ""}-${w}-finished.png`) });
      const beforeReplay = await page.evaluate(() => window.__spoken.length);
      await tap('#mcReplay');
      await playToEnd();
      said = await spokenSince(beforeReplay);
      SIGN_OFF.forEach(re => assert.equal(said.filter(t => re.test(t)).length, 1, `Replay: "${re.source}" once, not twice`));
      // 6. Reopen: the full reading has exactly one closing, at the end.
      await tap('#mcClose');
      await page.waitForSelector('.mc-player', { state: 'detached' });
      await page.locator('#mcFloat').tap();
      await page.waitForSelector('.mc-player');
      const script = await page.evaluate(() => [...document.querySelectorAll('.mc-transcript li')].map(li => li.textContent));
      SIGN_OFF.forEach(re => assert.equal(script.filter(t => re.test(t)).length, 1, `reopened: "${re.source}" once`));
      assert.match(script[script.length - 1], /signing off\.$/);
      assert.ok(!script.some(t => /tap Finish reading/.test(t)), 'no invitation once finished');
      assert.deepEqual(errors.filter(e => !/manifest\.json/.test(e)), []);
      if (inline) assert.deepEqual(steps, ['first', 'second', 'clarity'], 'the full chain ran');
      console.log('PASS ', name, `card ${pick + 1}: ${steps.join(' → ')}`); pass++;
    } catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); failures.push(name); await page.screenshot({ path: path.join(OUT, `max-lifecycle-${spread}${inline ? "-chain" : ""}-${w}-FAIL.png`) }).catch(() => {}); }
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + failures.length} passed${failures.length ? '\n' + failures.join('\n') : ''}`);
  process.exit(failures.length ? 1 : 0);
});
