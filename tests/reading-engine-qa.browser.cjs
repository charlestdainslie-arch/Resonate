/* Reading-engine QA: all five spreads (Si Aye, full reading engine QA directive, 7 Nov 2026).
 * Renders every sample in tests/helpers/qa-samples.cjs (15 seeded baselines, 3 per spread, plus 6 hand-written
 * boundary cases) through the app's own clarify function on presenter-uat.html, and checks the structure
 * that can be checked mechanically. Whether the interpretation is good is Deep's call, not this test's.
 *   - the app takes exactly the clarifier steps the sample expects; Chas's teaching rule validates
 *   - no page errors; no "undefined", "NaN", "null" or "[object" in the reading
 *   - every position: its lens names its own position; clarified cards show steps 1..k in order;
 *     step 2 names Clarifier 1 and the original; step 3 names Clarifier 2 and both earlier cards;
 *     "Together" names every card in the position; Celtic Cross positions name their pair partner
 *   - the two-clarifier limit is stated exactly when both clarifiers are Major; "Clarifier 2 due" exactly
 *     when Clarifier 1 is a Major without a Clarifier 2
 *   - Max: every quoted line is on the page; every card and clarifier is named; the player's transcript is
 *     the script
 *   - reproducible: rendering the same sample twice gives the same reading and the same script
 * Boundaries and regressions:
 *   - a stray clarify on a finished card (Minor Clarifier 1; two-Major limit) draws nothing
 *   - adding Clarifier 2 leaves the original and Clarifier 1 text unchanged, revises "Together" and keeps
 *     Revision 1 readable
 * Run: node tests/reading-engine-qa.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const { SAMPLES, BASELINE, BOUNDARY } = require('./helpers/qa-samples.cjs');
const { renderSample } = require('./helpers/qa-render.cjs');
const PAIRS = [[0, 1], [2, 4], [3, 5], [6, 7], [8, 9]];
const norm = t => String(t).replace(/\s+/g, ' ').trim();

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0; const failures = [];
  const fresh = async () => {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage(); page.__errors = []; page.on('pageerror', e => page.__errors.push(e.message));
    await page.goto(base + '/presenter-uat.html');
    await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
    return { ctx, page };
  };
  const check = async (name, fn) => {
    const { ctx, page } = await fresh();
    try { await fn(page); assert.deepEqual(page.__errors, []); console.log('PASS ', name); pass++; }
    catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); failures.push(name); }
    await ctx.close();
  };
  assert.ok(BASELINE.length >= 15 && new Set(BASELINE.map(s => s.spread)).size === 5, 'at least 15 baseline samples across all five spreads');

  for (const s of SAMPLES) {
    await check(`${s.id} ${s.spread} (${s.kind === 'baseline' ? s.mode : 'boundary'})`, async page => {
      const r = await renderSample(page, s);
      assert.deepEqual(r.valid, [], 'rule violations');
      assert.doesNotMatch(r.pageText, /\bundefined\b|\bNaN\b|\bnull\b|\[object/, 'placeholder text in the reading');
      const page1 = norm(r.pageText);
      for (const p of r.positions) {
        const where = `position ${p.n} (${p.label})`;
        assert.ok(p.positionContext.startsWith(`Position: ${p.label} — `), `${where}: lens names its own position`);
        // Q2b: every Celtic Cross role that has its own lens gets it.
        if (s.spread === 'celtic') {
          const want = { 'Crossing Challenge': /The tension to explore is/, 'Recent Past': /shaped the path/, 'Near Future': /possible development/, 'Potential Outcome': /possible development/, 'Your Approach': /Your next step is/ }[p.label];
          if (want) assert.match(p.positionContext, want, `${where}: its own position lens`);
        }
        const names = [p.base, p.c1, p.c2].filter(Boolean).map(c => c.name);
        if (!p.c1) { assert.deepEqual(p.steps, [], `${where}: no steps without a clarifier`); assert.equal(p.together, ''); }
        else {
          assert.deepEqual(p.steps.map(t => Number(t[0])), p.c2 ? [1, 2, 3, 4] : [1, 2, 3], `${where}: steps in order`);
          const lead1 = p.relation1.split('\n')[0];
          assert.ok(lead1.includes(p.c1.name) && lead1.includes(p.base.name), `${where}: step 2 names Clarifier 1 and the original: ${lead1}`);
          if (p.c2) { const lead2 = p.relation2.split('\n')[0]; assert.ok([p.c2, p.base, p.c1].every(c => lead2.includes(c.name)), `${where}: step 3 relates Clarifier 2 to both: ${lead2}`); }
          names.forEach(n => assert.ok(p.synthesisLead.includes(n), `${where}: Together names ${n}`));
          if (s.spread === 'celtic') {
            const pair = PAIRS.find(x => x.includes(p.n - 1)); const partner = r.positions[pair[0] === p.n - 1 ? pair[1] : pair[0]];
            assert.ok(p.synthesisWider.includes(`read with ${partner.label}, ${partner.base.name}`), `${where}: Celtic Cross partner ${partner.label}`);
          } else if (r.positions.length > 1) assert.match(p.synthesisWider, /neighbour is /, `${where}: neighbouring position named`);
        }
        const bothMajor = !!(p.c1 && p.c2 && p.c1.arcana === 'Major' && p.c2.arcana === 'Major');
        assert.equal(p.limit, bothMajor, `${where}: limit stated exactly when both clarifiers are Major`);
        assert.equal(p.pending, !!(p.c1 && p.c1.arcana === 'Major' && !p.c2), `${where}: Clarifier 2 due exactly when Clarifier 1 is Major and not yet drawn`);
      }
      // Max: quotes from the page, every card named, transcript = script.
      r.script.filter(l => l.kind === 'quote').forEach(l => assert.ok(page1.includes(norm(l.text)), 'Max quotes the page: ' + l.text));
      for (const p of r.positions) for (const c of [p.base, p.c1, p.c2].filter(Boolean)) assert.ok(r.script.some(l => l.kind === 'label' && l.text.includes(c.name)), `Max names ${c.name}`);
      assert.deepEqual(r.transcript, r.script.map(l => l.text), 'player transcript is the script');
      // Reproducible.
      await page.evaluate(() => go('home'));
      const again = await renderSample(page, s);
      assert.equal(again.pageText, r.pageText, 'same sample, same reading');
      assert.deepEqual(again.script, r.script, 'same sample, same narration');
    });
  }

  await check('boundary: a stray clarify on a finished card draws nothing (Minor Clarifier 1; two-Major limit)', async page => {
    const b02 = BOUNDARY.find(s => s.id === 'B02'), b01 = BOUNDARY.find(s => s.id === 'B01');
    for (const s of [b02, b01]) {
      await renderSample(page, s);
      const before = await page.evaluate(() => JSON.stringify([state.firstLayerClarifiers, state.additionalClarifierLayers]));
      const steps = await page.evaluate(n => Array.from({ length: n }, (_, i) => clarifyPosition(i)), s.base.length);
      assert.deepEqual(steps, s.base.map(() => ''), s.id + ': nothing to draw');
      assert.equal(await page.evaluate(() => JSON.stringify([state.firstLayerClarifiers, state.additionalClarifierLayers])), before, s.id + ': state unchanged');
      await page.evaluate(() => go('home'));
    }
  });

  await check('regression: Clarifier 2 revises "Together" and keeps the original, Clarifier 1 and Revision 1', async page => {
    const b03 = BOUNDARY.find(s => s.id === 'B03');
    const partial = { ...b03, steps: b03.steps.filter(st => !(st.pos === 0 && st.layer === 2)) };
    const one = await renderSample(page, partial);
    const p1 = one.positions[0];
    assert.equal(p1.pending, true);
    assert.match(p1.together, /Revision 1 · with Clarifier 1/);
    await page.evaluate(id => { const o = window.ResonateDeck; window.ResonateDeck = { ...o, drawRemaining: () => [id] }; clarifyPosition(0); window.ResonateDeck = o; state.drawnOrientations = { ...state.drawnOrientations, reversed: [...state.drawnOrientations.reversed.filter(x => x !== id)] }; renderDraw(); }, b03.c2[0]);
    const after = await page.evaluate(() => { const a = document.querySelector('.reading-meaning[data-position="0"]'); a.querySelectorAll('details').forEach(d => { d.open = true; }); const t = s => a.querySelector(s)?.innerText.trim() || ''; return { original: t('.original-card-explanation'), clar1: t('.integrated-clarifier[data-clarifier="1"]'), together: t('.combined-meaning'), lead: t('.synthesis-lead'), earlier: t('.synthesis-earlier') }; });
    assert.equal(after.original, p1.original, 'original card text unchanged');
    assert.equal(after.clar1, p1.clar1, 'Clarifier 1 text unchanged');
    assert.match(after.together, /Revision 2 · updated when Clarifier 2 was drawn/);
    assert.notEqual(after.lead, p1.synthesisLead, 'Together recalculated');
    assert.ok(after.earlier && p1.synthesisLead.startsWith(after.earlier.split('. ')[0]), 'Revision 1 still readable');
  });

  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + failures.length} passed${failures.length ? '\n' + failures.join('\n') : ''}`);
  process.exit(failures.length ? 1 : 0);
});
