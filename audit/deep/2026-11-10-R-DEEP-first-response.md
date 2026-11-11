# Deep — first response to the 10 Nov readings and motion brief

**Date:** 10 November 2026, 14:40 AEST
**From:** Deep
**To:** Si Aye, Chas, Claude (cc)
**Re:** `audit/DEEP_BRIEF_10NOV_READINGS_MOTION.md` — receipt, SHA pin, first three cases, initial motion critique
**Status:** Research and recommendations only. No code changed, no merge, deploy or spend.

---

## 1. Local receipt — confirmed

Read directly from the clone at `C:\Users\charl\Documents\resonate-voice`, at **HEAD `07f315c`**:

| File | State |
|---|---|
| `audit/DECISIONS_10NOV_CLARIFIERS_EDITORIAL_DEEP.md` | present, read — `f399381` |
| `audit/DECISIONS_10NOV_DEEP_B_RESEARCH.md` | present, read — `37122f7` |
| `audit/DEEP_BRIEF_10NOV_READINGS_MOTION.md` | present, read — `ecd6f09` |
| `audit/deep/` (my five 10 Nov files) | present — `07f315c` |
| `audit/DEEP_SESSION_STATE.md` | present — `07f315c` |

Claude's inbox receipt (`2026-11-10-CLAUDE-to-deep-collected.md`) is accurate; the manifest's item 5 is now closed.

**My earlier "governance rift" criticism is formally withdrawn.** The decisions were approved, recorded and pushed — they simply had not reached this clone when I looked. The process worked; the sync was late. That is a different thing, and I said it too strongly.

---

## 2. SHA pin

| Layer | SHA | Date | Note |
|---|---|---|---|
| **Application code** | **`274332f`** | 10 Nov | last commit touching `presenter.js`, `app.js`, `clarifier-reading.js`, `golden-thread-live.js`, `data.js`, `deck-theatre.js`, `reading-stage.js`, `clarifier-rules.js` |
| **CSS** | `ca9c281` | 9 Nov | last commit touching any stylesheet |
| Branch HEAD | `07f315c` | 10 Nov | docs only since `274332f` |

So the brief's "last known app change `274332f`" is correct, and **everything after it is documentation**. Every finding below is pinned to **app `274332f` + CSS `ca9c281`**.

---

## 3. First three reading cases

Chosen to sit at the three extremes of the engine's behaviour — not the three easiest to pass.

**Case 1 — maximum structural complexity: Celtic Cross, dramatic, with a Clarity card.**
Multiple Majors, at least one reversed, a first and second clarifier drawn, and a Clarity card present. Tests: clarifier layering, the `tension` line, the "repeated card" note, the element-weight sentence, and whether the Clarity card is described as itself or as a clarifier (it must not be — the rule is explicit).

**Case 2 — minimum drama: three-card spread, all Minors, no clarifiers due.**
Ordinary cards, nothing owed, nothing reversed. Tests: whether the engine can say anything worth reading when the cards give it no leverage. This is the case where template prose is most exposed, because there is no drama to hide behind. Most readers are interesting only when the cards are loud; the product has to work when they are quiet.

**Case 3 — the newly approved freedom: a Major original whose due first clarifier was deliberately skipped.**
Tests DEC-10NOV-01 directly: the reading must complete **without a warning**, and Max, the captions and the Golden Thread must **not interpret the undrawn clarifier**. This is the case that did not exist before 10 Nov and has never been audited.

I will add a fourth once these three are documented: a seven-card question reading, since its "last position read last" rule is a separate behaviour.

---

## 4. Initial motion critique — source only

I have inspected the source, **not the rendered page**. Five findings, then three small concepts.

**M1 — The restraint is already correct.** Across six stylesheets and their scripts there are **8 `@keyframes` total** and **7 `transition:` declarations**; `prefers-reduced-motion` is handled in every file that animates. The house style is deliberate and quiet. Any proposal should match that, not add to it. *What I could not check: what those 8 keyframes actually do, or how they look.*

**M2 — The full reading has no addressable identity, and that blocks every motion idea.** Each position renders as `<article class="golden-card-reading">` with no `id`, no `data-position` and no `data-card-id` (`app.js:427`). Across `app.js`, `presenter.js` and `reading-stage.js` there are only **three** occurrences of any `data-card-id` / `data-position` / `data-index` hook. So there is nothing for a focal highlight, a position-stable reveal, or scroll-linked narration to attach to. **This is the gate: identity in the DOM has to come before motion on it.** Adding CSS first would be motion applied to anonymous `<article>`s.

**M3 — Clarifiers are not elements, so they cannot be made visible by styling.** A clarifier appears only as a name joined by `+` inside `golden-card-heading`, and is then folded into a single proposition (`app.js:427`). There is no per-clarifier element to offset, group, or animate. That is precisely Chas's complaint that clarifiers are hard to see, and it is a **structural** problem: solitaire-style overlaps need new DOM, not new CSS.

**M4 — The density is structural, not a matter of spacing.** The overall invitation is one `<p>` that concatenates four clauses with spaces (`app.js:450`), followed by a separate numerology block and a resonance line (`app.js:453`). The page does have sections — opening, per-position `article`s, thread, summary, numerology, resonance — but **every section is a paragraph of prose**. There are no scannable headings inside the reading and **no card images at all**: the full reading is text-only, while the card detail pages are image-rich. That mismatch is the "dense text" Chas is describing.

**M5 — Max and the page never point at each other.** `presenter.js` carries 4 keyframes and 5 transitions; the reading body below it has none. Max speaks a card and nothing on the page indicates which one. The single cheapest improvement in the whole product is binding those two together.

### Three small concepts

All three are class toggles with fixed timings, so they can be accepted or rejected without rendering.

**C1 — Focal ring.** The card Max is currently speaking gets one class: 2px ring, `translateY(-2px)`, 120 ms ease. With `prefers-reduced-motion`, the ring only, no transform. *Acceptance:* the ringed card is the card Max's current sentence names.

**C2 — Clarifier chip rail.** Each clarifier becomes a small chip under its original (thumbnail + label); undrawn slots render at 0.9 opacity, reserved but empty. Reveal by opacity and width, 200 ms. *Purpose:* makes clarifiers visible **without** overlap, which is safer than solitaire stacking on a phone. *Acceptance:* legible at 360 px; no clipping; empty slots visible so a skipped clarifier reads as skipped, not missing.

**C3 — Section stepping.** As Max moves opening → positions → thread → invitation, the current section takes a left rule and the others take a 40% scrim, 300 ms. *Acceptance:* with reduced motion, the rule alone, no scrim; keyboard focus never lands on a scrimmed section.

I would build **C1 and C2 only** for the first pass. C3 touches everything and should wait for Chas's view on the layout.

---

## 5. What I could not inspect

- **Nothing rendered.** No browser, no Playwright. I can serve the build (HTTP 200) and read its source; I cannot see spacing, overflow, or whether a chip rail survives a Samsung screen.
- **The 8 keyframes' purposes** — counted, not studied.
- **The served build's visual state.** Source and served output may differ if any transform happens server-side; I have no evidence either way.

## 6. Next

I start Case 3, then Case 1, then Case 2 — Case 3 first because it tests the decision that is newest and least exercised. Then the 78-card audit with the redundancy claim quantified per card, then the Golden Thread traces, then the corpus-field-to-engine map.

Animation stays advisory and does not delay C, as instructed.

— Deep
