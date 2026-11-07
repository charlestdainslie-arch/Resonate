// Secure randomness for live draws (approved by Chas, 7 Nov 2026): deck-engine.js shuffles with
// crypto.getRandomValues, keeps the same Fisher–Yates, and still accepts an explicit random source.
'use strict';
const test = require('node:test');
const assert = require('assert/strict');
const D = require('../deck-engine.js');
const ids = Array.from({ length: 78 }, (_, i) => i);

test('the live random source is crypto.getRandomValues, not Math.random', () => {
  assert.equal(D.randomSource(), 'crypto.getRandomValues');
  const real = Math.random; let calls = 0;
  Math.random = () => { calls++; return real(); };
  try { D.shuffle(ids); D.drawRemaining(ids, [1, 2, 3], 2); } finally { Math.random = real; }
  assert.equal(calls, 0, 'no Math.random during a live shuffle or clarifier draw');
});

test('secureRandom returns numbers in [0, 1) built from 53 bits', () => {
  for (let k = 0; k < 20000; k++) { const n = D.secureRandom(); assert.ok(n >= 0 && n < 1); }
  const orig = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
  let calls = 0;
  globalThis.crypto.getRandomValues = a => { calls++; return orig(a); };
  try { D.shuffle(ids); } finally { globalThis.crypto.getRandomValues = orig; }
  assert.equal(calls, 77, 'Fisher–Yates of 78 cards takes 77 secure numbers');
});

test('shuffle is still a permutation and still accepts an explicit source (for reproducible tests)', () => {
  const out = D.shuffle(ids);
  assert.deepEqual([...out].sort((a, b) => a - b), ids);
  const fixed = () => 0;
  assert.deepEqual(D.shuffle([0, 1, 2, 3], fixed), [1, 2, 3, 0]);
});

test('first-card frequency over 78,000 shuffles stays within a chi-square bound (df 77, p ≈ 0.001: 122.1)', () => {
  const n = 78000, counts = new Array(78).fill(0);
  for (let k = 0; k < n; k++) counts[D.shuffle(ids)[0]]++;
  const e = n / 78, chi = counts.reduce((s, c) => s + (c - e) ** 2 / e, 0);
  assert.ok(chi < 122.1, 'chi-square ' + chi.toFixed(1));
});
