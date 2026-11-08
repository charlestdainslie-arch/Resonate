/* Clarify one card, beside ▶ Watch Max (team directive, 7 Nov 2026).
 * On presenter-uat.html, through the real deck theatre (Shuffle, Draw), Celtic Cross with Major Arcana
 * dealt first so the rule applies, at Samsung sizes and on desktop:
 *   - the dock [✦ Clarify NN][▶ Watch Max] is on screen, side by side, untouched by anything else, at the
 *     top of the reading, at card 5 and in the written reading
 *   - at card 5 the dock targets card 05; Clarify draws for card 5 only (no other position changes)
 *   - Clarifier 1 sits below-left of the original card, Clarifier 2 below-right; no overlaps; labels on screen
 *   - the written reading for card 5 goes 1 original, 2 first clarifier, 3 second clarifier, 4 together;
 *     step 2 names both cards; step 3 relates Clarifier 2 to both; step 4 names all three and the Celtic
 *     Cross partner (Foundation); it is recalculated when Clarifier 2 arrives
 *   - Max's script, rebuilt when opened, narrates the updated reading word for word, with no outdated
 *     synthesis; captions show exactly the script's lines; Pause / Resume / Replay work
 *   - the end of the page can be scrolled clear of the dock
 * Screenshots: test-results/clarify-per-card-<width>-*.png
 * Run: node tests/clarify-per-card.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const majorsFirst = require('./helpers/majors-first.cjs');
const TARGET = 4; // card 5, Conscious Focus; its Celtic Cross partner is Foundation (card 3)

// The dock's two buttons: on screen, same row, close together, and each the topmost element where tapped.
const dockCheck = page => page.evaluate(() => {
  const c = document.getElementById('mcClarify'), w = document.getElementById('mcFloat'), dock = document.getElementById('mcDock');
  if (!c || !w || !dock || dock.hidden || w.hidden) return { ok: false, why: 'missing or hidden' };
  const a = c.getBoundingClientRect(), b = w.getBoundingClientRect();
  const on = r => r.width > 0 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
  const hit = (el, r) => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && el.contains(e); };
  const sameRow = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 4;
  const gap = b.left - a.right;
  return { ok: on(a) && on(b) && hit(c, a) && hit(w, b) && sameRow && gap >= 0 && gap <= 16 && a.height >= 44 && b.height >= 44, a: [a.left, a.top, a.width, a.height].map(Math.round), b: [b.left, b.top, b.width, b.height].map(Math.round), gap, sameRow, label: c.innerText.replace(/\s+/g, ' ') };
});
const snapshot = page => page.evaluate(() => ({
  first: [...(state.firstLayerClarifiers || [])],
  second: [...((state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [])]
}));

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let pass = 0, fail = 0;
  for (const [w, h] of [[360, 800], [412, 915], [1280, 800]]) {
    const name = `${w}x${h}, Celtic Cross, clarify card 5`;
    const mobile = w < 600;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    await ctx.addInitScript(majorsFirst);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const tap = sel => mobile ? page.locator(sel).tap() : page.locator(sel).click();
    try {
      await page.goto(base + '/presenter-uat.html');
      await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} go('reading'); });
      await page.locator('[data-spread="celtic"]').click();
      await page.waitForSelector('.dt-deck');
      await page.evaluate(() => document.getElementById('shuffleCardsBtn').click());
      await page.waitForFunction(() => !window.ResonateDeckTheatre.busy, null, { timeout: 30000 });
      await page.evaluate(() => document.getElementById('stageDrawBtn').click());
      await page.waitForFunction(() => state.view === 'draw' && state.drawSettled, null, { timeout: 60000 });
      await page.waitForTimeout(600);
      const baseCard = await page.evaluate(i => ({ id: state.drawnCardIds[i], major: cards.find(c => c.id === state.drawnCardIds[i]).arcana === 'Major', name: cards.find(c => c.id === state.drawnCardIds[i]).name }), TARGET);
      assert.ok(baseCard.major, 'majors-first: card 5 is a Major Arcana card, so the rule applies');

      // Top of the reading: dock present beside the launcher.
      await page.evaluate(() => document.getElementById('mcOpen').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      let d = await dockCheck(page); assert.ok(d.ok, 'dock at the top of the reading: ' + JSON.stringify(d));

      // Card 5: dock targets 05.
      await page.evaluate(i => document.querySelectorAll('.reading-position')[i].scrollIntoView({ block: 'center' }), TARGET);
      await page.waitForTimeout(500);
      d = await dockCheck(page); assert.ok(d.ok, 'dock at card 5: ' + JSON.stringify(d));
      assert.match(d.label, /^✦ Clarify 05 · Conscious Focus$/, 'Clarify names card 05');
      await page.screenshot({ path: path.join(OUT, `clarify-per-card-${w}-card5.png`) });

      // Clarify: card 5 only.
      const before = await snapshot(page);
      await tap('#mcClarify');
      await page.waitForFunction(i => (state.firstLayerClarifiers || [])[i] != null, TARGET, { timeout: 10000 });
      await page.waitForTimeout(800);
      let after = await snapshot(page);
      after.first.forEach((id, i) => { if (i !== TARGET) assert.equal(id ?? null, (before.first[i] ?? null), `position ${i + 1} untouched`); });
      const c1 = await page.evaluate(i => { const c = cards.find(x => x.id === state.firstLayerClarifiers[i]); return { name: c.name, major: c.arcana === 'Major' }; }, TARGET);

      // Reading after Clarifier 1: steps 1, 2, then together; Max narrates it.
      const art = `.reading-meaning[data-position="${TARGET}"]`;
      const steps = () => page.$$eval(`${art} .reading-step`, els => els.map(e => e.textContent.trim()));
      let s = await steps();
      assert.deepEqual(s.map(t => t[0]), ['1', '2', '3'], 'steps after Clarifier 1: ' + s.join(' | '));
      assert.match(s[1], /Clarifier 1 · how it modifies the original card/i); assert.match(s[2], /together/i);
      assert.match(await page.locator(`${art} .reading-revision-tag`).innerText(), /Revision 1/);
      const original1 = await page.locator(`${art} .original-card-explanation`).innerText();
      const step2Before = await page.locator(`${art} .integrated-clarifier[data-clarifier="1"]`).innerText();
      const lead1 = await page.locator(`${art} .integrated-clarifier[data-clarifier="1"] .relation-lead`).innerText();
      assert.ok(lead1.includes(c1.name) && lead1.includes(baseCard.name), 'step 2 names both cards: ' + lead1);
      const together1 = await page.locator(`${art} .synthesis-lead`).innerText();
      assert.ok(together1.includes(baseCard.name) && together1.includes(c1.name), 'together names both');
      assert.match(await page.locator(`${art} .synthesis-wider`).innerText(), /read with Foundation/, 'wider Celtic Cross partner');
      if (c1.major) assert.equal(await page.locator(`${art} .reading-pending`).count(), 1, 'notes that Clarifier 2 is due');
      const script1 = await page.evaluate(() => ResonatePresenter.buildScript().map(p => p.text));
      assert.ok(script1.includes(lead1), "Max says step 2 word for word");

      if (c1.major) {
        await page.evaluate(i => document.querySelectorAll('.reading-position')[i].scrollIntoView({ block: 'center' }), TARGET);
        await page.waitForTimeout(500);
        d = await dockCheck(page); assert.match(d.label, /^✦ Clarify 05 · Clarifier 2$/, 'dock offers Clarifier 2 for card 05');
        await tap('#mcClarify');
        await page.waitForFunction(i => ((state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [])[i] != null, TARGET, { timeout: 10000 });
        await page.waitForTimeout(1500);
        after = await snapshot(page);
        after.second.forEach((id, i) => { if (i !== TARGET) assert.equal(id ?? null, null, `no Clarifier 2 at position ${i + 1}`); });
        const c2 = await page.evaluate(i => cards.find(x => x.id === state.additionalClarifierLayers.find(l => l.number === 2).cards[i]).name, TARGET);

        // Layout: original above, Clarifier 1 below-left, Clarifier 2 below-right, nothing overlapping, labels on screen.
        await page.evaluate(i => document.querySelectorAll('.reading-position')[i].scrollIntoView({ block: 'center' }), TARGET);
        await page.waitForTimeout(700);
        const g = await page.evaluate(i => {
          const pos = document.querySelectorAll('.reading-position')[i];
          const r = el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width }; };
          const main = r(pos.querySelector('.reading-card'));
          const cl = [...pos.querySelectorAll('.position-clarifier')].map(el => ({ img: r(el.querySelector('img')), label: r(el.querySelector('strong')), loaded: el.querySelector('img').complete && el.querySelector('img').naturalWidth > 0 }));
          return { main, cl, vw: innerWidth };
        }, TARGET);
        assert.equal(g.cl.length, 2, 'two clarifiers shown');
        const [a, b] = g.cl;
        const overlap = (x, y) => x.l < y.r - 1 && y.l < x.r - 1 && x.t < y.b - 1 && y.t < x.b - 1;
        assert.ok(a.img.t >= g.main.b - 1 && b.img.t >= g.main.b - 1, 'both clarifiers below the original');
        assert.ok(a.img.l < b.img.l, 'Clarifier 1 left of Clarifier 2');
        assert.ok((a.img.l + a.img.r) / 2 <= (g.main.l + g.main.r) / 2 && (b.img.l + b.img.r) / 2 >= (g.main.l + g.main.r) / 2, 'below-left and below-right');
        assert.ok(!overlap(a.img, b.img) && !overlap(a.img, g.main) && !overlap(b.img, g.main), 'no overlapping cards');
        for (const c of g.cl) assert.ok(c.loaded && c.label.l >= 0 && c.label.r <= g.vw && c.label.w > 0, 'image loaded and label on screen');
        await page.screenshot({ path: path.join(OUT, `clarify-per-card-${w}-clarified.png`) });
        d = await dockCheck(page);
        const bothMajor = await page.evaluate(i => [state.firstLayerClarifiers[i], state.additionalClarifierLayers.find(l => l.number === 2).cards[i]].every(id => cards.find(c => c.id === id).arcana === 'Major'), TARGET);
        // Card 5 is a Major (majors-first), so with two Major clarifiers Option B makes a Clarity card due.
        assert.match(d.label, bothMajor ? /05 · Clarity card/ : /05 · clarified ✓/, 'dock offers the Clarity card, or shows card 05 complete');
        assert.equal(await page.locator(`${art} .reading-limit`).count(), bothMajor ? 1 : 0, 'Clarity card due stated only when both clarifiers are Major');
        assert.equal(await page.locator('#mcClarify').isDisabled(), !bothMajor, 'Clarify stays available only for the Clarity card');

        // Reading recalculated: 4 steps, step 3 relates Clarifier 2 to both, together names all three.
        s = await steps();
        assert.deepEqual(s.map(t => t[0]), ['1', '2', '3', '4'], 'four steps: ' + s.join(' | '));
        assert.match(s[2], /Clarifier 2 · how it develops the relationship between both/i);
        // Decision 4: the original and Clarifier 1 readings are kept as they were; the revision is shown.
        assert.equal(await page.locator(`${art} .original-card-explanation`).innerText(), original1, 'original card reading unchanged');
        assert.equal(await page.locator(`${art} .integrated-clarifier[data-clarifier="1"]`).innerText(), step2Before, 'Clarifier 1 reading unchanged');
        assert.match(await page.locator(`${art} .reading-revision-tag`).innerText(), /Revision 2/);
        assert.ok((await page.locator(`${art} details.reading-revision .synthesis-earlier`).evaluate(e => e.textContent)).includes(together1.split(/(?<=[.?!])\s+(?=[A-Z])/)[0]), 'Revision 1 text still readable');
        const lead2 = await page.locator(`${art} .integrated-clarifier[data-clarifier="2"] .relation-lead`).innerText();
        assert.ok(lead2.includes(c2) && lead2.includes(baseCard.name) && lead2.includes(c1.name), 'step 3 relates Clarifier 2 to both: ' + lead2);
        const together2 = await page.locator(`${art} .synthesis-lead`).innerText();
        assert.ok([baseCard.name, c1.name, c2].every(n => together2.includes(n)), 'together names all three');
        assert.notEqual(together2, together1, 'synthesis recalculated');
        assert.equal(await page.locator(`${art} .reading-pending`).count(), 0, 'pending note gone');
        await page.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'center' }), `${art} .combined-meaning`);
        await page.waitForTimeout(400);
        d = await dockCheck(page); assert.ok(d.ok, 'dock in the written reading: ' + JSON.stringify(d));
        await page.screenshot({ path: path.join(OUT, `clarify-per-card-${w}-together.png`) });

        // Max: rebuilt on open, updated, nothing outdated; captions are the script's own lines.
        const script = await page.evaluate(() => ResonatePresenter.buildScript());
        const texts = script.map(p => p.text);
        assert.ok(texts.includes(lead2), 'Max says step 3');
        const firstTogether = (await page.evaluate(t => t.split(/(?<=[.?!])\s+(?=[A-Z])/)[0], together2));
        assert.ok(texts.includes(firstTogether), 'Max says the new synthesis');
        // The original card's opening sentence ("X sets the theme in ...") rightly stays the same across revisions
        // (9 Nov 2026 synthesis); every sentence that belonged only to the earlier "together" must be gone from Max.
        const split = t => t.split(/(?<=[.?!])\s+(?=[A-Z])/);
        const oldOnly = split(together1).filter(x => !split(together2).includes(x));
        assert.ok(oldOnly.length > 0, 'the earlier synthesis differs from the new one');
        oldOnly.forEach(x => assert.ok(!texts.includes(x), 'no outdated synthesis in Max: ' + x));
        const pageText = await page.locator(art).innerText();
        script.filter(p => p.kind === 'quote' && p.chapter !== 'close' && p.show.includes('p' + TARGET)).forEach(p => assert.ok(pageText.replace(/\s+/g, ' ').includes(p.text), 'quoted from the page: ' + p.text));
        await tap('#mcFloat');
        await page.waitForSelector('.mc-player');
        assert.equal(await page.locator('#mcDock').isVisible(), false, 'dock hidden while Max is open');
        await tap('#mcSound');
        await tap('#mcPlay');
        const seen = new Set();
        for (let k = 0; k < 12; k++) { seen.add((await page.locator('#mcCaption').innerText()).trim()); await page.waitForTimeout(250); }
        [...seen].filter(Boolean).forEach(t => assert.ok(texts.some(x => x.trim() === t), 'caption is a script line: ' + t));
        assert.match(await page.locator('#mcPlay').innerText(), /Pause/);
        await tap('#mcPlay'); assert.match(await page.locator('#mcPlay').innerText(), /Resume/);
        await tap('#mcReplay');
        await page.waitForFunction(() => /^Part 1 of/.test(document.getElementById('mcPart').textContent), null, { timeout: 5000 });
        await tap('#mcClose');
        await page.waitForSelector('.mc-player', { state: 'detached' });

        // Option B: draw the Clarity card from the dock. It sits centred below Clarifiers 1 and 2, overlapping nothing.
        if (bothMajor) {
          await page.evaluate(i => document.querySelectorAll('.reading-position')[i].scrollIntoView({ block: 'center' }), TARGET);
          await page.waitForTimeout(500);
          await tap('#mcClarify');
          await page.waitForFunction(i => readingClarity()[i] != null, TARGET, { timeout: 5000 });
          await page.waitForTimeout(800);
          const k = await page.evaluate(i => {
            const pos = document.querySelectorAll('.reading-position')[i];
            const r = el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
            const cl = [...pos.querySelectorAll('.position-clarifier img')].map(r), k = pos.querySelector('.position-clarity img');
            const img = k && r(k); const label = pos.querySelector('.position-clarity strong');
            return { cl, img, loaded: k && k.complete && k.naturalWidth > 0, labelIn: !!label && label.getBoundingClientRect().right <= innerWidth && label.getBoundingClientRect().left >= 0, minor: cards[readingClarity()[i]].arcana === 'Minor' };
          }, TARGET);
          const overlap = (x, y) => x.l < y.r - 1 && y.l < x.r - 1 && x.t < y.b - 1 && y.t < x.b - 1;
          assert.ok(k.img && k.loaded && k.labelIn && k.minor, 'Clarity card shown, a Minor, label on screen');
          assert.ok(k.img.t >= Math.max(k.cl[0].b, k.cl[1].b) - 1, 'below both clarifiers');
          const mid = (k.cl[0].l + k.cl[1].r) / 2, kmid = (k.img.l + k.img.r) / 2;
          assert.ok(Math.abs(kmid - mid) <= 12, 'centred under the pair: ' + (kmid - mid).toFixed(1));
          assert.ok(!k.cl.some(c => overlap(c, k.img)), 'overlaps no clarifier');
          await page.screenshot({ path: path.join(OUT, `clarify-per-card-${w}-clarity.png`) });
          d = await dockCheck(page);
          assert.match(d.label, /05 · clarified ✓/);
          assert.equal(await page.locator('#mcClarify').isDisabled(), true, 'nothing more to draw for card 5');
          assert.deepEqual((await steps()).map(t => t[0]), ['1', '2', '3', '4', '5'], 'five steps with the Clarity card');
          assert.match(await page.locator(`${art} .reading-revision-tag`).innerText(), /Revision 3/);
        }

        // Decision 5: adding a clarifier while Max is narrating stops him and offers Replay Updated Reading.
        const other = await page.evaluate(() => { const due = nextDueClarifier(); if (due >= 0) return due; return clarifierPlan().positions.findIndex(p => p.first == null); });
        if (other >= 0) {
          await tap('#mcFloat');
          await page.waitForSelector('.mc-player');
          await tap('#mcSound'); await tap('#mcPlay');
          await page.waitForTimeout(400);
          await page.evaluate(i => clarifyPosition(i), other);   // stands in for a tap that adds a clarifier
          await page.waitForSelector('.mc-player', { state: 'detached', timeout: 3000 });
          await page.waitForTimeout(400);
          assert.match(await page.locator('#mcFloat').innerText(), /Replay Updated/, 'dock offers Replay Updated');
          assert.match(await page.locator('#mcOpen').innerText(), /Replay Updated Reading/, 'top launcher offers Replay Updated Reading');
          await tap('#mcFloat');
          await page.waitForSelector('.mc-player');
          const fresh = await page.evaluate(() => [...document.querySelectorAll('.mc-transcript li')].map(li => li.textContent));
          const added = await page.evaluate(i => { const first = state.firstLayerClarifiers[i], second = (state.additionalClarifierLayers.find(l => l.number === 2)?.cards || [])[i]; const c = cards.find(x => x.id === (second ?? first)); return `${second != null ? 'Clarifier 2' : 'Clarifier 1'} · ${positionLabels()[i]}: ${cardName(c)}.`; }, other);
          assert.ok(fresh.includes(added), 'the replay includes the newly added clarifier: ' + added);
          await tap('#mcClose');
          await page.waitForSelector('.mc-player', { state: 'detached' });
          await page.waitForTimeout(400);
          assert.match(await page.locator('#mcFloat').innerText(), /Watch Max/, 'back to Watch Max once the update is heard');
        }
      }

      // End of the page clears the dock.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      const clear = await page.evaluate(() => { const last = [...document.querySelectorAll('.page.draw-page > *')].filter(e => e.getBoundingClientRect().height).pop(); return last.getBoundingClientRect().bottom <= document.getElementById('mcDock').getBoundingClientRect().top + 1; });
      assert.ok(clear, 'last content scrolls above the dock');
      assert.deepEqual(errors.filter(e => !/manifest\.json/.test(e)), []);
      console.log('PASS ', name, c1.major ? '(two clarifiers)' : '(one clarifier: Clarifier 1 was not a Major)'); pass++;
    } catch (e) { console.log('FAIL ', name, '—', e.message.slice(0, 400)); fail++; await page.screenshot({ path: path.join(OUT, `clarify-per-card-${w}-FAIL.png`) }).catch(() => {}); }
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
});
