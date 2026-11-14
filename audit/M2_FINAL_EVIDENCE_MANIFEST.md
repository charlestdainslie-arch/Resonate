# RESONATE: M2 final evidence and issue #53 sequence (manifest)

**From:** Claude. **For:** Deep (independent QA), Si Aye (ledger), Chas.
**SHA:** `aa82f67a0f0078a9d8a56f3f9160e73fe5a228b3` on `claude/sprint-14nov-stack`. App code is that of `74ba9ee` plus
Max's chip-label wrap (presenter.css grey-3), committed together with detector v3.
**Files:** 106 evidence files plus `MANIFEST.md` and `MANIFEST.json` (108 in all). `MANIFEST.json` lists every file
with its size and sha256, and repeats each JSON's `sha`, `viewport`, `spread`, `clarifierState` and defect counts.

| Set | JSON | PNG |
|---|---|---|
| M2: 5 spreads × 4 viewports × 2 states | 40 | 40 |
| Issue #53: One-card and Celtic Cross × 4 steps | 8 | 8 |
| Extra full-board screens (Celtic 360 full: screens 02–10; Seven-card 1440 full: screen 02) | none | 10, in `extra/` |

## How it was made
- Page `presenter-uat.html` (the app plus Max), served locally. Built-in browser with device emulation. The browser
  pane was **visible** for every capture, so `requestAnimationFrame` was real. (An earlier attempt with the pane
  hidden produced garbled screenshots; all of those files were replaced.)
- **M2:** Majors-first deck, so every position reaches two clarifiers. `bare` = as dealt; `full` = every due
  clarifier and Clarity card drawn, asserted by `measure.full` (empty = complete). Each JSON is the complete,
  uncapped `measure()` output of detector v3 (`tools/m2/measure-stack.js` at the SHA), plus the top-level fields.
- **PNG = the same state as its JSON:** taken straight after `measure()`, with the page scrolled to the top of the
  spread board (`measure.capture.scrollY` records where). A PNG shows one screen. The JSON covers the whole page and
  Max's player, which is opened for the scan and closed again.
- **Resolution:** phones are captured at the pane's frame (604/622/606 × 1344). 1440 is captured at 800 × 499, as
  the pane scales the 1440 × 900 page down to fit. The 1440 images are therefore reduced; trust the JSON
  geometry for small text.
- **#53:** an ordinary deck at 390 × 844, with Max muted (captions keep time). Max is paused at each capture, so the PNG
  and JSON match exactly. Each JSON has `mcClarifyGo.disabled/title/background/color/opacity`, `activeCard`,
  `caption`, `part`, `partChapter`, `finished` and `heardRecorded`.

## Results

**M2: 6 defects in 40 cases, all one kind; 34 cases have 0.**

| Case | Defects | What |
|---|---|---|
| past-present-future-360-full | 2 | Max's card pile: "Temperance, reversed", "Seven of Cups, reversed" cut with "…" |
| past-present-future-390-full | 3 | Max's card pile: "Queen of Cups, reversed", "Seven of Pentacles, reversed", "The Hierophant, reversed" cut with "…" |
| past-present-future-412-full | 1 | Max's card pile: "The High Priestess, reversed" cut with "…" |

The cause is Max's clarifier pile (presenter.css, the approved 9 Nov pile layout). Each clarifier stacked on the
card carries its name in a 13 px strip at 9 px font, which cuts long names with an ellipsis. It shows only where
the strip is not the wide layout, i.e. Past-Present-Future on phones. **Not changed:** making the strip taller
changes the approved pile geometry, so it is put to Chas as a decision.

Fixed earlier in this sprint and verified clean here: the One-card name over "Draw Clarifier 1" (phones and 1440),
the dock label cut at 360, and the chip labels cut at 360 (all 25 position names now wrap).

**Issue #53: 8 of 8 as specified.**

| Spread | 1 mid first pass | 2 after first pass | 3 during Replay | 4 close + reopen |
|---|---|---|---|---|
| One-card (9 parts) | part 5, cards: **disabled**, `#2c2b29`, grey text, opacity 1, title "Max reads every card first…" | part 9: **enabled**, gold `#c9a96a`, card 01 | part 1: enabled | part 0: enabled |
| Celtic Cross (36 parts) | part 18, cards, card 05: **disabled**, grey | part 36: **enabled**, card 01 selected, caption "First clarifiers: card 01 · Present Situation is next" | part 1: enabled | part 0: enabled |

## Notes for the comparison
1. `playing: true` with `finished: true` in step 2 is the CSS class `is-playing`, which `finish()` does not
   remove. The button reads "▶ Play again" and nothing is playing. This is cosmetic state, not behaviour.
2. The floating dock (Clarify / Watch Max) passes over content as the page scrolls, by design. The detector checks
   that the reading's last controls are not under it at the foot of the page (`fixed.endCovers`), and that every
   board control is clear when scrolled to the middle of the screen (`board.covered`).
3. At 1440 the Seven-card V extends past the 900 px content column; it is not clipped (`overflow-x: visible`).
4. Not covered: real Samsung Internet; real speech (captions only); cards in motion.

## Asked of Deep
Compare each JSON with its PNG and report PASS / FAIL / UNKNOWN per file, with evidence. Concentrate on
`celtic-cross-360-*` (plus `extra/…-360-full-screen-02..10`) and `seven-card-1440-*` (plus `extra/…-1440-full-screen-02`).
Then verify issue #53 from the eight captures. Please acknowledge receipt with the file count you see.
