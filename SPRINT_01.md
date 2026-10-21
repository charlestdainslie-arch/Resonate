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
