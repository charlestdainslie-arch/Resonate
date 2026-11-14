# M2 — Card stack baseline at the approved demo (14 Nov 2026)

> **Superseded by `M2_RECHECK_14NOV.md`.** Deep's review (D1–D10) showed this detector could not see fixed controls,
> captions or truncated text. The hardened detector found three real defects that this 40/40 missed. Kept as a record.

**Owner:** Claude. **Independent QA:** Deep — PENDING. **Build measured:** working tree of
`claude/sprint-14nov-stack`. Its app code is identical to the approved demo `2a2b4e5` / `approved/living-demo-12nov`
(see `M1_RECONCILIATION_14NOV.md`). No app code changed.

## Method

- Local static server (`.claude/serve.py`), `index.html`, Claude's built-in browser with device emulation
  (mobile user agent and touch below 768 px). Chromium, **not Samsung Internet on a real phone**.
- Each spread dealt the way the browser tests do (`go('reading')` → spread → Shuffle → Draw → wait for
  `state.drawSettled`). Deck forced Majors-first (same rule as `tests/helpers/majors-first.cjs`) so every
  position reaches its fullest layout: 2 clarifiers, plus Clarity cards where the rule gives them.
- Measured twice per case: just after the deal (no clarifiers), then after every due clarifier was drawn by pressing
  the on-screen buttons. Script: `tools/m2/measure-stack.js` (rerunnable from the console).
- Pass conditions (Deep §5): page `scrollWidth` = viewport width; no card or label beyond the viewport edge; no
  card over another card or over a label; no clipped label (`scrollWidth > clientWidth`).

## Result: 40 of 40 measurements pass

| Viewport | One-card | Past-Present-Future | Seven-card V | Relationship | Celtic Cross |
|---|---|---|---|---|---|
| 360×800 | PASS / PASS (2 clar.) | PASS / PASS (6) | PASS / PASS (14) | PASS / PASS (10) | PASS / PASS (20) |
| 390×844 | PASS / PASS (2) | PASS / PASS (6) | PASS / PASS (14) | PASS / PASS (10) | PASS / PASS (20) |
| 412×915 | PASS / PASS (2) | PASS / PASS (6) | PASS / PASS (14) | PASS / PASS (10) | PASS / PASS (20) |
| 1440×900 | PASS / PASS (2) | PASS / PASS (6) | PASS* / PASS* (14) | PASS / PASS (10) | PASS / PASS (20) |

Each cell is "after the deal / with every clarifier drawn (number of clarifier and Clarity cards on the board)".

\* **Seven-card V at 1440 px (observation, not a defect):** the V lays out as 7 columns, 1240 px wide, inside the
900 px content column, so it extends ~170 px past the column on each side. `.spread-scroll` has
`overflow-x: visible`, so nothing is clipped or hidden; the screenshot shows all seven cards, labels and Clarifier
buttons. Whether the V should sit within the content column is a design question, not a stack fault.

## Two things this baseline does not prove

1. **Real Samsung.** Emulation is Chromium with a mobile user agent. It does not reproduce Samsung Internet, the
   browser's own toolbars, system font scaling or the real device pixel ratio. Chas's tap test on the Samsung
   (Open work on `TEAM_STATUS.md`) is still the authority for "aligned on Samsung".
2. **Floating controls and motion.** The check covers the spread board only, at rest. It does not check the Max dock
   or the floating Clarify button over cards while scrolling, or the cards mid-flight while the light deals them.
   Those belong to M3 (living animation and Max synchronisation).

Method note: the browser pane was hidden during the run, so `requestAnimationFrame` was swapped for a 16 ms timer
to let the deal finish. That affects the timing of animation, not the layout at rest. One screenshot taken while
hidden showed a stale mid-flip frame over Celtic position 02. A fresh capture and the DOM geometry both show the
card correct, so it is not logged as a defect.

## What this means for M2

On the approved build, at the agreed viewports, the card stack has **no measured clipping, overlap or overflow** in
any of the five spreads, from no clarifiers to the fullest layout. No alignment change is justified by these
numbers. If the founder has seen a specific misalignment, a screenshot or the spread/phone it happened on is needed
to reproduce it; otherwise M2 moves to the real-Samsung check.

## Checkpoint

RESONATE 20% complete | Stack baseline PASS 40/40 (emulated), Samsung real-device check open | Current M2 Samsung
confirmation | QA PENDING (Deep to review M2 baseline) | Next founder's Samsung tap test of the five spreads, or a
screenshot of the misalignment seen.
