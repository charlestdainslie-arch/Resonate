/* Clarifier teaching rule (Issue #13) and card-to-card thread (#10 F1) in the real page.
 * Run: node tests/teaching-rules.browser.cjs
 * Each case fixes the drawn cards and queues which clarifiers come next, so the rule is tested exactly. */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
function serve() { return new Promise(r => { const s = http.createServer((req, res) => { let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html'; const f = path.join(ROOT, u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); }); }

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  let passed = 0; const failures = [];
  async function check(name, fn) {
    try { await fn(); passed++; console.log('PASS', name); }
    catch (e) { failures.push(`FAIL ${name}: ${e.message.split('\n')[0]}`); console.log('FAIL', name, '—', e.message.split('\n')[0]); }
  }
  // Opens a reading of the given spread with exactly these cards, and a queue of clarifier cards to hand out.
  async function reading(width, spread, drawn, queue) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 860 : 900 }, reducedMotion: 'reduce', acceptDownloads: true });
    const p = await ctx.newPage(); p.__errors = [];
    p.on('pageerror', e => p.__errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/attribute d: Expected number/.test(m.text())) p.__errors.push(m.text()); });
    await p.goto(base); await p.waitForTimeout(300);
    await p.evaluate(({ spread, drawn, queue }) => {
      const original = window.ResonateDeck;
      const q = [...queue];
      window.ResonateDeck = { ...original, drawRemaining(ids, used, count) { const out = q.splice(0, count); if (out.length !== count) throw new Error('test queue empty'); out.forEach(id => { if (used.includes(id)) throw new Error('queued card already used: ' + id); }); return out; } };
      state.spreadId = spread; state.spreadSize = currentSpread().positions.length;
      state.drawnCardIds = drawn; state.drawnAt = new Date().toISOString();
      state.view = 'draw'; state.drawSettled = true; state.drawPhase = 'settled';
      state.firstLayerClarifiers = []; state.clarifierReadingAt = null; state.additionalClarifierLayers = []; state.additionalClarifierReadingAt = null;
      render();
    }, { spread, drawn, queue });
    await p.waitForTimeout(200);
    return { ctx, p };
  }
  const snapshot = p => p.evaluate(() => ({
    first: [...(state.firstLayerClarifiers || [])], second: [...((state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [])],
    clarity: [...((state.additionalClarifierLayers || []).find(l => l.number === 3)?.cards || [])],
    button: document.getElementById('primaryClarifierAction')?.textContent.trim() || null,
    help: document.querySelector('.reading-help')?.textContent.trim() || '',
    choices: [...document.querySelectorAll('[data-clarify-position]')].map(b => Number(b.dataset.clarifyPosition)),
    optional: [...document.querySelectorAll('[data-clarify-position]:not(.clarify-due)')].map(b => Number(b.dataset.clarifyPosition)),
    due: [...document.querySelectorAll('[data-clarify-position].clarify-due')].map(b => Number(b.dataset.clarifyPosition)),
    slots: [...document.querySelectorAll('.reading-position')].map(pos => pos.querySelectorAll('.position-clarifier').length),
    waiting: [...document.querySelectorAll('.reading-position')].map(pos => pos.querySelectorAll('.position-clarifier-slot').length),
    valid: ResonateClarifiers.validate(state.drawnCardIds.map(id => cards.find(c => c.id === id)), state.firstLayerClarifiers, (state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [], id => cards.find(c => c.id === id), (state.additionalClarifierLayers || []).find(l => l.number === 3)?.cards || [])
  }));

  // Three cards: The Fool (Major), Four of Wands (Minor), The Magician (Major).
  const minor = await (async () => { const { ctx, p } = await reading(1280, 'three', [0], []); const id = await p.evaluate(() => cards.find(c => c.arcana !== 'Major').id); await ctx.close(); return id; })();
  const minors = await (async () => { const { ctx, p } = await reading(1280, 'three', [0], []); const ids = await p.evaluate(() => cards.filter(c => c.arcana !== 'Major').map(c => c.id)); await ctx.close(); return ids; })();
  const [m1, m2, m3, m4, m5, m6, k1, k2, k3, k4] = minors;

  // Since the team directive of 7 Nov 2026 the main button clarifies one card at a time: the first card,
  // in spread order, that the rule is waiting on, finishing that card (Clarifier 2 if Clarifier 1 is a
  // Major) before moving on. Each press changes exactly one position.
  const press = async p => {
    const before = await snapshot(p);
    await p.locator('#primaryClarifierAction').click(); await p.waitForTimeout(200);
    const after = await snapshot(p);
    const changed = after.first.map((id, i) => (id ?? null) !== (before.first[i] ?? null) || (after.second[i] ?? null) !== (before.second[i] ?? null) || (after.clarity[i] ?? null) !== (before.clarity[i] ?? null) ? i : -1).filter(i => i >= 0);
    assert.equal(changed.length, 1, 'one press, one card: ' + JSON.stringify(changed));
    return after;
  };
  const pressUntilDone = async (p, max = 20) => { let s = await snapshot(p); for (let k = 0; k < max && s.button; k++) s = await press(p); return s; };

  for (const width of [390, 1280]) {
    await check(`${width}px three-card: Majors get a first clarifier one card at a time, the Minor waits for the seeker`, async () => {
      // Queue: Fool's Clarifier 1 = High Priestess (2, Major), so its Clarifier 2 = a Minor; then the Magician's Clarifier 1.
      const { ctx, p } = await reading(width, 'three', [0, m1, 1], [2, m2, m3]);
      let s = await snapshot(p);
      assert.match(s.button, /^Draw First Clarifier for 01 · .+ →$/);
      assert.deepEqual(s.optional, [1], 'only the Minor offers "Clarify this card"');
      assert.deepEqual(s.due, [0, 2], 'each Major shows its own Draw Clarifier 1 button');
      s = await press(p);
      assert.deepEqual(s.first, [2, null, null], 'only the first card is clarified');
      assert.deepEqual(s.slots, [1, 0, 0]);
      assert.deepEqual(s.waiting, [1, 0, 0], 'a waiting second slot only after the Major clarifier');
      assert.match(s.button, /^Draw Second Clarifier for 01 · /);
      s = await press(p);
      assert.deepEqual([s.first, s.second], [[2, null, null], [m2, null, null]]);
      assert.match(s.button, /^Draw First Clarifier for 03 · /);
      s = await press(p);
      assert.deepEqual([s.first, s.second], [[2, null, m3], [m2, null, null]]);
      assert.equal(s.button, null, 'a Minor Clarifier 1 earns no second; the Journal save takes over');
      assert.deepEqual(s.valid, []);
      assert.deepEqual(p.__errors, []);
      await ctx.close();
    });
  }

  await check('a card’s own button clarifies that card only', async () => {
    const { ctx, p } = await reading(390, 'three', [0, m1, 1], [m2]);
    await p.locator('[data-clarify-position="2"]').click(); await p.waitForTimeout(200);
    const s = await snapshot(p);
    assert.deepEqual(s.first, [null, null, m2], 'the Magician only; the Fool still waits');
    assert.deepEqual(s.due, [0]);
    await ctx.close();
  });

  await check('second clarifier only after a Major clarifier; never a third; three Majors earn one Clarity card (Option B)', async () => {
    // Fool, Clarifier 1 High Priestess, Clarifier 2 Empress: all Major, so the Clarity card m2; then the Magician's Clarifier 1 m3.
    const { ctx, p } = await reading(390, 'three', [0, m1, 1], [2, 3, m2, m3]);
    const s = await pressUntilDone(p);
    assert.deepEqual(s.second, [3, null, null]);
    assert.deepEqual(s.clarity, [m2, null, null], 'one Clarity card, for the card with three Majors');
    assert.deepEqual(s.slots, [2, 0, 1]);
    assert.equal(s.button, null, 'main button gives way to the Journal save');
    assert.match(s.help, /complete/i);
    assert.deepEqual(s.valid, []);
    assert.equal(await p.locator('.reading-meaning[data-position="0"] .integrated-clarity').count(), 1, 'the Clarity card is read');
    assert.equal(await p.locator('.reading-limit').count(), 0, 'nothing more is due');
    await p.evaluate(() => { drawNextClarifierLayer(0); clarifyPosition(0); });
    assert.deepEqual([(await snapshot(p)).second, (await snapshot(p)).clarity], [[3, null, null], [m2, null, null]], 'a stray call adds nothing');
    await ctx.close();
  });

  await check('seeker clarifies the Minor; a Major clarifier there earns a second', async () => {
    // Fool: 2, then (after the seeker's 5 on the Minor) 3 and a Clarity card k1; the Minor: 6 (a Major original is
    // needed for a Clarity card, so none); the Magician: m2.
    const { ctx, p } = await reading(390, 'three', [0, m1, 1], [2, 5, 3, k1, 6, m2]);
    await press(p);                                                                   // Fool: Clarifier 1 = 2
    await p.locator('[data-clarify-position="1"]').click(); await p.waitForTimeout(200); // seeker's choice: 5
    let s = await snapshot(p);
    assert.deepEqual(s.first, [2, 5, null]);
    assert.deepEqual(s.optional, [], 'no optional choice left once every Minor has a first clarifier');
    s = await pressUntilDone(p);
    assert.deepEqual(s.first, [2, 5, m2]);
    assert.deepEqual(s.second, [3, 6, null], 'both Major clarifiers get a second, the Minor one does not');
    assert.deepEqual(s.clarity, [k1, null, null], 'Clarity card only where the original is a Major too');
    assert.match(await p.locator('.reading-meaning[data-position="1"] .reading-limit').innerText(), /applies only when the original card is a Major/);
    assert.deepEqual(s.valid, []);
    await ctx.close();
  });

  await check('no Major in the spread: nothing drawn unasked, every card can be clarified', async () => {
    const { ctx, p } = await reading(390, 'three', [m1, m2, m3], [m4]);
    const s = await snapshot(p);
    assert.equal(s.button, null);
    assert.match(s.help, /No Major Arcana card needs a clarifier/);
    assert.deepEqual(s.choices, [0, 1, 2]);
    await p.locator('[data-clarify-position="2"]').click(); await p.waitForTimeout(200);
    const t = await snapshot(p);
    assert.deepEqual(t.first, [null, null, m4]);
    assert.deepEqual(t.waiting, [0, 0, 0], 'a Minor clarifier earns no second');
    await ctx.close();
  });

  await check('saved to the Journal and reopened: same cards, same clarifiers, same empty slots', async () => {
    const { ctx, p } = await reading(390, 'three', [0, m1, 1], [2, 3, m2, m3]);
    await pressUntilDone(p);
    const before = await snapshot(p);
    await p.locator('#saveReadingJournal').click(); await p.waitForTimeout(300);
    const id = await p.evaluate(() => { const j = JSON.parse(localStorage.getItem('resonate-reading-journal-v1')); const list = Array.isArray(j) ? j : (j.readings || Object.values(j)); return String(list[0].id); });
    await p.evaluate(() => go('home')); await p.waitForTimeout(200);
    await p.evaluate(id => openJournalReading(id), id); await p.waitForTimeout(400);
    const after = await snapshot(p);
    assert.deepEqual([after.first, after.second, after.clarity, after.slots], [before.first, before.second, before.clarity, before.slots]);
    assert.deepEqual(before.clarity, [m2, null, null], 'the Clarity card is saved and restored');
    assert.deepEqual(p.__errors, []);
    await ctx.close();
  });

  await check('PDF downloads and names every card and clarifier drawn', async () => {
    const { ctx, p } = await reading(1280, 'three', [0, m1, 1], [2, 3, m2, m3]);
    await pressUntilDone(p);
    const text = await p.evaluate(() => document.getElementById('readingInterpretation').innerText);
    const names = await p.evaluate(ids => ids.map(id => cards.find(c => c.id === id).name), [0, m1, 1, 2, m2, 3, m3]);
    names.forEach(n => assert.ok(text.includes(n), 'reading names ' + n));
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.locator('#downloadReading').click()]);
    const file = await dl.path();
    assert.equal(fs.readFileSync(file).slice(0, 5).toString(), '%PDF-');
    await ctx.close();
  });

  await check('card-to-card thread: opening, one bridge per following card, closing; none for one card', async () => {
    const { ctx, p } = await reading(390, 'three', [0, 1, m1], []);
    const t = await p.evaluate(() => document.querySelector('.card-to-card-thread')?.innerText || '');
    assert.match(t, /FROM CARD TO CARD/i);
    assert.match(t, /The reading begins with The Fool/);
    assert.equal(await p.locator('.card-to-card-thread .golden-card-bridge').count(), 2);
    // 9 Nov 2026 (Deep / Si Aye): the closing names the reading's movement, not a generic line.
    assert.match(t, /From new beginnings to [a-z ]+, the reading (turns|moves|builds)|each card builds on the one before it/);
    assert.doesNotMatch(t, /Keep the part that speaks to your lived situation|next step in the Major Arcana sequence/);
    assert.equal(await p.locator('.card-to-card-thread .golden-thread-resonance').count(), 0, 'Max reads the Golden Thread’s own closing line, not this one');
    assert.doesNotMatch(t, /turns that earlier impulse|shifts the emphasis/, 'Deep’s softer wording only');
    await ctx.close();
    const one = await reading(390, 'guidance', [0], []);
    assert.equal(await one.p.locator('.card-to-card-thread').count(), 0);
    await one.ctx.close();
  });

  await check('Celtic Cross at 360px: rule holds across ten positions, no repeats', async () => {
    const drawn = [0, m1, 1, m2, 2, m3, 3, m4, 4, m5];
    // One card at a time: 01 (5, 9, Clarity k1), 03 (6, 10, k2), 05 (a Minor: no second), 07 (7, 11, k3), 09 (8, 12, k4).
    const { ctx, p } = await reading(360, 'celtic', drawn, [5, 9, k1, 6, 10, k2, m6, 7, 11, k3, 8, 12, k4]);
    const s = await pressUntilDone(p);
    assert.deepEqual(s.first.map(x => x != null), [true, false, true, false, true, false, true, false, true, false]);
    assert.equal(s.second.filter(x => x != null).length, 4, 'a second for each Major first clarifier (4 of 5)');
    assert.deepEqual(s.clarity, [k1, null, k2, null, null, null, k3, null, k4, null], 'a Clarity card wherever three Majors met');
    assert.deepEqual(s.valid, []);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no side-scroll');
    await ctx.close();
  });

  await browser.close(); server.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} teaching-rule checks`);
})();
