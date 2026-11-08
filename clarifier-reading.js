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
    // The card data's written connections describe the two cards upright, so they are quoted only then
    // (Deep's QA, 9 Nov 2026: a reversed card was read with its upright connection).
    const written = ra || rb ? null : (a.connections || []).find(c => norm(c.card) === norm(b.name)) || (b.connections || []).find(c => norm(c.card) === norm(a.name));
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

  // What a position asks of its cards (from the position's name): the proposition is framed through it.
  function roleOf(pos) {
    const p = lower(pos);
    if (/approach/.test(p)) return 'approach';
    if (/guidance|advice/.test(p)) return 'act';
    if (/challenge|crossing|obstacle/.test(p)) return 'obstacle';
    if (/hope|fear|conscious focus/.test(p)) return 'hope';
    if (/future|outcome/.test(p)) return 'ahead';
    if (/past|foundation|root/.test(p)) return 'root';
    return 'now';
  }

  // How the cards in one position line up (kinds: relation of each card to the cards before it).
  function patternOf(base, c1, c2, H) {
    const k1 = relation(base, c1, H).kind;
    if (!c2) return { shape: harmonious(k1) ? 'allied' : k1 === 'challenge' ? 'opposed' : 'reshaped', k1 };
    const kb2 = relation(base, c2, H).kind, k12 = relation(c1, c2, H).kind;
    let shape;
    if (harmonious(k1) && harmonious(kb2) && harmonious(k12)) shape = 'allied';
    else if (kb2 === 'challenge' && k12 === 'challenge') shape = 'questioned';
    else if (harmonious(kb2) && !harmonious(k12)) shape = 'withBase';
    else if (harmonious(k12) && !harmonious(kb2)) shape = 'withFirst';
    else if (k1 === 'challenge' || kb2 === 'challenge' || k12 === 'challenge') shape = 'opposed';
    else shape = 'reshaped';
    return { shape, k1, kb2, k12 };
  }

  // Step 4: what the cards mean together, as one proposition (Si Aye / Deep, 9 Nov 2026): the original card
  // sets the theme; Clarifier 1 supports, challenges or changes it; Clarifier 2 takes a side or reshapes the
  // relationship; the Clarity card grounds the three Majors in everyday life; then what the combined pattern
  // suggests for this position, and how the reversals change it. Built only from the cards' own data
  // (orientation keywords, element relations, suit, written prompt); nothing predicts beyond the cards.
  // ctx: {pos, spreadId, spreadName, index, labels, baseCards:[card per position], clarified:[count per position]}
  // clarity (optional): the Clarity card (Option B), drawn after three Major Arcana cards.
  function synthesis(base, c1, c2, ctx, h, clarity) {
    const H = helpersOf(h), pos = ctx.pos, role = roleOf(pos);
    const group = [base, c1, c2, clarity].filter(Boolean);
    const W = c => word(H, c), N = c => H.name(c);
    const P = patternOf(base, c1, c2, H);
    // How the cards build the reading, card by card.
    const steps = [];
    steps.push(`${N(base)} sets the theme in ${pos}: ${theme(H, base)}.`);
    const k1 = P.k1;
    steps.push(k1 === 'reinforce' ? `${N(c1)} says the same thing more strongly, so this is not a passing mood but the main fact here.`
      : k1 === 'support' ? `${N(c1)} gives it somewhere to go, putting ${W(base)} to use through ${W(c1)}.`
      : k1 === 'challenge' ? `${N(c1)} pushes back, setting ${W(c1)} against ${W(base)}; that friction is part of the message.`
      : `${N(c1)} changes its emphasis, bringing ${W(c1)} into ${W(base)}.`);
    if (c2) steps.push(P.shape === 'allied' ? `${N(c2)} brings them together: through ${W(c2)}, ${W(base)} and ${W(c1)} point the same way.`
      : P.shape === 'questioned' ? `${N(c2)} unsettles both, putting ${W(base)} and ${W(c1)} alike to the test of ${W(c2)}.`
      : P.shape === 'withBase' ? `${N(c2)} sides with ${base.name}, pulling the reading back to ${W(base)} through ${W(c2)} and tempering ${W(c1)}.`
      : P.shape === 'withFirst' ? `${N(c2)} sides with ${c1.name}, carrying ${W(c1)} forward through ${W(c2)} and asking what in ${W(base)} has to change.`
      : `${N(c2)} adds a further angle, so that ${W(c2)} shapes how ${W(base)} and ${W(c1)} work together.`);
    const domain = clarity ? (clarity.suit ? SUIT_DOMAIN[clarity.suit] : 'everyday life') : '';
    if (clarity) steps.push(`${N(clarity)} grounds all three in ${domain}: in everyday terms, this is likely to show up as ${theme(H, clarity)}.`);
    // The combined pattern, as one phrase.
    const others = [c1, c2].filter(Boolean);
    // QA 7 Nov (S15): cards that agree but are mostly reversed share a difficulty; they do not "back" anything.
    const heldBack = group.filter(c => H.reversed(c)).length * 2 > group.length;
    const shapes = {
      allied: () => heldBack ? `a shared difficulty around ${W(base)}, echoed by ${list(others.map(W))}` : `${W(base)}, with real momentum behind it from ${list(others.map(W))}`,
      opposed: () => c2 ? `a pull between ${W(base)} on one side and ${W(c1)} and ${W(c2)} on the other, not yet settled` : `a pull between ${W(base)} and ${W(c1)}`,
      withBase: () => `${W(base)} holding its ground against ${W(c1)}, with ${W(c2)} on its side`,
      withFirst: () => `${W(base)} giving way to ${W(c1)}, with ${W(c2)} pushing that change on`,
      questioned: () => `${W(base)} and ${W(c1)} both called into question by ${W(c2)}`,
      reshaped: () => `${W(base)}, expressed through ${list(others.map(W))}`
    };
    const shapePhrase = shapes[P.shape]() + (clarity ? `, landing day to day as ${W(clarity)}` : '');
    const frame = {
      act: `As guidance, the cards point to ${shapePhrase}.`,
      approach: `The stance the cards describe here is ${shapePhrase}.`,
      obstacle: `The obstacle here is ${shapePhrase}.`,
      hope: `Your hopes and fears here gather around ${shapePhrase}.`,
      ahead: `If the present course continues, this points toward ${shapePhrase}; it is a direction, not a fixed outcome.`,
      root: `What shaped this situation was ${shapePhrase}.`,
      now: `What is active now is ${shapePhrase}.`
    }[role];
    const lead = W(base), first = W(c1);
    const actionText = {
      allied: () => ({ act: `Lean into ${lead}: the cards back it.`, obstacle: `Because the cards agree, the obstacle is the strength of ${lead} itself; ask whether it needs tempering.`, hope: `The cards agree, so ask honestly whether this is what you want or what you fear.`, ahead: `The cards agree, so this direction is well supported.`, root: `Notice how strongly that is still shaping the present.`, now: `This is the clearest current in this part of the reading.` }),
      opposed: () => ({ act: `Before acting, decide how much room ${lead} and ${first} each get; forcing one over the other is unlikely to settle it.`, obstacle: `Working through it means holding ${lead} and ${first} together rather than choosing one too soon.`, hope: `Part of this may be hope and part fear; the friction shows which is which.`, ahead: `Which side prevails is still open, and your choices count here.`, root: `That unresolved pull may still be live.`, now: `How you respond to this tension matters now.` }),
      withBase: () => ({ act: `Stay with ${lead}, and let ${first} inform it rather than lead.`, obstacle: `The way through is to keep hold of ${lead} while taking ${first} seriously.`, hope: `What you hope for sits closest to ${lead}; ${first} is the doubt beside it.`, ahead: `What is likely to hold, if you keep to it, is ${lead}.`, root: `The root that held was ${lead}.`, now: `The ground you stand on is still ${lead}.` }),
      withFirst: () => ({ act: `Be ready to let ${first} lead; ${lead} is where the change is needed.`, obstacle: `The way through is to let ${first} change how you hold ${lead}.`, hope: `The pull is toward ${first}; ask whether that is hope or fear speaking.`, ahead: `The change toward ${first} is likely to continue.`, root: `That change toward ${first} is part of how you got here.`, now: `The change toward ${first} is already under way.` }),
      questioned: () => ({ act: `Pause and re-examine both before committing.`, obstacle: `Neither ${lead} nor ${first} can be taken for granted here.`, hope: `Both the hope and the fear deserve a second look.`, ahead: `The outcome depends on what that re-examination brings.`, root: `What once seemed settled was being questioned.`, now: `Neither should be taken for granted right now.` }),
      reshaped: () => ({ act: `Work with ${lead} by way of ${first}.`, obstacle: `The obstacle eases when ${lead} is approached through ${first}.`, hope: `Your hopes and fears take the shape of ${first}.`, ahead: `Watch for ${lead} arriving in the form of ${first}.`, root: `${first.charAt(0).toUpperCase() + first.slice(1)} was the form ${lead} took, and it may still colour how you see things.`, now: `So the question is less whether ${lead} is present than how ${first} lets it show.` })
    }[P.shape]()[role === 'approach' ? 'act' : role];
    const action = heldBack && P.shape === 'allied' ? '' : actionText;
    // How the reversals change it.
    const rev = group.filter(c => H.reversed(c)), up = group.filter(c => !H.reversed(c));
    let reversal = '';
    if (rev.length && rev.length * 2 > group.length) reversal = `With ${rev.length === group.length ? 'every card' : 'most of these cards'} reversed, this is more held back or resisted than openly expressed; start with what is blocking it.`;
    else if (H.reversed(base)) reversal = `With ${base.name} reversed, the theme itself is under strain, and ${list(up.map(c => c.name))} show${up.length === 1 ? 's' : ''} where it can be steadied.`;
    else if (rev.length) reversal = `${list(rev.map(c => c.name))} ${rev.length === 1 ? 'is' : 'are'} reversed, so ${rev.length === 1 ? 'its' : 'their'} part in this is weaker, delayed or turned inward.`;
    const counts = {};
    group.forEach(c => { if (c.element) counts[c.element] = (counts[c.element] || 0) + 1; });
    const only = Object.keys(counts).length === 1 && group.length > 1 ? Object.keys(counts)[0] : '';
    const elementLine = only ? `Every card here is ${only}, so this plays out mainly in ${ELEMENT_DOMAIN[only]}.` : '';
    const tension = P.shape === 'opposed' || P.shape === 'questioned' || (c2 && (P.shape === 'withBase' || P.shape === 'withFirst'));
    return { lead: `${steps.join(' ')} ${frame}`, element: elementLine, guide: [action, reversal].filter(Boolean).join(' '),
      proposition: [frame, reversal].filter(Boolean).join(' '), shape: P.shape, role, tension, wider: wider(base, ctx, H) };
  }

  // Clarity card (Option B): after three Major Arcana cards, one Minor card at random from the unused Minors.
  function clarityStep(base, c1, c2, cl, pos, h) {
    const H = helpersOf(h), r = relation(base, cl, H);
    const lead = `${H.name(cl)} ${r.verb} ${H.name(base)}, and brings the three Major Arcana cards down to an everyday level.`;
    const domain = cl.suit ? SUIT_DOMAIN[cl.suit] : 'everyday life';
    const meaning = `In ${pos}, after ${base.name}, ${c1.name} and ${c2.name}, the theme of ${theme(H, cl)} points to where this may show up day to day: ${domain}.`;
    const notes = r.notes.filter(n => !/^As a Minor Arcana card/.test(n));
    return { kind: r.kind, lead, meaning, basis: [...r.basis, 'drawn at random from the unused Minor Arcana, because the original card and both clarifiers are Major Arcana (Chas\u2019s teaching rule, Option B)'], notes, connection: r.connection };
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

  return { relation, roleOf, firstStep, secondStep, clarityStep, synthesis, wider: (base, ctx, h) => wider(base, ctx, helpersOf(h)), METHOD, CELTIC_PAIRS };
});
