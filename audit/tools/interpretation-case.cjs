// Renders one fixed clarifier case through the real app page (presenter-uat.html) and writes exactly what the
// reading says and what Max says, so an interpretation reviewer (Deep) can compare it with a worked case.
// It is a rendering of the current engine, not evidence that the engine is right.
// Usage: NODE_PATH=<playwright> node audit/tools/interpretation-case.cjs <out.md> [spread] [position]
//   default: Deep's case (Si Aye, 7 Nov, decision 8): Seven of Cups, Clarifier 1 The Hermit reversed,
//   Clarifier 2 Eight of Pentacles, in a one-card Guidance reading (no other cards, so no filler).
//   With spread=celtic and position=1..10 the case sits in that Celtic Cross position, and the other nine
//   positions are filled with the first unused Minor Arcana cards in deck order (stated in the output).
'use strict';
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const [outFile, spread = 'guidance', posArg = '1'] = process.argv.slice(2);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.setHeader('Content-Type', T[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
const CASE = { base: 'Seven of Cups', c1: 'The Hermit', c1Reversed: true, c2: 'Eight of Pentacles' };
server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/presenter-uat.html`);
  const result = await page.evaluate(({ CASE, spread, pos }) => {
    const id = n => cards.find(c => c.name === n).id;
    const b = id(CASE.base), c1 = id(CASE.c1), c2 = id(CASE.c2);
    state.spreadId = spread; state.spreadSize = currentSpread().positions.length;
    const n = state.spreadSize, at = '2026-11-07T00:00:00.000Z';
    const filler = cards.filter(c => c.arcana !== 'Major' && ![b, c1, c2].includes(c.id)).map(c => c.id);
    const drawn = Array.from({ length: n }, (_, i) => i === pos ? b : filler.shift());
    Object.assign(state, { drawnCardIds: drawn, drawnAt: at, view: 'draw', drawSettled: true, drawPhase: 'settled', journalId: null, readingAstrology: null, openingDice: null,
      drawnOrientations: { readingAt: at, reversed: CASE.c1Reversed ? [c1] : [] },
      clarifierReadingAt: at, firstLayerClarifiers: drawn.map((_, i) => i === pos ? c1 : null),
      additionalClarifierReadingAt: at, additionalClarifierLayers: [{ number: 2, cards: drawn.map((_, i) => i === pos ? c2 : null) }] });
    render();
    const art = document.querySelector(`.reading-meaning[data-position="${pos}"]`);
    art.querySelectorAll('details').forEach(d => { d.open = true; });   // include earlier revisions in the output
    const block = sel => [...art.querySelectorAll(sel)].map(e => e.innerText.trim()).join('\n\n');
    const script = ResonatePresenter.buildScript().filter(p => p.show?.includes('p' + pos) && p.chapter !== 'close').map(p => `[${p.chapter} · ${p.kind}] ${p.text}`);
    return {
      position: positionLabels()[pos], spreadName: currentSpread().name,
      others: drawn.map((d, i) => i === pos ? null : `${i + 1}. ${positionLabels()[i]}: ${cards.find(c => c.id === d).name}`).filter(Boolean),
      original: block('.original-card-explanation'), first: block('.integrated-clarifier[data-clarifier="1"]'),
      second: block('.integrated-clarifier[data-clarifier="2"]'), notes: block('.reading-pending, .reading-limit'),
      together: block('.combined-meaning'), valid: ResonateClarifiers.validate(drawn.map(x => cards.find(c => c.id === x)), state.firstLayerClarifiers, state.additionalClarifierLayers[0].cards, x => cards.find(c => c.id === x)),
      script
    };
  }, { CASE, spread, pos: Number(posArg) - 1 });
  const md = `# Interpretation case: ${CASE.base} · ${CASE.c1}${CASE.c1Reversed ? ' (reversed)' : ''} · ${CASE.c2}

Source case: Deep's worked example (Si Aye PM response, 7 Nov 2026, decision 8). This file is the current
engine's output for comparison. It is **not** evidence that the engine passes; Deep's validation decides.

- Spread: ${result.spreadName}; position ${posArg} · ${result.position}
- Original: ${CASE.base} (upright). Clarifier 1: ${CASE.c1}${CASE.c1Reversed ? ', reversed' : ''}. Clarifier 2: ${CASE.c2} (upright).
- Under Chas's teaching rule: ${CASE.base} is a Minor card, so Clarifier 1 is the seeker's choice; ${CASE.c1} is a Major, so Clarifier 2 is due. Rule check: ${result.valid.length ? 'VIOLATIONS ' + JSON.stringify(result.valid) : 'valid'}.
${result.others.length ? `- Other positions (filler: first unused Minor Arcana cards in deck order, not drawn):\n${result.others.map(o => '  - ' + o).join('\n')}\n` : '- No other cards in this reading.\n'}- Rendered from presenter-uat.html at commit ${process.env.CASE_SHA || '(see git log)'}; page errors: ${errors.length ? errors.join('; ') : 'none'}.

## 1 · Original card
${result.original}

## 2 · Clarifier 1
${result.first}

## 3 · Clarifier 2
${result.second}
${result.notes ? `\n## Notes\n${result.notes}\n` : ''}
## 4 · Together
${result.together}

## What Max says for this position (captions are these lines)
${result.script.map(l => '- ' + l).join('\n')}
`;
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, md);
  console.log('wrote', outFile, errors.length ? 'ERRORS' : '');
  await browser.close(); server.close();
});
