// Writes the reading-engine QA samples (Si Aye, 7 Nov 2026) for Deep and Si Aye.
// Usage: NODE_PATH=<playwright> QA_SHA=<commit> node audit/tools/qa-samples.cjs <out-dir>
// For each sample in tests/helpers/qa-samples.cjs: <id>.md (readable) and <id>.json (everything), rendered
// through the app on presenter-uat.html at a 412×915 phone size; plus README.md (index + QA matrix with
// empty PASS / FAIL / BLOCKED columns for Deep) and samples.json (all inputs).
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.resolve(process.argv[2] || 'audit/qa-samples');
const { SAMPLES } = require(path.join(ROOT, 'tests/helpers/qa-samples.cjs'));
const { renderSample, AT } = require(path.join(ROOT, 'tests/helpers/qa-render.cjs'));
const SHA = process.env.QA_SHA || '(working tree)';
const PREVIEW = process.env.QA_PREVIEW || '';
// Automated result per sample, read from an unedited tests/reading-engine-qa.browser.cjs log when given.
const testLog = process.env.QA_TESTLOG && fs.existsSync(process.env.QA_TESTLOG) ? fs.readFileSync(process.env.QA_TESTLOG, 'utf8') : '';
const auto = id => { if (!testLog) return 'not run with this file'; const m = testLog.match(new RegExp(`^(PASS|FAIL)\\s+${id} `, 'm')); return m ? m[1] : 'not in log'; };
const crypto = require('crypto');
const dataSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'data.js'))).digest('hex');
const { cards } = require(path.join(ROOT, 'tests/helpers/qa-samples.cjs'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
fs.mkdirSync(OUT, { recursive: true });
const orient = c => c ? `${c.name} [id ${c.id}${c.reversed ? ', reversed' : ''}; ${c.arcana}; ${c.element}]` : '—';
const quote = t => t ? t.split('\n').map(l => l ? '> ' + l : '>').join('\n') : '> (none)';

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const index = [];
  for (const s of SAMPLES) {
    const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/presenter-uat.html');
    await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
    const r = await renderSample(page, s);
    const sameAsTranscript = JSON.stringify(r.script.map(p => p.text)) === JSON.stringify(r.transcript);
    const seq = s.steps.map(st => `${st.pos + 1}·C${st.layer}=${st.id}`).join(', ') || 'none';
    const md = [`# ${s.id} · ${r.spreadName} · ${s.kind === 'baseline' ? `seed ${s.seed}, ${s.mode}` : 'boundary'}`, '',
      `${s.note}.`, '',
      `- Commit: ${SHA}. Reading time fixed at ${AT}. Rendered on presenter-uat.html, 412×915. Page errors: ${errors.length ? errors.join('; ') : 'none'}.`,
      `- Inputs: base IDs [${s.base.join(', ')}]; reversed IDs [${s.reversed.join(', ') || 'none'}]; clarifier sequence (position·layer=ID, in press order): ${seq}.`,
      `- The app drew each clarifier itself with clarifyPosition(); steps it took: ${r.drew.join(', ') || 'none'}. Rule check (clarifier-rules.js validate): ${r.valid.length ? 'VIOLATIONS ' + JSON.stringify(r.valid) : 'valid'}.`,
      `- Max: ${r.script.length} lines; player transcript identical to the script: ${sameAsTranscript ? 'yes' : 'NO'}. Captions show these same lines one at a time (tests/presenter.browser.cjs checks captions in step).`, '',
      '## Positions', '', '| # | Position | Original | Clarifier 1 | Clarifier 2 | Notes |', '|---|---|---|---|---|---|',
      ...r.positions.map(p => `| ${p.n} | ${p.label} | ${orient(p.base)} | ${orient(p.c1)} | ${orient(p.c2)} | ${[p.pending ? 'Clarifier 2 due' : '', p.limit ? 'two-clarifier limit' : ''].filter(Boolean).join('; ') || ''} |`), '',
      ...r.positions.flatMap(p => [`## ${p.n} · ${p.label}`, `_Position meaning: ${p.meaning}._`, '',
        '### Original card', quote(p.original), '',
        ...(p.clar1 ? ['### Clarifier 1', quote(p.clar1), ''] : []),
        ...(p.clar2 ? ['### Clarifier 2', quote(p.clar2), ''] : []),
        ...(p.notes ? ['### Notes', quote(p.notes), ''] : []),
        ...(p.together ? ['### Together', quote(p.together), ''] : [])]),
      '## Golden Thread (whole spread)', quote(r.goldenThread), '',
      '## Max Chasroom: narration and caption transcript', '', ...r.script.map((p, i) => `${i + 1}. [${p.chapter} · ${p.kind}] ${p.text}`), ''].join('\n');
    fs.writeFileSync(path.join(OUT, `${s.id}.md`), md);
    fs.writeFileSync(path.join(OUT, `${s.id}.json`), JSON.stringify({ sample: s, commit: SHA, readingAt: AT, errors, ...r }, null, 1));
    index.push({ s, r, errors, sameAsTranscript });
    console.log(s.id, r.positions.length, 'positions', s.steps.length, 'clarifiers', errors.length ? 'ERRORS' : '', sameAsTranscript ? '' : 'TRANSCRIPT MISMATCH');
    await page.context().close();
  }
  const cover = x => x.r.positions;
  const row = ({ s, r }) => {
    const ps = cover({ r });
    const rev = ps.flatMap(p => [p.base, p.c1, p.c2]).filter(c => c && c.reversed).length;
    const maj = ps.filter(p => p.base.arcana === 'Major').length;
    return `| [${s.id}](${s.id}.md) | ${r.spreadName} | ${s.kind === 'baseline' ? s.mode : 'boundary'} | ${ps.length} | ${maj} | ${rev} | ${s.steps.filter(x => x.layer === 1).length} | ${s.steps.filter(x => x.layer === 2).length} | ${ps.filter(p => p.limit).length} | ${r.valid.length ? 'NO' : 'yes'} | ${auto(s.id)} | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev on Samsung | \`?qa=${s.id}\` |`;
  };
  const readme = [`# Reading-engine QA samples`, '',
    `Si Aye's full reading engine QA directive, 7 Nov 2026. Commit **${SHA}**. Generated by \`audit/tools/qa-samples.cjs\`; inputs in \`tests/helpers/qa-samples.cjs\` (seeded with mulberry32, or written out by hand for boundaries). Regenerate: \`NODE_PATH=<playwright> QA_SHA=<sha> node audit/tools/qa-samples.cjs audit/qa-samples\`. The same samples are checked automatically by \`tests/reading-engine-qa.browser.cjs\`.`, '',
    'These files show what the engine says. They are not evidence that it is right: the PASS / FAIL / BLOCKED columns are for Deep.', '',
    '**Where each part of the text comes from** (for judging "templated" or "unsupported"):',
    '- Card data (`data.js`): meaning, keywords, symbolism, correspondences, numerology, Tao/Jungian lenses, written connections. Provenance gaps are listed in `audit/sources/` and remain OPEN.',
    '- Position lens (`positionContext` in app.js): a template filled with the card\'s keywords and the position\'s role.',
    '- Clarifier relationships and "Together" (`clarifier-reading.js`): generated by rule from element, suit, number, orientation, Major/Minor and court rank; labelled on the page as RESONATE\'s method.',
    '- Golden Thread: `goldenThread()` in app.js (keywords, correspondences, written connections, numerology).', '',
    `Preview: ${PREVIEW ? PREVIEW + '?qa=<ID>' : 'presenter-uat.html?qa=<ID>'} opens the sample (qa-loader.js, the same loader the tests use).`, '',
    'Status columns: **Automated** = the mechanical checks in tests/reading-engine-qa.browser.cjs (structure, rule, Max transcript, reproducibility), from the unedited log of the run at this commit; it says nothing about interpretive quality. **Interpretation** and **Samsung audio** stay BLOCKED until Deep and Dev record a result with evidence. Nothing is marked PASS on their behalf.', '',
    '| Sample | Spread | Mode | Cards | Majors | Reversed (incl. clarifiers) | Clarifier 1s | Clarifier 2s | At limit | Rule valid | Automated (Claude) | Interpretation (Deep) | Samsung audio + captions (Dev) | Preview |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|', ...index.map(row), '',
    `## Card registry check`, '', `Every ID below was resolved from \`data.js\` (sha256 ${dataSha}), the 78-card registry: IDs 0–77, Majors 0–21 (checked by tests/qa-samples.test.cjs).`, '',
    '| ID | Name | Arcana | Element | Used in |', '|---|---|---|---|---|',
    ...[...new Set(SAMPLES.flatMap(s => [...s.base, ...s.steps.map(x => x.id)]))].sort((a, b) => a - b).map(id => `| ${id} | ${cards[id].name} | ${cards[id].arcana} | ${cards[id].element} | ${SAMPLES.filter(s => [...s.base, ...s.steps.map(x => x.id)].includes(id)).map(s => s.id).join(', ')} |`), '',
    `Page errors across all samples: ${index.some(x => x.errors.length) ? 'YES (see files)' : 'none'}. Max transcript identical to script in every sample: ${index.every(x => x.sameAsTranscript) ? 'yes' : 'NO'}.`, ''].join('\n');
  fs.writeFileSync(path.join(OUT, 'README.md'), readme);
  fs.writeFileSync(path.join(OUT, 'samples.json'), JSON.stringify(SAMPLES, null, 1));
  await browser.close(); server.close();
});
