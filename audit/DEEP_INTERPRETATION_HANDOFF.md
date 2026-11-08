# Deep interpretation handoff (Si Aye QA directive, 8 Nov 2026)

**App code under test:** `f321114def71f3c7239f5b498c610135d02516c8` (branch `claude/uat-max-lifecycle`, from frozen `4dc4df5`).
**Evidence commit:** `7d4fbe4737114b80de697bba250f1566d6917473`. All links below are immutable links to that commit. It adds evidence and test-helper files only: `git diff --name-only f321114 7d4fbe4 -- . ':!audit' ':!tests'` prints nothing.
No merge, no production change, no shuffle change, no private voice recordings.

## Why Deep could not match the evidence, and what changed

- **Wrong code.** The `audit/qa-samples/` files on this branch had been generated at `fc3eb8c`, two builds before `f321114`.
  - Re-rendered at `f321114`, the written reading differs in 11 samples: B01, B04, B06, CC-02, S03, S05, S10, S11, S12, S15, SC-02. The cause is the 7 Nov changes (Clarity card; reversed-agreement wording).
  - Max's script differs in all 35, because of the 8 Nov narration lifecycle.
- **Missing samples.** B07 and B08, added on 7 Nov, had no sample files at all.
- **Fixed in this evidence commit.**
  - `audit/qa-samples/` was regenerated at `f321114` (38 samples). The old files are superseded and must not be used.
  - Every interpretation case now has its own file, `audit/deep-handoff/<CASE>.md`. Each file contains everything needed to judge the case.

## The gate: 20 cases (19 original + SC-Q)

- **The original interpretation gate: 19 cases.** The 16 baseline cases (OC-01–03, TC-01–04, RC-01–03, SC-01, SC-02, CC-01–04) plus BT-03, BT-05 and BT-06, the boundary cases that need interpretive judgement.
- **SC-Q was added on 7 Nov** when Chas approved Seven-card question readings (position 4 read last). It needs interpretive review, so the current gate has **20 cases**.
- If Si Aye prefers to keep SC-Q out of the release gate, the original 19 are unchanged.

## Case index

Automated = Claude's scripted structural checks, from the unedited logs of the clean run at `f321114` (`audit/builds/test-run-f321114/`: `reading-engine-qa.browser.log`, `boundary-matrix.browser.log`). The Interpretation column is Deep's: every case is **NOT TESTED** until Deep records PASS, FAIL or BLOCKED.

| Case | Matrix | Sample(s) | Evidence for this case | Sample file(s) | Open in preview | Automated (Claude) | Interpretation (Deep) | Case-specific acceptance |
|---|---|---|---|---|---|---|---|---|
| OC-01 | Fool upright, no clarifier. | OC-01 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-01.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-01.json) | [OC-01](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/OC-01.md) | `?qa=OC-01` | PASS | NOT TESTED | Fool upright, as dealt: the original reading only; the page states Clarifier 1 is due (Major). Orientation, position (Guidance), no clarifier text. |
| OC-02 | Ten of Swords reversed. | OC-02 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-02.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-02.json) | [OC-02](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/OC-02.md) | `?qa=OC-02` | PASS | NOT TESTED | Ten of Swords reversed: the reversed meaning is used and is not a bare negation of the upright one. |
| OC-03 | Tower upright, Star upright clarifier. | OC-03 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-03.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/OC-03.json) | [OC-03](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/OC-03.md) | `?qa=OC-03` | PASS | NOT TESTED | Tower with Star as Clarifier 1: Clarifier 1 modifies the original; Clarifier 2 shown as due (Star is Major), not drawn. |
| TC-01 | Ace of Pentacles U / Five of Cups U / Six of Wands U. | TC-01 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-01.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-01.json) | [TC-01](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/TC-01.md) | `?qa=TC-01` | PASS | NOT TESTED | Past / Present / Future, all upright Minors: each card read through its time position; no time drift. |
| TC-02 | Eight of Cups R / Nine of Wands U / Ten of Cups U. | TC-02 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-02.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-02.json) | [TC-02](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/TC-02.md) | `?qa=TC-02` | PASS | NOT TESTED | Eight of Cups reversed in Past: reversed meaning in a past frame; neighbours sensible. |
| TC-03 | Lovers U / Two of Cups R / Star U; clarifier on Present. | TC-03 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-03.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-03.json) | [TC-03](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/TC-03.md) | `?qa=TC-03` | PASS | NOT TESTED | Clarifier on Present (Two of Cups reversed): Clarifier 1 modifies the reversed original; Lovers and Star show Clarifier 1 due. |
| TC-04 | Wheel of Fortune R / Four of Pentacles U / Six of Pentacles R; two-clarifier chain on Present. | TC-04 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-04.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/TC-04.json) | [TC-04](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/TC-04.md) | `?qa=TC-04` | PASS | NOT TESTED | Two-clarifier chain on Present: Clarifier 1 (a Major) modifies Four of Pentacles; Clarifier 2 develops both; Revision 1 kept. |
| RC-01 | Two of Cups U / Hermit R / Lovers U / Five of Wands U / Ace of Cups U. | RC-01 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-01.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-01.json) | [RC-01](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/RC-01.md) | `?qa=RC-01` | PASS | NOT TESTED | Relationship positions: You / The Other Person / The Connection / Relationship Challenge / Shared Guidance; Hermit reversed in The Other Person. |
| RC-02 | Queen of Cups R / King of Swords U / Page of Wands U / Eight of Cups U / Star U; clarifier on Connection. | RC-02 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-02.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-02.json) | [RC-02](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/RC-02.md) | `?qa=RC-02` | PASS | NOT TESTED | Clarifier on The Connection: modifies Page of Wands within the relationship frame. |
| RC-03 | Devil U / Hierophant R / Three of Cups U / Four of Cups U / Judgement U. | RC-03 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-03.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/RC-03.json) | [RC-03](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/RC-03.md) | `?qa=RC-03` | PASS | NOT TESTED | Devil, Hierophant reversed, Judgement among Minors: Majors read with weight but not overreach. |
| SC-01 | Mixed orientations, clarifier on Foundation. | S12 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-01.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-01.json) | [S12](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/S12.md) | `?qa=S12` | PASS | NOT TESTED | (mapped to S12) Seven-card V, mixed orientations, every position clarified: positional timing (18–24 months, 3 months) kept. |
| SC-02 | Two Majors, reversed anchor, two-clarifier chain. | SC-02 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-02.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-02.json) | [SC-02](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/SC-02.md) | `?qa=SC-02` | PASS | NOT TESTED | Two Majors, reversed anchor with a two-clarifier chain: reversed anchor plus chain read coherently. |
| CC-01 | All upright, no clarifiers. | CC-01 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-01.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-01.json) | [CC-01](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/CC-01.md) | `?qa=CC-01` | PASS | NOT TESTED | Celtic Cross all upright, no clarifiers: ten positions, pair relations (1&2, 3&5, 4&6, 7&8, 9&10). |
| CC-02 | Reversal-heavy, clarifier on Past. | CC-02 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-02.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-02.json) | [CC-02](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/CC-02.md) | `?qa=CC-02` | PASS | NOT TESTED | Reversal-heavy Celtic Cross, clarifier on Recent Past: reversed cards and the clarifier in a past frame. |
| CC-03 | Major-heavy, two Major clarifiers and rule boundary. | B06 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-03.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-03.json) | [B06](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B06.md) | `?qa=B06` | PASS | NOT TESTED | (mapped to B06) Ten Majors with Major clarifiers: limit/Clarity behaviour as at this build; no symbolic overreach. |
| SC-Q | (added 7 Nov) Seven-card question reading: position 4 read last. | B08 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-Q.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/SC-Q.json) | [B08](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B08.md) | `?qa=B08` | PASS | NOT TESTED | (added 7 Nov) Seven-card question reading: You / Answer read last on the page and by Max; its text treats it as the answer. |
| CC-04 | Hermit R + Eight of Pentacles U clarifier, full applicable chain. | CC-04 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-04.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/CC-04.json) | [CC-04](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/CC-04.md) | `?qa=CC-04` | PASS | NOT TESTED | Hermit reversed with Eight of Pentacles: Clarifier 1 (Minor) grounds the Hermit; chain correctly ends. |
| BT-03 | Two Major clarifiers: demonstrate the implemented limit and flag any conflict with Chas's approved rule. | B01, B07, B06 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-03.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-03.json) | [B01](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B01.md), [B07](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B07.md), [B06](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B06.md) | `?qa=B01` `?qa=B07` `?qa=B06` | PASS | NOT TESTED | Two Major clarifiers: B01 (Clarity card due, stated), B07 (Clarity card drawn and read), B06 (several positions). Option B as approved. |
| BT-05 | Reversed anchor + reversed clarifier: both reflected explicitly in interpretation. | B04 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-05.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-05.json) | [B04](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/qa-samples/B04.md) | `?qa=B04` | PASS | NOT TESTED | Reversed anchor and reversed clarifier (B04, The Hanged Man / The Star, both reversed): both stated explicitly in the relationship. |
| BT-06 | Contradictory clarifier: retain Stage 1 and visibly revise interpretation. | BT-06 | [md](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-06.md) · [json](https://github.com/charlestdainslie-arch/Resonate/blob/7d4fbe4737114b80de697bba250f1566d6917473/audit/deep-handoff/BT-06.json) | — (inline; see handoff file) | — | PASS | NOT TESTED | Contradicting clarifier (Tower / Death, contrary elements; then The Star): stage 1 unchanged; the change shown as a revision; Revision 1 readable. |

Each case file holds:
- the **draw record**: spread, each position and its defined meaning, the original cards with IDs, orientation, arcana and element, the clarifiers and Clarity card, the neighbours, the clarifier sequence in press order, the question flag, and any card drawn from a stated seeded shuffle because the matrix did not name it;
- the **card data** each card was read from: upright and reversed keywords and meanings;
- the **full written interpretation** for every position, with revisions expanded;
- the **Golden Thread**;
- **Max's exact narration**: as opened, before Finish reading, and after Finish reading.

The same data is in each `<CASE>.json`.

**Question / context.** The app captures no question text. The only context input is the Seven-card question-reading flag, which is ON for SC-Q (B08) and off for every other case.

## Rubric: what each case is judged against

Every case file lists these criteria:
1. **Orientation.** The card is read with the meaning for its orientation, taken from the card data in the file. A reversed card is not simply the negation of its upright meaning.
2. **Position.** The position lens names the position and reads the card through the position's defined meaning (`audit/POSITIONS.md`), without drifting in time or role.
3. **Neighbours.** The "wider spread" line relates the card to its Celtic Cross pair partner (1&2, 3&5, 4&6, 7&8, 9&10) or, in other spreads, its next position, without inventing a connection.
4. **Clarifier 1** modifies the original card and names both.
5. **Clarifier 2** develops the relationship between both earlier cards and names all three.
6. **Synthesis.** "Together" combines the cards rather than listing them. Revisions are shown, never overwritten.
7. **Option B (Clarity card).**
   - It appears only when the original and both clarifiers are Major Arcana.
   - It is a Minor not already in the reading, and it is read as grounding the three Major cards.
   - A Minor original with two Major clarifiers gets none; the page states the limit instead (confirmed 7 Nov).
8. **Max.** His lines are the reading's own words, in reading order. Before Finish he invites and does not sign off. After Finish the closing comes once.
9. **Deep's six failure modes:** templating, positional drift, reverse-as-opposite, parallel clarification, concatenation instead of synthesis, numerical/symbolic overreach.

## Sources: where each part of the text comes from

- **Card meanings, keywords, correspondences, numerology lines and lenses:** `data.js`, RESONATE's card data. Its provenance is **OPEN**: `audit/sources/DATASET_NOTES.md` and `audit/sources/cards-78.json`. No published source is cited by the engine.
- **Position meanings:** `app.js` spreads, listed verbatim in `audit/POSITIONS.md`. There is no separate specification. The Seven-card timing came from a commit that names Fenton-Smith; that attribution is unverified and does not appear in anything users see.
- **Position lens:** a template in `app.js` (`positionContext`).
- **Clarifier relationships, "Together" and the Clarity card step:** generated by rule in `clarifier-reading.js`.
  - The rule uses elements (the elemental-dignities convention: same element reinforces; Fire–Air and Water–Earth friendly; Fire–Water and Air–Earth contrary), suit, number, orientation, and Major/Minor/court status.
  - The page labels this as RESONATE's interpretive method, not a quotation from a published source.
  - No citation is given or invented.
- **The clarifier rule:** Chas's teaching rule, implemented in `clarifier-rules.js`, including Option B as approved on 7 Nov. It is not attributed to Paul Fenton-Smith without a source.
- **Golden Thread:** `goldenThread()` in `app.js`.
- **Max:** `presenter.js` quotes the page word for word, apart from his framing lines (`FRAME`), which never interpret.

Claude's own observations (not verdicts) are in `audit/QA_ENGINE_CLAUDE_NOTES.md`. They must not be read as PASS.

## NOT TESTED at f321114

- **Interpretation (Deep): all 20 cases.** Only Deep can mark these.
- **Samsung audio against captions (Dev):** not tested on a device. The automated tests use a stand-in speech engine and cannot show audible output.
- **Real devices, Safari and Firefox:** not tested.
- **BT-06** is an inline case in `tests/boundary-matrix.browser.cjs`. Its automated check ran at `f321114` (PASS). Its evidence file was rendered by `audit/tools/deep-handoff.cjs` from the same code. It has no `?qa=` link.
- **Older transcripts** (anything generated before `f321114`, including the `fc3eb8c` and `4dc4df5` sample sets) are **superseded**. They are not current evidence.

## Reproducing it

- **Without Node.** Open the preview (Chas has the private share link) or a local copy of `f321114`, add `?qa=<sample>`, and compare the page and Max with the case file.
- **With Node 22 and Playwright:**
  - `git checkout 7d4fbe4`, then `HANDOFF_SHA=f321114 node audit/tools/deep-handoff.cjs <out>`. The tool refuses to run if any app file differs from `f321114`.
  - `diff -r <out> audit/deep-handoff`
  - `node tests/reading-engine-qa.browser.cjs` and `node tests/boundary-matrix.browser.cjs` re-run the automated checks.
