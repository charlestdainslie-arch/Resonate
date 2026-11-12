# Hand → golden filament transition: prototype evidence (28 Oct 2026)

Author: Claude. Reviewer: Si Aye. **Prototype only. Not accepted, no merge, no production.** Production `index.html` is unchanged; the transition loads only on `hand-uat.html`.

## Provenance
- Parent: `codex/motion-lifecycle-uat` @ `8ffcee11379fdb4443efabca25526a57a7f08e8a` (PR #32 head).
- Branch: `claude/hand-transition-prototype`.
- Environment: Linux, Node 22.22.0, Playwright 1.63, bundled headless Chromium. **Not** a real phone.

## Defaults used (Si Aye's proposed prototype defaults, not Chas's recorded answers)
| Default | How it is met |
|---|---|
| Trigger on spread selection, after the table renders | `hand-transition-wire.js` listens for a click on `.spread-picker [data-spread]` (bubble phase, after the app's own handler), waits one frame and mounts only if `state.view === 'stage'`. |
| Astrology keeps its existing flow | The prelude wraps the spread click; the transition mounts only once the table itself is on screen, so the prelude runs first and unchanged. |
| Shuffle/Draw stay usable; cancel at once when the table is replaced, including an early Draw | The overlay is `pointer-events:none`. A `MutationObserver` on `#app` destroys it as soon as its `.stage-board` leaves the DOM, before #32's reveal mounts. |
| Skip and Escape | A real `<button>` outside the `aria-hidden` layer (≥44px), plus Escape. Keyboard skip returns focus to the page heading. |
| Reduced motion: no decorative animation at all | `mount()` returns `null` and creates nothing. A live switch to reduced motion removes it on the next frame (checked every frame, not only through the `change` event: see F2 on #32). |
| Existing static hand | `assets/mystic-hand-whisper.png`. The realistic opening hand is **NOT IMPLEMENTED**. |
| Reel/pokie | Not touched. No Saturday commitment. |

## Corrections to Deep's proposal
| Point | Done |
|---|---|
| Target is `.stage-card[data-stage-card]` | The first one in the current `.stage-board`. |
| Fingertip and card measured separately | Every frame: the fingertip from the hand image's own box, the card centre from the card's box. |
| Scroll, resize, detached targets | Measured every frame, so scrolling and resizing are followed; a missing card or detached board destroys it. |
| A mount-time `.rm-root` check can't stop an early-Draw overlap | Not used. Cancellation is on table replacement, and the test watches every DOM mutation for a hand layer and `.rm-root` together. |
| Pre-existing classes, owned resources | `body.rh-active` is removed only if this module added it. `destroy()` cancels the frame, aborts every listener (one `AbortController`), removes the media listener and both nodes. |

## Placement
The hand rests low on the right. If that would cover a card or the Shuffle/Draw buttons it sinks below them, and shrinks if the fingers would leave the screen. Where the table fills the whole viewport (Celtic Cross at 768px) there is no free space: the hand then sits over a card that already runs past the bottom of the screen, and only its fingers show. The Skip button sits at the right of the Back link's row, clear of the menu, brand and Shop.

## Results
| Suite | Command | Result |
|---|---|---|
| Hand transition (new) | `node tests/hand-transition.browser.cjs` | 51/51 PASS |
| Spread parity, run against `hand-uat.html` | temporary copy of `tests/spread-parity.browser.cjs` with `goto(BASE + 'hand-uat.html')` | All 75 cells PASS |
| Motion (#32), run against `hand-uat.html` | temporary copy of `tests/motion.browser.cjs` with the page swapped | 20/20 PASS |
| Motion (#32), unchanged | `node tests/motion.browser.cjs` | 20/20 PASS |
| Unit | `node --test tests/*.test.cjs` | 80/80 PASS |
| Navigation/a11y | `node tests/navigation-a11y.browser.cjs` | PASS |
| Reduced motion + headings | `node tests/reduced-motion-headings.browser.cjs` | PASS |
| UAT round 1 | `node tests/uat-round1.browser.cjs` | PASS |

`tests/hand-transition.browser.cjs`:
- **G (25 cases):** every spread at 360, 390, 768, 1280 and 1920px. Each case checks that:
  - the drawn path starts within 8px of the fingertip and ends within 8px of the first card's centre, both while the filament runs and as it fades;
  - the hand covers no fully visible card or button;
  - Skip is at least 44×44px and covers no header control or the heading;
  - the hand is on screen and there is no horizontal scroll;
  - the table's cards are unchanged before and after;
  - everything is removed afterwards, with no page errors.
- **L1–L13 at 390 and 1280px:**
  - L1: Shuffle works mid-play.
  - L2: keyboard Skip and focus.
  - L3: Escape.
  - L4: early Draw. Nothing is left after a microtask, and the hand layer and `.rm-root` never coexist.
  - L5: Back link.
  - L6: browser Back.
  - L7: reduced motion creates nothing.
  - L8: live reduced-motion switch, gone within 500ms.
  - L9: four quick table cycles, never more than one layer.
  - L10: a pre-existing body class is kept.
  - L11: resize and scroll mid-play.
  - L12: pagehide cancels, and pageshow does not replay.
  - L13: completes and cleans up in ~2.4s.

The 8px origin check uses the same fingertip fraction as the module (`[0.82, 0.135]` of the image box). It proves the line follows the hand through movement, scroll and resize. It does not prove the fraction lands on the fingertip in the artwork: that was set by eye from screenshots and needs a visual check.

## Not done / untested
- Real Android/iPhone, Safari/WebKit, screen reader, bfcache restore on a real device.
- Visual sign-off of the hand art, blend and timing. The static hand on a dark-background PNG is screen-blended, and that may not hold up on a device.
- Low-end device frame rate.
