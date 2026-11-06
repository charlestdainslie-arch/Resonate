# Proposals for Chas's approval — G2, C1, provenance (6 Nov 2026)

Nothing in this file is implemented. Each section ends with the decisions needed.

## G2 — a Golden Thread that follows the relationships the reading states

**What the engine actually establishes** (`app.js`), and how often (samples S2 + S3, 11 card-to-card steps):

| Relationship | Where the written reading states it | Frequency |
|---|---|---|
| **Clarifies**: clarifier ↔ its own card | "The conversation between them…" (`storyConnection`) | every clarifier (6 in S2+S3) |
| **Named**: card A's `connections` names card B | card-to-card bridge "Read after A, this develops the thread: …" | 0 of 11 bridges; only 2.6% of all card pairs in the deck have one |
| **Sequence**: consecutive Majors (e.g. VI → VII) | "As the next step in the Major Arcana sequence…" | 0 of 11 |
| **Generic**: neither of the above | "Following A, B may draw your attention toward …" (keyword only) | **11 of 11** |
| **Number echo**: same tarot number | "Repeated tarot numbers: 6, 2, 5" | S3 only (3 pairs) |

So today the honest picture is: strong links exist for clarifiers; card-to-card links are almost always generic.

**Smallest safe integration (proposed):**
1. **One source of truth.** Add `readingRelations(chosen)` to `app.js`, returning the relationships above as data (`from`, `to`, `kind`, `text`). `cardToCardThread()` and `goldenThread()` build their sentences from it, so the text and the thread cannot disagree. No sentence changes.
2. **Thread draws relations, not slots.** The connector receives the relations list. Card-to-card strands join **base card → base card** (fixes G2: no strand leaves a clarifier for the next position), and clarifier strands stay base → clarifier.
3. **Strength shows honestly.** Named and sequence strands at today's full gold; **generic strands visibly fainter** (thin core, no sparkle). Clarifier strands unchanged. No strand for anything the text does not state.
4. **Real identities.** Pass the true `cardId` and orientation to the connector (today: always upright, clarifier id null). Orientation does not change the line, because the engine states no reversed-specific relationship.
5. **Tests.** Every drawn strand has exactly one relation in the written reading (same pair, same kind) and vice versa, checked on page and PDF text; G5 test kept green.

Effect on S3: 9 card-to-card strands, all faint (generic); 4 clarifier strands; the World → The Lovers chain stays parent → clarifier. The desktop Celtic Cross gets simpler, because strands no longer start from clarifiers.

**Decisions for Chas:** (a) card-to-card strands start from the base card, not the last clarifier: yes/no; (b) generic links shown faint / hidden / unchanged; (c) also draw number-echo links (stated in the text, but not adjacent): yes/no. Richer meaning needs more `connections` written per card (content work, see the provenance section).

## C1 — Chas's teaching rule, proposed third clarifier

**Label:** Chas's teaching rule (approved #13; this extension from Chas's recollection, 6 Nov). Not attributed to Paul Fenton-Smith.

**Proposed behaviour** (no change until approved):
- Base Major → Clarifier 1. If Clarifier 1 is Major → Clarifier 2 (as today).
- **New:** if base, Clarifier 1 and Clarifier 2 are **all Major**, the position receives a **third card for near-future clarity, always from the Minor Arcana.** It is never drawn otherwise.
- Maximum per position becomes 3. No card repeats in a reading. Reversals apply as usual.
- How often: for a Major base, about 21/77 × 20/76 ≈ **7%** of the time. Sample S3 position 5 (The World → The Hanged Man → The Lovers) is such a case.

**Drawing the non-Major without manipulating chance:**
The third card is drawn **from a separate, visibly declared pool**: the Minor Arcana cards not yet in the reading, freshly shuffled, uniformly at random. The draw is still random within that pool, and the seeker is told so. It is not drawn from the full deck and redrawn until a Minor appears (that hides discarded draws), and nothing is pre-chosen. Statistically this is identical to "deal from the full deck, set aside Majors face up, take the first Minor", which is a possible alternative UX if Chas prefers the ritual of setting cards aside.

**UX:**
- Button "**Draw a Minor Arcana card for near-future clarity**". It appears only when the rule triggers, with the help text "Three Major Arcana in a row: a Minor Arcana card brings the message down to the near future."
- A third slot sits beside the two clarifiers, the same size, labelled "NEAR FUTURE · MINOR ARCANA".
- Reading text: a "Near-future clarity" block for that position.
- PDF section and Max chapter "Clarifier 3 · near-future clarity", using the same quote rules.
- The Golden Thread links it to its base card.

**Decisions for Chas:**
1. Is this exactly your rule (does it also apply when the chain starts from a card the seeker chose to clarify)?
2. Pool draw (recommended) or set-aside ritual?
3. Wording of the label and help text.
4. Should the third card's meaning be read as "near future" for that position only, or as a near-future outlook for the whole reading?

## Provenance and licensing — remediation plan

Facts (`sources/DATASET_NOTES.md`):
- No citation for any card text, numerology or correspondence.
- 73 cards have templated spiritual / Wu Wei / wabi-sabi text.
- Correspondences are Golden Dawn-derived, with two undocumented changes.
- The images come from `sixseeds/tarot-api` @ `71825ee`. That repo has **no licence file**; its README asserts the images are "from the Rider-Waite deck (1909) and are in the public domain", with **no scan or edition provenance**.

| # | Action | Owner | Outcome |
|---|---|---|---|
| 1 | **Separate the layers in the data.** Mark each field `tarot` (upright, reversed, keywords, numerology, correspondences) or `resonate` (Wu Wei, wabi-sabi, Jungian, spiritual, journal prompt). Show them under distinct headings in the reading and PDF. | Claude (code), Chas (headings) | Tarot interpretation and the RESONATE philosophy layer are never mixed |
| 2 | **Correspondence system.** Record the system as "Golden Dawn (Book T / Liber 777) attributions" in a `sources.json`, with a primary-edition page check. Either revert The Fool to Air and drop Mars from The Emperor, or label both as RESONATE choices. | Deep (check), Chas (choice) | Every correspondence has a named source or is labelled a RESONATE choice |
| 3 | **Tarot meanings.** Write or verify each card against public-domain primary sources only (Waite, *The Pictorial Key to the Tarot*, 1910/1911; 1909 card imagery). Cite per card; paraphrase, never import modern copyrighted interpretations. Mark each card `verified` / `pending`. | Deep (verify), Claude (data + citations) | 78 cards with citation status, not one UNKNOWN |
| 4 | **Templated philosophy text (73 cards).** Rewrite per card or label it "reflection prompt (generated)". It is RESONATE's own layer, so this is a quality task, not a rights task. | Chas / Claude drafts | No duplicated journal prompt presented as Wu Wei |
| 5 | **Images.** Replace with, or match by hash to, a scan of the 1909 Waite–Smith deck with documented provenance (e.g. a specific public-domain archive scan with its source page and licence tag). Record per-file source, edition and licence in `assets/deck/manifest.json`. Avoid restored or recoloured modern editions, which may carry their own rights. | Claude (sourcing + hashes), Chas (approve) | Every image has a source page and a licence statement |
| 6 | **Legal confirmation.** The 1909 publication and the artist's death in 1951 point to public domain in the US, UK, EU and Australia, but this is not legal advice. Chas confirms before commercial launch. | Chas | Launch gate |

**Order:** 1 → 5 → 2 → 3 → 4 (the separation first; then images, the only external-rights risk; then sources; content last).
