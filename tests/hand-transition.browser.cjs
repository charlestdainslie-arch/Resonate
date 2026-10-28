// Hand → golden filament transition prototype (Playwright, hand-uat.html only).
// Geometry: every spread at 360/390/768/1280/1920px, normal motion. The filament must start within 8px of the
// measured fingertip and end within 8px of the first .stage-card[data-stage-card] centre, and the table must be
// untouched. Lifecycle: Skip, Escape, early Draw, Back link, browser Back, reduced motion (static and live),
// repeated cycles, a pre-existing body class, resize, scroll, pagehide and normal completion, at 390 and 1280px.
// Writes test-results/hand-transition.json. Run with: node tests/hand-transition.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.UAT_OUTPUT_DIR || path.join(root, 'test-results'));
fs.mkdirSync(out, { recursive: true });
const port = 8776;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = process.env.HAND_BASE_URL || ['http:', '', '127.0.0.1:' + port, ''].join('/');
const PAGE = BASE.replace(/\/?$/, '/') + 'hand-uat.html';

const SPREADS = ['guidance', 'three', 'relationship', 'seven', 'celtic'];
const configs = {
  360: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  390: { ...devices['Pixel 7'] },
  768: { viewport: { width: 768, height: 1024 } },
  1280: { viewport: { width: 1280, height: 900 } },
  1920: { viewport: { width: 1920, height: 1080 } },
};
// The malformed spark icon path in app.js predates this work (reported on PR #32); everything else counts.
const KNOWN_CONSOLE = /<path> attribute d: Expected number/;
const results = [];
function record(id, label, ok, detail) { results.push({ id, label, pass: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${label}${detail ? ' — ' + JSON.stringify(detail) : ''}`); }

async function openTable(browser, width, spread, { reduced = false, before } = {}) {
  const page = await browser.newPage({ ...configs[width], reducedMotion: reduced ? 'reduce' : 'no-preference' });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !KNOWN_CONSOLE.test(m.text())) page.errors.push(m.text()); });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.ResonateHandTransition && window.ResonateHandTransitionWire && typeof go === 'function');
  // Records whether a hand layer and #32's reveal layer are ever in the DOM together.
  await page.evaluate(() => {
    window.__overlap = false; window.__maxRoots = 0;
    new MutationObserver(() => {
      const hands = document.querySelectorAll('.rh-root').length;
      window.__maxRoots = Math.max(window.__maxRoots, hands);
      if (hands && document.querySelector('.rm-root')) window.__overlap = true;
    }).observe(document.documentElement, { childList: true, subtree: true });
    go('reading');
  });
  if (before) await page.evaluate(before);
  await page.click(`[data-spread="${spread}"]`);
  return page;
}
const phase = page => page.evaluate(() => document.querySelector('.rh-root')?.dataset.phase || null);
const live = page => page.evaluate(() => document.querySelectorAll('.rh-root, .rh-skip').length);
const waitPhase = (page, p) => page.waitForFunction(p => document.querySelector('.rh-root')?.dataset.phase === p, p, { timeout: 4000 });
const boardSnapshot = page => page.evaluate(() => [...document.querySelectorAll('.stage-board, .stage-card[data-stage-card]')].map(n => n.className + '|' + (n.getAttribute('style') || '') + '|' + n.textContent).join('\n'));

// Measured in one frame, after tick() has written it: what the module drew vs where the fingertip and card are.
const measure = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => setTimeout(() => {
  const root = document.querySelector('.rh-root');
  if (!root) return resolve(null);
  const hand = root.querySelector('.rh-hand').getBoundingClientRect();
  const card = document.querySelector('.reading-stage-page .stage-board .stage-card[data-stage-card]').getBoundingClientRect();
  const [ox, oy] = root.dataset.origin.split(',').map(Number), [tx, ty] = root.dataset.target.split(',').map(Number);
  const d = root.querySelector('.rh-filament__core').getAttribute('d');
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const tip = { x: hand.left + hand.width * 0.82, y: hand.top + hand.height * 0.135 };
  const centre = { x: card.left + card.width / 2, y: card.top + card.height / 2 };
  const skip = document.querySelector('.rh-skip').getBoundingClientRect();
  const controls = ['#menuBtn', '#centerBtn', '.shop-label', '.brand-name', '[data-back]', '#shuffleCardsBtn', '#stageDrawBtn', '.reading-stage-page h1']
    .map(s => [s, document.querySelector(s)?.getBoundingClientRect()]).filter(([, r]) => r && r.width);
  const hits = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  resolve({
    origin: Math.hypot(nums[0] - tip.x, nums[1] - tip.y), originData: Math.hypot(ox - tip.x, oy - tip.y),
    end: Math.hypot(nums[nums.length - 2] - centre.x, nums[nums.length - 1] - centre.y), endData: Math.hypot(tx - centre.x, ty - centre.y),
    skip: { w: skip.width, h: skip.height, covers: controls.filter(([, r]) => hits(skip, r)).map(([s]) => s) },
    handOnScreen: hand.right > 0 && hand.left < innerWidth && hand.top < innerHeight,
    // The hand image's transparent margins are ignored: only the inner 70% counts as covering something.
    // When the table fills the screen there is nowhere clear to rest, so overlapping a card that already runs
    // past the bottom of the viewport is reported but allowed; covering anything fully on screen fails.
    handCovers: (() => { const h = { left: hand.left + hand.width * 0.15, right: hand.right - hand.width * 0.15, top: hand.top + hand.height * 0.08, bottom: hand.bottom };
      return [...controls.filter(([s]) => /Btn$/.test(s)), ...[...document.querySelectorAll('.stage-card[data-stage-card]')].map(n => ['card ' + n.dataset.stageCard, n.getBoundingClientRect()])]
        .filter(([, r]) => r.top < innerHeight && r.bottom > 0 && hits(h, r)).map(([s, r]) => r.bottom > innerHeight ? s + ' (already cut by the fold)' : s); })(),
    hScroll: document.documentElement.scrollWidth > innerWidth + 1,
  });
}, 0))));

async function geometry(browser) {
  for (const spread of SPREADS) for (const width of Object.keys(configs)) {
    const page = await openTable(browser, width, spread);
    const id = `G ${spread}@${width}`;
    try {
      await page.waitForSelector('.reading-stage-page .stage-board .stage-card[data-stage-card]');
      const before = await boardSnapshot(page);
      await waitPhase(page, 'filament');
      const mid = await measure(page);
      await waitPhase(page, 'fade');
      const end = await measure(page);
      await page.screenshot({ path: path.join(out, `hand-${spread}-${width}.png`) });
      await page.waitForFunction(() => !document.querySelector('.rh-root, .rh-skip'), null, { timeout: 2000 });
      const after = await boardSnapshot(page);
      const ok = mid && end && Math.max(mid.origin, end.origin, end.originData) <= 8 && Math.max(mid.end, end.end, end.endData) <= 8
        && end.skip.w >= 44 && end.skip.h >= 44 && !end.skip.covers.length && end.handOnScreen && !end.handCovers.some(c => !/fold/.test(c)) && !end.hScroll
        && before === after && !page.errors.length && !(await page.evaluate(() => document.body.classList.contains('rh-active')));
      record(id, 'fingertip→card geometry; hand clear of cards and buttons; skip ≥44px and clear of header controls; table untouched; cleaned up', ok,
        { originPx: end && +end.origin.toFixed(1), endPx: end && +end.end.toFixed(1), midEndPx: mid && +mid.end.toFixed(1), skip: end?.skip, handCovers: end?.handCovers, tableChanged: before !== after, errors: page.errors });
    } catch (e) { record(id, 'geometry', false, { error: e.message.split('\n')[0], errors: page.errors }); }
    await page.close();
  }
}

async function lifecycle(browser, width) {
  const L = (n, label, ok, detail) => record(`L${n}@${width}`, label, ok, detail);
  let page;

  page = await openTable(browser, width, 'three');
  await waitPhase(page, 'hand');
  await page.click('#shuffleCardsBtn');
  const shuffled = await page.waitForFunction(() => /Shuffling|shuffled/.test(document.getElementById('shuffleStatus')?.textContent), null, { timeout: 1500 }).then(() => true, () => false);
  L(1, 'Shuffle works mid-transition and the transition keeps playing', shuffled && !!(await phase(page)), { phase: await phase(page) });
  await page.close();

  page = await openTable(browser, width, 'three');
  await waitPhase(page, 'hand');
  await page.focus('.rh-skip');
  await page.keyboard.press('Enter');
  const focus = await page.evaluate(() => document.activeElement?.matches('#app .page h1') || document.activeElement?.tagName);
  L(2, 'Skip (keyboard) removes everything at once and returns focus to the heading', (await live(page)) === 0 && focus === true, { focus });
  await page.close();

  page = await openTable(browser, width, 'seven');
  await waitPhase(page, 'filament');
  await page.keyboard.press('Escape');
  L(3, 'Escape cancels', (await live(page)) === 0 && (await page.evaluate(() => !document.body.classList.contains('rh-active'))));
  await page.close();

  page = await openTable(browser, width, 'celtic');
  await waitPhase(page, 'hand');
  const early = await page.evaluate(() => new Promise(resolve => {
    document.getElementById('stageDrawBtn').click();
    // The table is replaced synchronously; the observer fires before the next task, and #32 mounts its reveal then too.
    queueMicrotask(() => setTimeout(() => resolve({ hands: document.querySelectorAll('.rh-root, .rh-skip').length, rm: !!document.querySelector('.rm-root'), view: state.view }), 0));
  }));
  await page.waitForTimeout(400);
  L(4, 'Early Draw cancels at once; never shares the screen with #32\'s reveal', early.hands === 0 && early.view === 'draw' && !(await page.evaluate(() => window.__overlap)), { ...early, overlap: await page.evaluate(() => window.__overlap) });
  await page.close();

  page = await openTable(browser, width, 'relationship');
  await waitPhase(page, 'hand');
  await page.click('[data-back]');
  L(5, 'Back to spreads link cancels', (await live(page)) === 0 && (await page.evaluate(() => state.view)) === 'reading');
  await page.close();

  page = await openTable(browser, width, 'relationship');
  await waitPhase(page, 'filament');
  await page.goBack().catch(() => {});
  await page.waitForTimeout(150);
  L(6, 'Browser Back cancels and stays in the app', (await live(page)) === 0 && (await page.evaluate(() => state.view)) === 'reading', { view: await page.evaluate(() => state.view).catch(() => 'left app') });
  await page.close();

  page = await openTable(browser, width, 'seven', { reduced: true });
  const seen = await page.evaluate(() => new Promise(resolve => { let any = false; const t0 = performance.now(); (function poll() { any = any || !!document.querySelector('.rh-root, .rh-skip'); performance.now() - t0 < 700 ? requestAnimationFrame(poll) : resolve(any); })(); }));
  L(7, 'Reduced motion: no overlay is created at all', !seen && (await page.evaluate(() => state.view)) === 'stage');
  await page.close();

  page = await openTable(browser, width, 'three');
  await waitPhase(page, 'hand');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const gone = await page.waitForFunction(() => !document.querySelector('.rh-root, .rh-skip'), null, { timeout: 500 }).then(() => true, () => false);
  L(8, 'Switching to reduced motion mid-play removes it within 500ms', gone);
  await page.close();

  page = await openTable(browser, width, 'guidance');
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(250 + i * 150); await page.click('[data-back]'); await page.click(`[data-spread="${SPREADS[i % 5]}"]`); }
  await page.waitForTimeout(100);
  const cycles = await page.evaluate(() => ({ now: document.querySelectorAll('.rh-root').length, skips: document.querySelectorAll('.rh-skip').length, max: window.__maxRoots }));
  await page.waitForFunction(() => !document.querySelector('.rh-root, .rh-skip'), null, { timeout: 3000 }).catch(() => {});
  L(9, 'Repeated table cycles: never more than one hand layer; ends clean', cycles.now === 1 && cycles.skips === 1 && cycles.max === 1 && (await live(page)) === 0, cycles);
  await page.close();

  page = await openTable(browser, width, 'three', { before: () => document.body.classList.add('rh-active') });
  await waitPhase(page, 'hand');
  await page.keyboard.press('Escape');
  L(10, 'A pre-existing body class is left in place', await page.evaluate(() => document.body.classList.contains('rh-active')));
  await page.close();

  page = await openTable(browser, width, 'seven');
  await waitPhase(page, 'filament');
  const vp = page.viewportSize();
  await page.setViewportSize({ width: Math.round(vp.width * 0.8), height: vp.height });
  await page.waitForTimeout(120);
  const resized = await measure(page);
  await page.evaluate(() => scrollBy(0, 120));
  await page.waitForTimeout(120);
  const scrolled = await measure(page);
  L(11, 'Resize and scroll mid-play: still fingertip→card within 8px', resized && scrolled && Math.max(resized.origin, resized.end, scrolled.origin, scrolled.end) <= 8,
    { resized: resized && [+resized.origin.toFixed(1), +resized.end.toFixed(1)], scrolled: scrolled && [+scrolled.origin.toFixed(1), +scrolled.end.toFixed(1)] });
  await page.close();

  page = await openTable(browser, width, 'three');
  await waitPhase(page, 'hand');
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  L(12, 'pagehide cancels; pageshow does not replay it', (await live(page)) === 0 && (await page.waitForTimeout(300), await live(page)) === 0);
  await page.close();

  page = await openTable(browser, width, 'celtic');
  const t0 = Date.now();
  await waitPhase(page, 'hand');
  await page.waitForFunction(() => !document.querySelector('.rh-root, .rh-skip'), null, { timeout: 4000 });
  const took = Date.now() - t0;
  L(13, 'Plays once and cleans up by ~2.6s; no page errors', took <= 2900 && !(await page.evaluate(() => document.body.classList.contains('rh-active'))) && !page.errors.length && (await page.evaluate(() => window.ResonateHandTransition.current())) === null, { tookMs: took, errors: page.errors });
  await page.close();
}

(async () => {
  if (!process.env.HAND_BASE_URL) await new Promise(r => server.listen(port, r));
  const browser = await chromium.launch();
  try {
    await geometry(browser);
    for (const width of [390, 1280]) await lifecycle(browser, width);
  } finally {
    await browser.close();
    server.close();
  }
  const failed = results.filter(r => !r.pass);
  fs.writeFileSync(path.join(out, 'hand-transition.json'), JSON.stringify({ page: PAGE, results }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  process.exit(failed.length ? 1 : 0);
})();
