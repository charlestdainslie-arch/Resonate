# RESONATE — AI team charter and handover protocol
Status: onboarding/scoped collaboration, **not a production change**.
Date: 24 October 2026.
Decision authority: Chas Ainslie, RESONATE visionary / product owner.

## Captain's intent
RESONATE combines a welcoming, accurate Rider–Waite-based tarot experience with astrology, numerology, Oracle, later immersive golden-filament animation, music and the larger RESONATE community. **The people and experience matter more than technological showmanship.**

Chas is the sole final decision-maker. Si Aye is the research / requirements / QA coordination point. Cousin Dev owns the active coding stream. External AI helpers may advise, investigate and prototype in isolated contexts, but do not approve, merge, deploy, buy subscriptions or modify production.

## Scottish-style communication, without forcing a persona
Be warm, straightforward, practical, good-humoured when appropriate, and concise. Read the room. Don't invent agreement or claim work completed when it is a proposal. A joke, accent, misspelling or cultural quote can be a delivery cue, not a technical instruction. Respect Chas's original words when important. Don't overuse catchphrases or rewrite his voice as corporate boilerplate.

## Working hierarchy
1. **Chas** — direction, scope, spend, privacy risk, final UAT and production sign-off.
2. **Si Aye (coordinator)** — translate vision to testable acceptance criteria, compare independent advice, record risks / assumptions / options, report to Chas.
3. **Cousin Dev (development lead)** — maintains active implementation and QA under issue #7; report evidence, no unattended merging.
4. **Antigravity/Copilot** — coding research, tests or isolated branch suggestions only, subject to Chas's sign-in and least-privilege grants.
5. **Claude** — independent interpretive/content/QA review, with no personal or customer data.
6. **Perplexity** — sourced research and licensing checks; recommendations and citations only.
7. **Google AI Studio** — synthetic-data prompt comparisons only; do not submit identifiable profiles in the free tier.
8. **Blender** — non-production storyboard/motion study, not current-site integration.
9. **Ollama** — optional local private model testing after device capabilities confirmed.

## Source of truth, in order
- GitHub issue #7: https://github.com/charlestdainslie-arch/Resonate/issues/7
- Canonical ordered backlog on `develop/v1.0-base`: `BACKLOG_V1_READING_EXPERIENCE.md`
- Future scope issue #9: https://github.com/charlestdainslie-arch/Resonate/issues/9
- AI onboarding issue #11: https://github.com/charlestdainslie-arch/Resonate/issues/11
- This charter documents collaboration only and never supersedes Chas's explicit later decisions.

## Work lanes
- `develop/v1.0-base` — current functional development and review stream, Cousin Dev. Do not interrupt.
- `sandbox/ai-companions-onboarding` — onboarding communications and sandbox documentation.
- `qa/independent-review` — independent QA findings and evidence, never changes to production code without approval.
- `research/golden-filament-motion` — future motion research only, blocked from implementation until acceptance gates pass.
- `main`, release branches and production are **not to be changed** on this instruction.

## What every helper must return
**Summary:** what was examined and what was found.
**Evidence:** exact source location, version, date, test result, screenshot, or licence link.
**Confidence / limitations:** what is verified vs inferred.
**Risks:** privacy, security, usability, licensing, performance and spending.
**Options:** keep / park / bin with costs and dependencies.
**Decision required from Chas:** explicit yes/no question if a real scope decision is needed.
**Change request:** none until Chas approves.

## Mandatory checks
- 78-card Rider–Waite integrity, unique draws per deck instance, reversals and **max two clarifiers** per primary card.
- Card meaning + semantic position + neighbour + orientation + clarifier interpretation.
- Birth details / Western-Vedic-Chinese astrology and numerology/dice must be calculated or explicitly marked unknown; no invented facts.
- Opening and closing Oracle stages; stable saved session; matching on-screen, journal and PDF output.
- Accessibility, phone/tablet/desktop layout and reduced-motion designs.
- Golden filament **kisses cards as they turn**; owl and filament share deliberate speed, weight, timing and easing. Visual research is approved, integration not yet sequenced.

## Privacy and security
Do not share credentials, API keys, private emails, birth profiles, customer readings or production secrets. Use fake names/data for external AI reviews. Inspect permissions before connecting any service. No write scopes to vendors by default, no automatic commands against repositories.

## Approval gates
Plan → option review → Chas decision → isolated implementation (if approved) → peer review → tests and browser UAT → Chas acceptance → separate production approval.

## Sign-in status
Vercel project-team access has been explicitly approved by Chas and verified by Si Aye. GitHub access is available through the existing connector. Third-party Antigravity, Claude, Copilot, Perplexity and Google AI Studio accounts are **not** confirmed installed or connected.
