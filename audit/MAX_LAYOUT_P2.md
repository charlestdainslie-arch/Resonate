# P2: Max on Samsung: Celtic Cross first card clipped; control over the caption (8 Nov 2026)

Branch `claude/uat-max-layout-p2`, from `claude/uat-max-lifecycle` (`f9ea76e`, app code `f321114`). No merge,
no production change, no spending. Only `presenter.js` and `presenter.css` changed.

## What was wrong (measured at 360x800 and 412x915 on f321114)

1. **First card clipped on the left (Celtic Cross).**
   - Max's card strip scrolls sideways, so it clips anything outside its box, and it had only 2 px of side
     padding.
   - Max opens with card 1 selected. Its highlight (a 2 px outline 3 px out) reached 5 px past the picture,
     so 3 px of it was cut off at the left edge.
   - The same happened to the gold glow of the active card.
2. **The clarify bar over the caption.** At 360x800 the bar, fixed to the bottom of Max, covered the lower
   part of the caption (caption bottom 705 px, bar top 645 px) and the Play button.
3. **Card artwork cropped in One Card / Three Card (found by the new test).**
   - A 30 Oct rule capped the picture's height on phones but kept its width at 100%.
   - The picture box was therefore no longer card-shaped, and the artwork was cropped to fill it.
4. **Strip not at card 1 when Max opens (Relationship, Seven-card).** The strip jumped to the first card the
   rule was waiting on, so card 1 was off screen until scrolled back.

## Fixes

- **Strip padding.** The strip keeps 10 px around its cards (`scroll-padding` too), so the first and last
  cards' border, outline and glow are always inside it.
- **Phone layout (≤640 px wide).** The player is now three fixed regions:
  - the header at the top;
  - Max and the cards in the middle, scrolling up and down;
  - one panel at the bottom with the caption, progress, Play / Replay / Mute / Words in one row, and the
    clarify bar.

  Nothing can cover the caption or Play, and no scrolling is needed to keep the caption in view. Desktop and
  tablet layout is unchanged.
- **Proportions.** On phones, up to three cards narrow the picture to fit the height, instead of cropping
  it. The ratio stays 0.58 everywhere.
- **Opening position.** The strip starts at card 1. It follows a card only once Max is speaking or the seeker
  picks one.

## Evidence

- New `tests/max-mobile-layout.browser.cjs` covers all five spreads plus a reversal-heavy Celtic Cross
  (CC-02), at 360x800, 384x854 and 412x915: 18 cases. Each checks:
  - the strip starts at card 1;
  - card 1's picture, border and highlight sit inside the strip and the screen;
  - every visible card keeps ratio 0.58 and is not cut at the top or bottom;
  - reversed cards are rotated;
  - there is no sideways page scroll;
  - the caption, Play, Clarify and Finish are each uncovered;
  - caption, controls and bar are stacked without overlap;
  - after clarifying the last card inside Max, it and its clarifiers are inside the strip.
- Screenshots: `audit/max-layout-p2/` (open and clarified, per spread and width).
- The approved shuffle, secure randomness, Option B, reading order, Golden Thread and PDF are untouched.
