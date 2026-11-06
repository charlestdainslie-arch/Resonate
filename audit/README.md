# RESONATE — independent audit evidence package (Issue #49)

Prepared by Claude, 6 Nov 2026, for independent review by Deep. Chas makes all product decisions. **No production change, merge, public release or paid service was involved.**

| | |
|---|---|
| Repository / branch | `charlestdainslie-arch/Resonate` · `claude/uat-all-in-one` |
| Candidate handed over | `4c37890eccbe9f356ae283609be452a74824fc9e` |
| **Final SHA (tested)** | **`b3a34c35f5a6991554a385cef7a835827e6d7f94`** |
| Changes from candidate (outside `audit/`) | `reversals.css`, `reading-stage.css` (defects D1, D2) and five test files (two new regression tests, three corrected). Nothing else. `git diff --stat 4c37890 b3a34c3 -- . ':!audit'` |
| Full test run | on `a667664` (app code identical to `b3a34c3`); `browser-uat` re-run on `b3a34c3` |
| Sample readings | generated on `b3a34c3` |

## Read in this order

1. **`FINDINGS.md`** — defects found and fixed (D1–D4), open findings needing a decision (Golden Thread, text, data, clarifiers), and everything still **UNKNOWN**.
2. **`builds/TEST_EVIDENCE.md`** — every suite, which page it tests, exact results, how to reproduce; raw logs in `builds/test-run-a667664/`.
3. **`samples/SAMPLES.md`** — three readings (S1 One-card, S2 Three-card, S3 Celtic Cross), each with the same draw in the written reading, Max's transcript, the real PDF and Golden Thread screenshots, plus automatic cross-checks.
4. **`GOLDEN_THREAD.md`** — what the thread connects; **decorative, not meaning-driven**.
5. **`CLARIFIER_RULE.md`** — Chas's teaching rule as implemented; attribution and the unimplemented forced non-Major draw.
6. **`sources/DATASET_NOTES.md`** + `sources/cards-78.json` / `.csv` — the full 78-card dataset with provenance and correspondence analysis.

## Headline results

- **16/16 test suites pass on the final SHA** (77/77 unit; 15 browser suites), after two app fixes and two test fixes, each explained.
- **S1, S2, S3:** every drawn card appears with the same orientation in the page, the PDF and Max's script; every Max quote is word-for-word in the page and the PDF (5/5, 10/10, 26/26); the app's own clarifier check finds no violation.
- **Golden Thread is decorative.** It joins cards in position order and each clarifier to its parent; it uses no card meaning or orientation. No meaning-driven connection is claimed.
- **Provenance gaps are open:** no citation for any interpretive text or correspondence; image source recorded, its licence not verified.

## Status words

**PASS** here always means *a test run by Claude passed*. **Nothing has been independently reproduced yet.** UNKNOWN items are listed in `FINDINGS.md` and must not be read as PASS.

## Verify the files

```bash
cd audit && sha256sum -c MANIFEST.sha256      # every file in this package, with its SHA-256
```

To reproduce the results themselves, see `builds/TEST_EVIDENCE.md → How to reproduce`.

## Folder map

```
audit/
  README.md  FINDINGS.md  GOLDEN_THREAD.md  CLARIFIER_RULE.md  MANIFEST.sha256
  sources/   cards-78.json  cards-78.csv  correspondence-analysis.json  DATASET_NOTES.md
  samples/   SAMPLES.md  guidance/  three/  celtic/        (S1, S2, S3)
  builds/    TEST_EVIDENCE.md  test-run-a667664/           (logs, summary.tsv, environment.txt)
  tools/     export-dataset.cjs  sample-readings.cjs  run-all-tests.sh  test-evidence.cjs  package.sh
```
