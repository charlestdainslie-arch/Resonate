# RESONATE — Deep independent review brief: readings first, motion second

**Date:** 10 November 2026
**From:** Si Aye, coordinating at Chas's request
**To:** Deep (lead reviewer); Claude (implementation and local-sync support)
**Status:** Research and recommendations only. No code changes, merges, deployment or spending.
**Authority:** Chas asks Deep to inspect the readings and also contribute animation ideas. His previous approvals in audit/DECISIONS_10NOV_CLARIFIERS_EDITORIAL_DEEP.md and audit/DECISIONS_10NOV_DEEP_B_RESEARCH.md remain binding.
**Base:** Pin every finding to the exact app SHA reviewed (last known app change 274332f; branch HEAD may contain later docs).

## Task 1 — Deliverable C: independent reading-quality audit (priority)
Use the local clone and deterministic QA samples. Inspect data.js (all 78), clarifier-reading.js, golden-thread-live.js, app.js, presenter.js, rules and output samples where available. Review:
1. Meaning accuracy, originality and depth; differentiate tradition, modern practice and independent interpretation. Audit the five bespoke meanings *as provisional references*, not automatically superior.
2. Redundancy: test your preliminary observation that the other 73 cards repeat psychological/Wabi-sabi text and use formulaic numerology. Quote precise lines/card IDs/counts, separate verified facts from hypotheses.
3. Card position, orientation/reversal, adjacent-card relationships, clarifiers, optional second after a Minor and Clarity cases. Check the seeker's APPROVED freedom to skip due clarifiers *without a warning*, and that undrawn cards are not interpreted or narrated.
4. Golden Thread: does it make a genuine card-to-card synthesis or a keyword list? Trace 1-card, 3-card, 7-card and Celtic Cross samples (add relationship if evidence permits), both challenging (Tower/Three of Swords etc.) and undramatic Minors.
5. Astrology, numerology, Jungian symbolism; optional Qabalistic layer. Avoid metaphysical prediction or diagnoses. Assess which distinctions add useful meaning rather than padding.
6. Map the corpus fields to what the engine and Max actually use. Evaluate Max's current wording, *but save comprehensive spoken-register rewriting for after Deliverable C*, per Chas's approval.

Produce a concise, source- and SHA-linked findings table: severity; evidence (file/line, sample); user impact; suggestion; verified/unknown. Do not copy Mel's content; if video inaccessible, flag it and use source-available material without fabricated timestamps.

## Task 2 — Motion / full-reading UX critique (parallel advisory, not a substitute for C)
Chas approves the shuffle, Max's existing Golden Thread animation and the tested 3-card experience. **Protect these unchanged.** His redesign request concerns the **full reading page below Max**: tangled card layout, dense text, clarifiers difficult to see.
Inspect existing HTML/CSS/JS and any local served build. Suggest an animation/storyboard proposal for:
- position-stable card reveal and focal highlighting;
- visually attached original + clarifier 1 + optional clarifier 2 + Clarity (solitaire-style overlaps only where labels remain legible);
- connections between neighbouring cards and across spread positions, without artificial magical causality;
- elegant transitions between boxed/sectioned interpretation, Golden Thread, deeper symbolic layers and reflective close;
- reduced-motion, keyboard, readable Samsung phone layout, no clipped cards or buried controls.

Offer 2 or 3 small motion concepts (purpose, sequence, timing, fallback, testable acceptance), with sketch or static description if no rendering tool available. Avoid glitter for its own sake. Claude owns prototypes and implementation after Chas approves the design.

## Collaboration / session continuity
Deep cannot directly reach GitHub/Slack/Vercel; Claude should safely sync this audit-only brief into the local clone at C:\Users\charl\Documents\resonate-voice, checking dirty tree first, and show Deep exact path. Deep starts each session with decision files and audit/DEEP_SESSION_STATE.md (create in separate review workspace if absent), and ends with findings, evidence, open questions and restart instructions. No assumption that a GitHub commit has magically updated the laptop.

**First response requested:** confirm local receipt and pin examined SHA, identify first three reading cases to review, and give an initial animation critique grounded in existing source, marking what could not be inspected. Do not hold C findings waiting for animation work.
