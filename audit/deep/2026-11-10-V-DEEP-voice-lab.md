# RESONATE VOICE LAB — plan, recording script, and evaluation instruments

**Date:** 10 November 2026
**From:** Deep
**To:** Si Aye, Chas, Claude (cc)
**Authority:** Si Aye's Voice Lab response of 10 November, seven items.
**Constraints accepted:** originals unchanged; no paid services, no external uploads, no production voice replacement; goal is Chas's natural voice, not a generic Scottish one.

---

## 0. A correction I owe you first

Si Aye's item 3 says: *"We should not reject 24 kHz material automatically."* That is right, and my previous message overstated the case.

**XTTS-v2 operates natively at 24 kHz** and clones from a **6-second** reference clip ([model card](https://huggingface.co/coqui/XTTS-v2)). So 24 kHz is *not* disqualifying — for XTTS-class models it is the target rate, not a limitation.

What survives from my earlier assessment, and is now the accurate version:

| Concern | Holds? | Why |
|---|---|---|
| 24 kHz sample rate | **No** — withdrawn | Matches XTTS-v2's native rate |
| 64 kbps AAC | **Yes, partly** | Lossy artefacts at low bitrate; less severe than I implied |
| Only 5.4 minutes total | **No** — withdrawn | 6 seconds is enough for XTTS; duration is not the constraint |
| 155 fragments averaging 3.3 s | **Yes** | This is the real limit. Cloning learns cadence from continuous speech |

So the dataset's genuine weakness is **fragmentation**, not fidelity or length. The 24 kHz/64 kbps point still argues for re-recording, but as an improvement, not a blocker.

---

## 1. Item 1 — originals preserved

The 155 files are unchanged in `voice-ref/max-voice-chas/`. A SHA256 manifest is written alongside them.

- **Files:** 155
- **Bytes:** 2,889,191
- **Set digest:** `aaf63c14d2ef750a09df887bc32d105b44c310049e6ae2e342a50d9765713920`
- **Manifest:** `voice-ref/MANIFEST.sha256`

Any future re-encode, trim or re-master must produce a new file; these stay as the baseline. Verify the digest before any experiment.

---

## 2. Item 3 — model requirements and licences

This is the decisive section, and not for the reason I expected.

| Model | Reference needed | Native rate | Licence | Verdict |
|---|---|---|---|---|
| **XTTS-v2** (Coqui) | 6 s clip | 24 kHz | **CPML — non-commercial** | Best-known quality; **blocks commercial use** |
| **F5-TTS** | ref audio **+ its transcript** | ~24 kHz | Code MIT, **weights CC-BY-NC** | Non-commercial via training data (Emilia) |
| **Chatterbox** (Resemble) | ~10 s clip | 24 kHz | **MIT** | Commercially clean; **retired Aug 2026** |
| GPT-SoVITS / OpenVoice | varies | 32 kHz / 24 kHz | reported MIT | **Unverified — do not rely on until checked** |

Sources: [XTTS-v2 model card](https://huggingface.co/coqui/XTTS-v2) (CPML, 6 s, 24 kHz); [F5-TTS README](https://github.com/SWivid/F5-TTS) (MIT code, "pre-trained models are licensed under the CC-BY-NC license due to the training data Emilia"); [Chatterbox README](https://github.com/resemble-ai/chatterbox) (MIT, retired August 2026).

**The finding that matters:** the two models everyone reaches for first — XTTS and F5 — are **non-commercial**. RESONATE is a commercial product with a shop. Cloning Chas's voice for a shipped product with either licence is a legal exposure that no amount of audio quality justifies. This should be settled before any further recording effort, because it determines what the recording is *for*.

**Recommendation: trial on Chatterbox.** It is MIT, it is *already installed* in the project venv (`chatterbox: True`, alongside torch and torchaudio), and it needs only a ~10 s reference. Two caveats: it is retired research, so pin the version and accept that there will be no upstream fixes; and it embeds a **Perth watermark** in every generated file, which is fine for provenance but worth knowing.

---

## 3. Item 2 — test assembly

I can build it, and it is worth doing only as a *control*, not as a candidate master.

- **What:** all 155 clips concatenated in script order, 250 ms gaps, normalised to −23 LUFS, exported as 48 kHz WAV.
- **What it is not:** continuous speech. It will clone as a list of phrases with clipped onsets — the model learns the edit boundaries, not Chas's cadence.
- **Value:** it gives the *floor* for the comparison in §6. If the improved dataset does not clearly beat the assembled one, something else is wrong.

Say the word and I will produce it; I have not built it yet because its diagnostic value is limited and it is easy to mistake for a real sample.

---

## 4. Item 4 — the 10–15 minute recording script

### 4.1 Design principles

1. **Unscripted first, read second.** Reading aloud produces a "reading voice" — flatter, more careful, less Chas. Roughly 60% of the material below is prompts to talk to, not text to read.
2. **Clone the cadence, not the words.** The target is how he runs a sentence, where he breathes, how he lands a point.
3. **Cover the sounds he actually uses**, including Scots ones — but from *his* word list, never phonetic spelling. I will not write him in stage-Scots.
4. **One continuous session**, same mic, same distance, same gain. Variation between blocks is fine; variation in the recording chain is not.
5. **No performance.** Directions like "sound warm" produce acting. Directions like "tell me about" produce him.

### 4.2 Block plan — target 12 minutes

| # | Block | Time | Type | Purpose |
|---|---|---|---|---|
| 1 | Warm-up | 1:00 | unscripted | Settle the voice, capture unguarded speech |
| 2 | Numbers and card names | 1:30 | read | Number prosody, list intonation |
| 3 | Explain a reading | 2:00 | unscripted | Explanatory register, tarot vocabulary naturally |
| 4 | Difficult cards, kindly | 2:30 | read + improvise | The compassion register |
| 5 | Golden Thread transitions | 2:00 | read + improvise | Connective prosody — hardest to synthesise |
| 6 | Warmth and humour | 1:30 | unscripted | The thing a clone loses first |
| 7 | Questions and closings | 1:30 | read | Interrogative and closing intonation |
| 8 | Your own words | 1:30 | read | Scots phoneme coverage |
| 9 | Continuous narration | 2:30 | read | Long-form prosody, breath, paragraph continuity |
| 10 | Emotional range | 1:30 | prompted | Six colours, two sentences each |

**Total ≈ 12:30.** Aim for 12–15; over 15 adds nothing and costs editing.

### 4.3 The prompts

**Block 1 — Warm-up (speak as you would to a friend, not to a mic).**
Answer these three, one at a time, without planning:
1. *What have you been up to this morning?*
2. *What's the weather doing out there?*
3. *What's the most annoying thing about driving in Sydney?*

**Block 2 — Numbers and card names (read).**
- The 22 Major Arcana, each with its number: *"Zero, The Fool. One, The Magician. Two, The High Priestess…"* through *"Twenty-one, The World."*
- The suits and ranks: *"Ace of Wands, Two of Wands… King of Wands."* Wands, then Cups, then Swords, then Pentacles.
- Numbers 1–78 in order, then 100, 250, 1,000, 2026.
- Two prices and two dates, as you'd say them aloud.

**Block 3 — Explain a reading (unscripted).**
1. *Someone's never had a tarot reading. Explain what a three-card reading is, and why it might be worth their time.*
2. *Now explain what a clarifier is — and why you'd not force one on somebody.*

**Block 4 — Difficult cards, kindly (read, then say it your way).**
Read each aloud, then immediately say the same idea in your own words:

> **The Tower.** "Something you thought was solid has moved. That is frightening while it happens, and it is not the end of you. What falls was holding a shape you had outgrown."
>
> **Three of Swords.** "This is hurt that has been named, not a verdict. It often marks the end of a situation rather than a romantic heartbreak — and naming it is the first honest step out."
>
> **Ten of Swords.** "The worst of it has already happened. There is nothing left to fear here; the only direction is up, and slowly. Rest matters more than resolution."

Then: *"Say one of those again as if you were talking to someone who was crying."*

**Block 5 — Golden Thread transitions (read, then improvise three).**
> "The first card sets the weather. The second is what you do inside it."
> "This is where the reading turns."
> "Two cards pulling opposite ways is not a contradiction — it's the shape of the decision."
> "What connects these is not a theme. It's a question you keep avoiding."
> "Read together, they say something neither says alone."
> "And this is the cost of the version of you that keeps choosing the first card."
> "The last card is not a prediction. It's where the story is pointing."
> "That's the thread. Pull it, and see what moves."

Then: *"Now give me three transitions of your own, connecting any two cards you like."*

**Block 6 — Warmth and humour (unscripted).**
1. *Tell me a short story about being Scottish in Sydney — something that still makes you laugh.*
2. *What's the most Scottish thing you still do?*

**Block 7 — Questions and closings (read, with real intonation).**
> "What would it look like if you stopped explaining yourself?"
> "Who are you protecting by not deciding?"
> "What are you hoping I won't say?"
> "Where in your body do you feel that?"
> "What would you do if you weren't afraid of being seen?"
> "Take what's useful. Leave the rest."
> "That's your reading. Sit with it a day before you act on it."
> "Max Chasroom, signing off."
> "You've got more room than you think."

**Block 8 — Your own words (say each naturally, in a sentence of your own).**
loch · dreich · nicht · hoose · aboot · doon · hame · stane · guid · wee · cannae · dinnae · fecht · muckle · glaikit · wheesht · peelie-wally · outwith

Then read this passage in your normal voice:

> "It was a dreich nicht, the kind where the rain comes doon sideways and you cannae see the far end of the street. I'd been oot at the hoose of a friend up the road, and I'm walking hame thinking about nothing much, when I see the wee cat that's been living under the stanes by the gate. Guid knows where it came from. I says to it, wheesht, you'll wake the neighbours."

**Block 9 — Continuous narration (read straight through, no pauses at line breaks, ~2 min).**

> "Right. Let's take this slowly, because there's more here than the first card suggests. You've drawn the Three of Pentacles in the first position, and that's about work — not the glamorous kind, the kind where you're one of several people trying to make something hold together. The second card is the Eight of Cups, and that's somebody walking away from something that was fine. Not broken. Fine. Which is harder to explain to people.
>
> Read together, they're not contradicting each other. They're telling you the same thing from two angles: the work you're doing has stopped being the work you want to be doing, and the reason you haven't said so out loud is that it's good work, with good people, and leaving something good feels ungrateful.
>
> That's not a small thing. People stay in fine situations for years because there's nothing to point at and say, that's the problem. But the cards aren't asking you to justify it. They're asking whether you'd choose it again tomorrow, knowing what you know now.
>
> The third card is the Hermit, and it's the one that gives this somewhere to go. Not a plan. A bit of quiet. Before you decide anything, you need one honest hour where nobody's asking you what you're doing with your life — including you. That's where the answer tends to turn up.
>
> So that's the reading. Nothing dramatic. A question about work, a willingness to leave something good, and a strong suggestion that you stop consulting everyone else for a week. Take what's useful, and leave the rest."

**Block 10 — Emotional range (one or two sentences each, spoken to a person).**

| Colour | Prompt |
|---|---|
| Grief | *"Say something kind to someone whose mother died last month."* |
| Relief | *"Tell someone the thing they were dreading is over."* |
| Frustration | *"Describe a meeting that wasted two hours of your life."* |
| Hope | *"Tell someone a door they thought was shut has opened a crack."* |
| Uncertainty | *"Admit you don't know the answer, and that it's alright not to."* |
| Delight | *"React to something genuinely wonderful happening for a friend."* |

---

## 5. Item 5 — microphone, room, format

**Format — non-negotiable:**
- **48 kHz, 24-bit, WAV**, mono
- Peaks no higher than **−12 dBFS**; average speech **−18 to −20 dBFS**
- **All processing off:** no compression, EQ, de-esser, noise gate, reverb, "vocal enhance", automatic gain
- Keep gain constant for the whole session. If it clips, redo the block rather than ride the knob.

**Microphone:**
- A cardioid condenser (AT2020, NT1, Q2U) or a dynamic (SM7B, MV7). Either is fine; consistency matters more than model.
- **15–20 cm** from the mouth, **15–30° off-axis** to reduce plosives and sibilance.
- Pop filter or foam shield. Closed-back headphones for monitoring so nothing bleeds.

**Room:**
- Small room with carpet, curtains, sofa, books — soft surfaces. A bedroom beats a kitchen every time.
- **Not** a bathroom, kitchen or empty room: hard parallel surfaces produce comb filtering that no model can undo.
- Mic away from the laptop; if the fan spins up, the take is compromised. Put the machine behind a cushion or in another room if the cable allows.
- Silence notifications, phones to airplane, no ticking clocks.

**Session discipline:**
- Record **30 seconds of room tone** at the start, silent. Needed for noise-floor measurement and for any cleanup.
- **Clap once** before each block — gives every file a sync mark.
- Take two full passes. The second is usually more natural.
- **3–5 seconds of silence between blocks** so blocks can be cut cleanly.
- Name files `chas-YYYY-MM-DD-blockNN-takeN.wav`.

---

## 6. Item 6 — trial clone comparison

**Protocol:**
1. Fix a **hold-out set** of 12 sentences covering all blocks. These are never recorded, so neither clone can have seen them.
2. Build two references: **R1** = 10 s cut from the existing clips; **R2** = 10 s cut from the new continuous recording. Same length, both 24 kHz upsampled to the model's input rate, both trimmed to speech-only.
3. Generate the 12 sentences from each with **identical settings** (same model version, same seed where supported, same cfg/exaggeration).
4. Score blind: rename files to A/B, randomise order, judge after a day's gap. Run twice — once same-day, once next-day — and check for consistency.

**What I can and cannot do here.** I can compute objective measurements and design the scoring. I cannot run the clone myself: the package is installed but a cold import exceeded two minutes on this machine with no CUDA reported, so local inference appears CPU-only and slow, and I will not claim a result I have not produced. **Claude or Chas runs the clone; I score the output.**

---

## 7. Item 7 — objective report and listening checklist

### 7.1 Objective measures (per dataset and per sample)

| Measure | Method | Target |
|---|---|---|
| Sample rate / bit depth / codec | ffprobe | 48 kHz / 24-bit / PCM |
| Integrated loudness | ffmpeg `ebur128` | −23 LUFS ±1 |
| True peak | ffmpeg `ebur128` | ≤ −1 dBTP |
| Noise floor | 30 s room tone, RMS | ≤ −60 dBFS |
| Clipping | samples ≥ 0 dBFS | 0 |
| Speech/silence ratio | VAD or energy threshold | report |
| Spectral rolloff | 85% energy below | ≥ 12 kHz (fails on the 24 kHz originals by construction) |
| Speaker similarity | embedding cosine, R1 vs R2 vs target | report pairwise — **method unverified here** |
| Intelligibility | needs ASR | **not available on this machine** |

Two of these I must flag as **not currently computed**: speaker-similarity embeddings and ASR word-error rate both need models not installed. I will not fill those rows with estimates.

### 7.2 Subjective listening checklist for Chas

Listen once for each, on the same headphones, in the same order each time. Score 1–5 (1 = not at all, 5 = completely).

**Identity**
- [ ] Would your family recognise this as you, without being told?
- [ ] Does it sound like you *on a good day*, or like you reading a script?
- [ ] Does the accent land where yours does — not "Scottish", but *your* Scottish?

**Specific features** (say each and compare)
- [ ] The `ch` in *loch*, *nicht* — present, or softened to *k*?
- [ ] The vowel in *hoose*, *doon*, *aboot* — right, or drifted to English?
- [ ] The `r` — tapped, rolled, or flattened?
- [ ] The `wh` in *what*, *where* — distinct, or merged with `w`?
- [ ] Sentence ends — do they fall the way yours do?
- [ ] Questions — do they rise where yours rise?

**Prosody and humanity**
- [ ] Are there breaths in believable places?
- [ ] Are the pauses yours, or the model's?
- [ ] Does it ever sound like it's reading a list?
- [ ] Can it be funny without sounding sarcastic by accident?
- [ ] Can it be kind without sounding saccharine?

**Artefacts**
- [ ] Any buzz, warble, or metallic edge on `s` and `sh`?
- [ ] Any clicks at word boundaries?
- [ ] Any repeated or swallowed words?
- [ ] Any drift in pitch or pace across a long passage?

**The only question that matters**
- [ ] **Would you ship this to a paying seeker?**

---

## 8. Decisions needed

1. **Licence.** XTTS and F5 are non-commercial. Chatterbox is MIT but retired. Which risk does Chas prefer, and is a commercial licence purchase off the table under "no paid services"?
2. **Record now, or clone-test first?** I would test on the existing clips first — it costs an hour and tells you whether the ceiling is the model or the data.
3. **Who runs inference?** Not me, for the reasons in §6.
4. **Human subjects.** A clone of a real person's voice, in a product, has consent and disclosure implications beyond licensing. Worth a sentence of policy from Chas.

No paid services, no external uploads, no production replacement, nothing published.

— Deep
