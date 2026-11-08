// Records a short video of clarifying inside Max at a Samsung size (412x915): the clarify bar, picking a card,
// Clarifier 1, "Add second clarifier", the Clarity card, the original/clarifier grouping, then Finish reading.
// Usage: NODE_PATH=<playwright> node audit/tools/max-lifecycle-demo.cjs <out-dir>
// Real app page and real code. A Celtic Cross led by The Fool; the deck's next three draws are fixed (The
// Hierophant, The Hermit, then Nine of Cups as the Clarity card) so every step appears. Speech is a silent stand-in that holds each caption ~0.9 s. No audio in the video.
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.resolve(process.argv[2]);
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const SAMPLE = { id: 'DEMO-CC', spread: 'celtic', base: [0, 41, 45, 50, 55, 60, 65, 70, 75, 30], reversed: [], steps: [], queue: [5, 9, 44] };
server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 412, height: 915 } } });
  await ctx.addInitScript(() => {
    const voices = [{ name: 'Device voice', lang: 'en-GB', localService: true }]; let t = null;
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, speak(u) { t = setTimeout(() => u.onend && u.onend(), 900); }, cancel() { clearTimeout(t); }, pause() {}, resume() {}, speaking: false }, configurable: true });
    window.SpeechSynthesisUtterance = class { constructor(x) { this.text = x; } };
  });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/presenter-uat.html`);
  await page.evaluate(s => { ResonateQA.load(s); const q = [...s.queue], o = window.ResonateDeck; window.ResonateDeck = { ...o, drawRemaining: (ids, used, n) => q.splice(0, n) }; }, SAMPLE);
  await page.waitForTimeout(1200);
  await page.locator('#mcFloat').tap(); await page.waitForSelector('.mc-player'); await page.waitForTimeout(1500);
  await page.locator('#mcPlay').tap(); await page.waitForTimeout(5000);           // a few lines of the first layer
  await page.locator('.mc-pick [data-pick="0"]').tap(); await page.waitForTimeout(1500);
  for (let k = 0; k < 3; k++) {                                                   // Clarifier 1, Clarifier 2, Clarity card
    await page.locator('#mcClarifyGo').tap();
    await page.waitForFunction(() => document.querySelector('.mc-player').classList.contains('is-finished'), null, { timeout: 60000 });
    await page.waitForTimeout(1500);
  }
  await page.locator('#mcFinish').tap();
  await page.waitForFunction(() => document.querySelector('.mc-player').classList.contains('is-finished'), null, { timeout: 60000 });
  await page.waitForTimeout(2000);
  const video = page.video(); await ctx.close();
  const webm = path.join(OUT, 'max-clarify-in-player-412.webm'); await video.saveAs(webm); await video.delete();
  fs.writeFileSync(path.join(OUT, 'recording.json'), JSON.stringify({ file: 'max-clarify-in-player-412.mp4', viewport: '412x915', sample: SAMPLE, errors }, null, 1));
  console.log('recorded', webm, errors.length ? 'ERRORS ' + errors.join('; ') : '');
  await browser.close(); server.close();
});
