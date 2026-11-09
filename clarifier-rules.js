/* RESONATE · clarifier rules (Chas's teaching rule, approved in Issue #13, 25 Oct 2026).
   - A Major Arcana card in the spread receives a first clarifier.
   - A second clarifier is due when the first clarifier is itself a Major Arcana card.
   - Any other card may be clarified by the seeker's own choice (one tap). Likewise, when the first clarifier is
     a Minor, the seeker may choose a second (Chas, laptop UAT, 9 Nov 2026: the second layer offers every card,
     as the first does; due after a Major, the seeker's choice after a Minor).
   - Never more than two clarifiers for a position, and no card appears twice in one reading.
   - Clarity card (Option B, approved by Chas on 7 Nov 2026): when the original card, Clarifier 1 and Clarifier 2
     are all Major Arcana, the seeker may draw one Clarity card, at random from the unused Minor Arcana. It is not
     a clarifier: the two-clarifier limit stands, and the rule does not continue past the Clarity card.
   Pure functions: no DOM, no state. The app keeps its existing layer arrays, with null for "no clarifier". */
(function (root) {
  'use strict';
  const MAX_PER_POSITION = 2;

  function isMajor(card) { return !!card && card.arcana === 'Major'; }

  // first: array (one entry per position) of clarifier-1 card ids or null; second likewise.
  function plan(baseCards, first, second, byId, clarity) {
    const n = baseCards.length;
    first = first || []; second = second || []; clarity = clarity || [];
    const positions = [];
    for (let i = 0; i < n; i++) {
      const base = baseCards[i];
      const c1 = first[i] == null ? null : first[i];
      const c2 = second[i] == null ? null : second[i];
      const c1Card = c1 == null ? null : byId(c1);
      const cl = clarity[i] == null ? null : clarity[i];
      const allMajor = isMajor(base) && isMajor(c1Card) && c2 != null && isMajor(byId(c2));
      positions.push({
        index: i,
        baseMajor: isMajor(base),
        first: c1,
        second: c2,
        // Rule 1: a Major gets a clarifier without being asked.
        needsFirst: c1 == null && isMajor(base),
        // Seeker's choice: any other card may be clarified once.
        mayChooseFirst: c1 == null && !isMajor(base),
        // Rule 2: a second is due when the first clarifier is a Major.
        needsSecond: c1 != null && c2 == null && isMajor(c1Card),
        // Seeker's choice: after a Minor first clarifier, a second may be chosen (9 Nov 2026).
        mayChooseSecond: c1 != null && c2 == null && !isMajor(c1Card),
        clarity: cl,
        // Option B: original, Clarifier 1 and Clarifier 2 all Major, and no Clarity card yet.
        needsClarity: allMajor && cl == null,
        count: (c1 != null ? 1 : 0) + (c2 != null ? 1 : 0)
      });
    }
    return {
      positions,
      pendingFirst: positions.filter(p => p.needsFirst).map(p => p.index),
      pendingSecond: positions.filter(p => p.needsSecond).map(p => p.index),
      pendingClarity: positions.filter(p => p.needsClarity).map(p => p.index),
      optional: positions.filter(p => p.mayChooseFirst).map(p => p.index),
      optionalSecond: positions.filter(p => p.mayChooseSecond).map(p => p.index)
    };
  }

  // Validates a finished reading against the rule. Returns a list of problems (empty = valid).
  function validate(baseCards, first, second, byId, clarity) {
    const problems = [];
    const used = baseCards.map(c => c && c.id);
    first = first || []; second = second || []; clarity = clarity || [];
    baseCards.forEach((base, i) => {
      const c1 = first[i] == null ? null : first[i];
      const c2 = second[i] == null ? null : second[i];
      if (c2 != null && c1 == null) problems.push(`position ${i + 1}: second clarifier without a first`);
      const cl = clarity[i] == null ? null : clarity[i];
      if (cl != null && !(isMajor(base) && isMajor(byId(c1)) && c2 != null && isMajor(byId(c2)))) problems.push(`position ${i + 1}: Clarity card without three Major Arcana cards`);
      if (cl != null && isMajor(byId(cl))) problems.push(`position ${i + 1}: Clarity card must be a Minor Arcana card`);
      [c1, c2, cl].filter(id => id != null).forEach(id => {
        if (used.includes(id)) problems.push(`position ${i + 1}: card ${id} repeated`);
        used.push(id);
      });
    });
    return problems;
  }

  const api = { MAX_PER_POSITION, isMajor, plan, validate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ResonateClarifiers = api;
})(typeof window !== 'undefined' ? window : globalThis);
