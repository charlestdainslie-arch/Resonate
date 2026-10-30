// Saturday 31 Oct foundation review: tap-only journey walkthrough of the candidate build.
// Every step is a real tap/click on a visible control, starting from the landing page (no go()/state shortcuts).
// Usage: node walk.cjs <app root> <out dir>
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]);
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => { let r = decodeURIComponent(req.url.split('?')[0]); if (r === '/') r = '/index.html'; const f = path.join(ROOT, r); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
const WIDTHS = [[360, 740], [390, 844], [768, 1024], [1180, 820], [1280, 800], [1920, 1080]];
const SPREADS = [['guidance', 1], ['three', 3], ['relationship', 5], ['seven', 7], ['celtic', 10]];
const KNOWN_CONSOLE = /<path> attribute d: Expected number/; // pre-existing SVG icon path error, also on production index

server.listen(0, '127.0.0.1', async () => {
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const rows = [];
  const record = (w, journey, step, result, note = '') => { rows.push({ w, journey, step, result, note }); if (result !== 'PASS') console.log(`${result} ${w}px ${journey} :: ${step} ${note}`); };

  for (const [w, h] of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: w < 800, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [], consoleErr = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !KNOWN_CONSOLE.test(m.text())) consoleErr.push(m.text().slice(0, 140)); });
    const tap = sel => page.locator(sel).first().click();
    const view = () => page.evaluate(() => state.view);
    const overflow = () => page.evaluate(() => document.scrollingElement.scrollWidth > innerWidth + 1);
    const step = async (journey, name, fn) => {
      const e0 = errors.length, c0 = consoleErr.length;
      try {
        const note = await fn();
        if (errors.length > e0) record(w, journey, name, 'FAIL', 'page error: ' + errors.slice(e0).join(' | '));
        else if (consoleErr.length > c0) record(w, journey, name, 'FAIL', 'console error: ' + consoleErr.slice(c0).join(' | '));
        else record(w, journey, name, 'PASS', note || '');
        return true;
      } catch (e) { record(w, journey, name, 'FAIL', e.message.split('\n')[0].slice(0, 200)); return false; }
    };
    const must = (cond, msg) => { if (!cond) throw new Error(msg); };
    const shot = name => page.screenshot({ path: path.join(OUT, `${w}-${name}.png`), fullPage: false });

    // Fresh storage per width.
    await page.goto(BASE); await page.evaluate(() => { try { localStorage.clear(); } catch {} }); await page.reload();
    await page.waitForTimeout(600);

    await step('Landing', 'loads, no sideways scroll, both main buttons visible', async () => {
      must(await view() === 'home', 'not on home');
      must(!(await overflow()), 'horizontal scroll');
      for (const t of ['Get a Reading', 'Learn the Cards']) must(await page.getByRole('button', { name: t, exact: true }).first().isVisible(), t + ' not visible');
      await shot('landing');
    });

    await step('Learn', 'Learn the Cards → 78 cards listed, no sideways scroll', async () => {
      await page.getByRole('button', { name: 'Learn the Cards', exact: true }).first().click();
      await page.waitForTimeout(500);
      must(await view() === 'learn', 'not on learn');
      const n = await page.locator('[data-card]').count();
      must(n === 78, `${n} cards listed`);
      must(!(await overflow()), 'horizontal scroll');
      return `${n} cards`;
    });
    await step('Learn', 'open a card → detail with artwork; Back returns to Learn', async () => {
      await page.locator('[data-card]').nth(13).click();
      await page.waitForTimeout(500);
      must(await view() === 'detail', 'not on detail');
      must(await page.locator('.detail-card-image img').evaluate(i => i.complete && i.naturalWidth > 0), 'artwork not loaded');
      must(!(await overflow()), 'horizontal scroll on detail');
      await shot('card-detail');
      await tap('#backBtn'); await page.waitForTimeout(400);
      must(await view() === 'learn', 'Back did not return to Learn, got ' + await view());
    });
    await step('Learn', 'browser Back from Learn reaches Home', async () => {
      await page.goBack(); await page.waitForTimeout(500);
      const v = await view();
      if (v !== 'home') { await page.goBack(); await page.waitForTimeout(500); }
      must(await view() === 'home', 'browser Back ended on ' + await view());
    });

    for (const [spread, n] of SPREADS) {
      const J = `Reading ${spread}`;
      let drawn = null;
      const ok = await step(J, 'Home → Get a Reading → spread → Shuffle → Draw: all cards turn, artwork loads', async () => {
        await page.goto(BASE); await page.waitForTimeout(400);
        await page.getByRole('button', { name: 'Get a Reading', exact: true }).first().click(); await page.waitForTimeout(400);
        must(await view() === 'reading', 'not on spread chooser');
        await tap(`[data-spread="${spread}"]`); await page.waitForTimeout(400);
        must(await view() === 'stage', 'not on stage');
        must(!(await overflow()), 'horizontal scroll on stage');
        await tap('#shuffleCardsBtn');
        await page.waitForFunction(() => !document.querySelector('#stageDrawBtn')?.disabled, null, { timeout: 15000 });
        await tap('#stageDrawBtn');
        await page.waitForFunction(() => state.view === 'draw' && state.drawSettled === true, null, { timeout: 30000 });
        await page.waitForTimeout(900);
        drawn = await page.evaluate(() => [...state.drawnCardIds]);
        must(drawn.length === n, `${drawn.length} cards drawn`);
        must(new Set(drawn).size === n, 'repeated card in one draw');
        const turned = await page.locator('.reading-card.revealed').count();
        must(turned === n, `${turned}/${n} turned`);
        const imgs = await page.locator('.reading-card-front img').evaluateAll(a => a.filter(i => i.complete && i.naturalWidth > 0).length);
        must(imgs === n, `${imgs}/${n} images loaded`);
        must(!(await overflow()), 'horizontal scroll on reading');
        await shot(`${spread}-drawn`);
        return `${n} unique cards`;
      });
      if (!ok) continue;
      await step(J, 'Draw First Clarifier → Draw Second Clarifier: one per position each, artwork loads', async () => {
        await tap('#primaryClarifierAction');
        await page.waitForFunction(() => state.firstLayerClarifiers?.length > 0, null, { timeout: 10000 });
        await page.waitForTimeout(600);
        await tap('#primaryClarifierAction');
        await page.waitForFunction(() => state.additionalClarifierLayers?.length > 0, null, { timeout: 10000 });
        await page.waitForTimeout(1200);
        const c = await page.evaluate(() => ({ l1: state.firstLayerClarifiers.length, l2: state.additionalClarifierLayers[0].cards.length, all: [...state.drawnCardIds, ...state.firstLayerClarifiers, ...state.additionalClarifierLayers[0].cards] }));
        must(c.l1 === n && c.l2 === n, `layers ${c.l1}/${c.l2}`);
        must(new Set(c.all).size === c.all.length, 'a card appears twice across cards and clarifiers');
        const imgs = await page.locator('.position-clarifier img').evaluateAll(a => a.filter(i => i.complete && i.naturalWidth > 0).length);
        must(imgs === 2 * n, `${imgs}/${2 * n} clarifier images`);
        must(await page.locator('#primaryClarifierAction').count() === 0 || !(await page.locator('#primaryClarifierAction').isVisible()), 'a third clarifier is offered');
        must(!(await overflow()), 'horizontal scroll');
        await shot(`${spread}-clarifiers`);
        return `${n}+${n} clarifiers, all unique`;
      });
      await step(J, 'Explore a card → detail → Back returns to this reading', async () => {
        await tap('[data-reading-detail]'); await page.waitForTimeout(500);
        must(await view() === 'detail', 'not on detail');
        await tap('#backBtn'); await page.waitForTimeout(500);
        must(await view() === 'draw', 'Back went to ' + await view());
        must(JSON.stringify(await page.evaluate(() => state.drawnCardIds)) === JSON.stringify(drawn), 'reading changed after Back');
      });
      let pdfBytes = 0;
      await step(J, 'Download Reading PDF: a real PDF naming the drawn cards', async () => {
        const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), tap('#downloadReading')]);
        const file = path.join(OUT, `${w}-${spread}.pdf`); await dl.saveAs(file);
        const buf = fs.readFileSync(file); pdfBytes = buf.length;
        must(buf.slice(0, 4).toString() === '%PDF', 'not a PDF');
        let text = '';
        try { text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' }); } catch { return `${Math.round(pdfBytes / 1024)} KB (text not checked: no pdftotext)`; }
        const names = await page.evaluate(ids => ids.map(id => cards.find(c => c.id === id).name), drawn);
        const flat = text.replace(/\s+/g, ' ');
        const missing = names.filter(nm => !flat.includes(nm));
        must(missing.length === 0, 'PDF missing ' + missing.join(', '));
        return `${Math.round(pdfBytes / 1024)} KB, all ${n} card names present`;
      });
      await step(J, 'Save Reading to Journal → confirmed saved', async () => {
        await tap('#saveReadingJournal'); await page.waitForTimeout(700);
        const status = (await page.locator('#primaryJournalSaveStatus, #journalSaveStatus').allInnerTexts()).join(' ');
        must(/saved/i.test(status), 'no saved confirmation: ' + status.slice(0, 80));
        return status.trim().slice(0, 60);
      });
      await step(J, 'Journal → reopen → same cards and both clarifier layers', async () => {
        await tap('#openJournal'); await page.waitForTimeout(600);
        must(await view() === 'saved', 'not on Journal');
        must(!(await overflow()), 'horizontal scroll on Journal');
        await tap('[data-open-reading]'); await page.waitForTimeout(900);
        must(await view() === 'draw', 'reopen went to ' + await view());
        const r = await page.evaluate(() => ({ ids: state.drawnCardIds, l1: state.firstLayerClarifiers?.length || 0, l2: state.additionalClarifierLayers?.[0]?.cards?.length || 0 }));
        must(JSON.stringify(r.ids) === JSON.stringify(drawn), 'different cards after reopen');
        must(r.l1 === n && r.l2 === n, `clarifiers after reopen ${r.l1}/${r.l2}`);
        must(await page.locator('.reading-card.revealed').count() === n, 'cards not shown face up after reopen');
      });
      await step(J, 'end of page: Back to top, then Home', async () => {
        await tap('[data-page-end="0"]'); await page.waitForTimeout(500);
        must(await page.locator('.spread-scroll').evaluate(e => e.getBoundingClientRect().top < innerHeight), 'spread not in view');
        await page.locator('[data-page-end]').filter({ hasText: 'Home' }).first().click(); await page.waitForTimeout(400);
        must(await view() === 'home', 'Home went to ' + await view());
      });
    }

    await step('Journal', 'Journal lists all five saved readings; Home from Journal', async () => {
      await page.getByRole('button', { name: /Your Personal Journal/ }).first().click(); await page.waitForTimeout(600);
      must(await view() === 'saved', 'not on Journal');
      const k = await page.locator('[data-open-reading]').count();
      must(k >= 5, `${k} readings listed`);
      await page.locator('[data-page-end]').filter({ hasText: 'Home' }).first().click(); await page.waitForTimeout(400);
      must(await view() === 'home', 'not home');
      return `${k} readings`;
    });
    await step('Browser Back', 'after a reading, browser Back steps back through screens without a blank or broken page', async () => {
      await page.getByRole('button', { name: 'Get a Reading', exact: true }).first().click(); await page.waitForTimeout(300);
      await tap('[data-spread="guidance"]'); await page.waitForTimeout(300);
      const seen = [];
      for (let i = 0; i < 3; i++) { await page.goBack(); await page.waitForTimeout(500); seen.push(await view().catch(() => 'gone')); }
      must(seen.every(v => v && v !== 'gone'), 'page left the app: ' + seen.join(' → '));
      must(await page.locator('#app').evaluate(a => a.innerText.trim().length > 50), 'blank page');
      return seen.join(' → ');
    });
    await ctx.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(rows, null, 1));
  const pass = rows.filter(r => r.result === 'PASS').length;
  console.log(`\n${pass}/${rows.length} steps PASS across ${WIDTHS.length} widths`);
});
