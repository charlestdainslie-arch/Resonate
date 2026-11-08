// Before / after comparison of the interpretation (Si Aye directive, 9 Nov 2026, item 6.5): each sample is
// rendered through the app on two clean checkouts, BEFORE_ROOT (the code Deep audited) and AFTER_ROOT (the
// corrected code), with the same cards, orientations and clarifiers (qa-loader.js), and the "Together" text
// per clarified position, the Golden Thread and Max's narration after Finish are written side by side.
// Usage: NODE_PATH=<playwright> BEFORE_ROOT=<dir> BEFORE_SHA=<sha> AFTER_ROOT=<dir> AFTER_SHA=<sha> \
//          [LIVE_SAMPLES=<live-samples.json>] node audit/tools/before-after.cjs <out-dir> <sample ids...>
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2]); fs.mkdirSync(OUT, { recursive: true });
const IDS = process.argv.slice(3);
const { SAMPLES } = require(path.join(__dirname, '..', '..', 'tests', 'helpers', 'qa-samples.cjs'));
const { renderSample } = require(path.join(__dirname, '..', '..', 'tests', 'helpers', 'qa-render.cjs'));
const LIVE = process.env.LIVE_SAMPLES ? JSON.parse(fs.readFileSync(process.env.LIVE_SAMPLES, 'utf8')) : [];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const serve = root => new Promise(ok => { const s = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }); s.listen(0, '127.0.0.1', () => ok(s)); });
const quote = t => t ? t.split('\n').map(l => l ? '> ' + l : '>').join('\n') : '> (none)';

(async () => {
  const sides = [['Before', process.env.BEFORE_ROOT, process.env.BEFORE_SHA], ['After', process.env.AFTER_ROOT, process.env.AFTER_SHA]];
  const servers = await Promise.all(sides.map(([, root]) => serve(path.resolve(root))));
  const browser = await chromium.launch();
  const index = [];
  for (const id of IDS) {
    const sample = LIVE.find(s => s.id === id) || SAMPLES.find(s => s.id === id);
    if (!sample) throw new Error('no sample ' + id);
    const got = [];
    for (let k = 0; k < 2; k++) {
      const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
      await page.goto(`http://127.0.0.1:${servers[k].address().port}/presenter-uat.html`);
      await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
      got.push(await renderSample(page, sample)); await page.close();
    }
    const [b, a] = got;
    const md = [`# ${id} · interpretation before and after`, '', sample.note ? `_${sample.note}_` : '', '',
      `- **Before:** \`${sides[0][2]}\` (the code Deep audited). **After:** \`${sides[1][2]}\` (corrected).`,
      `- Same input on both: ${b.spreadName}; base [${sample.base.join(', ')}], reversed [${sample.reversed.join(', ') || 'none'}], clarifiers ${sample.steps.map(s => `${s.pos + 1}·${s.layer}=${s.id}`).join(', ') || 'none'}.`, '',
      '## "Together", per clarified position', '',
      ...a.positions.flatMap((p, i) => (p.synthesisLead || b.positions[i].synthesisLead) ? [`### ${p.n} · ${p.label}: ${[p.base, p.c1, p.c2, p.clarity].filter(Boolean).map(c => c.name + (c.reversed ? ' (reversed)' : '')).join(' + ')}`, '', '**Before**', '', quote(b.positions[i].synthesisLead), '', '**After**', '', quote(p.synthesisLead), ''] : []),
      '## Golden Thread', '', '**Before**', '', quote(b.goldenThread), '', '**After**', '', quote(a.goldenThread), '',
      '## Max after Finish reading: the final synthesis and close', '', '**Before**', '', ...b.scriptFinished.filter(l => ['final', 'close'].includes(l.chapter)).map((l, n) => `${n + 1}. ${l.text}`), '', '**After**', '', ...a.scriptFinished.filter(l => ['final', 'close'].includes(l.chapter)).map((l, n) => `${n + 1}. ${l.text}`), ''].join('\n');
    fs.writeFileSync(path.join(OUT, `${id}.md`), md);
    index.push({ id, before: sides[0][2], after: sides[1][2], togetherChanged: a.positions.filter((p, i) => p.synthesisLead !== b.positions[i].synthesisLead).length, threadChanged: a.goldenThread !== b.goldenThread });
    console.log(id, JSON.stringify(index[index.length - 1]));
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close(); servers.forEach(s => s.close());
})();
