#!/usr/bin/env node
// Copy inventory for issue #10 and the wording review requested in #40.
// Evidence helper only: it reads git history and writes a report. It never edits app copy.
//
// What it does
//  1. Extracts every prose fragment the reading, Journal and PDF code can show
//     (string and template-literal text from the app's JavaScript, HTML tags stripped).
//  2. Checks which reference builds contain each fragment (production main, release/v0.91,
//     develop/v1.0-base, integration/astrology-uat, integration/full-product-uat, this build),
//     and finds the commit that first introduced it.
//  3. Lists fragments present in an earlier build but absent here (possible #10 losses),
//     each with the closest current fragment so a rewording can be told apart from a removal.
//  4. Compares card text in data.js card by card against the same builds.
//  5. Flags wording that may read as an absolute prediction, and attaches the proposed
//     replacements from tools/copy-proposals.json. Proposals are for owner review only.
//
// Usage: NODE_PATH=<dir with acorn, acorn-walk> node tools/copy-inventory.cjs [outDir]
// Writes <outDir>/COPY_INVENTORY.md and <outDir>/copy-inventory.json (default: repo root).
'use strict';
const {execFileSync} = require('child_process');
const fs = require('fs'), path = require('path'), vm = require('vm');
const acorn = require('acorn'), walk = require('acorn-walk');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || ROOT);
const git = (...a) => execFileSync('git', a, {cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28});

const REFS = [
  {key: 'main', ref: 'origin/main', label: 'production main'},
  {key: 'v091', ref: 'origin/release/v0.91', label: 'release/v0.91'},
  {key: 'base', ref: 'origin/develop/v1.0-base', label: 'develop/v1.0-base'},
  {key: 'cam', ref: 'origin/integration/astrology-uat', label: 'integration/astrology-uat (preview handed over for Cam)'},
  {key: 'full', ref: 'origin/integration/full-product-uat', label: 'integration/full-product-uat'},
  {key: 'here', ref: 'HEAD', label: 'this build'},
];
// Files whose text can appear in the landing → reading → clarifiers → Golden Thread → Journal → PDF journey.
// Motion/wiring modules are included so any visible text they add is caught too.
const SKIP = new Set(['data.js', 'deck-engine.js', 'tarot-catalogue.js']);

const ABSOLUTE = /\b(will|won't|always|never|certain(ly)?|definitely|guarantee[sd]?|destin(y|ed)|fated?|must|inevitabl[ey]|surely|doomed|without doubt|is going to|are going to)\b/i;
// Wording that is about the app's behaviour rather than a prediction. Shown, but not flagged.
const UI_CONTEXT = /(\bmust (be|load)\b|\bwill (appear here|show the sky)\b)|\b(this (reading|app|page|journal|device|browser|version)|saved|save|journal|download|pdf|button|tap|select|login|account|stored|storage|clarifiers? (are|is)|they never replace|do not replace|not a (fixed )?prediction|not a certainty|not guarantees)\b/i;

const norm = s => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&amp;|&middot;|&rarr;|&larr;/g, m => ({'&nbsp;': ' ', '&amp;': '&', '&middot;': '·', '&rarr;': '→', '&larr;': '←'}[m]))
  .replace(/\s+/g, ' ').trim();
const COMMON = /\b(the|a|an|and|or|to|of|in|on|at|that|this|these|your|you|with|for|is|are|as|it|its|may|what|toward|from|into|not|can|be|by)\b/;
// Lower-case runs without ordinary English words are usually CSS class lists or identifiers.
const looksLikeCode = s => /[{};]|=>|\bfunction\b|\.(js|css|jpg|png)\b/.test(s) || /^(https?:|#|\.)/.test(s) || (/^[a-z0-9-]+(\s[a-z0-9-]+)*$/.test(s) && !COMMON.test(s));

function fragments(src, file) {
  let ast;
  try { ast = acorn.parse(src, {ecmaVersion: 'latest', sourceType: 'script', locations: true, allowHashBang: true}); }
  catch { ast = acorn.parse(src, {ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true}); }
  const out = [];
  const push = (raw, node, fn) => {
    // Split around HTML tags so headings, labels and paragraphs become separate lines.
    for (const piece of raw.split(/<\/?(?:p|h[1-6]|span|strong|div|section|article|li|button|summary|label|small|figcaption|em|a)\b[^>]*>/i)) {
      const t = norm(piece);
      if ((t.match(/[A-Za-z]{2,}/g) || []).length < 4 || looksLikeCode(t)) continue;
      out.push({text: t, file, line: node.loc.start.line, fn});
    }
  };
  walk.ancestor(ast, {
    Literal(node, anc) { if (typeof node.value === 'string') push(node.value, node, fnName(anc)); },
    TemplateElement(node, anc) { push(node.value.cooked ?? node.value.raw, node, fnName(anc)); },
  });
  return out;
}
function fnName(anc) {
  for (let i = anc.length - 1; i >= 0; i--) {
    const n = anc[i];
    if (n.type === 'FunctionDeclaration' && n.id) return n.id.name;
    if ((n.type === 'VariableDeclarator') && n.id?.name) return n.id.name;
    if (n.type === 'Property' && n.key && (n.key.name || n.key.value)) return n.key.name || n.key.value;
    if (n.type === 'MethodDefinition' && n.key?.name) return n.key.name;
  }
  return '(top level)';
}
function filesAt(ref) {
  return git('ls-tree', '--name-only', ref).split('\n').filter(f => f.endsWith('.js') && !SKIP.has(f));
}
function textAt(ref) {
  const map = new Map();
  for (const f of filesAt(ref)) {
    for (const fr of fragments(git('show', `${ref}:${f}`), f)) if (!map.has(fr.text)) map.set(fr.text, fr);
  }
  return map;
}
function cardsAt(ref) {
  try {
    const ctx = {}; vm.createContext(ctx);
    vm.runInContext(git('show', `${ref}:data.js`) + ';this.__cards=cards', ctx, {timeout: 5000});
    return ctx.__cards;
  } catch (e) { return null; }
}
const words = s => new Set(s.toLowerCase().match(/[a-z']{3,}/g) || []);
function similarity(a, b) {
  const A = words(a), B = words(b); if (!A.size || !B.size) return 0;
  let n = 0; for (const w of A) if (B.has(w)) n++;
  return n / Math.max(A.size, B.size);
}
// First commit on this build's history that added the exact fragment to the file.
function firstCommit(fr) {
  const needle = fr.text.length > 70 ? fr.text.slice(0, 70) : fr.text;
  try {
    const out = git('log', '--reverse', '--format=%h|%ad|%s', '--date=short', '-S', needle, 'HEAD', '--', fr.file).trim().split('\n')[0];
    if (!out) return null; const [sha, date, ...s] = out.split('|'); return {sha, date, subject: s.join('|')};
  } catch { return null; }
}
const flagOf = t => ABSOLUTE.test(t) && !UI_CONTEXT.test(t) ? (t.match(ABSOLUTE) || [])[0] : null;

// ---------- run ----------
const proposalsPath = path.join(__dirname, 'copy-proposals.json');
const proposals = fs.existsSync(proposalsPath) ? JSON.parse(fs.readFileSync(proposalsPath, 'utf8')) : {};
const builds = {}, shas = {};
for (const r of REFS) { builds[r.key] = textAt(r.ref); shas[r.key] = git('rev-parse', '--short', r.ref).trim(); }
const here = builds.here;

const lines = [...here.values()].map(fr => {
  const inBuilds = REFS.filter(r => builds[r.key].has(fr.text)).map(r => r.key);
  return {...fr, inBuilds, firstCommit: firstCommit(fr), flag: flagOf(fr.text), proposal: proposals[fr.text] || null};
}).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

const hereTexts = [...here.keys()];
const removed = [];
for (const r of REFS.filter(r => r.key !== 'here')) {
  for (const [t, fr] of builds[r.key]) {
    if (here.has(t)) continue;
    const prior = removed.find(x => x.text === t);
    if (prior) { prior.inBuilds.push(r.key); continue; }
    let best = null, score = 0;
    for (const h of hereTexts) { const s = similarity(t, h); if (s > score) { score = s; best = h; } }
    removed.push({text: t, file: fr.file, fn: fr.fn, inBuilds: [r.key], closest: score >= 0.6 ? best : null, score: +score.toFixed(2), proposal: proposals[t] || null});
  }
}

// Card text
const TEXT_FIELDS = ['subtitle', 'upright', 'reversed', 'numerology', 'psychological', 'wuWei', 'wabiSabi', 'spiritual', 'symbolism', 'journalPrompt'];
const cardSets = Object.fromEntries(REFS.map(r => [r.key, cardsAt(r.ref)]));
const hereCards = cardSets.here || [];
const cardChanges = [];
for (const r of REFS.filter(r => r.key !== 'here')) {
  for (const old of cardSets[r.key] || []) {
    const now = hereCards.find(c => c.name === old.name);
    if (!now) { cardChanges.push({build: r.key, card: old.name, field: '(whole card)', change: 'missing here'}); continue; }
    for (const f of TEXT_FIELDS.concat(['uprightKeywords', 'reversedKeywords'])) {
      const a = JSON.stringify(old[f] ?? null), b = JSON.stringify(now[f] ?? null);
      if (a !== b) cardChanges.push({build: r.key, card: old.name, field: f, change: old[f] == null ? 'added here' : now[f] == null ? 'removed here' : 'changed', before: old[f], after: now[f]});
    }
  }
}
const cardFlags = [];
for (const c of hereCards) for (const f of TEXT_FIELDS) {
  const v = c[f]; if (typeof v !== 'string') continue;
  for (const s of v.split(/(?<=[.!?])\s+/)) { const w = flagOf(s); if (w) cardFlags.push({card: c.name, field: f, sentence: s, word: w, proposal: proposals[s] || null}); }
}

const data = {generated: new Date().toISOString(), shas, refs: REFS, lines, removed, cardCounts: Object.fromEntries(REFS.map(r => [r.key, (cardSets[r.key] || []).length])), cardChanges, cardFlags};
fs.writeFileSync(path.join(OUT, 'copy-inventory.json'), JSON.stringify(data, null, 1));

// ---------- markdown ----------
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tick = (k, arr) => arr.includes(k) ? '✓' : '·';
const md = [];
md.push('# RESONATE copy inventory (#10, #40)', '',
  `Generated by \`tools/copy-inventory.cjs\` on ${data.generated.slice(0, 10)}. **Evidence and proposals only. No app copy is changed on this branch. Nothing here is approved until Chas approves it.**`, '',
  '## Builds compared', '', '| Key | Build | Commit | Cards in data.js |', '|---|---|---|---|',
  ...REFS.map(r => `| ${r.key} | ${r.label} | \`${shas[r.key]}\` | ${data.cardCounts[r.key]} |`), '',
  '**Approval provenance:** no commit is recorded anywhere in the repo or the hub as Chas-approved content (see #10). The columns below show which builds carry each line, and the commit that first introduced it, so the owner can confirm which build is the approved baseline. Production `main` is the build that was live.', '',
  '## Summary', '',
  `- Prose lines the reading, Journal and PDF code can show in this build: **${lines.length}**.`,
  `- Of those, already in production \`main\`: **${lines.filter(l => l.inBuilds.includes('main')).length}**; added since: **${lines.filter(l => !l.inBuilds.includes('main')).length}**.`,
  `- Lines in an earlier build but not in this one: **${removed.length}** (${removed.filter(r => r.closest).length} look reworded, ${removed.filter(r => !r.closest).length} have no close match).`,
  `- Card text: ${hereCards.length} cards here; ${cardChanges.length} field differences against earlier builds.`,
  `- Wording flagged as possibly absolute: **${lines.filter(l => l.flag).length}** code lines, **${cardFlags.length}** card-text sentences. Proposed replacements: **${lines.filter(l => l.proposal).length + cardFlags.filter(c => c.proposal).length + removed.filter(r => r.proposal).length}**.`, '');

md.push('## 1. Proposed wording changes (for Chas to approve or reject)', '');
const props = [...lines.filter(l => l.proposal).map(l => ({where: `${l.file}:${l.line} \`${l.fn}\``, before: l.text, ...l.proposal})),
  ...cardFlags.filter(c => c.proposal).map(c => ({where: `data.js · ${c.card} · ${c.field}`, before: c.sentence, ...c.proposal})),
  ...removed.filter(r => r.proposal).map(r => ({where: `${r.file} \`${r.fn}\` (removed text, in ${r.inBuilds.join(', ')}; applies only if restored)`, before: r.text, ...r.proposal}))];
if (!props.length) md.push('_None._', '');
else { md.push('| # | Where | Before | Proposed after | Why |', '|---|---|---|---|---|'); props.forEach((p, i) => md.push(`| P${i + 1} | ${esc(p.where)} | ${esc(p.before)} | ${esc(p.after)} | ${esc(p.why)} |`)); md.push(''); }

md.push('## 2. Possible losses: in an earlier build, not in this one', '',
  'Where the closest current line is shown, the text was most likely reworded rather than removed. Lines with no close match need an owner decision under #10.', '',
  '| Was in | Where it was | Earlier text | Closest current text (match) |', '|---|---|---|---|');
for (const r of removed.sort((a, b) => (a.closest ? 1 : 0) - (b.closest ? 1 : 0) || a.file.localeCompare(b.file)))
  md.push(`| ${r.inBuilds.join(', ')} | ${esc(r.file)} \`${esc(r.fn)}\` | ${esc(r.text)} | ${r.closest ? esc(r.closest) + ` (${r.score})` : '**no close match**'} |`);
md.push('');

md.push('## 3. Card text compared with earlier builds', '');
const byBuild = {};
for (const c of cardChanges) (byBuild[c.build] ||= []).push(c);
for (const r of REFS.filter(r => r.key !== 'here')) {
  const list = byBuild[r.key] || [];
  md.push(`**${r.label}** (${data.cardCounts[r.key]} cards): ${list.length ? list.length + ' differences' : 'no differences for cards it shares with this build'}.`, '');
  if (list.length && list.length <= 60) {
    md.push('| Card | Field | Change | Before | After |', '|---|---|---|---|---|');
    for (const c of list) md.push(`| ${esc(c.card)} | ${c.field} | ${c.change} | ${esc(Array.isArray(c.before) ? c.before.join(', ') : c.before)} | ${esc(Array.isArray(c.after) ? c.after.join(', ') : c.after)} |`);
    md.push('');
  } else if (list.length) md.push(`_${list.length} differences; full list in copy-inventory.json._`, '');
}

md.push('## 4. Card-text sentences flagged as possibly absolute', '');
if (!cardFlags.length) md.push('_None._', '');
else { md.push('| Card | Field | Word | Sentence |', '|---|---|---|---|'); for (const c of cardFlags) md.push(`| ${esc(c.card)} | ${c.field} | ${c.word} | ${esc(c.sentence)} |`); md.push(''); }

md.push('## 5. Full line-by-line inventory of this build', '',
  `Columns: ${REFS.map(r => r.key).join(' · ')} (✓ = line present in that build). ⚑ = flagged wording.`, '',
  `| File:line | Function | ${REFS.map(r => r.key).join(' | ')} | First added | Text |`, `|---|---|${REFS.map(() => '---').join('|')}|---|---|`);
for (const l of lines) md.push(`| ${l.file}:${l.line} | \`${esc(l.fn)}\` | ${REFS.map(r => tick(r.key, l.inBuilds)).join(' | ')} | ${l.firstCommit ? `\`${l.firstCommit.sha}\` ${l.firstCommit.date}` : '?'} | ${l.flag ? '⚑ ' : ''}${esc(l.text)} |`);
md.push('');
fs.writeFileSync(path.join(OUT, 'COPY_INVENTORY.md'), md.join('\n'));
console.log(JSON.stringify({lines: lines.length, removed: removed.length, reworded: removed.filter(r => r.closest).length, cardChanges: cardChanges.length, flagged: lines.filter(l => l.flag).length, cardFlags: cardFlags.length, cardCounts: data.cardCounts}));
