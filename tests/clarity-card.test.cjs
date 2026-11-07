// Option B, the Clarity card (approved by Chas, 7 Nov 2026), in clarifier-rules.js.
'use strict';
const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = require('../clarifier-rules.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8') + ';this.cards=cards;', ctx);
const cards = ctx.cards, by = id => cards[id];

test('a Clarity card is due only when the original card and both clarifiers are Major', () => {
  assert.equal(R.plan([by(13)], [16], [20], by).positions[0].needsClarity, true);   // Death, Tower, Judgement
  assert.deepEqual(R.plan([by(13)], [16], [20], by).pendingClarity, [0]);
  assert.equal(R.plan([by(13)], [16], [40], by).positions[0].needsClarity, false);  // Clarifier 2 a Minor
  assert.equal(R.plan([by(40)], [16], [20], by).positions[0].needsClarity, false);  // original a Minor
  assert.equal(R.plan([by(13)], [16], [], by).positions[0].needsClarity, false);    // no Clarifier 2 yet
  assert.equal(R.plan([by(13)], [16], [20], by, [41]).positions[0].needsClarity, false, 'once drawn, not due again');
});

test('validate: the Clarity card must be a Minor, only after three Majors, never repeated; clarifier limit unchanged', () => {
  assert.deepEqual(R.validate([by(13)], [16], [20], by, [41]), []);
  assert.match(R.validate([by(13)], [16], [20], by, [5]).join(), /must be a Minor/);
  assert.match(R.validate([by(40)], [16], [20], by, [41]).join(), /without three Major/);
  assert.match(R.validate([by(13)], [16], [20], by, [16]).join(), /repeated/);
  assert.equal(R.MAX_PER_POSITION, 2);
});
