/* Boundary tests BT-01 to BT-10 from Si Aye's QA matrix (7 Nov 2026), on presenter-uat.html at a Samsung size
 * (412x915, touch), with readings loaded through qa-loader.js (the same loader as the evidence files).
 * BT-08 (the approved shuffle is byte-for-byte unchanged) is a unit test: tests/shuffle-frozen.test.cjs.
 * Speech is a stand-in for the device engine that logs every line handed to it, so "no stale audio" is checked
 * as "nothing is handed to the speech engine after the reading changed". Whether sound is actually heard on a
 * Samsung is Dev's check (audit/SAMSUNG_UAT_CHECKLIST.md); this test cannot show it.
 * Run: node tests/boundary-matrix.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const { SAMPLES } = require('./helpers/qa-samples.cjs');
const S = id => SAMPLES.find(s => s.id === id);
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }];
  const log = window.__spoken = []; window.__cancelled = 0;
  let current = null, timer = null;
  const synth = { getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { log.push({ text: u.text, at: Date.now() }); current = u; timer = setTimeout(() => { current = null; u.onend && u.onend(); }, 250); },
    cancel() { window.__cancelled++; clearTimeout(timer); current = null; }, pause() {}, resume() {}, get speaking() { return !!current; } };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
};
const snap = page => page.evaluate(() => JSON.stringify([state.drawnCardIds, state.firstLayerClarifiers, (state.additionalClarifierLayers || []).map(l => l.cards)]));

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0; const failures = [];
  const check = async (name, fn) => {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/presenter-uat.html');
    try { await fn(page); assert.deepEqual(errors, []); console.log('PASS ', name); pass++; }
    catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); failures.push(name); }
    await ctx.close();
  };
  const load = (page, id) => page.evaluate(s => ResonateQA.load(s), S(id));
  const openMaxAndPlay = async page => {
    await page.locator('#mcFloat').tap();
    await page.waitForSelector('.mc-player');
    await page.locator('#mcPlay').tap();
    await page.waitForFunction(() => window.__spoken.length >= 2, null, { timeout: 8000 });
  };
  const minorToClarify = page => page.evaluate(() => clarifierPlan().positions.findIndex(p => p.first == null));

  await check('BT-01 Clarifier 2 without Clarifier 1 is refused', async page => {
    await load(page, 'OC-02');
    const before = await snap(page);
    await page.evaluate(() => { drawNextClarifierLayer(0); drawNextClarifierLayer(); });
    assert.equal(await snap(page), before, 'nothing drawn');
    assert.equal(await page.evaluate(() => clarifyStepFor(0)), 'first', 'the only step offered is Clarifier 1');
    assert.equal(await page.locator('[data-clarify-position]', { hasText: 'Clarifier 2' }).count(), 0, 'no Clarifier 2 control');
    const v = await page.evaluate(() => ResonateClarifiers.validate([cards[59]], [null], [5], id => cards.find(c => c.id === id)));
    assert.ok(v.length > 0, 'the rule module rejects a Clarifier 2 with no Clarifier 1: ' + JSON.stringify(v));
  });

  await check('BT-02 a clarifier cannot itself be clarified (no recursion)', async page => {
    await load(page, 'B07');   // complete: two clarifiers and the Clarity card (Option B)
    const before = await snap(page);
    assert.equal(await page.locator('.position-clarifiers [data-clarify-position], .position-clarifier button').count(), 0, 'no clarify control on a clarifier');
    for (const el of await page.locator('.position-clarifier').all()) await el.tap({ force: true });
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => clarifyPosition(0)), '', 'the card is complete');
    assert.equal(await snap(page), before, 'no new cards');
    assert.equal(await page.locator('.position-clarifier').count(), 2, 'still two clarifiers');
    await page.locator('.position-clarity').tap({ force: true });
    await page.waitForTimeout(300);
    assert.equal(await snap(page), before, 'tapping the Clarity card draws nothing either');
  });

  await check('BT-03 two Major clarifiers: Option B (approved 7 Nov) offers one Clarity card from the Minor Arcana, then stops', async page => {
    await load(page, 'B01');   // Death, The Tower, Judgement
    assert.match(await page.locator('.reading-limit').innerText(), /a Clarity card is due: one card drawn at random from the unused Minor Arcana/);
    await page.evaluate(() => document.querySelector('.reading-position').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(500);
    assert.match(await page.locator('#mcClarify').innerText(), /Clarity card/);
    await page.locator('#mcClarify').tap();
    await page.waitForFunction(() => readingClarity()[0] != null, null, { timeout: 3000 });
    const k = await page.evaluate(() => { const id = readingClarity()[0]; return { arcana: cards[id].arcana, inReading: [state.drawnCardIds[0], state.firstLayerClarifiers[0], readingSecondLayer()[0]].includes(id) }; });
    assert.deepEqual(k, { arcana: 'Minor', inReading: false }, 'a Minor not already in the reading');
    assert.equal(await page.locator('.position-clarifier').count(), 2, 'the two-clarifier limit stands');
    assert.equal(await page.locator('.position-clarity').count(), 1);
    assert.equal(await page.locator('.reading-limit').count(), 0, 'nothing more is due');
    assert.match(await page.locator('.reading-revision-tag').innerText(), /Revision 3/);
    assert.equal(await page.evaluate(() => clarifyPosition(0)), '', 'no further draws: the rule stops at the Clarity card');
    await page.waitForTimeout(400);
    assert.match(await page.locator('#mcClarify').innerText(), /clarified ✓/);
    assert.deepEqual(await page.evaluate(() => ResonateClarifiers.validate([cards[state.drawnCardIds[0]]], state.firstLayerClarifiers, readingSecondLayer(), id => cards[id], readingClarity())), []);
    const script = await page.evaluate(() => ResonatePresenter.buildScript());
    assert.ok(script.some(l => l.chapter === 'c3' && /^Clarity card: /.test(l.text)), 'Max presents the Clarity card');
  });

  await check('BT-04 adding a clarifier during narration stops it at once and offers the update', async page => {
    await load(page, 'S14');
    await openMaxAndPlay(page);
    const i = await minorToClarify(page);
    assert.ok(i >= 0, 'S14 has a card to clarify');
    await page.evaluate(i => clarifyPosition(i), i);
    await page.waitForSelector('.mc-player', { state: 'detached', timeout: 1000 });
    const spoken = await page.evaluate(() => window.__spoken.length);
    assert.ok(await page.evaluate(() => window.__cancelled) > 0, 'speech cancelled');
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => window.__spoken.length), spoken, 'nothing more spoken after the change');
    assert.match(await page.locator('#mcFloat').innerText(), /Replay Updated/);
    assert.match(await page.locator('#mcOpen').innerText(), /Replay Updated Reading/);
  });

  await check('BT-05 reversed original and reversed clarifier are both stated', async page => {
    await load(page, 'B04');
    const pos = await page.evaluate(() => state.drawnCardIds.findIndex(id => cards[id].name === 'The Hanged Man'));
    const art = `.reading-meaning[data-position="${pos}"]`;
    assert.match(await page.locator(`${art} .original-card-explanation h3`).innerText(), /The Hanged Man, reversed/);
    assert.match(await page.locator(`${art} .integrated-clarifier[data-clarifier="1"] h3`).innerText(), /The Star, reversed/);
    const rel = await page.locator(`${art} .integrated-clarifier[data-clarifier="1"] .clarifier-relation`).innerText();
    assert.match(rel, /The Star \(reversed\)[\s\S]*The Hanged Man \(reversed\)/, 'the relationship names both as reversed');
    assert.match(rel, /With both cards reversed/);
  });

  await check('BT-06 a contradicting clarifier: stage 1 kept, the change shown as a revision', async page => {
    const sample = { id: 'BT-06', spread: 'guidance', base: [16], reversed: [], steps: [{ pos: 0, layer: 1, id: 13 }] };
    await page.evaluate(s => ResonateQA.load(s), sample);           // The Tower, Clarifier 1 Death (Fire / Water)
    const art = '.reading-meaning[data-position="0"]';
    assert.equal(await page.locator(`${art} .clarifier-relation`).getAttribute('data-relation'), 'challenge');
    const stage1 = await page.locator(`${art} .original-card-explanation`).innerText();
    const clar1 = await page.locator(`${art} .integrated-clarifier[data-clarifier="1"]`).innerText();
    const rev1 = await page.locator(`${art} .synthesis-lead`).innerText();
    await page.evaluate(() => { const o = window.ResonateDeck; window.ResonateDeck = { ...o, drawRemaining: () => [17] }; clarifyPosition(0); window.ResonateDeck = o; });
    assert.equal(await page.locator(`${art} .original-card-explanation`).innerText(), stage1, 'stage 1 unchanged');
    assert.equal(await page.locator(`${art} .integrated-clarifier[data-clarifier="1"]`).innerText(), clar1, 'Clarifier 1 unchanged');
    assert.match(await page.locator(`${art} .reading-revision-tag`).innerText(), /Revision 2/);
    assert.ok((await page.locator(`${art} .synthesis-earlier`).evaluate(e => e.textContent)).includes(rev1.split('. ')[0]), 'Revision 1 kept');
    assert.notEqual(await page.locator(`${art} .synthesis-lead`).innerText(), rev1, 'revised');
  });

  await check('BT-07 a new reading mid-flow inherits no clarifiers', async page => {
    await load(page, 'S15');
    assert.ok(await page.locator('.position-clarifier').count() > 0);
    await page.evaluate(() => { state.spreadId = 'celtic'; state.spreadSize = 10; go('reading'); });
    await page.evaluate(() => { state.pendingDraw = [70, 71, 72, 73, 74, 75, 76, 77, 60, 61]; startDraw(); });
    await page.waitForFunction(() => state.view === 'draw' && state.drawSettled, null, { timeout: 30000 });
    assert.equal(await page.locator('.position-clarifier').count(), 0, 'no clarifier cards shown');
    assert.equal(await page.locator('.integrated-clarifier').count(), 0, 'no clarifier readings');
    assert.equal(await page.evaluate(() => readingLayerCards(0).length + readingSecondLayer().filter(x => x != null).length), 0, 'no clarifier state for the new reading');
    assert.deepEqual(await page.evaluate(() => [...new Set(ResonatePresenter.buildScript().map(p => p.chapter))].filter(c => /^c\d/.test(c))), [], 'Max has no clarifier chapters');
  });

  await check('BT-09 Clarify with no card in view asks you to choose a card', async page => {
    await load(page, 'S13');
    await page.evaluate(() => document.querySelector('.reading-golden-thread').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(500);
    assert.match(await page.locator('#mcClarify').innerText(), /choose a card/);
    const before = await snap(page);
    await page.locator('#mcClarify').tap();
    await page.waitForTimeout(600);
    assert.equal(await snap(page), before, 'nothing drawn');
    assert.match(await page.locator('#mcSelectPrompt').innerText(), /Choose the card to clarify/);
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({ label: document.getElementById('mcClarify').innerText, y: scrollY, spread: document.querySelector('.spread-scroll').getBoundingClientRect().top, pos: [...document.querySelectorAll('.reading-position')].slice(0, 2).map(e => [e.getBoundingClientRect().top, e.getBoundingClientRect().height]) }));
    assert.match(after.label, /^✦ Clarify\s+\d\d · /, 'once a card is in view, Clarify names it: ' + JSON.stringify(after));
  });

  await check('BT-10 pause, add a clarifier, resume: no stale audio or captions', async page => {
    await load(page, 'S14');
    await openMaxAndPlay(page);
    await page.locator('#mcPlay').tap();
    assert.match(await page.locator('#mcPlay').innerText(), /Resume/);
    const i = await minorToClarify(page);
    await page.evaluate(i => clarifyPosition(i), i);
    await page.waitForSelector('.mc-player', { state: 'detached', timeout: 1000 });
    const spoken = await page.evaluate(() => window.__spoken.length);
    await page.waitForTimeout(1200);
    assert.equal(await page.evaluate(() => window.__spoken.length), spoken, 'the paused narration cannot resume');
    await page.locator('#mcFloat').tap();
    await page.waitForSelector('.mc-player');
    assert.match(await page.locator('#mcCaption').innerText(), /Press Play when you're ready/, 'reopened fresh, not mid-way through the old script');
    const label = await page.evaluate(i => { const id = state.firstLayerClarifiers[i]; return `Clarifier 1 · ${positionLabels()[i]}: ${cardName(cards.find(c => c.id === id))}.`; }, i);
    assert.ok((await page.$$eval('.mc-transcript li', l => l.map(x => x.textContent))).includes(label), 'the new script includes the new clarifier');
  });

  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + failures.length} passed${failures.length ? '\n' + failures.join('\n') : ''}`);
  process.exit(failures.length ? 1 : 0);
});
