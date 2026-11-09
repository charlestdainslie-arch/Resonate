# Release candidate, 9 Nov 2026: Issue #49 reconciliation

Chas / Si Aye team directive, 9 Nov 2026, section 2. **This is a candidate for UAT, not a release.** No merge, production deployment, app-store submission or spending without Chas's explicit approval.

## The candidate

| | |
|---|---|
| Application commit | **`282cd1457ec94e8436f81b3867799f45dfcad110`** |
| Branch | `claude/uat-thread-fixes` (isolated UAT branch; `main` untouched) |
| UAT preview | Vercel deployment `resonate-ekiank195` (`dpl_Df9pR1LZJY9eusPDKkxGM74PUbbZ`), built from `282cd14`. Served `presenter-uat.html` checked against the commit. Private share link via Chas only (23-hour links; refreshed on request) |
| Clean full test run | `audit/builds/test-run-282cd14/`: all 38 suites exit 0, including `reversal-identity` 781/781; working tree clean before and after |
| Shuffle | identical to the approved reference `73da97d` (`deck-engine.js`, `reading-stage.js`; `shuffle-identity.txt`) |

Lineage: `4dc4df5` (Option B freeze) → `f321114` (Max lifecycle) → `ea46221` (mobile layout P2) → `b661280` (Golden Thread includes the Clarity card) → `282cd14` (interpretation engine).

## Gates

| Gate | Status | Who | Record |
|---|---|---|---|
| Interpretation (CC-03, BT-03, B09, Golden Thread, reversals, Max consistency) | **PASS** | Deep (independent) | Issue #49, 9 Nov; caveats → #50 |
| Evidence ZIP checksum | **CLOSED**: verified by Si Aye, accepted by Chas; Deep's own hash not performed (no file access) | Si Aye / Chas | Issue #49, 9 Nov; ZIP at `8677a1d` |
| Functional / regression tests | **PASS** (automated; functional, not interpretive approval) | Claude | `test-run-282cd14` |
| Samsung audio acceptance (real device) | **OPEN**: the priority gate | Dev | checklist `audit/SAMSUNG_UAT_RC_9NOV.md` |
| Release readiness assessment | after Dev's evidence | Si Aye | |
| Release approval | **Chas** | Chas | |

## Defects: closed in this candidate

| Defect | Found by | Fixed in | Evidence |
|---|---|---|---|
| Clarify buttons outside Max; Max signing off before the seeker finished | Chas, Samsung UAT 8 Nov (P1) | `f321114` | `max-lifecycle.browser`, `audit/MAX_LIFECYCLE.md` |
| Celtic Cross first card clipped on the left; control overlapping caption | Chas, Samsung UAT 8 Nov (P2) | `ea46221` | `max-mobile-layout.browser`, `audit/MAX_LAYOUT_P2.md` |
| Golden Thread left out the Clarity card | Deep, 8 Nov (CC-03/BT-03 item 7) | `b661280` | `audit/DEEP_RECHECK.md` |
| CC-03 evidence showed the reading before the Clarity taps | Si Aye, 8 Nov (an evidence defect, not an app defect) | evidence `f67d9e0` | `audit/DEEP_RECHECK.md` |
| "Together" was a keyword list and element count, not synthesis | Deep, 9 Nov | `282cd14` | `audit/DEEP_RECHECK_9NOV.md`, before/after |
| Golden Thread keyword listing; Major-sequence boilerplate; Invitation ignored most cards | Deep, 9 Nov | `282cd14` | same |
| Reversed Magician bridged with upright qualities (and the same upright-only connection in clarifier notes) | Deep, 9 Nov | `282cd14` | `reversal-identity.browser` (78 cards × 2 orientations, 312 bridges) |
| Minor original with two Major clarifiers not demonstrated | Deep, 9 Nov | sample B09 (app already correct) | `handoff/BT-03.md` |
| SC-01 asked for "Foundation", which is not a Seven-card position | Deep, 8 Nov (BLOCKED) | criterion corrected to SC-01A (position 1) | `audit/DEEP_RECHECK.md` |

## Open, non-blocking

- **#50 Interpretation polish** (Deep): the Invitation lists themes rather than tracing the arc; "says the same thing more strongly" over-asserts; integration wording is thin; closes repeat.

## Confirmed in this candidate (item 2.4)

Checked on a clean checkout of `282cd14`, all five spreads, at Samsung widths 360×780 and 412×915 (touch, 2×). Tool: `audit/tools/rc-screens.cjs`. Screens and results: `audit/rc-2026-11-09/screens/`.

| Spread (`?qa=`) | Clarifiers in their slots | Cards inside the screen | Sideways scroll | Max: Play, Clarify, Finish on screen | Page errors |
|---|---|---|---|---|---|
| One card (`B01`) | 1 position, 2 cards | yes | none | yes ("✦ Draw Clarity card") | none |
| Three card (`TC-04`) | 1 position, 2 cards | yes | none | yes | none |
| Relationship (`RC-02`) | 1 position, 1 card | yes | none | yes | none |
| Seven card (`SC-01A`) | 1 position, 1 card | yes | none | yes | none |
| Celtic Cross (`B06`) | 10 positions, 18 cards | yes | none | yes ("✦ Draw Clarity card") | none |

The same holds at both widths. **Golden Thread integration:** it follows every revealed card including Clarity cards (32 in B06 after the live taps), with orientation-true bridges (`reversal-identity`, `clarity-live`). **Max controls:** Clarify inside the player, Finish reading, closing only after Finish and once (`max-lifecycle`, 14 cases; live transcript: "Take what resonates, and leave the rest." and "Max Chasroom, signing off." are heard only after Finish, once).

These screens show what the page renders. They are not audio evidence; that is Dev's gate.

## Constraints held

Approved shuffle and deal animation unchanged · secure random draws · five spread layouts · clarifier positions · Option B (not reopened) · Seven-card reading order · Max's in-presenter Clarify and Finish · closing only after Finish · mobile layout · journal and PDF (same text as the page) · no private voice recordings committed.
