# Major Arcana clarifier rule vs the two-clarifier visual limit

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
at two. Until 7 Nov that stop was silent. How often it happens, derived by `audit/tools/limit-frequency.cjs`:
- **For one Major card: 7.18%, exact.** Clarifier 1 is drawn from 77 unused cards (21 Majors), then
  Clarifier 2 from 76 (20 Majors): 21/77 × 20/76 = 420/5852.
- **For a Celtic Cross with every Major clarified: about 19.0% of readings** have at least one card at the
  limit. This is an estimate: 1,000,000 seeded trials, seed 71107, 95% interval 18.88–19.03%. There is no
  simple closed form, because the cards share one deck.

(Earlier figures of "7.1%" and "18.9%" came from an unseeded quick simulation. They are replaced by the above.)

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
