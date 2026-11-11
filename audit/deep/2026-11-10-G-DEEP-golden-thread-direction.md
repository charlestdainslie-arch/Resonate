# Deep — Golden Thread and linkage direction: interpretation, concepts, structural requirements

**Date:** 10 November 2026, 14:55 AEST
**From:** Deep
**To:** Chas, Si Aye, Claude (cc)
**Re:** Chas's clarification on the Golden Thread and visual linkages
**Pin:** app `274332f`, CSS `ca9c281`, connector `golden-thread-connector/golden-thread-connector.js` v`0.4.0-avoid-cards`
**Status:** Concept only. No production changes until Chas approves.

---

## 1. Interpretation of the direction

**"Kiss" is the operative word, and it is about *where the thread lives*, not how it is styled.**

A line drawn *between* two cards says "these are related". Something that *touches* a card as it arrives says "this card is being acknowledged". The first is a diagram. The second is a presence. Chas is asking for the second, and the difference is structural rather than decorative — a softer stroke or a slower ease on the current geometry will not get there.

Reading his words together: *living* means it is already doing something when you look at it; *spiritual* means it is light and unhurried rather than bright; *elegant* means it does not announce itself; *organic, not diagrammatic* means it must not look routed.

**And I think I found why it currently looks routed.** From the connector's own defaults and the CSS:

| Evidence | What it reveals |
|---|---|
| `sag: 0.3` | Strands are **catenary curves** that droop between edges |
| `edges: 'top'` / `'nearest'` | Strands join card edges — bottom-to-top, or side-to-side |
| `avoid-cards`, "bends round" (G5, Issue #49) | Strands are **routed around** card pictures |
| `z-index: 6`, above the cards, "draw over the cards" | The thread crosses the page over the artwork |
| `text-shadow` halos on labels the thread crosses | Text has to be **rescued** from the thread |

That last row is the diagnosis in one line: **a design that needs to add halos to keep words readable is a design that is drawing in the wrong place.** Every one of these is a workaround for a line that has to travel across a page of text and objects. Elegance is not achieved by routing better. It is achieved by not needing to route at all.

**The mechanism already exists** — `reveal()` is described in the demo as "the thread flies to the card, loops round it, then the card turns". So the kiss is already attempted. What is wrong is the *character* of the drawing, not the absence of the feature. That is good news: this is a change of geometry and timing, not a rewrite.

---

## 2. Three concepts

### Concept A — The Kiss (event only)

The thread does not persist. At the moment a card arrives, a short tapering filament emerges from the previous card's far edge, curves gently into the new card's near edge, and dissolves as the card turns. Between reveals, the page shows nothing but a faint warmth along the two edges it touched.

- **Feels:** intimate, restrained, unmistakably a touch rather than a link.
- **Costs:** nothing to avoid, nothing to route, no halos. It exists only in the gap between cards.
- **Loses:** the persistent Golden Thread — the thing that makes the product's signature feature visible at all. On a finished reading there would be no thread to see.

### Concept B — Threaded Through *(recommended)*

**One continuous filament, passing behind the cards, surfacing only in the gaps.**

The thread runs the length of the spread as a single strand, but it goes *behind* each card rather than over it. It is visible only in the spaces between cards — emerging at one edge, curving across the gap, and disappearing behind the next card. At a reveal, the emerging segment **kisses** the arriving card: it touches the edge, holds for roughly 400 ms while the card turns, then slips behind it.

- **Feels:** one living thread threaded through the whole reading, not a set of connections. The cards sit *on* it.
- **Costs:** it becomes a z-ordering change plus a reveal-timing change. The existing `sag`, `avoid-cards` and the text halos all become unnecessary — three workarounds deleted rather than tuned.
- **Keeps:** the continuous thread, so a completed reading still shows the Golden Thread as an unbroken presence.

### Concept C — The Field

No line at all. On arrival, a slow luminance transfers from the previous card to the next across the gap; the thread is implied by light rather than drawn.

- **Feels:** very soft, possibly beautiful in stills.
- **Costs:** at phone size, a luminance transfer reads as a generic glow, which is a different kind of generic from a link line. It also loses the thread entirely, and it is the hardest of the three to keep from looking like a screen effect.

---

## 3. Which best matches Chas's vision

**Concept B.**

Not A, because it deletes the Golden Thread from the page — a reading would end with nothing to look at, and Chas's complaint is that the thread is *not good enough*, not that it should not exist.

Not C, because it trades one generic quality for another and abandons the name.

**B because it fixes the cause rather than the symptom.** The current thread is diagrammatic *because it is drawn over and around things*. Move it behind them and the reason for avoidance vanishes. What is left is a single line that meets cards tangentially and lingers for a moment at each arrival — which is exactly "kiss", and it keeps the thread continuous, which is what "Golden Thread" means.

If Chas still finds B too present, A becomes the fallback — and B is the honest test of whether the thread should persist at all.

---

## 4. What must change structurally

None of these is decorative; each is a precondition.

**S1 — Z-order inversion (the core change).** The thread currently sits at `z-index: 6`, above cards and text. It must sit *behind* the card faces and above only the page background. This alone removes the need for `avoid-cards` routing and for the `text-shadow` halos in `golden-thread-live.css`. **Without this, Concept B is not possible.**

**S2 — The kiss must be driven by Max's speech, not by the flip.** Today `connector.reveal()` is called by application policy when a card is drawn. For the thread to feel alive it must fire when Max *says* the card. That needs `presenter.js` to emit a `card-spoken` cue (position index) that the reading listens for, with the flip and the thread both keyed to it. Until narration and page are linked, the thread is an animation, not a connection.

**S3 — Full-reading parity.** The connector targets `.reading-card[data-reading-card]` and `[data-gtc-*]` elements, which exist on the draw page. The full reading at `app.js:427` has `<article class="golden-card-reading">` with **no identity and no card images**. If the thread is to appear in the full reading as well, those articles need `data-position` / `data-card-id` and a thumbnail. If it is only for the draw page, say so and I will scope accordingly.

**S4 — Two new options, not a new system.** Add `hold` (ms, default ~400) and `taper` (0–1) to `DEFAULTS`. The kiss is a *hold*, not a bounce; the taper is what stops the strand ending in a blunt line.

**S5 — A static fallback that is not an absence.** Under `prefers-reduced-motion`, render the threaded state *statically* — thread visible, card already revealed, no travel. An empty page is not a reduced-motion experience; it is a missing one.

**S6 — A frame budget.** There is an SVG layer *and* a canvas sparkle layer *and* MutationObserver/ResizeObserver. On a Samsung phone that is three systems competing. Specify a 60 fps budget, and be willing to drop the canvas sparkle layer entirely — sparkle is the least "elegant, unhurried" element in the current build.

---

## 5. What I could not inspect

I have read the source, **not the animation**. My claim that it looks routed is inferred from `sag`, `edges`, `avoid-cards` and the halo workaround — strong evidence, but inference. Chas has seen it and I have not, so his "generic linkage lines" is the primary evidence and my diagnosis is the explanation of it.

I also cannot judge the 400 ms hold or the taper by eye. Those numbers are a starting proposal, not a measurement, and Claude should tune them on the device.

---

## 6. Recommendation

Approve **Concept B — Threaded Through**, and authorise **S1 and S2** first as an experiment: z-order inversion plus a speech-driven kiss, on the draw page only, with `hold` and `taper` as options. That is a small, reversible change that tests the whole thesis before anything else moves.

S3 (full-reading parity) should wait, because it depends on whether the full reading is getting card images at all — a separate decision.

— Deep
