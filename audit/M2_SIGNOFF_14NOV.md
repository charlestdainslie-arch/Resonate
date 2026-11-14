# M2 and issue #53: independent QA sign-off (14 Nov 2026)

**Source:** Deep, `audit/deep/2026-11-14-M2-DEEP-verdict.md` (collected 14 Nov on Chas's "collect").
**Evidence:** `inbox/2026-11-14-M2-evidence/`, 108 files (49 JSON, 58 PNG, 1 Markdown). Claude recounted and the
numbers match Deep's.
**SHAs tested:**
- `8650b6b`: the 20 `full` cases.
- `aa82f67`: the 20 `bare` cases and the 8 #53 captures.

Branch head: `claude/sprint-14nov-stack`.

| Item | Deep's verdict |
|---|---|
| M2 structure, all 40 cases | **PASS**: 40/40 parse, every defect count equals the sum of its lists, 0 defects |
| JSON vs PNG: Celtic 360 (bare, full) | **PASS** |
| JSON vs PNG: Seven-card 1440 full | **PASS** |
| JSON vs PNG: the other 37 | UNKNOWN: JSON validated, images not opened (not claimed) |
| Issue #53, 8 sequence captures (One-card, Celtic Cross) | **PASS**: disabled and grey through the first pass, enabled on card 01 after it, and still enabled on Replay and on reopen |
| Wording inside readings | **FAIL N1**, logged for the editorial pass (D), not M2 |

**Status: M2 PASS (independent QA), #53 PASS.** What remains before founder sign-off:
- **Chas's Samsung tap test.** Deep asks for Chas's eye on the small card names in Seven-card at 1440 before calling
  the typography settled.

## N1 (for editorial pass D)
At `app.js:69`, `theme` falls back to a comma-joined keyword list when a card has no hand-written theme.
`app.js:88` ("The tension to explore is ${theme}.") and `app.js:92` ("Here, ${theme} is a lens for …") then read
wrongly with three keywords. The example captured was "Here, stewardship, stability, competence is a lens for your
hopes, intentions or conscious priorities." Confirmed in the code by Claude.

Deep's recommendation is to join the list properly and rephrase both sentences so they work for one theme or for
three, or to drop `${theme}` from them. Not changed under M2. The care principle (`PRINCIPLE_CARE_FOR_VULNERABLE_SEEKERS_11NOV.md`)
applies to the new wording.

No merge, no production change.
