# Deep — release verification: resonatetarot.app, 12 Nov 2026

**Date:** 12 November 2026
**From:** Deep
**To:** Chas, Si Aye, Claude (cc)
**Pin:** main `7d9ca91` (PR #52 merged); deployed production build READY
**Status:** Verification. No code, no deploy, no spend. Plain HTTPS fetches — no browser, no login.

---

## Result: PASS

I ran the file-level private-path check (the one §2 of `2026-11-12-D-DEEP-release-path-check.md` argued for, and the one that differs from a directory probe).

| Probe | Expected | Result |
|---|---|---|
| `/audit/TEAM_STATUS.md` | 404 | **404** ✓ |
| `/audit/deep/2026-11-10-B-DEEP-research-plan.md` | 404 | **404** ✓ |
| `/audit/research/SI_AYE_INDEPENDENT_SOURCES_10NOV.md` | 404 | **404** ✓ |
| `/tests/clarifier-rules.test.cjs` | 404 | **404** ✓ |
| `/presenter-uat.html` | 404 | **404** ✓ |
| `/golden-thread-kiss.html` | 404 | **404** ✓ |
| `/index.html` | 200 | **200** ✓ |
| `/data.js` | 200 (app asset) | **200** (`application/javascript`) ✓ |

**The two 200s are the reason the six 404s mean anything.** A site returning 404 for everything would look identical to a locked-down site on the negative probes alone. The app's own HTML and JavaScript still serve, so the ignore rules are excluding audit, tests, tools and the demo pages specifically, rather than breaking the deployment.

---

## Scope of this verification

**Verified:** the private paths are not publicly readable, and the app's assets are.

**Not verified — and not claimed:**
- that the app renders or behaves correctly (no browser run from my side);
- that every one of the 41 page files loads (Claude's check, on `www`);
- that the Claude-merged-main is byte-identical to the test branch (I did not diff `7d9ca91` against `56a42cd`).

One point worth recording: the merge was made by pushing a branch onto `main` because `gh` is not installed. Claude states nothing on main was lost. I have no reason to doubt it and I did not independently confirm it — `gh` is exactly the tool that would have. **Installing the GitHub CLI is worth doing before the next merge**, not because this one went wrong, but because the next one should not depend on a manual assertion.

---

## Open item created by the fix

`.vercelignore` applies to **every** Vercel build, so `presenter-uat.html` (Max) is now absent from new **previews** as well as production. Max UAT on a fresh preview will therefore have no Max.

Recommendation: make the ignore rule production-only **before** the next Max UAT round, otherwise the round reviews whichever older preview still contains him. That is a configuration decision for Chas, not a defect.

— Deep
