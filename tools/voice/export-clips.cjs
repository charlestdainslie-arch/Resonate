// Lists every line Max Chasroom can say, as [{id, text, spoken}], by running the presenter's own
// buildScript() over every card as the main card and as both clarifiers.
// Usage: node tools/voice/export-clips.cjs [--demo] > clips.json
//   --demo  only the lines the demonstration reading needs (a quick trial batch).
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..', '..');
const port = 8783;
const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json' };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.setHeader('Content-Type', types[path.extname(file).slice(1)] || 'application/octet-stream'); res.end(b); });
});
// What the voice model is given: the caption text with symbols said the way a person would say them.
const spoken = text => text.replace(/ · /g, ', ').replace(/ — /g, ', ');

(async () => {
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(['http:', '', '127.0.0.1:' + port, 'presenter-uat.html'].join('/'));
  await page.waitForFunction(() => window.ResonatePresenter);
  const demoOnly = process.argv.includes('--demo');
  const clips = await page.evaluate(demoOnly => {
    const found = new Map();
    const collect = () => ResonatePresenter.buildScript().forEach(part => part.clips.forEach(c => found.set(c.id, c.text)));
    collect(); // the demo reading, as loaded
    if (!demoOnly) {
      const at = '2026-10-28T12:00:00.000Z';
      for (const card of cards) {
        const next = n => cards[(cards.indexOf(card) + n) % cards.length].id;
        Object.assign(state, { spreadId: 'guidance', spreadSize: 1, drawnCardIds: [card.id], drawnAt: at, journalId: null, journalSpread: null,
          clarifierReadingAt: at, firstLayerClarifiers: [next(1)], additionalClarifierReadingAt: at, additionalClarifierLayers: [{ number: 2, cards: [next(2)] }] });
        collect();
      }
    }
    return [...found].map(([id, text]) => ({ id, text }));
  }, demoOnly);
  // "yours" is only said for a real reading, so the demo pass needs it added.
  const frames = await page.evaluate(() => ResonatePresenter.FRAME);
  for (const key of Object.keys(frames)) if (!clips.some(c => c.id === 'frame-' + key)) clips.push({ id: 'frame-' + key, text: frames[key] });
  process.stdout.write(JSON.stringify(clips.sort((a, b) => a.id.localeCompare(b.id)).map(c => ({ ...c, spoken: spoken(c.text) })), null, 1) + '\n');
  await browser.close();
  server.close();
})();
