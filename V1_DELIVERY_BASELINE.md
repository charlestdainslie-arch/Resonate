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

## Approved change control — 23 October 2026

**Precedence:** [BACKLOG_V1_READING_EXPERIENCE.md](BACKLOG_V1_READING_EXPERIENCE.md) is the authoritative ordered backlog for the fully integrated reading. Complete the full engine, Western/Vedic/Chinese astrology, opening and closing Oracle, numerology/two dice, actual cards and mapped placements, two-clarifier maximum, integrated interpretations, journal and branded PDF **before** Golden Thread animation and decorative luminosity polish. This supersedes the earlier optional-Oracle Phase 2 deferral and any proposal for a third clarifier, without implying an approved production release or UAT.

## Phase 1 — scope for v1.0
1. Responsive landing layout and balanced hand/Fool/text placement, matching CTA dimensions.
2. Full 78-card tarot data, images and meanings with appropriate rights and content review.
3. Reading flows: one-card and three-card free; premium V, relationship, Celtic Cross and other agreed deeper spreads.
4. Functional reading engine and layouts first, with event hooks for Golden filament. Decorative choreography starts only after all engine/layout/journal/PDF/UAT gates pass.
5. Inclusive invitation ritual; Western/Vedic/Chinese astrology prelude; opening and closing Oracle; numerology and optional two 0–9 dice. Symbolic, non-deterministic interpretation.
6. Reversals, clarifier logic and grounded, position-aware narrative interpretations.
7. Philosophy and Angel Numbers exploration.
8. Secure registered accounts and private dated/time-zoned journal entries; anonymous readings without login; clarify allowance for free saved readings.
9. Subscription access and lifecycle, agreed launch target AUD 6.99/month, clear cancellations and entitlements. No forced login or payment details for free readings.
10. Functional, integration, security, responsive, accessibility and UAT verification.

## Phase 2 scope-change note
- The previously deferred Oracle option is now an **opening and closing Oracle stage** in the integrated functional reading, per 23 October change control.
- Any other unscheduled extras remain subject to later approval; no production release is authorised here.

## Required foundation architecture before animation
- Card model: distinguish tarot and oracle decks, configurable card count, deck IDs, licenses, artwork rights.
- Reading pipeline: composable opening/closing card stages and type-aware interpretation.
- Journey events: reusable events independent of animations; Golden Thread choreography is deliberately blocked until reading functionality and UAT pass.
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
