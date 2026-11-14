# Deep — M2 evidence verdict and issue #53 verification

**Date:** 14 November 2026
**From:** Deep (independent QA)
**To:** Chas, Claude, Si Aye (cc)
**Package:** `inbox/2026-11-14-M2-evidence/` — 108 files: 49 JSON, 58 PNG, 1 manifest
**SHAs in evidence:** `8650b6b` (20 `full` cases) and `aa82f67` (20 `bare` + 8 #53) — as declared, not mixed by accident.

---

## 1. Verdict

| Item | Verdict | Basis |
|---|---|---|
| **M2 structure, all 40 cases** | **PASS** | 40/40 parsable, 40/40 have `measure.player`, every `defects` value equals the sum of its lists, 0 defects total |
| **M2 visual comparison — Celtic 360 (bare, full)** | **PASS** | JSON 10 positions / 20 clarifiers / 2 Clarity matches the image exactly; names wrap in full; nothing past the edge |
| **M2 visual comparison — Seven-card 1440 full** | **PASS** | JSON 7 / 14 / 7 matches the image; seven columns, nothing clipped, `overflow-x: visible` confirmed |
| **M2 visual comparison — the other 37** | **UNKNOWN — not claimed** | I validated them numerically below; I did not open each image |
| **Issue #53, 8 sequence captures** | **PASS** | Every state matches its machine-readable record, and two are confirmed against the pixels |
| **Wording inside the readings** | **FAIL — new finding N1** | Found incidentally in the #53 evidence; see §4 |

**M2 is not blocked by anything in this package.** The one failure is a copy defect, not a stack defect, and it would have passed every layout check ever written.

---

## 2. Why the instrument is now credible

Three numbers in the JSON show the detector is actually doing the work, rather than reporting clean because it looked nowhere:

| Check | Value | What it proves |
|---|---|---|
| `rootOverflowX` | `visible/visible` | `overflow-x: hidden` is **not** masking the page-level number (my D3 concern) |
| `pageChecked` | **515** (Celtic 360), **426** (Seven 1440) | The page-wide scan is running over hundreds of elements, not returning an empty set |
| `fixedControls` | `#mcClarify`, `#mcFloat` | Fixed controls are found **by computed position** — the D1 hole is genuinely closed, and these are the same elements v1 could not see |

And the arithmetic holds: Celtic has 10 positions and **exactly 20** clarifiers — two per position, which is what `expectFull` demands. Seven-card has 7 and **14**. Those are the counts a full layout must have, so "0 defects" is being measured on a genuinely full pile rather than a partial one.

---

## 3. Issue #53 — verified, all four states, both spreads

The requirement was appearance **and** state, so here is the state:

| Spread | Step | `disabled` | background | colour | Active card | Part | `heardRecorded` |
|---|---|---|---|---|---|---|---|
| One-card | mid first pass | **true** | `rgb(44,43,41)` grey | `rgb(143,137,127)` | 01 | 5 of 9 `cards` | false |
| One-card | after first pass | **false** | `rgb(201,169,106)` gold | `rgb(21,18,14)` | **01** | 9 of 9 `invite` | true |
| One-card | during Replay | **false** | gold | dark | 01 | 1 of 9 `intro` | true |
| One-card | close + reopen | **false** | gold | dark | 01 | 0 of 9 | true |
| Celtic | mid first pass | **true** | grey | grey | 05 | 18 of 36 `cards` | false |
| Celtic | after first pass | **false** | gold | dark | **01** | 36 of 36 `invite` | true |
| Celtic | during Replay | **false** | gold | dark | 01 | 1 of 36 `intro` | true |
| Celtic | close + reopen | **false** | gold | dark | 01 | 0 of 36 | true |

Three things this settles that a screenshot alone could not:

1. **It is genuinely `disabled`, not merely grey.** The `title` at mid-pass reads *"Max reads every card first; then you can clarify."* and clears to `""` once enabled — that is the lock engaging and releasing, not a style change.
2. **The 36-part Celtic Cross holds the lock for the whole first pass** and releases at part 36. That is the long case where a leak would show.
3. **The invite-timing wrinkle I raised on 11 Nov is resolved.** At the `invite` chapter the button is **already gold** while Max is saying *"Tap Clarify"*. Previously it lit a moment *after* the words. The words and the control now agree.

I checked the one-card mid-pass and after-pass images against these records: grey button with the lock note above it, then gold button with card 01 selected and "Play again". They match.

---

## 4. N1 — a broken sentence, found in the stopwatch, not the words

The Celtic mid-first-pass record captures this caption verbatim (part 18 of 36, position 05):

> *"Here, stewardship, stability, competence is a lens for your hopes, intentions or conscious priorities."*

Three nouns, no *and*, singular verb. It reads as a keyword list pushed into a sentence template that was written for one word.

Source, both lines interpolate `${theme}` as though it were singular:

```js
// app.js:88
else if(/challenge|Challenge/.test(role)) lens=`The tension to explore is ${theme}. …`;
// app.js:92
else lens=`Here, ${theme} is a lens for ${position[1]}. …`;
```

When `${theme}` is one keyword these are fine. When it is a three-keyword list — which the Celtic position produced — both are ungrammatical. "The tension to explore is stewardship, stability, competence" has the same fault.

**This matters beyond grammar.** It is the clearest single example of the failure mode I described in Deliverable B: the engine assembling sentences from keyword fragments, which reads as machine output precisely where Max is supposed to sound like a person. And it is **the kind of defect no layout evidence will ever catch** — the box is the right size, the text is not clipped, and the words are wrong.

**Do not fix it as part of M2.** It belongs to C/D, and any quick patch should avoid number-agreement hacks: either join the list properly (*"stewardship, stability and competence"*) and rephrase the two copula sentences so they work for one theme or three, or drop `${theme}` from those templates entirely. Logged for the editorial pass, as Chas instructed for harsh lines.

---

## 5. What I am still not claiming

- I did **not** open the remaining 37 images. Their JSON is validated; their pixels are not.
- Browser-level reproduction on a real device is still Chas's Samsung test, not mine.
- This verdict is about **layout and #53 state**, not about whether the readings are good.

---

## Checkpoint

- **Completed:** M2 evidence validated (40/40 structure, 0 defects, counts consistent); three cases compared JSON↔PNG; #53 verified on all 8 states. Evidence: `2026-11-14-M2-evidence/`, SHAs `8650b6b` / `aa82f67`.
- **Current work / owner:** M2 and #53 closed on my side. New finding N1 for the editorial backlog (D).
- **Blockers:** none.
- **Independent QA status:** **M2 PASS**, **#53 PASS**, wording **N1 logged for D**.
- **One question before sign-off:** named cards in the Seven-card 1440 image are legible at full size but small — worth Chas's eye on the device before I call typography settled.

**RESONATE 40% verified | M2 [PASS — 40/40, 0 defects, evidence checked] | Evidence [delivered, 108 files, validated] | Deep QA [PASS M2, PASS #53, N1 logged] | Next [Chas Samsung tap test, then M3].**

— Deep
