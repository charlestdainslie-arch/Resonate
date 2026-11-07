# Reading-engine QA — Claude's notes for Deep and Si Aye (7 Nov 2026)

Author: Claude (builder). These notes are **not** QA verdicts. PASS / FAIL / BLOCKED is Deep's call, recorded
in `audit/qa-samples/README.md`. They list what I noticed while making the samples, so the reviewers can
confirm or reject each point.

## Samples

`audit/qa-samples/`: 21 readings, all five spreads, rendered through the app's own clarify function.
- 15 baselines, 3 per spread: as dealt (no clarifiers), the clarifiers the rule requires, and every card clarified.
- 6 boundary cases:
  - B01: two-Major limit.
  - B02: no Major Arcana, Minor clarifiers only.
  - B03: Deep's Seven of Cups / Hermit reversed / Eight of Pentacles case, in the Relationship spread.
  - B04: every card reversed.
  - B05: a written card connection, same suit, and a number echo.
  - B06: a Celtic Cross of ten Majors.

Each sample lists card IDs, positions, orientations, the clarifier sequence, the whole reading, the Golden
Thread, and Max's narration and caption transcript. Mechanical checks are in `tests/reading-engine-qa.browser.cjs` (23 checks).

## Fixed while preparing the samples

| # | Found in | What was wrong | Fix |
|---|---|---|---|
| Q1 | S15, Present Situation | Queen of Wands, Justice and Nine of Swords, all reversed, were called "a consistent message" and the seeker was told to work with the theme "with some confidence". | When most of the cards are reversed, an agreement is now read as a shared difficulty: "read the shared theme as something blocked, delayed or turned inward". Unit-tested. |
| Q2 | S15 | The wider-spread line printed "Queen of Wands (reversed) (clarified)". | Now prints "(reversed; clarified)". |
| Q2b | S13, all Celtic Cross samples | **Positional defect.** "Your Approach" and "Potential Outcome" never received their intended position lenses, because the label check was case-sensitive ("approach", "outcome" against capitalised labels). They fell through to the generic "Here, … is a lens" line. The lines are pre-existing; I found the bug while writing Q3. | Made the check case-insensitive. Your Approach now gets the next-step lens; Potential Outcome now gets the possible-development lens ("a possibility, not a fixed result"). Checked by tests/reading-engine-qa.browser.cjs. |

## Open: for Deep to judge (not changed)

| # | Where | Observation |
|---|---|---|
| Q3 | Position lens (`positionContext`, app.js) | Templated. Before the Q2b fix, 7 of 10 Celtic Cross positions used the same template; after it, 5 of 10 still do: "Here, *keywords* is a lens for *position role*. Identify one concrete example…". The keyword list is pasted in raw, which gives grammar such as "Here, drift, force, conflicting aims is a lens…". This template predates this work. |
| Q4 | Numerology line (card data) | Templated across the deck: "In *card*, consider how this relates to *keyword*." |
| Q5 | Clarifier relationships (`clarifier-reading.js`) | The kind of relationship (reinforces, supports, challenges, modifies) comes from elements and orientation only. Suit, number and Major/Minor status are shown as reasons and notes, but they do not change the kind. Elemental dignities is one convention among several; whether it is the right basis is Deep's call. |
| Q6 | Wider spread line | Celtic Cross pairs and neighbouring positions are related through the original cards only. The partner card's clarifiers are mentioned ("clarified") but not interpreted. |
| Q7 | Major Arcana elements (card data) | The relationships depend on each Major's element in the card data (for example The Fool Air, Wheel of Fortune Fire, Judgement Fire, The World Earth). The data does not record where these come from; provenance is OPEN (audit/sources). Deep to confirm the assignments. |
| Q8 | Golden Thread card-to-card links | As in G2: most links between positions are the generic fallback, because written connections exist for only a few card pairs. |
| Q9 | Keywords (card data) | Some reversed keyword lists mix easing and distress, for example Nine of Swords reversed: "Support, Easing Anxiety, Hidden Distress". The generated "Together" lines use the first keyword only, which can tilt the summary. |
| Q10 | Two-clarifier limit | The limit is stated on the page; design A, B or C is a decision for Chas (audit/RULE_RECONCILIATION.md). |

## Not covered

- Real Android devices (Dev).
- Voice acceptance (Chas).
- Interpretive accuracy against tarot sources (Deep).
- Readings opened from the Journal are covered by the existing teaching-rules and presenter tests, not by these samples.
