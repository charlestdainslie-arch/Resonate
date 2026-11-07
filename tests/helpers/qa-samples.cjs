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
  const clarity = base.map(() => null);
  clar.forEach(({ pos, c1: a, c2: b, k }) => {
    c1[pos] = byName(a); steps.push({ pos, layer: 1, id: c1[pos] });
    if (b) { c2[pos] = byName(b); steps.push({ pos, layer: 2, id: c2[pos] }); }
    if (k) { clarity[pos] = byName(k); steps.push({ pos, layer: 3, id: clarity[pos] }); }   // Clarity card (Option B)
  });
  return { id, kind: 'boundary', spread, mode: 'fixed', note, base, reversed: reversedNames.map(byName), steps, c1, c2, clarity };
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
  fixed('B07', 'guidance', ['Death'], [{ pos: 0, c1: 'The Tower', c2: 'Judgement', k: 'Five of Cups' }], [], 'Option B: Major original, Major Clarifier 1, Major Clarifier 2, then the Clarity card (a Minor, given here so the case is fixed; live draws take it at random from the unused Minors)'),
  { ...fixed('B08', 'seven', ['Three of Wands', 'The Empress', 'Nine of Swords', 'The Hermit', 'Page of Cups', 'Two of Pentacles', 'Ten of Wands'], [{ pos: 3, c1: 'Four of Cups' }], ['Nine of Swords'], 'Seven-card question reading: position 4, You / Answer, read last'), question: true },
];

// ---- Si Aye's QA matrix (7 Nov 2026): the 16 baseline cases, where not already covered above. ----
// Cards named in the matrix are used exactly. Where the matrix leaves a card unspecified (a clarifier "on
// Present", or a whole spread described only as "all upright"), the card comes from a seeded shuffle of the
// unused cards, stated in the sample as `seeded` with its seed and rule, so nothing is chosen by hand.
const deckFor = (seed, exclude) => { const rng = mulberry32(seed); const d = cards.map(c => c.id).filter(id => !exclude.includes(id)); for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return { d, rng }; };
function matrix(id, spread, baseSpec, opts) {
  // baseSpec: [[name, reversed?]] or null for a seeded deal; opts: {seed, clarify:[{pos, c1?, firstMajor?}], allUpright, minReversed, note, seeded:[]}
  const seeded = [...(opts.seeded || [])];
  let base, reversed = [];
  if (baseSpec) { base = baseSpec.map(([n]) => byName(n)); reversed = baseSpec.filter(([, r]) => r).map(([n]) => byName(n)); }
  else {
    let seed = opts.seed;
    for (;; seed++) {
      const { d, rng } = deckFor(seed, opts.exclude || []);
      base = d.slice(0, SIZE[spread]);
      if (opts.place) opts.place.forEach(([pos, n]) => { base.splice(pos, 0, byName(n)); base.length = SIZE[spread]; });
      reversed = opts.allUpright ? [] : base.filter(() => rng() < 0.5);
      if (opts.place) opts.place.forEach(([, n, r]) => { const k = byName(n); reversed = reversed.filter(x => x !== k); if (r) reversed.push(k); });
      if (!opts.accept || opts.accept(base, reversed)) break;
    }
    seeded.push(`base cards: seeded deal, seed ${seed}${opts.accept ? ' (first seed from ' + opts.seed + ' meeting: ' + opts.acceptText + ')' : ''}${opts.allUpright ? ', all upright' : ''}`);
  }
  const c1 = base.map(() => null), c2 = base.map(() => null), steps = [];
  const pool = deckFor(opts.seed + 1000, base).d;
  const take = pred => { const i = pool.findIndex(x => !steps.some(s => s.id === x) && pred(x)); return pool.splice(i, 1)[0]; };
  (opts.clarify || []).forEach(cl => {
    if (cl.c1) c1[cl.pos] = byName(cl.c1);
    else { c1[cl.pos] = take(x => !cl.firstMajor || major(x)); seeded.push(`Clarifier 1 at position ${cl.pos + 1}: seeded, seed ${opts.seed + 1000}${cl.firstMajor ? ', first unused Major' : ', next unused card'}`); }
    steps.push({ pos: cl.pos, layer: 1, id: c1[cl.pos] });
    if (major(c1[cl.pos]) && cl.c2 !== false) { c2[cl.pos] = cl.c2 ? byName(cl.c2) : take(() => true); if (!cl.c2) seeded.push(`Clarifier 2 at position ${cl.pos + 1}: seeded, next unused card (rule: Clarifier 1 is a Major)`); steps.push({ pos: cl.pos, layer: 2, id: c2[cl.pos] }); }
  });
  (opts.reverseClarifiers || []).forEach(n => reversed.push(byName(n)));
  if (steps.length) seeded.push('clarifier orientation: upright (the matrix does not specify)');
  return { id, kind: 'matrix', spread, mode: 'matrix', note: opts.note, seeded, base, reversed, steps, c1, c2 };
}
const MATRIX = [
  matrix('OC-01', 'guidance', [['The Fool']], { seed: 7401, note: 'Fool upright, no clarifier (as dealt; the rule makes Clarifier 1 due)' }),
  matrix('OC-02', 'guidance', [['Ten of Swords', true]], { seed: 7402, note: 'Ten of Swords reversed' }),
  matrix('OC-03', 'guidance', [['The Tower']], { seed: 7403, clarify: [{ pos: 0, c1: 'The Star', c2: false }], note: 'Tower upright, Star upright clarifier (the matrix gives no Clarifier 2; the rule makes it due because The Star is a Major)' }),
  matrix('TC-01', 'three', [['Ace of Pentacles'], ['Five of Cups'], ['Six of Wands']], { seed: 7404, note: 'Ace of Pentacles U / Five of Cups U / Six of Wands U' }),
  matrix('TC-02', 'three', [['Eight of Cups', true], ['Nine of Wands'], ['Ten of Cups']], { seed: 7405, note: 'Eight of Cups R / Nine of Wands U / Ten of Cups U' }),
  matrix('TC-03', 'three', [['The Lovers'], ['Two of Cups', true], ['The Star']], { seed: 7406, clarify: [{ pos: 1 }], note: 'Lovers U / Two of Cups R / Star U; clarifier on Present' }),
  matrix('TC-04', 'three', [['Wheel of Fortune', true], ['Four of Pentacles'], ['Six of Pentacles', true]], { seed: 7407, clarify: [{ pos: 1, firstMajor: true }], note: 'Wheel of Fortune R / Four of Pentacles U / Six of Pentacles R; two-clarifier chain on Present (a chain needs a Major Clarifier 1)' }),
  matrix('RC-01', 'relationship', [['Two of Cups'], ['The Hermit', true], ['The Lovers'], ['Five of Wands'], ['Ace of Cups']], { seed: 7408, note: 'Two of Cups U / Hermit R / Lovers U / Five of Wands U / Ace of Cups U' }),
  matrix('RC-02', 'relationship', [['Queen of Cups', true], ['King of Swords'], ['Page of Wands'], ['Eight of Cups'], ['The Star']], { seed: 7409, clarify: [{ pos: 2 }], note: 'Queen of Cups R / King of Swords U / Page of Wands U / Eight of Cups U / Star U; clarifier on Connection' }),
  matrix('RC-03', 'relationship', [['The Devil'], ['The Hierophant', true], ['Three of Cups'], ['Four of Cups'], ['Judgement']], { seed: 7410, note: 'Devil U / Hierophant R / Three of Cups U / Four of Cups U / Judgement U' }),
  matrix('SC-02', 'seven', null, { seed: 7411, accept: (b, r) => b.filter(major).length === 2 && b.some(x => major(x) && r.includes(x)), acceptText: 'exactly two Majors, at least one reversed', clarifyFirstReversedMajor: true, note: 'Two Majors, reversed anchor, two-clarifier chain' }),
  matrix('CC-01', 'celtic', null, { seed: 7412, allUpright: true, note: 'All upright, no clarifiers' }),
  matrix('CC-02', 'celtic', null, { seed: 7513, accept: (b, r) => r.length >= 7, acceptText: 'at least 7 of 10 reversed', clarify: [{ pos: 3 }], note: 'Reversal-heavy, clarifier on Recent Past (the matrix says "Past"; the Celtic Cross position is "Recent Past")' }),
  matrix('CC-04', 'celtic', null, { seed: 7414, exclude: [9, 71], place: [[0, 'The Hermit', true]], clarify: [{ pos: 0, c1: 'Eight of Pentacles' }], note: 'Hermit R + Eight of Pentacles U clarifier, full applicable chain (the matrix gives no position: placed at position 1, Present Situation; Eight of Pentacles is not a Major, so the chain ends at Clarifier 1)' }),
];
// SC-02: the chain is on the first reversed Major in the deal, Clarifier 1 the first unused Major, Clarifier 2 the next card.
{
  const s = MATRIX.find(m => m.id === 'SC-02');
  const pos = s.base.findIndex(x => major(x) && s.reversed.includes(x));
  const redo = matrix('SC-02', 'seven', s.base.map(id => [cards[id].name, s.reversed.includes(id)]), { seed: 7411, clarify: [{ pos, firstMajor: true }], seeded: s.seeded, note: s.note + ` (anchor: position ${pos + 1}, the first reversed Major)` });
  MATRIX[MATRIX.indexOf(s)] = redo;
}

module.exports = { SAMPLES: [...BASELINE, ...BOUNDARY, ...MATRIX], BASELINE, BOUNDARY, MATRIX, cards, SIZE };
