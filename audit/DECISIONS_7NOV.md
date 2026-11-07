# Chas's decisions, 7 Nov 2026: what was built

Chas approved three changes on 7 Nov 2026 (in this session, by tapping "Approve all three"):
- Option B for clarifiers;
- Seven-card position 4 read last for question readings;
- secure randomness for live draws.

He chose "seeker taps" for how the Option B card is drawn, and had no preference on its name, so it is called
the **Clarity card**. Built on UAT branch `claude/uat-option-b`. No merge, no production change, no spending.

## 1. Option B: the Clarity card

- **When.** The original card, Clarifier 1 and Clarifier 2 are all Major Arcana. This is the wording
  approved in `RULE_RECONCILIATION.md`, design B.
- **What.** One card, drawn **at random from the Minor Arcana cards not already in the reading**:
  - `ResonateDeck.drawRemaining` over the unused Minors, with the same secure source as the shuffle;
  - no redrawing until a Minor appears, and nothing chosen in advance.
- **How.** The seeker taps. The dock's ✦ Clarify shows `NN · Clarity card`; the card's own button is
  "✦ Draw Clarity card"; the main button reads "Draw Clarity card for NN · …".
- **It is not a clarifier.**
  - The two-clarifier limit stands (`MAX_PER_POSITION = 2`).
  - The rule stops after the Clarity card, even if more Majors could follow; there is no recursion.
  - It is stored as layer 3, so the Journal saves and reopens it.
- **On the table.** Centred below Clarifiers 1 and 2, with a dashed border and the label "CLARITY CARD". In
  the one-card layout, where the clarifiers flank the original, it sits under the original card.
- **In the reading.**
  - It gets its own step, "Clarity card · where the three Major cards land": its meaning, how it relates to
    the original card, and where the theme may show up day to day (from its suit).
  - "Together" becomes Revision 3. Revisions 1 and 2 stay readable.
- **Max.** A Clarity card chapter (`c3`) with its own frame lines, quoted word for word from the page.
- **Rule module.** `clarifier-rules.js`:
  - `plan()` gains `needsClarity` and `pendingClarity`;
  - `validate()` rejects a Clarity card without three Majors, a Major Clarity card, or a repeated card.

**Open question for Chas:** a **Minor** original card with two Major clarifiers. Option B as approved needs
a Major original, so no Clarity card is offered; the page says the limit applies. Should Option B also cover
this case? (It is where the rule would continue too.)

## 2. Seven-card question readings: position 4 last

- A tick box on the reading page: **"I'm asking a specific question"**. When ticked, position 4 ("You /
  Answer") moves to the end of the written reading, the PDF and Max's narration. The cards stay where they
  were dealt, and the default is unticked.
- It is on the reading page, not before the draw: the draw stage is in `reading-stage.js`, part of the
  frozen shuffle-and-deal flow. Ticking it re-orders at once, and the setting applies to that reading only.
  The Journal saves it.

## 3. Secure randomness for live draws

- `deck-engine.js`:
  - `shuffle`, `drawRemaining` and `newLayer` now default to `secureRandom()`. It takes 53 random bits per
    number from `crypto.getRandomValues`, the standard construction for a uniform number in [0, 1).
  - Fisher–Yates is unchanged: 77 secure numbers for 78 cards.
  - The largest bias this can introduce is below 78 / 2^53, about 9e-15, per choice.
  - `randomSource()` reports the source. It falls back to `Math.random` only where no cryptographic
    generator exists, which is not the case in current browsers or Node 22.
- Reversals (`orientCards`) use the same source.
- **The approved shuffle animation and deal are unchanged:**
  - `deck-theatre.js`, `deck-theatre.css` and `reading-stage.js` are byte-identical to `73da97d`;
  - only the random source inside `deck-engine.js` changed, as approved.
  - BT-08 (`tests/shuffle-frozen.test.cjs`) now pins the approved new `deck-engine.js`.
  - `audit/tools/shuffle-identity.sh` compares `deck-engine.js` against that approved version, and the other
    three files against `73da97d`.
- Tests:
  - `tests/secure-random.test.cjs`: the source is crypto; no Math.random during a shuffle; 77 secure numbers;
    still a permutation; a first-card chi-square bound over 78,000 shuffles.
  - `tests/deck-theatre.browser.cjs`: the shuffle takes 77 crypto numbers and 0 Math.random; the animation
    takes none.

## Tests and samples added or changed

- `tests/clarity-card.test.cjs` (rule).
- `tests/boundary-matrix.browser.cjs`:
  - BT-03 now draws the Clarity card from the dock;
  - BT-02 uses a finished Clarity case.
- `tests/clarify-per-card.browser.cjs` draws the Clarity card at 360, 412 and 1280 px and checks it is a Minor,
  below both clarifiers, centred within 12 px, overlapping nothing, with its label on screen.
- `tests/teaching-rules.browser.cjs` covers the Clarity card in three-card and Celtic Cross readings, and its
  Journal save and reopen.
- New QA samples:
  - B07: Death, The Tower, Judgement, then the Clarity card;
  - B08: Seven-card question reading.
  - Matrix row SC-Q.
- Helpers (`clarify-all`) now complete the Clarity card too. Counts in spread-parity, browser-uat and
  presenter account for it.
