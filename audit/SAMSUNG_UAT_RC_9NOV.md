# Samsung audio acceptance: release candidate `282cd14` (for Dev)

Chas / Si Aye directive, 9 Nov 2026, section 4. This is the priority release gate still outstanding. It replaces `audit/SAMSUNG_UAT_CHECKLIST.md` (7 Nov) for this build; that file stays on record.

**Rule (Si Aye, 7 Nov):** only a recording made on the phone counts. "No synthetic transcript is accepted as evidence of audible output." The scripts named below show what Max is **meant** to say, so you can compare line by line. They are not evidence that anything was heard. Chas remains the final voice authority. Max currently uses the phone's own text-to-speech as a temporary voice, so voice quality is not being judged here.

## Build

- Application commit: **`282cd1457ec94e8436f81b3867799f45dfcad110`** (branch `claude/uat-thread-fixes`)
- Preview: Vercel deployment `resonate-ekiank195` (built from that commit). Chas sends you the private link. Each link lasts about 23 hours, and Claude makes a fresh one on request.
- Open the link once (it signs you in to the preview). Then add `?qa=<ID>` to the address to load a fixed reading, for example `…/presenter-uat.html?qa=B06`.

## Before you start (record the answers)

| Item | Value |
|---|---|
| Phone model (Settings → About phone) | |
| Android version and One UI version | |
| Browser and version (Chrome: ⋮ → Settings → About Chrome) | |
| Build SHA (above) confirmed | |
| Text-to-speech engine (Settings → General management → Text-to-speech) | |
| Media volume at least half; Do Not Disturb off; Bluetooth audio disconnected | ☐ |
| Ring / silent switch position | |

## Capture

Use Samsung's screen recorder with **Sound: Media sounds** (quick panel → Screen recorder → Sound settings), so one recording holds both the caption on screen and the voice. A recording without phone audio is **BLOCKED**, not PASS.

## Readings to use (one per spread)

| Spread | `?qa=` | What it has | Compare with (Max's script at `282cd14`) |
|---|---|---|---|
| One card | `B01` | Death + The Tower + Judgement; a Clarity card is due (tap it in Max) | `audit/deep-recheck-9nov/handoff/BT-03.md`, sample B01 |
| Three card | `TC-04` | a two-clarifier chain on Present | `…/handoff/TC-04.md` |
| Relationship | `RC-02` | a clarifier on The Connection | `…/handoff/RC-02.md` |
| Seven card | `SC-01A` | mixed orientations, a clarifier on Past · 18–24 Months | `…/handoff/SC-01.md` |
| Celtic Cross | `B06` | all positions clarified; four Clarity cards due (1, 3, 5, 9) | `…/handoff/CC-03.md`, sample B06 |

Each handoff file has Max's script "before Finish" and "after Finish". The Clarity card you draw on the phone is random, so its lines will name a different card than the script; check that it names **the card on your screen**.

## Tests

| # | Test | Reading | Do | Expected | PASS / FAIL / BLOCKED | Recording file and time | Notes |
|---|---|---|---|---|---|---|---|
| A1 | Narration matches the cards and positions | each of the five | Watch Max → Play, to "That's your reading so far". | Every card Max names is the card on screen in that position, with the right orientation ("reversed" only when the card is upside down). Positions are named correctly. | | | |
| A2 | Captions match the **audio** | each of the five | Watch the recording back. | At every point, the words heard are the words in the caption on screen. No line spoken without its caption, and no caption without its line. | | | |
| A3 | Pause / resume | B06 | During play: Pause, wait 5 s, Play. | Speech stops within about a second. Play continues from the same line. No overlapping voices. | | | |
| A4 | Replay | B06 | Tap ↻ Replay mid-reading. | Starts again cleanly from the start; no leftover speech from before. | | | |
| A5 | Mute, hide words | B06 | Mute then unmute; Hide words then show. | Mute stops the voice while captions continue; unmute resumes. Hiding words leaves the voice unaffected. | | | |
| A6 | Scrolling and controls on the phone | B06 | Scroll the card strip and the transcript while Max plays; use the per-card chips. | Nothing overlaps the caption or controls; Clarify and Finish reading stay reachable without scrolling the transcript; no sideways page scroll. | | | |
| A7 | Clarifier narration (in Max) | B01, then B06 | In Max: choose the card → ✦ Draw Clarity card (B06: also a position that offers ✦ Clarify this card, if any). | Max speaks only the new part (the new card and the updated "Together"), naming the card now on screen; no repeat of the whole reading; no stale lines from before. | | | |
| A8 | Golden Thread continuity | B06 | After A7, tap Finish reading. | The closing synthesis names the Clarity card(s) you drew. The Golden Thread lines heard match the Golden Thread on the reading page. | | | |
| A9 | Closing phrase only at the end | each of the five | Listen through to "That's your reading so far", then tap Finish reading. | "Before I go…", "Take what resonates, and leave the rest." and "Max Chasroom, signing off." are **not** heard before Finish. After Finish they are heard **once**, at the very end, in that order. | | | |
| A10 | Phone lock | B06 | While Max speaks, press the side key to lock; wait 10 s; unlock. | Record exactly what happens: whether speech stops or carries on while locked, and whether on unlock it resumes, is paused, or needs Play. No garbled or doubled speech. | | | |
| A11 | Background / resume | B06 | While Max speaks, switch to another app for 10 s; come back. | Nothing plays while the app is in the background (or record if it does); on return it is paused or resumes cleanly, with caption and voice still in step. | | | |
| A12 | Audio interruption | B06 | While Max speaks, trigger an interruption: an incoming call from another phone, or an alarm or timer going off. | Max stops for the interruption; afterwards no stuck or overlapping speech; Play resumes cleanly. Record what happened. | | | |

For A10–A12 the expected behaviour on Android is not fixed in a test here. Record what the phone actually does. Si Aye and Chas decide whether it is acceptable.

## Send back (to Chas, for Issue #49)

1. The completed tables (device details and A1–A12).
2. The recordings, or a link to them.
3. For any FAIL: the reading, the time in the recording, what was said, and what the caption showed.

No merge, release or spending follows from this test without Chas's approval.
