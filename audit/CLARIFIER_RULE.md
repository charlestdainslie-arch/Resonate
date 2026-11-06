# Clarifier rule — as implemented at `b3a34c3`

## Label and attribution

The rule is **Chas's teaching rule**, approved by Chas in Issue #13 (25 Oct 2026). That is how it is labelled in the code (`clarifier-rules.js` header, `app.js` comment) and how it should be described.

It is **not** attributed in the code, the UI or the PDF to any published author. Issue #49's brief and a 6 Nov #resonate-dev message describe the sequence as Paul Fenton-Smith's; there is **no published source for that in the repository**, so the attribution is **UNKNOWN** and must not be presented as a documented published method until someone supplies the reference. (`LESSONS_LEARNED.md` mentions "Paul Fenton-Smith reference material" for future symbolic content in general; it does not cite the clarifier sequence.) The reading UI does not name the rule's origin at all.

## What the code does (`clarifier-rules.js`, used by `app.js`)

| Situation | Behaviour | How it is triggered |
|---|---|---|
| Base card is a Major Arcana | Receives Clarifier 1 | Main button **Draw First Clarifier** (one press draws for every waiting Major) |
| Clarifier 1 is a Major Arcana | Receives Clarifier 2 | Main button **Draw Second Clarifier** |
| Clarifier 1 is not a Major | No Clarifier 2 | — |
| Base card is not a Major | Nothing automatic; the seeker may clarify it once | **+ Clarify this card** under that card; the Major rule then applies to that clarifier |
| Maximum per position | 2 | `MAX_PER_POSITION = 2` |
| Repeats | No card appears twice in one reading (base or clarifier) | `drawRemaining` excludes used IDs; `validate()` checks |
| Orientation | Every clarifier is upright/reversed at 50% when reversals are on, fixed when drawn | `orientCards` |

## Not implemented (deliberately)

**Forced non-Major draw.** The Issue #49 brief describes Major → Major → *third, non-Major* card. The code stops at two clarifiers: if Clarifier 2 is itself a Major, nothing further happens, and no draw is ever forced to be non-Major. This stays **unimplemented pending Chas's clarification** of the exact rule (is there a third card? is it redrawn until non-Major, or drawn from a Minors-only deck?).

## Evidence

- Unit: `tests/clarifier-rules.test.cjs`, `tests/visible-clarifier.test.cjs`, `tests/additional-clarifiers.test.cjs` — all pass (see `builds/TEST_EVIDENCE.md`).
- Browser: `tests/clarifier-slots.browser.cjs`, `tests/teaching-rules.browser.cjs`.
- Real draws: each `samples/*/draw-record.json` holds the button-by-button `sequence` and `ruleCheck` (the app's own `validate()`), which is empty (no violations) for all three samples. Between them the samples exercise every branch: Major → Minor stops (Celtic: The Sun → Knight of Swords); Major → Major → Clarifier 2 (Celtic: The World reversed → The Hanged Man reversed → The Lovers reversed — Clarifier 2 is itself a Major and **no third card is drawn**, see "Not implemented"); seeker's choice on a Minor (Celtic: Ace of Swords reversed → Nine of Pentacles); and the rule applying to a seeker-chosen clarifier (Three-card: Two of Cups → The Magician reversed, a Major, so → Nine of Swords reversed).

## Notes for the reviewer

- `additionalClarifierView()` in `app.js` contains the sentence "A card may reappear across different layers", which contradicts the no-repeat rule. It is **dead code** (never called; absent from all three samples' written text and PDFs), so it is not a user-visible defect, but it should be removed to avoid future confusion. Similarly the Golden Thread's "Repeated card" paragraph can no longer occur.
