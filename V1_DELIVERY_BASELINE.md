# RESONATE Tarot Explorer — v1.0 delivery baseline

Status: Engineering baseline established; NOT production-approved.
Owner / UAT sign-off: Product owner (Chas).
Working branch: develop/v1.0-base
Base source: release/v0.91 at commit 939402183172a8817696a2e71384c0be01354de3.
Production/default branch must not be modified as part of this baseline.

## Delivery method — Chas PM
Plan → build → automated test → integration test → demonstration → UAT → accept.
Record evidence and defects. No v1.0 release without explicit product-owner approval.
No critical/high defects open at release; security, payments, journal privacy, responsive layouts and accessibility are release gates.

## Confirmed current baseline
- Dependency-free static site with app.js, data.js, CSS, reading-stage and browser-local journal.
- Five sample cards, NOT a complete 78-card deck.
- Existing one, three, seven, relationship and Celtic Cross position mechanics; larger spreads repeat sample cards.
- Existing browser-local journal, NOT authenticated private cross-device storage.
- Existing tests/journal.test.cjs and historical JOURNAL_UAT.md, READING_STAGE_UAT.md, SPREAD_POSITIONS_UAT.md.
- Current deployment READY does not establish feature completion, functional acceptance or UAT sign-off.

## Phase 1 — scope for v1.0
1. Responsive landing layout and balanced hand/Fool/text placement, matching CTA dimensions.
2. Full 78-card tarot data, images and meanings with appropriate rights and content review.
3. Reading flows: one-card and three-card free; premium V, relationship, Celtic Cross and other agreed deeper spreads.
4. Golden filament from hand through UI and sequential card reveal, clarifiers, interpretations and synthesis; reader-paced interactions, reduced-motion support.
5. Personal invitation ritual mentioning guides and ancestors, optional two 0–9 dice and symbolic number interpretation; no assertion of supernatural certainty.
6. Reversals, clarifier logic and grounded, position-aware narrative interpretations.
7. Philosophy and Angel Numbers exploration.
8. Secure registered accounts and private dated/time-zoned journal entries; anonymous readings without login; clarify allowance for free saved readings.
9. Subscription access and lifecycle, agreed launch target AUD 6.99/month, clear cancellations and entitlements. No forced login or payment details for free readings.
10. Functional, integration, security, responsive, accessibility and UAT verification.

## Phase 2 — deferred
- Optional oracle card(s) before or after tarot reading and their associated interpretations.
- No Phase 2 feature is considered launch scope without explicit change control.

## Phase 2 architecture opportunities to flag proactively
- Card model: distinguish tarot and oracle decks, configurable card count, deck IDs, licenses, artwork rights.
- Reading pipeline: composable opening/closing card stages and type-aware interpretation.
- Golden filament: reusable sequencing events rather than hard-coded tarot positions.
- Journal schema: versioned readings capable of recording optional oracle stages and content version.
- Entitlements: extensible subscription capability definitions, without charging for unspecified Phase 2 offerings.
For each shared-foundation opportunity: provide cost/risk/rework impact and recommend build-now foundation vs defer. Product owner approves deviations.

## Initial verification backlog
- Confirm source/production branch mapping and deployment protection, rollback and preview workflows.
- Audit app.js, data.js and responsive styles for actual feature behaviour.
- Run existing Node journal tests and create additional tests for card uniqueness and spread rules.
- Audit storage/security and select approved auth/database/payment architecture before implementation.
- Create traceability matrix: requirement → acceptance criteria → test → evidence → product owner sign-off.

## Change control
Keep main and release/v0.91 unchanged. Deliver small, reviewable commits and preview deployments from develop/v1.0-base or short-lived feature branches. Clearly separate confirmed checks from planned tests.
