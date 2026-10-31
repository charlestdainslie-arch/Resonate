/* Chas's recorded voice in Max (chas-voice.js, Issue #49).
 * Run: node tests/chas-voice.browser.cjs [path/to/max-voice-chas]
 * With no folder given, a small stand-in pack is generated (silent files), so the test never needs Chas's voice.
 * Checks: load the folder, kept after reload, recorded clips used where they exist and the device voice for the
 * rest, the note says which is which, Stop silences both, Forget removes it. Audio playback is stubbed. */
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
function serve() { return new Promise(r => { const s = http.createServer((req, res) => { let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html'; const f = path.join(ROOT, u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); }); }

function standInPack() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'max-voice-chas-'));
  const ids = ['frame-open', 'frame-short', 'frame-cards', 'frame-close', 'frame-ask', 'title-three', 'pos-three-0', 'pos-three-1', 'pos-three-2', 'thread-0', 'thread-1', 'thread-resonance'];
  for (let id = 0; id < 78; id++) ids.push('name-' + id, 'meaning-' + id);
  const clips = {};
  ids.forEach(id => { fs.writeFileSync(path.join(dir, id + '.m4a'), Buffer.from('stand-in')); clips[id] = id + '.m4a'; });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ label: "Chas's own recorded voice", clips }));
  return dir;
}

(async () => {
  const PACK = process.argv[2] ? path.resolve(process.argv[2]) : standInPack();
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/presenter-uat.html`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1368, height: 912 } });
  await ctx.addInitScript(() => {
    window.__played = []; window.__spoken = [];
    const voices = [{ name: 'English Australia', lang: 'en_AU', localService: true }];
    let cur = null, t = null;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {},
      speak(u) { window.__spoken.push(u.text); cur = u; t = setTimeout(() => { cur = null; u.onend && u.onend(); }, 30); }, cancel() { clearTimeout(t); cur = null; }, pause() {}, resume() {}, get speaking() { return !!cur; } } });
    window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
    HTMLMediaElement.prototype.play = function () { window.__played.push(this.src); setTimeout(() => this.onended && this.onended(), 30); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function () {};
  });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let passed = 0; const fail = [];
  const check = async (name, fn) => { try { await fn(); passed++; console.log('PASS', name); } catch (e) { fail.push(name + ': ' + e.message.split('\n')[0]); console.log('FAIL', name, '—', e.message.split('\n')[0]); } };
  const manifest = JSON.parse(fs.readFileSync(path.join(PACK, 'manifest.json'), 'utf8'));
  const count = Object.keys(manifest.clips).length;

  await page.goto(url); await page.waitForTimeout(400);
  await check('panel offers "Load my voice"; nothing is loaded or deployed by default', async () => {
    assert.match(await page.locator('#chasVoiceStatus').innerText(), /Load the max-voice-chas folder/);
    assert.equal(await page.evaluate(() => window.__chasVoice.loaded), 0);
    const r = await page.request.get(url.replace('presenter-uat.html', 'max-voice-chas/manifest.json'));
    assert.equal(r.status(), 404, 'no voice files served by the site');
  });
  await check(`loading the folder keeps ${count} lines on this device`, async () => {
    await page.locator('#chasVoicePick').setInputFiles(PACK);
    await page.waitForFunction(n => window.__chasVoice.loaded === n, count, { timeout: 15000 });
    assert.match(await page.locator('#chasVoiceStatus').innerText(), new RegExp(`${count} lines loaded on this device only`));
  });
  await check('still loaded after reloading the page (this browser only)', async () => {
    await page.reload(); await page.waitForFunction(n => window.__chasVoice.loaded === n, count, { timeout: 15000 });
  });
  await check('a three-card reading: recorded clips where they exist, device voice for the rest, honest note', async () => {
    await page.evaluate(() => {
      state.spreadId = 'three'; state.spreadSize = 3; state.drawnCardIds = [0, 30, 50]; state.drawnAt = new Date().toISOString();
      state.view = 'draw'; state.drawSettled = true; state.drawPhase = 'settled';
      state.firstLayerClarifiers = []; state.clarifierReadingAt = null; state.additionalClarifierLayers = []; state.additionalClarifierReadingAt = null; render();
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor();
    const note = await page.locator('#mcVoice').innerText();
    assert.match(note, /^Chas's own recorded voice for \d+ of \d+ lines in this reading; the other \d+ use your device's synthetic voice\. Nothing is sent anywhere\.$/);
    await page.locator('#mcPlay').click();
    await page.waitForFunction(() => document.querySelector('.mc-player.is-finished'), null, { timeout: 60000 });
    const r = await page.evaluate(() => ({ played: window.__played.length, spoken: window.__spoken, clips: ResonatePresenter.buildScript().flatMap(p => p.clips.map(c => c.id)) }));
    const recorded = r.clips.filter(id => manifest.clips[id]);
    assert.equal(r.played, recorded.length, 'one recorded clip per recorded line');
    assert.equal(r.spoken.length, r.clips.length - recorded.length, 'device voice for every other line');
    assert.ok(r.played > 0 && r.spoken.length > 0);
    assert.ok(r.spoken.every(t => !/^The Fool\.$/.test(t)), 'a recorded line is never also spoken by the device');
    await page.locator('#mcClose').click();
  });
  await check('Stop mid-reading silences both voices', async () => {
    await page.locator('#mcOpen').click(); await page.locator('.mc-player').waitFor();
    await page.evaluate(() => { window.__played = []; window.__spoken = []; });
    await page.locator('#mcPlay').click(); await page.waitForTimeout(150);
    await page.locator('#mcClose').click();
    const before = await page.evaluate(() => window.__played.length + window.__spoken.length);
    await page.waitForTimeout(800);
    assert.equal(await page.evaluate(() => window.__played.length + window.__spoken.length), before);
  });
  await check('Forget my voice removes it from this browser', async () => {
    await page.locator('#chasVoiceForget').click();
    await page.waitForFunction(() => window.__chasVoice.loaded === 0);
    await page.reload(); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__chasVoice.loaded), 0);
  });
  await check('no page errors', async () => assert.deepEqual(errors, []));
  await browser.close(); server.close();
  if (fail.length) { console.error(fail.join('\n')); process.exit(1); }
  console.log(`PASS ${passed} chas-voice checks (${count} lines)`);
})();
