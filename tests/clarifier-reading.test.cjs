// Integrated clarifier interpretation (team directive, 7 Nov 2026): clarifier-reading.js.
// Checks the relationship rules on real RESONATE card data, and that the text names the right cards.
'use strict';
const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = require('../clarifier-reading.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8') + ';this.cards=cards;', ctx);
const cards = ctx.cards;
const by = name => cards.find(c => c.name === name);
const helpers = (reversed = []) => ({ reversed: c => reversed.includes(c.name), keywords: c => reversed.includes(c.name) ? c.reversedKeywords : c.uprightKeywords });
const CELTIC = ['Present Situation', 'Crossing Challenge', 'Foundation', 'Recent Past', 'Conscious Focus', 'Near Future', 'Your Approach', 'Surrounding Influences', 'Hopes and Fears', 'Potential Outcome'];

test('elemental relationships: same reinforces, friendly supports, contrary challenges, neutral modifies', () => {
  const h = helpers();
  assert.equal(R.relation(by('The Emperor'), by('Strength'), h).kind, 'reinforce');            // Fire, Fire
  assert.equal(R.relation(by('The Emperor'), by('The Fool'), h).kind, 'support');              // Fire, Air
  assert.equal(R.relation(by('Two of Cups'), by('Four of Pentacles'), h).kind, 'support');     // Water, Earth
  assert.equal(R.relation(by('The Tower'), by('Death'), h).kind, 'challenge');                 // Fire, Water
  assert.equal(R.relation(by('Ace of Swords'), by('Ace of Pentacles'), h).kind, 'challenge');  // Air, Earth
  assert.equal(R.relation(by('Ace of Wands'), by('Ace of Pentacles'), h).kind, 'modify');      // Fire, Earth
  assert.equal(R.relation(by('Ace of Swords'), by('Ace of Cups'), h).kind, 'modify');          // Air, Water
});

test('one reversed card turns an agreement into a change of emphasis, and says so', () => {
  const r = R.relation(by('The Emperor'), by('The Tower'), helpers(['The Tower']));
  assert.equal(r.kind, 'modify');
  assert.match(r.basis[0], /both are Fire cards, but The Tower is reversed/);
  assert.ok(r.notes.some(n => /The Tower \(reversed\) is reversed/.test(n)));
});

test('suit, number, arcana, court and written connections are noted', () => {
  const h = helpers();
  assert.ok(R.relation(by('Three of Cups'), by('Three of Cups'.replace('Three', 'Seven')), h).basis.some(b => /both are Cups/.test(b)));
  assert.ok(R.relation(by('Three of Cups'), by('Three of Swords'), h).basis.some(b => /number 3/.test(b)));
  assert.ok(R.relation(by('Three of Cups'), by('The Sun'), h).notes.some(n => /Major Arcana card, The Sun suggests a larger life theme/.test(n)));
  assert.ok(R.relation(by('The Sun'), by('Queen of Cups'), h).notes.some(n => /court card \(Queen\)/.test(n)));
  const death = by('Death'), link = death.connections[0];
  const r = R.relation(death, by(link.card), h);
  assert.equal(r.connection, link.meaning, "quotes the card's own written connection");
});

test('step 2 names both cards and the position; step 3 relates Clarifier 2 to both', () => {
  const h = helpers();
  const s2 = R.firstStep(by('The Emperor'), by('Strength'), 'Present Situation', h);
  assert.equal(s2.lead, 'Strength reinforces The Emperor.');
  assert.match(s2.meaning, /^In Present Situation, /);
  const s3 = R.secondStep(by('The Emperor'), by('Strength'), by('Death'), 'Present Situation', h);
  assert.equal(s3.lead, 'Death challenges both The Emperor and Strength.');
  assert.match(s3.meaning, /questions both earlier cards/);
  assert.match(s3.meaning, /\(The Emperor\)/); assert.match(s3.meaning, /\(Strength\)/);
  const mixed = R.secondStep(by('The Emperor'), by('Death'), by('The Fool'), 'Foundation', h);
  assert.equal(mixed.lead, 'The Fool supports The Emperor and modifies Death.');
});

test('step 4 summarises the cards together and places the position in the Celtic Cross pairs', () => {
  const h = helpers();
  const base = ['Ten of Cups', 'Three of Swords', 'Queen of Pentacles', 'Five of Wands', 'The Tower', 'Ace of Cups', 'Knight of Swords', 'The Star', 'Six of Cups', 'The World'].map(by);
  const s = R.synthesis(by('The Tower'), by('Strength'), by('The Emperor'), { pos: 'Conscious Focus', index: 4, spreadId: 'celtic', labels: CELTIC, baseCards: base }, h);
  assert.match(s.lead, /^Together, The Tower, Strength and The Emperor give Conscious Focus a consistent message/);
  assert.match(s.element, /All three cards are Fire/);
  assert.match(s.wider, /read with Foundation, Queen of Pentacles: together they show what lies beneath and what you consciously aim for/);
  for (const [a, b] of [[0, 1], [2, 4], [3, 5], [6, 7], [8, 9]]) {
    assert.match(R.wider(base[a], { pos: CELTIC[a], index: a, spreadId: 'celtic', labels: CELTIC, baseCards: base }, h), new RegExp(`read with ${CELTIC[b]}, ${base[b].name}`));
    assert.match(R.wider(base[b], { pos: CELTIC[b], index: b, spreadId: 'celtic', labels: CELTIC, baseCards: base }, h), new RegExp(`read with ${CELTIC[a]}, ${base[a].name}`));
  }
  const tension = R.synthesis(by('The Tower'), by('Death'), by('The Moon'), { pos: 'X', index: 0, spreadId: 'three', labels: ['X', 'Y', 'Z'], baseCards: [by('The Tower'), by('Ace of Cups'), by('Ace of Swords')] }, h);
  assert.match(tension.lead, /tension/);
  assert.match(tension.wider, /neighbour is Y, Ace of Cups/);
});

test('every Major/Minor pairing produces text with no undefined or empty pieces', () => {
  const h = helpers(['The Moon', 'Five of Cups']);
  for (const a of cards) for (const b of [cards[0], cards[13], cards[18], cards[40], cards[63], cards[77]]) {
    if (a.id === b.id) continue;
    const s = R.firstStep(a, b, 'P', h);
    for (const t of [s.lead, s.meaning, ...s.basis, ...s.notes]) assert.ok(t && !/undefined|null|NaN/.test(t), `${a.name} / ${b.name}: ${t}`);
  }
});

test('the method line makes no claim to a published source', () => {
  assert.match(R.METHOD, /RESONATE/);
  assert.match(R.METHOD, /not a quotation from a published source/);
});
