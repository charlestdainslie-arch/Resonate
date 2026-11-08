# Interpretation engine remediation (Si Aye directive, 9 Nov 2026; Deep's CC-03 / BT-03 audit)

Issue #49 is the audit record. **Interpretive QA is not marked PASS here: Deep rechecks independently.**

## Commits (pinned separately)

| What | Commit | Branch |
|---|---|---|
| Code Deep audited | `b661280f07649e2b9cb824b298fcb5af167040f2` | `claude/uat-clarity-thread` |
| Corrected application | `282cd1457ec94e8436f81b3867799f45dfcad110` | `claude/uat-thread-fixes` (from `988abd8`) |
| This evidence | the commit that adds this file (`git log -- audit/DEEP_RECHECK_9NOV.md`) | `claude/uat-thread-fixes` |

The application commits on the branch are `4ee2e81` (engine), `1133fbf` and `282cd14` (two tests updated to the new wording). App files changed against `b661280`: `clarifier-reading.js`, `app.js`, `presenter.js`. There are no changes to the shuffle, deal, secure draws, layouts, clarifier placement, Max's controls or lifecycle, mobile layout, journal, PDF code, or Chas's rules (`clarifier-rules.js` is untouched).

## Deep's findings, as given

**BT-03:** functional PASS on the demonstrated path; "Together" FAIL (template); Golden Thread FAIL (keyword listing; Overall Invitation ignores most cards); Minor-original case BLOCKED (not demonstrated). **CC-03 carryover:** synthesis and templating FAIL; Golden Thread FAIL, including the Magician bridge, which read the reversed Magician with upright qualities; "As the next step in the Major Arcana sequence…" lines formulaic. **SHA-256 of the last ZIP:** BLOCKED (the file did not reach Deep).

## What changed

### 1. "Together" is one proposition (`clarifier-reading.js` `synthesis()`), in all five spreads

It is built card by card from the cards as drawn:
- the original card sets the theme (its orientation's keywords);
- Clarifier 1 *says the same thing more strongly* / *gives it somewhere to go* / *pushes back* / *changes its emphasis* (elemental dignities, adjusted for orientation);
- Clarifier 2 *brings them together* / *sides with* the original or Clarifier 1 / *unsettles both* / *adds a further angle*;
- the Clarity card grounds the three Majors in its suit's area of life;
- then one proposition, framed by what the position asks (guidance, approach, obstacle, hopes and fears, what lies ahead, roots, what is active now), with what follows for the seeker;
- then how the reversals change it. A mostly-reversed agreement is a shared difficulty, never "lean into it".

The element line appears only when every card shares one element. The keyword list, the "Two of the four cards are…" count and the stock prompts are gone. The page, the PDF and Max read the same text (Max quotes `.synthesis-lead` word for word). Before / after for every audit sample: `audit/deep-recheck-9nov/before-after/`.

### 2. Golden Thread (`app.js`)

- **Per position:** the same proposition as that position's "Together", or the card's position lens when it stands alone. The keyword listing and the "astrological correspondences in dialogue" line are removed. Each card's correspondences stay on the card.
- **From card to card:** each bridge says how a card relates to the one before it, from the two cards as drawn, and names both with their orientation. The stock "next step in the Major Arcana sequence" line is gone, and so is the generic closing line. The movement line names the turning points.
- **Overall Invitation:**
  - a theme from every card in turn (no card is crowded out);
  - where the element weight falls;
  - the positions in tension;
  - a note when most cards are reversed;
  - a question from the card the reading ends on. This is its own written prompt, so in a Seven-card question reading it comes from position 4.
- **Numbers section:** unchanged (Deep passed the arithmetic).

### 3. Reversals across all 78 cards

The card data's written connections describe the two cards **upright**. They were quoted with a reversed card in two places: the Golden Thread bridge (the Magician case) and the clarifier relation notes. Both now quote a connection only when both cards are upright. New test `tests/reversal-identity.browser.cjs` checks each of the 78 cards, in both orientations, as an original card clarified by a card it has a written connection with. It checks:
- **Identity:** name, orientation label, and meaning text from its own orientation.
- **Reversals:** a reversed card never gets its upright meaning, upright keywords or upright-pair connection, on the page, in the Golden Thread or in Max.
- **Relationships:** "Together" names both cards, says how they relate, ends in a proposition, is not the old template, and Max narrates it.
- **Bridges:** 312 card-to-card bridges, with orientation named and no upright connection beside a reversed card.

Result: 781 checks pass.

### 4. Minor-original boundary (Option B as approved 7 Nov; not reopened)

New sample **B09**: Two of Swords (Minor) + The Tower + Judgement. No Clarity card is offered (no button, `pendingClarity` empty). The page states: "Clarifier 2 is also a Major Arcana card. The Clarity card applies only when the original card is a Major too, so nothing further is drawn here (at most two clarifiers per card)." It is in the BT-03 row with B01, B07, B06 and the live draws, and its stale "open question" note is replaced.

## Evidence (all at app `282cd14`)

- `audit/deep-recheck-9nov/handoff/`: every Deep case regenerated. **CC-03.md** is sample B06-LIVE (the seeker's live Clarity taps at positions 1, 3, 5 and 9 on the corrected code) followed by B06 before the taps. **BT-03.md** is B01-LIVE, B01, B07, B06-LIVE, B06 and B09. Each file has draw records, orientations, interpretations with revisions, the Golden Thread, Max's script before and after Finish, and the lines Max spoke on the live run.
- `audit/deep-recheck-9nov/live/`: the live recording (`clarity-live.json`, `live-samples.json`). B06 drew Seven of Wands, Seven of Pentacles (reversed), King of Pentacles and Queen of Pentacles; B01 drew Three of Pentacles (reversed). All are unused Minors. The replay of the recorded draws is identical.
- `audit/deep-recheck-9nov/before-after/`: before (`b661280`) and after (`282cd14`) for B06-LIVE, B01-LIVE, B07, B09, CC-04, SC-02, B03, B04. Each shows the "Together" per position, the Golden Thread, and Max after Finish.
- `audit/builds/test-run-282cd14/`: clean full run on a detached checkout of `282cd14` (logs, `summary.tsv`, `LOGS.sha256`, shuffle identity against `73da97d`).

## Example: B01-LIVE, Guidance

**Before:** "Together, Death, The Tower, Judgement and Three of Pentacles (reversed) give Guidance a message with real tension in it: transition, disruption, awakening and poor coordination. Two of the four cards are Fire, putting the weight on energy, will and action. Treat the friction as information: what would honour both sides?"

**After:** "Death sets the theme in Guidance: transition and release. The Tower pushes back, setting disruption against transition; that friction is part of the message. Judgement sides with The Tower, carrying disruption forward through awakening and asking what in transition has to change. Three of Pentacles (reversed) grounds all three in work, money, body and the material world: in everyday terms, this is likely to show up as poor coordination and undervalued work. As guidance, the cards point to transition giving way to disruption, with awakening pushing that change on, landing day to day as poor coordination. Be ready to let disruption lead; transition is where the change is needed. Three of Pentacles is reversed, so its part in this is weaker, delayed or turned inward."

## Limits, stated

- The engine composes from RESONATE's own card data: orientation keywords and meanings, elements, suits, and written prompts and connections. It adds no outside source and makes no prediction beyond the cards. Its phrasing is still generated, so Deep may find wording to tighten; that is for his recheck.
- The Golden Thread's numbers section is unchanged.
- Audible output on a Samsung is still Dev's check. Max's lines here are the words sent to speech, not audio.

No merge. No production change. No spending.
