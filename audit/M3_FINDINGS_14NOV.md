# M3 findings, part 1: Golden Thread and Max sync (14 Nov 2026)

**Owner:** Claude. **Independent QA:** Deep, pending. **Build:** `claude/sprint-14nov-stack` working tree (app code
as `4a07a09`). **Status: interim.** M3 is not complete.

## Method
- **Probe:** `tools/m3/sync-probe.js`. It tears down the page's light (`ResonateKiss.destroy()`) and loads an
  identical copy of `golden-thread-kiss.js` with one read-only getter for the light's position. No app file changes.
- **What it records, for each part Max speaks:** when the cue fires, when the light reaches the named card (the kiss
  lands mid-card), and where the light is when the part ends. Max is muted, so captions keep time.
- **Setup:** 390 × 844, mobile emulation, presenter-uat.html, ordinary deck.
- **Frame rate:** measured every second, because the browser pane throttles when it is not in front. Throttled
  seconds were logged: Celtic 18 of 198, Seven-card 12 of 168. Timings below are from the first mention of each card.

## Results

| Spread | Deal | Cards kissed in deal | Light reaches each newly named card | Late (after half the line) |
|---|---|---|---|---|
| One-card | 5.6 s | 1/1 | first card: hover reached 2.1 s into a 2.6 s line (an earlier probe metric) | see note |
| Past-Present-Future | 14.5 s | 3/3 | 865, 681, 652 ms of ~2.6 s lines | none |
| Seven-card | 30.6 s | 7/7 | 859 ms first, then 435–492 ms of 2.6–3.6 s lines | none |
| Celtic Cross | 41.0 s | 10/10 | 880 ms first, then 445–487 ms of ~2.6 s lines (17–19%) | none |
| Relationship | not measured | | | |

- **Every named card was visited exactly once per pass;** no skips and no doubles. The first card is always the
  slowest (850–880 ms), because the light enters from off-screen.
- **One-card note:** that run timed the hover point above the card, not the kiss. The kiss metric was added
  afterwards. To re-run.
- **Close Max:** the light fades out (alpha 0, invisible). **Reopen:** one player, one light canvas, nothing doubled.
- **Replay:** the light returns to card 01 when Max names it again.
- **Clarify inside Max:** the right single clarifier is drawn (card 01 only). The light's timing onto the new
  clarifier was not captured. To measure.

## Defect M3-F1: the light is left behind when Max's strip moves back to card 01
At the end of the first pass, Max's bar and card strip go back to card 01 (Chas's #53). The strip scrolls, but the
light stays at its old screen position, so it hovers over a card Max is not talking about:
- **Celtic:** over card 02, 637 px from card 10.
- **Seven-card:** over card 02.
- **Past-Present-Future:** over card 03, while card 01 is selected.

The pages read the same way at the end, so the approved build behaves likewise, although its strip moves a moment
later (at `finish()` rather than at the invitation). This was not run on `2a2b4e5` itself.

**Options, a decision for Chas:**
- (a) the light flies to card 01 with the bar (matches "back to card 01");
- (b) the light fades out at the end of the first pass.

Claude recommends (a).

### M3-F1 fixed (Chas chose (a), 14 Nov)
- `presenter.js` sends `maxchasroom:focus {slot}` whenever Max's bar settles on a card. This is skipped while Max talks
  about a clarifier just drawn.
- `golden-thread-kiss.js` (v21) flies the light to that card unless it is already on it or on one of its
  clarifiers. The light is therefore never pulled off a clarifier back to its card.
- **Check (Past-Present-Future, 390):** at the end of the first pass, card 01 is selected and the light is over card
  01, at (79, 211). Before the fix it was over card 03.
- Pace unchanged: the light reached the cards in 866, 636 and 610 ms.

## Defect M3-F2 (open): after Clarify in Max, the light can go off-screen
- **Observed:** while Max narrated a clarifier he had just drawn, the light sat at page y ≈ 1590 with the page
  scrolled to 0. That is below a 844 px screen, so it was invisible for the whole narration.
- **Likely cause:** Clarify re-renders the reading page behind Max (`renderDraw` → `shell`), and that page's
  scroll jumps. The light works in page coordinates, while Max's cards sit in a fixed overlay, so a scroll change
  behind Max displaces it.
- **Not fixed.** It was seen only with the browser pane hidden (timer-driven frames), which also slows the light,
  so it needs a trace with the pane visible before a fix. A first attempt (light stays with its card each frame) was
  reverted: it rested on a wrong theory and was not verified.

## Not yet covered
- Relationship spread.
- 1440 width.
- Reduced motion.
- The light's timing onto a clarifier drawn in Max.
- Real speech (device voice) rather than captions.
- Celtic deal pace against Deep's P target (41.0 s here, 36.9 s on the approved build earlier; frame-rate dips
  affect both figures).
