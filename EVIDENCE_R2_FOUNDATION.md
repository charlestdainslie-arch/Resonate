# R2 foundation — evidence (28 Oct 2026, AEDT)

Author: Claude. Refs #24, #14, #10, #22, PR #18. **Proposed, not approved. No merge, no production.**

## Provenance
- Parent: `claude/issue14-uat-base` @ `1ced90b8a25740adc4b46a1e469d319b9a506f26` (PR #18 head, unchanged by this work).
- PR #18 base: `integration/astrology-uat` @ `59f399395fe6e9418585cad4600a5b0c7c0d2293`.
- This branch: `claude/r2-foundation` (one commit on top of `1ced90b`). Replaces Claude's earlier local-only `fea6882`, which never reached GitHub.
- Environment: Linux, Node 22.23.4, Playwright 1.63 headless Chromium 1243. Local static server from the working tree. **Not** a Vercel preview and **not** a real phone.

## Changes
| File | Change |
|---|---|
| `navigation-a11y.js` | Element chips and bookmark expose `aria-pressed`; Upright/Reversed become a `tablist` with `aria-selected`, roving tabindex and arrow/Home/End keys; focus stays on a chip/bookmark/tab when it re-renders its own screen. No copy, data or other file changed. |
| `tests/coverage-gaps.browser.cjs` | New: 37 checks for the gaps listed in the 27 Oct handover (G1–G5). |
| `tools/content-inventory.cjs` | New evidence helper for #10 (seeded visible-section inventory of any build). |
| `SCREEN_REGISTER.md` | As-built screen/flow register (#22 schema). |

## Test results (fresh runs on this branch, not reused figures)
| Suite | Command | `1ced90b` (before) | This branch |
|---|---|---|---|
| Unit | `node --test tests/*.test.cjs` | 70/70 PASS | 70/70 PASS |
| Navigation/a11y | `node tests/navigation-a11y.browser.cjs` | PASS (5 widths) | PASS |
| Reduced motion + headings | `node tests/reduced-motion-headings.browser.cjs` | PASS (8 widths × 2) | PASS |
| UAT round 1 (D1/D2/D3/D6/D8) | `node tests/uat-round1.browser.cjs` | PASS (3 phone sizes) | PASS |
| Browser UAT | `node tests/browser-uat.cjs` | 304/304 PASS, 16 configs | 304/304 PASS |
| Coverage gaps (new) | `node tests/coverage-gaps.browser.cjs` | **14 FAIL / 23 PASS** | **37/37 PASS** |

Pre-fix failures (all accessibility state, Pixel 7 and 1280px): element chips had no `aria-pressed`; bookmark had no `aria-pressed`; Upright/Reversed tabs had no selected state; focus was lost to `<body>` after bookmarking. Severity proposed **P2** (assistive-tech users cannot tell which filter, bookmark or orientation is active; no data or journey loss).

Coverage now asserted, all PASS: Learn search, misspelling, clear, element filter, combined search+filter, state kept through card detail with on-screen and phone Back, no-match Reset; bookmark persist + Journal listing after reload + unbookmark; Upright/Reversed meaning and keyword swap; every card in a three-card reading opens its own card/position and returns to the identical reading; astrology snapshot expander opens/closes by touch and keyboard; Journal reflection edit shows "Unsaved", saves and survives reload; shuffle in all five spreads is `tarot-shuffle-contained / 0.86s / 0s`, locks and unlocks the button and reports "Deck shuffled".

## #10 content inventory (evidence only — #10 stays OPEN)
`tools/content-inventory.cjs` run on three builds with the same seed: `develop/v1.0-base` @ `6b0c98d`, `integration/astrology-uat` @ `59f3993`, this branch.
- **`59f3993` → this branch:** identical headings, eyebrows, labels and buttons on every captured view except the D1–D3 form help text already in PR #18. No section removed.
- **`6b0c98d` → this branch** (`6b0c98d` is a 5-card sample deck, so card names differ):
  - Reading view: the atmospheric `assets/landing-reading.jpg` panel is **absent** after drawing (already noted in #10 — still not restored).
  - Reading view: the separate "Save Reading to Journal →" button that followed the Golden Thread is gone; one "Save Reading to Journal" button remains in the Journal panel, which now sits after the action buttons. Needs owner decision: intended consolidation or loss?
  - "Download Reading" is now "Download Reading PDF".
  - Card detail eyebrow "MAJOR ARCANA · 0" is now "MAJOR ARCANA".
  - Added since `6b0c98d`: astrology snapshot, Tao / Wu Wei and Jungian lenses per card, 78-card deck (the sample deck repeated The Empress as Clarifier 2).
- **Not established:** which commit Chas last approved. `6b0c98d` is used only as the oldest available baseline, not as the approved one.

## Not done / blockers
- Real Android UAT, screen-reader pass, Journal quota/corruption/two-tab tests, hardware performance: not run.
- `landing-reading.jpg` restoration and the second save button: left for owner decision under #10 rather than changed here (scope freeze, #14).
- Dev's unpushed laptop work: still unavailable; no overlap check possible.
