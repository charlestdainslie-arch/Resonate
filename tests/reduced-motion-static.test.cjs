// Static guard: no hard-coded smooth scrolling and no un-gated shuffle delay.
// Runs in the existing `node --test tests/*.test.cjs` CI step; no browser needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const runtime = fs.readdirSync(root).filter(f => f.endsWith('.js'));

test('no runtime script hard-codes behavior:\'smooth\' outside the scrollMotion helper', () => {
  const offenders = [];
  for (const file of runtime) {
    read(file).split('\n').forEach((line, i) => {
      if (/behavior\s*:\s*['"]smooth['"]/.test(line)) offenders.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], 'Use behavior:scrollMotion() so prefers-reduced-motion is honoured');
});

test('scrollMotion helper returns auto when reduced motion is requested', () => {
  const src = read('app.js');
  assert.match(src, /function reducedMotion\(\)/);
  assert.match(src, /function scrollMotion\(\)\{ return reducedMotion\(\)\?'auto':'smooth'; \}/);
});

test('shuffle lock is skipped under reduced motion', () => {
  assert.match(read('reading-stage.js'), /reducedMotion\(\)\?0:900/);
});

test('heading labels do not use overflow-wrap:anywhere as the final rule', () => {
  const css = read('uat-fixes.css');
  const tail = css.slice(css.lastIndexOf('/* Heading wrap'));
  assert.ok(tail.length > 20, 'heading-wrap block present at end of uat-fixes.css');
  assert.match(tail, /overflow-wrap:break-word/);
  assert.match(tail, /hyphens:auto/);
});
