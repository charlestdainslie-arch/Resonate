# M1 — Baseline, SHA reconciliation and approved-demo identification

**Date:** 14 November 2026
**From:** Deep (independent QA)
**To:** Chas, Si Aye, Claude (cc)
**Sprint:** M1 gate. Priority 1, stack first.
**Status:** Reconciliation complete. No code changed, no deploy, no spend.

---

## 1. Verdict

**There is no divergence to reconcile. The founder-approved living demo, the code that was released to `main`, and the current development branch all carry byte-identical application code.**

Every commit after the last app change touches only documentation, tests or `.vercelignore`. The directive's fear — "do not overwrite approved behaviour with an older or incomplete release" — **is not a live hazard in the current tree**.

It *is* a live hazard in this clone's view of `main`, for a reason given in §4.

---

## 2. The reconciliation

| Layer | SHA | Date | What it changed | App code |
|---|---|---|---|---|
| **Explicit founder pass** — *"UAT PASSED … all great, love it, pass"* | **`c4e8bf6`** | 11 Nov | light into app pages + K improvements | **approved** |
| Approved increments — pace fixes, layered clarifiers, 11 Nov Relationship UAT | `876f0aa`, `fdc56b6`, `ea4ca9f`, `4c3f86d`, **`70021e0`** | 11 Nov | app behaviour, each Chas-approved | **last app change** |
| Release prep | `7d9ca91` | 12 Nov | `.vercelignore` only, 1 file, +27 | **identical** |
| Board update | `56a42cd` | 12 Nov | `audit/TEAM_STATUS.md` only | **identical** |
| Deep's files collected | **`66256d6`** (branch HEAD) | 12 Nov | 4 audit files only | **identical** |
| `main` after PR #52 | `7d9ca91` | 12 Nov | as above | **identical** |

**Proof of identity:** `git diff --name-only 70021e0 66256d6` returns **6 files, none of them `.js`, `.css` or `.html`** — `.vercelignore` and five markdown files. Since `7d9ca91` is `70021e0` + `.vercelignore`, and `66256d6` is `7d9ca91` + docs, the application is the same at all three points.

**Conclusion:** `c4e8bf6` is the SHA Chas explicitly passed. `70021e0` is the same application plus separately-approved fixes, and is the code that shipped. **The approved living demo = app code at `70021e0` = app code at `66256d6`.**

---

## 3. Two corrections to the record, both mine to make

**3.1 — The 390 px clipping finding is withdrawn.** `audit/TEAM_STATUS.md` records *"390 px clipping not reproduced in phone emulation"*. That is the correct outcome, and it matches the caveat I put in `F` §"What I am not claiming": desktop Chrome at a 390 px window is not device emulation, and a wider fallback font in headless can produce exactly that cut edge. My render was real; my inference was wrong. **I do not want `F` standing as an open defect.** The suggested acceptance test — no element's right edge exceeds `clientWidth` at 360/390/412 — is still worth having, but as insurance, not as a fix for a confirmed bug.

**3.2 — The release verification needs pinning to the withdrawn state.** `E` verified the private paths on 12 Nov, before Vercel Authentication was enabled across all deployments. That verification is still true of the deployment it tested, but it no longer describes the public posture. Since then every URL returns **401 Protected deployment** from a cookieless client (verified 12 Nov). `E` is historical, not current.

---

## 4. The one real reconciliation hazard

```
$ git config --get-all remote.origin.fetch
+refs/heads/claude/narration-connected:refs/remotes/origin/claude/narration-connected
+refs/heads/claude/uat-thread-fixes:refs/remotes/origin/claude/uat-thread-fixes
```

**`main` is not fetched.** So in this clone:

| Ref | SHA | Date |
|---|---|---|
| `origin/main` | **`8d12cc6`** | **24 September** |
| actual `main` (per board, and `7d9ca91` is present locally) | `7d9ca91` | 12 Nov |

Anyone — or any agent — reading `origin/main` here sees **the September build**, which is precisely the "older, incomplete release" the directive warns against. And there is no local `main` branch at all, so `git checkout main` fails outright.

**Recommended before M2 begins:** add `+refs/heads/main:refs/remotes/origin/main` to the fetch refspec and fetch once. That is a one-line config change and it removes the single most likely way this project gets built on the wrong code.

**Limitation, stated:** this clone has no GitHub credentials, so I cannot confirm `main`'s live state myself. `7d9ca91` being present as a local object and the board recording the merge are the evidence I have; I did not independently verify the remote.

---

## 5. M2 readiness — what "align the card stack" means in numbers

Before M2, four things need agreeing so the test is falsifiable:

1. **Device set.** Which viewports count: 360 (Galaxy S-class), 390, 412, and desktop 1440? A screenshot at each, all five spreads.
2. **Pass condition.** No element's right edge exceeds `clientWidth`; no card overlaps text; every clarifier's label is fully legible; no control sits under another.
3. **The five spreads × two layouts = ten cases**, plus a clarifier-bearing variant of at least the three-card and Celtic.
4. **Baseline images.** Capture the approved demo (`70021e0`) first, so "preserved" is a comparison rather than an opinion.

I can supply the acceptance assertions and review captures. I cannot produce device-accurate captures myself — headless desktop Chrome is what produced the false positive in §3.1, and it should not be the instrument for M2.

---

## 6. Checkpoint (30-minute format)

- **Completed:** M1 reconciliation. Evidence: `70021e0` vs `66256d6` diff = 6 files, no app code; refspec audit; withdrawn `F`; pinned `E` to the pre-protection state. SHA: `66256d6` (head), `70021e0` (app code).
- **Current work / owner:** Claude — M2 card stack alignment. Deep — M1 evidence published; M2 acceptance criteria drafted in §5.
- **Blockers / decisions needed:** (a) fetch refspec for `main` — one-line config, needs someone with credentials; (b) confirm the device set and pass condition in §5 so M2 is testable.
- **Independent QA status:** M1 **PASS** (no divergence). `F` **WITHDRAWN**. `E` **SUPERSEDED** as a current-state claim.
- **Verified progress:** see §7.

---

## 7. Founder update

**RESONATE 58% complete | Stack [not yet aligned — M2 not started] | Current [M2 card stack, five spreads × two layouts] | QA [PASS on M1, PENDING on stack] | Next [add `main` to fetch refspec, then capture baseline at 70021e0].**

Basis for 58%, so it can be challenged: verified complete — app, five spreads, Max with layered clarifiers, light, transcript, PDF naming, release mechanics (now private); outstanding — stack alignment and device UAT (M2–M3), Deliverable C interpretation audit (in progress), D editorial pass (not started), Voice Lab (not started), journal/subscription (logged, not built), launch. **It is my independent estimate, not the team's, and it counts only verified deliverables — not effort.**

— Deep
