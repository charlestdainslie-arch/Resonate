// Deep's interpretation evidence (Si Aye QA directive, 8 Nov 2026). For every case in the interpretation gate
// (tests/helpers/qa-matrix.cjs rows marked for Deep), renders its sample through the app on presenter-uat.html
// and writes audit/deep-handoff/<CASE>.md + <CASE>.json with:
//   the draw record (spread, positions and their meanings, cards with IDs, orientations, neighbours, clarifier
//   sequence, question flag), the card data each card was read from (upright and reversed), the full written
//   interpretation per position (revisions expanded), the Golden Thread, and Max's narration before and after
//   Finish reading.
// Usage: NODE_PATH=<playwright> HANDOFF_SHA=<app commit> node audit/tools/deep-handoff.cjs <out-dir>
// It refuses to run if any app file in this checkout differs from HANDOFF_SHA (audit/ and tests/ excepted),
// so the evidence is exactly that code's output.
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.resolve(process.argv[2] || 'audit/deep-handoff');
const SHA = process.env.HANDOFF_SHA;
if (!SHA) throw new Error('set HANDOFF_SHA to the app commit');
const drift = execFileSync('git', ['diff', '--name-only', SHA, '--', '.', ':!audit', ':!tests', ':!test-results'], { cwd: ROOT, encoding: 'utf8' }).trim();
if (drift) throw new Error('app files differ from ' + SHA + ':\n' + drift);
const FULL = execFileSync('git', ['rev-parse', SHA], { cwd: ROOT, encoding: 'utf8' }).trim();
const { SAMPLES, cards } = require(path.join(ROOT, 'tests/helpers/qa-samples.cjs'));
const MATRIX = require(path.join(ROOT, 'tests/helpers/qa-matrix.cjs'));
// LIVE_SAMPLES (optional): live-samples.json from audit/tools/clarity-live-record.cjs. Each <ID>-LIVE sample is the
// recorded draw after the seeker's real Clarity taps; it is shown before the sample it was recorded from, and the
// lines Max spoke on that run (LIVE_REPORT, clarity-live.json) are added to it.
const LIVE = process.env.LIVE_SAMPLES ? JSON.parse(fs.readFileSync(process.env.LIVE_SAMPLES, 'utf8')) : [];
const LIVE_RUN = process.env.LIVE_REPORT ? JSON.parse(fs.readFileSync(process.env.LIVE_REPORT, 'utf8')) : { cases: [] };
const { renderSample, AT } = require(path.join(ROOT, 'tests/helpers/qa-render.cjs'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
fs.mkdirSync(OUT, { recursive: true });

// BT-06 is an inline case in tests/boundary-matrix.browser.cjs; its full chain is fixed here so it has a record.
const INLINE = { 'BT-06': { id: 'BT-06', kind: 'boundary', spread: 'guidance', base: [16], reversed: [], steps: [{ pos: 0, layer: 1, id: 13 }, { pos: 0, layer: 2, id: 17 }], note: 'Contradictory clarifier: The Tower (Fire), Clarifier 1 Death (Water, contrary elements), then Clarifier 2 The Star; the earlier "together" must stay readable as Revision 1' } };
const CELTIC_PAIRS = [[0, 1, 'the situation and what crosses it'], [2, 4, 'what lies beneath and what you consciously aim for'], [3, 5, 'what is passing and what may be coming'], [6, 7, 'how you approach things and what surrounds you'], [8, 9, 'your hopes or fears and the possible outcome']];
const neighbours = (spread, n, i, labels) => {
  if (n === 1) return 'none (one-card reading)';
  if (spread === 'celtic') { const p = CELTIC_PAIRS.find(x => x[0] === i || x[1] === i); const j = p[0] === i ? p[1] : p[0]; return `pair partner ${j + 1} · ${labels[j]} (${p[2]}); adjacent ${[i - 1, i + 1].filter(k => k >= 0 && k < n).map(k => `${k + 1} · ${labels[k]}`).join(', ')}`; }
  return `adjacent ${[i - 1, i + 1].filter(k => k >= 0 && k < n).map(k => `${k + 1} · ${labels[k]}`).join(', ')}; the "wider spread" line names position ${i + 1 < n ? i + 2 : i}`;
};
const RUBRIC = {
  orientation: 'Each card is read with the meaning for its orientation (upright or reversed text from the card data below), and a reversed card is not merely the negation of its upright meaning.',
  position: 'The position lens names this position and reads the card through the position’s defined meaning (see the table), without drifting in time or role.',
  neighbours: 'The "wider spread" line relates the card to its pair partner (Celtic Cross) or neighbour (other spreads) without inventing a connection the data does not support.',
  clarifier1: 'Clarifier 1 is read as modifying the original card ("how it modifies the original card"), naming both, not as a separate definition.',
  clarifier2: 'Clarifier 2 develops the relationship between both earlier cards, naming all three.',
  synthesis: '"Together" is a synthesis of the cards, not a list; revisions are shown (Revision 1 kept readable when Clarifier 2 arrives; Revision 2 when the Clarity card arrives).',
  clarity: 'Option B (approved 7 Nov): a Clarity card appears only when the original and both clarifiers are Major, is a Minor not already in the reading, and is read as grounding the three Major cards; a Minor original with two Major clarifiers gets none and the limit is stated.',
  max: 'Max’s lines are the reading’s own words (quoted), in reading order; before Finish he invites and does not sign off; after Finish the closing comes once.',
  failure: 'Deep’s six failure modes: templating, positional drift, reverse-as-opposite, parallel clarification, concatenation instead of synthesis, numerical/symbolic overreach.'
};
const cardData = id => { const c = cards[id]; return { id, name: c.name, arcana: c.arcana, suit: c.suit || null, number: c.number, rank: c.rank || null, element: c.element, astrology: c.astrology, uprightKeywords: [...(c.uprightKeywords || [])], reversedKeywords: [...(c.reversedKeywords || [])], upright: c.upright, reversed: c.reversed }; };
const quote = t => t ? t.split('\n').map(l => l ? '> ' + l : '>').join('\n') : '> (none)';
const nm = c => c ? `${c.name} [ID ${c.id}, ${c.reversed ? 'reversed' : 'upright'}, ${c.arcana}, ${c.element}]` : '—';

server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const index = [];
  for (const row of MATRIX.filter(m => m.deep)) {
    const ids = row.sample.split(', ').filter(s => /^[A-Z]{1,2}\d{2}$|^[A-Z]{2}-\d{2}[A-Z]?$/.test(s));
    if (row.id === 'BT-06') ids.push('BT-06');
    for (const l of LIVE) { const k = ids.indexOf(l.liveOf); if (k >= 0) ids.splice(k, 0, l.id); }
    const entries = [];
    for (const sid of ids) {
      const sample = INLINE[sid] || LIVE.find(s => s.id === sid) || SAMPLES.find(s => s.id === sid);
      if (!sample) { entries.push({ sid, missing: true }); continue; }
      const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/presenter-uat.html');
      await page.evaluate(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} });
      const r = await renderSample(page, sample);
      await page.context().close();
      entries.push({ sid, sample, r, errors });
    }
    const md = [`# ${row.id} · interpretation evidence`, '',
      `**Case as written in the matrix:** ${row.text}`, row.diff ? `\n**Differences / notes:** ${row.diff}` : '', '',
      `**App code:** \`${FULL}\` (rendered from that code by \`audit/tools/deep-handoff.cjs\`, on presenter-uat.html at 412x915, reading time fixed at ${AT}).`, '',
      '## Acceptance criteria (for Deep to mark PASS / FAIL / BLOCKED with evidence)', '',
      ...Object.entries(RUBRIC).map(([k, v]) => `- **${k}:** ${v}`), '',
      ...entries.flatMap(({ sid, sample, r, errors, missing }) => missing ? [`## Sample ${sid}: NOT FOUND`, ''] : [
        `## Sample ${sid}${sample.note ? ` — ${sample.note}` : ''}`, '',
        ...(LIVE.some(l => l.liveOf === sid) ? [`> This is the recorded draw **before** the seeker's Clarity taps. The same draw after the taps is sample ${sid}-LIVE above.`, ''] : []),
        `- Spread: **${r.spreadName}** (\`${sample.spread}\`); ${r.positions.length} position(s). Question: ${sample.question ? 'Seven-card question reading flag ON (position 4 read last). The app records no question text.' : 'none (the app records no question text; question-reading flag off).'}`,
        `- Base card IDs (position order): [${sample.base.join(', ')}]; reversed IDs: [${sample.reversed.join(', ') || 'none'}].`,
        `- Clarifier sequence, in press order (position · layer = ID; layer 3 = Clarity card): ${sample.steps.map(s => `${s.pos + 1}·${s.layer}=${s.id}`).join(', ') || 'none'}. The app drew each with its own clarifyPosition(): ${r.drew.join(', ') || 'none'}.`,
        sample.live ? `- ${sample.live}.` : '',
        sample.seeded && sample.seeded.length ? `- Not named in the matrix, so drawn from a stated seeded shuffle: ${sample.seeded.join('; ')}.` : '',
        `- Rule check (clarifier-rules.js validate): ${r.valid.length ? 'VIOLATIONS ' + JSON.stringify(r.valid) : 'valid'}. Page errors: ${errors.length ? errors.join('; ') : 'none'}. Written order of positions: ${r.order.map(i => i + 1).join(', ')}.`, '',
        '### Draw record', '', '| # | Position | Position meaning | Original | Clarifier 1 | Clarifier 2 | Clarity card | Neighbours |', '|---|---|---|---|---|---|---|---|',
        ...r.positions.map((p, i) => `| ${p.n} | ${p.label} | ${p.meaning} | ${nm(p.base)} | ${nm(p.c1)} | ${nm(p.c2)} | ${nm(p.clarity)} | ${neighbours(sample.spread, r.positions.length, i, r.positions.map(x => x.label))} |`), '',
        '### Interpretation, per position (as the page shows it; revisions expanded)', '',
        ...r.order.flatMap(i => { const p = r.positions[i]; return [`#### ${p.n} · ${p.label}`, '', '**Original card**', quote(p.original), '', ...(p.clar1 ? ['**Clarifier 1**', quote(p.clar1), ''] : []), ...(p.clar2 ? ['**Clarifier 2**', quote(p.clar2), ''] : []), ...(p.clarityText ? ['**Clarity card**', quote(p.clarityText), ''] : []), ...(p.notes ? ['**Notes on the page**', quote(p.notes), ''] : []), ...(p.together ? ['**Together (with any earlier revisions)**', quote(p.together), ''] : [])]; }),
        '### Golden Thread (whole spread)', '', quote(r.goldenThread), '',
        '### Max: narration when opened, before Finish reading (captions are these lines)', '', ...r.script.map((l, k) => `${k + 1}. [${l.chapter} · ${l.kind}] ${l.text}`), '',
        '### Max: narration after Finish reading', '', ...r.scriptFinished.map((l, k) => `${k + 1}. [${l.chapter} · ${l.kind}] ${l.text}`), '',
        ...(() => { const run = sample.liveOf && LIVE_RUN.cases.find(c => c.sample === sample.liveOf); if (!run) return []; const ls = (h, a) => a.length ? [h, '', ...a.map((l, k) => `${k + 1}. ${l}`), ''] : []; return ['### Max on the live run (the words sent to the speech engine on the phone run that drew these cards; a transcript, not audio)', '', `Seeker taps: ${run.taps.map(t => `position ${t.position} via ${t.via} ("${t.buttonLabel}") drew ID ${t.drew}`).join('; ')}. Afterwards the Finish button read "${run.maxSpoken.finishButtonAfter}".`, '', ...ls("**Spoken when the seeker tapped Clarify inside Max**", run.maxSpoken.clarifyInMax), ...ls('**Spoken when the seeker played Max to the end, before Finish reading**', run.maxSpoken.playedBeforeFinish), ...ls('**Spoken after the seeker tapped Finish reading**', run.maxSpoken.afterFinish)]; })(),
        'Clarifying inside Max narrates the same lines for the new card (its chapter, for that position) followed by the invitation; they are a subset of the script above (tests/max-lifecycle.browser.cjs).', '',
        '### Card data each card was read from (data.js; provenance OPEN, see audit/sources/DATASET_NOTES.md)', '',
        ...[...new Set([...sample.base, ...sample.steps.map(s => s.id)])].map(cardData).flatMap(c => [`- **${c.name}** (ID ${c.id}; ${c.arcana}${c.suit ? ', ' + c.suit : ''}; number ${c.number ?? '—'}${c.rank ? ', ' + c.rank : ''}; element ${c.element}; astrology ${c.astrology})`, `  - Upright keywords: ${c.uprightKeywords.join(', ')}. Upright: ${c.upright}`, `  - Reversed keywords: ${c.reversedKeywords.join(', ')}. Reversed: ${c.reversed}`]), '']),
      ''].join('\n');
    fs.writeFileSync(path.join(OUT, `${row.id}.md`), md);
    fs.writeFileSync(path.join(OUT, `${row.id}.json`), JSON.stringify({ case: row.id, matrix: row.text, notes: row.diff || '', appCommit: FULL, readingAt: AT, rubric: RUBRIC, samples: entries.map(e => e.missing ? { id: e.sid, missing: true } : { id: e.sid, input: e.sample, errors: e.errors, output: e.r, cardData: [...new Set([...e.sample.base, ...e.sample.steps.map(s => s.id)])].map(cardData) }) }, null, 1));
    index.push({ id: row.id, samples: ids, errors: entries.flatMap(e => e.errors || []), missing: entries.filter(e => e.missing).map(e => e.sid) });
    console.log(row.id, ids.join(','), entries.some(e => e.missing) ? 'MISSING' : '', entries.some(e => (e.errors || []).length) ? 'ERRORS' : '');
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ appCommit: FULL, cases: index }, null, 1));
  await browser.close(); server.close();
});
