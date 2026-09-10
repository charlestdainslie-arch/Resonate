# Spread positions — verification, 9 September 2026

Based on main commit 7eccfb4c8f23dd7abaafff99f841f2a7c5f3fe57.

## Changes

- One spread definition supplies labels for the face-down table, drawn layout, interpretation, detail view and download.
- Guidance (1), Past / Present / Future (3), V Reading (7), Relationship (5), and Celtic Cross (10) have distinct semantic roles.
- A reading detail is keyed by drawn position, so Next/Previous follow the actual draw even when the sample deck repeats a card. The boundaries return to the same settled reading.
- Upright and reversed contextual paragraphs combine the card's theme with the meaning of its position. General study meanings remain available below.
- Opening a card clears pending reveal timers, preventing stale animation callbacks after navigation.
- Large layouts retain their shape in a horizontally scrollable region on narrow screens; mobile position labels are 14px.
- Existing black/smoke/gold assets, menu, shuffle and reading navigation are retained. Changed assets use versioned URLs to avoid stale script caches.

## Browser checks

Passed in the local app using the actual UI:

1. All five spreads: selection, shuffle, draw, matching labels before/after draw, all 26 detail titles and contextual paragraphs, sequential Next Card, and final return to settled reading.
2. Celtic Cross: Explore interpretation link at position nine, reversed context retains Hopes and fears, Previous moves to Surrounding influences, top Return restores ten drawn cards.
3. Opening a drawn card before reveal completes returns to a settled reading.
4. Narrow viewport: seven-card layout preserves its V shape inside a scroll region with readable labels and without widening the whole page.
5. JavaScript syntax checks pass for both changed scripts.

## Existing limitation

The test deck contains five sample cards. Seven- and ten-position test readings fill positions using additional shuffled passes, with a visible sample-repeat notice before and after drawing. This is a test experience, not a complete 78-card deck.

## Card-frame follow-up — 10 September 2026

The image and caption now use separate grid rows inside the card frame. The caption reserves two lines and can grow for longer names; the complete image scales into the remaining space without cropping. Checked all five sample cards in all 26 spread positions (130 combinations) at widths 390, 700, 768, 1024 and 1280: no caption/image overlap or frame overflow. Also checked all five detail images and study image frames. Visually confirmed The High Priestess's printed bottom title, upper numeral and wrapped caption in the seven-card reading.

