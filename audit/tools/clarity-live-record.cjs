// Live Clarity-card record for CC-03 and BT-03 (Si Aye, 8 Nov 2026: "regenerate CC-03 evidence after performing
// the actual seeker taps at positions 1, 3, 5 and 9").
// On the app code in APP_ROOT (a clean checkout of APP_SHA), phone viewport 412x915, the app's own secure draw
// (nothing stubbed):
//   B06 (Celtic Cross, Clarity due at positions 1, 3, 5, 9): the seeker taps each card's "✦ Draw Clarity card"
//       button on the page, in that order; then opens Max, plays to the end, taps Finish reading, plays the close.
//   B01 (one card, Death / The Tower / Judgement): the seeker opens Max and taps "Clarify this card" in Max's
//       clarify bar; then taps Finish reading.
// For each it records: the Clarity cards drawn and every card's orientation (the full reversed list), the page
// before and after, the Golden Thread, Max's script, and every line Max spoke (fake speech engine: these are
// the words sent to speech, not audio). It then writes the recorded draw as a replayable sample (<ID>-LIVE)
// to <out>/live-samples.json, replays it in a fresh page with qa-loader.js and checks the replay is identical.
// Usage: NODE_PATH=<playwright> APP_ROOT=<checkout> APP_SHA=<sha> node audit/tools/clarity-live-record.cjs <out-dir>
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const APP = path.resolve(process.env.APP_ROOT || path.join(__dirname, '..', '..'));
const SHA = process.env.APP_SHA || '(unknown)';
const OUT = path.resolve(process.argv[2]);
fs.mkdirSync(OUT, { recursive: true });
const { SAMPLES } = require(path.join(__dirname, '..', '..', 'tests', 'helpers', 'qa-samples.cjs'));
const { renderSample } = require(path.join(__dirname, '..', '..', 'tests', 'helpers', 'qa-render.cjs'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(APP, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const fakeSpeech = () => {
  const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }]; window.__spoken = []; let t = null;
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak(u) { window.__spoken.push(u.text); t = setTimeout(() => u.onend && u.onend(), 5); }, cancel() { clearTimeout(t); }, pause() {}, resume() {}, speaking: false }, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};
const snap = page => page.evaluate(() => {
  document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; });
  const txt = el => el ? el.innerText.replace(/\n{3,}/g, '\n\n').trim() : '';
  return { pageText: txt(document.getElementById('readingInterpretation')), goldenThread: txt(document.querySelector('.reading-golden-thread')),
    clarity: readingClarity(), reversed: [...state.drawnOrientations.reversed], used: readingUsedIds() };
});
const spokenSince = (page, n) => page.evaluate(n => window.__spoken.slice(n), n);
const count = page => page.evaluate(() => window.__spoken.length);
// Plays whatever is loaded to its end. If nothing starts within a second, the seeker taps Play. (The player
// keeps its is-playing class after the last part; is-finished, with is-talking cleared, marks the end.)
async function playToEnd(page) {
  const n = await count(page);
  await page.waitForTimeout(1000);
  if ((await count(page)) === n) await page.locator('#mcPlay').tap();
  await page.waitForFunction(n => { const r = document.querySelector('.mc-player'); return r && window.__spoken.length > n && r.classList.contains('is-finished') && !r.classList.contains('is-talking'); }, n, { timeout: 120000 });
}

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const report = { appCommit: SHA, recordedAt: new Date().toISOString(), cases: [] }, live = [];
  for (const [sid, how] of [['B06', 'page'], ['B01', 'max']]) {
    const sample = SAMPLES.find(s => s.id === sid);
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(fakeSpeech);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/presenter-uat.html?qa=' + sid);
    await page.waitForSelector('#qaBanner');
    const before = await snap(page);
    const due = await page.evaluate(() => clarifierPlan().pendingClarity);
    const buttons = await page.$$eval('.clarity-due', bs => bs.map(b => ({ position: Number(b.dataset.clarifyPosition) + 1, text: b.textContent.trim() })));
    const taps = []; let maxBeforeFinish = [], maxClarify = [];
    if (how === 'page') {
      for (const p of due) {
        const label = await page.locator(`.clarity-due[data-clarify-position="${p}"]`).innerText();
        await page.locator(`.clarity-due[data-clarify-position="${p}"]`).tap();
        await page.waitForFunction(p => readingClarity()[p] != null, p);
        const id = await page.evaluate(p => readingClarity()[p], p);
        taps.push({ position: p + 1, via: 'page button', buttonLabel: label.trim(), drew: id });
      }
      await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player');
      const n0 = await count(page); await playToEnd(page); maxBeforeFinish = await spokenSince(page, n0);
    } else {
      await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player');
      const label = await page.locator('#mcClarifyGo').innerText();
      const n0 = await count(page);
      await page.locator('#mcClarifyGo').tap();
      await page.waitForFunction(p => readingClarity()[p] != null, due[0]);
      await page.waitForFunction(n0 => { const r = document.querySelector('.mc-player'); return window.__spoken.length > n0 && r.classList.contains('is-finished') && !r.classList.contains('is-talking'); }, n0, { timeout: 60000 });
      maxClarify = await spokenSince(page, n0);
      taps.push({ position: due[0] + 1, via: "Max's clarify bar", buttonLabel: label.trim(), drew: await page.evaluate(p => readingClarity()[p], due[0]) });
    }
    const n1 = await count(page);
    await page.locator('#mcFinish').tap();
    await page.waitForTimeout(100);
    await playToEnd(page);
    const maxAfterFinish = await spokenSince(page, n1);
    const finishLabel = await page.locator('#mcFinish').innerText();
    await page.locator('#mcClose').tap(); await page.waitForSelector('.mc-player', { state: 'detached' });
    const after = await snap(page);
    const facts = await page.evaluate(({ due, usedBefore }) => due.map(p => { const id = readingClarity()[p], c = cards.find(x => x.id === id); return { position: p + 1, label: positionLabels()[p], id, name: c.name, arcana: c.arcana, reversed: state.drawnOrientations.reversed.includes(id), minor: c.arcana !== 'Major', unusedBefore: !usedBefore.includes(id) }; }), { due, usedBefore: before.used });
    const script = await page.evaluate(() => ({ before: ResonatePresenter.buildScript({ finished: false }).map(p => `[${p.chapter} · ${p.kind}] ${p.text}`), after: ResonatePresenter.buildScript({ finished: true }).map(p => `[${p.chapter} · ${p.kind}] ${p.text}`) }));
    await ctx.close();
    // The recorded draw, as a replayable sample: the original steps plus each Clarity card, every orientation.
    const rec = { ...sample, id: sid + '-LIVE', liveOf: sid, reversed: after.reversed, steps: [...sample.steps, ...due.map(p => ({ pos: p, layer: 3, id: after.clarity[p] }))],
      note: `${sample.note || sid} — AFTER the seeker's live Clarity taps (${how === 'page' ? 'page buttons at positions ' + due.map(p => p + 1).join(', ') : "Max's clarify bar, position " + (due[0] + 1)}), recorded at ${SHA.slice(0, 7)}`,
      live: `Clarity card(s) drawn LIVE (not seeded) by the app's own secure draw when the seeker tapped, then recorded: ${facts.map(f => `position ${f.position} ${f.name} (ID ${f.id}, ${f.reversed ? 'reversed' : 'upright'}, orientation also drawn live)`).join('; ')}` };
    live.push(rec);
    // Replay the recorded draw in a fresh page (same loader as ?qa=): must match the live page exactly.
    const p2 = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
    await p2.goto(base + '/presenter-uat.html'); await p2.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
    const r = await renderSample(p2, rec);
    await p2.context().close();
    const allFour = facts.map(f => { const pos = r.positions[f.position - 1]; return { position: f.position, threadNamesClarity: r.goldenThread.includes(f.name), readingNamesAllFour: [pos.base, pos.c1, pos.c2, pos.clarity].every(c => c && pos.synthesisLead.includes(c.name)), maxSpokeClarity: maxClarify.concat(maxBeforeFinish, maxAfterFinish).some(l => l.includes(f.name)) }; });
    const threadCount = (r.goldenThread.match(/follows (\d+) revealed cards/) || [])[1];
    const c = { sample: sid, how, appCommit: SHA, duePositions: due.map(p => p + 1), buttons, taps, clarityCards: facts, reversedAfter: after.reversed,
      goldenThreadBefore: before.goldenThread, goldenThreadAfter: after.goldenThread, threadCardCount: Number(threadCount), checks: allFour,
      maxSpoken: { clarifyInMax: maxClarify, playedBeforeFinish: maxBeforeFinish, afterFinish: maxAfterFinish, finishButtonAfter: finishLabel }, maxScript: script,
      replay: { sample: rec.id, identicalPageText: r.pageText === after.pageText, identicalGoldenThread: r.goldenThread === after.goldenThread, identicalScript: JSON.stringify(r.scriptFinished.map(p => `[${p.chapter} · ${p.kind}] ${p.text}`)) === JSON.stringify(script.after), ruleCheck: r.valid },
      pageTextBefore: before.pageText, pageTextAfter: after.pageText, errors };
    report.cases.push(c);
    console.log(sid, JSON.stringify({ taps: taps.map(t => `${t.position}:${t.drew}`), cards: facts.map(f => `${f.position} ${f.name}${f.reversed ? ' R' : ''} minor=${f.minor} unused=${f.unusedBefore}`), threadCardCount: c.threadCardCount, checks: allFour, replay: c.replay, spoken: [maxClarify.length, maxBeforeFinish.length, maxAfterFinish.length], errors }));
  }
  fs.writeFileSync(path.join(OUT, 'clarity-live.json'), JSON.stringify(report, null, 1));
  fs.writeFileSync(path.join(OUT, 'live-samples.json'), JSON.stringify(live, null, 1));
  await browser.close(); server.close();
});
