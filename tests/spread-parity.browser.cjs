// Spread parity matrix (Playwright): every applicable one-card fix, checked in every spread.
// Si Aye's 28 Oct acceptance comment on PR #26 lists the checks; IDs below (P1–P14) follow that list.
// Each check runs per spread at every viewport. A spread PASSes a check only if it passes at every viewport.
// Writes test-results/spread-parity.json and one board screenshot per spread and viewport.
// Run with: node tests/spread-parity.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.UAT_OUTPUT_DIR || path.join(root, 'test-results'));
fs.mkdirSync(out, { recursive: true });
const port = 8774;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
// PARITY_BASE_URL runs the same checks against a deployed preview instead of the local working tree.
const BASE = process.env.PARITY_BASE_URL || ['http:', '', '127.0.0.1:' + port, ''].join('/');

const SPREADS = ['guidance', 'three', 'relationship', 'seven', 'celtic'];
const CHECKS = {
  P1: 'Correct card count, unique identities and spread placement',
  P2: 'Position labels readable: no mid-word breaks, ≥12px, on screen',
  P3: 'Card and clarifier sizing consistent; artwork uncropped; captions on one line and unclipped; no overlap',
  P4: 'Shuffle → Draw works with normal and reduced motion',
  P5: 'Clarifiers stop at two per position; third is not offered',
  P6: 'Upright/Reversed meanings reachable from every position (card detail)',
  P7: 'Numerology, element and astrology metadata on every original and clarifier',
  P8: 'Headings and primary/secondary button styling match the one-card reading',
  P9: 'Card detail returns to the same spread, cards, clarifiers and scroll point',
  P10: 'Phone/browser Back and menu return paths',
  P11: 'Journal save and reopen keeps spread, cards and both clarifiers; returns to Journal (D8)',
  P12: 'PDF contains every position, both clarifiers and the Golden Thread',
  P13: 'Mobile fit: no horizontal page scroll on the table or the reading',
  P14: 'Menu button does not cover the spread (D5)',
  C1: 'Every position has its own interpretation, clarifier narrative and lenses (no empty sections)',
};

const configs = [
  ['360', { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['390', { ...devices['Pixel 7'] }],
  ['768', { viewport: { width: 768, height: 1024 } }],
  ['1180', { viewport: { width: 1180, height: 820 } }],
  ['1280', { viewport: { width: 1280, height: 900 } }],
  ['1440', { viewport: { width: 1440, height: 900 } }],
  ['1920', { viewport: { width: 1920, height: 1080 } }],
];

// One result cell per spread × check; notes keep the failing viewport and reason.
const matrix = Object.fromEntries(SPREADS.map(s => [s, Object.fromEntries(Object.keys(CHECKS).map(c => [c, { pass: [], fail: [] }]))]));

const intersects = (a, b, slack = 1) => !(a.right <= b.left + slack || b.right <= a.left + slack || a.bottom <= b.top + slack || b.bottom <= a.top + slack);

async function boardGeometry(page) {
  return page.evaluate(() => {
    const box = e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY, width: r.width, height: r.height }; };
    // A whitespace-delimited word that renders on more than one line has been broken mid-word.
    const brokenWords = el => {
      const found = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const re = /\S+/g; let m;
        while ((m = re.exec(node.data))) {
          const range = document.createRange(); range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
          const tops = new Set([...range.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top)));
          if (tops.size > 1) found.push(m[0]);
        }
      }
      return found;
    };
    const lines = el => { const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3; return Math.round(el.getBoundingClientRect().height / lh); };
    const positions = [...document.querySelectorAll('.spread-board .reading-position')].map(p => {
      const label = p.querySelector('.slot-label'), front = p.querySelector('.reading-card-front'), title = p.querySelector('.reading-card-front strong');
      const clarifiers = [...p.querySelectorAll('.position-clarifier')].map(c => ({
        img: box(c.querySelector('img')), fit: getComputedStyle(c.querySelector('img')).objectFit,
        layer: c.querySelector('.clarifier-layer-label'), title: c.querySelector('strong'),
      }));
      const parts = [label, front, title, ...p.querySelectorAll('.position-clarifier img, .position-clarifier .clarifier-layer-label, .position-clarifier strong')].filter(Boolean);
      const union = parts.map(box).reduce((u, b) => ({ left: Math.min(u.left, b.left), right: Math.max(u.right, b.right), top: Math.min(u.top, b.top), bottom: Math.max(u.bottom, b.bottom) }));
      return {
        label: label.textContent.replace(/\u00a0/g, ' '), labelSize: parseFloat(getComputedStyle(label).fontSize), labelBox: box(label), labelBroken: brokenWords(label),
        front: box(front), frontFit: getComputedStyle(front.querySelector('img')).objectFit, titleBox: box(title), titleBroken: brokenWords(title),
        originalCaption: getComputedStyle(front, '::after').content,
        clarifiers: clarifiers.map(c => ({ img: c.img, fit: c.fit, layerText: c.layer.textContent, layerLines: lines(c.layer), layerClipped: c.layer.scrollWidth > c.layer.clientWidth + 1, titleBox: box(c.title), titleBroken: brokenWords(c.title) })),
        union,
      };
    });
    const menu = document.getElementById('menuBtn');
    return { positions, vw: innerWidth, scrollWidth: document.documentElement.scrollWidth, menu: menu ? box(menu) : null, menuFixed: menu ? getComputedStyle(menu.closest('.brand-header')).position : null };
  });
}

async function chooseSpread(page, spread) {
  await page.evaluate(() => go('reading'));
  await page.locator(`[data-spread="${spread}"]`).click();
  await page.waitForSelector('#stageDrawBtn');
}
async function drawSettled(page) {
  await page.locator('#stageDrawBtn').click();
  await page.waitForFunction(() => state.drawSettled === true, null, { timeout: 15000 });
}
const readingState = page => page.evaluate(() => JSON.stringify({ spread: state.spreadId, ids: state.drawnCardIds, c1: state.firstLayerClarifiers, layers: state.additionalClarifierLayers, at: state.drawnAt }));

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const started = new Date().toISOString();
  let reference = null; // one-card computed styles at each viewport (P8)
  try {
    for (const motion of ['reduce', 'no-preference']) {
      for (const [vp, options] of configs) {
        if (motion === 'no-preference' && !['390', '1280'].includes(vp)) continue; // normal motion: shuffle/draw only
        const ctx = await browser.newContext({ ...options, reducedMotion: motion, acceptDownloads: true });
        const page = await ctx.newPage();
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(BASE);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        const tap = loc => options.hasTouch ? loc.tap() : loc.click();
        for (const spread of SPREADS) {
          const where = `${vp}px ${motion === 'reduce' ? 'reduced' : 'normal'} motion`;
          const check = async (id, fn) => {
            try { await fn(); matrix[spread][id].pass.push(where); }
            catch (e) { matrix[spread][id].fail.push(`${where}: ${e.message.replace(/\s+/g, ' ').slice(0, 300)}`); }
          };
          const expected = await page.evaluate(s => spreads[s].positions.map(p => p[0]), spread);

          // ---------- P4 Shuffle → Draw ----------
          await chooseSpread(page, spread);
          await check('P4', async () => {
            await page.locator('#shuffleCardsBtn').click();
            const anim = await page.evaluate(() => { const c = document.querySelector('.stage-board.is-shuffling .stage-card'); if (!c) return null; const s = getComputedStyle(c); return [s.animationName, s.animationDuration, s.animationDelay].join(' / '); });
            // Reduced motion: no shuffle movement (no animation, or one that lasts 0s).
            if (motion === 'reduce') assert.ok(anim === null || /^none/.test(anim) || / \/ 0s \/ /.test(anim), 'reduced motion still animates: ' + anim);
            else assert.equal(anim, 'tarot-shuffle-contained / 0.86s / 0s');
            await page.waitForFunction(() => !document.getElementById('shuffleCardsBtn').disabled, null, { timeout: 5000 });
            assert.match(await page.locator('#shuffleStatus').innerText(), /Deck shuffled/);
            const t0 = Date.now(); await drawSettled(page);
            if (motion === 'reduce') assert.ok(Date.now() - t0 < 2500, 'reduced-motion draw took ' + (Date.now() - t0) + 'ms');
            assert.equal(await page.locator('.reading-card.revealed').count(), expected.length);
          });
          if (motion === 'no-preference') { await page.evaluate(() => go('reading')); continue; }
          if (await page.evaluate(() => state.view) !== 'draw' || !(await page.evaluate(() => state.drawSettled))) {
            await page.waitForFunction(() => !document.getElementById('shuffleCardsBtn')?.disabled, null, { timeout: 5000 }).catch(() => {});
            await drawSettled(page);
          }

          // ---------- clarifiers ----------
          await page.locator('#primaryClarifierAction').click();
          await page.locator('#primaryClarifierAction').click();
          await page.waitForFunction(() => [...document.querySelectorAll('.reading-card-front img,.position-clarifier img')].every(e => e.complete && e.naturalWidth > 0), null, { timeout: 15000 });

          await check('P5', async () => {
            assert.equal(await page.locator('#primaryClarifierAction').count(), 0, 'a third clarifier action is still offered');
            await page.evaluate(() => drawNextClarifierLayer()); // a stray call must not add a third layer
            assert.equal(await page.evaluate(() => 1 + state.additionalClarifierLayers.length), 2);
            assert.equal(await page.locator('.position-clarifier').count(), expected.length * 2);
            assert.match(await page.locator('.reading-next-step .reading-help').innerText(), /two clarifiers are complete/i);
          });

          const geo = await boardGeometry(page);
          await page.locator('.spread-board').screenshot({ path: path.join(out, `parity-${spread}-${vp}.png`) });

          await check('P1', async () => {
            assert.deepEqual(geo.positions.map(p => p.label.replace(/^\d+ · /, '')), expected, 'labels or order differ');
            assert.ok(geo.positions.every((p, i) => p.label.startsWith(String(i + 1).padStart(2, '0') + ' · ')), 'numbering');
            const ids = await page.evaluate(() => [...state.drawnCardIds, ...state.firstLayerClarifiers, ...state.additionalClarifierLayers.flatMap(l => l.cards)]);
            assert.equal(ids.length, expected.length * 3); assert.equal(new Set(ids).size, ids.length, 'repeated card identity in one reading');
            const P = geo.positions;
            if (geo.vw >= 1200 && spread === 'seven') { // V shape (from 1200px): tops descend to position 4 then rise
              const t = P.map(p => p.front.top);
              assert.ok(t[0] < t[1] && t[1] < t[2] && t[2] < t[3] && t[3] > t[4] && t[4] > t[5] && t[5] > t[6], 'V shape lost: ' + t.map(Math.round));
            }
            if (geo.vw > 1100 && spread === 'celtic') { // cross + staff
              assert.ok(Math.abs(P[0].front.top - P[1].front.top) < 2 && P[1].front.left > P[0].front.left, 'crossing card beside the present');
              assert.ok(P[4].front.top < P[0].front.top && P[2].front.top > P[0].front.top, 'above/below');
              assert.ok(P[3].front.left < P[0].front.left && P[5].front.left > P[1].front.left, 'past left, future right');
              assert.ok(P[9].front.top < P[8].front.top && P[8].front.top < P[7].front.top && P[7].front.top < P[6].front.top, 'staff order');
            }
            if (geo.vw > 1100 && spread === 'relationship') {
              assert.ok(P[2].front.left > P[0].front.left && P[2].front.left < P[1].front.left, 'connection sits between the two people');
            }
          });

          await check('P2', async () => {
            for (const p of geo.positions) {
              assert.deepEqual(p.labelBroken, [], `"${p.label}" breaks mid-word`);
              assert.ok(p.labelSize >= 12, `"${p.label}" is ${p.labelSize}px`);
              assert.ok(p.labelBox.left >= -1 && p.labelBox.right <= geo.vw + 1, `"${p.label}" off screen`);
            }
          });

          await check('P3', async () => {
            const P = geo.positions;
            const w0 = P[0].front.width, h0 = P[0].front.height;
            for (const p of P) {
              assert.ok(Math.abs(p.front.width - w0) < 1.5 && Math.abs(p.front.height - h0) < 1.5, 'original card sizes differ');
              assert.ok(Math.abs(p.front.height / p.front.width - 1.5) < 0.04, 'original card is not 2:3');
              assert.equal(p.frontFit, 'contain');
              assert.ok(p.front.left >= -1 && p.front.right <= geo.vw + 1, 'original card off screen');
              assert.match(p.originalCaption, /ORIGINAL CARD/, `${p.label}: original card has no "ORIGINAL CARD" caption beside its clarifiers`);
              assert.deepEqual(p.titleBroken, [], `${p.label}: card title breaks mid-word`);
              const cw = p.clarifiers[0].img.width;
              for (const c of p.clarifiers) {
                assert.equal(c.fit, 'contain');
                assert.ok(Math.abs(c.img.width - cw) < 1.5, 'clarifier sizes differ');
                assert.ok(c.img.width >= 70, `${p.label}: clarifier art only ${Math.round(c.img.width)}px wide`);
                assert.ok(c.img.left >= -1 && c.img.right <= geo.vw + 1, 'clarifier off screen');
                assert.equal(c.layerLines, 1, `${p.label}: "${c.layerText}" wraps`);
                assert.ok(!c.layerClipped, `${p.label}: "${c.layerText}" is clipped`);
                assert.deepEqual(c.titleBroken, [], `${p.label}: clarifier title breaks mid-word`);
              }
            }
            for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++)
              assert.ok(!intersects(P[i].union, P[j].union), `"${P[i].label}" overlaps "${P[j].label}"`);
          });

          await check('P13', async () => { assert.ok(geo.scrollWidth <= geo.vw + 1, `page is ${geo.scrollWidth}px wide in a ${geo.vw}px viewport`); });

          await check('P14', async () => {
            if (!geo.menu) return;
            if (!['fixed', 'sticky'].includes(geo.menuFixed)) return; // scrolls away with the header; cannot cover the board
            for (const p of geo.positions) assert.ok(!intersects(geo.menu, p.union), 'menu covers ' + p.label);
          });

          await check('P7', async () => {
            const info = await page.evaluate(() => [...document.querySelectorAll('.reading-meaning')].map(m => ({
              corr: m.querySelectorAll('.reading-card-correspondences').length,
              text: [...m.querySelectorAll('.reading-card-correspondences')].map(e => e.textContent),
              sky: m.querySelector('.reading-astrology')?.textContent || '',
            })));
            assert.equal(info.length, expected.length);
            for (const m of info) {
              assert.equal(m.corr, 3, 'original + two clarifiers each need correspondences');
              assert.ok(m.text.every(t => /Astrology:/.test(t) && /(Number|Court rank):/.test(t) && /(Air|Water|Earth|Fire)/.test(t)), 'missing astrology/number/element');
              assert.match(m.sky, /SKY AT THIS READING/);
            }
            assert.equal(await page.locator('.reading-number-thread').count(), 1, 'numerology thread');
            assert.equal(await page.locator('.astro-reading-summary').count(), 1, 'astrology snapshot');
          });

          await check('C1', async () => {
            const per = await page.evaluate(() => [...document.querySelectorAll('.reading-meaning')].map(m => ({
              context: m.querySelector('.position-context')?.textContent.trim().length || 0,
              meaning: m.querySelector('.original-card-explanation > p:not(.original-position-label):not(.position-context)')?.textContent.trim().length || 0,
              clarifiers: m.querySelectorAll('.integrated-clarifier').length, together: m.querySelectorAll('.combined-meaning').length,
              lenses: m.querySelectorAll('.reading-card-lenses').length,
            })));
            per.forEach((m, i) => {
              assert.ok(m.context > 40 && m.meaning > 40, `position ${i + 1} has an empty interpretation`);
              assert.equal(m.clarifiers, 2, `position ${i + 1} clarifier narrative`); assert.equal(m.together, 1); assert.equal(m.lenses, 3);
            });
            const thread = await page.locator('.golden-card-reading').count();
            assert.ok(thread >= expected.length, 'Golden Thread misses positions');
          });

          await check('P8', async () => {
            const styles = await page.evaluate(() => {
              const s = sel => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return [c.fontFamily, c.fontSize, c.fontWeight, c.color, c.backgroundImage, c.backgroundColor, c.borderTopColor, c.borderRadius].join('|'); };
              return { h1: s('.draw-stage h1'), h2: s('#readingInterpretation > h2'), eyebrow: s('#readingInterpretation > .eyebrow'), primary: s('#saveReadingJournal'), secondary: s('#drawActions .ghost-button'), slot: s('.slot-label') };
            });
            Object.entries(styles).forEach(([k, v]) => assert.ok(v, k + ' missing'));
            assert.ok(await page.locator('#saveReadingJournal.gold-button').count() === 1, 'primary action not gold');
            assert.ok(await page.locator('#drawActions .ghost-button').count() === 4, 'secondary actions');
            if (spread === 'guidance') reference = { ...(reference || {}), [vp]: styles };
            else for (const k of ['h1', 'h2', 'eyebrow', 'primary', 'secondary']) assert.equal(styles[k], reference[vp][k], `${k} styled differently from one-card`);
            // Position labels: the one-card table uses the larger gold label; others keep a readable gold label in the same face.
            const [face, , weight, colour] = styles.slot.split('|'), [rface, , rweight, rcolour] = reference[vp].slot.split('|');
            assert.deepEqual([face, weight, colour], [rface, rweight, rcolour], 'position label face/weight/colour differ from one-card');
          });

          // ---------- P6 / P9 card detail ----------
          const before = await readingState(page);
          const last = expected.length - 1;
          await page.locator(`.reading-card[data-index="${last}"]`).scrollIntoViewIfNeeded();
          const scrollBefore = await page.evaluate(() => scrollY);
          await check('P6', async () => {
            await tap(page.locator(`.reading-card[data-index="${last}"]`));
            assert.equal(await page.evaluate(() => state.view), 'detail');
            assert.match(await page.locator('.detail-title .reading-role').innerText(), new RegExp(`Position ${last + 1} of ${expected.length}`));
            const up = await page.locator('.meaning-copy').innerText();
            await tap(page.locator('#reversedTab'));
            const down = await page.locator('.meaning-copy').innerText();
            const card = await page.evaluate(() => { const c = cards.find(x => x.id === state.cardId); return { up: c.upright, down: c.reversed }; });
            assert.equal(up, card.up); assert.equal(down, card.down); assert.notEqual(up, down);
            assert.match(await page.locator('.meaning-panel .position-context').innerText(), /reversed/);
            await tap(page.locator('#uprightTab'));
          });
          await check('P9', async () => {
            if (await page.evaluate(() => state.view) !== 'detail') await tap(page.locator(`.reading-card[data-index="${last}"]`));
            await tap(page.locator('#nextBtn')); // last position: Next returns to the reading
            assert.equal(await page.evaluate(() => state.view), 'draw');
            assert.equal(await readingState(page), before, 'reading changed after detail return');
            await page.waitForTimeout(100);
            assert.ok(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) < 80, 'scroll point not restored');
            await tap(page.locator('.reading-card[data-index="0"]'));
            await tap(page.locator('#backBtn'));
            assert.equal(await readingState(page), before);
          });
          await check('P10', async () => {
            await tap(page.locator('.reading-card[data-index="0"]'));
            await page.goBack(); await page.waitForTimeout(200);
            assert.equal(await page.evaluate(() => state.view), 'draw', 'phone Back from card detail');
            assert.equal(await readingState(page), before, 'phone Back changed the reading');
            await tap(page.locator('#menuBtn'));
            await tap(page.locator('#menuOverlay [data-go="saved"]'));
            assert.equal(await page.evaluate(() => state.view), 'saved', 'menu → Journal');
            await page.goBack(); await page.waitForTimeout(200);
            assert.equal(await page.evaluate(() => state.view), 'home', 'Journal Back goes home');
          });

          // ---------- P11 Journal ----------
          await check('P11', async () => {
            // Reopen the reading through the app state that was captured before leaving it.
            await page.evaluate(b => { const r = JSON.parse(b); Object.assign(state, { spreadId: r.spread, spreadSize: r.ids.length, drawnCardIds: r.ids, firstLayerClarifiers: r.c1, clarifierReadingAt: r.at, additionalClarifierLayers: r.layers, additionalClarifierReadingAt: r.at, drawnAt: r.at, drawSettled: true, drawPhase: 'settled', journalId: null, journalSpread: null }); go('draw'); }, before);
            await tap(page.locator('#saveReadingJournal'));
            assert.equal(await page.locator('#saveReadingJournal').innerText(), '✓ Saved to Journal');
            await tap(page.locator('#openJournal'));
            const entry = page.locator('.journal-entry').first();
            assert.equal(await entry.locator('h2').innerText(), await page.evaluate(s => spreads[s].name, spread));
            assert.equal(await entry.locator('.journal-card-list > li').count(), expected.length);
            await tap(entry.locator('[data-open-reading]'));
            assert.equal(await readingState(page), before, 'reopened reading differs');
            assert.equal(await page.locator('.position-clarifier').count(), expected.length * 2);
            assert.match(await page.locator('#app .back-link').first().innerText(), /Back to Journal/);
            await tap(page.locator('.reading-card[data-index="0"]'));
            await tap(page.locator('#backBtn'));
            await tap(page.locator('#app .back-link').first());
            assert.equal(await page.evaluate(() => state.view), 'saved', 'D8: reading from Journal returns to Journal');
            await tap(page.locator('[data-open-reading]').first());
          });

          // ---------- P12 PDF ----------
          await check('P12', async () => {
            await page.evaluate(() => { const create = ResonatePDF.create; window.__pdfSections = null; ResonatePDF.create = function (sections) { window.__pdfSections = sections; return create.apply(this, arguments); }; });
            const wait = page.waitForEvent('download');
            await page.locator('#downloadReading').click();
            const dl = await wait; const file = path.join(out, `parity-${spread}-${vp}.pdf`); await dl.saveAs(file);
            assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
            const sections = await page.evaluate(() => window.__pdfSections);
            const names = await page.evaluate(() => [state.drawnCardIds, state.firstLayerClarifiers, state.additionalClarifierLayers[0].cards].map(l => l.map(id => cards.find(c => c.id === id).name)));
            const titles = sections.map(s => s.title), text = sections.map(s => s.text).join('\n');
            expected.forEach((label, i) => {
              assert.ok(titles.some(t => t.startsWith(label + ' · ' + names[0][i])), 'PDF missing position ' + label);
              assert.ok(text.includes('Clarifier 1 · ') && text.includes(names[1][i]) && text.includes(names[2][i]), 'PDF missing clarifiers for ' + label);
            });
            assert.ok(titles.includes('The Golden Thread'));
          });
          await page.evaluate(() => { localStorage.removeItem('resonate-reading-journal-v1'); journalEntries = []; go('reading'); });
        }
        if (errors.length) for (const s of SPREADS) matrix[s].P1.fail.push(`${vp}px page errors: ${errors.join(' | ').slice(0, 200)}`);
        await ctx.close();
      }
    }
  } finally {
    await browser.close(); server.close();
  }
  const target = process.env.PARITY_BASE_URL ? 'deployed preview ' + process.env.PARITY_BASE_URL : 'local working tree';
  const sha = (() => { try { return require('child_process').execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch { return 'unknown'; } })();
  const dirty = (() => { try { return require('child_process').execSync('git status --porcelain', { cwd: root }).toString().trim() !== ''; } catch { return true; } })();
  const result = { started, finished: new Date().toISOString(), target, sha, workingTreeDirty: dirty, viewports: configs.map(c => c[0]), checks: CHECKS, matrix };
  fs.writeFileSync(path.join(out, 'spread-parity.json'), JSON.stringify(result, null, 2));
  let failed = 0;
  console.log(`Target: ${target} · git HEAD ${sha}${dirty ? ' (uncommitted changes)' : ''}`);
  console.log('check  ' + SPREADS.map(s => s.padEnd(13)).join(''));
  for (const id of Object.keys(CHECKS)) {
    console.log(id.padEnd(7) + SPREADS.map(s => { const c = matrix[s][id]; const st = c.fail.length ? 'FAIL' : c.pass.length ? 'PASS' : 'UNTESTED'; if (c.fail.length) failed++; return st.padEnd(13); }).join(''));
  }
  for (const s of SPREADS) for (const id of Object.keys(CHECKS)) for (const f of matrix[s][id].fail) console.log(`  ${s} ${id} ${f}`);
  console.log(failed ? `${failed} spread checks FAILED` : 'All spread parity checks PASS');
  process.exitCode = failed ? 1 : 0;
})();
