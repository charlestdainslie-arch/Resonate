// QA samples (Si Aye, 7 Nov 2026): inputs resolve to the 78-card registry (data.js), obey Chas's teaching rule,
// and the copy the preview loads (audit/qa-samples/samples.json) is exactly what the tests use.
'use strict';
const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs'), path = require('path');
const { SAMPLES, BASELINE, BOUNDARY, cards } = require('./helpers/qa-samples.cjs');
const R = require('../clarifier-rules.js');

test('registry: 78 cards, IDs 0-77 unique, names unique, Majors are IDs 0-21', () => {
  assert.equal(cards.length, 78);
  assert.deepEqual([...cards].map(c => c.id).join(), Array.from({ length: 78 }, (_, i) => i).join());
  assert.equal(new Set(cards.map(c => c.name)).size, 78);
  assert.equal(cards.filter(c => c.arcana === 'Major').map(c => c.id).join(), Array.from({ length: 22 }, (_, i) => i).join());
});

test('every sample card ID resolves in the registry; no card twice in a reading; reversed cards are in the reading', () => {
  for (const s of SAMPLES) {
    const all = [...s.base, ...s.steps.map(x => x.id)];
    all.forEach(id => assert.ok(Number.isInteger(id) && cards[id] && cards[id].id === id, `${s.id}: ID ${id}`));
    assert.equal(new Set(all).size, all.length, `${s.id}: repeated card`);
    s.reversed.forEach(id => assert.ok(all.includes(id), `${s.id}: reversed ${id} not in reading`));
  }
});

test('every sample obeys the rule and at least 15 baselines cover all five spreads', () => {
  for (const s of SAMPLES) assert.deepEqual(R.validate(s.base.map(i => cards[i]), s.c1, s.c2, i => cards[i]), [], s.id);
  assert.ok(BASELINE.length >= 15);
  assert.deepEqual([...new Set(BASELINE.map(s => s.spread))].sort(), ['celtic', 'guidance', 'relationship', 'seven', 'three']);
  assert.ok(BOUNDARY.length >= 6);
});

test('the preview copy (audit/qa-samples/samples.json) matches the test samples exactly', () => {
  const file = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit', 'qa-samples', 'samples.json'), 'utf8'));
  assert.deepEqual(file, JSON.parse(JSON.stringify(SAMPLES)));
});
