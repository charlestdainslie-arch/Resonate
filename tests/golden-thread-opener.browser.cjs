// Golden Thread opener (Playwright). Opt-in page golden-thread-opener.html only; index.html must not change.
// Checks: silent until tapped; Play, Skip, Mute, captions, Replay; teardown (no animation or sound left
// running after Skip, end, hiding the page); reduced-motion still; the right card; the thread never
// crosses the title; soundtrack cues and no clipping; phone layout at 4 widths; measured frame rate.
// Run with: node tests/golden-thread-opener.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8796;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
const PAGE = ['http:', '', '127.0.0.1:' + port, 'golden-thread-opener.html'].join('/');
// Counts AudioContexts the page makes, and whether each is still open.
const audioSpy = () => {
  const Real = window.AudioContext; window.__ac = [];
  window.AudioContext = class extends Real { constructor(...a) { super(...a); window.__ac.push(this); } };
};

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const failures = []; let passed = 0; const notes = [];
  const check = async (name, fn, opts = devices['Pixel 7']) => {
    const page = await browser.newPage({ ...opts });
    await page.addInitScript(audioSpy);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    try { await page.goto(PAGE); await page.waitForLoadState('networkidle'); await fn(page); assert.deepEqual(errors, []); passed++; console.log('PASS ' + name); }
    catch (e) { failures.push(`${name}: ${e.message.split('\n')[0]}`); }
    await page.close();
  };
  const st = page => page.evaluate(() => GTO.state);
  const openAudio = page => page.evaluate(() => window.__ac.filter(a => a.state !== 'closed').length);

  await check('production index.html is unchanged and does not load the opener', async page => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.ok(!/golden-thread-opener/.test(html));
  });
  await check('silent and still until tapped; offers sound or silent', async page => {
    assert.equal(await page.locator('#gtoIntro').isVisible(), true);
    await page.waitForTimeout(500);
    assert.equal((await st(page)).playing, false);
    assert.equal(await page.evaluate(() => window.__ac.length), 0, 'no audio before a tap');
    assert.equal(await page.locator('#gtoStart').innerText(), '▶ Play with sound');
    assert.equal(await page.locator('#gtoSilent').innerText(), 'Play silently');
  });
  await check('Play: animates with sound, captions follow the timeline, then ends on the call to action', async page => {
    await page.locator('#gtoStart').click();
    await page.waitForFunction(() => GTO.state.t > 1);
    const s = await st(page); assert.equal(s.playing, true); assert.equal(s.audio, true);
    assert.equal(await openAudio(page), 1);
    await page.waitForFunction(() => GTO.state.t > 4.5, null, { timeout: 15000 });
    assert.equal(await page.locator('#gtoCaption').innerText(), '[a golden thread shimmers and sparkles]');
    await page.waitForFunction(() => document.body.classList.contains('is-done'), null, { timeout: 25000 });
    assert.equal((await st(page)).playing, false);
    assert.equal(await page.locator('.gto-cta').first().isVisible(), true);
    assert.equal(await page.locator('#gtoReplay').isVisible(), true);
  });
  await check('Skip jumps to the end and stops animation and sound', async page => {
    await page.locator('#gtoStart').click();
    await page.waitForFunction(() => GTO.state.t > .5);
    await page.locator('#gtoSkip').click();
    const s = await st(page); assert.equal(s.playing, false); assert.equal(s.audio, false);
    assert.equal(await openAudio(page), 0, 'audio context closed');
    const t = await page.evaluate(() => GTO.state.t); await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => GTO.state.t), t, 'nothing still animating');
    assert.equal(await page.locator('.gto-end').evaluate(e => getComputedStyle(e).opacity), '1');
  });
  await check('Play silently and Mute make no sound; Unmute resumes it', async page => {
    await page.locator('#gtoSilent').click();
    await page.waitForFunction(() => GTO.state.t > .5);
    assert.equal(await page.evaluate(() => window.__ac.length), 0);
    assert.equal(await page.locator('#gtoMute').innerText(), '🔊 Unmute');
    await page.locator('#gtoMute').click();
    assert.equal(await openAudio(page), 1);
    await page.locator('#gtoMute').click();
    assert.equal(await openAudio(page), 0);
  });
  await check('Hide words clears the captions; Show words brings them back', async page => {
    await page.locator('#gtoStart').click();
    await page.waitForFunction(() => GTO.state.t > .3);
    await page.locator('#gtoCaptions').click();
    assert.equal(await page.locator('#gtoCaptions').innerText(), 'Show words');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#gtoCaption').innerText(), '');
    await page.locator('#gtoCaptions').click();
    assert.notEqual(await page.locator('#gtoCaption').innerText(), '');
  });
  await check('hiding the page stops everything', async page => {
    await page.locator('#gtoStart').click();
    await page.waitForFunction(() => GTO.state.t > .5);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const s = await st(page); assert.equal(s.playing, false); assert.equal(s.audio, false);
    assert.equal(await openAudio(page), 0);
  });
  await check('Replay plays again from the start', async page => {
    await page.locator('#gtoStart').click();
    await page.locator('#gtoSkip').click();
    await page.locator('#gtoReplay').click();
    await page.waitForFunction(() => GTO.state.t > .2);
    const s = await st(page); assert.equal(s.playing, true); assert.ok(s.t < 3);
    assert.equal(await openAudio(page), 1, 'one sound at a time');
  });
  await check('reduced motion: the finished picture, no animation', async page => {
    await page.locator('#gtoStart').click();
    assert.equal(await page.evaluate(() => document.body.classList.contains('is-still')), true);
    assert.equal((await st(page)).playing, false);
    assert.equal(await page.locator('.gto-end').evaluate(e => getComputedStyle(e).opacity), '1');
    assert.equal(await page.locator('.gto-face').isVisible(), true);
  }, { ...devices['Pixel 7'], reducedMotion: 'reduce' });
  await check('the card is The Fool, from the deck and the card data', async page => {
    assert.match(await page.locator('#gtoFace').getAttribute('src'), /assets\/deck\/ar00\.jpg$/);
    const fool = await page.evaluate(() => { const c = cards.find(x => x.id === 0); return { name: `${c.roman} · ${c.name}`, kw: c.uprightKeywords.join(' · ') }; });
    assert.equal(await page.locator('#gtoCardName').textContent(), fool.name);
    assert.equal(await page.locator('#gtoKeywords').textContent(), fool.kw);
  });
  await check('the thread never runs across the title or keywords once settled', async page => {
    await page.evaluate(() => { document.getElementById('gtoIntro').hidden = true; GTO.skip(); });
    const hit = await page.evaluate(() => {
      const world = document.querySelector('.gto-world'), s = world.getBoundingClientRect().width / 390, w = world.getBoundingClientRect();
      const box = el => { const r = el.getBoundingClientRect(); return { l: (r.left - w.left) / s, r: (r.right - w.left) / s, t: (r.top - w.top) / s, b: (r.bottom - w.top) / s }; };
      const text = ['#gtoTitle h1', '#gtoCardName', '#gtoKeywords'].map(q => { const el = document.querySelector(q), range = document.createRange(); range.selectNodeContents(el); const r = range.getBoundingClientRect(); return { l: (r.left - w.left) / s, r: (r.right - w.left) / s, t: (r.top - w.top) / s, b: (r.bottom - w.top) / s }; });
      const ringStart = GTO.PATH.len[90];
      return GTO.PATH.pts.filter((p, i) => GTO.PATH.len[i] >= ringStart).filter(([x, y]) => text.some(b => x > b.l && x < b.r && y > b.t && y < b.b)).length;
    });
    assert.equal(hit, 0, 'no thread point inside the title or keyword text');
  });
  await check('soundtrack: every cue present at its time, never clipping', async page => {
    const pcm = await page.evaluate(async () => { const a = await GTO.renderSoundtrack(22050); return a; });
    const rms = (a, b) => { const s = pcm.slice(Math.round(a * 22050), Math.round(b * 22050)); return Math.sqrt(s.reduce((x, v) => x + v * v, 0) / s.length); };
    const peak = pcm.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    assert.ok(peak < 0.95, `peak ${peak.toFixed(2)}`);
    const quiet = rms(.05, .2), chime = rms(2.9, 3.3), thread = rms(5, 7), flip = rms(8.65, 9.2), chord = rms(12, 13.5);
    notes.push(`soundtrack RMS: start ${quiet.toFixed(3)}, chime ${chime.toFixed(3)}, thread ${thread.toFixed(3)}, flip ${flip.toFixed(3)}, chord ${chord.toFixed(3)}; peak ${peak.toFixed(2)}`);
    assert.ok(chime > quiet * 2 && thread > quiet && flip > quiet * 2 && chord > quiet, 'cues stand out from the opening hum');
  });
  for (const [width, opts] of [[360, { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }], [390, devices['Pixel 7']], [768, { viewport: { width: 768, height: 1024 } }], [1280, { viewport: { width: 1280, height: 800 } }]]) {
    await check(`${width}px: fits, controls tappable, card and title apart, call to action on screen`, async page => {
      await page.locator('#gtoStart').click(); await page.locator('#gtoSkip').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const id of ['gtoBack', 'gtoMute', 'gtoCaptions', 'gtoSkip', 'gtoReplay']) { const b = await page.locator('#' + id).boundingBox(); assert.ok(b.height >= 44 && b.width >= 44, `${id} ≥ 44px`); }
      const [c, h, cta] = await Promise.all(['#gtoCardWrap', '#gtoTitle h1', '.gto-end .gto-cta'].map(s => page.locator(s).boundingBox()));
      assert.ok(c.y + c.height < h.y, 'title below the card');
      const vh = await page.evaluate(() => innerHeight), bar = await page.locator('.gto-bar').boundingBox();
      assert.ok(cta.y + cta.height <= bar.y + 4 && cta.y + cta.height <= vh, 'call to action above the control bar');
    }, opts);
  }
  await check('measured frame rate while playing (Pixel 7 profile, this machine)', async page => {
    await page.locator('#gtoSilent').click();
    const fps = await page.evaluate(() => new Promise(done => { let n = 0; const start = performance.now(); const f = now => { n++; if (now - start < 3000) requestAnimationFrame(f); else done(n / ((now - start) / 1000)); }; requestAnimationFrame(f); }));
    notes.push(`frame rate while playing: ${fps.toFixed(0)} fps (headless Chromium, 2 CPUs; a phone will differ)`);
    assert.ok(fps > 20, `${fps.toFixed(0)} fps`);
  });

  await browser.close(); server.close();
  notes.forEach(n => console.log('NOTE ' + n));
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} Golden Thread opener checks (silence until tap, controls, teardown, reduced motion, card, thread path, sound, 4 widths, frame rate)`);
})();
