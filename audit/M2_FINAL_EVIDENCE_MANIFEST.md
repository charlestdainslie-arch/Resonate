# RESONATE: M2 final evidence and issue #53 sequence (manifest, revision 2)

**From:** Claude. **For:** Deep (independent QA), Si Aye (ledger), Chas.
**Head SHA:** `8650b6b15ab2fc3e138198b183b6ef564a7f33d2` on `claude/sprint-14nov-stack`.
**Files:** 106 evidence files plus `MANIFEST.md` and `MANIFEST.json` (108 in all). `MANIFEST.json` lists every file
with its size and sha256, and repeats each JSON's `sha`, `viewport`, `spread`, `clarifierState` and defect counts.

## Revision 2: what changed since revision 1 (`aa82f67`)
Revision 1 found 6 defects: long clarifier names cut with "…" in Max's card pile, on Past-Present-Future at
360/390/412. **Chas decided on 14 Nov: show them in full.** Commit `8650b6b` (presenter.css grey-4):
- the name in the pile now wraps instead of being cut;
- a one-line name keeps the approved pile step exactly;
- a two-line name lowers the cards above it by 13 px, so the whole name stays in view.

**All 20 `full` cases were re-captured at `8650b6b`** (fresh JSON and PNG; Celtic 360 extras re-taken too).

**Kept from `aa82f67`:**
- **The 20 `bare` cases:** no clarifiers are drawn, so the pile rule has nothing to act on.
- **The 8 #53 captures:** that change is CSS for pile names only, and Clarify's logic and style are untouched.

Each JSON states its own `sha`.

| Set | JSON | PNG | SHA |
|---|---|---|---|
| M2 full: 5 spreads × 4 viewports | 20 | 20 | 8650b6b |
| M2 bare: 5 spreads × 4 viewports | 20 | 20 | aa82f67 |
| Issue #53: One-card and Celtic Cross × 4 steps | 8 | 8 | aa82f67 |
| Extra screens, in `extra/`: Celtic 360 full 02–10; Seven-card 1440 full 02 | none | 10 | 8650b6b |

## How it was made
- **Page and browser:** `presenter-uat.html` (the app plus Max), local server, built-in browser with device
  emulation. The pane was visible for every capture, so animation timing was real.
- **M2 deck:** Majors-first, so every position reaches two clarifiers. `full` is asserted by `measure.full`
  (empty = complete).
- **JSON:** each is the complete, uncapped `measure()` of detector v3 (`tools/m2/measure-stack.js`), including Max's
  player with the transcript fold opened.
- **PNG = the same state as its JSON:** taken straight after `measure()`, scrolled to the top of the spread board
  (`measure.capture`). A PNG shows one screen; the JSON covers the whole page and Max's player.
- **Resolution:** phones are 604/622/606 × 1344. 1440 is captured at 800 × 499, scaled down by the pane.
- **#53:** ordinary deck, 390 × 844, Max muted (captions keep time), Max paused at each capture.

## Results
**M2: 0 defects in 40 of 40 cases.**

**Issue #53: 8 of 8 as specified.**

| Spread | 1 mid first pass | 2 after first pass | 3 during Replay | 4 close + reopen |
|---|---|---|---|---|
| One-card (9 parts) | part 5: **disabled**, `#2c2b29` bg, `#8f897f` text, opacity 1, title "Max reads every card first…" | part 9: **enabled**, gold, card 01 | part 1: enabled | part 0: enabled |
| Celtic Cross (36 parts) | part 18, card 05: **disabled**, grey | part 36: **enabled**, card 01, caption "First clarifiers: card 01 · Present Situation is next" | part 1: enabled | part 0: enabled |

## Notes for the comparison
1. In #53 step 2, `playing: true` alongside `finished: true` is the CSS class `is-playing`, which `finish()` leaves on.
   The button reads "▶ Play again" and nothing plays. This is cosmetic.
2. The floating dock passes over content as the page scrolls, by design. The detector checks that board controls
   are clear when centred (`board.covered`) and that the page's last controls are clear (`fixed.endCovers`).
3. At 1440 the Seven-card V extends past the 900 px column. It is not clipped.
4. Not covered: real Samsung Internet; real speech; cards in motion.

## Asked of Deep
1. Acknowledge receipt with the file count you see.
2. Compare each JSON with its PNG and report PASS / FAIL / UNKNOWN per file. Concentrate on `celtic-cross-360-*`
   (plus extras) and `seven-card-1440-*` (plus extra).
3. Verify #53 from the eight captures.

M2 is not PASS until Deep confirms. No merge, no deploy.
