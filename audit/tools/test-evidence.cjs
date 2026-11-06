// Writes audit/builds/TEST_EVIDENCE.md from a run directory produced by run-all-tests.sh.
// Usage: node audit/tools/test-evidence.cjs audit/builds/test-run-<sha>
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const env = Object.fromEntries(fs.readFileSync(path.join(dir, 'environment.txt'), 'utf8').trim().split('\n').map(l => l.split(/=(.*)/s).slice(0, 2)));
const rows = fs.readFileSync(path.join(dir, 'summary.tsv'), 'utf8').trim().split('\n').slice(1).map(l => { const [suite, command, exit, seconds] = l.split('\t'); return { suite, command, exit: Number(exit), seconds }; });
const PAGE = { 'astrology-journey.browser': 'index.html', 'chas-voice.browser': 'index.html + presenter-uat.html', 'clarifier-slots.browser': 'index.html',
  'coverage-gaps.browser': 'index.html', 'golden-thread-connector.browser': 'golden-thread-connector/demo.html', 'navigation-a11y.browser': 'index.html',
  'page-end-nav.browser': 'index.html', 'presenter.browser': 'index.html + presenter-uat.html', 'reduced-motion-headings.browser': 'index.html',
  'reversed-clarifier-turn.browser': 'index.html + presenter-uat.html', 'spread-layout-with-thread.browser': 'index.html + presenter-uat.html',
  'spread-parity.browser': 'index.html', 'teaching-rules.browser': 'index.html', 'uat-round1.browser': 'index.html', 'browser-uat': 'index.html', 'unit-all': '— (Node, no browser)' };
const NEW = new Set(['reversed-clarifier-turn.browser', 'spread-layout-with-thread.browser']);
const result = r => { const log = fs.readFileSync(path.join(dir, r.suite + '.log'), 'utf8');
  if (r.suite === 'unit-all') { const p = /# pass (\d+)/.exec(log), t = /# tests (\d+)/.exec(log); return `${p && p[1]}/${t && t[1]} pass`; }
  const m = log.match(/(\d+)\/(\d+) passed/) || log.match(/PASS (\d+) [^\n]*/);
  const last = (log.match(/^(PASS|FAIL)[^\n]*$/gm) || []).slice(-1)[0] || '';
  return m ? (m[2] ? `${m[1]}/${m[2]} pass` : m[0].slice(0, 110)) : last.slice(0, 110); };
const syntax = rows.filter(r => r.suite.startsWith('syntax-'));
const rest = rows.filter(r => !r.suite.startsWith('syntax-'));
const ok = rest.filter(r => r.exit === 0).length;
let md = `# Test evidence — tested SHA \`${env.sha}\`

All results below were **run by Claude** in a Linux workspace (headless Chromium via Playwright). **None has been independently reproduced yet.**

| | |
|---|---|
| Tested SHA | \`${env.sha}\` (uncommitted non-audit changes at run time: ${env.uncommitted_non_audit_changes}) |
| Node / Playwright | ${env.node} / ${env.playwright} |
| OS | ${env.os} |
| Run (UTC) | ${env.started} → ${env.finished} |
| Raw logs | \`${path.basename(dir)}/<suite>.log\`, table \`summary.tsv\` |

**Syntax checks (CI step):** ${syntax.filter(r => r.exit === 0).length}/${syntax.length} files pass \`node --check\`.

**Suites:** ${ok}/${rest.length} exit 0.

| Suite | Page under test | Exit | Result | Seconds |
|---|---|---|---|---|
${rest.map(r => `| \`${r.suite}\`${NEW.has(r.suite) ? ' *(new, this audit)*' : ''} | ${PAGE[r.suite] || '?'} | ${r.exit} | ${result(r).replace(/\|/g, '/')} | ${r.seconds} |`).join('\n')}

## How to reproduce

Prerequisites: Git, Node 22, and Playwright with Chromium.

\`\`\`bash
git clone -b claude/uat-all-in-one https://github.com/charlestdainslie-arch/resonate && cd resonate
git checkout ${env.sha}
npm i --no-save playwright pdfjs-dist && npx playwright install chromium
# CI's exact unit step
node --test tests/*.test.cjs
# Everything, with logs and a summary table
bash audit/tools/run-all-tests.sh /tmp/resonate-run
# The three sample readings (deterministic draws; seeds in each draw-record.json)
node audit/tools/sample-readings.cjs
# The 78-card export
node audit/tools/export-dataset.cjs
\`\`\`

No test needs network access. Expect timing-sensitive suites (animations) to take ~1 minute each.

## Status by origin

| Origin | What |
|---|---|
| **Run by Claude** | Everything in the table above; the three sample readings; the dataset export |
| **Independently reproduced** | Nothing yet |
| **Not yet executed** | Real devices (Android/iOS), Safari and Firefox, the Vercel preview for this SHA, Chas's recorded-voice path in Max, Seven V / Relationship sample readings |

## Baseline on the handed-over candidate \`4c37890\` (before the fixes)

- Unit: **74/77**; 3 failed in \`visible-clarifier.test.cjs\` (\`orientCards is not defined\`, test harness; finding D3).
- Browser (partial run, stopped by my own per-suite time cap during \`spread-parity\`): astrology-journey, chas-voice, clarifier-slots, coverage-gaps, golden-thread-connector (27/27), navigation-a11y, page-end-nav, presenter (51), reduced-motion-headings all exit 0. Note \`clarifier-slots\` passed there only because defect D1 made reversed clarifiers finish upright.
`;
fs.writeFileSync(path.join(path.dirname(dir), 'TEST_EVIDENCE.md'), md);
console.log(md.split('\n').slice(0, 40).join('\n'));
