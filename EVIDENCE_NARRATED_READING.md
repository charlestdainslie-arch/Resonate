# Narrated reading (Max Chasroom) for every spread — evidence

Author: Claude. Branch `claude/narrated-reading`, stacked on draft PR #37 (`claude/max-chasroom-presenter` @ `d7443a7`). Requested by Si Aye in Slack #resonate-dev, 29 Oct 13:54. **Preview for review, not accepted. No merge, no production, no payment, nothing uploaded.**

## What changed
- `presenter-uat.html` now opens as the **normal app** with the presenter added. Every real reading, in any spread, gets "▶ Watch Max Chasroom present this reading". The synthetic One-card demo moved to `presenter-uat.html?demo`.
- **All five spreads** (One-card, Past · Present · Future, Seven-card V, Relationship, Celtic Cross), using the cards actually drawn, in their positions, and the clarifiers actually drawn.
- **Short for a phone.** Per position: the position name and card, then one line on the position and one on the card. Each line is taken word for word from the reading the app has already written: the first lens sentence of `positionContext` and the first sentence of the card meaning. The close is the reading's own closing question and "Take what resonates, and leave the rest."
- **Clarifiers extend the reading.** Each clarifier layer is its own chapter. Once drawn, "▶ Hear Clarifier 1/2" plays only that layer (one line per clarifier, from its own meaning) and then the close.
- **Cards on the player** match the reading page: each position's card with its clarifiers small underneath, 1 on the left and 2 on the right. Wide spreads scroll sideways and follow the card being discussed.
- **Transcript** of the whole script, closed by default.
- **Voice**: unchanged order of preference. A pre-recorded voice pack if it covers every line, else the device's own on-device speech (never a network voice), else captions alone. Nothing is sent anywhere.
- `tools/voice/export-clips.cjs` now lists every line Max can say in every spread (2,231 clips, 33,783 words). `--demo` lists the 25 the demo needs. `tools/voice/generate.py` can use Chatterbox **Nano** on CPU (see below). A stray Python cache file from #37 is removed.
- `app.js`, `index.html` and all other shared files: **unchanged**. Only `presenter*.{js,css,html}`, its test, the voice tools and `.gitignore` changed.

## Measured narration length
Averaged over five draws per row; words of narration vs words in the written reading below it.

| Spread | Clarifier layers | Narration words | Written reading words | About (150 words/min) |
|---|---|---|---|---|
| One-card Guidance | 0 / 2 | 118 / 158 | 381 / 878 | 0.8 / 1.1 min |
| Past · Present · Future | 0 / 2 | 187 / 303 | 886 / 2,339 | 1.2 / 2.0 min |
| Relationship | 0 / 2 | 242 / 436 | 1,422 / 3,831 | 1.6 / 2.9 min |
| Seven-card V | 0 / 2 | 371 / 658 | 1,964 / 5,342 | 2.5 / 4.4 min |
| Celtic Cross | 0 / 2 | 411 / 789 | 2,745 / 7,586 | 2.7 / 5.3 min |

Hearing one clarifier layer on its own: about 130 words for three cards, 215 for seven, 260 for ten.

## Not possible from the current app (reported, not invented)
- **Question:** the app has no question field. "Hold your question" is said, but nothing is captured, so Max cannot say it back. Adding one changes the shared reading flow and needs Chas's go-ahead.
- **Orientation:** readings are always drawn upright. Reversed meanings exist only on the card detail page. Max narrates what the app draws; reversals would be an app change first.

## Voice clone: the repo
The repo already wired into #37's `tools/voice/generate.py` is **Chatterbox**. It was named there, not inspected, until now.

| | |
|---|---|
| Repo | https://github.com/resemble-ai/chatterbox (inspected at `5de7a54`, 21 Jul 2026) |
| Licence | MIT (LICENSE file, © 2025 Resemble AI). Commercial use allowed. One Hugging Face card's metadata says Apache-2.0 while its text says MIT; the repo's LICENSE file is MIT. |
| Models | **Nano** 110M, English, "runs on CPU, 3× real time on 8 cores" (Resemble AI's figure, not measured here). **Turbo** 350M, English, GPU. **Multilingual V3** 0.5B. Original Chatterbox 0.5B. |
| Install | `pip install chatterbox-tts`, Python 3.10–3.13 (torch 2.6.0). Models download once from Hugging Face, then run offline. |
| Hardware | Nano: a normal 8-core computer, no GPU. Turbo/original: an NVIDIA GPU (`cuda`), or Apple Silicon (`mps`) for the original. |
| Recording guidance | Cloning is zero-shot from **one clean reference clip**. The README examples use a 10-second clip; Resemble AI's Turbo page says about 5 seconds. It does not train on hours of audio. So an hour of Chas reading is not needed for this model. 10–30 s of Chas speaking naturally, in a quiet room, phone close, no music, one voice, is the input. More recordings would only help to choose the best reference clip. |
| Latency / cost | Free; runs locally. Max's lines are recorded ahead of time, so latency doesn't matter during a reading. At Nano's stated 3× real time, the full deck (~33,800 words, about 3¾ hours of speech) is roughly 1¼ hours of computing on 8 cores; the demo batch is seconds. **Not measured**: the model could not be installed in this sandbox. |
| Watermark | Every output carries Resemble AI's inaudible PerTh watermark marking it AI-generated. |
| Recordings: handling and deletion | Nothing leaves the machine: the reference clip is read locally and converted to a temporary 24 kHz wav, and only the generated clips plus `manifest.json` (with label and consent note) are written. Deleting means deleting the reference file, its temp copy and the `voice/chas/` folder. The generated clips are a recognisable copy of Chas's voice, so they should be kept out of the public repo unless he decides otherwise. Hugging Face only serves the model download; no audio goes to it. |
| Consent | The script refuses to run without `--label` and `--consent`, and the player shows the label. Only Chas's own voice, with his consent. |

Alternatives briefly considered: OpenVoice and RVC were named in a 27 Oct chat only; neither has been inspected. Chatterbox is the one already wired in, MIT, and has a CPU model.

## Max video: reusable footage vs a fresh video per reading
- **Reusable footage + fresh narration and card visuals** (what this preview does, with an SVG presenter in place of footage): feasible now. A short looped Max clip (idle, talking, a few gestures) plays while the pre-recorded lines and card images change per reading. Cost: one-off filming; nothing per reading. Lip-sync is approximate (talking loop), not word-accurate.
- **A fresh presenter video per reading** (talking-head generation from text and a photo or clip): every reading is a new combination of 1–30 cards, so it would mean generating video on demand. That needs a GPU server or a paid video API (not authorised), and generation time would run from seconds to minutes per reading. Not measured: no footage exists and no such service is available here.
- **Blocker:** no Max Chasroom footage has been supplied, so nothing could be measured.

## Tests (run here)
- `node tests/presenter.browser.cjs`: **39/39 pass**. That covers all five spreads with 0 and 2 clarifier layers drawn through the real app. In each, every caption is checked to be a Max framing line, a label naming a drawn position or card, or text that appears both on the page and in the PDF. All positions and clarifiers are named once, the narration stays under 35% of the written reading, and there is no sideways page scroll at phone size. Also covered: Hear Clarifier 2 plays only that layer, the wide-spread strip follows the card, the transcript is closed by default, Journal reopen, Pause/Resume/Replay, sound and captions, the voice pack and fallbacks, Escape, and 4 widths. One flaky check inherited from #37 (opening the player before the async voice-pack check finished) is fixed.
- `node --test tests/*.test.cjs`: 70/70 pass.
- Not done: real phone, real voice by ear, screen reader, voice clone run.

## Next reviewer
Chas on his phone: `/presenter-uat.html` on this branch's preview. Draw any spread, play Max, then draw a clarifier and press "Hear Clarifier 1". Si Aye: independent review of the script-faithfulness rule and the voice findings.
