# Saturday 31 Oct foundation review: candidate and evidence

Author: Claude, 30 Oct 2026. **Evidence only.** This branch adds this file and `tools/review/` on top of the candidate; **no app file is changed**, so the app is byte-identical to the candidate.

## The one candidate
| | |
|---|---|
| Branch | `claude/page-end-nav` (PR #36, stacked on #35 → #34 → #26 → #18) |
| Commit | `5e2305ce0afaf12cfcdffb14bc58cb79eee15014` |
| Preview | https://resonate-bnbk2t2s1-charlestdainslie-6956.vercel.app |
| Why this one | Latest foundation-only build (Si Aye's 28 Oct checkpoint). PR #41 `f11ad87` has the **identical app**: every file in the candidate is byte-identical there; #41 only adds opt-in Golden Thread / motion pages. Choosing #36 keeps cinematics out of the review, per #14's scope freeze. |
| Not in it | Golden Thread live reading, Max Chasroom, voice, Three.js: all separate opt-in branches, demo only. |

## Tests run on the exact SHA (30 Oct, headless Chromium, Playwright 1.63)
Author-written suites, re-executed fresh. **Not independent QA.**
| Suite | Result |
|---|---|
| Unit (`node --test tests/*.test.cjs`) | 70/70 |
| `browser-uat.cjs` | 304 PASS / 0 FAIL, 16 configurations (360–1920 px, motion on/off) |
| `astrology-journey.browser.cjs` | 48/48 |
| `clarifier-slots.browser.cjs` | 35/35 (5 spreads × 5 widths) |
| `coverage-gaps.browser.cjs` | 37/37 |
| `navigation-a11y.browser.cjs` | PASS (Back, menu keyboard, focus, touch targets, 5 widths) |
| `page-end-nav.browser.cjs` | 9/9 |
| `reduced-motion-headings.browser.cjs` | PASS (8 widths × 2 motion prefs) |
| `spread-parity.browser.cjs` | all PASS |
| `uat-round1.browser.cjs` | PASS (3 phone sizes) |

## New: tap-only journey walkthrough (`tools/review/walkthrough.cjs`)
Written 30 Oct for this review. **Every step is a tap on a visible control, from the landing page.** No `go()`, `drawFirstLayerClarifiers()` or state shortcuts, unlike the suites above. Widths: **360, 390, 768, 1180, 1280, 1920 px** (#14's list); phone widths use touch/mobile emulation. Results: `tools/review/walkthrough-results.json`.

**240/240 steps PASS** (40 per width). Per width:
| Journey | Checked |
|---|---|
| Landing | Loads on Home, no sideways scroll, Get a Reading and Learn the Cards visible |
| Learn | 78 cards listed; open a card: artwork loads, no sideways scroll; Return goes back to Learn; browser Back reaches Home |
| Reading × 5 spreads | Get a Reading → spread → Shuffle → Draw: right number of **unique** cards, all turned, all artwork loaded, no sideways scroll |
| | Draw First Clarifier → Draw Second Clarifier: one per position per layer, no card repeated across cards and clarifiers, all clarifier artwork loaded, no third clarifier offered |
| | Explore a card → Return comes back to the same reading |
| | Download Reading PDF: a real PDF (11–61 KB) whose text names every drawn card (`pdftotext`) |
| | Save Reading to Journal: "✓ Reading saved to Your Personal Journal on this browser." |
| | Journal → reopen: same cards, both clarifier layers, face up |
| | End of page: Back to the top, then Home |
| Journal | All five saved readings listed; Home from Journal |

No page errors or new console errors. One pre-existing console error is excluded: an SVG icon path (`<path> attribute d: Expected number`), present on the candidate's own `index.html`.

### Browser Back / Forward (`tools/review/browser-back.cjs`)
- **Back: PASS** at all six widths: card detail → reading → spread chooser → Home → leaves the app. This is the design in `navigation-a11y.js`: Back mirrors the on-screen back control.
- **Forward: not supported by design.** After Back, Forward can step out of the app instead of returning to the reading. **P3, not a blocker**; Chas to say if Forward matters.
- (The walkthrough's own six Back "FAIL" rows were a test error, a third Back from Home, and are excluded from the 240.)

## #10 content preservation
- Line-by-line inventory: `COPY_INVENTORY.md` on `claude/copy-inventory` (PR #42) was generated against `f11ad87`. **The candidate's app is byte-identical**, so it applies unchanged.
- 287 prose lines; 62 earlier lines not in this build (17 reworded, 45 no close match), each traced to its commit. Card text for the 5 production cards is identical.
- **Open owner decision (F1):** production `main`'s card-to-card Golden Thread narrative ("Read after X, this develops the thread…", "In summary…") was replaced on 21 Oct (`c97e117`). This is the most likely match for #10's "missing explanations". No approved baseline is recorded. **#10 stays open until Chas decides.**

## Not verified (UNKNOWN)
- **Real Android**: needs Chas. Short script in the #24 summary.
- Screen reader (TalkBack) beyond automated label and focus checks.
- PDF visual layout (only text content checked).
- Landscape orientation; 1180 px tested portrait-style only.

## Known gaps carried from #24 (not regressions)
Reversed draws / orientation-aware synthesis, 73 tailored position themes, neighbour synthesis, Living Transmission, astrology interpretation: **not implemented**. Accounts and paywall are a separate lane. The Golden Thread / filament work is separate and demo only.
