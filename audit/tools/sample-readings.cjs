// Generates the three audit sample readings through the app's own UI and code paths.
// Usage: NODE_PATH=<dir containing playwright> node audit/tools/sample-readings.cjs [spreadId seed ...]
//   default: guidance 7  three 11  celtic 3
// For each spread it: loads presenter-uat.html with a seeded Math.random (so the draw is reproducible),
// clicks Draw, follows the clarifier rule exactly as the app's main button does, optionally makes one
// seeker-chosen clarifier, then captures — from that ONE reading state — the written interpretation,
// the Max Chasroom script, the real downloaded PDF, Golden Thread geometry and screenshots.
// Nothing is mocked except Math.random (seeded) and the wall clock (shifted to a fixed start).
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'audit', 'samples');
const START = Date.UTC(2026, 10, 6, 1, 0, 0); // 2026-11-06 12:00 Sydney
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };

const args = process.argv.slice(2);
const plan = [];
for (let i = 0; i < (args.length || 6); i += 2) plan.push({ spread: (args.length ? args : ['guidance', '7', 'three', '11', 'celtic', '3'])[i], seed: Number((args.length ? args : ['guidance', '7', 'three', '11', 'celtic', '3'])[i + 1]) });
const CHOOSE = { three: true, celtic: true }; // also demonstrate one seeker-chosen clarifier on these spreads

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let u = decodeURIComponent((q.url || '/').split('?')[0]); if (u === '/') u = '/presenter-uat.html';
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
      r.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(s));
  });
}

async function pdfText(file) {
  const pdfjs = await import(require('url').pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), disableFontFace: true }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    let last = null, line = '';
    const lines = [];
    for (const it of tc.items) { const y = Math.round(it.transform[5]); if (last !== null && y !== last) { lines.push(line); line = ''; } line += (line && !line.endsWith(' ') && !it.str.startsWith(' ') ? ' ' : '') + it.str; last = y; }
    lines.push(line); pages.push(lines.join('\n'));
  }
  const attachments = await doc.getAttachments();
  return { pages: doc.numPages, text: pages.join('\n\n--- page break ---\n\n'), attachments: attachments ? Object.keys(attachments) : [] };
}

async function settle(page) {
  // Every main card and every drawn clarifier is turned, and no thread flight is pending.
  await page.waitForFunction(() => state.drawSettled === true &&
    !document.querySelector('.gtc-pending') &&
    [...document.querySelectorAll('.reading-card')].every(e => e.classList.contains('revealed')), null, { timeout: 60000 });
  await page.waitForTimeout(1800);
}

async function threadGeometry(page) {
  return page.evaluate(() => {
    const b = document.querySelector('.draw-page .spread-board');
    const svg = b && b.querySelector('svg');
    const base = svg ? svg.getBoundingClientRect() : null;
    const name = el => el ? (el.querySelector('img')?.getAttribute('alt') || '') : '';
    const posEls = [...b.querySelectorAll(':scope > .reading-position')];
    const mainEl = i => posEls[i]?.querySelector('[data-gtc-main-card]');
    const clarEl = (i, s) => posEls[i]?.querySelector(`[data-gtc-clarifier="${s}"]`);
    const describe = key => {
      let m = /^main:(\d+):clarifier:(\d+)$/.exec(key); if (m) return { kind: 'parent→clarifier', from: name(mainEl(+m[1])), to: name(clarEl(+m[1], +m[2])) };
      m = /^main:(\d+):next:(\d+)$/.exec(key);
      if (m) { const i = +m[1]; const cl = [...posEls[i].querySelectorAll('[data-gtc-clarifier]')].filter(e => !e.classList.contains('position-clarifier-slot')).pop();
        return { kind: 'position→next position', from: name(cl || mainEl(i)), from_is_clarifier: !!cl, to: name(mainEl(+m[2])) }; }
      return { kind: 'other' };
    };
    const strands = [...(svg ? svg.querySelectorAll('[data-gtc-key]') : [])].map(g => ({ key: g.getAttribute('data-gtc-key'), ...describe(g.getAttribute('data-gtc-key')),
      from_xy: [+g.getAttribute('data-gtc-from-x'), +g.getAttribute('data-gtc-from-y')], to_xy: [+g.getAttribute('data-gtc-to-x'), +g.getAttribute('data-gtc-to-y')] }));
    // Ring geometry: each loop's box against the card picture it should hug (expected margin is the connector's RING_MARGIN).
    const rings = [...(svg ? svg.querySelectorAll('[data-gtc-ring]') : [])].map(g => {
      const ring = g.getAttribute('data-gtc-ring'); const p = g.querySelector('path'); const bb = p ? p.getBBox() : null;
      let el = null; let m = /^main:(\d+)$/.exec(ring); if (m) el = mainEl(+m[1])?.querySelector('.reading-card-front img');
      m = /clarifier:(\d+):(\d+)$/.exec(ring) || /^(\d+):(\d+)$/.exec(ring); if (!el && m) el = clarEl(+m[1], +m[2])?.querySelector(':scope > img');
      let pic = null; if (el && base) { const r = el.getBoundingClientRect(); pic = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; }
      return { ring, bbox: bb && { x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) }, picture: pic && { x: +pic.x.toFixed(1), y: +pic.y.toFixed(1), w: +pic.w.toFixed(1), h: +pic.h.toFixed(1) },
        margin_px: bb && pic ? { left: +(pic.x - bb.x).toFixed(1), top: +(pic.y - bb.y).toFixed(1), right: +((bb.x + bb.width) - (pic.x + pic.w)).toFixed(1), bottom: +((bb.y + bb.height) - (pic.y + pic.h)).toFixed(1) } : null };
    });
    const st = window.__gtLive && window.__gtLive.readState();
    return { strands, rings, connector_state: st, page_scroll_width: document.documentElement.scrollWidth, viewport: innerWidth };
  });
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch();
  const summary = [];
  for (const { spread, seed } of plan) {
    const dir = path.join(OUT, spread); fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-AU', timezoneId: 'Australia/Sydney', acceptDownloads: true });
    await ctx.addInitScript(([seed, start]) => {
      let s = seed; Math.random = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
      const real = Date, t0 = real.now();
      const now = () => start + (real.now() - t0);
      function D(...a) { return a.length ? new real(...a) : new real(now()); }
      D.prototype = real.prototype; D.now = now; D.UTC = real.UTC; D.parse = real.parse; window.Date = D;
      try { localStorage.clear(); } catch {}
    }, [seed, START]);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${port}/presenter-uat.html`);
    await page.evaluate(() => go('reading'));
    await page.locator(`[data-spread="${spread}"]`).click();
    await page.locator('#stageDrawBtn').click();
    await settle(page);

    // Clarifiers, following the app's own main button (Chas's teaching rule), then one seeker choice.
    const log = [];
    const snap = () => page.evaluate(() => ({ first: [...(state.firstLayerClarifiers || [])], second: [...((state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [])] }));
    for (let guard = 0; guard < 4; guard++) {
      const step = await page.evaluate(() => clarifierNextStep());
      if (step.action === 'save') break;
      const before = await snap();
      await page.locator('#primaryClarifierAction').click();
      await settle(page);
      const after = await snap();
      log.push({ action: step.action === 'first' ? 'rule: Major Arcana base card → Clarifier 1' : 'rule: Clarifier 1 is Major Arcana → Clarifier 2', button: step.label, before, after });
    }
    if (CHOOSE[spread]) {
      const optional = await page.evaluate(() => clarifierPlan().optional);
      if (optional.length) {
        const i = optional[0]; const before = await snap();
        await page.locator(`[data-clarify-position="${i}"]`).click();
        await settle(page);
        log.push({ action: `seeker's choice: "+ Clarify this card" on position ${i + 1}`, before, after: await snap() });
        // The rule then applies to that clarifier: if it is a Major, a second is due.
        const step = await page.evaluate(() => clarifierNextStep());
        if (step.action === 'second') { const b2 = await snap(); await page.locator('#primaryClarifierAction').click(); await settle(page);
          log.push({ action: 'rule: Clarifier 1 is Major Arcana → Clarifier 2', button: step.label, before: b2, after: await snap() }); }
      }
    }

    // The reading record: one source of truth that every artefact below is checked against.
    const record = await page.evaluate(() => {
      const labels = positionLabels();
      const card = id => { const c = cards.find(x => x.id === id); return c ? { id: c.id, name: c.name, arcana: c.arcana, orientation: isReversed(c) ? 'reversed' : 'upright', display: cardName(c) } : null; };
      const second = (state.additionalClarifierLayers || []).find(l => l.number === 2)?.cards || [];
      return { spreadId: state.spreadId, spreadName: readingTitle(), drawnAt: state.drawnAt, reversalsIncluded: reversalsOn(),
        positions: state.drawnCardIds.map((id, i) => ({ position: i + 1, label: labels[i], card: card(id),
          clarifier1: state.firstLayerClarifiers?.[i] != null ? card(state.firstLayerClarifiers[i]) : null,
          clarifier2: second[i] != null ? card(second[i]) : null })),
        ruleCheck: ResonateClarifiers.validate(state.drawnCardIds.map(id => cards.find(c => c.id === id)), state.firstLayerClarifiers, second, id => cards.find(c => c.id === id)) };
    });
    record.seed = seed; record.sequence = log;
    fs.writeFileSync(path.join(dir, 'draw-record.json'), JSON.stringify(record, null, 1));

    // Written interpretation (what the page shows).
    const written = await page.locator('#readingInterpretation').innerText();
    fs.writeFileSync(path.join(dir, 'written-interpretation.txt'), written);

    // Max Chasroom script for the same state.
    const script = await page.evaluate(() => ResonatePresenter.buildScript());
    fs.writeFileSync(path.join(dir, 'presenter-script.json'), JSON.stringify(script, null, 1));
    fs.writeFileSync(path.join(dir, 'presenter-transcript.txt'), script.map((p, i) => `${String(i + 1).padStart(2, '0')} [${p.chapter}/${p.kind}] ${p.text}`).join('\n') + '\n');

    // Golden Thread: geometry at desktop, then 390 and 360 phone widths, with screenshots.
    const geo = { desktop_1280: await threadGeometry(page) };
    await page.locator('.spread-scroll').screenshot({ path: path.join(dir, 'golden-thread-1280.png') });
    for (const w of [390, 360]) {
      await page.setViewportSize({ width: w, height: 844 }); await page.waitForTimeout(900);
      geo['mobile_' + w] = await threadGeometry(page);
      await page.locator('.spread-scroll').screenshot({ path: path.join(dir, `golden-thread-${w}.png`) });
      await page.screenshot({ path: path.join(dir, `page-${w}.png`) });
    }
    await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(600);
    fs.writeFileSync(path.join(dir, 'golden-thread-geometry.json'), JSON.stringify(geo, null, 1));

    // The real PDF, downloaded through the app's own button.
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.locator('#downloadReading').click()]);
    const pdfPath = path.join(dir, 'reading.pdf'); await dl.saveAs(pdfPath);
    const pdf = await pdfText(pdfPath);
    fs.writeFileSync(path.join(dir, 'pdf-text.txt'), pdf.text);

    // Max player at 390px with the thread on his card strip, part-way through (muted, captions).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { try { speechSynthesis.cancel(); } catch {} });
    await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor();
    await page.locator('#mcSound').click(); await page.locator('#mcPlay').click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(dir, 'max-player-390.png') });
    await page.locator('#mcClose').click();

    // Reduced motion: same reading re-rendered, strands present with no flight.
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => renderDraw()); await page.waitForTimeout(400);
    const rm = await threadGeometry(page);
    const rmAnim = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    await page.locator('.spread-scroll').screenshot({ path: path.join(dir, 'golden-thread-390-reduced-motion.png') });
    // Cleanup: leaving the reading removes the overlay.
    await page.evaluate(() => go('home')); await page.waitForTimeout(300);
    const leftover = await page.evaluate(() => document.querySelectorAll('svg [data-gtc-key], svg [data-gtc-ring], canvas.gtc-sparks, .gtc-overlay').length);

    // Consistency: every card in the record appears, with the same orientation, in all three artefacts;
    // every quoted presenter line appears word for word in the written reading and the PDF.
    const norm = t => String(t).normalize('NFKD').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/→/g, '').replace(/[^\x20-\x7e\xa0-\xff\n]/g, '').replace(/\s+/g, ' ').trim();
    const W = norm(written), P = norm(pdf.text), S = norm(script.map(p => p.text).join(' '));
    const all = record.positions.flatMap(p => [p.card, p.clarifier1, p.clarifier2]).filter(Boolean);
    const cardChecks = all.map(c => {
      const shown = c.display; const otherForm = c.orientation === 'reversed' ? null : `${c.name}, reversed`;
      return { card: shown, in_written: W.includes(norm(shown)), in_pdf: P.includes(norm(shown)), in_presenter: S.includes(norm(shown)),
        wrong_orientation_in_written: otherForm ? W.includes(norm(otherForm)) : false, wrong_orientation_in_pdf: otherForm ? P.includes(norm(otherForm)) : false, wrong_orientation_in_presenter: otherForm ? S.includes(norm(otherForm)) : false };
    });
    const quotes = script.filter(p => p.kind === 'quote').map(p => ({ text: p.text, in_written: W.includes(norm(p.text)), in_pdf: P.includes(norm(p.text)) }));
    const mains = record.positions.map(p => p.card.display);
    const bridges = [...written.matchAll(/^(.+?) · (.+?)\. Read after|^(.+?) · (.+?)\. (Following|As the next step)/gm)].length;
    const consistency = {
      cards_checked: cardChecks.length,
      all_cards_in_all_three: cardChecks.every(c => c.in_written && c.in_pdf && c.in_presenter),
      any_orientation_conflict: cardChecks.some(c => c.wrong_orientation_in_written || c.wrong_orientation_in_pdf || c.wrong_orientation_in_presenter),
      presenter_quotes: quotes.length,
      presenter_quotes_verbatim_in_written: quotes.filter(q => q.in_written).length,
      presenter_quotes_verbatim_in_pdf: quotes.filter(q => q.in_pdf).length,
      clarifier_rule_violations: record.ruleCheck,
      card_checks: cardChecks, quote_checks: quotes,
      pdf_pages: pdf.pages, pdf_attachments: pdf.attachments,
      page_errors: errors,
      reduced_motion: { strands: rm.strands.length, rings: rm.rings.length, running_animations: rmAnim },
      overlay_nodes_after_leaving_reading: leftover,
      horizontal_page_overflow: { w390: geo.mobile_390.page_scroll_width > 390, w360: geo.mobile_360.page_scroll_width > 360 }
    };
    fs.writeFileSync(path.join(dir, 'consistency-check.json'), JSON.stringify(consistency, null, 1));
    summary.push({ spread, seed, cards: all.map(c => c.display), sequence: log.map(l => l.action), all_cards_in_all_three: consistency.all_cards_in_all_three,
      orientation_conflict: consistency.any_orientation_conflict, quotes: `${consistency.presenter_quotes_verbatim_in_written}/${quotes.length} written, ${consistency.presenter_quotes_verbatim_in_pdf}/${quotes.length} pdf`,
      rule_violations: record.ruleCheck.length, errors: errors.length, rm: consistency.reduced_motion, leftover, overflow: consistency.horizontal_page_overflow, strands: geo.desktop_1280.strands.map(s => `${s.from} → ${s.to}`) });
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(JSON.stringify(summary, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
