# Max Chasroom voice comparison (private, on Chas's own computer)

This compares cloned versions of **Chas's own voice**, made only with his consent, across Chatterbox models and settings, so he can listen and grade them. Nothing is uploaded. Every output carries Chatterbox's inaudible watermark marking it as AI-generated. Nothing here is a finished clone until Chas has listened and graded it.

## 1. Record the reference (5 minutes)
- 10–30 seconds of you talking naturally, in your normal accent and pace. For example, tell the story of your day.
- Quiet room: no TV, music or fan. Hold the phone 20–30 cm from your mouth. Use one take, and only your voice.
- Your phone's voice-memo app is fine (m4a/mp3/wav).
- An hour of recordings is **not** needed: Chatterbox clones from one short clip. Record a couple of different clips only if the first sounds off, then compare them.

## 2. Set up (once)
Needs Python 3.10–3.13 and ffmpeg.
- **Any 8-core computer:** the `nano` model runs on the CPU. Resemble AI says about 3× faster than real time; not yet measured.
- **NVIDIA graphics card:** add `--device cuda --models nano,turbo,original` to compare all three.
- **Apple Silicon Mac:** `--device mps` works for `original`. Use `cpu` for nano and turbo.

```
python -m venv .venv
. .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install chatterbox-tts      # model downloads once from huggingface.co on first run
```

## 3. Run and listen
```
python tools/voice/compare/compare.py --ref my-voice.m4a --consent "Chas, 29 Oct 2026, for Resonate"
```
Then open `tools/voice/compare/out/listen.html` in a browser. Each script plays per model and setting, next to the device's own browser voice (clearly labelled NOT Chas). Grade 1–5, add notes, then press **Save grades**.

`--fake` checks the harness without the model, by writing test tones.

## 4. Delete everything
```
python tools/voice/compare/compare.py --delete
```
This removes `out/`. The converted reference is deleted automatically after every run. Your original voice memo stays wherever you saved it: delete it yourself if you want it gone. `out/` is git-ignored, so the clips can't be committed by accident.

## Scripts
`scripts.json` has five short scripts: conversational, a tarot reading line, humour, Scottish place names, and numbers/positions. Each is original or taken from the app's own text, with its source marked.
