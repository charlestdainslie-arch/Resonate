# Major Arcana clarifier rule vs the two-clarifier visual limit

**Decided 7 Nov 2026: Chas approved design B (the Clarity card), drawn when the seeker taps.** Built on
`claude/uat-option-b`; see `audit/DECISIONS_7NOV.md`. The frequencies below still describe how often the
Clarity card is offered. The text that follows is the analysis as it stood before the decision.

Si Aye, 7 Nov 2026, decision 7: "Paul's Major Arcana clarification rule must be reconciled with the
two-clarifier visual limit. Do not truncate the rule or introduce unlimited recursion without an explicit
design." In this repository the rule is labelled **Chas's teaching rule**; it is not attributed to Paul
Fenton-Smith as a documented published method, because no source for that has been provided.

## The rule as implemented (unchanged)

- A Major Arcana card receives Clarifier 1. Any other card may be clarified by the seeker's choice.
- If Clarifier 1 is a Major, the card receives Clarifier 2.
- At most two clarifiers per card (`clarifier-rules.js`, `MAX_PER_POSITION = 2`).

## Where the two meet

If Clarifier 2 is also a Major, the rule as taught would continue to a third clarifier, but the code stops
at two. Until 7 Nov that stop was silent. How often it happens, derived by `audit/tools/limit-frequency.cjs`.

**Assumptions (both figures):**
- 78-card deck, 22 Majors (IDs 0–21).
- Every card in a reading is distinct, and each clarifier is drawn uniformly at random from the cards not
  yet in the reading. This is what `drawRemaining` does: Fisher–Yates over the unused cards.
- Orientation (upright or reversed) plays no part in the rule.
- Chas's teaching rule as implemented: a Major gets Clarifier 1; Clarifier 2 is drawn **only if Clarifier 1
  is a Major**.

**1. One Major card: 7.18%, exact.** Given a Major original card, 77 cards remain, 21 of them Majors.
P(Clarifier 1 Major) = 21/77. Then 76 remain, 20 Majors: P(Clarifier 2 Major | Clarifier 1 Major) = 20/76.
Product: 420/5852 = 7.18%. This holds for the first Major clarified in a reading. Later ones in the same
reading face a slightly different deck.

**2. Celtic Cross: about 19.0% of readings (estimate).** Probability that at least one card reaches the
limit, under these extra assumptions:
- every Major among the ten cards is clarified;
- **no Minor card is clarified** (the seeker's optional choice is not modelled);
- **cards do not all receive two clarifiers**: Clarifier 2 is drawn only where Clarifier 1 is a Major,
  exactly as the rule says;
- cards are clarified in position order, each finished before the next, as the main button does.

1,000,000 seeded trials (mulberry32, seed 71107): 18.96%, 95% interval 18.88–19.03%. There is no simple
closed form, because the ten cards and their clarifiers share one deck. If the seeker also clarifies Minor
cards, more Majors leave the deck earlier and the figure changes. This estimate does not cover that case.

(Earlier figures of "7.1%" and "18.9%" came from an unseeded quick simulation. They are withdrawn.)

## What this UAT build does (explicit, no change to the rule)

- Nothing more is drawn and nothing is hidden. The card's reading says: "Clarifier 2 is also a Major Arcana
  card. Under the rule as taught, that would call for a further clarifier. This preview shows at most two
  clarifiers per card, so nothing further has been drawn; how to continue is a design decision awaiting Chas."
- The dock shows `NN · 2-card limit` for that card instead of `clarified ✓`.
- Tested in `tests/teaching-rules.browser.cjs`.

## Designs for Chas to choose from (none implemented)

| | Design | Ends? | Layout |
|---|---|---|---|
| A | **Stop at two, stated** (this build). | Yes, at 2. | Unchanged. |
| B | **Third card from the Minor Arcana** (earlier proposal C1): when the original card and both clarifiers are Majors, draw one "near-future clarity" card at random from the unused Minor Arcana. No redrawing until a Minor appears; nothing pre-chosen. | Yes, always at 3. | A third slot centred below Clarifiers 1 and 2. Needs layout and Golden Thread work at 360 px. |
| C | **Continue while Major, with a fixed cap N** (for example 3 or 4), with the cap stated on the page. | Yes, at N. | One more row per extra card; on a phone, a Celtic Cross card could need about 1.5 screens. |
| D | **Unbounded recursion.** | Not guaranteed by design (it ends in practice, because the deck runs out of Majors). | Not workable on a phone. Si Aye has ruled this out without a design. |

Decisions for Chas: (1) A, B or C; (2) for B, whether the third card counts as a clarifier or as a separate
"clarity" card; (3) for C, the value of N. Deep is validating the rule against her teaching.
