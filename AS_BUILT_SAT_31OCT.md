# RESONATE Tarot — as-built and rollback pack for the Saturday 31 Oct review

Author: Claude, 30 Oct 2026, for #24 item 7. **Describes the candidate exactly as built; changes nothing.** Facts below were read from the candidate's source at the SHA shown. Where something could not be established from the repo, it says **UNKNOWN**.

## 1. Version manifest
| | |
|---|---|
| Candidate | `claude/page-end-nav` (PR #36) @ `5e2305ce0afaf12cfcdffb14bc58cb79eee15014` |
| Candidate preview | https://resonate-bnbk2t2s1-charlestdainslie-6956.vercel.app (Vercel Preview, not production) |
| PR stack | `main` → #18 `claude/issue14-uat-base` → #26 `claude/r2-foundation` → #34 → #35 → #36. **None merged.** |
| Ahead of `main` | 105 commits; `main` is an ancestor (no divergence) |
| **Live production today** | `main` @ `8d12cc6` ("Export Golden Thread reading as plain text"), Vercel Production deployment `6628858099`, 24 Sep 2026: https://resonate-n42qzw1yg-charlestdainslie-6956.vercel.app. **Unchanged by any of this work.** |
| Evidence for this review | `claude/sat-31oct-evidence` @ `199161d` (+ this file): `EVIDENCE_SAT_31OCT.md`, `tools/review/`. No app change. |

**Demo-only branches, not in the candidate:** `claude/golden-thread-live-reading`, `deep/golden-thread-connector-phase-a`, `claude/max-voice-fallback` (`1fff68b`, Max Chasroom; voice PASS on Chas's Samsung 30 Oct), PRs #37/#38/#41–#45.

## 2. Architecture
- **A static site.** Plain HTML, CSS and JavaScript; no build step, no framework, no server code, no database, no package install. Vercel serves the files as they are.
- **Everything runs in the visitor's browser.** The app makes **no network requests of its own**. The only outbound link is the Shop button → `https://monadresonate.com` (opens the password-protected store; no data passed).
- Load order (`index.html`), each a plain script:

| File | Role |
|---|---|
| `data.js` | The 78 cards: names, meanings (upright and reversed), keywords, symbolism, astrology, element, numerology, connections, journal prompt, image path |
| `deck-engine.js` | `ResonateDeck`: validates a 78-card deck, Fisher–Yates shuffle, draws unused cards for clarifiers |
| `tarot-catalogue.js`, `reading-session.js`, `opening-dice.js`, `reading-journey.js` | Learn catalogue, reading session, opening dice, reading journey helpers |
| `vendor/astronomy.browser.min.js` + `astrology-prelude.js` + `astrology-prelude-ui.js` | Optional sky/Sun-sign context, computed locally |
| `vendor/pdf-lib.min.js` + `reading-pdf.js` | PDF built in the browser |
| `app.js` | Views (home, learn, detail, reading, stage, draw, saved), spreads, reading text, Golden Thread section |
| `reading-stage.js` | Shuffle/draw stage; replaces `startDraw()` and wraps `render()` |
| `journal.js` | Save/reopen readings; page-end navigation |
| `shop-link.js` | Shop button |
| `navigation-a11y.js` (loaded last) | Phone Back mirrors on-screen back; menu focus/Escape; heading focus; toggle state |
- CSS: `base_styles.css` then 10 override sheets (`uat.css` … `spread-parity.css`), in the order in `index.html`. Later sheets win; layout fixes live mostly in `reading-welcome.css`, `uat-fixes.css`, `spread-parity.css`.
- **Third-party code (2 files, both MIT, both vendored):** pdf-lib (© 2019 Andrew Dillon, licence in `vendor/pdf-lib.LICENSE.md`); Astronomy Engine (© 2019–2025 Don Cross, licence in the file header).

## 3. Reading rules as built
- **Spreads** (`app.js` `spreads`): One-card Guidance (1), Past · Present · Future (3), Relationship (5), Seven-card V (7), Celtic Cross (10). Positions and labels come from that table.
- **Deck:** 78 cards, validated as 78 unique IDs before shuffling. Fisher–Yates shuffle with `Math.random`. **No card repeats within a reading.**
- **Clarifiers:** at most **two layers**. Each layer gives one clarifier per position, drawn from cards not already used by the spread or the earlier layer, so no card appears twice across spread and clarifiers. The second layer waits face down in its slot until drawn.
- **Orientation:** every draw is **upright**. Reversed meanings exist in `data.js` and on card detail pages, but readings never draw reversed. Known gap, not a regression.
- **Reading text:** per-position meaning from card data plus position context; the Golden Thread section folds in clarifiers, astrology (if given) and dice numerology. See #10 F1: production's older card-to-card narrative is not in this build (owner decision pending).
- **Astrology (optional):** Sun sign and birth year only (#34). Computed in the browser; the module states no external requests and does not persist raw birth inputs. A computed sky snapshot can be saved with a reading and embedded in its PDF.
- **Not implemented:** reversed draws, orientation-aware synthesis, 73 tailored position themes, neighbour synthesis, Living Transmission, astrology interpretation, accounts/paywall.

## 4. Storage, Journal and PDF
| Data | Where | Key |
|---|---|---|
| Saved readings (cards, positions, both clarifier layers, time, reflection, astrology snapshot if any) | Browser `localStorage`, this browser only | `resonate-reading-journal-v1` |
| Card bookmarks | `localStorage` | `resonate-bookmarks` |
| Card study notes | `localStorage` | `resonate-notes` |
- **Nothing is stored on a server. There are no accounts.** A reading lives only in the browser and device that saved it.
- **Save failure is reported honestly:** if storage is full or blocked (e.g. some private modes), it shows "Could not save in this browser…" and does not claim success.
- **Reopen** restores the saved cards and clarifiers; it does not redraw.
- **PDF:** generated in the browser with pdf-lib, file name `resonate-tarot-reading.pdf`. When present, the astrology snapshot is attached as `resonate-astrology-snapshot.json`, with no raw birth inputs. Nothing is uploaded.

## 5. Backup and restore
- **Users: there is no backup or restore.** The **PDF is an export / archival copy to read or keep**; it **cannot be imported** back into the Journal, on this device or another. Clearing site data, uninstalling the browser or changing phone loses the Journal for good. Say this plainly to testers. (Corrected 30 Oct after Si Aye's review.)
- **Code:** GitHub is the record. Every candidate is a branch plus full SHA. Nothing to back up on Vercel beyond its deployment history.

## 6. Configuration and environment
- No environment variables, API keys, secrets or server configuration are used by the app.
- No `vercel.json`: Vercel's static defaults apply.
- Previews deploy automatically for each pushed branch. **Production is only what Chas promotes.** It is still `main` @ `8d12cc6`.

## 7. Release and rollback
**Nothing is being released on Saturday.** If Chas later approves this exact build:
1. Merge the PR stack into `main`, or promote the candidate's Vercel deployment. **Chas's decision, and only for the exact SHA he approved.**
2. **Rollback:** in Vercel → project `resonate` → Deployments, find Production deployment `6628858099` (`main` @ `8d12cc6`) and choose **Promote to Production**, or **Instant Rollback**. No data migration is needed: storage keys are browser-local, and the older build ignores keys it does not know.
3. **Data caveat:** readings saved by the new build stay in visitors' browsers under `resonate-reading-journal-v1`. The old production build has no Journal, so after a rollback they are not shown, but they are not deleted.

## 8. Test results (30 Oct, exact SHA)
All author-run, headless Chromium (Playwright 1.63); detail in `EVIDENCE_SAT_31OCT.md`.
- Unit 70/70; browser UAT 304/304 (16 configurations); astrology 48/48; clarifier slots 35/35; coverage gaps 37/37; nav/a11y, page-end 9/9, reduced-motion/headings, spread parity, UAT round 1: all PASS.
- **Tap-only walkthrough: 240/240** at 360/390/768/1180/1280/1920 px. Browser Back PASS; Forward not supported (P3).
- **Si Aye (30 Oct 13:41):** independently verified SHAs, diff (evidence only) and deployment READY; **did not re-run tests**.
- **UNKNOWN:** Chas's Android run of this build, TalkBack, PDF visual layout, landscape.

## 9. Privacy, accessibility and compliance
- **Privacy:** no analytics, cookies, accounts, tracking or network calls by the app. Readings, reflections and optional Sun sign/year stay in the browser. A privacy note saying exactly this is still needed before public release (**not present**).
- **Accessibility, as tested:** keyboard menu and Escape, focus moves to each new heading, labelled toggles (`aria-pressed`), touch targets, reduced-motion honoured, no sideways scroll at 360–1920. **Not tested:** screen reader on a real device, colour contrast audit, zoom to 200%.
- **Content:** reading text says it is a perspective, not a prediction ("not a fixed prediction", "symbolic prompts, not guarantees"). PR #42 found no absolute-prediction wording in app text.
- **Artwork rights: UNKNOWN — not cleared.** The deck images in `assets/deck/` (78 + back) have no recorded source or licence in the repo, and the landing/spread artwork has none either. Record provenance before public release.
- **Store:** stays password-protected; no checkout, subscription or payment change.
- **`README.txt` is out of date** (it still says five cards). Docs only, not a user-facing defect.

## 10. Troubleshooting
| Symptom | Likely cause | What to do |
|---|---|---|
| Journal empty on another phone or browser | Journal is per browser | Expected; a downloaded PDF keeps a readable copy but cannot be loaded back in |
| "Could not save in this browser" | Storage blocked or full (private mode, storage cleared, quota) | Leave private mode / allow site data; download the PDF to keep a readable copy |
| Readings vanished | Site data cleared | Not recoverable; no server copy and no import. Any downloaded PDFs remain readable copies |
| Card images missing | Asset failed to load (connection) | Reload; images are local files under `assets/deck/` |
| Phone Back leaves the app | Already on Home | Expected; Back from Home leaves |
| Forward does nothing useful | Not supported by design | Use the on-screen buttons |
| Console shows `<path> attribute d: Expected number` | Pre-existing SVG icon path; harmless | None needed for review; fix later |
| Opened a link with no Max Chasroom | The candidate excludes Max by design | Max is on `presenter-uat.html` of the voice branch only |
