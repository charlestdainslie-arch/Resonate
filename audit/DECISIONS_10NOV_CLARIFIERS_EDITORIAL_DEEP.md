# RESONATE — Chas-approved decisions · 10 November 2026

**Authority:** Chas (founder, final creative/product/UAT authority).
**Evidence:** Explicit approval relayed directly to Si Aye on 10 Nov 2026.
**Status:** APPROVED BY CHAS, not an implementation PASS.
**Branch:** `claude/uat-thread-fixes`. No production merge/deployment/spending authorised.

## DEC-10NOV-01 — Clarifier freedom
**APPROVED:** A seeker may skip a *due* clarifier, pass to the next card or finish a reading **without warning**. Never force a draw, block completion or issue a warning. Due/optional indicators may still describe the underlying teaching rule without requiring action. Max, captions and the Golden Thread must only interpret cards actually drawn. Technical `validate()` may check forbidden states; any proposed `outstanding()` is diagnostic only and must not impose a user-facing constraint. Test skipped Major-original first clarifiers, skipped Major-first-clarifier seconds, optional seconds after Minors, and coherent endings.

## DEC-10NOV-02 — Editorial audit timing
**APPROVED:** Audit the full 78-card meanings and interpretation findings **before** conducting the editorial pass on Max's vocabulary, register and delivery. The later pass should be spiritually rich, original, natural UK English, constructive but truthful about challenging cards; avoid forced optimism, fatalism, and unsupported certainty. Astrology/numerology are symbolic systems and should be sourced and integrated carefully.

## DEC-10NOV-03 — Deep research order
**APPROVED:** B → C → D:
- **B:** Research plan: sources, Mel's Aries readings as examples of interpretation technique (do not copy), tarot correspondences, astrology, numerology and evidence method.
- **C:** Independent interpretation findings: the corpus, card neighbours, positions, reversals, clarifiers, Clarity cards and Golden Thread; source-linked examples pinned to SHA.
- **D:** Editorial recommendations, after C, including Max's spoken language, constructive shadow/renewal framing and content structure.

## Coordination and access
- Claude: engineering/tests, technical checkpoints and safe delivery into the laptop's local clone.
- Deep: independent read-only research and evaluation; maintain `audit/DEEP_SESSION_STATE.md` for continuity.
- Si Aye: coordination and reconciliation.
- Chas alone closes product decisions.
- Deep reported GitHub/Slack/Vercel inaccessible but his local clone at `C:\Users\charl\Documents\resonate-voice` is readable. Claude should make sure this decision file exists in the exact local copy Deep reads, without overwriting active changes. Verify the file's contents there rather than assuming a GitHub push updates local files. No secrets/tokens needed.

These decisions supersede pending questions on these three matters only. Other UAT/QA items remain open.
