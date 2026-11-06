# Sample readings — evidence for Issue #49

Generated on `b3a34c35f5a6991554a385cef7a835827e6d7f94` by `node audit/tools/sample-readings.cjs` through the real UI of `presenter-uat.html` (clicks on Draw, the clarifier button and "+ Clarify this card"). The only things controlled are `Math.random` (seeded for the draws, with animation frames on a separate stream so the Golden Thread's sparkles cannot shift the cards; finding R1) and the clock (fixed start, 2026-11-06 12:00 Sydney). **Three separate runs produced identical draws.**

Every artefact in a sample folder comes from the **same reading state**, captured once: the page text, Max's script, the PDF (downloaded with the app's own button and read back with pdf.js), and the Golden Thread geometry.

| File | What it is |
|---|---|
| `draw-record.json` | The draw: cards, positions, orientations, clarifiers, the button sequence, and the app's own rule check (`ruleCheck`, empty = valid) |
| `written-interpretation.txt` | The written reading exactly as the page shows it (`#readingInterpretation`) |
| `presenter-script.json` / `presenter-transcript.txt` | Max Chasroom's full script for this reading (frame / label / quote parts) |
| `reading.pdf` / `pdf-text.txt` | The real downloaded PDF and its extracted text |
| `golden-thread-geometry.json` | Every strand (resolved to card names) and every ring with its margin from the card picture, at 1280 / 390 / 360 px |
| `golden-thread-1280.png`, `-390.png`, `-360.png`, `-390-reduced-motion.png` | The spread with the thread |
| `page-390.png`, `page-360.png`, `max-player-390.png` | Phone page views; Max's player part-way through (muted, captions) |
| `consistency-check.json` | Automatic cross-checks (below) |

## S1-guidance-seed7 — One-card Guidance

Folder `samples/guidance/` · seed 7 · drawn 2026-11-06T01:00:00.529Z · reversals on

| # | Position | Card | Clarifier 1 | Clarifier 2 |
|---|---|---|---|---|
| 1 | Guidance | The Fool (id 0) | Seven of Wands, reversed (id 28) | — |

**Clarifier sequence:** 1. rule: Major Arcana base card → Clarifier 1.

**Checks:** every card (2) appears with its orientation in the page, PDF and Max script: **YES** · orientation conflicts: **none** · Max quotes found word-for-word in the page: **5/5**, in the PDF: **5/5** · clarifier rule violations: **0** · PDF pages: 4 · reduced motion: 1 strands, 3 loops, 0 running animations · thread nodes left after leaving the reading: 0 · horizontal overflow at 390 / 360: no / no · page errors: 1 (the 404 for `voice/chas/manifest.json`: Chas's private voice pack, correctly absent).

**Golden Thread strands (desktop):** The Fool → Seven of Wands, reversed (clarifier 1).

## S2-three-seed11 — Past · Present · Future

Folder `samples/three/` · seed 11 · drawn 2026-11-06T01:00:00.529Z · reversals on

| # | Position | Card | Clarifier 1 | Clarifier 2 |
|---|---|---|---|---|
| 1 | Past | Two of Cups (id 37) | The Magician, reversed (id 1) | Nine of Swords, reversed (id 58) |
| 2 | Present | Queen of Swords, reversed (id 62) | — | — |
| 3 | Future | King of Pentacles (id 77) | — | — |

**Clarifier sequence:** 1. seeker's choice: "+ Clarify this card" on position 1; 2. rule: Clarifier 1 is Major Arcana → Clarifier 2.

**Checks:** every card (5) appears with its orientation in the page, PDF and Max script: **YES** · orientation conflicts: **none** · Max quotes found word-for-word in the page: **10/10**, in the PDF: **10/10** · clarifier rule violations: **0** · PDF pages: 6 · reduced motion: 4 strands, 6 loops, 0 running animations · thread nodes left after leaving the reading: 0 · horizontal overflow at 390 / 360: no / no · page errors: 1 (the 404 for `voice/chas/manifest.json`: Chas's private voice pack, correctly absent).

**Golden Thread strands (desktop):** Two of Cups → The Magician, reversed (clarifier 1); Nine of Swords, reversed (clarifier 2) → Queen of Swords, reversed; Queen of Swords, reversed → King of Pentacles; Two of Cups → Nine of Swords, reversed (clarifier 2).

## S3-celtic-seed3 — Celtic Cross

Folder `samples/celtic/` · seed 3 · drawn 2026-11-06T01:00:01.453Z · reversals on

| # | Position | Card | Clarifier 1 | Clarifier 2 |
|---|---|---|---|---|
| 1 | Present Situation | Ace of Swords, reversed (id 50) | Nine of Pentacles (id 72) | — |
| 2 | Crossing Challenge | Four of Cups (id 39) | — | — |
| 3 | Foundation | Three of Pentacles, reversed (id 66) | — | — |
| 4 | Recent Past | The Sun (id 19) | Knight of Swords (id 61) | — |
| 5 | Conscious Focus | The World, reversed (id 21) | The Hanged Man, reversed (id 12) | The Lovers, reversed (id 6) |
| 6 | Near Future | Two of Cups, reversed (id 37) | — | — |
| 7 | Your Approach | Five of Cups, reversed (id 40) | — | — |
| 8 | Surrounding Influences | Six of Cups, reversed (id 41) | — | — |
| 9 | Hopes and Fears | Five of Pentacles, reversed (id 68) | — | — |
| 10 | Potential Outcome | Two of Wands, reversed (id 23) | — | — |

**Clarifier sequence:** 1. rule: Major Arcana base card → Clarifier 1; 2. rule: Clarifier 1 is Major Arcana → Clarifier 2; 3. seeker's choice: "+ Clarify this card" on position 1.

**Checks:** every card (14) appears with its orientation in the page, PDF and Max script: **YES** · orientation conflicts: **none** · Max quotes found word-for-word in the page: **26/26**, in the PDF: **26/26** · clarifier rule violations: **0** · PDF pages: 15 · reduced motion: 13 strands, 15 loops, 0 running animations · thread nodes left after leaving the reading: 0 · horizontal overflow at 390 / 360: no / no · page errors: 1 (the 404 for `voice/chas/manifest.json`: Chas's private voice pack, correctly absent).

**Golden Thread strands (desktop):** Ace of Swords, reversed → Nine of Pentacles (clarifier 1); The Sun → Knight of Swords (clarifier 1); The World, reversed → The Hanged Man, reversed (clarifier 1); The World, reversed → The Lovers, reversed (clarifier 2); Nine of Pentacles (clarifier 1) → Four of Cups; Four of Cups → Three of Pentacles, reversed; Three of Pentacles, reversed → The Sun; Knight of Swords (clarifier 1) → The World, reversed; The Lovers, reversed (clarifier 2) → Two of Cups, reversed; Two of Cups, reversed → Five of Cups, reversed; Five of Cups, reversed → Six of Cups, reversed; Six of Cups, reversed → Five of Pentacles, reversed; Five of Pentacles, reversed → Two of Wands, reversed.

## What these checks do not cover

- Whether the meanings are *right* (Deep's review against Waite / 1909 imagery).
- Real devices and non-Chromium browsers.
- Max with Chas's recorded voice (ran muted, captions only).
- Seven-card V and Relationship spreads (layout covered by `tests/spread-layout-with-thread.browser.cjs` only).
