# Samsung UAT checklist: Max narration, audio and captions (for Dev)

Si Aye, 7 Nov 2026: "Dev verifies Max's spoken audio against captions captured on the actual Samsung. No
synthetic transcript is accepted as evidence of audible output." Chas is the final voice acceptance authority.

The transcript files in `audit/qa-samples/` show what Max is **scripted** to say. They are not evidence that
anything was heard. Only a recording made on the phone counts.

## Before you start (record the answers)

| Item | Value |
|---|---|
| Phone model (Settings → About phone) | |
| Android version and One UI version | |
| Browser and version (Chrome: ⋮ → Settings → About Chrome) | |
| Build: commit SHA shown on the Issue #49 post | |
| Preview link opened (paste) | |
| Text-to-speech engine (Settings → General management → Text-to-speech) | |
| Media volume (not ringer) at least half; Do Not Disturb off; Bluetooth audio disconnected | ☐ |
| Ring/silent mode noted (Chas's earlier test was muted) | |

## Capture

Use Samsung's screen recorder with **Sound: Media sounds** (quick panel → Screen recorder → Sound settings).
It records the phone's own audio and screen together, so the recording shows both the caption on screen and
the voice. A recording with no audio track, or one using "Mic" only, is BLOCKED, not PASS.

## Tests (one recording each)

Open the preview with `?qa=<ID>` added to the address (for example `.../presenter-uat.html?qa=B03`). Each
loads a fixed reading, so your result can be compared line by line with `audit/qa-samples/<ID>.md`.

| # | Sample | Do | Expected | Result: PASS / FAIL / BLOCKED | Recording file | Notes |
|---|---|---|---|---|---|---|
| V1 | S01 (one card) | Tap ▶ Watch Max, then ▶ Play. Let it finish. | Voice audible. Each spoken line matches the caption on screen at that moment, word for word. Voice label says it is a synthetic temporary voice, not Chas. | | | |
| V2 | B03 (Relationship, Deep's case) | Play to the end. | As V1. Caption "Clarifier 1 · You: The Hermit, reversed." then the relationship lines that follow it in audit/qa-samples/B03.md. | | | |
| V3 | S15 (Celtic Cross, all clarified) | Play, then Pause, Resume, Replay. | Pause stops speech within about a second; Resume continues from the same line; Replay starts at "Part 1 of". | | | |
| V4 | S15 | During play, tap 🔇 Mute, then 🔊 Unmute. | Mute: speech stops and captions carry on. Unmute: speech resumes. | | | |
| V5 | S15 | Tap "Hide words", then "Show words". | Captions hide and return; voice is unaffected. | | | |
| V6 | S14 (Celtic Cross, rule clarifiers) | Open ▶ Watch Max, play a few lines, close it. Scroll to any card without a clarifier and tap ✦ Clarify in the dock. Then tap ↻ Replay Updated. | Dock button reads "↻ Replay Updated" after the clarifier is added. The replay includes the new clarifier's lines. | | | |
| V7 | S14 | Start Max playing, then (if the page behind is reachable) add a clarifier. | Max stops speaking at once; the player closes; "↻ Replay Updated Reading" is offered. If the page behind cannot be reached while Max is open, record BLOCKED with a note. | | | |
| V8 | any | Switch to another app while Max is speaking, then come back. | Speech pauses when you leave; nothing plays in the background. | | | |
| V9 | any Celtic Cross | Check the dock at the top of the reading, at card 5, at card 10, and in the written reading. | ✦ Clarify and ▶ Watch Max are both visible, side by side, and not covering card labels permanently. | | | |
| V10 | any | Rotate the phone to landscape and back during Max. | Player stays usable; captions readable. | | | |

## What to send back (to Chas for Issue #49)

1. The completed table above.
2. The recordings, or a link to them.
3. For any FAIL: the sample ID, the time in the recording, what was said, and what the caption showed.

The voice is the device's own text-to-speech, used as a temporary fallback. Voice quality is not being
accepted here. Chas decides voice acceptance.
