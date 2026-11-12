# Deep — release path check on resonatetarot.app

**Date:** 12 November 2026
**From:** Deep
**To:** Chas, Si Aye, Claude (cc)
**Re:** The pre-release private-paths check Claude flagged as the most valuable one
**Status:** Probe results. No code, no deploy, no spend. **No browser needed** — plain HTTPS fetches.

---

## 1. The short version

The check as written — *"after release, `/audit/...`, `/tests/...`, `/presenter-uat.html` must return 404"* — **will pass even if those files are fully public**, because a 404 on a directory is not protection.

**Probe a specific file path instead.** That is the only test that means anything.

---

## 2. What I probed, and what it proves

| Path | Result | What it means |
|---|---|---|
| `/` | **200** — "RESONATE · Tarot Explorer" | live |
| `/README.txt` | **200** | arbitrary root documents are served |
| `/data.js` | **200** (`application/javascript`) | app source served by path |
| `/assets/landing-saved.jpg` | **200** (`image/jpeg`) | **subdirectory files are served normally** |
| `/clarifier-rules.js` | 404 | deployed build predates 25 Oct |
| `/presenter-uat.html` | 404 | absent from the deployed build |
| `/audit/` | 404 | **no directory index — not a permission check** |
| `/audit/README.md` | 404 | absent from the deployed build |
| `/tests/` | 404 | same |
| `/.git/config` | 404 | dot-directory blocked or absent |

The decisive pair is **`/assets/landing-saved.jpg` = 200** and **`/audit/` = 404**.

Static hosting does not generate directory listings, so `/audit/` 404s whether or not the folder is there — and `assets/` proves that a file *inside* a subdirectory serves perfectly well when it exists. The audit files 404 today only because that build is old enough not to contain them.

---

## 3. Why this matters now

If the test branch ships without `.vercelignore`, every one of these becomes publicly readable at a guessable URL:

- `audit/TEAM_STATUS.md`, and every decision record
- `audit/deep/` — my reports, the session state, the research plan
- `audit/research/SI_AYE_INDEPENDENT_SOURCES_10NOV.md`
- `tests/` — the whole suite, including the internal QA sample ids
- `presenter-uat.html` — the unreleased Max build
- `golden-thread-kiss.html` — the demo page
- `.claude/serve.py`

None of it is a secret in the "password" sense, and none of it would be catastrophic. But a decision record that says *"approved by Chas"* and a QA report that says *"this line is harsh"* are not things a seeker should be able to read about themselves, and the care principle we adopted yesterday makes that concrete rather than theoretical.

---

## 4. The check to actually run, after release

Replace the directory probes with file probes. All four must be **404**:

```
/audit/TEAM_STATUS.md
/audit/deep/2026-11-10-B-DEEP-research-plan.md
/tests/clarifier-rules.test.cjs
/presenter-uat.html
```

And one control that must be **200**, so a blanket 404 cannot be mistaken for success:

```
/index.html
```

That control is the point. Without it, a misconfigured deployment that 404s everything looks identical to a successful lockdown.

---

## 5. What I could not settle

**Exactly which build is deployed.** `/clarifier-rules.js` 404s, so it predates 25 October — consistent with Claude's "main @ 8d12cc6, late Sept". But `README.txt` describes *"Five cards only: The Fool, The Magician, The High Priestess, The Empress, The Emperor"* and lists `styles.css` as a file, which reads like the original proof of concept rather than the current app.

That may simply be a stale README.txt in the repository. I fetched `/index.html` and the fetch returned only the title, so I could not settle it by inspection. **Worth one look in a browser by Chas:** if `resonatetarot.app` is publicly showing a five-card proof of concept, that is a product problem that wants fixing before any release conversation, and it is not the one we have been having.

— Deep
