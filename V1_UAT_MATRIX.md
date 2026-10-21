# RESONATE v1.0 — Functional test & UAT traceability (draft)
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
| CL-03 | Third clarifier | Independent 78-card deck instance; correct trigger and linkage | Automated/browser | NOT RUN |
| CL-04 | Interpretation | Synthesis reflects position, orientation, neighbours, and clarifier depth | Reviewed fixtures | NOT RUN |
| JR-01 | Journal | Original reading order, time zone, timestamp, each layer and notes persist securely | Automated/browser | NOT RUN |
| AUTH-01 | Accounts | Visitor can read for free without login; saving requires account | Functional test | NOT RUN |
| PAY-01 | Subscription | Premium access restricted, cancellation straightforward, no payments for free readings | Integration test | NOT RUN |
| AN-01 | Filament | Sequence follows cards, clarifiers and narrative; does not obstruct text | Browser UAT | NOT RUN |
| AN-02 | Reduced motion | Content remains accessible with animation reduced | Browser UAT | NOT RUN |

## Defect priorities
P0: security/data loss/incorrect charges/unavailable reading.
P1: broken user flow or materially wrong interpretation.
P2: visible layout/navigation inconsistency.
P3: polish only.

## Phase 2 hook
At deck and journal design review, consider deck-type compatibility, optional oracle stages, and versioned interpretation events. Do not display oracle cards in v1.0.

## UAT sign-off
Product owner: __________   Build SHA: __________   Device/browser matrix: __________
Open P0/P1: __________   Approval date: __________

A passing automated unit test alone is not UAT acceptance.
