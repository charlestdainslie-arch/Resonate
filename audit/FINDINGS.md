# Findings register — Issue #49 independent audit

Candidate as handed over: `4c37890eccbe9f356ae283609be452a74824fc9e` · Final SHA: `b3a34c35f5a6991554a385cef7a835827e6d7f94` (= candidate + the two UAT fixes and two corrected tests below; no other change). Full suite run at `a667664` (identical app code); `browser-uat` re-run and samples generated at `b3a34c3`. See `builds/TEST_EVIDENCE.md`.

Status words: **CONFIRMED** (reproduced by a test or measurement in this package) · **FIXED** (on `claude/uat-all-in-one` only) · **OPEN** (needs a decision or more work) · **UNKNOWN** (no evidence either way).

## Defects found and fixed on the UAT branch

| ID | Severity | What | Where seen | Status | Evidence |
|---|---|---|---|---|---|
| D1 | High (reading fidelity) | A **reversed clarifier's picture landed upright** after its turn animation, while its label said "reversed". The fold-in animation (`fill-mode: both`, ending at `transform:none`) overrode the reversal's `rotate(180deg)`. | `index.html` (Clarifier 2) and `presenter-uat.html` (every clarifier, because the Golden Thread turns each one). Correct with reduced motion. | **FIXED** `020d8de` (`reversals.css`) | `tests/reversed-clarifier-turn.browser.cjs`: 2/4 on old CSS, 4/4 after. The existing `clarifier-slots` check "turned cards finish flat" required *every* turned clarifier to end at `transform:none`, i.e. it encoded this defect; corrected to expect the card's real orientation. |
| D2 | High (spread meaning) | With the Golden Thread mounted, **every position shifted two places**: the thread inserts `<svg>` + `<canvas>` as the board's first children and positions were placed with `:nth-child`. Celtic Cross lost its cross-and-staff, Relationship positions swapped, Seven V lost its V. | `presenter-uat.html` at widths above 1100 px (at ≤1100 px, phones and tablets, spreads use reading order and were unaffected). `index.html` unaffected. | **FIXED** `c1db1c5` (`reading-stage.css` → `:nth-of-type`) | `tests/spread-layout-with-thread.browser.cjs`: 3/6 on old CSS, 6/6 after |
| D3 | Test-only | 3 unit tests failed (`orientCards is not defined`): the harness sliced `app.js` without the reversals code added later. App unaffected. | `tests/visible-clarifier.test.cjs` | **FIXED** `020d8de` | unit 74/77 → 77/77 |
| D4 | Test-only | `browser-uat` timed out at the clarifier step in all 16 configurations: written before Chas's clarifier rule, it expected two clarifiers on any draw. Fails identically on `4c37890`. App unaffected. | `tests/browser-uat.cjs` | **FIXED** `b3a34c3` (deals Majors first, like the other suites) | 74 pass + stop ×16 → 304 pass, 0 fail |

**Why D1/D2 escaped earlier testing:** of the 15 browser suites, only `presenter`, `chas-voice` and the two new suites load `presenter-uat.html`. `spread-parity` (35 layout cases) and `clarifier-slots` load `index.html`; the Golden Thread's own 27 tests load an isolated `demo.html`. Nothing tested the thread mounted inside real spreads.

## Open findings (need a decision; not changed)

| ID | Area | Finding | Status |
|---|---|---|---|
| G1 | Golden Thread | **The visual thread is sequence-driven, not meaning-driven.** It joins cards strictly in position order (1→2→…→n) and each clarifier to its parent card. It is given no card identity for clarifiers, always `orientation: 'upright'`, and never reads `connections`, suit, element, numerology or keywords. It looks identical for any draw of the same shape. | CONFIRMED (code + every sample's `golden-thread-geometry.json`) — **decorative** |
| G2 | Golden Thread | The strand into the next position starts from the **previous position's last clarifier**, while the written card-to-card bridge runs **base card → base card**. E.g. Celtic sample: strand *The Lovers, reversed (clarifier 2 of The World) → Two of Cups, reversed*; text "Following The World, Two of Cups…". The picture implies a link the text never makes. | CONFIRMED — needs Chas/Si Aye decision |
| G3 | Golden Thread | Clarifier 2's strand comes from the base card, not from Clarifier 1. This matches the written reading (both clarifiers are related to the base card), but the rule draws Clarifier 2 *because* Clarifier 1 is a Major, which suggests Clarifier 2 qualifies Clarifier 1. | OPEN — interpretation question for Chas |
| G4 | Golden Thread | Reversed cards get no different thread treatment. | CONFIRMED — decorative |
| G5 | Golden Thread | In the Celtic Cross at desktop width the straight position-order strands cross over card pictures (e.g. Near Future → Your Approach passes over Hopes and Fears; see `samples/celtic/golden-thread-1280.png`). Visual only. | CONFIRMED — decorative |
| T1 | Text | Written card-to-card bridges use the cards' own `connections` text only when the two neighbours name each other; otherwise a generic line ("may draw your attention toward …"). See `samples/*/written-interpretation.txt`. | CONFIRMED |
| T2 | Data | 73 of 78 cards (IDs 5–77) have templated `spiritual` / `wuWei` / `wabiSabi` text; the Wu Wei line is shown in every reading. | CONFIRMED (`sources/DATASET_NOTES.md`) |
| T3 | Data | Minor Arcana carry no astrology (no decans); their "CARD CORRESPONDENCE" shows only element + suit. | CONFIRMED |
| T4 | Data | Major correspondences are Golden Dawn-derived with two undocumented changes (Fool = Uranus; Emperor + Mars). | CONFIRMED vs named tradition; citation UNKNOWN |
| T5 | Text | The card-to-card bridge names the *previous* card without its orientation ("Following The World…" when The World is reversed); the heading for the current card does include it. | CONFIRMED (Celtic sample, `written-interpretation.txt`), minor |
| C1 | Clarifiers | Forced non-Major third draw not implemented (by instruction). Seen in the Celtic sample: The World → The Hanged Man (Major) → The Lovers (Major), and the reading stops at two. | OPEN pending Chas |
| R1 | Evidence tooling | The Golden Thread's sparkle effect calls `Math.random` every animation frame, the same source the draws use. No fairness effect in the app (unseeded), but a seed alone did not reproduce clarifier cards; the sample tool now gives animation frames their own stream, and two runs produced identical draws. | Handled in tooling; no app change |
| C2 | Code hygiene | Dead text in `additionalClarifierView()` says a card "may reappear", contradicting the rule; never rendered. | CONFIRMED, not user-visible |
| P1 | PDF | Text only: no card images, no Max transcript, no thread picture. Reading text matches the page (see consistency checks). | CONFIRMED (by design?) |

## UNKNOWN — no evidence in this package

- Interpretive accuracy of the 78 meanings against Waite's *Pictorial Key* / 1909 imagery (Deep's lane; not assessed here).
- Authorship and sources of all card text; licence of the image source repository.
- Real-device behaviour (Samsung/Android, iPhone, Safari, Firefox). All browser evidence here is headless Chromium with emulated 360/390/1280 widths.
- The Vercel preview for the new SHA, and the original preview URL (authentication required; not opened in this audit).
- Chas's recorded-voice path in Max (private files; deliberately not used). Max ran muted, captions only.
- Seven-card V, Relationship (5) and a five-card fixture: not produced as samples (requested scope was 1 / 3 / Celtic Cross); their layouts are covered only by the D2 test.
- Independent reproduction: **none yet.** Every PASS in this package is a test run by Claude.
