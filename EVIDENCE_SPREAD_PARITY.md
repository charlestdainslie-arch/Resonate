# Spread parity: evidence (28 Oct 2026)

Author: Claude. Refs PR #26 (Si Aye's 28 Oct acceptance comment), #24, #14, #10. **Proposed, not approved. No merge, no production.**

## Provenance
- Parent: `claude/r2-foundation` @ `05f0f5b133bdf3a2d713999cbfc30211d053bccb` (PR #26 head, unchanged by this work).
- PR #26 base: `claude/issue14-uat-base` @ `1ced90b8a25740adc4b46a1e469d319b9a506f26` (PR #18, unchanged).
- `integration/astrology-uat` @ `59f399395fe6e9418585cad4600a5b0c7c0d2293`, not touched.
- This branch: `claude/spread-parity-uat`, one commit on top of `05f0f5b`.
- Environment: Linux, Node 22.22.0, Playwright 1.63, bundled headless Chromium. **Not** a real phone.

## What the one-card baseline had that the other spreads did not
The parity test (below) was run first on the unchanged parent `05f0f5b`. It found these gaps (all P2 layout/navigation consistency, per `V1_UAT_MATRIX.md`):

| Gap on `05f0f5b` | One | Three | Relationship | Seven V | Celtic |
|---|---|---|---|---|---|
| Original card captioned "ORIGINAL CARD" beside its clarifiers | yes | **no** | **no** | **no** | **no** |
| Gold position label breaks mid-word ("18–24" split at the dash; "SURROUNDIN·G" at 1280px) | no | no | no | **yes** (768–1920px) | no |
| "CLARIFIER 1/2" caption wraps to two lines and is clipped at the board edge | no | no | no | **yes** (1280px+) | no |
| Clarifier art legible (≥70px wide) | yes | yes | yes | **no, 55px** (1280–1920px) | yes |

## Changes
| File | Change |
|---|---|
| `spread-parity.css` (new, loaded last) | "ORIGINAL CARD" caption on every multi-card original, in the clarifier-caption face, with the title moved below it. Clarifier captions kept on one line. Position-label words never split. Seven V widens beyond the 900px page column from 1200px (up to 1240px) so its clarifiers are ~75px wide; the V itself is unchanged. Between 1101 and 1199px the Seven V uses the same three-column reading order it already uses below 1100px, because there is no room for a legible V. Celtic Cross rows get 30px between them so clarifier titles don't crowd the next row's labels. |
| `app.js`, `reading-stage.js` | Position labels are rendered through `slotLabelHtml()`, which wraps each word in a no-wrap span and keeps a "·" at the end of its line. Label text is unchanged. |
| `index.html` | Loads `spread-parity.css` after `navigation-a11y.css`. |
| `tests/spread-parity.browser.cjs` (new) | The per-spread matrix below. `PARITY_BASE_URL=<preview>` runs it against a deployed build. |

No card copy, card data, interpretation text, clarifier rules, journal format or PDF content changed.

## Per-spread matrix
`node tests/spread-parity.browser.cjs`: 5 spreads × 7 viewports (360, 390, 768, 1180, 1280, 1440, 1920px) with reduced motion, plus normal-motion shuffle/draw at 390 and 1280px. A cell is PASS only if it passes at every viewport. Results go to `test-results/spread-parity.json`, with a board screenshot for each spread and viewport.

| Check | One | Three | Relationship | Seven V | Celtic |
|---|---|---|---|---|---|
| P1 Card count, unique identities, placement (V, cross + staff, relationship triangle) | PASS | PASS | PASS | PASS | PASS |
| P2 Position labels readable: whole words, ≥12px, on screen | PASS | PASS | PASS | PASS (was FAIL) | PASS |
| P3 Consistent card/clarifier sizing, 2:3, uncropped art, "ORIGINAL CARD" caption, one-line clarifier captions, no overlap | PASS | PASS (was FAIL) | PASS (was FAIL) | PASS (was FAIL) | PASS (was FAIL) |
| P4 Shuffle → Draw: contained 0.86s shuffle (normal), no movement (reduced) | PASS | PASS | PASS | PASS | PASS |
| P5 Max two clarifiers; a third is not offered or drawn | PASS | PASS | PASS | PASS | PASS |
| P6 Upright/Reversed meanings from each position's card detail | PASS | PASS | PASS | PASS | PASS |
| P7 Astrology, number/rank, numerology, element on every original and clarifier; sky; snapshot; numbers thread | PASS | PASS | PASS | PASS | PASS |
| P8 Headings and primary/secondary buttons styled as in One-card | PASS | PASS | PASS | PASS | PASS |
| P9 Card detail Return/Next restores the same reading and scroll point | PASS | PASS | PASS | PASS | PASS |
| P10 Phone Back from card detail; menu → Journal; Back → Home | PASS | PASS | PASS | PASS | PASS |
| P11 Journal save → reopen keeps spread, cards, both clarifiers; returns to Journal (D8) | PASS | PASS | PASS | PASS | PASS |
| P12 PDF has every position, both clarifiers and the Golden Thread | PASS | PASS | PASS | PASS | PASS |
| P13 No horizontal page scroll (table and reading) | PASS | PASS | PASS | PASS | PASS |
| P14 Menu button does not cover the spread (D5) | PASS | PASS | PASS | PASS | PASS |
| C1 Every position has its interpretation, clarifier narrative and lenses | PASS | PASS | PASS | PASS | PASS |

On `05f0f5b` the same run gave 10 FAIL cells, under P2, P3 and P4. P4 was a test strictness issue rather than a product defect: reduced motion left the shuffle at 0s, which the first draft of the test didn't accept.

## One-card defects D1–D8 against every spread
| Defect | What it was | One | Three | Relationship | Seven V | Celtic | Evidence |
|---|---|---|---|---|---|---|---|
| D1/D2 | Birth date/time used native pickers that did not open on Android | PASS | PASS | PASS | PASS | PASS | The astrology form comes before the spread is chosen, so one fix covers all five (`uat-round1`, 3 phone sizes). The snapshot reaches every spread (P7). |
| D3 | Long dropdown option truncated at phone width | PASS | PASS | PASS | PASS | PASS | Shared form (`uat-round1`) |
| D4 | Simplify location/time-zone inputs | N/A | N/A | N/A | N/A | N/A | Product decision, not a defect |
| D5 | Floating menu overlapping content | PASS | PASS | PASS | PASS | PASS | P14 on each reading, plus `navigation-a11y`. Emulated only: **UNTESTED on a real phone** |
| D6 | Calculate gave no visible feedback | PASS | PASS | PASS | PASS | PASS | Shared form (`uat-round1`) |
| D7 | Toolbar diagnosis, unconfirmed on device | UNTESTED | UNTESTED | UNTESTED | UNTESTED | UNTESTED | Needs the phone report; not reproducible in emulation |
| D8 | Reading opened from Journal returned to the spreads | PASS | PASS | PASS | PASS | PASS | P11, in every spread |

## Recorded as missing, not as parity
These hold for **all five spreads, One-card included**. They are not parity gaps, so this branch does not fill them with empty sections (scope freeze, #14):
- **Reversed cards are never drawn in a reading.** Orientation appears only on the card-detail tab (R2, #13). No spread shows a reversed indicator.
- Hand-written position themes exist for 5 cards; the other 73 use a keyword formula (R3).
- There is no neighbour-aware synthesis (R4).
- The `landing-reading.jpg` reading art and the second post-thread Save button are still owner decisions under #10.

## Test results (fresh, this branch)
| Suite | Command | Result |
|---|---|---|
| Unit | `node --test tests/*.test.cjs` | 70/70 PASS |
| Spread parity (new) | `node tests/spread-parity.browser.cjs` | 75/75 cells PASS (was 65/75 on `05f0f5b`) |
| Navigation/a11y | `node tests/navigation-a11y.browser.cjs` | PASS |
| Reduced motion + headings | `node tests/reduced-motion-headings.browser.cjs` | PASS |
| UAT round 1 | `node tests/uat-round1.browser.cjs` | PASS |
| Coverage gaps | `node tests/coverage-gaps.browser.cjs` | 37/37 PASS |
| Browser UAT | `node tests/browser-uat.cjs 1` | 304/304 PASS, 16 configurations |

`browser-uat.cjs` hard-codes `channel:'chrome'`, and Google Chrome is not installed here. It was therefore run from an untracked copy with only that option removed, so it used the bundled Chromium. pdf-lib 1.17.1 was installed outside the repo.

## Not done
Real Android/iPhone UAT, screen reader, physical-device D5/D7 and print layout were not run. The PDF is text-only (no artwork), so "PDF fit" is checked as content completeness, not page layout.
