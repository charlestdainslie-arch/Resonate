# RESONATE — Lessons Learned Log

## LL-001 · Quality before handover
**Recorded:** 21 October 2026  
**Source:** Davy's lifelong advice, reinforced during v0.91 one-card visual UAT  
**Principle:** “Do a job right the first time. Take as much time as you need to do it to the best of your ability. Rework costs three times as much and you lose your professional standing. Apply it to your whole life, whatever you're doing.”

### What happened
Several incremental CSS and presentation fixes were deployed and handed over for user testing even though full end-to-end visual verification had not been performed. Automated GitHub checks and Vercel READY were described, but those confirm technical build status, **not** visual quality or fitness for user acceptance. User screenshots then exposed misaligned and inconsistently sized cards, poor spacing, missing/weak position hierarchy, and inconsistent numbering/labels. Code review also found the second clarifier could repeat a previously drawn card.

### Root causes
- Layering CSS overrides instead of consolidating a single layout contract.
- Narrow source-code/tests coverage instead of validating the entire one-card journey.
- Confusing *deployed* with *tested and acceptable*.
- Premature handover before checking supported viewport sizes, states and navigation.

### Impact
Avoidable rework and repeated user review cycles. Davy's **three-times-cost** rule is an operating warning, **not** a measured time/cost figure for this project. Quality and professional credibility suffer when the same defects return.

### Corrective actions
1. Establish one authoritative component/layout for original, first clarifier and second clarifier. Remove conflicting CSS rules.
2. Cover the one-card flow from face-down through draw, each unique clarifier, one gold next action, interpretation, journal save/reopen and download.
3. Draw from one 78-card pool without replacement within a reading; never treat a software duplicate as a spiritual signal.
4. Verify card identity and gold position labels (for example **01 · GUIDANCE**, and Past/Present/Future in their spreads), responsive placement and reduced-motion behaviour.
5. Run and report automated tests **separately** from actual browser/visual checks. If real browser checks are unavailable, say so plainly; never represent them as completed.
6. Hand over only a bounded, reviewed UAT slice; the **user alone** grants visual sign-off.
7. Keep v1.1 symbolic interpretation expansion (Paul Fenton-Smith reference material, astrology, colour, elements and numerology) separate from v0.91 visual acceptance.

### Acceptance / closure
**OPEN.** Close only after defects are fixed, checks are evidenced, and the user accepts the visual baseline.

**Working maxim:** Quality first. Verification before handover. Avoid paying three times for rework.
