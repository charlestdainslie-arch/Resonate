// Si Aye's QA matrix (7 Nov 2026): 16 baseline cases (OC, TC, RC, SC, CC) and 10 boundary tests (BT), each
// mapped to the sample or test that executes it, with any difference from the matrix as written.
// `auto` lists where the automated result is read from: [log file, line prefix]. Interpretation (Deep) and
// Samsung audio (Dev) are never filled in here; they stay BLOCKED until those reviewers record a result.
'use strict';
const QA = 'reading-engine-qa.browser.log', BT = 'boundary-matrix.browser.log', UNIT = 'unit-all.log';
const base = (id, text, sample, diff = '') => ({ id, kind: 'baseline', text, sample, diff, auto: [[QA, `PASS  ${sample} `]], deep: true, dev: true });
module.exports = [
  base('OC-01', 'Fool upright, no clarifier.', 'OC-01', 'The Fool is a Major, so the rule makes Clarifier 1 due; shown as the reading before it is drawn.'),
  base('OC-02', 'Ten of Swords reversed.', 'OC-02'),
  base('OC-03', 'Tower upright, Star upright clarifier.', 'OC-03', 'The Star is a Major, so the rule makes Clarifier 2 due; the matrix gives none, so the page shows it as due (not drawn).'),
  base('TC-01', 'Ace of Pentacles U / Five of Cups U / Six of Wands U.', 'TC-01'),
  base('TC-02', 'Eight of Cups R / Nine of Wands U / Ten of Cups U.', 'TC-02'),
  base('TC-03', 'Lovers U / Two of Cups R / Star U; clarifier on Present.', 'TC-03', 'Clarifier card not given: seeded draw (stated in the sample). Lovers and Star are Majors: their own rule clarifiers are not drawn (the matrix does not ask for them) and show as due.'),
  base('TC-04', 'Wheel of Fortune R / Four of Pentacles U / Six of Pentacles R; two-clarifier chain on Present.', 'TC-04', 'Clarifier cards not given. A chain needs a Major Clarifier 1, so Clarifier 1 is the first unused Major in a seeded order, and Clarifier 2 the next card (stated in the sample).'),
  base('RC-01', 'Two of Cups U / Hermit R / Lovers U / Five of Wands U / Ace of Cups U.', 'RC-01', 'Implemented position names: You, The Other Person, The Connection, Relationship Challenge, Shared Guidance.'),
  base('RC-02', 'Queen of Cups R / King of Swords U / Page of Wands U / Eight of Cups U / Star U; clarifier on Connection.', 'RC-02', '"Connection" is position 3, "The Connection". Clarifier card not given: seeded draw.'),
  base('RC-03', 'Devil U / Hierophant R / Three of Cups U / Four of Cups U / Judgement U.', 'RC-03'),
  { id: 'SC-01', kind: 'baseline', text: 'Mixed orientations, clarifier on Foundation.', sample: 'S12', diff: 'The Seven-card V has no "Foundation" position (its positions: Past · 18–24 Months, Present Time, Near Future · 3 Months, You / Answer, Surrounding Energies, Hopes, Fears & Attitude, Outcome · Next 18–24 Months). Mapped to existing S12: mixed orientations with every position clarified, so whichever position was meant is covered. Si Aye/Deep to name the intended position if a single-position case is wanted.', auto: [[QA, 'PASS  S12 ']], deep: true, dev: true },
  base('SC-02', 'Two Majors, reversed anchor, two-clarifier chain.', 'SC-02', 'Cards not given: seeded deal (first seed with exactly two Majors, one reversed); chain on that reversed Major; Clarifier 1 the first unused Major in seeded order.'),
  base('CC-01', 'All upright, no clarifiers.', 'CC-01', 'Cards not given: seeded deal, all upright. Majors in it show Clarifier 1 as due.'),
  base('CC-02', 'Reversal-heavy, clarifier on Past.', 'CC-02', 'Celtic Cross has no "Past": the position is "Recent Past" (4). Cards not given: first seeded deal with at least 7 of 10 reversed; clarifier seeded.'),
  { id: 'CC-03', kind: 'baseline', text: 'Major-heavy, two Major clarifiers and rule boundary.', sample: 'B06', diff: 'Mapped to existing B06: ten Majors, 8 Clarifier 2s, 4 positions at the two-clarifier limit.', auto: [[QA, 'PASS  B06 ']], deep: true, dev: true },
  { id: 'SC-Q', kind: 'baseline', text: '(added 7 Nov) Seven-card question reading: position 4 read last.', sample: 'B08', diff: 'Approved by Chas on 7 Nov. Not one of the original 16; listed so the new behaviour has a row.', auto: [[QA, 'PASS  B08 ']], deep: true, dev: true },
  base('CC-04', 'Hermit R + Eight of Pentacles U clarifier, full applicable chain.', 'CC-04', 'Position not given: placed at 1 (Present Situation); other nine cards seeded. Eight of Pentacles is not a Major, so the applicable chain ends at Clarifier 1.'),
  { id: 'BT-01', kind: 'boundary', text: 'C2 without C1 must be refused.', sample: 'OC-02', auto: [[BT, 'PASS  BT-01 ']] },
  { id: 'BT-02', kind: 'boundary', text: 'Attempt to clarify a clarifier must not trigger recursive clarification.', sample: 'B07', auto: [[BT, 'PASS  BT-02 ']] },
  { id: 'BT-03', kind: 'boundary', text: "Two Major clarifiers: demonstrate the implemented limit and flag any conflict with Chas's approved rule.", sample: 'B01, B07, B06', diff: 'Resolved by Chas on 7 Nov: Option B. With a Major original and two Major clarifiers, one Clarity card is drawn at random from the unused Minor Arcana, then the rule stops. With a Minor original and two Major clarifiers, Option B as approved does not apply and the two-clarifier limit is stated (open question for Chas, audit/RULE_RECONCILIATION.md).', auto: [[BT, 'PASS  BT-03 '], [QA, 'PASS  B01 '], [QA, 'PASS  B07 '], [QA, 'PASS  B06 ']], deep: true },
  { id: 'BT-04', kind: 'boundary', text: 'Add clarifier during Max narration: stop stale playback immediately and offer updated narration.', sample: 'S14', auto: [[BT, 'PASS  BT-04 ']], dev: true },
  { id: 'BT-05', kind: 'boundary', text: 'Reversed anchor + reversed clarifier: both reflected explicitly in interpretation.', sample: 'B04', auto: [[BT, 'PASS  BT-05 ']], deep: true },
  { id: 'BT-06', kind: 'boundary', text: 'Contradictory clarifier: retain Stage 1 and visibly revise interpretation.', sample: 'inline: The Tower, Clarifier 1 Death, Clarifier 2 The Star', auto: [[BT, 'PASS  BT-06 ']], deep: true },
  { id: 'BT-07', kind: 'boundary', text: 'Change card mid-flow: no inherited or migrated clarifiers.', sample: 'S15, then a new Celtic Cross', auto: [[BT, 'PASS  BT-07 ']] },
  { id: 'BT-08', kind: 'boundary', text: 'Approved shuffle regression: byte-for-byte identical.', sample: '—', diff: 'Reference 73da97d (approved 6 Nov). Also shuffle-identity.txt (git blob comparison).', auto: [[UNIT, 'ok '], ['shuffle-identity.txt', 'shuffle-identity exit 0']], unitMatch: 'BT-08' },
  { id: 'BT-09', kind: 'boundary', text: 'Clarify without card selection: explicit selection prompt.', sample: 'S13', diff: 'Built 7 Nov: the dock reads "choose a card" when no card is in view, and tapping it prompts instead of guessing.', auto: [[BT, 'PASS  BT-09 ']], dev: true },
  { id: 'BT-10', kind: 'boundary', text: 'Pause narration, add clarifier, resume: no stale audio or captions.', sample: 'S14', auto: [[BT, 'PASS  BT-10 ']], dev: true },
];
