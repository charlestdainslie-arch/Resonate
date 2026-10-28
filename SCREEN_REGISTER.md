# RESONATE Tarot — as-built screen & flow register

Scope: issue #24 item 1 / #22 screen-register schema. Built from source and browser runs on branch
`claude/r2-foundation` (parent `claude/issue14-uat-base` @ `1ced90b`). **As-built, not approved.**
Results are local headless Chromium (Playwright 1.63) only — not a real Android device, not a deployed preview.

Status key: **PASS** = covered by an automated browser check that passed on this branch ·
**PARTIAL** = some controls covered · **NOT TESTED** = no automated check · **NOT IMPLEMENTED**.

| FLOW-ID | View (`state.view`) | Entry | Inputs / controls | Output / state | Return path | Failure modes handled | Status (test) |
|---|---|---|---|---|---|---|---|
| S-01 | `home` Landing | App load; Home in menu; any "Home" back link | Get a Reading, Learn the Cards, hero card (opens The Fool), three path tiles, menu | Navigates to `reading` / `learn` / `saved` / `detail` | Phone Back on Home leaves the app normally | Missing image → `imageFallback` placeholder | PASS (`navigation-a11y`, `browser-uat` home fit) |
| S-02 | Menu overlay | ☰ on every page | Home, Tarot Reading, Learn, Journal, ✕, Escape | Opens/closes; focus moves in and back; inert when closed | Escape, ✕, phone Back closes menu | — | PASS (`navigation-a11y`) |
| S-03 | `learn` Learn the Cards | Home, menu, detail Back | Search box (fuzzy), ✕ clear, element chips (All/Air/Water/Earth/Fire), card tiles, Reset filters (no-match) | 78 tiles; count label; filter + search combine; chips expose `aria-pressed` | Back link → Home; phone Back → Home; search/filter kept after detail | No-match empty state + Reset | PASS (`coverage-gaps` G1) |
| S-04 | `detail` Card detail | Learn tile, Journal tile, reading card, "Explore" in reading | Return, bookmark, Upright/Reversed tabs (arrow keys), Prev/Next, card reflection note | Meaning/keywords swap; bookmark persists (`resonate-bookmarks`); in-reading shows position + sky at reading | Return → origin (learn / saved / exact reading + scroll); Prev on first / Next on last in a reading → reading | Unknown card id → first card | PASS (`coverage-gaps` G2/G3, `browser-uat` detail-return) |
| S-05 | `reading` Spread choice + optional astrology | Home, menu, "Back to spreads", "Start a New Reading" | Spread buttons (guidance, three, relationship, seven, celtic), opening dice, astrology form (date/time number fields, place/zone, repeated-time select), Calculate my sky, Example, Skip | Dice digits; sky snapshot stored in `state.readingAstrology` | Back link → Home | Invalid date, DST gap/overlap, no details → visible feedback | PASS (`uat-round1`, `browser-uat` astrology/dice) |
| S-06 | `stage` Reading table (face down) | Spread button | Shuffle Cards, Draw Cards, Back to spreads | Contained shuffle 0.86s, no stagger, button locks/unlocks; status text | Back to spreads → S-05 | Reduced motion → no animation | PASS (`coverage-gaps` G5, all 5 spreads) |
| S-07 | `draw` Reading | Draw Cards; Journal "Open reading"; return from S-04 | Reading cards, Clarify (max 2 layers), Explore card, astrology snapshot `<details>`, Back to spread & clarifiers, View My Journal, Start a New Reading, Download Reading PDF, reflection + Save Reading to Journal | Position meanings, clarifier narrative, Golden Thread, numerology; journal entry | Back → spreads, or → Journal when opened from Journal (D8) | No third clarifier; unsaved-clarifier notice; storage failure message | PASS (`coverage-gaps` G3, `browser-uat`, `uat-round1` D8) |
| S-08 | `saved` Your Personal Journal | Home tile, menu, View My Journal | Saved readings (Open reading, edit reflection + Save Reflection), bookmarked/annotated card tiles | Entries sorted newest first; unsaved-changes notice | Back link → Home | Empty state → Learn the Cards; storage failure message | PASS (`coverage-gaps` G4, `browser-uat` reopen) |
| S-09 | PDF export | Download Reading PDF (S-07) | — | Branded, paginated PDF with journal content | Stays on S-07 | — | PASS (`browser-uat`, desktop only) |
| S-10 | Shop link | `shop-link.js` (password-protected store) | External link | Opens store | — | — | NOT TESTED (store must stay password-protected, #24 item 8) |

## Known gaps (not claimed)
- Real Android device UAT for every row: **NOT RUN** (owner action, #24 item 5).
- Screen-reader pass (TalkBack/VoiceOver): **NOT RUN**; only ARIA attributes are asserted.
- Journal corruption / quota / two-tab reconciliation (#22 failures list): **NOT TESTED**.
- Living Transmission, reversal-aware synthesis, astrology interpretation: **NOT IMPLEMENTED** in this candidate (do not fabricate, #24 item 4).
- Performance budgets on hardware: **NOT MEASURED**.
