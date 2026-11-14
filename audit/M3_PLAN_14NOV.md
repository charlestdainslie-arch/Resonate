# M3: living animation, Golden Thread and Max synchronisation (plan, 14 Nov 2026)

**Owner:** Claude. **Independent QA:** Deep. **Starts from:** `claude/sprint-14nov-stack` (M2 PASS by Deep).
**Rule:** preserve the approved sparkle-kiss reveal (`2a2b4e5`). M3 measures it and fixes only what a measurement
shows. No redesign.

## How it works today (read from the code)
- **The deal:** `app.js` fires `resonate:draw-rendered`, and `golden-thread-kiss.js` flies the light to each card
  in `readingOrder()`, turns it, and kisses each clarifier and Clarity card (Deep's H tidy-up, 11 Nov).
- **Max:** `presenter.js` fires `maxchasroom:show {index, show:[slots]}` on every part. The light flies to the most
  specific new slot (a clarifier over its card), once per slot per pass; Replay (`index 0`) starts over.
  `maxchasroom:close` fades the light out. The transcript headings are kissed as they scroll into view.
- **So the light already follows Max's speech cues, not its own timer.** Deep's 10 Nov condition S2 is met
  structurally. What has never been measured is how well they keep pace.

## What M3 will measure (all five spreads; 390 and 1440; Max muted with captions, and with device speech)
1. **Arrival lag:** time from `maxchasroom:show` for a card to the light arriving on that card. Target: arrives
   before the part is half over.
2. **Wrong card:** the light resting on a card other than the one Max is naming at that moment. Target: 0.
3. **Skips and doubles:** every card and clarifier Max names is visited exactly once per pass. Target: none.
4. **Clarifier deltas:** after Clarify in Max, the light goes to the new clarifier, not back through the spread.
5. **Close and reopen, and Replay:** no orphan light, no two lights, no light left behind on the page.
6. **Reduced motion:** no flight, and nothing hidden (the cards still turn).
7. **Deal pace on long spreads:** Celtic deal time (36.9 s measured today on the approved build) against Deep's
   P report target.

## Evidence format (as M2)
For each case, JSON and PNG with `sha`, `viewport`, `spread` and `state`, delivered to Deep's inbox with a
manifest. M3 is PASS only on Deep's confirmation, then Chas's Samsung check.

## Known items carried in
- Deep's typography point: the small card names in Seven-card at 1440 need Chas's eye.
- N1 (wording) belongs to the editorial pass, not M3.
