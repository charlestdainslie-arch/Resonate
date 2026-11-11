# Deep — Celtic Cross pace: where the 37 seconds actually goes

**Date:** 11 November 2026
**From:** Deep
**To:** Claude, Chas, Si Aye (cc)
**Pin:** `6e30a49`. Measured by Claude: Celtic Cross ≈ 37 s on the test tab. My target was ≤ 15 s.
**Status:** Analysis. No code change proposed as approved; this is arithmetic plus two options.

---

## 1. The dwell budget is working — that is not the problem

`DWELL_BUDGET = 7000` with `scale = max(0.45, min(1, 7000 / total))` behaves exactly as intended. On a Celtic Cross with clarifiers (~20 stops), `total` ≈ 14,000 ms, so `scale` = 0.5 and every rest halves. **Resting is capped at 7 s in every case.** My P2 is in and it holds.

So the 37 s is not the rests. Decomposing it:

| Component | Per stop | ×20 stops | Note |
|---|---|---|---|
| Rest (`HOLD` + `AFTER`, scaled 0.5) | 350 ms | **7.0 s** | capped by the budget |
| `follow()` fixed wait | 450 ms | **9.0 s** | `golden-thread-kiss.js`, `follow()` |
| Flight at `MAX_SPEED × 1.35` (0.837 px/ms) | ~900 ms | **~18 s** | distance-dependent |
| Smooth-scroll overrun beyond the 450 ms | — | **~3 s** | the wait is a guess, not an event |
| **Total** | | **≈ 37 s** | matches the measurement |

**Roughly half the sequence is the light flying, and a quarter is a fixed 450 ms wait per card.** The rests — the part everyone assumes is the problem — are a fifth.

---

## 2. Why the 15 s target cannot be met by tuning

`scale` is already at 0.5, and its floor is 0.45. Even at the floor, the rests save only another 0.7 s. There is no version of dwell reduction that closes a 22 s gap.

Two levers actually matter.

**L1 — replace the fixed wait with a real event.** `follow()` scrolls smoothly, then `wait(450)` regardless of how long the scroll takes. `scrollend` is supported in current Chrome and Safari; using it (with the 450 ms as fallback) removes both the guess and the overrun. Saves roughly **4–5 s**.

**L2 — do not fly to clarifiers on long spreads.** This is the bigger structural one. A clarifier sits in the same position as the card it clarifies — it is already next to the light. Flying to its centre costs a full `follow` + `flyTo` + rest for a target a few hundred pixels away.

If the light kissed the **card** and the clarifiers simply turned in place as it passed, a Celtic Cross drops from ~20 stops to ~10. Applying the table above: 3.5 s rests + 4.5 s follows + 9 s flight ≈ **17 s**. That is within touching distance of 15 s without touching `MAX_SPEED` or the budget.

It also arguably reads better: the light's job is to acknowledge each *position*, and a clarifier is a further look at a position the light has already kissed.

---

## 3. What I would not do

Not raise `speedMul` further. 1.35 is already making the flight noticeably quicker than the three-card case, and pushing it to 1.8 to hit a number would make the light look hurried on exactly the spread where it has the most to do. The pace problem is stop-count, not speed.

---

## 4. Recommendation to Chas

For the Samsung test, take two measurements rather than one:

1. **Current** — confirm the ~37 s figure on the device.
2. **L2 only** — kiss the card, let clarifiers turn in place. No other change.

If L2 lands near 17 s and Chas prefers the look, that is the version for the live site. If he wants the light to visit clarifiers individually, then 37 s is the honest cost of that choice and the target should be restated rather than chased.

That is a product decision, not a performance one. Mine is only to say which number comes from which cause.

— Deep
