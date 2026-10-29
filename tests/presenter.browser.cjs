// Max Chasroom presenter (Playwright). Opt-in page presenter-uat.html only; index.html must not change.
// presenter-uat.html is the normal app with the presenter; ?demo loads the synthetic One-card demo.
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
const OWN = BASE + 'presenter-uat.html';
const PAGE = OWN + '?demo';
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
  // The player opens after an async voice-pack check, so wait for it.
  const open = async (page, sel = '#mcOpen') => { await page.locator(sel).click(); await page.locator('.mc-player').waitFor(); };
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
    // Positions, their cards and their clarifiers, straight from the app's state.
    const r = await page.evaluate(() => {
      const name = id => cards.find(c => c.id === id).name;
      const layers = [];
      if (state.clarifierReadingAt === state.drawnAt && state.firstLayerClarifiers?.length) layers.push(state.firstLayerClarifiers);
      if (state.additionalClarifierReadingAt === state.drawnAt) (state.additionalClarifierLayers || []).filter(l => l.number === 2).forEach(l => layers.push(l.cards));
      return { title: readingTitle(), labels: positionLabels(), ids: state.drawnCardIds, names: state.drawnCardIds.map(name),
        layers: layers.map(l => l.map(id => ({ id, name: name(id) }))) };
    });
    const one = r.ids.length === 1;
    const allowed = new Set([`Tonight: your ${r.title}.`]);
    r.ids.forEach((id, i) => allowed.add(one ? `${r.names[i]}.` : `${r.labels[i]}: ${r.names[i]}.`));
    r.layers.forEach((layer, l) => layer.forEach((c, i) => allowed.add(one ? `Clarifier ${l + 1}: ${c.name}.` : `Clarifier ${l + 1} · ${r.labels[i]}: ${c.name}.`)));
    const labels = script.filter(l => l.kind === 'label').map(l => l.text);
    // Every possible link between neighbouring cards: their authored connection, or a fact from the card data.
    const links = await page.evaluate(() => state.drawnCardIds.slice(1).flatMap((id, i) => {
      const a = cards.find(c => c.id === state.drawnCardIds[i]), b = cards.find(c => c.id === id), n = x => normalise(x);
      const out = [...(b.connections || []).filter(c => n(c.card) === n(a.name)), ...(a.connections || []).filter(c => n(c.card) === n(b.name))].map(c => c.meaning);
      if (a.suit && a.suit === b.suit) out.push(`Like ${a.name}, this is a ${b.suit} card.`);
      if (a.arcana === 'Major' && b.arcana === 'Major') out.push(`Like ${a.name}, this is a Major Arcana card.`);
      if (a.element === b.element) out.push(`Like ${a.name}, this card carries the element of ${b.element}.`);
      return out;
    }));
    for (const line of script) {
      if (line.kind === 'frame') assert.ok(frames.includes(line.text), `${label}: unknown presenter line "${line.text}"`);
      else if (line.kind === 'label') assert.ok(allowed.has(line.text), `${label}: unexpected label "${line.text}"`);
      else if (line.kind === 'link') assert.ok(links.includes(line.text), `${label}: link not from the card data: "${line.text}"`);
      else { assert.ok(shown.includes(line.text), `${label}: not on the page: "${line.text}"`); assert.ok(pdf.includes(line.text), `${label}: not in the PDF: "${line.text}"`); }
    }
    assert.deepEqual([...labels].sort(), [...allowed].sort(), `${label}: every position and clarifier is named once`);
    // Recordable clips: each depends on one card of this reading at most, and says only words from its caption.
    const ids = [...r.ids, ...r.layers.flat().map(c => c.id)];
    for (const line of script) for (const clip of line.clips) {
      const m = clip.id.match(/^(?:frame-\w+|title-\w+|pos-\w+-\d+|label-clarifier-[12]|thread-(?:\d|resonance)|is-(?:major|suit-\w+|element-\w+)|conn-\d+-\d+|(?:lens-\w+-\d+|meaning|name|like)-(\d+))$/);
      assert.ok(m, `${label}: clip id "${clip.id}"`);
      if (m[1] !== undefined) assert.ok(ids.includes(Number(m[1])), `${label}: clip ${clip.id} belongs to this reading`);
      if (line.kind === 'label') continue;
      assert.ok(line.text.includes(clip.text.replace(/\.$/, '')), `${label}: clip "${clip.text}" is part of its caption`);
    }
    assert.ok(script.some(l => l.kind === 'quote' && /Take what resonates/.test(l.text)), `${label}: the reading's closing line is included`);
    const words = t => t.split(' ').length;
    assert.ok(words(script.map(l => l.text).join(' ')) < words(shown) * 0.35, `${label}: narration is a short version of the reading`);
    return { script, r };
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
    await open(page);
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
    await open(page);
    assert.deepEqual(await page.locator('.mc-card > strong').allInnerTexts(), ['The Magician']);
    assert.deepEqual(await page.locator('.mc-card > span').allInnerTexts(), ['GUIDANCE']);
    // Clarifiers sit under their card, 1 on the left and 2 on the right.
    assert.deepEqual(await page.locator('.mc-clar strong').allInnerTexts(), ['The High Priestess', 'The Empress']);
    const [c1, c2, main] = await Promise.all(['[data-slot="c0-1"]', '[data-slot="c0-2"]', '[data-slot="p0"] > img'].map(s => page.locator(s).boundingBox()));
    assert.ok(c1.x < c2.x && c1.y > main.y + main.height - 1, 'clarifier 1 left, 2 right, both below the card');
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
      await page.goto(OWN);
      await loadReading(page, base, clarifiers);
      await page.locator('#mcOpen').waitFor();
      assert.equal(await page.locator('.mc-demo-banner').count(), 0, 'a real reading is not labelled as the demo');
      const { script } = await faithful(page, `card ${base}`);
      assert.equal(script[1].text, 'Tonight: your One-card Guidance.');
      await open(page);
      assert.match(await page.locator('.mc-provenance').innerText(), /This reading · One-card Guidance · .* · not saved yet/);
    });
  }
  await check('a reading reopened from the Journal is presented with its saved cards', async page => {
    await page.goto(OWN);
    await loadReading(page, 7, [30, 31]);
    await page.locator('#readingReflection').fill('test');
    await page.locator('#saveReadingJournal').click();
    const id = await page.evaluate(() => state.journalId);
    await page.reload();
    await page.evaluate(id => openJournalReading(id), id);
    await open(page);
    assert.match(await page.locator('.mc-provenance').innerText(), /^From your Journal · One-card Guidance/);
    assert.deepEqual(await page.locator('.mc-card > strong').allInnerTexts(), await page.evaluate(() => [cards.find(c => c.id === 7).name]));
    assert.deepEqual(await page.locator('.mc-clar strong').allInnerTexts(), await page.evaluate(() => [30, 31].map(id => cards.find(c => c.id === id).name)));
    await page.locator('#mcClose').click();
    await faithful(page, 'journal');
  });
  await check('Play speaks each caption with the on-device voice and finishes', async page => {
    await page.goto(PAGE);
    await open(page);
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
    await open(page);
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
    await page.waitForFunction(n => window.__spoken.length === n + 1, before);
  });
  await check('a line the phone silently drops does not leave Max stuck (Android cancel bug)', async page => {
    await page.goto(PAGE);
    await open(page);
    // The first line after Play is swallowed: no sound, no onend, as Chrome on Android can do after cancel().
    await page.evaluate(() => { const s = window.speechSynthesis, speak = s.speak.bind(s); let dropped = false; s.speak = u => { if (!dropped) { dropped = true; return; } speak(u); }; });
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => /Part 2 of/.test(document.querySelector('#mcPart').textContent), null, { timeout: 15000 });
  });
  await check('Replay after the end plays everything again from the top', async page => {
    await page.goto(PAGE);
    await open(page);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 15000 });
    const first = await page.evaluate(() => window.__spoken.length);
    await page.locator('#mcReplay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => window.__spoken.length), first * 2, 'every line spoken again');
  });
  await check('Hide words shrinks the caption box; buttons say what they do', async page => {
    await page.goto(PAGE);
    await open(page);
    assert.equal(await page.locator('#mcCaptions').innerText(), 'Hide words');
    assert.equal(await page.locator('#mcSound').innerText(), '🔇 Mute');
    await page.locator('#mcCaptions').click();
    assert.equal(await page.locator('#mcCaptions').innerText(), 'Show words');
    assert.ok((await page.locator('#mcCaption').boundingBox()).height <= 8, 'no empty black panel');
    await page.locator('#mcSound').click();
    assert.equal(await page.locator('#mcSound').innerText(), '🔊 Unmute');
  });
  await check('Replay goes back to the start', async page => {
    await page.goto(PAGE);
    await open(page);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => /Part (6|7|8|9|1\d) of/.test(document.querySelector('#mcPart').textContent), null, { timeout: 10000 });
    await page.locator('#mcReplay').click();
    assert.equal(await part(page), await page.evaluate(() => 'Part 1 of ' + ResonatePresenter.buildScript().length));
  });
  await check('Sound off: no speech, captions keep time; Captions off hides the text', async page => {
    await page.goto(PAGE);
    await open(page);
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
    await open(page);
    await page.locator('#mcSound').click();
    await page.locator('#mcPlay').click();
    assert.equal(await page.locator('.mc-card.is-active').count(), 0);
    const at = await page.evaluate(() => ResonatePresenter.buildScript().findIndex(p => p.text === 'The Magician.') + 1);
    await page.waitForFunction(n => new RegExp(`Part ${n} of`).test(document.querySelector('#mcPart').textContent), at, { timeout: 30000 });
    assert.deepEqual(await page.locator('.mc-card.is-active > strong').allInnerTexts(), ['The Magician']);
    assert.equal(await page.locator('.mc-clar.is-active').count(), 0);
  });
  await check('Escape and Close stop the presenter and return focus', async page => {
    await page.goto(PAGE);
    await open(page);
    await page.locator('#mcPlay').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mc-player').count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'mcOpen');
    const n = await page.evaluate(() => window.__spoken.length);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.__spoken.length), n, 'no speech after closing');
    await open(page);
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
    await open(page);
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
    await open(page);
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
    await withVoicePack(page, ['frame-close']);
    await page.goto(PAGE);
    await open(page);
    assert.match(await page.locator('#mcVoice').innerText(), /Temporary voice: your device's built-in speech/);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => window.__spoken.length > 0);
    assert.deepEqual(await page.evaluate(() => window.__played), []);
  });
  await check('no on-device voice: captions only, said plainly', async page => {
    await page.addInitScript(() => { window.speechSynthesis.getVoices = () => [{ name: 'Network voice', lang: 'en-US', localService: false }]; });
    await page.goto(PAGE);
    await open(page);
    assert.match(await page.locator('#mcVoice').innerText(), /No on-device voice was found on this device, so Max is on captions only/);
    await page.locator('#mcPlay').click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
  });
  // Real draws through the app in every spread, then each clarifier layer the app allows (two at most).
  const drawSpread = async (page, spread, clarifierLayers) => {
    await page.goto(OWN);
    await page.evaluate(() => go('reading'));
    await page.locator(`[data-spread="${spread}"]`).click();
    await page.locator('#stageDrawBtn').click();
    await page.waitForFunction(() => state.drawSettled === true, null, { timeout: 30000 });
    for (let n = 0; n < clarifierLayers; n++) {
      await page.locator('#primaryClarifierAction').click();
      await page.waitForFunction(n => (n === 0 ? state.firstLayerClarifiers?.length : state.additionalClarifierLayers?.length), n);
    }
  };
  for (const spread of ['guidance', 'three', 'seven', 'relationship', 'celtic']) {
    for (const layers of [0, 2]) {
      await check(`${spread}, ${layers} clarifier layers: every position narrated from the reading's own text`, async page => {
        await drawSpread(page, spread, layers);
        const { r } = await faithful(page, `${spread}/${layers}`);
        await open(page);
        assert.equal(await page.locator('.mc-card').count(), r.ids.length, 'one card per position');
        assert.deepEqual(await page.locator('.mc-card > strong').allInnerTexts(), r.names);
        assert.equal(await page.locator('.mc-clar').count(), r.layers.flat().length, 'every clarifier shown under its card');
        assert.match(await page.locator('.mc-provenance').innerText(), new RegExp(`^This reading · ${r.title.replace(/[·]/g, '.')} · .* · not saved yet$`));
        assert.equal(await page.evaluate(() => document.querySelector('.mc-player').scrollWidth > innerWidth), false, 'no sideways page scroll');
      });
    }
  }
  await check('cards are linked: authored connection, else a fact from the card data', async page => {
    await page.goto(OWN);
    const script = await page.evaluate(() => {
      const id = n => cards.find(c => c.name === n).id;
      const at = '2026-10-28T11:00:00.000Z';
      Object.assign(state, { spreadId: 'three', spreadSize: 3, drawnCardIds: [id('The Fool'), id('The Magician'), id('Two of Cups')], drawnAt: at, journalId: null, journalSpread: null,
        readingAstrology: null, openingDice: null, clarifierReadingAt: null, firstLayerClarifiers: [], additionalClarifierReadingAt: null, additionalClarifierLayers: [], drawSettled: true, drawPhase: 'settled' });
      go('draw');
      return ResonatePresenter.buildScript();
    });
    const links = script.filter(l => l.kind === 'link').map(l => l.text);
    const authored = await page.evaluate(() => [['The Magician', 'The Fool'], ['The Fool', 'The Magician']].flatMap(([a, b]) => cards.find(c => c.name === a).connections.filter(c => c.card === b).map(c => c.meaning)));
    assert.equal(links[0], authored[0], 'Fool → Magician uses their authored connection (the later card\'s own entry first)');
    assert.equal(links.length, 1, 'Magician → Two of Cups share nothing, so no link is made up');
    await faithful(page, 'linked');
  });
  await check('Hear Clarifier 2 plays only that clarifier and the close', async page => {
    await drawSpread(page, 'seven', 2);
    assert.deepEqual(await page.locator('[data-mc-chapter]').allInnerTexts(), ['▶ Hear Clarifier 1', '▶ Hear Clarifier 2']);
    await open(page, '[data-mc-chapter="c2"]');
    assert.match(await page.locator('.mc-provenance').innerText(), / · Clarifier 2$/);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 20000 });
    const expected = await page.evaluate(() => ResonatePresenter.playlist(ResonatePresenter.buildScript(), 'c2').map(p => p.text.replace(/ · /g, ', ').replace(/ — /g, ', ')));
    assert.deepEqual(await page.evaluate(() => window.__spoken.map(s => s.text)), expected);
    assert.equal(expected[0], await page.evaluate(() => ResonatePresenter.FRAME.back));
    assert.equal(expected.filter(t => /^Clarifier 2, /.test(t)).length, 7, 'all seven second clarifiers');
    assert.equal(expected.filter(t => /^Clarifier 1, /.test(t)).length, 0, 'no first clarifiers');
  });
  await check('a reading with no clarifiers offers no clarifier buttons', async page => {
    await drawSpread(page, 'three', 0);
    assert.equal(await page.locator('[data-mc-chapter]').count(), 0);
  });
  await check('wide spread: the strip follows the card being discussed', async page => {
    await drawSpread(page, 'celtic', 0);
    await open(page);
    await page.locator('#mcSound').click();
    const at = await page.evaluate(() => ResonatePresenter.buildScript().findIndex(p => p.show.length === 1 && p.show[0] === 'p8') + 1);
    await page.evaluate(() => { const s = window.setTimeout; window.setTimeout = (f, ms) => s(f, Math.min(ms, 30)); });
    await page.locator('#mcPlay').click();
    await page.waitForFunction(n => new RegExp(`Part ${n} of`).test(document.querySelector('#mcPart').textContent), at, { timeout: 30000 });
    const seen = await page.evaluate(() => { const strip = document.querySelector('.mc-cards'), card = document.querySelector('[data-slot="p8"]').getBoundingClientRect(), box = strip.getBoundingClientRect(); return card.left >= box.left - 1 && card.right <= box.right + 1 && strip.scrollLeft > 0; });
    assert.ok(seen, 'card 9 scrolled into view');
  });
  await check('transcript is there but closed by default', async page => {
    await drawSpread(page, 'three', 0);
    await open(page);
    assert.equal(await page.locator('.mc-transcript').evaluate(e => e.open), false);
    await page.locator('.mc-transcript summary').click();
    assert.equal(await page.locator('.mc-transcript li').count(), await page.evaluate(() => ResonatePresenter.buildScript().length));
  });
  for (const [width, device] of [[360, { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }], [390, devices['Pixel 7']], [768, { viewport: { width: 768, height: 1024 } }], [1280, { viewport: { width: 1280, height: 900 } }]]) {
    await check(`${width}px: player fits without horizontal scroll and controls are tappable`, async page => {
      await page.goto(PAGE);
      await open(page);
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
