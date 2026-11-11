# RESONATE — team status board

**One page for Chas, Si Aye, Deep and Claude.** Updated by Claude when work lands. If it is not in the repository, it
did not happen. Last updated: 11 November 2026, branch `claude/uat-thread-fixes` at `70021e0`.

## How we work
- **Chas** decides. Tests on Samsung and laptop. Only Chas closes a decision.
- **Si Aye** (ChatGPT) records decisions in `audit/DECISIONS_*`. Reaches the team through Chas, by paste or repo.
- **Deep** (DeepSeek, on the laptop) audits and researches. Writes its own outbox; Claude collects to `audit/deep/` on
  Chas's "collect" and replies in Deep's inbox. Setting up headless Chrome (11 Nov) so it can test in a browser.
- **Claude** builds, tests at phone and laptop size on the Vercel preview, commits and pushes the test branch, and
  gives Chas share links. Never merges to production without Chas.
- **Care principle (11 Nov):** `audit/PRINCIPLE_CARE_FOR_VULNERABLE_SEEKERS_11NOV.md` governs all new wording.

## Passed UAT on the test branch (not in production)
| What | Where | Commit |
|---|---|---|
| Golden Thread light ("Tinkerbell"): kisses each card, clarifier and Clarity card; follows Max | index.html, presenter-uat.html | c4e8bf6 → 876f0aa, fdc56b6 |
| Calm written reading: map, Part n of N, step boxes, folded detail, Next | index.html, presenter-uat.html | 49ebc63 → c4e8bf6 |
| Max transcript in headed boxes | presenter-uat.html | 92ea204 |
| "Here is your second clarifier for the Past, …" wording | Max | 665af00, 011b905 |
| Finish reading carries on from where Max is | Max | 665af00, d0565bd |
| PDF names: spread + draw time to the second | app | 974a3a7, 011b905 |
| Light listens to app events (Deep's H tidy-up), teardown, duplicate guard | app + light | fe1a831, 64a6079 |
| Pace: arrive within 6 px; shorter follow wait | light | 876f0aa, fdc56b6 |
| Clarifiers in layers (reading page and Max) | app, Max | ea4ca9f, 4c3f86d, 70021e0 |

## Waiting on Chas (decisions)
1. **Production release** of the test branch.
2. **Voice Lab** (Deep's V, §8): licence choice; test or record first; who runs the model; consent and disclosure policy.
3. **Language review** for vulnerable seekers: scope and timing.
4. **Vercel Pro options:** Speed Insights (real-phone performance); preview comments; protection bypass for Deep's
   headless browser. The bypass needs a secret kept outside Deep's OneDrive folder.
5. **Public access before launch.** Vercel deployment protection is "all except custom domains", and the project has
   only `.vercel.app` addresses (resonate-tau.vercel.app and others), so even production appears to sit behind a
   Vercel login (checked read-only, 11 Nov). That is fine while testing. Before clients come, it needs a custom
   domain, or the protection setting changed for production. Not changed: Chas's call.

## Open work
| Item | Owner | Status |
|---|---|---|
| Test on Chas's Samsung: pace on long spreads, light in step with Max, Max's floating Clarify | Chas | open |
| Browser checks of the light and layout, once headless Chrome works | Deep | starting |
| Deliverable C (interpretation audit) and D (editorial pass, applying the care principle) | Deep | in progress |
| Issue #51 independent tarot research (all four) | all | in progress |
| `tests/draw-notify.test.cjs` run (needs Node) | whoever has Node | not run |
| Requirements logged in Slack, not built: journal 30-day expiry, cancellation keeps paid access, privacy/RLS, real d10 | Chas to prioritise | logged |

## Deep's files collected
`audit/deep/`: A, B, G, K, M, R, S, V (10 Nov); T, H, P (11 Nov).
