// Verifies Option B (the Clarity card) end to end for Deep's CC-03 and BT-03 findings (8 Nov 2026), on the app
// code in APP_ROOT (a clean checkout of the commit under test). For each recorded draw (QA samples B01, B06):
//   1. reproduce the draw exactly (qa-loader.js);
//   2. confirm a "Draw Clarity card" control appears for every position where the original and both clarifiers
//      are Major (per-card button on the page; the Max clarify bar);
//   3. tap it as the seeker would (B01: in Max's clarify bar; B06: each card's own button on the page), with the
//      app's live secure draw, nothing stubbed;
//   4. record the card drawn; 5. check it is a Minor not already in the reading;
//   6. check the written reading and Max's narration take in all four cards;
//   7. capture the Golden Thread (whole-spread synthesis) and say whether it names the Clarity card;
//   8. replay the same draw with the recorded card(s) fixed and check the reading and narration are identical
//      (so the evidence is reproducible), and repeat the live tap many times (500 for the one-card B01, 120 for the ten-card B06, which re-renders a whole Celtic Cross each time) to check the pool.
// Usage: NODE_PATH=<playwright> APP_ROOT=<checkout> APP_SHA=<sha> node audit/tools/clarity-verify.cjs <out-dir>
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const APP = path.resolve(process.env.APP_ROOT || path.join(__dirname, '..', '..'));
const SHA = process.env.APP_SHA || '(unknown)';
const OUT = path.resolve(process.argv[2]);
fs.mkdirSync(OUT, { recursive: true });
const { SAMPLES } = require(path.join(__dirname, '..', '..', 'tests', 'helpers', 'qa-samples.cjs'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(APP, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }]; window.__spoken = []; let t = null;
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak(u) { window.__spoken.push(u.text); t = setTimeout(() => u.onend && u.onend(), 10); }, cancel() { clearTimeout(t); }, pause() {}, resume() {}, speaking: false }, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};
const capture = page => page.evaluate(() => {
  document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; });
  const txt = el => el ? el.innerText.replace(/\n{3,}/g, '\n\n').trim() : '';
  const second = (state.additionalClarifierLayers.find(l => l.number === 2)?.cards) || [];
  const clarity = typeof readingClarity === 'function' ? readingClarity() : [];
  const name = id => id == null ? null : cards.find(c => c.id === id).name;
  return {
    positions: state.drawnCardIds.map((id, i) => {
      const art = document.querySelector(`.reading-meaning[data-position="${i}"]`);
      return { n: i + 1, label: positionLabels()[i], original: name(id), c1: name(state.firstLayerClarifiers?.[i]), c2: name(second[i]), clarity: name(clarity[i]), clarityId: clarity[i] ?? null,
        clarityText: txt(art.querySelector('.integrated-clarity')), together: txt(art.querySelector('.combined-meaning')), synthesisLead: txt(art.querySelector('.synthesis-lead')), due: !!art.querySelector('.reading-clarity-due'), limit: txt(art.querySelector('.reading-limit')) };
    }),
    goldenThread: txt(document.querySelector('.reading-golden-thread')),
    pageText: txt(document.getElementById('readingInterpretation')),
    scriptBeforeFinish: ResonatePresenter.buildScript({ finished: false }).map(p => `[${p.chapter} · ${p.kind}] ${p.text}`),
    scriptAfterFinish: ResonatePresenter.buildScript({ finished: true }).map(p => `[${p.chapter} · ${p.kind}] ${p.text}`),
    valid: ResonateClarifiers.validate(state.drawnCardIds.map(id => cards.find(c => c.id === id)), state.firstLayerClarifiers, second, x => cards.find(c => c.id === x), clarity)
  };
});

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const report = { appCommit: SHA, cases: [] };
  for (const [sid, how] of [['B01', 'max'], ['B06', 'page']]) {
    const sample = SAMPLES.find(s => s.id === sid);
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/presenter-uat.html?qa=' + sid);
    await page.waitForSelector('#qaBanner');
    // 1-2. The recorded draw, and the controls offered.
    const before = await capture(page);
    const due = await page.evaluate(() => clarifierPlan().pendingClarity);
    const buttons = await page.$$eval('.clarity-due', bs => bs.map(b => ({ position: Number(b.dataset.clarifyPosition), text: b.textContent.trim() })));
    const usedBefore = await page.evaluate(() => readingUsedIds());
    const taps = [];
    // 3. The seeker's tap(s), live secure draw.
    if (how === 'max') {
      await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player');
      await page.locator(`.mc-pick [data-pick="${due[0]}"]`).count() && await page.locator(`.mc-pick [data-pick="${due[0]}"]`).tap();
      const label = await page.locator('#mcClarifyGo').innerText();
      const spoken0 = await page.evaluate(() => window.__spoken.length);
      await page.locator('#mcClarifyGo').tap();
      await page.waitForFunction(() => document.querySelector('.mc-player')?.classList.contains('is-finished'), null, { timeout: 60000 });
      const spoken = (await page.evaluate(() => window.__spoken)).slice(spoken0);
      taps.push({ via: 'Max clarify bar', position: due[0], buttonLabel: label, spoken });
      await page.locator('#mcClose').tap(); await page.waitForSelector('.mc-player', { state: 'detached' });
    } else {
      for (const p of due) {
        await page.locator(`.clarity-due[data-clarify-position="${p}"]`).tap();
        await page.waitForTimeout(200);
        taps.push({ via: 'card button "✦ Draw Clarity card" on the page', position: p });
      }
    }
    const after = await capture(page);
    // 4-6. What was drawn, from where, and whether the reading and Max take all four cards in.
    const drawn = due.map(p => after.positions[p]);
    const majors = await page.evaluate(() => cards.filter(c => c.arcana === 'Major').map(c => c.id));
    const checks = drawn.map(p => ({
      position: `${p.n} · ${p.label}`, original: p.original, c1: p.c1, c2: p.c2, clarity: p.clarity, clarityId: p.clarityId,
      isMinor: !majors.includes(p.clarityId), wasUnused: !usedBefore.includes(p.clarityId),
      readingNamesAllFour: [p.original, p.c1, p.c2, p.clarity].every(n => p.synthesisLead.includes(n)),
      clarityStepNamesOriginal: p.clarityText.includes(p.original),
      maxNarratesClarity: after.scriptAfterFinish.some(l => l.includes(`Clarity card`) && l.includes(p.clarity)),
      maxTogetherNamesAllFour: after.scriptAfterFinish.some(l => [p.original, p.c1, p.c2, p.clarity].every(n => l.includes(n))),
      goldenThreadNamesClarity: after.goldenThread.includes(p.clarity)
    }));
    const distinct = new Set(drawn.map(p => p.clarityId)).size === drawn.length;
    // 8a. Replay with the recorded card(s) fixed: identical reading and narration.
    // The live draw also chose each Clarity card's orientation (secure 50/50): the replay uses the same.
    const reversedAfter = await page.evaluate(() => [...state.drawnOrientations.reversed]);
    const replaySample = { ...sample, reversed: reversedAfter, steps: [...sample.steps, ...drawn.map(p => ({ pos: p.n - 1, layer: 3, id: p.clarityId }))] };
    const page2 = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
    await page2.goto(base + '/presenter-uat.html');
    const replay = await page2.evaluate(s => { const q = s.steps.map(x => x.id), o = window.ResonateDeck; window.ResonateDeck = { ...o, drawRemaining: (ids, used, n) => q.splice(0, n) }; try { ResonateQA.load({ ...s, steps: s.steps }); } finally { window.ResonateDeck = o; } return true; }, replaySample);
    const replayed = await capture(page2);
    await page2.context().close();
    // 8b. 500 live taps from the recorded draw: always a Minor not already in the reading.
    const pool = await page.evaluate(([s, p, TRIALS]) => {
      const counts = {}; let bad = 0;
      for (let k = 0; k < TRIALS; k++) {
        ResonateQA.load(s);
        const used = readingUsedIds();
        clarifyPosition(p);
        const id = readingClarity()[p];
        if (cards.find(c => c.id === id).arcana === 'Major' || used.includes(id)) bad++;
        counts[id] = (counts[id] || 0) + 1;
      }
      return { trials: TRIALS, bad, distinctCards: Object.keys(counts).length };
    }, [sample, due[0], sid === "B06" ? 120 : 500]);
    report.cases.push({ sample: sid, recordedDraw: sample, duePositions: due, controls: buttons, usedBefore, taps, checks, distinctClarityCards: distinct, replayIdentical: replay && replayed.pageText === after.pageText && JSON.stringify(replayed.scriptAfterFinish) === JSON.stringify(after.scriptAfterFinish), replaySample, pool, before, after, errors });
    await ctx.close();
    console.log(sid, JSON.stringify({ due, drawn: checks.map(c => `${c.position}: ${c.clarity} (${c.clarityId}) minor=${c.isMinor} unused=${c.wasUnused} reading=${c.readingNamesAllFour} max=${c.maxNarratesClarity}/${c.maxTogetherNamesAllFour} thread=${c.goldenThreadNamesClarity}`), pool, errors }));
  }
  fs.writeFileSync(path.join(OUT, 'clarity-verify.json'), JSON.stringify(report, null, 1));
  await browser.close(); server.close();
});
