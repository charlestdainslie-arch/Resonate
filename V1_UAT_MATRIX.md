# RESONATE v1.0 — Functional test & UAT traceability (draft)

**Change control 23 October 2026:** [Integrated Reading Backlog](BACKLOG_V1_READING_EXPERIENCE.md) supersedes the Phase 2-only Oracle direction and any third-clarifier proposal. **Maximum two clarifiers per primary card. Engine, layouts, PDF and UAT before Golden Thread.** All entries remain unexecuted until evidenced.
Status: Test cases defined; execution not yet recorded. No owner approval.

| ID | Area | Acceptance test | Evidence | Status |
|---|---|---|---|---|
| UI-01 | Desktop hero | Hand visually balanced between Fool and copy; no collisions | Screenshots 1280/1440/1920 | NOT RUN |
| UI-02 | Responsive | At 320/375/390/768/1024px, hero fits, free buttons equal size and readable | Viewport screenshots | NOT RUN |
| UI-03 | Accessibility | Keyboard navigation, visible focus, readable labels, reduced motion | Accessibility report | NOT RUN |
| RD-01 | Spread positions | Every spread's slot labels, card interpretation and navigation align | Test matrix | NOT RUN |
| RD-02 | Back navigation | At first card's previous and last card's next, return to original reading top with same IDs/time and notes | Browser UAT | NOT RUN |
| RD-03 | Bottom return | Back to top of reading shows heading and spread, not a new draw | Browser UAT | NOT RUN |
| RD-04 | Shuffle | 78 distinct tarot cards; no within-layer duplicate | Automated tests | NOT RUN |
| CL-01 | First clarifier | Cards do not replace base spread; position order is stable | Automated/browser | NOT RUN |
| CL-02 | Second clarifier | Independent 78-card deck instance; references first layer correctly | Automated/browser | NOT RUN |
| CL-03 | Clarifier cap | At most two clarifiers per primary card; third is blocked without changing the reading | Automated/browser | NOT RUN |
| CL-04 | Interpretation | Synthesis reflects position, orientation, neighbours, and clarifier depth | Reviewed fixtures | NOT RUN |
| JR-01 | Journal | Original reading order, time zone, timestamp, each layer and notes persist securely | Automated/browser | NOT RUN |
| AUTH-01 | Accounts | Visitor can read for free without login; saving requires account | Functional test | NOT RUN |
| PAY-01 | Subscription | Premium access restricted, cancellation straightforward, no payments for free readings | Integration test | NOT RUN |
| ENG-01 | Session flow | Typed stage journey, no reroll on navigation, stable session and time zone | Unit/browser | NOT RUN |
| ENG-02 | Deck | Exactly 78 card IDs, upright/reversed meanings and licensed images; no repeats per instance | Unit/content QA | NOT RUN |
| AST-01 | Western astrology | Correct tropical Sun/Moon/Rising/transits with full birth details; no invented Moon/Rising on partial inputs | Ephemeris fixtures | NOT RUN |
| AST-02 | Vedic astrology | Sidereal placements with defined ayanamsha and documented fallbacks | Ephemeris fixtures | NOT RUN |
| AST-03 | Chinese astrology | Correct animal/element and lunar-year boundary | Date fixtures | NOT RUN |
| OR-01 | Opening Oracle | Rights-cleared artwork, opening card/meaning persisted | Unit/browser | NOT RUN |
| OR-02 | Closing Oracle | Only revealed after tarot interpretation; final reflection persisted | Unit/browser | NOT RUN |
| NUM-01 | Numerology/dice | Two 0–9 dice, exact saved results, birth and date numbers where known | Unit/browser | NOT RUN |
| RD-05 | Visible card slots | Actual card images, gold position labels, stable semantic interpretation link on mobile/desktop | Browser/screenshots | NOT RUN |
| SY-01 | Integrated reading | Card + position + neighbours + reversals + clarifiers + clearly distinguished astrological/Oracle/numerology layers | Content fixtures | NOT RUN |
| PDF-01 | Branded PDF | Same journal reading, actual spread, Oracle, dice, astrology, legible luminous hand/gold emblem | PDF inspection | NOT RUN |
| AN-01 | Filament (BLOCKED) | Only after core functional, export and UAT sign-off; unobstructed transitions | Browser UAT | DEFERRED |
| AN-02 | Reduced motion | Content remains accessible with animation reduced | Browser UAT | NOT RUN |

## Defect priorities
P0: security/data loss/incorrect charges/unavailable reading.
P1: broken user flow or materially wrong interpretation.
P2: visible layout/navigation inconsistency.
P3: polish only.

## Integrated scope gate
Earlier Phase 2-only Oracle direction is superseded. Implement opening and closing Oracle within the complete reading journey **before animations**, alongside the other items in [BACKLOG_V1_READING_EXPERIENCE.md](BACKLOG_V1_READING_EXPERIENCE.md). No claim of passing tests or UAT.

## UAT sign-off
Product owner: __________   Build SHA: __________   Device/browser matrix: __________
Open P0/P1: __________   Approval date: __________

A passing automated unit test alone is not UAT acceptance.
