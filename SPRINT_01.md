# Chas Sprint 1 — Baseline acceptance checklist

## Scope and evidence
Source branch: develop/v1.0-base (from release/v0.91, commit 939402183172a8817696a2e71384c0be01354de3).

Repository inspection confirms:
- data.js currently defines exactly five Major Arcana cards (IDs 0–4): Fool, Magician, High Priestess, Empress, Emperor.
- tests/journal.test.cjs contains four Node test cases for local journal: edit/deduplication, separate draws, failed storage, formatted dates.
- index.html loads plain JS/CSS assets; no production backend evidenced by this inspected entrypoint.
- Prior UAT markdown records historical checks; these must be rerun on a controlled preview before 1.0 sign-off.

## Sprint 1 work items
1. Trace all UI routes and read app.js, CSS and stage scripts; inventory current and missing functionality.
2. Run journal tests; record timestamp, results and build SHA.
3. Draft 78-card data schema and unique draw rules with suite of automated tests.
4. Investigate filament path choreography on responsive card/interpretation geometry. Reduced motion is required.
5. Draft authentication, private journal persistence and subscription solution with security review.
6. Phase 2 checkpoint: confirm deck-type IDs, optional stages, versioned journal entries, reusable animation events. Add foundations now only with explicit agreed benefit and adequate tests.

## Acceptance and exit criteria
- Each change links to a requirement, evidence and an acceptance criterion.
- No source modifications to main or release/v0.91.
- Functional and integration tests green; defects triaged; no unsupported claim of completed UAT.
- Product owner has tested and accepted completed user journeys.

## Known gaps
- 73 card definitions, artwork and meanings still needed for complete 78-card deck.
- Browser-local journal is not private cross-device synced membership journal.
- Login, payments, entitlements, golden filament and optional dice ritual not implemented/verified here.

## Phase 2 integration decision record
At each sprint, report: proposal; reason now; effort/risk; avoided rework; recommendation; explicit decision. Oracle reading UI remains deferred.

## Reading welcome — approved product copy and acceptance criteria

Display at the start of every reading, including free and subscribed readings, before the optional dice and draw experience:

**Welcome to Your Personal Reading**

As you begin, you're welcome to invite whichever guides, guardian angels, ancestors or spiritual connections you personally believe in.

Take a moment to settle, open your mind and follow your intuition.

**Take what resonates with you, and leave the rest.**

This is your personal reading. The cards offer possibilities and perspectives, but the choices and meaning remain yours.

Acceptance: inclusive and optional belief invitation; no claims of direct spirit communication; readable and screen-reader accessible; graceful Skip/Continue control; reduced-motion mode; golden filament quietly begins glowing then leads to optional dice and cards. Must not block the reading. Product owner to UAT wording and interaction.

## Sprint 1 expanded QA and clarifier design checkpoint — 21 Oct 2026

Product-owner requested QA:
- Verify visual placements (hand, Fool, copy, all spread-card slots) across desktop/tablet/mobile and varied viewport heights.
- Verify text/wording alignment, button dimensions/labels and keyboard focus; inspect back-navigation labels and targets.
- Explicitly test return from first card/detail/bottom of interpretation to the TOP of the same reading without a fresh shuffle, lost notes, or changing cards.
- Verify second and third clarifier layers, potentially drawing from separate deck instances so the full 78-card pool is available for each layer.

Observed in current source (not yet end-to-end UAT):
- app.js renderDraw bottom control #backToReadingTop scrolls to .draw-stage.multi.
- Detail navigation at first/last card calls go('draw'), rebuilding the reading; state must be preserved and top-scroll verified.
- drawFirstLayerClarifiers selects from the current 5-card sample pool, excluding original card IDs where possible, and uses modulo reuse when insufficient; no complete 78-card multi-layer clarifier mechanism established.
- Layer-specific full-deck draws require explicit definition: a *freshly shuffled full 78-card deck per layer* is distinct from a different tarot/oracle deck. Do not add unrelated oracle artwork/meaning to Phase 1 by assumption.

Proposed clarification for product owner before implementation:
1. Primary spread draws without replacement from a standard 78-card tarot deck.
2. Each clarifier layer may start a NEW independently shuffled 78-card tarot deck instance; no repeats within a layer, while repeats across different layers are permissible and explained.
3. Layer 2 and 3 trigger conditions and whether they use a genuinely different deck design must be agreed before developing their UI/interpretation.
4. Every layer and deck instance must persist in the reading journal with stable card/position/deck references.
5. Golden filament follows main → first → second → third layers only when present, and points to corresponding interpretation.
6. Add automated tests for 78-card uniqueness per deck instance; card/position association; nested clarifier limits; repeat rules; return-to-reading scroll; and reduced-motion behavior.

No implementation or UAT success claimed by this documentation.
