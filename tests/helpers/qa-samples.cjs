// Reading-engine QA samples (Si Aye, full reading engine QA directive, 7 Nov 2026).
// Every sample is fully specified: spread, base card IDs, which cards are reversed, and the clarifier
// sequence (in the order the seeker would press Clarify). Baselines come from a seeded shuffle (mulberry32)
// so anyone can regenerate them; boundary samples are written out by hand. The clarifier sequence follows
// Chas's teaching rule (clarifier-rules.js): Majors get Clarifier 1; a Major Clarifier 1 gets Clarifier 2;
// other cards are clarified only by the seeker's choice (here: mode "all" chooses every Minor).
// Nothing here decides an interpretation: the app renders each sample through its own functions.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'data.js'), 'utf8') + ';this.cards=cards;', ctx);
const cards = ctx.cards;
const byName = n => { const c = cards.find(x => x.name === n); if (!c) throw new Error('no card ' + n); return c.id; };
const major = id => cards[id].arcana === 'Major';
const SIZE = { guidance: 1, three: 3, relationship: 5, seven: 7, celtic: 10 };

function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Clarifier sequence for given base cards, drawing clarifiers from `pool` in order.
function sequence(base, pool, mode) {
  const steps = [], c1 = base.map(() => null), c2 = base.map(() => null);
  if (mode === 'none') return { steps, c1, c2 };
  base.forEach((id, pos) => {
    if (!major(id) && mode !== 'all') return;
    c1[pos] = pool.shift(); steps.push({ pos, layer: 1, id: c1[pos] });
    if (major(c1[pos])) { c2[pos] = pool.shift(); steps.push({ pos, layer: 2, id: c2[pos] }); }
  });
  return { steps, c1, c2 };
}

function seeded(id, spread, seed, mode, note) {
  const rng = mulberry32(seed);
  const deck = cards.map(c => c.id);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const base = deck.slice(0, SIZE[spread]);
  const seq = sequence(base, deck.slice(SIZE[spread]), mode);
  const all = [...base, ...seq.steps.map(s => s.id)];
  const reversed = all.filter(() => rng() < 0.5);
  return { id, kind: 'baseline', spread, seed, mode, note, base, reversed, ...seq };
}

function fixed(id, spread, names, clar, reversedNames, note) {
  // clar: [{pos, c1, c2?}] in press order; names resolved to IDs.
  const base = names.map(byName);
  const c1 = base.map(() => null), c2 = base.map(() => null), steps = [];
  clar.forEach(({ pos, c1: a, c2: b }) => {
    c1[pos] = byName(a); steps.push({ pos, layer: 1, id: c1[pos] });
    if (b) { c2[pos] = byName(b); steps.push({ pos, layer: 2, id: c2[pos] }); }
  });
  return { id, kind: 'boundary', spread, mode: 'fixed', note, base, reversed: reversedNames.map(byName), steps, c1, c2 };
}

const modes = ['none', 'rule', 'all'];
const BASELINE = [];
let n = 1;
for (const spread of ['guidance', 'three', 'relationship', 'seven', 'celtic']) {
  modes.forEach((mode, k) => {
    // 7 Nov, sample n. In "rule" mode the seed steps forward until the deal holds a Major, so the rule acts.
    let seed = 7110 + n;
    while (mode === 'rule' && !seeded('x', spread, seed, mode).base.some(major)) seed += 100;
    BASELINE.push(seeded('S' + String(n).padStart(2, '0'), spread, seed, mode,
      mode === 'none' ? 'as dealt, before any clarifier' : mode === 'rule' ? 'every clarifier the rule requires' : 'rule clarifiers plus the seeker clarifying every other card'));
    n++;
  });
}

const BOUNDARY = [
  fixed('B01', 'guidance', ['Death'], [{ pos: 0, c1: 'The Tower', c2: 'Judgement' }], [], 'Major, Major Clarifier 1, Major Clarifier 2: the two-clarifier limit is reached and stated'),
  fixed('B02', 'three', ['Three of Wands', 'Two of Swords', 'Ten of Pentacles'], [{ pos: 0, c1: 'Page of Cups' }, { pos: 1, c1: 'Nine of Wands' }, { pos: 2, c1: 'Four of Cups' }], ['Two of Swords'], 'no Major Arcana: nothing required; every card clarified by choice with Minor clarifiers, so no Clarifier 2'),
  fixed('B03', 'relationship', ['Seven of Cups', 'Queen of Cups', 'Ten of Swords', 'The Devil', 'Ace of Pentacles'], [{ pos: 0, c1: 'The Hermit', c2: 'Eight of Pentacles' }, { pos: 3, c1: 'Seven of Wands' }], ['The Hermit', 'Ten of Swords'], "Deep's case at position 1 (Minor chosen, Major Clarifier 1, so Clarifier 2 due); a required Major clarifier with a Minor"),
  fixed('B04', 'seven', ['The Moon', 'Five of Cups', 'Knight of Swords', 'The Hanged Man', 'Six of Wands', 'Queen of Pentacles', 'The Chariot'], [{ pos: 0, c1: 'Three of Swords' }, { pos: 3, c1: 'The Star', c2: 'Two of Cups' }, { pos: 6, c1: 'Ace of Wands' }], ['The Moon', 'Five of Cups', 'Knight of Swords', 'The Hanged Man', 'Six of Wands', 'Queen of Pentacles', 'The Chariot', 'Three of Swords', 'The Star', 'Two of Cups', 'Ace of Wands'], 'every card and clarifier reversed'),
  fixed('B05', 'three', ['Death', 'Queen of Wands', 'Three of Cups'], [{ pos: 0, c1: 'Eight of Cups' }, { pos: 1, c1: 'King of Wands' }, { pos: 2, c1: 'Three of Swords' }], [], "Death with Eight of Cups (a written connection in the card data); same suit and element (Queen/King of Wands); number echo (Three of Cups / Three of Swords)"),
  fixed('B06', 'celtic', ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit'],
    [{ pos: 0, c1: 'Wheel of Fortune', c2: 'Justice' }, { pos: 1, c1: 'The Hanged Man', c2: 'Ace of Cups' }, { pos: 2, c1: 'Death', c2: 'Temperance' }, { pos: 3, c1: 'The Devil', c2: 'Two of Wands' }, { pos: 4, c1: 'The Tower', c2: 'The Star' }, { pos: 5, c1: 'Page of Pentacles' }, { pos: 6, c1: 'The Moon', c2: 'Five of Swords' }, { pos: 7, c1: 'Six of Cups' }, { pos: 8, c1: 'The Sun', c2: 'Judgement' }, { pos: 9, c1: 'The World', c2: 'Nine of Pentacles' }],
    ['The Magician', 'The Lovers', 'Death', 'The Moon', 'Judgement'], 'Celtic Cross of ten Majors: every position clarified, several Major-Major pairs, four at the two-clarifier limit'),
];

module.exports = { SAMPLES: [...BASELINE, ...BOUNDARY], BASELINE, BOUNDARY, cards, SIZE };
