# Golden Thread preview — evidence (28 Oct 2026)

Preview only. Production `index.html` is unchanged; nothing is merged. Open `golden-thread-uat.html`
(= `hand-uat.html` + `resonate-golden-thread.css/.js` + `golden-thread-wire.js`).

## The slice Chas will see
1. Choose a spread: #33's hand rises and its filament runs to the first card (unchanged).
2. Draw: #32's filament now weaves *beside* the cards, behind them on wide rows, while they turn.
3. **F1 fixed:** once the filament has drawn and the last card has turned, it fades and is removed
   (~0.4s hold, 0.6s fade; a 9s cap guarantees it). Nothing stays over the cards.
4. Scroll to **The Golden Thread**: the same gold thread draws down the section's left margin,
   knotting at each card's paragraph (its border warms briefly) and blooming at *The overall
   invitation*. Then it fades, and every node and class it added is removed (about 3–5s in all).

## Rules it keeps
- Text is never covered, recoloured or faded (the layer sits behind it; the test compares computed
  colour and opacity before, during and after).
- Never blocks input: `pointer-events:none`, `aria-hidden`, no Skip needed.
- Reduced motion: nothing is created. A live switch clears it on the next frame.
- Clears on completion, Escape, navigation, browser Back, `pagehide`, and a new draw.
- Plays once per fresh draw. Clarifier re-renders, card-detail return and Journal reopen never replay
  (they render without `.waiting`).
- Assets: no new images. The thread is SVG drawn in code; the hand is the existing approved image.

## Results (local headless Chromium 1.63, Node 22; not the Vercel deployment, not a phone)
| Suite | Result |
|---|---|
| `node --test tests/*.test.cjs` | 82/82 (motion-lifecycle +3: F1 ×2, F2) |
| `node tests/motion.browser.cjs` | 20/20, now asserts the filament is gone ≤3.5s after settle |
| `node tests/hand-transition.browser.cjs` | 51/51 |
| `node tests/golden-thread.browser.cjs` (new) | 26/26: 5 spreads × 390/1280 play-through, plus 8 lifecycle cases × 2 widths |
| Spread parity against `golden-thread-uat.html` and `motion-uat.html` | all PASS |

## Changes to #32's module (`resonate-motion.js` 1.0.3)
- F1: fade and remove after settle; browser assertion added.
- Path measured in pixels beside each card (no `preserveAspectRatio="none"` stretch).
- Thread on its own `.rm-weave` layer behind the cards (`isolation:isolate` on the board); sparks stay on top.
- Gradient in user space: a vertical one-column thread previously painted nothing on phones.
- F2: the frame loop and sparkle act on reduced motion directly.

## Not tested
Real Android/iPhone smoothness, Safari/WebKit, TalkBack/VoiceOver, real bfcache restore, CPU throttling.
**Phone UAT on Chas's device should validate this slice.** The paywall/rights launch review stays a
separate requirement before launch. The realistic opening hand remains NOT IMPLEMENTED.
