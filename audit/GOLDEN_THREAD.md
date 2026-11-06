# Golden Thread — verification at `a667664`

Two different things share the name, and the audit treats them separately:

| | **Visual thread** (animation) | **Written Golden Thread** (text) |
|---|---|---|
| Code | `golden-thread-connector/`, `golden-thread-live.js` (reading page), `max-golden-thread.js` (Max's card strip) | `goldenThread()` + `cardToCardThread()` in `app.js` |
| Loaded on | `presenter-uat.html` only (not `index.html`) | every reading page, the PDF, and Max's closing lines |
| Driven by | card **positions** and reveal state | card **content** (keywords, astrology, `connections`, numbers, orientation) |

## 1. Which cards the visual thread connects

Exactly two kinds of strand (from `_buildSegments`):

1. **Parent → clarifier**: each revealed clarifier is joined to *its base card* (Clarifier 1 and Clarifier 2 both start at the base card).
2. **Position → next position**: position *i* joins position *i+1*, in position-number order. If position *i* has clarifiers, the strand starts from its **last** clarifier, not from the base card.

Plus one ring (gold loop) round every revealed card picture, and an entry strand from the top of the stage to card 1.

Measured strands for each sample are listed in `samples/<spread>/golden-thread-geometry.json` (`strands[].from / to`, resolved to card names).

## 2. Do those connections correspond to the interpretation?

- **Sequence: yes.** The written card-to-card section also runs position 1 → 2 → … → n, and each clarifier is interpreted against its base card (`storyConnection(base, clarifier)`), which is what the parent → clarifier strands show.
- **Meaning: no.** The visual thread receives no card identity for clarifiers, always `orientation: 'upright'`, and no `connections`, suit, element, numerology or keyword data. The same spread shape always produces the same thread whatever is drawn. **It is decorative, not meaning-driven** (Finding G1).
- **One visible mismatch (G2):** where a position has clarifiers, the strand to the next position leaves from the last clarifier, but the written bridge links the two *base* cards. Celtic Cross sample: strand *King of Swords (Clarifier 2 of The Sun) → The World*; text: *The Sun → The World*.

What the written thread *does* use from the cards: each card's first two keywords per orientation, its astrology string, its `connections` text when neighbours name each other (otherwise a generic sentence), number sums, and a sentence counting reversed cards.

## 3. Outer-card-to-ring geometry

Each ring is drawn round the card **picture** (not the whole button or caption box) with a fixed `RING_MARGIN` of 5 px, measured from layout offsets so it is correct while a card is face down or mid-turn. Strands join the facing edges of two rings (`edges: 'nearest'`).

Measured in every sample at 1280, 390 and 360 px: `rings[].margin_px` = distance from picture edge to ring path on each side. See the summary table at the end.

The Golden Thread's own suite (`tests/golden-thread-connector.browser.cjs`, 27 checks on `demo.html`) asserts geometry within 2 px at 360/390/1280.

## 4. Clarifiers and reversed cards

- Clarifiers: covered above. Clarifier 2 hangs from the base card, beside Clarifier 1 (open question G3: should it hang from Clarifier 1?).
- Reversed cards: **no difference in the thread.** The picture is rotated 180° by `reversals.css`; the ring follows the picture box, which is unchanged. Defect D1 (reversed clarifier landing upright after the thread turned it) is fixed in `020d8de`.

## 5. Mobile layout at 360 px and 390 px

At 1100 px and below the multi-card spreads drop to reading order (`uat-fixes.css`), so the thread runs top-to-bottom through the positions in number order. Screenshots: `samples/<spread>/golden-thread-390.png`, `-360.png`, full-page `page-390.png`, `page-360.png`. Horizontal page overflow is measured (`consistency-check.json → horizontal_page_overflow`).

Desktop: before `c1db1c5`, mounting the thread shifted every Celtic Cross / Relationship / Seven V position by two (D2). Fixed; `golden-thread-1280.png` shows the restored cross-and-staff.

## 6. Reduced motion and clean-up

- Reduced motion: no flight, no sparkle loop; strands and rings appear still. Measured per sample (`consistency-check.json → reduced_motion`): strand and ring counts, and `document.getAnimations()` running = 0. Screenshot `golden-thread-390-reduced-motion.png`.
- Clean-up: `destroy()` cancels the rAF loop and animations, disconnects ResizeObserver and MutationObserver, removes window listeners (keeping `pageshow` only for bfcache remount) and removes the `<svg>` and `<canvas>`. Measured: overlay nodes left after leaving the reading = `overlay_nodes_after_leaving_reading` in each sample's consistency check. The connector suite also checks idempotent destroy, mount/destroy loops, bfcache remount and mid-flight destroy.

## 7. What is decorative today

- The whole visual thread (path, order, sparkle, glints) — it encodes **order and parentage only**.
- The strand from a last clarifier into the next position (G2).
- Max's strip thread: it follows the narration order (`maxchasroom:show`), never card meaning.

To make it meaning-driven, the smallest honest step would be to pass real `cardId` and `orientation` in `readState()` and draw the position → position strand only between base cards, with its style taken from the same rule that chooses the written bridge (named connection vs generic). That is a design decision for Chas and Si Aye; nothing was changed here.
