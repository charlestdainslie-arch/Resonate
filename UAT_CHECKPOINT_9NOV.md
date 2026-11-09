# UAT checkpoint — 9 Nov 2026 (laptop UAT, Chas)

Where laptop UAT stopped on 9 Nov, for Si Aye, Chas and the next Claude session.

- **Branch:** `claude/uat-thread-fixes`
- **Checkpoint commit:** `2fd5415` (16 commits on top of the release-candidate evidence commit `9429d18`, app RC `282cd14`)
- **UAT link (Max):** https://resonate-oiwgtw7ws-charlestdainslie-6956.vercel.app/presenter-uat.html
- **Max Chasroom** is on `presenter-uat.html`, not the home page.

`RELEASE_CANDIDATE_9NOV.md` still names `282cd14`. These changes come after it and have not been folded into a new release candidate.

## What changed

| # | Commit | Change |
|---|---|---|
| 1 | `e537276` | Astrology screen: Calculate my sky and Clear my details are the same height as the other buttons and sit level. |
| 2 | `6b0b87d` | Max's card strip always starts on a whole card (card 1 was half hidden beside Max). After the first layer, Max goes back to the card due a clarifier. |
| 3 | `77efe3d` | Max: clarifiers are laid on their original card like a solitaire column, each a step lower, with a label on its band. |
| 4 | `a818712` | Finish reading reads the cards first if Max has not read them yet (it had jumped straight to "Before I go…"). |
| 5 | `dd289d1` | Max opens on card 01, not on the first card due a clarifier. |
| 6 | `bf1e8a9` | Clarifiers go in card order with a Next card → button; the pile scrolls into view; no repeated opening line after Clarify. |
| 7 | `b0fc7b0` | The highlight no longer flickers back to card 01 while Max reads a card's clarifiers. |
| 8 | `862104e` | Laptop windows: caption, Play row and clarify bar are one panel pinned to the bottom, so Play and Clarify are both visible. |
| 9 | `3e48dc0` | After Clarify, the strip stays on the card being clarified (it had scrolled to cards 04–07). |
| 10 | `ec6927b` | Reading table: Shuffle and Draw either side of the deck; Shuffle highlighted first, then Draw. |
| 11 | `1cfe24c` | The second clarifier and the Clarity card are lit and followed like the first. |
| 12 | `95ae331` | Clarifiers go layer by layer: every first clarifier, then back to the first card for second clarifiers, then Clarity cards. Caption and note name the layer. |
| 13 | `41a0527` | **Rule change (approved by Chas, 9 Nov):** a second clarifier may be chosen after a Minor first clarifier. Still due after a Major; still at most two per card; a Clarity card still needs three Majors. |
| 14 | `e624ec5` | Max: the second layer offers every card; while Max talks, the button already shows the next card in the walk. |
| 15 | `ca9c281` | One-card full reading uses the same layout as the other spreads: clarifiers side by side below the card, Clarity card centred under them. |
| 16 | `2fd5415` | Max introduces each clarifier by position and original card: "Past, Ace of Cups: first clarifier, Eight of Swords." Same for second clarifiers and Clarity cards. |

## Checked

- **All five reading types × four screen sizes** (phone 375×812, tablet 768×1024, laptop 990×660, desktop 1400×1000), with Seven-card also in question mode: 24 of 24 pass. On each, card 1 had a full pile and card 2 a Minor first clarifier with an optional second. Checked: Shuffle and Draw on screen; clarifiers below the card, level, centred, Clarity card below; every clarifier line Max said matched the cards drawn; Play and Clarify visible in Max; no side-scroll; no script errors.
- **Live UAT link at phone size:** all six reading setups pass.
- **Draw accuracy, all five types:** all 78 cards in each shuffle once; the dealt cards are the top of the shuffled deck, in order, no duplicates; each card read under its own position.
- **Clarifier rule:** 13 rule checks run in the browser against the app's own `ResonateClarifiers`, including the Clarity card limits.

## Not yet checked

- **Real devices:** all size checks used a browser set to each size, not the Samsung phone or a real tablet.
- **Max's voice:** every run used captions only.
- **Automated test suite:** Node is not installed on the UAT laptop, so the node and browser suites in `tests/` have not been run on today's commits. Tests for the rule change were updated (`clarifier-rules.test.cjs`, `additional-clarifiers.test.cjs`, wording in `teaching-rules.browser.cjs`).
- **Interpretation review:** Deep has not reviewed a second clarifier that follows a Minor first clarifier (new since #13).
- **Voice preview:** the 1 Nov cloned-voice preview (`voice/chas/`) does not have the new clarifier phrases, so it is not used for those lines; the synthetic voice speaks them.

## Open questions for next session

- In Max, a card can still be picked by number to clarify out of layer order. Chas to decide whether that should wait until the current layer is done.
- Next card → can also pass a card that is *due* a clarifier (a Major). Chas to decide whether due cards should be skippable.
- Fold today's commits into a new release candidate and update `RELEASE_CANDIDATE_9NOV.md`.
