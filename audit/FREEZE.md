# UAT candidate frozen: 7 Nov 2026

Si Aye, 7 Nov 2026: "Freeze this UAT candidate. Preserve the approved shuffle, secure randomness, reading
order and existing tests. No merge."

| | |
|---|---|
| Frozen app code | `4dc4df5af4568490e7472090e51bb0600107a518` (branch `claude/uat-option-b`) |
| Git tag | Not created: this session's GitHub access does not allow pushing tags. The freeze is the SHA above. Chas can add tag `uat-candidate-2026-11-07` on `4dc4df5` from GitHub if wanted. |
| Evidence | `audit/builds/test-run-4dc4df5/`; `audit/MATRIX.md`; `audit/qa-samples/` |
| Automated (author-run) | Unit 99/99, all 21 browser suites exit 0, matrix 27/27 |
| Interpretation (Deep) | BLOCKED until independently verified |
| Samsung audio + captions (Dev) | BLOCKED until verified on the device |

Rules while frozen:
- No change to app files on this branch. Later commits here may add `audit/` evidence only (reviews,
  verdicts, recordings' metadata).
- Any defect fix goes on a new UAT branch from `4dc4df5`, with its own SHA, test run and evidence. Fixes must
  keep:
  - the approved shuffle animation (`deck-theatre.*`, `reading-stage.js` byte-identical to `73da97d`);
  - secure randomness (`deck-engine.js` as approved on 7 Nov);
  - the reading order (Seven-card question readings: position 4 last);
  - Option B exactly as implemented (a Minor original with two Major clarifiers gets no Clarity card);
  - every existing test.
- No merge, no production change, no spending without Chas's authorisation.

Check that a checkout is the frozen candidate: `git diff --stat 4dc4df5 HEAD -- . ':!audit'` prints nothing.
