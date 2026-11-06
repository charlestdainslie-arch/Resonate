# Test evidence — tested SHA `a667664a8ced36f7e359cdf87dbc985ad7f7c517`

All results below were **run by Claude** in a Linux workspace (headless Chromium via Playwright). **None has been independently reproduced yet.**

| | |
|---|---|
| Tested SHA | `a667664a8ced36f7e359cdf87dbc985ad7f7c517` (uncommitted non-audit changes at run time: 0) |
| Node / Playwright | v22.23.4 / 1.63.0 |
| OS | Linux 6.18.44-fc-v242 |
| Run (UTC) | 2026-11-06T01:42:48Z → 2026-11-06T01:57:09Z |
| Raw logs | `test-run-a667664/<suite>.log`, table `summary.tsv` |

**Syntax checks (CI step):** 11/11 files pass `node --check`.

**Suites:** 15/16 exit 0 at this SHA. The one failure (`browser-uat`) is pre-existing and a stale test (finding D4); after its test-only fix at `b3a34c3` it passes **304/304**, so **16/16 suites pass on the final SHA** (details below).

| Suite | Page under test | Exit | Result | Seconds |
|---|---|---|---|---|
| `unit-all` | — (Node, no browser) | 0 | 77/77 pass | 1 |
| `astrology-journey.browser` | index.html | 0 | 48/48 pass | 58 |
| `chas-voice.browser` | index.html + presenter-uat.html | 0 | PASS 7 chas-voice checks (168 lines) | 5 |
| `clarifier-slots.browser` | index.html | 0 | PASS 35 clarifier-slot cases: same size and place before and after the second clarifier (5 spreads, 5 widths) | 59 |
| `coverage-gaps.browser` | index.html | 0 | PASS 37 coverage-gap checks: Learn search/filter, card detail bookmark/tabs, reading cards, astrology expander | 30 |
| `golden-thread-connector.browser` | golden-thread-connector/demo.html | 0 | 27/27 pass | 13 |
| `navigation-a11y.browser` | index.html | 0 | PASS navigation, Back button, menu keyboard, focus and touch-target checks (5 widths) | 15 |
| `page-end-nav.browser` | index.html | 0 | PASS 9 end-of-page navigation checks (reading and Journal, phone) | 10 |
| `presenter.browser` | index.html + presenter-uat.html | 0 | PASS 51 presenter checks (silent until Play, faithful narration, controls, demo labelling, 4 widths) | 199 |
| `reduced-motion-headings.browser` | index.html | 0 | PASS reduced-motion + heading-wrap browser checks (8 widths x 2 motion prefs) | 83 |
| `reversed-clarifier-turn.browser` *(new, this audit)* | index.html + presenter-uat.html | 0 | 4/4 pass | 44 |
| `spread-layout-with-thread.browser` *(new, this audit)* | index.html + presenter-uat.html | 0 | 6/6 pass | 6 |
| `spread-parity.browser` | index.html | 0 | All spread parity checks PASS (15 checks × 5 spreads) | 167 |
| `teaching-rules.browser` | index.html | 0 | PASS 9 teaching-rule checks | 15 |
| `uat-round1.browser` | index.html | 0 | PASS UAT round 1: sign-and-year form, bad-year recovery, Calculate feedback, Journal return (3 phone sizes) | 10 |
| `browser-uat` | index.html | 1 | FAIL 1920 no-preference: locator.click: Timeout 30000ms exceeded. | 146 |

## `browser-uat`: the one failure, explained

- At `a667664` it exited 1: **74 pass, then a 30 s timeout on `#primaryClarifierAction` in all 16 configurations** (`browser-uat.log`).
- **Pre-existing:** the untouched candidate `4c37890` fails identically (`browser-uat.at-4c37890-baseline.log`).
- **Cause (stale test, not an app defect):** the suite (28 Oct) presses the clarifier button twice expecting two clarifiers on every card. Since Chas's clarifier rule (31 Oct) that needs Major Arcana cards; on an ordinary draw the button becomes "Save to Journal". The other suites were updated then to deal Majors first (`tests/helpers/majors-first.cjs`); this one was missed.
- **Fixed** in `b3a34c35f5a6991554a385cef7a835827e6d7f94` (test file only; `git diff --stat a667664 b3a34c3 -- . ':!audit'` shows just `tests/browser-uat.cjs`): **304 pass, 0 fail, 16 configurations** (`browser-uat.at-b3a34c3.log`).

**Final SHA `b3a34c3`:** app code is identical to `a667664`, so every result above applies to it; `browser-uat` was re-run on it as shown. The three sample readings were generated on `b3a34c3`.

## How to reproduce

Prerequisites: Git, Node 22, and Playwright with Chromium.

```bash
git clone -b claude/uat-all-in-one https://github.com/charlestdainslie-arch/resonate && cd resonate
git checkout b3a34c35f5a6991554a385cef7a835827e6d7f94
npm i --no-save playwright pdfjs-dist && npx playwright install chromium
# CI's exact unit step
node --test tests/*.test.cjs
# Everything, with logs and a summary table
bash audit/tools/run-all-tests.sh /tmp/resonate-run
# The three sample readings (seeded; same cards every run; three runs gave identical draws)
node audit/tools/sample-readings.cjs
# The 78-card export
node audit/tools/export-dataset.cjs
```

No test needs network access. Expect timing-sensitive suites (animations) to take ~1 minute each.

## Status by origin

| Origin | What |
|---|---|
| **Run by Claude** | Everything in the table above; the three sample readings; the dataset export |
| **Independently reproduced** | Nothing yet |
| **Not yet executed** | Real devices (Android/iOS), Safari and Firefox, the Vercel preview for this SHA, Chas's recorded-voice path in Max, Seven V / Relationship sample readings |

## Baseline on the handed-over candidate `4c37890` (before the fixes)

- Unit: **74/77**; 3 failed in `visible-clarifier.test.cjs` (`orientCards is not defined`, test harness; finding D3).
- Browser (partial run, stopped by my own per-suite time cap during `spread-parity`): astrology-journey, chas-voice, clarifier-slots, coverage-gaps, golden-thread-connector (27/27), navigation-a11y, page-end-nav, presenter (51), reduced-motion-headings all exit 0. Note `clarifier-slots` passed there only because defect D1 made reversed clarifiers finish upright.
