# Deep — Tinkerbell kiss: review, pace analysis, and scope recommendation

**Date:** 10 November 2026, 15:40 AEST
**From:** Deep
**To:** Chas, Si Aye, Claude (cc)
**Re:** `fc7c064` — `golden-thread-kiss.html/.js/.css`
**Status:** Review and recommendations. Demo only; live app unchanged.

---

## 1. Where I was wrong

I argued for a permanent thread threaded behind the cards, on the reasoning that the feature is *called* the Golden Thread and would lose its identity without a visible line. That was a category error: **I confused the name with the rendering.** "Golden Thread" describes the through-line of meaning across a reading. It never required a permanent line on screen — and Chas is right that a persistent connector is what made it look diagrammatic.

What I had right: the gesture is a *kiss*, not a link, and the current build's routed sagging strands were the cause of the diagrammatic feel. What I had wrong: the fix was to stop drawing a structural line at all, not to relocate one behind the cards.

Chas's brief is cleaner than both my Concept B and Claude's Concept A. A light that moves, touches, and moves on is closer to how a reading actually feels than any line could be.

---

## 2. What the build does well

Read from `golden-thread-kiss.js`:

- **One canvas, viewport-fixed, page coordinates** (line 7). Dust stays where it fell when the page scrolls. That is the correct architecture and it directly answers the frame-budget concern.
- **Draws only while flying or while dust remains** (`startLoop` guarded by `raf`). No idle 60 fps burn. Better than most such effects.
- **`dpr` capped at 2** (line 50). Sensible on a phone.
- **`aria-hidden` on the canvas** (line 43). Correct.
- **Reduced motion: no light, no dust, cards turn at once.** Exactly the right fallback shape — the *outcome* is preserved, only the ceremony is dropped.
- **`MAX_DUST = 520`** with per-particle twinkle, sink and fade. The dust has physics rather than being a fixed sprite sheet, which is why it will read as dust and not as glitter.

Claude built the right thing. The notes below are about pace, performance and productionising — not about the idea.

---

## 3. Pace on long spreads — the arithmetic

The dwell is **fixed per visit**: `HOLD 480` + `AFTER 220` = **700 ms**, in `visits` regardless of screen size or spread.

That gives a hard floor before any travel or scroll:

| Spread | Stops (no clarifiers) | Dwell floor | Stops with clarifiers | Dwell floor |
|---|---|---|---|---|
| Three-card | 3 | 2.1 s | up to 9 | up to 6.3 s |
| Seven-card | 7 | 4.9 s | up to 21 | up to 14.7 s |
| **Celtic Cross** | **10** | **7.0 s** | **up to 30** | **up to 21.0 s** |

So on a Celtic Cross with clarifiers, **up to 21 seconds of the ~30 s is pure stillness**, before the light travels a pixel. Clarifiers are the dominant term, and they are currently treated as events of equal weight to the cards they clarify — which they are not.

**Recommendations:**

**P1 — Weight the dwell by event.** Main card 480 ms, **clarifier 260 ms**, Clarity card 300 ms. A clarifier is a smaller arrival; giving it the same 700 ms is what makes long spreads feel padded.

**P2 — Set a total budget.** Target **≤ 15 s** for a Celtic Cross including clarifiers. If `stops × 700` exceeds it, compress the dwell rather than the travel; travel is the part that reads as alive.

**P3 — Tap to complete.** Any tap or keypress finishes the sequence instantly — all cards revealed, light gone. This is not a compromise of the ritual; it is what makes a second viewing possible.

**P4 — First draw vs revisit.** The demo already tracks `seen` and `drawnAt`. Use it: full ceremony the first time a reading is shown, and straight to revealed when the seeker comes back to it. A 30-second introduction is generous; a 30-second toll gate at every return is not.

**P5 — Measure the scroll.** `follow()` (line 277) is where the remaining time goes. If it costs more than ~1.2 s per card, the scroll is the real pace problem, not the kiss. Worth timing before tuning anything.

---

## 4. Scope: live app, Max's presenter, or both

**Live draw page: yes.** Cards are dealt sequentially and the light visits them in the same order. The light *is* the dealer; the timing is coherent.

**Max's presenter: not yet — and not as it stands.** The kiss visits in `readingOrder()` at its own pace, independent of Max's voice. In the presenter, Max speaks about card 2 while the light is already kissing card 3. That does not read as a living thread; it reads as two animations disagreeing. Before it goes into the presenter, the kiss must be **driven by Max's speech cues** rather than by its own timer — the same requirement I raised as S2, now with a concrete reason.

Recommendation: ship the live draw page first, keep the presenter on the existing thread until a speech-driven version is built.

---

## 5. Performance — three concrete hot spots

The single canvas is right; the per-frame work inside it is heavier than it needs to be.

1. **`createRadialGradient` every frame for the light** (line 113), plus once per bloom (line 102), plus a `fillStyle` string built per particle (line 93). Up to ~520 particles × 60 fps ≈ **31,000 string allocations per second**, alongside 520 `beginPath`/`arc`/`fill` triples. That is the jank risk on a Samsung, not the canvas itself.
2. **Pre-render the light's glow once** into an offscreen canvas and `drawImage` it scaled. The glow does not change shape — only its breath and alpha. That removes the most expensive gradient.
3. **Batch the dust by colour.** There are only two colour buckets; set `fillStyle` twice per frame instead of 520 times, or use `fillRect` for sub-pixel particles.

Also: `MAX_DUST` 520 is generous. At 200–250 it looks the same on a phone and halves the per-frame cost.

---

## 6. Accessibility — the one real risk

**A ~30 s auto-scrolling sequence is a scroll hijack.** If a seeker starts reading, or scrolls, or tabs to a control while the light is still working down the spread, the page takes the viewport back. That is hostile to keyboard and screen-reader users in particular.

**Fix:** abort or pause the sequence on the first genuine user input — `wheel`, `touchstart`, `keydown` outside the light's own path — and settle to the revealed state. Combined with P3, one tap should resolve everything.

---

## 7. Productionising note

The demo wraps globals: `window.shell = function () { … baseShell.apply(…) }` and the same for `renderDraw` (lines 280–290). That is fine for a demo and I would not block on it — but in production it is a silent-failure pattern: any later refactor of `shell()` or `renderDraw()` breaks the kiss with no error and no test. Replace it with an explicit hook (a `spread-rendered` event, or a `ResonateKiss.mount()` called from the app) before this ships.

---

## 8. What I could not inspect

I have read the source, not the animation. I cannot judge:
- whether the dust reads as delicate or as snow at 520 particles;
- whether additive blending (`globalCompositeOperation: 'lighter'`) washes out the card faces, which are light artwork — this is the most likely visual disappointment and I cannot see it;
- the actual scroll time in `follow()`, so the pace arithmetic above is a floor, not a measurement.

The demo's own 30 s figure for a Celtic Cross is Chas's observation and more reliable than my inference.

— Deep
