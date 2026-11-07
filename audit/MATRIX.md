# QA matrix: 16 baseline + 10 boundary (Si Aye, 7 Nov 2026)

Commit **4dc4df5af4568490e7472090e51bb0600107a518**. Automated results come from the unedited logs in `audit/builds/test-run-4dc4df5/`, read by `audit/tools/qa-matrix.cjs`. Preview: https://resonate-jrt39x8af-charlestdainslie-6956.vercel.app/presenter-uat.html (add `?qa=<sample>`).

Columns: **Automated** = Claude's scripted checks only (structure, rule, state, narration lifecycle with a stand-in speech engine). It is not interpretive QA and not audio QA. **Interpretation (Deep)** and **Samsung audio (Dev)** stay BLOCKED until they record a result with evidence; "n/a" means the case does not ask for that check.

| Case | As written in the matrix | Executed by | Differences / notes | Automated (Claude) | Interpretation (Deep) | Samsung audio + captions (Dev) |
|---|---|---|---|---|---|---|
| OC-01 | Fool upright, no clarifier. | [OC-01](qa-samples/OC-01.md) | The Fool is a Major, so the rule makes Clarifier 1 due; shown as the reading before it is drawn. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| OC-02 | Ten of Swords reversed. | [OC-02](qa-samples/OC-02.md) |  | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| OC-03 | Tower upright, Star upright clarifier. | [OC-03](qa-samples/OC-03.md) | The Star is a Major, so the rule makes Clarifier 2 due; the matrix gives none, so the page shows it as due (not drawn). | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| TC-01 | Ace of Pentacles U / Five of Cups U / Six of Wands U. | [TC-01](qa-samples/TC-01.md) |  | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| TC-02 | Eight of Cups R / Nine of Wands U / Ten of Cups U. | [TC-02](qa-samples/TC-02.md) |  | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| TC-03 | Lovers U / Two of Cups R / Star U; clarifier on Present. | [TC-03](qa-samples/TC-03.md) | Clarifier card not given: seeded draw (stated in the sample). Lovers and Star are Majors: their own rule clarifiers are not drawn (the matrix does not ask for them) and show as due. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| TC-04 | Wheel of Fortune R / Four of Pentacles U / Six of Pentacles R; two-clarifier chain on Present. | [TC-04](qa-samples/TC-04.md) | Clarifier cards not given. A chain needs a Major Clarifier 1, so Clarifier 1 is the first unused Major in a seeded order, and Clarifier 2 the next card (stated in the sample). | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| RC-01 | Two of Cups U / Hermit R / Lovers U / Five of Wands U / Ace of Cups U. | [RC-01](qa-samples/RC-01.md) | Implemented position names: You, The Other Person, The Connection, Relationship Challenge, Shared Guidance. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| RC-02 | Queen of Cups R / King of Swords U / Page of Wands U / Eight of Cups U / Star U; clarifier on Connection. | [RC-02](qa-samples/RC-02.md) | "Connection" is position 3, "The Connection". Clarifier card not given: seeded draw. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| RC-03 | Devil U / Hierophant R / Three of Cups U / Four of Cups U / Judgement U. | [RC-03](qa-samples/RC-03.md) |  | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| SC-01 | Mixed orientations, clarifier on Foundation. | [S12](qa-samples/S12.md) | The Seven-card V has no "Foundation" position (its positions: Past · 18–24 Months, Present Time, Near Future · 3 Months, You / Answer, Surrounding Energies, Hopes, Fears & Attitude, Outcome · Next 18–24 Months). Mapped to existing S12: mixed orientations with every position clarified, so whichever position was meant is covered. Si Aye/Deep to name the intended position if a single-position case is wanted. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| SC-02 | Two Majors, reversed anchor, two-clarifier chain. | [SC-02](qa-samples/SC-02.md) | Cards not given: seeded deal (first seed with exactly two Majors, one reversed); chain on that reversed Major; Clarifier 1 the first unused Major in seeded order. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| CC-01 | All upright, no clarifiers. | [CC-01](qa-samples/CC-01.md) | Cards not given: seeded deal, all upright. Majors in it show Clarifier 1 as due. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| CC-02 | Reversal-heavy, clarifier on Past. | [CC-02](qa-samples/CC-02.md) | Celtic Cross has no "Past": the position is "Recent Past" (4). Cards not given: first seeded deal with at least 7 of 10 reversed; clarifier seeded. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| CC-03 | Major-heavy, two Major clarifiers and rule boundary. | [B06](qa-samples/B06.md) | Mapped to existing B06: ten Majors, 8 Clarifier 2s, 4 positions at the two-clarifier limit. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| SC-Q | (added 7 Nov) Seven-card question reading: position 4 read last. | [B08](qa-samples/B08.md) | Approved by Chas on 7 Nov. Not one of the original 16; listed so the new behaviour has a row. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| CC-04 | Hermit R + Eight of Pentacles U clarifier, full applicable chain. | [CC-04](qa-samples/CC-04.md) | Position not given: placed at 1 (Present Situation); other nine cards seeded. Eight of Pentacles is not a Major, so the applicable chain ends at Clarifier 1. | PASS | BLOCKED: awaiting Deep | BLOCKED: awaiting Dev |
| BT-01 | C2 without C1 must be refused. | [OC-02](qa-samples/OC-02.md) |  | PASS | n/a | n/a |
| BT-02 | Attempt to clarify a clarifier must not trigger recursive clarification. | [B07](qa-samples/B07.md) |  | PASS | n/a | n/a |
| BT-03 | Two Major clarifiers: demonstrate the implemented limit and flag any conflict with Chas's approved rule. | [B01](qa-samples/B01.md), [B07](qa-samples/B07.md), [B06](qa-samples/B06.md) | Resolved by Chas on 7 Nov: Option B. With a Major original and two Major clarifiers, one Clarity card is drawn at random from the unused Minor Arcana, then the rule stops. With a Minor original and two Major clarifiers, Option B as approved does not apply and the two-clarifier limit is stated (open question for Chas, audit/RULE_RECONCILIATION.md). | PASS | BLOCKED: awaiting Deep | n/a |
| BT-04 | Add clarifier during Max narration: stop stale playback immediately and offer updated narration. | [S14](qa-samples/S14.md) |  | PASS | n/a | BLOCKED: awaiting Dev |
| BT-05 | Reversed anchor + reversed clarifier: both reflected explicitly in interpretation. | [B04](qa-samples/B04.md) |  | PASS | BLOCKED: awaiting Deep | n/a |
| BT-06 | Contradictory clarifier: retain Stage 1 and visibly revise interpretation. | inline: The Tower, Clarifier 1 Death, Clarifier 2 The Star |  | PASS | BLOCKED: awaiting Deep | n/a |
| BT-07 | Change card mid-flow: no inherited or migrated clarifiers. | [S15](qa-samples/S15.md), then a new Celtic Cross |  | PASS | n/a | n/a |
| BT-08 | Approved shuffle regression: byte-for-byte identical. | — | Reference 73da97d (approved 6 Nov). Also shuffle-identity.txt (git blob comparison). | PASS | n/a | n/a |
| BT-09 | Clarify without card selection: explicit selection prompt. | [S13](qa-samples/S13.md) | Built 7 Nov: the dock reads "choose a card" when no card is in view, and tapping it prompts instead of guessing. | PASS | n/a | BLOCKED: awaiting Dev |
| BT-10 | Pause narration, add clarifier, resume: no stale audio or captions. | [S14](qa-samples/S14.md) |  | PASS | n/a | BLOCKED: awaiting Dev |

Totals: automated 27 PASS, 0 FAIL, 0 NOT RUN of 27. Interpretation: 20 BLOCKED. Samsung audio: 20 BLOCKED.

## Deep's six failure modes: where to look

| # | Failure mode | Where in the evidence | Claude's notes (not verdicts) |
|---|---|---|---|
| 1 | Templating | Position lens (`Position: … — …`), numerology line, "Together" wording in every sample | Q3, Q4 in QA_ENGINE_CLAUDE_NOTES.md: the position lens and the numerology line are templates. The relationship and "Together" lines are generated by rule (clarifier-reading.js). |
| 2 | Positional drift | Position lens per position; compare with audit/POSITIONS.md | Q2b fixed (Your Approach, Potential Outcome). The Seven-card "You / Answer is interpreted last" ordering is not implemented (recorded, not changed). |
| 3 | Reverse-as-opposite | Reversed cards in OC-02, TC-02, B04, CC-02 | Reversed meanings and keywords are separate texts in the card data, not generated negations; relationships treat one reversed card as a change of emphasis (Q1). |
| 4 | Parallel clarification | Clarifier sections: the meaning paragraph is the card's own; the relationship lines name the anchor | Step 2/3 always name the anchor (automated check). Whether the meaning paragraph reads as "about itself" is Deep's call. |
| 5 | Concatenation instead of synthesis | "Together" sections | Generated from relationship kinds, shared element and keywords; Q5 and Q9 list its limits. |
| 6 | Numerical/symbolic overreach | Correspondences, numerology lines, "Read this way because" lines | Elemental dignities is labelled as RESONATE's method; element and astrology values in the card data have no recorded source (Q7, OPEN). |
