# Reversed cards and audit readiness — evidence (3 Nov 2026)

Author: Claude. Branch `claude/uat-all-in-one`, commits `bc0b163` (cards beside Max), `d11642f` (reversals),
`7ec5a8a` (icon path). Requested by Si Aye, 3 Nov. **For Deep's independent audit on Issue #49. Not merged, not in
production, nothing paid, no audio committed.** Everything below was checked by Claude in a browser on Chas's laptop;
the Node test suites were **not** run (Node is not installed there). Deep: please re-run, don't take these as a PASS.

## What changed
- **Reversals in the reading engine.** Each drawn card (spread and clarifiers) is upright or reversed, even chance,
  fixed when drawn: `state.drawnOrientations = {readingAt, reversed:[card ids]}` (`app.js`, `orientCards`).
  "Include reversed cards" on the spread page (default on, remembered in `localStorage`) gives upright only.
- A reversed card is read with its own `reversed` text, `reversedKeywords` and reversed position lens everywhere in
  the reading: main reading, clarifier layers, evolving reading, Golden Thread, card-to-card thread, PDF, journal.
  Names read "<card>, reversed". Picture upside down (`reversals.css`), label upright.
- **Max Chasroom** says "<card>, reversed" and quotes the reversed lines; reversed clip ids end `-r`.
- **Journal** saves `reversed` with the entry; older entries open all upright.
- **Unchanged:** the clarifier rule (Issue #13: a Major gets a first clarifier, a second only if that clarifier is a
  Major, at most two, other cards by choice). No forced non-Major draws: waiting for Chas on Paul's wording.
- Presenter layout: Max's screen no longer covers the cards (`presenter.css`, `bc0b163`).

## Checks run (browser, localhost, `presenter-uat.html` and `index.html`)
| Check | Result |
|---|---|
| All five spreads end to end: shuffle, draw, reveal, clarifiers by rule, reading, Golden Thread, Max, journal, PDF | pass (1, 3, 5, 7, 10 cards; 35 cards incl. clarifiers, 20 reversed) |
| Per card: face flipped ⇔ reversed; heading, keywords, lens, meaning text = the card's own text for its orientation | pass, every card |
| Clarifiers: heading and meaning follow the clarifier's own orientation | pass |
| Golden Thread: counts every revealed card; reversed cards named "…, reversed"; reversed count stated only when > 0 | pass |
| Max: every card and clarifier named with its orientation, in spread order; every quoted line appears word for word on the page; strip flips match; nothing plays until Play | pass |
| Clarifier rule validator (`ResonateClarifiers.validate`) on every reading | 0 problems; no card repeated |
| Journal save → reopen restores the same reversed cards; list shows them | pass |
| Reversed card opens its detail page on the Reversed tab; returning keeps the reading | pass |
| PDF builds (`%PDF-`), section titles carry "reversed" | pass |
| Upright-only mode: 7-card reading with clarifiers | 0 reversed, all checks pass |
| Share reversed over 20,000 simulated cards | 49.9 % |
| Phone width 375 px: no sideways scroll; reversed picture upside down, label readable | pass |
| Console | no errors from this change; the sparkle icon's SVG path error is fixed in `7ec5a8a`; two 404s are the optional voice-pack lookup |

How to repeat in a browser console on a reading: `reversedIds()`, `isReversed(card)`, `cardMeaning(card)`,
`ResonateClarifiers.validate(base, first, second, byId)`, `ResonatePresenter.buildScript()`.

## Tests touched (not run under Node)
- `tests/additional-clarifiers.test.cjs`: sandbox gets an `orientCards` stub. Its three cases pass when the same
  slice of `app.js` is run in the browser.
- `tests/spread-parity.browser.cjs` P6: chooses the Upright tab before reading it (a reversed card opens on Reversed).
- `tests/presenter.browser.cjs`: expected labels use `cardName()`; clip ids may end `-r`.
- Other browser suites draw at random with reversals on; any assertion that compares reading text with
  `card.upright` could now fail about half the time. **Deep: run the full suite; set
  `localStorage['resonate-include-reversals']='off'` for suites that need upright-only determinism.**

## For Deep's Issue #49 audit (open, not claimed)
- 78-card dataset complete (22 Major, 4 × 14 Minor; every card has upright, reversed, keywords, image). Checked for
  presence only — **accuracy of the upright/reversed interpretations against an agreed reference is not verified.**
- Spread positions: counts match (1, 3, 5, 7, 10). Wording of each position lens not reviewed against Paul's material.
- Neighbouring-card context: 84 authored connections; most neighbouring pairs fall back to a generic bridge.
- Paul's "Major → Major → third non-Major": implemented as two clarifiers at most; whether the second must be a
  non-Major is **unconfirmed** (Chas).
- Commercial rights and provenance of card text and Rider–Waite–Smith images: **not reviewed**.
- Voice: Piper VCTK/alba Scottish voices derive from the research-only Lessac data; not for commercial use.
