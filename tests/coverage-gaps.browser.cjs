// Coverage-gap browser checks (Playwright) for the 31 Oct candidate (#24), on top of PR #18.
// Covers the controls the 27 Oct screen crawl found untested:
//   G1 Learn search, fuzzy spelling, clear, element filter, no-match reset; state survives card detail + Back
//   G2 Card detail bookmark (persists, reaches Journal, announces state) and Upright/Reversed tabs
//   G3 Every reading card opens its own position; the astrology snapshot expander opens and closes
//   G4 Journal edited reflection: unsaved notice, save, survives reload
//   G5 Shuffle parity: every spread uses the same contained shuffle with no stagger delay
// Run with: node tests/coverage-gaps.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8773;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = ['http:', '', '127.0.0.1:' + port, ''].join('/');
const view = page => page.evaluate(() => state.view);
const back = async page => { await page.goBack(); await page.waitForTimeout(150); };
const tileCount = page => page.locator('.card-grid [data-card]').count();

async function drawSpread(page, spread) {
  await page.evaluate(() => go('reading'));
  await page.locator(`[data-spread="${spread}"]`).click();
  await page.locator('#stageDrawBtn').click();
  await page.waitForFunction(() => state.drawSettled === true, null, { timeout: 15000 });
}

const configs = [
  ['Pixel 7', { ...devices['Pixel 7'], reducedMotion: 'reduce' }],
  ['1280px', { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }],
];

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = []; let passed = 0;
  try {
    for (const [label, options] of configs) {
      const ctx = await browser.newContext(options);
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const check = async (name, fn) => { try { await fn(); passed++; } catch (e) { failures.push(`${label} ${name}: ${e.message.replace(/\s+/g, ' ').slice(0, 260)}`); } };
      const tap = loc => options.hasTouch ? loc.tap() : loc.click();
      await page.goto(BASE);
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // ---------- G1 Learn ----------
      await tap(page.locator('.home-actions [data-go="learn"]'));
      const total = await page.evaluate(() => cards.length);
      await check('G1 Learn shows the full 78-card deck', async () => { assert.equal(total, 78); assert.equal(await tileCount(page), 78); });
      await check('G1 search finds Temperance and keeps focus while typing', async () => {
        await page.locator('#searchInput').fill('temperance');
        assert.equal(await tileCount(page), 1);
        assert.match(await page.locator('.card-grid [data-card] h2').first().textContent(), /Temperance/);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'searchInput');
        assert.match(await page.locator('.section-label small').textContent(), /^1 card$/);
      });
      await check('G1 close misspelling still finds the card', async () => {
        await page.locator('#searchInput').fill('temperence');
        const names = await page.locator('.card-grid [data-card] h2').allTextContents();
        assert.ok(names.some(n => /Temperance/.test(n)), names.join(' | '));
      });
      await check('G1 clear button restores all cards and is labelled', async () => {
        assert.equal(await page.locator('#clearSearch').getAttribute('aria-label'), 'Clear search');
        await tap(page.locator('#clearSearch'));
        assert.equal(await page.inputValue('#searchInput'), '');
        assert.equal(await tileCount(page), 78);
      });
      await check('G1 element chip filters and reports its pressed state', async () => {
        const water = await page.evaluate(() => cards.filter(c => c.element === 'Water').length);
        await tap(page.locator('[data-element="Water"]'));
        assert.equal(await tileCount(page), water);
        assert.ok(water > 0 && water < 78);
        assert.equal(await page.locator('[data-element="Water"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('[data-element="All"]').getAttribute('aria-pressed'), 'false');
      });
      await check('G1 search and filter combine', async () => {
        await page.locator('#searchInput').fill('cups');
        const ids = await page.locator('.card-grid [data-card]').evaluateAll(els => els.map(e => Number(e.dataset.card)));
        assert.ok(ids.length > 0);
        assert.ok(await page.evaluate(list => list.every(id => cards.find(c => c.id === id).element === 'Water'), ids));
      });
      await check('G1 search + filter survive card detail and both kinds of Back', async () => {
        await tap(page.locator('.card-grid [data-card]').first());
        assert.equal(await view(page), 'detail');
        await tap(page.locator('#backBtn'));
        assert.equal(await view(page), 'learn');
        assert.equal(await page.inputValue('#searchInput'), 'cups');
        assert.equal(await page.locator('[data-element="Water"]').getAttribute('aria-pressed'), 'true');
        await tap(page.locator('.card-grid [data-card]').first());
        await back(page);
        assert.equal(await view(page), 'learn');
        assert.equal(await page.inputValue('#searchInput'), 'cups');
      });
      await check('G1 no-match shows an empty state whose Reset restores the deck', async () => {
        await page.locator('#searchInput').fill('zzqqxx');
        assert.equal(await tileCount(page), 0);
        await page.locator('.empty h3').waitFor();
        await tap(page.locator('#resetFilters'));
        assert.equal(await tileCount(page), 78);
        assert.equal(await page.inputValue('#searchInput'), '');
        assert.equal(await page.locator('[data-element="All"]').getAttribute('aria-pressed'), 'true');
      });

      // ---------- G2 Card detail ----------
      const cardId = await page.evaluate(() => cards.find(c => c.name === 'Temperance').id);
      await page.evaluate(id => openCard(id, 'learn'), cardId);
      await check('G2 bookmark toggles, announces state and persists', async () => {
        assert.equal(await page.locator('#bookmarkBtn').getAttribute('aria-pressed'), 'false');
        await tap(page.locator('#bookmarkBtn'));
        assert.equal(await page.locator('#bookmarkBtn').getAttribute('aria-pressed'), 'true');
        assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('resonate-bookmarks'))), [cardId]);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'bookmarkBtn', 'focus stays on the bookmark after re-render');
      });
      await check('G2 bookmarked card appears in the Journal after reload', async () => {
        await page.reload();
        await page.evaluate(() => go('saved'));
        const ids = await page.locator('[data-card]').evaluateAll(els => els.map(e => Number(e.dataset.card)));
        assert.ok(ids.includes(cardId), JSON.stringify(ids));
      });
      await check('G2 Upright/Reversed tabs swap meaning, keywords and selected state', async () => {
        await page.evaluate(id => openCard(id, 'learn'), cardId);
        const card = await page.evaluate(id => { const c = cards.find(x => x.id === id); return { up: c.upright, rev: c.reversed, upK: c.uprightKeywords[0], revK: c.reversedKeywords[0] }; }, cardId);
        assert.equal((await page.locator('.meaning-copy').textContent()).trim(), card.up);
        assert.equal(await page.locator('#uprightTab').getAttribute('aria-selected'), 'true');
        await tap(page.locator('#reversedTab'));
        assert.equal((await page.locator('.meaning-copy').textContent()).trim(), card.rev);
        assert.equal(await page.locator('.keyword-row.large span').first().textContent(), card.revK);
        assert.equal(await page.locator('#reversedTab').getAttribute('aria-selected'), 'true');
        assert.equal(await page.locator('#uprightTab').getAttribute('aria-selected'), 'false');
        await tap(page.locator('#uprightTab'));
        assert.equal((await page.locator('.meaning-copy').textContent()).trim(), card.up);
      });
      await check('G2 unbookmark removes it again', async () => {
        await tap(page.locator('#bookmarkBtn'));
        assert.equal(await page.locator('#bookmarkBtn').getAttribute('aria-pressed'), 'false');
        assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('resonate-bookmarks'))), []);
      });

      // ---------- G3 Reading cards + astrology expander ----------
      await page.evaluate(() => go('reading'));
      await page.locator('.astro-full-birth summary').waitFor();
      await tap(page.getByRole('button', { name: 'Calculate my sky', exact: true }));
      await page.waitForTimeout(300);
      await drawSpread(page, 'three');
      await check('G3 every reading card opens its own card and position, then returns', async () => {
        const drawn = await page.evaluate(() => [...state.drawnCardIds]);
        assert.equal(drawn.length, 3);
        for (let i = 0; i < drawn.length; i++) {
          await tap(page.locator('.reading-card').nth(i));
          assert.equal(await view(page), 'detail');
          assert.deepEqual(await page.evaluate(() => [state.cardId, state.readingIndex]), [drawn[i], i]);
          assert.match(await page.locator('.reading-role').first().textContent(), new RegExp(`Position ${i + 1} of 3`));
          await tap(page.locator('#backBtn'));
          assert.equal(await view(page), 'draw');
          assert.deepEqual(await page.evaluate(() => [...state.drawnCardIds]), drawn);
        }
      });
      await check('G3 astrology snapshot expander opens, closes and is keyboard reachable', async () => {
        const details = page.locator('.astro-reading-summary details');
        assert.equal(await details.count(), 1);
        assert.equal(await details.evaluate(d => d.open), false);
        await tap(details.locator('summary'));
        assert.equal(await details.evaluate(d => d.open), true);
        assert.ok((await details.textContent()).trim().length > 40);
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await details.evaluate(d => d.open), false);
      });

      // ---------- G4 Journal edited reflection ----------
      await check('G4 save reading, edit reflection in Journal, unsaved notice, save, reload', async () => {
        await tap(page.locator('#saveReadingJournal'));
        await page.evaluate(() => go('saved'));
        const field = page.locator('[data-journal-reflection]').first();
        const id = await field.getAttribute('data-journal-reflection');
        await field.fill('Edited reflection — coverage test');
        assert.match(await page.locator('#status-' + id).textContent(), /Unsaved changes/);
        await tap(page.locator(`[data-save-journal-reflection="${id}"]`));
        assert.match(await page.locator(`[data-save-journal-reflection="${id}"]`).textContent(), /Saved/);
        await page.reload();
        await page.evaluate(() => go('saved'));
        assert.equal(await page.inputValue(`#journal-${id}`), 'Edited reflection — coverage test');
      });

      await check('no page errors', async () => assert.deepEqual(errors, []));
      await ctx.close();
    }

    // ---------- G5 Shuffle parity (normal motion) ----------
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(BASE);
    for (const spread of ['guidance', 'three', 'relationship', 'seven', 'celtic']) {
      try {
        await page.evaluate(() => go('reading'));
        await page.locator(`[data-spread="${spread}"]`).click();
        await page.locator('#shuffleCardsBtn').click();
        await page.waitForSelector('.stage-board.is-shuffling', { timeout: 3000 });
        const anims = await page.locator('.stage-board.is-shuffling .stage-card').evaluateAll(els => els.map(e => { const s = getComputedStyle(e); return `${s.animationName}/${s.animationDuration}/${s.animationDelay}`; }));
        const unique = [...new Set(anims)];
        assert.deepEqual(unique, ['tarot-shuffle-contained/0.86s/0s'], `${spread}: ${unique.join(', ')}`);
        assert.equal(await page.locator('#shuffleCardsBtn').isDisabled(), true, 'shuffle button locks while shuffling');
        await page.waitForSelector('.stage-board:not(.is-shuffling)', { timeout: 3000 });
        assert.equal(await page.locator('#shuffleCardsBtn').isDisabled(), false, 'shuffle button unlocks afterwards');
        assert.match(await page.locator('#shuffleStatus').textContent(), /Deck shuffled/);
        await page.locator('#stageDrawBtn').click();
        await page.waitForFunction(() => state.drawSettled === true, null, { timeout: 20000 });
        passed++;
      } catch (e) { failures.push(`G5 shuffle ${spread}: ${e.message.replace(/\s+/g, ' ').slice(0, 260)}`); }
    }
    await ctx.close();
  } finally { await browser.close(); server.close(); }
  if (failures.length) { console.error(failures.join('\n')); console.error(`FAIL ${failures.length}, PASS ${passed}`); process.exit(1); }
  console.log(`PASS ${passed} coverage-gap checks: Learn search/filter, card detail bookmark/tabs, reading cards, astrology expander, Journal reflection, shuffle parity`);
})();
