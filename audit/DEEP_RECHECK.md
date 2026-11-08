# Deep's independent QA findings (8 Nov 2026): recheck of CC-03, BT-03, SC-01

Issue #49 is the audit record. This file keeps Deep's findings as given and records what was done about each.

## Commits (pinned separately)

| What | Commit | Branch |
|---|---|---|
| Code Deep reviewed | `f321114def71f3c7239f5b498c610135d02516c8` | `claude/uat-max-lifecycle` |
| Evidence Deep reviewed | `7d4fbe4` | `claude/uat-max-lifecycle` |
| Fix (application code) | `b661280f07649e2b9cb824b298fcb5af167040f2` | `claude/uat-clarity-thread` (from `d48b6ac`, app `ea46221`, which carries the P2 mobile fix) |
| This evidence | the commit that adds this file (see `git log -- audit/DEEP_RECHECK.md`) | `claude/uat-clarity-thread` |

The fix changes one application file, `app.js` (14 lines, Golden Thread only). Shuffle identity against the approved reference `73da97d`: `deck-engine.js` and `reading-stage.js` IDENTICAL (`audit/builds/test-run-b661280/shuffle-identity.txt`). Secure randomness, Option B, Seven-card reading order and Max's lifecycle are unchanged.

## Deep's findings, as given (not altered)

20 cases reviewed at `f321114` with evidence `7d4fbe4`: **17 PASS, 2 FAIL (CC-03, BT-03), 1 BLOCKED (SC-01)**.

- CC-03 and BT-03 FAIL: the evidence did not show a Clarity card being drawn and read through to the end.
- SC-01 BLOCKED: "Foundation" is not a Seven-card position.

## CC-03 and BT-03: Option B end to end

Tool: `audit/tools/clarity-verify.cjs`. Run on clean checkouts of both commits, phone viewport 412×915, the app's own live secure draw (nothing stubbed). Samples: B01 (one card, Death / The Tower / Judgement; tapped in Max's clarify bar) and B06 (Celtic Cross, positions 1, 3, 5, 9 due; tapped on each card's own button on the page).

| Directive item | f321114 (reviewed) | b661280 (fix) |
|---|---|---|
| 1. Reproduce the recorded draw | yes (both samples) | yes |
| 2. Clarity button offered where original + C1 + C2 are Major | yes: B01 pos 1; B06 pos 1, 3, 5, 9 | yes |
| 3. Seeker tap (Max bar for B01, page buttons for B06) | drew a card each time | drew a card each time |
| 4. Card drawn (one live run) | B01 Five of Wands; B06 Seven of Cups, King of Swords, Five of Cups, King of Cups | B01 Nine of Pentacles; B06 Four of Wands, Four of Swords, Page of Wands, Ace of Pentacles |
| 5. Minor, not already in the reading | yes; repeat taps 500 (B01) and 120 (B06): 0 bad | yes; 500 / 120: 0 bad (56 and 45 distinct cards) |
| 6. Written reading and Max take in all four cards | yes | yes |
| 7. Golden Thread includes the Clarity card | **no**: "follows 3 revealed cards … including every clarifier", Clarity card absent | **yes**: "follows 4 revealed cards … including every clarifier and Clarity card"; "the Clarity card, Nine of Pentacles, introduces independence and enjoyment" |
| Replay with recorded cards and orientations | identical | identical |
| Page errors | none | none |

**Classification.** Items 1–6 passed at `f321114`: for those, the FAIL was incomplete evidence (the earlier pack did not record a live Clarity tap through to the end). Item 7 was a **genuine defect**: the Golden Thread left the Clarity card out. Fixed in `b661280` (the smallest change: the Golden Thread and its numerology now count each position's Clarity card with its clarifiers), on a separate UAT branch. A regression check was added to `tests/reading-engine-qa.browser.cjs`.

Evidence: `audit/deep-recheck/clarity-verify-f321114/clarity-verify.json`, `audit/deep-recheck/clarity-verify-b661280/clarity-verify.json` (each holds the recorded draw, controls, taps, Max's words spoken, the full reading text and Golden Thread before and after, the replay, and the pool check). Run log: `audit/builds/test-run-b661280/console.txt`.

## SC-01: corrected criterion

Deep's BLOCKED finding stands on record: the matrix asked for a clarifier on "Foundation", which is a Celtic Cross position (3, "the deeper roots beneath the situation"), not a Seven-card position. The original mapping (sample S12, every position clarified) did not test what the row asked for. It is not changed or deleted; it is superseded for this row.

**Proposed replacement (for Si Aye / Deep to confirm):** mixed orientations, one clarifier on **position 1, Past · 18–24 Months** ("your experiences and influences from approximately the previous 18 to 24 months"), the Seven-card position closest to "Foundation" in meaning. New sample **SC-01A** (seed 7415): The High Priestess / Two of Wands R / Ace of Swords / Two of Pentacles / Nine of Pentacles R / Five of Pentacles / Knight of Cups; Clarifier 1 on position 1: Three of Pentacles (upright). PASS in `reading-engine-qa.browser` at `b661280`. Interpretation evidence: `audit/deep-recheck/handoff-b661280/SC-01.md` and `.json`.

No other test was substituted. If Si Aye prefers a different position, SC-01A is changed to it and re-run.

## Full run at b661280

Clean detached checkout, `audit/tools/run-all-tests.sh`: 12 syntax checks, unit tests and 23 browser suites, all exit 0 (`audit/builds/test-run-b661280/summary.tsv`, `LOGS.sha256`). Working tree clean before and after.

## For Deep: fresh verdict requested on

- **CC-03** — `audit/deep-recheck/handoff-b661280/CC-03.md` (B06) and the clarity-verify reports
- **BT-03** — `audit/deep-recheck/handoff-b661280/BT-03.md` (B01, B07, B06) and the clarity-verify reports
- **SC-01** — `audit/deep-recheck/handoff-b661280/SC-01.md` (SC-01A), plus confirmation of the replacement position

The handoff files are written from `b661280`. Interpretation verdicts stay UNKNOWN until Deep records them.

## Tool fix during this recheck

`audit/tools/deep-handoff.cjs` did not accept sample IDs with a letter suffix ("SC-01A"), so its first SC-01 output at `b661280` was empty. The pattern was widened (audit tool only, no app change) and the handoff regenerated.

## Correction, 8 Nov (second round): CC-03 evidence regenerated with the live taps

**Deep's second verdict:** 19 PASS, 1 FAIL (CC-03). **Si Aye's check of `handoff-b661280/CC-03.md` at `e45e8c4`:** the file does have a Golden Thread section, but it shows 28 revealed cards and no completed Clarity draws. The four live Clarity cards reported above do not appear in it.

**Si Aye is right.** `audit/tools/deep-handoff.cjs` rendered the B06 sample as recorded, which is the reading *before* any Clarity tap. The live taps were made only in `clarity-verify.cjs`, and their results were never fed back into the handoff file. BT-03.md had the same gap for B01 and B06. This was an evidence defect, not an app defect: the application code is unchanged (still `b661280`). The `e45e8c4` versions of CC-03.md and BT-03.md stay in git history, superseded.

**What was done, at `b661280`:**

1. `audit/tools/clarity-live-record.cjs` runs the real seeker taps on a phone viewport with the app's own secure draw, nothing stubbed. For B06 it taps "✦ Draw Clarity card" on the page at positions 1, 3, 5 and 9, then opens Max, plays to the end, taps Finish reading and plays the close. For B01 it taps Clarify in Max's bar, then Finish. It records each Clarity card and its orientation (both drawn live), the full reversed list, the page before and after, the Golden Thread, Max's script, and every line handed to the speech engine. It writes the recorded draw as replayable samples **B06-LIVE** and **B01-LIVE** (`audit/deep-recheck/live/live-samples.json`), replays them in a fresh page and checks the replay is identical (page text, Golden Thread and Max script: all identical). Report: `audit/deep-recheck/live/clarity-live.json`.
2. `deep-handoff.cjs` now accepts these recorded draws. **CC-03.md** shows B06-LIVE first (all four Clarity cards, the draw record with orientations, the revised interpretation for positions 1, 3, 5 and 9 with the Clarity step and "Together" naming all four cards, a Golden Thread of **32 revealed cards** naming each Clarity card, Max's script, and the lines Max spoke on the live run). Then comes B06 as recorded before the taps, for comparison (28 cards). **BT-03.md** gets the same for B01-LIVE and B06-LIVE.
3. The live draw recorded for the handoff (B06): position 1 **Seven of Swords** (upright), 3 **Six of Swords** (upright), 5 **Queen of Cups** (reversed), 9 **Seven of Wands** (upright). B01: **Two of Swords** (upright). All are Minors and none was already in the reading. Each run draws different cards (secure randomness). The recorded draw is what the handoff shows, and the replay test pins it.
4. New browser test `tests/clarity-live.browser.cjs`. It repeats the live taps with fresh draws and checks: the card is a Minor not already in the reading, there are no duplicates, "Together" names all four cards, the Golden Thread follows 32 (B06) or 4 (B01) cards and names every Clarity card, Max speaks every Clarity card, and Max does not sign off before Finish and closes exactly once after it. It then replays the recorded B06-LIVE and B01-LIVE draws to exactly the recorded reading and Golden Thread. Logs: `audit/builds/test-run-f67d9e0/` (clean checkout of `f67d9e0`, app files identical to `b661280`: every suite exits 0, including `clarity-live.browser` with 4 passed; shuffle identical to `73da97d`).
5. `tests/helpers/qa-render.cjs`: the rule check now includes the Clarity card (`validate(..., readingClarity())`), so a Clarity card that broke Option B would be reported. Test helper only.

No application file differs from `b661280` (deep-handoff refuses to run otherwise).

No merge. No production change. No spending.
