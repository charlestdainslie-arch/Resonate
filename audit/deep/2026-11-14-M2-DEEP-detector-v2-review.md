# Deep — M2 detector v2 review, and what still isn't covered

**Date:** 14 November 2026
**From:** Deep (independent QA)
**To:** Claude (action), Chas (cc), Si Aye (cc)
**Pin:** `74ba9ee` (`claude/sprint-14nov-stack`), confirmed as local HEAD
**Status:** Detector review complete. **Browser rerun not yet done** — reason and plan in §4.

---

## 1. Verdict on D1–D10: all ten addressed, two better than I asked

| # | Fix | Where | Verdict |
|---|---|---|---|
| D1 | Fixed/sticky controls found by computed position, not `offsetParent` | `:139-152` | **Fixed** — plus `covered` via `elementFromPoint`, and `endCovers` at the foot of the page |
| D2 | Page-wide geometry outside the board | `:131-137` | **Fixed** — `page.edge`, `page.text`, and `pageChecked` count |
| D3 | `scrollWidth` no longer trusted | `:109-110` | **Fixed, and better** — `rootOverflowX` now records whether `overflow-x: hidden` is in force, so the false-clean case is visible |
| D4 | Inline labels | `:85-91` | **Fixed** — `Range.getBoundingClientRect`, which works for inline |
| D5 | Truncation with the box fitting | `:87-89` | **Fixed** — line-clamp and ellipsis detected explicitly |
| D6 | Font settling | `:102` | **Fixed** — plus `:105`, which `finish()`es finite animations so a frozen entrance fade no longer reads as opacity 0. That is a better fix than I proposed; I had not thought of it |
| D7 | Expected clarifier counts | `:177-181` | **Fixed** — `nextDueClarifier()` plus `2 × positions` |
| D8 | Vertical clipping | `:68-81` | **Fixed** |
| D9 | Tolerance | `:124` | **Fixed** — 0.5 px |
| D10 | Position count | `:174` | **Fixed** — `.reading-position` only |

The three defects it then found validate the rewrite: a card name over "Draw Clarifier 1", a two-line laptop name into the button row, and 10 of 25 dock labels cut at 360 px. **The dock-label one is the clearest vindication** — v1 could not have seen it at all, since `offsetParent` is null for a fixed dock.

---

## 2. Residual gap R1 — Max's player content is still measured by nothing

This is the one that matters.

```js
// :131  page-wide scan
const pageEls = [...page.querySelectorAll('*')].filter(e => !board.contains(e) && ... && !e.closest('.mc-dock, .mc-player'));
```

```js
// :139-140  fixed/sticky scan
.flatMap(f => [f, ...f.querySelectorAll('button, a')]).filter(e => e.matches('button, a'))
```

`.mc-dock` and `.mc-player` are excluded from the page scan. `.mc-player` **is** `position: fixed` (`presenter.css:8`), so it enters the fixed scan — but that scan keeps **only `button` and `a`** elements, and their `<span>` children for text.

So inside Max's player, **only buttons and links are measured**. Not measured, at any viewport:

- the transcript paragraphs and their boxed headings (the structure Chas only recently approved)
- Max's captions (`#mcCaption`)
- the card strip's card names (`img.mc-main`, strip labels)
- the "Part n of N" line and progress bar text

`.mc-player` is also `overflow-y: auto`, so the `clipBox` logic deliberately treats it as scrollable rather than clipping — meaning even if its contents were scanned, horizontal cut would need the element-level `edge` check, which never runs there.

**Why this is the important one:** the 360 px defect just fixed was a *dock label*. The same class of bug — a long position or card name on a narrow phone — sits in the transcript, which is longer and boxed. The checker that found the dock bug cannot see the transcript.

**Suggested fix, small:** add a `player` group mirroring `fixed`: scan `.mc-player p, .mc-player h3, .mc-player h4, .mc-player strong, #mcCaption, .mc-card span` for `edge` and `textCut`, with the player open. One extra list, no new machinery.

---

## 3. Two smaller things in v2

**R2 — `defects` under-reports when anything is found.** `:182` caps each list at 12, then `:183` computes `out.defects` from the capped arrays. A run with 20 edge defects reports 12. **Zero still reads as zero**, so the pass criterion is safe — but any non-zero figure is wrong, and it will be wrong exactly when the run is going badly. Compute `defects` before capping.

**R3 — latent sentinel.** `:178-179`:
```js
const due = typeof nextDueClarifier === 'function' ? nextDueClarifier() : -2;
if (due !== -1) out.full.push('clarifier still due at position ' + (due + 1));
```
If the function were ever missing, `due = -2` and `-2 !== -1`, so it reports *"clarifier still due at position -1"* — a fabricated defect rather than a loud failure. Safe today: `nextDueClarifier` is a global function declaration at `app.js:606`. Use `due >= 0`, or default to `-1` and log the missing API separately.

---

## 4. The browser rerun — what I need

I cannot paste into a console: there is no CDP library on this laptop (`websocket`, `websockets`, `pychrome`, `playwright` all absent — only `requests`), and my headless Chrome can screenshot and `--dump-dom` but cannot evaluate arbitrary script against a live page.

So rerunning `measure-stack.js` needs one of these, and I would rather ask than improvise:

1. **A share link I can reach without the Vercel login** — my fetches get 401, so the preview is invisible to me.
2. **Or Claude runs the 40 cases and drops the `measure()` JSON plus the captures in `inbox/`.** I can read images and JSON at no cost, and I can check the JSON against the pixels, which is a stronger review than either alone.
3. **Or one approval for a scripted run from my side:** I build a file:// harness that loads `index.html` in a 360 px iframe, injects the checker into that frame, drives `deal()`/`clarifyAll()/measure()`, and writes the JSON into the harness title for `--dump-dom`. That works without CDP, and it is one approval per run.

My preference is **2**, with **3** for the two spot-checks I flagged earlier (Celtic at 360, Seven-card at 1440). It gives the most coverage per prompt and it keeps my review independent of the instrument's author only where it counts — the pixels.

Until then I am **not** marking M2 independently verified, and the 20% milestone figure stays as Claude has it.

---

## Checkpoint

- **Completed:** detector v2 review — D1–D10 all addressed (two exceeded); three residual findings R1 (Max's player unmeasured), R2 (defect count capped), R3 (latent sentinel). Evidence: `tools/m2/measure-stack.js:102,105,131,139-146,177-183`; `presenter.css:8`.
- **Current work / owner:** Claude — R1–R3, and the 3 fixes. Deep — awaiting evidence route (§4) to run the independent browser review.
- **Blockers:** browser access route, one decision (§4: 1, 2 or 3).
- **Independent QA status:** M2 **PENDING** — instrument now credible for the board, blind inside Max's player. Issue #53 **PASS** by inspection, browser **PENDING**.
- **Progress:** unchanged, and not mine to raise.

**RESONATE 20% complete | Stack [3 defects fixed, 40/40 on a checker with one residual blind spot] | Current [M2 independent review blocked on access route] | QA [PENDING M2, PENDING #53 in browser] | Next [close R1, then evidence via §4 route 2 or 3].**

— Deep
