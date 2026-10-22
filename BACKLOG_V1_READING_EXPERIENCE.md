# RESONATE Tarot Explorer — Integrated Reading Engine & Layout Backlog

**Decision recorded:** 23 October 2026 (Australia/Sydney)  
**Source:** Product owner, Chas — explicitly requested that the entire reading engine, card placements, interpretations and PDF experience work **before** Golden Thread/filament animation or hero polish.  
**Target branch:** `develop/v1.0-base` (or short-lived feature branches based on it).  
**Tracking issue:** [#7 — Finish integrated reading engine, layouts & PDF before Golden Thread polish](https://github.com/charlestdainslie-arch/Resonate/issues/7)  
**Status:** BACKLOG / NOT IMPLEMENTED OR UAT-APPROVED BY THIS DOCUMENT.  
**Priority:** Functional engine → working layouts → integration, journal and branded PDF → full regression/UAT → Golden Thread animation and extra luminance.  
**Release/version:** Subject to scope review and product-owner sign-off; this decision supersedes the older Phase 2 deferral of Oracle cards for sequencing, but does **not** imply a production release, completed implementation or a committed delivery date.

## Approved full-experience journey / state machine

`Welcome / optional spiritual invitation → personal astrology intake → Western/Vedic/Chinese astrology prelude → opening Oracle draw → numerology and two dice → tarot spread selection, shuffle and face-down placement → reveal of actual tarot cards → up to two clarifiers per card → position-aware integrated interpretation → closing Oracle draw → final synthesis/reflection → saved journal / branded PDF`.

- Opening Oracle sets the theme; closing Oracle is **drawn only after** the preceding tarot interpretation, then becomes part of the final message. Do not pre-reveal or retroactively edit the earlier draw.
- The user's profile/reading is optional where a quick anonymous reading is supported; missing birth details must degrade gracefully, not fabricate Moon, Rising or Vedic chart data. Keep the inclusive free-will/non-deterministic language and existing welcome copy.
- Every stage stores typed, ordered events in a single versioned **reading session**. Screen, interpretations, saved journal and PDF render from the **same** session data, never independently regenerate results.
- Card/order/position/orientation/clarifiers/Oracle/deck instance/dice/profile settings/astrological reference date and time zone are preserved through navigation, exports and reopens. No reshuffle on Back/Next/return-to-reading.
- This feature order is an explicit **change-control update** to `V1_DELIVERY_BASELINE.md`, `SPRINT_01.md`, `V1_UAT_MATRIX.md` and the earlier optional-Oracle Phase 2 suggestion.

## Ordered implementation backlog

### P0 — Core engine and rules: build first
- [ ] **ENG-01 — Versioned domain model and journey orchestration.** Typed stages for profile, opening Oracle, numerology/dice, tarot positions, clarifiers, interpretation, closing Oracle, journal and PDF. Immutable draw outcomes; deterministic fixtures/tests; idempotent save/reopen; nonblocking Skip/Back flow where permitted. No presentation animation dependency.
- [ ] **ENG-02 — Complete and validate all 78 Rider–Waite tarot cards.** Unique IDs, name, accurate licensed/public-domain images as applicable, upright/reversed meanings, associations and reviewed content; drawing without replacement within each deck instance. Confirm asset rights. Existing five-card prototype is **not** acceptance.
- [ ] **ENG-03 — Clarifier and reversal rules.** **Maximum TWO clarifiers per primary card, never a third.** Preserve the product owner's major-arcana clarification rule and second clarifier on a double-major as the default proposal; implement explicit trigger/opt-in rules and allow skip where appropriate. Associate each clarifier with its parent card and position; layered visual overlap like solitaire. Support cut/twist reversals and stable orientation. Clarifier deck-instance strategy and cross-instance repeats require an explicit consistent rule, automated checks and product-owner approval; never portray an accidental duplicate as a supernatural signal.
- [ ] **ENG-04 — Two genuine Oracle stages/deck data.** Separate `oracle` from `tarot` deck types; opening and closing card draw with unique card ID, accessible actual image, meaning, stage semantics and rights-cleared original/licensed artwork. Closing card stays unrevealed until all earlier interpretation is complete; integrate its meaning into the final reflection without rewriting earlier results.
- [ ] **ENG-05 — Astrology calculation + interpretation adapter.** Western **tropical** Sun/Moon/Ascendant and dated transits; Vedic **sidereal** equivalent including documented ayanamsha; Chinese zodiac animal/element with year-boundary rules (not blindly January 1). Capture birth date, birth time and birthplace for chart precision; sign and year are quick-entry fallbacks. Never infer natal Moon/Rising from sign/year alone. Time zone/ephemeris provenance and the difference between natal and today's Moon must be clear; no unwarranted earthquake/space-weather causation claims.
- [ ] **ENG-06 — Numerology + two 0–9 dice.** Birth-date numbers, date-of-reading numbers, documented calculation/reduction convention, two independent results each 0–9, displayed digit order and interpretation. Keep the symbolic/free-will tone; support users who do not supply a full birth date. Store/restore exact results.
- [ ] **ENG-07 — Interpretation/synthesis engine.** Each card's interpretation explicitly combines **card + semantic spread position + neighbouring cards + upright/reversed orientation + applicable clarifiers**. Integrate Western/Vedic/Chinese astrology, opening Oracle, numerology and dice as **clearly named interpretative overlays**. Closing Oracle provides a final distinct reflection. Avoid contradictory text, invented birth details and deterministic claims.

### P1 — Working layouts and functional reading flow: before polish
- [ ] **UI-01 — Real card placements.** Face-down slots and **actual face-up card artwork** at the right physical positions for one-card, three-card, RESONATE seven-card V, Relationship, Celtic Cross and agreed other spreads. Keep stable placement IDs/labels and order on all breakpoints. Gold headings prominently distinguish **Past / Present / Future** where those semantics apply; never impose those headings on spreads with different meanings.
- [ ] **UI-02 — Card-to-interpretation traceability.** Each displayed card and clarifier visibly maps to the same numbered/labelled interpretation section. First, second clarifier visual layers remain legible on phone/tablet/desktop. Correct card name, image, reversal marker, heading and back navigation.
- [ ] **UI-03 — Complete staged screen flow.** Welcome → personal profile/astrology summary → opening Oracle → numerology/dice → draw and clarifiers → reading → closing Oracle → journal/export. Each stage allows reader-paced advancement; skip supported where designed; preserve state through navigation. Functional text and static visuals first.
- [ ] **UI-04 — Responsive/accessibility.** Verified at 320/375/390/768/1024/1280/1440/1920 widths with multiple heights, keyboard/screen-reader labels, focus and reduced-motion support. Preserve balanced hand/logo/Fool/text landing layout; do not allow new modules to regress it.

### P2 — Journal, export, quality and sign-off: before animation
- [ ] **SAVE-01 — Versioned private reading journal.** Preserve exact draw/Oracle/dice/astrology snapshot, zone/date, spread positions, clarifier parentage and reflection. Anonymous reading remains possible; privacy/account requirements follow separately approved architecture, not an assumption that localStorage is secure cross-device storage.
- [ ] **PDF-01 — Full branded PDF report.** Export the exact **same saved reading** (not freshly sampled interpretation), with opening and closing Oracle images, each actual tarot card in its numbered spread position, clarifiers, Western/Vedic/Chinese snapshot, numerology/dice, full interpretations and reflection. Use established gold-circled RESONATE emblem, tasteful luminous hand **behind but never obscuring** readable text, consistent typography and responsive print pagination. Handle missing assets, licensing, accessible selectable text, privacy, and long spreads; export on mobile/desktop.
- [ ] **QA-01 — Automated, browser and UAT checks.** Tests for complete card catalogue, shuffle/no repeats per instance, correct two-clarifier cap, reversal rules, precise astrology input/fallback and Chinese boundary dates, two dice in 0–9, Oracle sequencing, position-to-text mapping, navigation without redraw, journal round-trip, PDF snapshot equality, responsive/a11y and existing regression. Record screenshots/build SHA/test evidence separately from production readiness. Product owner signs off; no unresolved P0/P1 defects.

### P3 — Explicitly BLOCKED until ENG/UI/PDF/QA pass
- [ ] **ANIM-01 — Golden Thread / filament choreography**, visual transitions, decorative reveal sequences and extended hero/hand glow. Design can remain documented, but **do not prioritise implementation** before the functional journey and output are accepted. Reduced-motion fallback is required in eventual implementation.
- [ ] **ANIM-02 — Final luminosity and motion polish** including the RESONATE logo and illuminated hand behind text: follow layout, content, readability, performance and export verification.

## Phase / dependency rules
1. **ENG** dependencies gate **UI** feature completion.
2. **ENG + UI** gate **SAVE/PDF** correctness.
3. **ENG + UI + SAVE/PDF + QA/UAT** all gate **ANIM** work; no animation-first detour.
4. Use small reviewable feature branches / PRs targeting `develop/v1.0-base` with evidence. **Do not modify or merge to `main`, `release/v0.91`, or production** without the product owner's separate UAT approval.
5. Existing subscription, account, payment and security obligations remain in the v1 baseline; this backlog changes the **reading experience's sequencing**, not a licence to bypass their release gates.
6. Keep prior documentation as a historical record when it conflicts. **The 23 October decision — opening + closing Oracle in the functional reading, two-clarifier maximum, engine and layouts before animations — prevails.**

## Definition of ready / complete
- **Ready:** Each ticket has owner, selected feature branch, defined data contract, acceptance tests and explicit dependencies; licensing/ephemeris/provider questions resolved before build.
- **Done:** Implemented + automated tests passed + end-to-end browser evidence on all target viewports + exported PDF checked against the stored session + zero open P0/P1 bugs + **Chas UAT sign-off**. Neither a commit nor Vercel READY alone proves acceptance.
