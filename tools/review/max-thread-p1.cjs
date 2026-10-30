/* P1 independent checks: Max Chasroom + Golden Thread (claude/max-golden-thread @ 7b8f162).
   Usage: node p1check.cjs <combined-root> <parent-root (1fff68b)> <outdir>
   Stand-in on-device voice (no real speech engine in headless Chromium); seeded draws. */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [ROOT, PARENT, OUT] = process.argv.slice(2).map(p => path.resolve(p));
const types = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.m4a':'audio/mp4','.mp3':'audio/mpeg' };
function serve(root) { return new Promise(r => { const s = http.createServer((req, res) => { let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html'; const f = path.join(root, u); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); }); }

const INIT = ({ seed, ms }) => {
  // Seeded draws, so both builds deal the same cards.
  let a = seed >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const voices = [{ name: 'English Australia', lang: 'en_AU', localService: true }];
  let timer = null, cur = null; window.__spoken = []; window.__cancels = 0;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { window.__spoken.push(u.text); cur = u; setTimeout(() => u.onstart && u.onstart(), 10); timer = setTimeout(() => { cur = null; u.onend && u.onend(); }, ms); },
    cancel() { window.__cancels++; clearTimeout(timer); cur = null; }, pause() {}, resume() {}, get speaking() { return !!cur; } } });
  window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
};

const results = []; let failures = 0;
function record(area, name, status, detail) { results.push({ area, name, status, detail: detail || '' }); if (status === 'FAIL') failures++; console.log(`${status.padEnd(5)} [${area}] ${name}${detail ? ' — ' + detail : ''}`); }

async function draw(page, spread, layers) {
  await page.getByRole('button', { name: 'Get a Reading', exact: true }).first().click(); await page.waitForTimeout(250);
  await page.locator(`[data-spread="${spread}"]`).click(); await page.waitForTimeout(250);
  await page.locator('#shuffleCardsBtn').click(); await page.waitForFunction(() => !document.querySelector('#stageDrawBtn')?.disabled, null, { timeout: 20000 });
  await page.locator('#stageDrawBtn').click(); await page.waitForFunction(() => state.drawSettled, null, { timeout: 90000 });
  await page.waitForFunction(() => !document.querySelector('.gtc-pending'), null, { timeout: 60000 }).catch(() => {});
  for (let l = 1; l <= layers; l++) {
    await page.locator('#primaryClarifierAction').click();
    await page.waitForFunction(n => (n === 1 ? state.firstLayerClarifiers?.length : state.additionalClarifierLayers?.length) && !document.querySelector('.gtc-pending'), l, { timeout: 90000 });
    await page.waitForTimeout(400);
  }
}
const expectedOrder = page => page.evaluate(chapter => { const seen = []; ResonatePresenter.buildScript().forEach(p => { if (chapter && p.chapter !== chapter) return; p.show.forEach(s => { if (!seen.includes(s)) seen.push(s); }); }); return seen; }, null);
async function playToEnd(page, timeout = 240000) {
  await page.evaluate(() => { window.__order = []; window.__poll = setInterval(() => { const d = window.__maxThread?.discussed || {}; Object.keys(d).forEach(k => { if (d[k] === true && !window.__order.includes(k)) window.__order.push(k); }); }, 50); });
  await page.locator('#mcPlay').click();
  await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout });
  await page.waitForFunction(() => !Object.values(window.__maxThread?.discussed || {}).includes('pending'), null, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(600);
  return page.evaluate(() => { clearInterval(window.__poll); const d = window.__maxThread?.discussed || {}; Object.keys(d).forEach(k => { if (d[k] === true && !window.__order.includes(k)) window.__order.push(k); }); return window.__order; });
}
const threadState = page => page.evaluate(() => ({
  rings: [...document.querySelectorAll('.mc-cards [data-gtc-ring]')].filter(e => e.getAttribute('data-gtc-ring') !== 'enter').length,
  overlays: document.querySelectorAll('.mc-cards > .gtc-overlay').length,
  overlaysAnywhere: document.querySelectorAll('.mc-player .gtc-overlay').length,
  pending: Object.values(window.__maxThread?.discussed || {}).filter(v => v === 'pending').length,
  cards: document.querySelectorAll('.mc-cards > .mc-card').length,
  clar: document.querySelectorAll('.mc-cards [data-gtc-clarifier]').length,
  sideScroll: document.documentElement.scrollWidth > innerWidth + 1
}));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(ROOT), psrv = await serve(PARENT);
  const base = `http://127.0.0.1:${srv.address().port}`, pbase = `http://127.0.0.1:${psrv.address().port}`;
  const browser = await chromium.launch();
  async function ctxPage(w, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 860 : 900 }, isMobile: w < 800, hasTouch: w < 800, deviceScaleFactor: w < 800 ? 2 : 1, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', acceptDownloads: true });
    await ctx.addInitScript(INIT, { seed: opts.seed || 4242, ms: opts.ms || 350 });
    const page = await ctx.newPage(); page.__errors = [];
    page.on('pageerror', e => page.__errors.push(e.message)); page.on('response', r => { if (r.status() >= 400 && !/\/voice\/chas\/manifest\.json$/.test(r.url())) page.__errors.push(r.status() + ' ' + r.url()); });
    page.on('console', m => { if (m.type() === 'error' && !/attribute d: Expected number|status of 404/.test(m.text())) page.__errors.push('console: ' + m.text()); });
    await page.goto((opts.parent ? pbase : base) + '/presenter-uat.html'); await page.waitForTimeout(400);
    return { ctx, page };
  }

  // 1. Order + counts for 0/1/2 clarifiers, every width.
  const matrix = [[360, 'three', 0], [360, 'relationship', 2], [390, 'guidance', 1], [390, 'three', 2], [412, 'relationship', 1], [412, 'guidance', 2], [1280, 'relationship', 2], [1280, 'three', 0]];
  for (const [w, sp, L] of matrix) {
    const name = `${w}px ${sp}, ${L} clarifier layer${L === 1 ? '' : 's'}`;
    const { ctx, page } = await ctxPage(w, { seed: 1000 + w + L });
    try {
      await draw(page, sp, L);
      await page.evaluate(() => scrollTo(0, 0)); await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor(); await page.waitForTimeout(300);
      const before = await threadState(page);
      const spokenBefore = await page.evaluate(() => window.__spoken.length);
      const exp = await expectedOrder(page);
      const order = await playToEnd(page);
      const after = await threadState(page);
      const want = after.cards * (1 + L);
      const hiddenCards = await page.evaluate(() => { const st = document.querySelector('.mc-cards'); if (st.classList.contains('is-wide')) return 0; const sr = st.getBoundingClientRect(); return [...st.querySelectorAll(':scope > .mc-card')].filter(c => { const x = c.getBoundingClientRect(); return x.left < sr.left - 1 || x.right > sr.right + 1; }).length; });
      const ok = before.rings === 0 && spokenBefore === 0 && after.rings === want && after.overlays === 1 && after.pending === 0 && JSON.stringify(order) === JSON.stringify(exp) && !after.sideScroll && !hiddenCards && !page.__errors.length;
      record('Thread follows Max', name, ok ? 'PASS' : 'FAIL', `${after.rings}/${want} loops, order ${JSON.stringify(order) === JSON.stringify(exp) ? 'matches narration' : 'DIFFERS ' + JSON.stringify(order) + ' vs ' + JSON.stringify(exp)}, overlays ${after.overlays}, cards cut off ${hiddenCards}, page side-scroll ${after.sideScroll}, errors ${page.__errors.length}${page.__errors.length ? ' ' + page.__errors.slice(0, 2).join(' | ') : ''}`);
      // Labels readable: each card label visible, not clipped, and the topmost element at its centre (not the thread).
      const lab = await page.evaluate(() => {
        const out = { total: 0, clipped: [], covered: [], tiny: [] };
        document.querySelectorAll('.mc-cards .mc-card > strong, .mc-cards .mc-card > span').forEach(el => {
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) return; out.total++;
          if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.clipped.push(el.textContent.trim());
          const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 10) out.tiny.push(el.textContent.trim() + ' ' + fs + 'px');
          const strip = el.closest('.mc-cards'); const sr = strip.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          if (cx < sr.left || cx > sr.right) return; // scrolled out of the strip's view
          const top = document.elementFromPoint(cx, cy);
          if (top && !el.contains(top) && top !== el) out.covered.push(el.textContent.trim() + ' under ' + (top.className?.baseVal ?? top.className));
        });
        out.overlayPE = [...document.querySelectorAll('.mc-cards > .gtc-overlay, .mc-cards > .gtc-sparkle')].map(e => getComputedStyle(e).pointerEvents);
        return out;
      });
      const labOk = lab.total > 0 && !lab.clipped.length && !lab.covered.length && lab.overlayPE.every(p => p === 'none');
      record('Labels legible', name, labOk ? 'PASS' : 'FAIL', `${lab.total} labels; clipped ${lab.clipped.length}${lab.clipped.length ? ' ' + lab.clipped.slice(0, 3).join(', ') : ''}; covered ${lab.covered.length}${lab.covered.length ? ' ' + lab.covered.slice(0, 2).join(', ') : ''}; position labels at 9px (unchanged from parent) ${lab.tiny.length}; thread pointer-events ${[...new Set(lab.overlayPE)].join('/')}`);
      if ([360, 412, 1280].includes(w) && L === 2) await page.screenshot({ path: `${OUT}/max-thread-${w}-${sp}-L${L}.png` });
    } catch (e) { record('Thread follows Max', name, 'FAIL', 'threw: ' + e.message.split('\n')[0]); }
    await ctx.close();
  }

  // 2. Replay, rapid taps, close/reopen, chapters — 412px Relationship with 2 layers.
  {
    const { ctx, page } = await ctxPage(412, { seed: 777, ms: 250 });
    try {
      await draw(page, 'relationship', 2);
      await page.evaluate(() => scrollTo(0, 0)); await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor();
      const full = await page.evaluate(() => document.querySelectorAll('.mc-cards > .mc-card').length * 3);
      await playToEnd(page);
      // Replay: thread starts over, then completes again.
      await page.locator('#mcReplay').click(); await page.waitForTimeout(150);
      const afterReplay = await threadState(page);
      await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 120000 }); await page.waitForFunction(() => !Object.values(window.__maxThread?.discussed || {}).includes('pending'), null, { timeout: 120000 }); await page.waitForTimeout(600);
      const replayEnd = await threadState(page);
      record('Replay', 'Replay restarts the thread and completes it again', afterReplay.rings <= 1 && replayEnd.rings === full && replayEnd.overlays === 1 ? 'PASS' : 'FAIL', `rings just after Replay ${afterReplay.rings}, at end ${replayEnd.rings}/${full}, overlays ${replayEnd.overlays}`);
      // Rapid taps: Play/Pause x12, Replay x5 in quick succession, then let it finish.
      await page.locator('#mcReplay').click();
      for (let i = 0; i < 12; i++) { await page.locator('#mcPlay').click({ delay: 0 }); await page.waitForTimeout(40); }
      for (let i = 0; i < 5; i++) { await page.locator('#mcReplay').click({ delay: 0 }); await page.waitForTimeout(30); }
      const label = await page.locator('#mcPlay').innerText(); if (/Resume|Play/.test(label) && !/Pause/.test(label)) await page.locator('#mcPlay').click();
      await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 150000 }); await page.waitForFunction(() => !Object.values(window.__maxThread?.discussed || {}).includes('pending'), null, { timeout: 120000 }); await page.waitForTimeout(600);
      const rapid = await threadState(page);
      record('Rapid taps', '12× Play/Pause + 5× Replay, then play out', rapid.rings === full && rapid.overlays === 1 && rapid.pending === 0 && !page.__errors.length ? 'PASS' : 'FAIL', `rings ${rapid.rings}/${full}, overlays ${rapid.overlays}, pending ${rapid.pending}, errors ${page.__errors.length}`);
      // Close: thread removed, speech cancelled, nothing spoken after.
      await page.locator('#mcClose').click(); await page.waitForTimeout(300);
      const closed = await page.evaluate(() => ({ overlays: document.querySelectorAll('.gtc-overlay').length, player: !!document.querySelector('.mc-player'), conn: !!window.__maxThread?.connector, spoken: window.__spoken.length }));
      await page.waitForTimeout(1500);
      const spokenLater = await page.evaluate(() => window.__spoken.length);
      // The reading page itself keeps its own thread overlay(s); only Max's must be gone.
      record('Close', 'Close removes Max\'s thread and stops speech', !closed.player && !closed.conn && spokenLater === closed.spoken ? 'PASS' : 'FAIL', `player ${closed.player}, Max connector ${closed.conn}, speech after close ${spokenLater - closed.spoken}, overlays left on reading page ${closed.overlays}`);
      // Mid-play close, then reopen: no leaks.
      await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor(); await page.locator('#mcPlay').click(); await page.waitForTimeout(900);
      await page.locator('#mcClose').click(); await page.waitForTimeout(300);
      await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor(); await page.waitForTimeout(200);
      const reopen = await threadState(page);
      record('Close', 'Close mid-flight, reopen: fresh thread, one overlay', reopen.rings === 0 && reopen.overlaysAnywhere === 1 && !page.__errors.length ? 'PASS' : 'FAIL', `rings ${reopen.rings}, overlays in player ${reopen.overlaysAnywhere}, errors ${page.__errors.length}${page.__errors.length ? ' ' + page.__errors[0] : ''}`);
      await page.locator('#mcClose').click(); await page.waitForTimeout(200);
      // Chapter: Hear Clarifier 2 — earlier cards already threaded, ends complete.
      await page.locator('[data-mc-chapter="c2"]').click(); await page.locator('.mc-player').waitFor(); await page.waitForTimeout(300);
      const ch0 = await threadState(page);
      await playToEnd(page);
      const ch1 = await threadState(page);
      const cards = ch1.cards;
      record('Chapters', '"Hear Clarifier 2": cards + clarifier 1 pre-threaded, clarifier 2 added in order', ch0.rings === cards * 2 && ch1.rings === cards * 3 && ch1.overlays === 1 ? 'PASS' : 'FAIL', `start ${ch0.rings} (want ${cards * 2}), end ${ch1.rings} (want ${cards * 3})`);
      await page.locator('#mcClose').click(); await page.waitForTimeout(200);
      await page.locator('[data-mc-chapter="c1"]').click(); await page.locator('.mc-player').waitFor(); await page.waitForTimeout(300);
      const c10 = await threadState(page); await playToEnd(page); const c11 = await threadState(page);
      record('Chapters', '"Hear Clarifier 1": cards pre-threaded, clarifier 1 added', c10.rings === cards && c11.rings === cards * 2 ? 'PASS' : 'FAIL', `start ${c10.rings} (want ${cards}), end ${c11.rings} (want ${cards * 2})`);
      // Captions: live region, one caption per part.
      const cap = await page.evaluate(() => { const c = document.querySelector('#mcCaption'); return { live: c?.getAttribute('aria-live') || c?.closest('[aria-live]')?.getAttribute('aria-live') || null, role: c?.getAttribute('role'), text: c?.innerText.length }; });
      record('Captions', 'Caption region is announced to screen readers', cap.live ? 'PASS' : 'FAIL', `aria-live=${cap.live}, role=${cap.role}`);
    } catch (e) { record('Replay/close/chapters', 'sequence', 'FAIL', 'threw: ' + e.message.split('\n')[0]); }
    await ctx.close();
  }

  // 3. Reduced motion: loops appear with no flight animations.
  {
    const { ctx, page } = await ctxPage(390, { seed: 99, reduced: true });
    try {
      await draw(page, 'three', 2);
      await page.evaluate(() => scrollTo(0, 0)); await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor();
      await page.evaluate(() => { window.__anims = 0; window.__animIv = setInterval(() => { const strip = document.querySelector('.mc-cards'); if (!strip) return; window.__anims = Math.max(window.__anims, document.getAnimations().filter(a => { const t = a.effect?.target; return t && strip.contains(t) && (t.closest('.gtc-overlay') || t.closest('.gtc-sparkle') || t.classList?.contains('gtc-sparkle')); }).length); }, 40); });
      await playToEnd(page);
      const s = await threadState(page); const anims = await page.evaluate(() => { clearInterval(window.__animIv); return window.__anims; });
      record('Reduced motion', '390px three-card, 2 layers', s.rings === s.cards * 3 && anims === 0 ? 'PASS' : 'FAIL', `loops ${s.rings}/${s.cards * 3}, thread animations seen ${anims}`);
    } catch (e) { record('Reduced motion', '390px', 'FAIL', 'threw: ' + e.message.split('\n')[0]); }
    await ctx.close();
  }

  // 4. Reading text and PDF unchanged against the parent build (1fff68b), same seeded draw.
  let saved = null;
  {
    const { ctx, page } = await ctxPage(390, { seed: 2468 });
    await draw(page, 'relationship', 2);
    await page.locator('#saveReadingJournal').click(); await page.waitForTimeout(400);
    saved = await page.evaluate(() => localStorage.getItem('resonate-reading-journal-v1'));
    await ctx.close();
  }
  async function reopened(parent) {
    const { ctx, page } = await ctxPage(390, { seed: 1, parent });
    await page.evaluate(v => localStorage.setItem('resonate-reading-journal-v1', v), saved);
    await page.reload(); await page.waitForTimeout(500);
    const id = await page.evaluate(() => { const j = JSON.parse(localStorage.getItem('resonate-reading-journal-v1')); const list = Array.isArray(j) ? j : (j.readings || Object.values(j)); return String(list[0].id); });
    await page.evaluate(id => openJournalReading(id), id);
    await page.waitForFunction(() => state.drawSettled !== false, null, { timeout: 30000 }).catch(() => {});
    await page.waitForFunction(() => !document.querySelector('.gtc-pending'), null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const text = await page.evaluate(() => { const app = document.querySelector('#app') || document.body; const clone = app.cloneNode(true); clone.querySelectorAll('.mc-launch, .gtc-overlay, .gtc-sparkle, svg, script, canvas').forEach(n => n.remove()); return clone.innerText.replace(/\s+/g, ' ').trim(); });
    let pdf = null;
    const btn = page.getByRole('button', { name: /Download Reading PDF/ }).first();
    if (await btn.count()) { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), btn.click()]); const p = `${OUT}/${parent ? 'parent' : 'combined'}.pdf`; await dl.saveAs(p); pdf = p; }
    const errs = page.__errors.slice(); await ctx.close(); return { text, pdf, errs };
  }
  try {
    const a = await reopened(false), b = await reopened(true);
    fs.writeFileSync(`${OUT}/texts.json`, JSON.stringify({ combined: a.text, parent: b.text }));
    record('Reading text', 'Same saved Relationship reading (2 clarifier layers) reopened in both builds: page text identical to parent 1fff68b', a.text === b.text && a.text.length > 500 ? 'PASS' : 'FAIL', `${a.text.length} vs ${b.text.length} chars${a.text === b.text ? '' : '; first difference at ' + [...a.text].findIndex((c, i) => c !== b.text[i])}; errors ${a.errs.length + b.errs.length}`);
    record('PDF', 'PDF of that reading: downloads in both builds', a.pdf && b.pdf ? 'PASS' : 'FAIL', `${a.pdf ? fs.statSync(a.pdf).size : '-'} vs ${b.pdf ? fs.statSync(b.pdf).size : '-'} bytes (text compared separately)`);
  } catch (e) { record('Reading text / PDF', 'compare with parent', 'FAIL', 'threw: ' + e.message.split('\n')[0]); }

  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
  console.log(`\n${results.filter(r => r.status === 'PASS').length}/${results.length} PASS, ${failures} FAIL`);
  await browser.close(); srv.close(); psrv.close(); process.exit(failures ? 1 : 0);
})();
