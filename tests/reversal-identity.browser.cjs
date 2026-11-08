/* Reversals, relationships and card identity across all 78 cards (Si Aye directive, 9 Nov 2026, after Deep found
 * The Magician reversed bridged with upright qualities in the Golden Thread).
 * For every card X, in both orientations, X is placed as the original card of a reading, clarified by a card Y it
 * has a written connection with (so the upright-only connection text is in play), and read on presenter-uat.html:
 *   identity    - the page, Golden Thread and Max name X with its own name and orientation, and read X from the
 *                 meaning written for that orientation (data.js upright / reversed text);
 *   reversals   - when X is reversed: none of X's upright meaning text, no upright keyword pair for X, and no
 *                 written connection (written for the upright pair) appears anywhere in the reading, the Golden
 *                 Thread or Max's script; X's reversed keywords set the theme of the "Together";
 *                 when X is upright: the reversed text does not appear, and the written connection is quoted;
 *   relationships - the "Together" names X and Y, says how Y relates (supports/pushes back/changes/says the same),
 *                 ends in a proposition for the position, and is not the old keyword-list template.
 * Then a two-position check of the card-to-card bridge in the Golden Thread for each X reversed after a card it
 * connects with (the Magician case), and the reverse order.
 * Run: node tests/reversal-identity.browser.cjs   Requires: playwright + chromium */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/presenter-uat.html');
  await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
  let pass = 0; const failures = [];
  const check = (name, fn) => { try { fn(); pass++; } catch (e) { failures.push(name); console.log('FAIL ', name, '—', e.message.slice(0, 300)); } };

  // One reading per card and orientation, rendered by the app; returns the texts to check.
  const results = await page.evaluate(() => {
    const out = [];
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const txt = el => el ? el.innerText.replace(/\s+/g, ' ').trim() : '';
    for (const x of cards) for (const rev of [false, true]) {
      const partner = (x.connections || []).map(c => cards.find(k => norm(k.name) === norm(c.card))).find(k => k && k.id !== x.id) || cards.find(k => k.id !== x.id && k.arcana !== x.arcana) || cards[(x.id + 1) % 78];
      const sample = { id: 'X', spread: 'guidance', base: [x.id], reversed: rev ? [x.id] : [], steps: [{ pos: 0, layer: x.arcana === 'Major' ? 1 : 1, id: partner.id }] };
      ResonateQA.load(sample);
      document.querySelectorAll('.reading-meaning details').forEach(d => { d.open = true; });
      const art = document.querySelector('.reading-meaning[data-position="0"]');
      const connection = ((x.connections || []).find(c => norm(c.card) === norm(partner.name)) || (partner.connections || []).find(c => norm(c.card) === norm(x.name)) || {}).meaning || '';
      out.push({ id: x.id, name: x.name, rev, partner: partner.name, connection,
        heading: txt(art.querySelector('.original-card-explanation h3')),
        original: txt(art.querySelector('.original-card-explanation')),
        lead: txt(art.querySelector('.synthesis-lead')),
        page: txt(document.getElementById('readingInterpretation')),
        thread: txt(document.querySelector('.reading-golden-thread')),
        max: ResonatePresenter.buildScript({ finished: true }).map(p => p.text).join(' ') });
    }
    // Card-to-card bridges: X reversed after (and before) a card it connects with, both upright otherwise.
    const bridges = [];
    for (const x of cards) {
      const partner = (x.connections || []).map(c => cards.find(k => norm(k.name) === norm(c.card))).find(k => k && k.id !== x.id);
      if (!partner) continue;
      // Either card may carry a written connection to the other; the bridge quotes one of them.
      const connections = [(partner.connections || []).find(c => norm(c.card) === norm(x.name)), (x.connections || []).find(c => norm(c.card) === norm(partner.name))].filter(Boolean).map(c => c.meaning);
      const connection = connections[0] || '';
      for (const order of [[partner.id, x.id], [x.id, partner.id]]) for (const rev of [true, false]) {
        ResonateQA.load({ id: 'Y', spread: 'three', base: [...order, cards.find(k => !order.includes(k.id)).id], reversed: rev ? [x.id] : [], steps: [] });
        const thread = txt(document.querySelector('.card-to-card-thread'));
        bridges.push({ x: x.name, partner: partner.name, order: order[0] === x.id ? 'x-first' : 'x-second', rev, connection, connections, thread });
      }
    }
    return { out, bridges, upright: Object.fromEntries(cards.map(c => [c.id, { upright: c.upright, reversed: c.reversed, uk: c.uprightKeywords, rk: c.reversedKeywords }])) };
  });

  for (const r of results.out) {
    const d = results.upright[r.id], tag = `${r.name}${r.rev ? ' reversed' : ''} (with ${r.partner})`;
    const all = [r.page, r.thread, r.max].join(' ');
    const pairOf = k => k.slice(0, 2).join(' and ').toLowerCase();
    check(`identity ${tag}`, () => {
      assert.ok(r.heading.includes(r.rev ? `${r.name}, reversed` : r.name), `heading "${r.heading}"`);
      if (!r.rev) assert.ok(!r.heading.includes('reversed'), 'upright card labelled reversed');
      assert.ok(r.original.includes(r.rev ? d.reversed : d.upright), 'original card not read from its own orientation text');
      assert.ok(r.lead.startsWith(`${r.name}${r.rev ? ' (reversed)' : ''} sets the theme in Guidance: ${pairOf(r.rev ? d.rk : d.uk)}.`), `lead "${r.lead.slice(0, 160)}"`);
    });
    check(`reversals ${tag}`, () => {
      if (r.rev) {
        assert.ok(!all.includes(d.upright), 'upright meaning text used for the reversed card');
        assert.ok(!r.lead.includes(pairOf(d.uk)) && !r.thread.includes(pairOf(d.uk)), `upright keywords "${pairOf(d.uk)}" used for the reversed card`);
        if (r.connection) assert.ok(!all.includes(r.connection), 'upright-pair connection quoted with a reversed card');
      } else {
        assert.ok(!r.original.includes(d.reversed), 'reversed meaning text used for the upright card');
        if (r.connection) assert.ok(r.page.includes(r.connection), 'written connection between two upright cards not quoted');
      }
    });
    check(`relationships ${tag}`, () => {
      assert.ok(r.lead.includes(r.partner), 'Together does not name the clarifier');
      assert.match(r.lead, /says the same thing more strongly|gives it somewhere to go|pushes back|changes its emphasis/);
      assert.match(r.lead, /As guidance, the cards point to /);
      assert.doesNotMatch(r.lead, /^Together, |putting the weight on|what would honour both sides/);
      assert.ok(r.max.includes(r.lead.split('. ')[0]), 'Max does not narrate the corrected Together');
    });
  }
  for (const b of results.bridges) {
    const tag = `bridge ${b.x}${b.rev ? ' reversed' : ''} ${b.order} with ${b.partner}`;
    check(tag, () => {
      assert.doesNotMatch(b.thread, /next step in the Major Arcana sequence/);
      if (b.rev) assert.ok(!b.connections.some(c => b.thread.includes(c)), 'upright-pair connection used in a bridge with a reversed card');
      else assert.ok(b.connections.some(c => b.thread.includes(c)), 'upright-pair connection missing from the bridge');
      if (b.rev) assert.ok(b.thread.includes(`${b.x} (reversed)`), 'reversed card not named as reversed in its bridge');
    });
  }
  check('no page errors', () => assert.deepEqual(errors, []));
  console.log(`checked ${results.out.length} readings (78 cards x 2 orientations) and ${results.bridges.length} card-to-card bridges`);
  console.log(failures.length ? `\n${pass} passed, ${failures.length} failed` : `PASS  all ${pass} checks\n\n${pass} passed, 0 failed`);
  await browser.close(); server.close();
  process.exit(failures.length ? 1 : 0);
});
