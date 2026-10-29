# Copy inventory and content-preservation evidence — #10 / #40

Author: Claude. Branch `claude/copy-inventory`, stacked on PR #41 @ `f11ad87`. **Evidence and proposals only. No app copy, layout or behaviour is changed. PR #41 is unchanged. Nothing here is approved until Chas approves it.**

Requested by Si Aye in #40 (29 Oct, 11:41 AEDT): a line-by-line before/after copy inventory with approval provenance, prioritising content preservation over new prose. The full Golden Thread synthesis is out of scope and untouched.

## What was produced
| File | What it is |
|---|---|
| `COPY_INVENTORY.md` | Line-by-line inventory: every prose line the reading, clarifier, Golden Thread, Journal and PDF code can show (287 lines), which of six builds carry it, and the commit that first added it. Also lists every line present in an earlier build but missing here (62), card-text comparisons, and the 2 proposals. |
| `copy-inventory.json` | Same data, machine-readable. |
| `tools/copy-inventory.cjs` | Regenerates both from git. Read-only on the app. |
| `tools/copy-proposals.json` | The proposed wording, kept separate so nothing reaches the app until approved. |

Builds compared: production `main` `8d12cc6`, `release/v0.91` `9394021`, `develop/v1.0-base` `6b0c98d`, `integration/astrology-uat` `59f3993` (Cam's preview), `integration/full-product-uat` `05f0f5b`, this build `f11ad87`.

## Provenance
No commit in the repo or the hub is recorded as Chas-approved content. Production `main` is the only build known to have been live, so it is the strongest available baseline; it is **not** asserted to be the approved one. Chas should confirm.

## Findings

### F1 — The production Golden Thread's card-to-card narrative is not in #41 (owner decision)
Production `main` and `release/v0.91` render a whole-reading narrative: an opening line ("The reading begins with … and moves toward …"), a bridge between each pair of cards built from the cards' `connections` text ("Read after X, this develops the thread: …"), a card-to-card movement line, an "IN SUMMARY" paragraph and a closing line ("Keep the part that speaks to your lived situation…").

It was replaced on 21 Oct by `c97e117` ("One-card UAT: two clarifiers maximum, integrated golden thread and dice/card numerology") with the current per-position Golden Thread that folds in clarifiers, astrology and numerology. The card `connections` text still exists and still shows on each card's detail page; it is no longer used in the reading.

This is the most likely match for #10's "approved explanations disappeared". Whether `c97e117` was an approved replacement is not recorded. **Decision for Chas:** keep the current Golden Thread, bring the card-to-card bridges back into it, or both.

### F2 — Deep's wording fixes apply to the removed text, not to #41
Deep's review quoted "turns that earlier impulse" and the generic "shifts the emphasis" fallback. Both exist only in production `main` / `v0.91` (F1); neither is in #41. Deep's third point, a line for a repeated card, is already in #41 ("…its reappearance amplifies and asks you to revisit its original theme").
So the two proposals below matter **only if Chas restores the bridges**:

| # | Before | Proposed | Why |
|---|---|---|---|
| P1 | …turns that earlier impulse toward [keyword] | …invites that earlier impulse toward [keyword] | States a possibility, not an outcome (Deep). |
| P2 | Following X, Y shifts the emphasis toward [keyword] | Following X, Y may draw your attention toward [keyword] | Generic fallback read as a fixed outcome (Deep). |

### F3 — No absolute-prediction wording found in #41
- Code text: 0 lines flagged after excluding form validation and system messages ("Birth year must be…", "it will appear here").
- Card text (78 cards): 21 sentences contain words such as *will*, *must*, *always*. Each was read: none predicts the reader's future. They are questions ("What support will I need…"), negations ("not always", "rather than a guaranteed event", "does not guarantee"), symbolism ("forces that must cooperate"), or a title ("Conduit of Will"). Listed in `COPY_INVENTORY.md` §4 for Chas to check. **No changes proposed.**
- Reading text already carries "This is a perspective, not a fixed prediction", "not a certainty", and "symbolic prompts, not guarantees".

### F4 — Other differences from earlier builds, with the commit that made each
All are listed line by line in `COPY_INVENTORY.md` §2. Each traces to a commit whose message states the change as intended; whether Chas approved each is not recorded.

| Change | Commit |
|---|---|
| Seven-card spread: "the client's …" became "you / your …" | `8ea7b33` 21 Oct "Personalise seven-card readings…" |
| Hint "Tap a card or its interpretation for the full meaning, then return to this reading." removed | `de3f956` 21 Oct "UAT-005 simplify reading completion actions…" |
| Atmospheric `landing-reading.jpg` panel after drawing removed (already raised in #10; confirmed again by rendering `main` and this build) | `af8473c` 22 Oct "Remove redundant reading banner…" |
| First-layer clarifier controls ("Review first-layer clarifiers", "Clarify the first layer →") replaced by one Draw Clarifier button | `a71bd9d` 21 Oct |
| "Sample deck: cards repeat…" notice gone (78-card deck) | `f488713` 22 Oct |
| Repeated-number and dice lines in numerology reworded | `c97e117`, `f488713` |
| Astrology entry: full birth-detail form replaced by Sun sign and birth year | `94b546b` 28 Oct (PR #34) |
| Download changed from `.txt` to PDF; save-confirmation wording | `f488713` and earlier |

### F5 — Card text is preserved
The five cards in production (The Fool, The Magician, The High Priestess, The Empress, The Emperor) have identical text in every field in #41. The other 73 cards were added later (first present in `integration/astrology-uat`).

## What this does not establish
- Which build Chas approved (provenance above).
- Rendered checks covered the one-card Guidance reading with both clarifiers, Learn, card detail and Journal at 1280px with a fixed seed. The card-to-card bridges in F1 only appear with two or more cards, so F1 rests on source comparison, not a rendered multi-card capture.
- No real-device, screen-reader or PDF-content check was run for this evidence.

## Verification
- Unit tests on this branch: 82/82 pass (`node --test tests/*.test.cjs`).
- This branch only adds five new files (the four above plus this one). No existing file is modified, so the app is byte-for-byte the build Chas tested.
- PR #41 head still `f11ad87`.
