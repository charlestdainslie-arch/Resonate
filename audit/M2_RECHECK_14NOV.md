# M2 recheck: card stack with the hardened detector, plus issue #53 follow-ups (14 Nov 2026)

**Owner:** Claude. **Independent QA:** Deep, browser review PENDING. **Status: M2 is NOT complete.** It waits on
Deep's independent browser review and Chas's Samsung check. This file supersedes the 40/40 in
`M2_BASELINE_14NOV.md`, which Deep showed could not see the defects M2 exists to catch.

## 1. Detector: Deep's D1–D10, what changed (`tools/m2/measure-stack.js` v2)

| Deep | Finding | Change |
|---|---|---|
| D1 | Fixed controls dropped by the `offsetParent` filter | Visibility comes from `getClientRects()` and computed style. Fixed and sticky controls are found by computed `position`. For each: viewport edge, topmost at its centre, text cut. Each board control is scrolled to the middle and must be topmost. At the foot of the page, the last controls must not be under the dock. The dock's label is tried with **every** position name of the spread. |
| D2 | Board only | A page-wide pass over every visible text element and control in the draw page (77–515 per case): viewport edge and text cut. |
| D3 | `scrollW` hides overflow under `overflow-x: hidden` | The edge lists from element geometry are the detector; `scrollW` stays as a summary only. Root `overflow-x` is recorded (`visible/visible` in every run). |
| D4 | Inline labels never flagged | Text is measured with a `Range` over the element's contents against the box that clips it, so inline elements work. |
| D5 | Ellipsis, line-clamp, ancestor clipping | All three are checked (ellipsis and line-clamp directly; ancestor `overflow: hidden/clip` by box intersection, vertical too). |
| D6 | No font settle | `await document.fonts.ready`, and one-off entrance animations are finished, before measuring. |
| D7 | Under-filled "fullest" layout | `expectFull`: `nextDueClarifier() === -1` and clarifiers ≥ 2 × positions, asserted. Every case: 2/2, 6/6, 14/14, 10/10, 20/20. |
| D8 | No vertical clipping | Included in the clip-box test. |
| D9 | 2 px tolerance | 0.5 px. |
| D10 | `positions` counted all children | `.reading-position` only. |

Also added after the first v2 run: card **name captions** (positioned below the card, outside its box) are compared
with labels and buttons, which is what found finding 1. Content inside a closed `<details>` fold is skipped, as it
is hidden by design. A layer that is both transparent and click-through is skipped too.

**Sensitivity proven:** with planted defects (an inline label cut to 30 px, a card moved onto another card, a
paragraph pushed past the edge, a fixed bar over the board, the dock pushed off-screen), every one was flagged.

## 2. Defects found and fixed (all present in the approved build and in production `7d9ca91`)

1. **One-card, before any clarifier, phones:** the card name sat on the "✦ Draw Clarifier 1" button. At 390 px,
   "XVIII · The Moon" overlapped it by 31 px and both were unreadable (screenshot taken). Cause: the clarifier row
   clears the caption with `margin-top: 58px`, but the bare button had only 8 px.
2. **One-card, laptop (1440 px), before and after clarifiers:** a two-line name ("XXI · The World, reversed",
   16 px) reached 4–8 px into the Draw Clarifier 1 button and into the clarifier row. This was in the approved
   layout and the old detector could not see it.
   **Fix for 1 and 2 (`spread-1-parity.css`, v m2-2):** the room under the card follows the caption's own size,
   `max(58px, 10px + 1.6 × label size + 2.6 × name size)`, applied to the clarifier row and to the bare button.
   On phones it computes to exactly 58 px (checked at 360 and 412), so **the approved phone spacing is
   unchanged**. On a laptop it grows by about 13 px.
3. **Max's floating dock, phones:** at 360 px, 10 of 25 position names were cut with "…", e.g.
   "07 · Outcome · Next 18–24 Months" shown as "07 · Outcome · Ne…" (Seven-card, Celtic Cross, Relationship).
   **Fix (`presenter.css`, v grey-2):** the dock's card label wraps to two lines instead. All 25 names plus the
   dock's other texts now fit at 360/390/412/1440, and the dock stays on screen.

## 3. Result on the final build: 40 of 40 measurements, 0 defects

Page `presenter-uat.html` (the app plus Max's dock). Majors-first deck, so every position is at its fullest. Each
cell is defects just after the deal / defects with every clarifier drawn, then clarifiers / expected.

| Viewport | One-card | Past-Present-Future | Seven-card V | Relationship | Celtic Cross |
|---|---|---|---|---|---|
| 360×800 | 0/0 · 2/2 | 0/0 · 6/6 | 0/0 · 14/14 | 0/0 · 10/10 | 0/0 · 20/20 |
| 390×844 | 0/0 · 2/2 | 0/0 · 6/6 | 0/0 · 14/14 | 0/0 · 10/10 | 0/0 · 20/20 |
| 412×915 | 0/0 · 2/2 | 0/0 · 6/6 | 0/0 · 14/14 | 0/0 · 10/10 | 0/0 · 20/20 |
| 1440×900 | 0/0 · 2/2 | 0/0 · 6/6 | 0/0 · 14/14 | 0/0 · 10/10 | 0/0 · 20/20 |

Every case: both dock controls checked; page elements checked 77 (One-card bare) to 515 (Celtic full); Clarity
cards 1/3/7/5/2; dock labels whole; no console errors. The raw JSON for every case is regenerated by running
the script. The 390/1440 runs and the full 412/360 reruns were all on the final layout build (spread-1-parity m2-2,
presenter.css grey-2).

**Not covered:** real Samsung Internet and its toolbars and font scaling (emulated Chromium only); cards in motion
(M3); the pane was hidden, so `requestAnimationFrame` ran on a 16 ms timer and entrance animations were finished
before measuring. Layout at rest is what is measured.

## 4. Issue #53 follow-ups (team directive, 14 Nov)

- **Chapter exception gated:** opening Max on a single clarifier chapter no longer unlocks Clarify. Only a
  completed reading of the cards by Max does (`state.maxHeardAt`). A lone chapter does not count as heard. Finish
  reading from a lone chapter now plays the whole reading, cards first (it used to start mid-way).
- **Words and control agree:** Clarify now lights, on card 01, at the invitation line itself ("If a card calls for
  more, choose it below and tap Clarify"), not after it. It stays grey through "That's the first layer of your
  reading". In a lone chapter before the cards are heard, that invitation line is not played at all. The recorded
  wording (`frame-invite`) is unchanged; only the timing changed.
- **Browser check (390 px, captions only):** Past-Present-Future, 15 parts. Grey on parts 1–14, including
  "That's the first layer…". Gold on part 15 (the invitation), on card 01. Gold when finished, on reopen and on
  Replay. Lone chapter c1 before the cards are heard: grey on all 13 parts and after them, not marked heard, and
  Finish reading then plays the full 30-part reading from the welcome. After a completed reading, the lone
  chapter includes the invitation and Clarify is gold.
- **Not run:** Celtic Cross end to end with Max (36 parts); real speech.

## 5. Checkpoint

M2: evidence ready, **not complete**. It needs Deep's independent browser review of this file and the script,
then Chas's Samsung check. #53: Claude's browser check passes; Deep's browser verification is pending. No
production merge.
