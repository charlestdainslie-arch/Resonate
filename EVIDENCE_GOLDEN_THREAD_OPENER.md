# Golden Thread opener: 16-second audiovisual demo (Stream B)

Author: Claude. Branch `claude/golden-thread-opener`, from PR #43's tested head `bea5edc`. Requested in Chas's "Make it so" directive (Slack #resonate-dev, 29 Oct 16:52). **AUTHOR-TESTED only: not independently verified, not Chas-accepted. Opt-in page; no production, no merge, nothing purchased.**

## What to open
- Live page: `/golden-thread-opener.html` on this branch's preview. Tap "▶ Play with sound" or "Play silently".
- Recording: `evidence/golden-thread-opener.mp4` (16 s, 720 px wide, with its sound), made frame by frame from the same page.

## The sequence (one clock, 16 s)
| Time | Picture | Sound |
|---|---|---|
| 0–2.8 s | Smoke rises out of the dark; the RESONATE hand fades up | a low, warm hum (filtered triangle and sine) |
| 2.8–4 s | The fingertip glows, sparks fly off it | a soft three-partial chime |
| 4–8.2 s | A golden thread curls out of the fingertip, sparkling at its head, rises and wraps the face-down card | a filtered shimmer rising in pitch, with tiny sparkle ticks |
| 8.6–9.6 s | The card turns over: The Fool | a swish, then a soft knock and bell as it settles |
| 9.6–12.4 s | The hand sinks away; its strand draws back into the card; the thread curls round the left of the introduction and settles under it | — |
| 10.8–12.2 s | RESONATE, "0 · The Fool", "New Beginnings · Innocence · Trust" | a warm A-major chord |
| 13.6–16 s | "Begin your reading →" and Replay | the hum fades |

Controls throughout: ← Back, 🔇 Mute / 🔊 Unmute, Hide words / Show words, Skip ⏭. Captions describe the sound and picture, for sound-off viewing and screen readers. Nothing plays until a tap. Hiding the page, Skip or the end stops all animation and closes the audio. Reduced motion shows the finished picture still, with no movement.

## Rights and what is placeholder
- **Sound:** entirely original, synthesised live in the browser with Web Audio from the code in `golden-thread-opener.js`. No samples or third-party audio.
- **Hand:** `assets/mystic-hand-whisper.png`, the app's existing RESONATE hero artwork (added 6 Sep, `a98fbcf`). Resized to `assets/opener/hand-640.jpg` for phones (56 KB instead of 2 MB). Its licence/provenance is as recorded for that asset; not re-checked here.
- **Card face:** `assets/deck/ar00.jpg`, the deck's own The Fool, as the app uses it. Name and keywords come from `data.js`.
- **Card back, smoke, thread, sparks, glow:** original, drawn in code.
- **Placeholder:** the whole piece is a first pass for Chas's aesthetic call. Timings, colours, the hand artwork and the sound palette are all easy to change.

## Tests run here (author-tested)
`node tests/golden-thread-opener.browser.cjs`: **17/17 pass.**
- **Silence until tap.** No audio exists before a tap; the intro offers sound or silent.
- **Play.** Captions follow the timeline, and it ends on the call to action.
- **Skip, hide and replay.** Skip and hiding the page stop animation and close the audio. Replay never stacks two sounds.
- **Mute and captions.** Play silently and Mute make no sound. Hide/Show words works.
- **Reduced motion and the card.** Reduced motion gives the still picture. The card is The Fool from the deck and `data.js`.
- **Thread path.** No point of the settled thread falls inside the title or keyword text.
- **Soundtrack.** Every cue is present at its time and never clips (RMS: start 0.006, chime 0.118, thread 0.108, flip 0.109, chord 0.115; peak 0.33).
- **Layout at 360, 390, 768 and 1280 px.** No sideways scroll, every control ≥ 44 px, the title sits below the card, and the call to action is above the control bar.
- **Frame rate:** 46–48 fps while playing, in headless Chromium on a 2-CPU machine. A phone will differ; not measured on a device.

Also run: unit 70/70 and presenter 42/42, unchanged. `index.html` and `app.js` are unchanged; the page is opt-in only.

## Not done
- Real phone playback and sound by ear (Chas).
- Independent review (Si Aye).
- Wiring into the real reading flow and the five-spread regression. Per the brief, that waits until Chas approves the look.
