# Follow-up verification — Issue #49, 6 Nov 2026 (14:00–14:45 AEDT)

Answers Si Aye's two follow-up requests (14:09 and 14:11). **Done by Claude.** Where a check was re-done with separate tools, that is stated, but it is still Claude's work: **independent verification is Deep's.** No application code was changed or re-run for this; nothing was merged, deployed or bought.

**Commit examined: `a4bbc67618f56eb4f8ec8a76f86437cdb0c5eb01`** (branch head before this note; = `b3a34c3` + `audit/` only).

## 1. Manifest: 92 entries, not 182 — `verification/01-manifest.txt`
- `audit/MANIFEST.sha256` has **92 lines = 92 entries**, 92 distinct paths, 0 blank lines, 0 carriage returns; every line is `<64-hex SHA-256><two spaces><path>`. File SHA-256 `da7702ee6c46fab5812f485d5f3e03152364d00b55ea884bbe8370970fac29b4`; the copy GitHub serves is byte-identical.
- **Where 182 comes from:** the entries are 98–127 characters long. **Wrapped at 80 columns the file displays as exactly 182 lines** (`fold -w 80 MANIFEST.sha256 | wc -l` = 182). It is a display count, not an entry count.
- **Checksum result: 92/92 OK**, from a clean `git archive` of `a4bbc67` and from the ZIP. No file listed but missing, none present but unlisted. (The ZIP lists 102 entries: 93 files + 9 folders.)
- Re-check: `cd audit && sha256sum -c MANIFEST.sha256 | grep -c ': OK'` → 92. Count entries with `grep -cE '^[0-9a-f]{64}  ' MANIFEST.sha256`, not by eye.

## 2. a667664 vs b3a34c3: application code identical — `verification/02-diff-a667664-b3a34c3.txt`
- `git diff --name-status a667664 b3a34c3` lists 13 files: **12 added under `audit/`** and **1 modified test, `tests/browser-uat.cjs`** (one line: deal Majors first).
- Every file the app serves (138 files: HTML, JS, CSS, data, images, vendor; everything except `tests/`, `audit/`, `tools/`, `.github/`, `*.md`) has the **same Git blob in both commits; 0 differ**, and the file set is the same.

## 3. One complete run at one SHA — `builds/test-run-a4bbc67/`
**The distinction stands:** the earlier run on `a667664` was **15/16** (`browser-uat` failed, stale test), and `browser-uat` passing 304/0 at `b3a34c3` was **a separate later re-run**. Those remain as recorded in `builds/TEST_EVIDENCE.md` and are not combined.

**New, separate full run:** a fresh detached checkout of `a4bbc67` (0 local changes before and after the run), every suite in one invocation of `audit/tools/run-all-tests.sh`, logs written outside the checkout and copied in byte-for-byte. Unedited logs and their SHA-256s: `builds/test-run-a4bbc67/*.log`, `summary.tsv`, `environment.txt`, `LOGS.sha256`. Run 03:10:09Z → 03:25:12Z UTC, Node v22.23.4, Playwright 1.63.0, headless Chromium.

**Syntax:** 11/11 `node --check` exit 0.

| Suite | Exit | Result (from the log) | Seconds | Unedited log |
|---|---|---|---|---|
| `unit-all` | 0 | 77/77 pass | 1 | `builds/test-run-a4bbc67/unit-all.log` |
| `astrology-journey.browser` | 0 | 48/48 pass | 56 | `builds/test-run-a4bbc67/astrology-journey.browser.log` |
| `chas-voice.browser` | 0 | PASS 7 chas-voice checks (168 lines) | 4 | `builds/test-run-a4bbc67/chas-voice.browser.log` |
| `clarifier-slots.browser` | 0 | PASS 35 clarifier-slot cases: same size and place before and after the second clarifier (5 | 60 | `builds/test-run-a4bbc67/clarifier-slots.browser.log` |
| `coverage-gaps.browser` | 0 | PASS 37 coverage-gap checks: Learn search/filter, card detail bookmark/tabs, reading cards | 29 | `builds/test-run-a4bbc67/coverage-gaps.browser.log` |
| `golden-thread-connector.browser` | 0 | 27/27 pass | 14 | `builds/test-run-a4bbc67/golden-thread-connector.browser.log` |
| `navigation-a11y.browser` | 0 | PASS navigation, Back button, menu keyboard, focus and touch-target checks (5 widths) | 15 | `builds/test-run-a4bbc67/navigation-a11y.browser.log` |
| `page-end-nav.browser` | 0 | PASS 9 end-of-page navigation checks (reading and Journal, phone) | 9 | `builds/test-run-a4bbc67/page-end-nav.browser.log` |
| `presenter.browser` | 0 | PASS 51 presenter checks (silent until Play, faithful narration, controls, demo labelling, | 197 | `builds/test-run-a4bbc67/presenter.browser.log` |
| `reduced-motion-headings.browser` | 0 | PASS reduced-motion + heading-wrap checks (8 widths × 2 motion prefs) | 83 | `builds/test-run-a4bbc67/reduced-motion-headings.browser.log` |
| `reversed-clarifier-turn.browser` | 0 | 4/4 pass | 43 | `builds/test-run-a4bbc67/reversed-clarifier-turn.browser.log` |
| `spread-layout-with-thread.browser` | 0 | 6/6 pass | 6 | `builds/test-run-a4bbc67/spread-layout-with-thread.browser.log` |
| `spread-parity.browser` | 0 | All spread parity checks PASS | 159 | `builds/test-run-a4bbc67/spread-parity.browser.log` |
| `teaching-rules.browser` | 0 | PASS 9 teaching-rule checks | 14 | `builds/test-run-a4bbc67/teaching-rules.browser.log` |
| `uat-round1.browser` | 0 | PASS UAT round 1 (3 phone sizes) | 10 | `builds/test-run-a4bbc67/uat-round1.browser.log` |
| `browser-uat` | 0 | RUN 1: 304 PASS, 0 FAIL, 16 configurations | 202 | `builds/test-run-a4bbc67/browser-uat.log` |
**Result: 16/16 suites exit 0 in one run at `a4bbc67`.** Run by Claude; **not independently reproduced.** Re-check the logs: `cd audit/builds/test-run-a4bbc67 && sha256sum -c LOGS.sha256`.

## 4. S2 / S3 cross-channel check with separate tools — `verification/04-*`
Separate from the sample tool: Python instead of JavaScript, **poppler `pdftotext` instead of pdf.js** reading the committed `reading.pdf` directly, and the clarifier rule re-implemented rather than calling the app. Script `verification/crosscheck.py`.
- Per position and per channel (page, PDF, Max): base card + orientation, each clarifier in its slot + orientation, no upright card named "reversed" in its section, and the rule.
- **S2: 33/33 checks pass. All 10 Max quotes are listed individually** with the page line and PDF page where each appears (`04-quote-locations-S2-S3.txt`): **10/10** on the page and in the PDF.
- **S3: 88/88 checks pass. All 26 quotes listed individually: 26/26.** (S1 also re-checked: 16/16, 5/5.)
- **Negative controls** (`04-negative-controls.txt`, recreate with `verification/negative-controls.sh`): a flipped orientation, a wrong clarifier and a one-word change to a Max quote are each caught (8 FAILs, exit 1). The base-card presence check alone does not catch a reversed→upright flip (the upright name is contained in the reversed one); the separate "never named reversed" check does.
- Status words: these are Claude's checks with separate tooling. **Whether S2 and S3 move from partial/pending to verified is Deep's call** after he runs `crosscheck.py` or checks the quote list himself.

## 5. Dataset counts and G5 — `verification/05*`
- **5a, recount** (`05a-dataset-recount.txt`, script `recount.cjs` reads `data.js` directly): 78 cards, ids 0–77, 22 Majors, Wands/Cups/Swords/Pentacles 14 each, 16 courts, all required fields non-empty, Strength VIII, Justice XI, 78/78 image hashes match the deck manifest; committed export identical to `data.js` field-for-field. `text_provenance` and `correspondence_source_citation` are **UNKNOWN for 78/78**; 73 templated.
- **5b, G5 measured** (`05b-g5-crossings.txt` / `.json`, script `g5-crossings.cjs`, re-render `05b-g5-S3-1280-remeasured.png`): S3's recorded draw re-rendered at 1280 px, every strand sampled every 2 px along its real SVG path. **2 of 13 strands cross another card's picture:** Two of Cups → Five of Cups over **Six of Cups** (78 px); Knight of Swords (clarifier of The Sun) → The World over **The Sun** (188 px) and **The Hanged Man** (104 px). **This corrects my earlier example** ("over Hopes and Fears"), now fixed in `FINDINGS.md` G5. **G5 stays OPEN.**

## Still OPEN (unchanged)
- **G5** (above), **provenance** of all card text, numerology and correspondences (UNKNOWN), **image licence** (UNKNOWN), **correspondence system** (Golden Dawn-derived with two undocumented changes).
- **G2 and C1** are product-design decisions for Chas.
- Real devices, Safari/Firefox, Chas's recorded voice, the Vercel preview: not tested.
