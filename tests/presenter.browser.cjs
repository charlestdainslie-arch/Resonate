// Max Chasroom presenter demo (Playwright). Opt-in page presenter-uat.html only; index.html must not change.
// Checks: nothing plays until Play; narration quotes only the reading's own text (page and PDF sections);
// card identities and clarifier order; pause, replay, sound and captions; demo labelling; no overflow.
// Run with: node tests/presenter.browser.cjs
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const port = 8781;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', jpg: 'image/jpeg', png: 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// Built without a literal URL so email/chat relays cannot rewrite it.
const BASE = ['http:', '', '127.0.0.1:' + port, ''].join('/');
const PAGE = BASE + 'presenter-uat.html';
// A stand-in for the device's speech engine: one on-device voice, one network voice, and a log of what was spoken.
const fakeSpeech = () => {
  const voices = [{ name: 'Network voice', lang: 'en-US', localService: false }, { name: 'Device voice', lang: 'en-GB', localService: true }];
  const log = window.__spoken = [];
  let current = null, timer = null;
  const synth = {
    getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { log.push({ text: u.text, voice: u.voice && u.voice.name }); current = u; timer = setTimeout(() => { current = null; u.onend && u.onend(); }, 60); },
    cancel() { clearTimeout(timer); current = null; }, pause() {}, resume() {}, get speaking() { return !!current; },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
};
const norm = s => s.replace(/\s+/g, ' ').trim();

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const failures = [];
  let passed = 0;
  const check = async (name, fn, device = devices['Pixel 7'], speech = true) => {
    const page = await browser.newPage({ ...device, reducedMotion: 'reduce' });
    if (speech) await page.addInitScript(fakeSpeech);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    try { await fn(page); assert.deepEqual(errors, []); passed++; console.log('PASS ' + name); }
    catch (e) { failures.push(`${name}: ${e.message.split('\n')[0]}`); }
    await page.close();
  };
  const part = page => page.locator('#mcPart').innerText();
  const loadReading = (page, base, clarifiers) => page.evaluate(([b, c]) => {
    const at = new Date(Date.UTC(2026, 9, 28, 10, b % 60)).toISOString();
    Object.assign(state, { spreadId: 'guidance', spreadSize: 1, drawnCardIds: [b], drawnAt: at, journalId: null, journalSpread: null, readingAstrology: null, openingDice: null,
      clarifierReadingAt: c.length ? at : null, firstLayerClarifiers: c.slice(0, 1), additionalClarifierReadingAt: c.length > 1 ? at : null,
      additionalClarifierLayers: c.length > 1 ? [{ number: 2, cards: [c[1]] }] : [], readingIndex: null, drawSettled: true, drawPhase: 'settled' });
    go('draw');
  }, [base, clarifiers]);
  // The PDF's own sections for this reading, captured at the point they are handed to the PDF writer.
  const pdfText = async page => {
    await page.evaluate(() => { window.__pdf = null; ResonatePDF.create = async sections => { window.__pdf = sections; return new Uint8Array([37]); }; URL.createObjectURL = () => 'blob:x'; });
    await page.locator('#downloadReading').click();
    await page.waitForFunction(() => window.__pdf);
    return page.evaluate(() => window.__pdf.map(s => s.text).join('\n'));
  };
  const faithful = async (page, label) => {
    const script = await page.evaluate(() => ResonatePresenter.buildScript());
    const frames = await page.evaluate(() => Object.values(ResonatePresenter.FRAME));
    const shown = norm(await page.locator('#readingInterpretation').innerText());
    const pdf = norm(await pdfText(page));
    const ids = await page.evaluate(() => [state.drawnCardIds[0], ...readingLayerCards(0).map(c => c.id)]);
    const names = await page.evaluate(ids => ids.map(id => cards.find(c => c.id === id).name), ids);
    let clarifier = 0;
    for (const line of script) {
      if (line.kind === 'frame') assert.ok(frames.includes(line.text), `${label}: unknown presenter line "${line.text}"`);
      else if (line.kind === 'label') { clarifier++; assert.equal(line.text, `Clarifier ${clarifier}: ${names[clarifier]}.`, `${label}: clarifier label`); }
      else { assert.ok(shown.includes(line.text), `${label}: not on the page: "${line.text}"`); assert.ok(pdf.includes(line.text), `${label}: not in the PDF: "${line.text}"`); }
    }
    assert.equal(clarifier, names.length - 1, `${label}: every clarifier is presented`);
    // Recordable clips: each depends on one card of this reading at most, and says only words from its caption.
    for (const line of script) for (const clip of line.clips) {
      const m = clip.id.match(/^(?:frame-\w+|label-clarifier-[12]|thread-(?:\d|resonance)|(?:lens-guidance-0|meaning2?|foundation|brings|name)-(\d+))$/);
      assert.ok(m, `${label}: clip id "${clip.id}"`);
      if (m[1] !== undefined) assert.ok(ids.includes(Number(m[1])), `${label}: clip ${clip.id} belongs to this reading`);
      if (line.kind === 'label') continue;
      assert.ok(line.text.includes(clip.text.replace(/\.$/, '')), `${label}: clip "${clip.text}" is part of its caption`);
    }
    assert.ok(script.some(l => l.kind === 'quote' && /Take what resonates/.test(l.text)), `${label}: Golden Thread close is included`);
    const words = t => t.split(' ').length;
    assert.ok(words(script.map(l => l.text).join(' ')) < words(shown) * 0.35, `${label}: narration is a short version of the reading`);
    return { script, names };
  };

  await check('production index.html has no presenter', async page => {
    await page.goto(BASE);
    assert.equal(await page.evaluate(() => typeof window.ResonatePresenter), 'undefined');
    await page.evaluate(() => go('reading'));
    await page.locator('[data-spread="guidance"]').click();
    await page.locator('#stageDrawBtn').click();
    await page.waitForFunction(() => state.drawSettled);
    assert.equal(await page.locator('.mc-launch').count(), 0);
  });
  await check('demo opens labelled synthetic, cannot be saved, and stays silent until Play', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').waitFor();
    assert.match(await page.locator('.mc-demo-banner').innerText(), /DEMONSTRATION READING · SYNTHETIC[\s\S]*not drawn for you/);
    assert.equal(await page.locator('#saveReadingJournal').count(), 0, 'no save to Journal for the demo');
    assert.match(await page.locator('.reading-journal').innerText(), /Saving is turned off for the demonstration reading/);
    await page.locator('#mcOpen').click();
    assert.match(await page.locator('.mc-provenance').innerText(), /Demonstration reading · synthetic/);
    assert.equal(await page.locator('#mcTitle').innerText(), 'MAX CHASROOM · RESONATE');
    assert.match(await page.locator('.mc-tag').innerText(), /TEMPORARY PRESENTER · NOT CHAS'S LIKENESS/);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.__spoken.length), 0, 'nothing spoken before Play');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'mcPlay', 'focus starts on Play');
    assert.match(await page.locator('#mcVoice').innerText(), /Device voice\). Nothing is sent anywhere/);
  });
  await check('demo: cards shown in the spread\'s order with the right names', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    assert.deepEqual(await page.locator('.mc-card strong').allInnerTexts(), ['The High Priestess', 'The Magician', 'The Empress']);
    assert.deepEqual(await page.locator('.mc-card span').allInnerTexts(), ['CLARIFIER 1', 'GUIDANCE', 'CLARIFIER 2']);
    await page.locator('#mcClose').click();
    // The page's own spread, read left to right on screen, is in the same order.
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.spread-board strong')].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).map(e => e.textContent.replace(/\s+/g, ' ').trim())), ['II · The High Priestess', 'I · The Magician', 'III · The Empress']);
  });
  await check('demo narration quotes only the reading (page and PDF)', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').waitFor();
    const { script } = await faithful(page, 'demo');
    assert.equal(script[1].text, await page.evaluate(() => ResonatePresenter.FRAME.demo));
  });
  for (const [base, clarifiers] of [[0, []], [4, [9]], [21, [33, 50]], [77, [15, 60]], [40, [3, 70]], [12, [44]]]) {
    await check(`card ${base} with ${clarifiers.length} clarifier(s): narration quotes only the reading`, async page => {
      await page.goto(PAGE + '?own');
      await loadReading(page, base, clarifiers);
      await page.locator('#mcOpen').waitFor();
      assert.equal(await page.locator('.mc-demo-banner').count(), 0, 'a real reading is not labelled as the demo');
      const { script } = await faithful(page, `card ${base}`);
      assert.equal(script[1].text, await page.evaluate(() => ResonatePresenter.FRAME.yours));
      await page.locator('#mcOpen').click();
      assert.match(await page.locator('.mc-provenance').innerText(), /This reading · One-card Guidance · .* · not saved yet/);
    });
  }
  await check('a reading reopened from the Journal is presented with its saved cards', async page => {
    await page.goto(PAGE + '?own');
    await loadReading(page, 7, [30, 31]);
    await page.locator('#readingReflection').fill('test');
    await page.locator('#saveReadingJournal').click();
    const id = await page.evaluate(() => state.journalId);
    await page.reload();
    await page.evaluate(id => openJournalReading(id), id);
    await page.locator('#mcOpen').click();
    assert.match(await page.locator('.mc-provenance').innerText(), /^From your Journal · One-card Guidance/);
    assert.deepEqual(await page.locator('.mc-card strong').allInnerTexts(), await page.evaluate(() => [30, 7, 31].map(id => cards.find(c => c.id === id).name)));
    await page.locator('#mcClose').click();
    await faithful(page, 'journal');
  });
  await check('Play speaks each caption with the on-device voice and finishes', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 15000 });
    const spoken = await page.evaluate(() => window.__spoken);
    const script = await page.evaluate(() => ResonatePresenter.buildScript());
    assert.deepEqual(spoken.map(s => s.text), script.map(l => l.text.replace(/ · /g, ', ')));
    assert.ok(spoken.every(s => s.voice === 'Device voice'), 'never the network voice');
    assert.equal(await page.locator('#mcPlay').innerText(), '▶ Play again');
  });
  await check('Pause holds the caption and stops speech; Resume carries on', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.evaluate(() => { const s = window.speechSynthesis, speak = s.speak; s.speak = u => { window.__spoken.push({ text: u.text }); }; s.__speak = speak; });
    await page.locator('#mcPlay').click();
    assert.equal(await part(page), await page.evaluate(() => 'Part 1 of ' + ResonatePresenter.buildScript().length));
    await page.locator('#mcPlay').click();
    assert.equal(await page.locator('#mcPlay').innerText(), '▶ Resume');
    const before = await page.evaluate(() => window.__spoken.length);
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__spoken.length), before);
    assert.equal(await part(page), await page.evaluate(() => 'Part 1 of ' + ResonatePresenter.buildScript().length));
    await page.locator('#mcPlay').click();
    assert.equal(await page.locator('#mcPlay').innerText(), '❚❚ Pause');
    assert.equal(await page.evaluate(() => window.__spoken.length), before + 1);
  });
  await check('Replay goes back to the start', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => /Part (6|7|8|9|1\d) of/.test(document.querySelector('#mcPart').textContent), null, { timeout: 10000 });
    await page.locator('#mcReplay').click();
    assert.equal(await part(page), await page.evaluate(() => 'Part 1 of ' + ResonatePresenter.buildScript().length));
  });
  await check('Sound off: no speech, captions keep time; Captions off hides the text', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcSound').click();
    assert.equal(await page.locator('#mcSound').getAttribute('aria-pressed'), 'false');
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => /Part 2 of/.test(document.querySelector('#mcPart').textContent), null, { timeout: 12000 });
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
    await page.locator('#mcCaptions').click();
    assert.equal(await page.locator('.mc-caption p').evaluate(e => getComputedStyle(e).visibility), 'hidden');
    await page.locator('#mcCaptions').click();
    assert.equal(await page.locator('.mc-caption p').evaluate(e => getComputedStyle(e).visibility), 'visible');
  });
  await check('cards light up as they are discussed', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcSound').click();
    await page.locator('#mcPlay').click();
    assert.equal(await page.locator('.mc-card.is-active').count(), 0);
    await page.waitForFunction(() => /Part 3 of/.test(document.querySelector('#mcPart').textContent), null, { timeout: 20000 });
    assert.deepEqual(await page.locator('.mc-card.is-active strong').allInnerTexts(), ['The Magician']);
  });
  await check('Escape and Close stop the presenter and return focus', async page => {
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcPlay').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mc-player').count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'mcOpen');
    const n = await page.evaluate(() => window.__spoken.length);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.__spoken.length), n, 'no speech after closing');
    await page.locator('#mcOpen').click();
    await page.locator('#mcFull').click();
    assert.equal(await page.locator('.mc-player').count(), 0);
    assert.ok(await page.locator('#readingInterpretation').evaluate(e => e.getBoundingClientRect().top < innerHeight));
  });
  // A stand-in voice pack: the manifest and clips are served by the test, each clip a short silent mp3.
  const silent = path.join(require('os').tmpdir(), 'presenter-test-silence.mp3');
  require('child_process').execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.15', '-b:a', '32k', silent]);
  const withVoicePack = async (page, drop = []) => {
    await page.route('**/voice/chas/manifest.json', async route => {
      const ids = await page.evaluate(() => ResonatePresenter.buildScript().flatMap(p => p.clips.map(c => c.id)));
      route.fulfill({ contentType: 'application/json', body: JSON.stringify({ label: "Test voice pack", clips: Object.fromEntries(ids.filter(id => !drop.includes(id)).map(id => [id, id + '.mp3'])) }) });
    });
    await page.route('**/voice/chas/*.mp3', route => route.fulfill({ contentType: 'audio/mpeg', body: fs.readFileSync(silent) }));
    await page.addInitScript(() => { window.__played = []; const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__played.push(this.src.split('/').pop()); return play.call(this); }; });
  };
  await check('recorded voice: every clip plays in order, and device speech is never used', async page => {
    await withVoicePack(page);
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcVoice').filter({ hasText: 'Test voice pack. Pre-recorded, so nothing is sent anywhere.' }).waitFor();
    assert.deepEqual(await page.evaluate(() => window.__played), [], 'nothing before Play');
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 30000 });
    const ids = await page.evaluate(() => ResonatePresenter.buildScript().flatMap(p => p.clips.map(c => c.id + '.mp3')));
    assert.deepEqual(await page.evaluate(() => window.__played), ids);
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
  });
  await check('recorded voice: Pause stops the clip and Resume carries on from it', async page => {
    await withVoicePack(page);
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    await page.locator('#mcVoice').filter({ hasText: 'Pre-recorded' }).waitFor();
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => window.__played.length >= 4, null, { timeout: 10000 });
    await page.locator('#mcPlay').click();
    const at = await page.evaluate(() => window.__played.length);
    const caption = await page.locator('#mcCaption').innerText();
    await page.waitForTimeout(600);
    assert.equal(await page.evaluate(() => window.__played.length), at, 'no clips while paused');
    assert.equal(await page.locator('#mcCaption').innerText(), caption);
    await page.locator('#mcPlay').click();
    const played = await page.evaluate(() => window.__played);
    assert.equal(played[at], played[at - 1], 'resumes with the clip that was paused');
  });
  await check('recorded voice with a missing line falls back to the device voice', async page => {
    await withVoicePack(page, ['frame-thread']);
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    assert.match(await page.locator('#mcVoice').innerText(), /Temporary voice: your device's built-in speech/);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => window.__spoken.length > 0);
    assert.deepEqual(await page.evaluate(() => window.__played), []);
  });
  await check('no on-device voice: captions only, said plainly', async page => {
    await page.addInitScript(() => { window.speechSynthesis.getVoices = () => [{ name: 'Network voice', lang: 'en-US', localService: false }]; });
    await page.goto(PAGE);
    await page.locator('#mcOpen').click();
    assert.match(await page.locator('#mcVoice').innerText(), /No on-device voice was found on this device, so Max is on captions only/);
    await page.locator('#mcPlay').click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
  });
  await check('other spreads say the demo is One-card only', async page => {
    await page.goto(PAGE + '?own');
    await page.evaluate(() => go('reading'));
    await page.locator('[data-spread="three"]').click();
    await page.locator('#stageDrawBtn').click();
    await page.waitForFunction(() => state.drawSettled);
    assert.match(await page.locator('.mc-launch').innerText(), /One-card Guidance only for now/);
    assert.equal(await page.locator('#mcOpen').count(), 0);
  });
  for (const [width, device] of [[360, { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }], [390, devices['Pixel 7']], [768, { viewport: { width: 768, height: 1024 } }], [1280, { viewport: { width: 1280, height: 900 } }]]) {
    await check(`${width}px: player fits without horizontal scroll and controls are tappable`, async page => {
      await page.goto(PAGE);
      await page.locator('#mcOpen').click();
      assert.equal(await page.evaluate(() => document.querySelector('.mc-player').scrollWidth > innerWidth), false);
      for (const id of ['mcPlay', 'mcReplay', 'mcSound', 'mcCaptions', 'mcClose']) {
        const box = await page.locator('#' + id).boundingBox();
        assert.ok(box.height >= 44 && box.width >= 44, `${id} is at least 44px`);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }, device);
  }
  await browser.close();
  server.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} presenter checks (silent until Play, faithful narration, controls, demo labelling, 4 widths)`);
})();
