# M1 — Baseline and branch/SHA reconciliation (14 Nov 2026)

**Owner:** Claude (implementation). **Independent QA:** Deep — PENDING. **Ledger:** Si Aye.
**Method:** read-only. `git fetch` of every remote branch, `git ls-remote`, ancestry and diff checks,
Vercel deployment list (team `charlestdainslie-6956`, project `resonate`). No code, deployment or setting changed.

## 1. Approved demo — identified

| Item | SHA | Evidence |
|---|---|---|
| **Founder-approved living demo** | **`2a2b4e5`** (`2a2b4e51ec0eb0761b924b6dbfbd998d42393feb`) | Remote branch `demo/chas-approved-max-12nov` points here. App code last changed at `70021e0`; `427dba1`, `2a2b4e5` are audit-only. Contains every row of "Passed UAT" in `TEAM_STATUS.md` (Golden Thread light / kiss `c4e8bf6`→`fdc56b6`, Max transcript boxes, clarifiers in layers `ea4ca9f`/`4c3f86d`/`70021e0`). Preview deployment: `resonate-i0oebl96u` (READY). |
| Production (`main`, `resonatetarot.app`) | `7d9ca91` | = `2a2b4e5` + one file: `.vercelignore` (27 lines). Vercel production deployment `dpl_8CCVqzSAuBidqhoqRWxzUt4yKQc7`, READY, rollback candidate. |
| Test branch `claude/uat-thread-fixes` | `66256d6` | = `7d9ca91` + 2 audit-only commits (Deep's D/E/F). Preview READY. |
| This sprint branch `claude/sprint-14nov-stack` | from `66256d6` | Created 14 Nov for M1–M5 work. |

**Conclusion:** demo, production and test branch carry **identical app code**. The only non-audit difference is
`.vercelignore`, which hides `presenter-uat.html` (Max) and the demo pages from the public site. So Max Chasroom
synchronisation is approved but **not public** — by design.

**Founder confirmation:** Chas confirmed on 14 Nov, in the Claude session: `demo/chas-approved-max-12nov`
(`2a2b4e5`) is the living demo he approved ("Yes, that's it").

**Independent cross-check (Deep, `2026-11-14-M1-DEEP-reconciliation.md`, Deep's outbox, not yet collected):** Deep
reached the same verdict independently. Chas's explicit pass was on `c4e8bf6`; the separately approved increments
up to `70021e0` are the last app change; app code is identical at `70021e0`, `2a2b4e5`, `7d9ca91` and `66256d6`.
Verified again here: `git diff --name-only 70021e0 2a2b4e5` = two audit markdown files only. Deep: M1 **PASS**.

## 2. Other branches — regression risk

No development branch contains app work newer than the approved demo. Every other branch with commits not in `main`
is **older** (latest 7 Nov) and must not be merged over it:

- `claude/uat-option-b` (7 Nov, FREEZE 4dc4df5), `claude/narration-connected` (3 Nov, voice lab),
  `claude/uat-*` evidence branches (6–8 Nov) — superseded.
- `claude/golden-thread-live-reading`, `deep/golden-thread-connector-phase-a` (29 Oct, 9 commits each) — the older
  strand connector, replaced by the kiss light.
- `release/v0.9.1-stable`, `release-0.9.1-*`, `dev/*-v0.10.x`, `develop/v1.0-base`, `feature/live-astrology-prelude`
  (Sep–23 Oct) — **older releases; overwriting risk named in the directive.**
- Local worktree `C:/Users/charl/Documents/resonate-uat` on `uat-local` `4c37890` (4 Nov) — an ancestor of the
  demo, nothing unique.

No tags exist on the remote. `2a2b4e5` is tagged locally as `approved/living-demo-12nov` (14 Nov, after Chas's
confirmation); pushing the tag waits on Chas.

**Fetch hazard fixed (Deep §4):** this clone fetched only two branches, so `origin/main` showed the September build
`8d12cc6`. `+refs/heads/main:refs/remotes/origin/main` added to `remote.origin.fetch` on 14 Nov; `origin/main` now
reads `7d9ca91`.

## 2a. Public access — the board is out of date

Checked 14 Nov with a cookieless client: `resonatetarot.app`, `www.resonatetarot.app` and
`/presenter-uat.html` all redirect to `vercel.com/login` (Vercel Authentication). Production is **not public**,
though `TEAM_STATUS.md` still says "Live". This matches Deep's note that its 12 Nov release check `E` is historical.
It suits the directive (no public release); opening it up is Chas's decision and is not proposed here.

## 3. M2 preparation — card stack

The draw page layout is set by a cascade of 10 stylesheets loaded in this order by `index.html`:
`base_styles` → `uat` → `release09` → `reading-stage` → … → `uat-fixes` → `spread-parity` → `teaching-rules` →
`reversals` → `deck-theatre` → `spread-1-parity` → `golden-thread-kiss`.

Spread/clarifier rules per file: `uat-fixes.css` 90 spread selectors / 19 clarifier; `spread-parity.css` 25 / 35;
`reading-stage.css` 19; `release09.css` 18 (base grids: `.spread-1`, `.spread-3`, `.spread-7`; Celtic via
`.layout-celtic`); `spread-1-parity.css` 18 / 11. Breakpoints in use: 390, 520, 680, 760/761, 1000, 1099/1100.

M2 plan: measure each of the five spreads (One-card, Past-Present-Future, Seven-card V, Relationship, Celtic Cross)
at 360/390/412 px (Samsung) and 1280/1440 px with 0, 1 and 2 clarifiers per position; record clipping, overlap,
gaps and clarifier position against the demo build; fix in one place (`spread-parity.css`) rather than adding a
further override layer; re-run `tests/*.browser.cjs` and the kiss order check after every change.

**M2 acceptance criteria (adopting Deep's §5):** viewports 360, 390, 412 (device emulation, not a narrow desktop
window, because that gave the false positive in Deep's `F`) and 1440. Pass = no element's right edge beyond
`clientWidth`; no card over text; every clarifier label fully legible; no control under another. Baseline captured
from the approved demo first, so "preserved" is a comparison, not an opinion. Deep's `F` (390 px clipping) is
withdrawn by Deep.

## 4. Checkpoint

**Progress basis:** five sprint milestones, 20% each, counted only when independently verified. M1 = founder
confirmed + Deep PASS → 20%. Deep's 58% is a whole-product estimate on a different basis; Si Aye to reconcile
which one the founder line uses.

RESONATE 20% complete | Stack M1 gate passed, M2 not started | Current M2 baseline capture at `2a2b4e5` |
QA PASS (M1) | Next capture five spreads × four viewports, then align.
