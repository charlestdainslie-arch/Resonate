# Max: clarify inside the player and no early sign-off (Chas, Samsung UAT, 8 Nov 2026, P1)

Defect branch `claude/uat-max-lifecycle`, from the frozen candidate `4dc4df5`. No merge, no production change,
no spending. One shared change in `presenter.js` / `presenter.css`, so all five spreads behave the same.

## 1. Clarify inside Max

- **The clarify bar.** It is fixed to the bottom of Max's screen and stays visible while he speaks; the
  seeker never needs to scroll to the transcript.
  - **Card picker** (spreads of two or more cards): `01 · Present Situation`, `02 · …`. A gold dot marks a card
    the rule is waiting on; a tick marks a finished card. The bar follows the card Max is talking about until
    the seeker picks one.
  - **One action button**, as the rule allows for that card:
    - **✦ Clarify this card** (Clarifier 1);
    - **✦ Add second clarifier** (when Clarifier 1 is a Major);
    - **✦ Draw Clarity card** (Option B, unchanged: original and both clarifiers Major);
    - **Card complete ✓** when nothing more is allowed.
  - **Finish reading.**
  - A one-line note says why: for example "The Fool is a Major Arcana card: a clarifier is due."
- **After a tap,** Max stays open. He stops what he was saying, then narrates only the new card:
  - its name;
  - its meaning;
  - how it **reinforces, supports, challenges or modifies** the original card (and, for Clarifier 2, both
    earlier cards);
  - the updated "together" for that position.

  He then invites again. This is the same text as the written reading, quoted word for word. Only the picked
  card changes.
- **Card grouping in Max.** The picked card, or the one Max is talking about, grows into the large anchor.
  Clarifier 1 sits below-left, Clarifier 2 below-right, and the Clarity card centred below them.
- **Clarifiers added outside Max** (the dock or the page) behave as before: Max stops and offers
  "↻ Replay Updated Reading".

## 2. No sign-off until the reading is finished

- **Until Finish reading,** Max ends every pass with:
  - "That's the first layer of your reading." (or "That's your reading so far.");
  - then "If a card calls for more, choose it below and tap Clarify. When you have finished, tap Finish
    reading."

  He never says "Before I go", "Take what resonates, and leave the rest." or "Max Chasroom, signing off."
- **Finish reading:**
  - "Here is your whole spread, brought together.";
  - the spread's central pattern (from the Golden Thread summary, word for word);
  - "Before I go, one question to carry with you." with the reading's own question;
  - "Take what resonates, and leave the rest.";
  - the sign-off.

  Each is said once, with the sign-off last. Finish reading is then disabled.
- **Replay** plays what is loaded from the start, with one ending, not two. Reopening Max after finishing plays
  the full reading with exactly one closing. Adding a card after finishing reopens the reading: the closing is
  withheld again until Finish.
- The "Hear Clarifier n" launchers end with the invitation, or with the closing once finished.

## Tests (author-run)

`tests/max-lifecycle.browser.cjs`: the five spreads at 360x800 and 412x915, plus a fixed full chain
(original → Clarifier 1 → Clarifier 2 → Clarity card) in a one-card reading and a Celtic Cross, at both sizes:
14 cases. Each checks:
- the bar is on screen and tappable without scrolling;
- no sign-off after the first layer, and the reading ends with the invitation;
- picking a card and clarifying inside Max changes only that card, and Max names the new card and relates it
  to the original;
- Clarifier 1 is below-left and Clarifier 2 below-right in Max;
- Finish produces each closing line exactly once, sign-off last;
- Replay has one ending;
- reopening gives one closing.

Speech is a stand-in that records what is handed to it. Real audio on a Samsung is Dev's check.

Updated: `tests/presenter.browser.cjs` (closing only in the finished script; Clarity cards in Max's strip).

Recording: `audit/max-lifecycle/max-clarify-in-player-412.mp4`, 63 s, Samsung size, no audio; made by
`audit/tools/max-lifecycle-demo.cjs`.

## Preserved

- Approved shuffle and deal: `deck-theatre.*` and `reading-stage.js` are byte-identical to `73da97d`.
- Secure randomness: `deck-engine.js` is unchanged from `4dc4df5`.
- Option B, spread positions and reading order (Seven-card question readings).
- Golden Thread and the PDF: not touched.
- Captions, Pause and Replay: captions are still the script lines; Pause and Replay work as before.
