# Deep — M2 detector critique, and issue #53 verification

**Date:** 14 November 2026
**From:** Deep (independent QA)
**To:** Claude (action), Chas (cc), Si Aye (cc)
**Pin:** `99d8b67` on `claude/sprint-14nov-stack`; M2 baseline measured at app code `2a2b4e5`
**Status:** Code inspection only. **I have not run either page in a browser this session.**

---

## PART 1 — The M2 detector: what it cannot see

Claude asked me to challenge the method. `tools/m2/measure-stack.js` is a careful script and the 40/40 result is probably right about what it measures. The problem is what it is structurally unable to measure. **The three biggest blind spots all happen to exclude the exact things M2 is meant to catch.**

### D1 — Fixed-position elements are invisible to every check *(most important)*

```js
const els = [...board.querySelectorAll(...)].filter(e => e.offsetParent);
```

**`offsetParent` is `null` for `position: fixed`.** Max's dock and the Clarify button are fixed — so they are dropped from `els`, `cards` and `texts` before any geometry is examined. They can sit directly over a card, a label or a card's caption and the report will say clean.

Claude's note says floating controls are "not covered". That is true, but the cause is not a scoping choice — it is that the filter deletes them. **Covering them needs a separate loop that does not use `offsetParent`** (use `getClientRects().length` or a visibility check instead).

### D2 — Every element check is scoped to `.spread-board`

`board.querySelectorAll(...)` is the source of `els`, `cards` and `texts`. Anything outside the board is unmeasured: the written reading, the map, the part boxes, the Next buttons, the header, the sticky nav.

"`scrollW` vs `vw`" is page-wide, so a *page* overflow would be caught. But a clipped label inside the written reading is invisible to this script. M2's brief says "check clipping, spacing, overlapping" for the whole stack, and the detector only covers the board.

### D3 — `overflow-x: hidden` makes the page-level overflow check lie

`document.documentElement.scrollWidth` clamps to `clientWidth` when the page hides horizontal overflow. So `scrollW === vw` reports "no overflow" while elements are genuinely cut off at the right edge.

The element loop *does* still catch them — `getBoundingClientRect()` returns unclipped geometry — so the script is not blind to this, but the headline number is. **`overflowRight` is the real detector; `scrollW` is decoration.** Worth a comment so nobody trusts the summary line.

### D4 — Inline labels cannot be detected as clipped

```js
if (e.scrollWidth > e.clientWidth + 1 && /label|strong/i.test(...))
```

`clientWidth` is **0 for inline elements**, so this comparison can never fire for them. `.slot-label` renders as a `<span>` — an inline element. Clipped-label detection therefore only works for labels that happen to be block-level. A truncated position label would pass.

### D5 — Text truncation is invisible even when the box fits

`text-overflow: ellipsis`, `-webkit-line-clamp`, and text clipped by an ancestor's `overflow: hidden` all leave `scrollWidth === clientWidth` on the element. The box is fine; the words are not. Nothing in the script compares rendered text to its container.

### D6 — No webfont settle before measuring

There is no `await document.fonts.ready`. `deal()` waits for `drawSettled` plus 800 ms, which usually covers it, but a late font swap reflows the board *after* measurement. The 40/40 may be measuring a layout that no longer exists a second later.

### D7 — `clarifyAll()` can quietly under-fill the layout

The loops break on the first disabled or unrecognised button. If a clarifier fails to draw, the "fullest layout" claim is false and the pass is measured against a partial stack. `out.clarifiers` is reported but nothing asserts it against the expected count. **For each spread the run should assert the expected number of clarifiers, not just print how many it found.**

### Smaller ones

- **D8** Vertical clipping is never checked — only horizontal edges.
- **D9** `hit()` uses a 2 px tolerance, so 1–2 px overlaps pass by design.
- **D10** `out.positions = board.children.length` counts every child, not just positions.

### What I would add, in order

1. A second pass that measures **fixed and sticky elements** against the board (no `offsetParent` filter).
2. `await document.fonts.ready` before `measure()`.
3. A `textClipped()` helper: compare `el.scrollWidth` to the *widest text node's* `getBoundingClientRect().width`, or use `range.getBoundingClientRect()` over the text.
4. Assert expected clarifier counts per spread.
5. Run the element loop against `document`, not `board`, and report board-scoped and page-scoped separately.

**What the detector does well** and should keep: the card/card and card/text overlap test with containment exclusion is the right approach; collecting geometry rather than eyeballing is the right approach; and reporting `innerScroll` for `.spread-scroll` caught a real class of bug.

---

## PART 2 — Issue #53: verification by inspection

Chas's three criteria: Clarify greyed through the first layer → Max returns to card 01 with Clarify lit → stays lit after that.

**Verdict: the logic is correct on all three, with one edge case and one wording wrinkle.**

| Criterion | Implementation | Verified |
|---|---|---|
| Greyed during the first pass | `layerLock()` returns `'Max reads every card first…'` while `!heardCards`; `go.disabled = !step \|\| !!lock` (`presenter.js:549, 564`) | **Yes** |
| Stays locked for the whole first pass | `heardAll()` is called only when the chapter is **not** `intro`, `cards` or `invite` (`:456`) — so the invite chapter no longer unlocks it | **Yes** |
| Returns to card 01, Clarify lit | end of script calls `finish()` (`:449`), which sets `heardCards` **before** `updateBar()` (`:471-476`), so the bar offers card 01 lit | **Yes** |
| Stays lit afterwards | `finish()` writes `state.maxHeardAt`; reopening restores via `:373`; Replay does not clear it | **Yes** |

### One edge case worth a decision

```js
let heardCards = typeof chapter === 'string' || (!!state.drawnAt && state.maxHeardAt === state.drawnAt);
```

Opening Max **with a chapter argument** sets `heardCards = true` unconditionally (`:373`). The comment justifies it — "when Max opens on one clarifier chapter, which follows a reading already heard" — but a seeker can draw a clarifier from the reading page *before* Max has read a single card, then open Max on that clarifier. Clarify would be lit during what is otherwise the first pass.

Low severity, and arguably fine. But it is a hole in "locked through the whole first pass", so it should be either accepted deliberately or gated on `state.maxHeardAt`.

### One wording wrinkle

During the `invite` chapter Max says *"If a card calls for more, choose it below and tap Clarify."* At that moment Clarify is **disabled** — it lights a moment later when the script ends and `finish()` runs. If the seeker pauses there, the caption invites an action that is not available.

Not a defect against the criteria, and not worth changing the copy for. But it is the kind of mismatch the care principle asks us to notice: the words promise a choice before the control offers it.

---

## PART 3 — What I have not verified

I have read the code; I have not run either page. Not verified, and not claimed:

- Celtic Cross end to end (36 parts).
- Replay, and closing/reopening Max, in a live browser.
- Real speech — captions only is Claude's method, and speech is what the lock actually gates against.
- Anything in the M2 baseline itself. **I did not rerun `measure-stack.js`.**

The last one matters: I am critiquing the instrument, not confirming or contradicting the 40/40.

---

## Checkpoint (30-minute format)

- **Completed:** M2 detector critique (D1–D10, five recommended additions). Issue-53 logic verified on all three criteria. Evidence: `presenter.js:449,456,471-476,549,564` and `tools/m2/measure-stack.js:40-49`. Pin `99d8b67`.
- **Current work / owner:** Claude — M2 alignment, and the detector fixes if accepted. Deep — awaiting baseline captures to review against §5.
- **Blockers:** none. One decision for Claude: accept the `:373` chapter exception or gate it on `state.maxHeardAt`.
- **Independent QA status:** issue #53 **PASS** by inspection, browser confirmation **PENDING**. M2 baseline **PENDING** — instrument challenged, captures not yet seen.
- **Progress unchanged at 58%.** M2 is claimed but not independently verified, and I do not raise the figure on a claim.

**RESONATE 58% complete | Stack [baseline 40/40 claimed, instrument under challenge] | Current [M2 alignment + detector hardening] | QA [PASS on issue #53 by inspection, PENDING on stack] | Next [add fixed-element and font-settle checks, then rerun].**

— Deep
