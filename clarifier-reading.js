/* RESONATE · integrated clarifier interpretation (UAT, team directive 7 Nov 2026).
   When a card is clarified, its reading moves through four steps:
     1. the original card in its position (written by app.js, unchanged);
     2. how Clarifier 1 reinforces, supports, challenges or modifies the original card;
     3. how Clarifier 2 connects to BOTH earlier cards;
     4. what the cards mean together, and how that position relates to the wider spread.
   Everything here is derived from the cards' own RESONATE data (element, suit, number, arcana, court rank,
   orientation, keywords and each card's written connections). The method is RESONATE's own:
   - elements, using the long-standing tarot convention of elemental dignities: the same element
     reinforces; Fire with Air and Water with Earth are friendly; Fire with Water and Air with Earth are
     contrary; Fire with Earth and Air with Water are neutral;
   - suit, number, orientation and Major/Minor/court status add notes;
   - a written connection between the two cards in RESONATE's data is quoted when there is one.
   No published source is quoted or cited, and nothing here claims to be one. Pure functions, no DOM:
   the page, the PDF and Max Chasroom all read the same text. Recalculated on every render, so adding a
   clarifier always rewrites steps 2 to 4 from the cards now in the position. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ResonateClarifierReading = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const FRIENDLY = [['Fire', 'Air'], ['Water', 'Earth']];
  const CONTRARY = [['Fire', 'Water'], ['Air', 'Earth']];
  const pairIn = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const ELEMENT_DOMAIN = { Fire: 'energy, will and action', Water: 'feeling and relationships', Air: 'thought and communication', Earth: 'the body, work and material things' };
  const SUIT_DOMAIN = { Wands: 'energy, drive and creative action', Cups: 'feelings and relationships', Swords: 'thought, decisions and conflict', Pentacles: 'work, money, body and the material world' };
  const VERB = { reinforce: 'reinforces', support: 'supports', challenge: 'challenges', modify: 'modifies' };
  // Celtic Cross positions read as pairs (0-based): the situation and what crosses it; what lies beneath and
  // the conscious aim; what is passing and what may come; your approach and your surroundings; hopes or
  // fears and the possible outcome.
  const CELTIC_PAIRS = [[0, 1, 'the situation and what crosses it'], [2, 4, 'what lies beneath and what you consciously aim for'], [3, 5, 'what is passing and what may be coming'], [6, 7, 'how you approach things and what surrounds you'], [8, 9, 'your hopes or fears and the possible outcome']];

  const lower = s => String(s || '').toLowerCase();
  const norm = s => lower(s).replace(/[^a-z0-9]+/g, ' ').trim();
  const list = items => items.length <= 1 ? items.join('') : items.length === 2 ? items.join(' and ') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];

  function helpersOf(h) {
    h = h || {};
    return {
      name: c => c.name + ((h.reversed || (() => false))(c) ? ' (reversed)' : ''),
      keywords: h.keywords || (c => c.uprightKeywords || []),
      reversed: h.reversed || (() => false)
    };
  }
  const theme = (H, c) => lower(H.keywords(c).slice(0, 2).join(' and ')) || 'its theme';
  const word = (H, c) => lower(H.keywords(c)[0]) || 'its theme';

  // How card b relates to card a.
  function relation(a, b, h) {
    const H = helpersOf(h);
    const ea = a.element, eb = b.element;
    let kind = 'modify', elementBasis = '';
    if (ea && eb) {
      if (ea === eb) { kind = 'reinforce'; elementBasis = `both are ${ea} cards`; }
      else if (pairIn(FRIENDLY, ea, eb)) { kind = 'support'; elementBasis = `${ea} and ${eb} are friendly elements`; }
      else if (pairIn(CONTRARY, ea, eb)) { kind = 'challenge'; elementBasis = `${ea} and ${eb} are contrary elements`; }
      else { kind = 'modify'; elementBasis = `${ea} and ${eb} are neutral to each other`; }
    }
    const ra = !!H.reversed(a), rb = !!H.reversed(b);
    // A reversed card does not simply add its weight: when only one of the two is reversed, an agreement of
    // elements becomes a change of emphasis rather than a reinforcement.
    if (ra !== rb && (kind === 'reinforce' || kind === 'support')) { elementBasis += `, but ${(rb ? b : a).name} is reversed`; kind = 'modify'; }
    const basis = elementBasis ? [elementBasis] : [];
    const notes = [];
    if (a.suit && a.suit === b.suit) basis.push(`both are ${a.suit} (${SUIT_DOMAIN[a.suit] || a.suit})`);
    if (Number.isInteger(a.number) && a.number === b.number && a.arcana === b.arcana) basis.push(`both carry the number ${a.number}`);
    if (!ra && rb) notes.push(`Because ${H.name(b)} is reversed, it may point to what is blocked, delayed or turned inward in this theme.`);
    else if (ra && !rb) notes.push(`Because ${b.name} is upright, it may show a way through the difficulty shown by ${a.name} reversed.`);
    else if (ra && rb) notes.push('With both cards reversed, look at what is being held back or resisted.');
    if (b.arcana === 'Major' && a.arcana !== 'Major') notes.push(`As a Major Arcana card, ${b.name} suggests a larger life theme behind this everyday situation.`);
    else if (b.arcana !== 'Major' && a.arcana === 'Major') notes.push(`As a Minor Arcana card, ${b.name} brings the Major theme down to a practical, everyday expression${b.suit ? ` in ${SUIT_DOMAIN[b.suit]}` : ''}.`);
    if (b.arcana !== 'Major' && b.number === null && b.rank) notes.push(`As a court card (${b.rank}), ${b.name} may describe a person involved, or a way of behaving you could adopt.`);
    const written = (a.connections || []).find(c => norm(c.card) === norm(b.name)) || (b.connections || []).find(c => norm(c.card) === norm(a.name));
    return { kind, verb: VERB[kind], basis, notes, connection: written ? written.meaning : '' };
  }

  function meaningLine(kind, pos, ta, tb) {
    if (kind === 'reinforce') return `In ${pos}, the emphasis on ${ta} is strengthened by ${tb}; this theme is hard to ignore.`;
    if (kind === 'support') return `In ${pos}, the theme of ${tb} can help ${ta} find a constructive outlet.`;
    if (kind === 'challenge') return `In ${pos}, the theme of ${tb} pushes against ${ta}; ask what needs balancing before you act.`;
    return `In ${pos}, the theme of ${tb} changes how ${ta} may be expressed, rather than strengthening or opposing it.`;
  }
  const harmonious = k => k === 'reinforce' || k === 'support';

  // Step 2: Clarifier 1 against the original card.
  function firstStep(base, c1, pos, h) {
    const H = helpersOf(h), r = relation(base, c1, H);
    return {
      kind: r.kind,
      lead: `${H.name(c1)} ${r.verb} ${H.name(base)}.`,
      meaning: meaningLine(r.kind, pos, theme(H, base), theme(H, c1)),
      basis: r.basis, notes: r.notes, connection: r.connection
    };
  }

  // Step 3: Clarifier 2 against both earlier cards.
  function secondStep(base, c1, c2, pos, h) {
    const H = helpersOf(h);
    const toBase = relation(base, c2, H), toFirst = relation(c1, c2, H);
    const t2 = theme(H, c2), wb = `${word(H, base)} (${base.name})`, w1 = `${word(H, c1)} (${c1.name})`;
    const lead = toBase.kind === toFirst.kind
      ? `${H.name(c2)} ${toBase.verb} both ${H.name(base)} and ${H.name(c1)}.`
      : `${H.name(c2)} ${toBase.verb} ${H.name(base)} and ${toFirst.verb} ${H.name(c1)}.`;
    let meaning;
    if (harmonious(toBase.kind) && harmonious(toFirst.kind)) meaning = `In ${pos}, it draws the original card and the first clarifier together: the theme of ${t2} gives ${wb} and ${w1} a shared direction.`;
    else if (toBase.kind === 'challenge' && toFirst.kind === 'challenge') meaning = `In ${pos}, it questions both earlier cards: the theme of ${t2} asks whether ${wb} and ${w1} need rethinking.`;
    else if (harmonious(toBase.kind) && toFirst.kind === 'challenge') meaning = `In ${pos}, it sides with the original card: the theme of ${t2} returns the emphasis to ${wb} and tempers ${w1}.`;
    else if (toBase.kind === 'challenge' && harmonious(toFirst.kind)) meaning = `In ${pos}, it sides with the first clarifier: the theme of ${t2} builds on ${w1}, while asking what in ${wb} needs to change.`;
    else meaning = `In ${pos}, it adds a further angle: the theme of ${t2} shifts how ${wb} and ${w1} work together.`;
    const basis = [...toBase.basis.map(b => `with ${base.name}: ${b}`), ...toFirst.basis.map(b => `with ${c1.name}: ${b}`)];
    const notes = toBase.notes.filter(n => !/^Because|^With both/.test(n));
    if (H.reversed(c2)) notes.unshift(`Because ${H.name(c2)} is reversed, read what it adds as something still forming or held back.`);
    return { kinds: [toBase.kind, toFirst.kind], lead, meaning, basis, notes, connection: toBase.connection || toFirst.connection };
  }

  // Step 4: the cards together, and the position within the wider spread.
  // ctx: {pos, spreadId, spreadName, index, labels, baseCards:[card per position], clarified:[count per position]}
  function synthesis(base, c1, c2, ctx, h) {
    const H = helpersOf(h);
    const group = [base, c1, c2].filter(Boolean);
    const kinds = [relation(base, c1, H).kind];
    if (c2) kinds.push(relation(base, c2, H).kind, relation(c1, c2, H).kind);
    const harmony = kinds.filter(harmonious).length, tension = kinds.filter(k => k === 'challenge').length;
    let tone, guide;
    if (tension === 0 && harmony === kinds.length) { tone = 'a consistent message'; guide = 'Consider working with this theme with some confidence, while staying open to how it unfolds.'; }
    else if (tension === 0 && harmony === 0) { tone = 'a layered message, each card shifting the angle a little'; guide = 'Notice which angle feels most true to your situation, and start there.'; }
    else if (tension > harmony) { tone = 'a message with real tension in it'; guide = 'Treat the friction as information: what would honour both sides?'; }
    else if (tension === 0 && harmony * 2 < kinds.length) { tone = 'a layered message, each card shifting the angle a little'; guide = 'Notice which angle feels most true to your situation, and start there.'; }
    else if (tension === 0) { tone = 'a mostly consistent message'; guide = 'Let the shared theme lead, and notice where the other card shifts it.'; }
    else { tone = 'a mixed message, with both agreement and friction'; guide = 'Notice which card feels most true to your situation, and let it lead.'; }
    // QA 7 Nov (sample S15): three reversed cards in agreement were told to "work with this theme with some
    // confidence". When most of the cards are reversed, an agreement is read as a shared difficulty.
    const reversedCount = group.filter(c => H.reversed(c)).length;
    if (reversedCount * 2 > group.length && tension === 0 && harmony * 2 >= kinds.length) guide = `The cards agree, but ${reversedCount === group.length ? 'all' : 'most'} of them are reversed: read the shared theme as something blocked, delayed or turned inward, and look at that before acting.`;
    const themes = list(group.map(c => word(H, c)));
    const lead = `Together, ${list(group.map(H.name))} give ${ctx.pos} ${tone}: ${themes}.`;
    const counts = {};
    group.forEach(c => { if (c.element) counts[c.element] = (counts[c.element] || 0) + 1; });
    const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0];
    const elementLine = top && top[1] >= 2 ? `${top[1] === group.length ? (group.length === 2 ? 'Both' : 'All three') + ' cards are' : 'Two of the three cards are'} ${top[0]}, putting the weight on ${ELEMENT_DOMAIN[top[0]]}.` : '';
    return { lead, element: elementLine, guide, wider: wider(base, ctx, H) };
  }

  function wider(base, ctx, H) {
    const cardsIn = ctx.baseCards || [], labels = ctx.labels || [], i = ctx.index;
    if (cardsIn.length < 2) return '';
    const describe = j => { const c = cardsIn[j], tags = [H.reversed(c) ? 'reversed' : '', ctx.clarified && ctx.clarified[j] ? 'clarified' : ''].filter(Boolean); return `${labels[j] || 'position ' + (j + 1)}, ${c.name}${tags.length ? ` (${tags.join('; ')})` : ''}`; };
    if (ctx.spreadId === 'celtic' && cardsIn.length === 10) {
      const pair = CELTIC_PAIRS.find(p => p[0] === i || p[1] === i);
      if (!pair) return '';
      const j = pair[0] === i ? pair[1] : pair[0];
      const r = relation(base, cardsIn[j], H);
      return `In the wider Celtic Cross, ${ctx.pos} is read with ${describe(j)}: together they show ${pair[2]}. There, ${cardsIn[j].name} ${r.verb} ${base.name}${r.basis[0] ? ` (${r.basis[0]})` : ''}.`;
    }
    const next = i + 1 < cardsIn.length ? i + 1 : i - 1;
    const r = relation(base, cardsIn[next], H);
    const where = i === 0 ? 'opens' : i === cardsIn.length - 1 ? 'closes' : 'sits within';
    return `In the wider ${ctx.spreadName || ''} spread, ${ctx.pos} ${where} the reading; its neighbour is ${describe(next)}, which ${r.verb} ${base.name}${r.basis[0] ? ` (${r.basis[0]})` : ''}.`.replace('wider  spread', 'wider spread');
  }

  const METHOD = 'How this was read: each relationship comes from the cards’ elements (using elemental dignities, a long-standing tarot convention), suits, numbers, orientation and Major or Minor status, from RESONATE’s card data. It is RESONATE’s interpretive method, not a quotation from a published source.';

  return { relation, firstStep, secondStep, synthesis, wider: (base, ctx, h) => wider(base, ctx, helpersOf(h)), METHOD, CELTIC_PAIRS };
});
