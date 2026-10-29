"""Record Max Chasroom's lines in a cloned voice, ahead of time, for presenter-uat.html.

Uses Chatterbox (github.com/resemble-ai/chatterbox, Resemble AI, MIT licence) on the local machine: no reading
or recording is sent to any service. Chatterbox adds an inaudible watermark marking the audio as AI-generated.
Models: --model nano (110M, English, the one Resemble AI says runs on CPU: about 3x real time on 8 cores),
turbo (350M, English, wants a GPU) or original (the first Chatterbox, 0.5B). Not yet run end to end:
this sandbox cannot install the model, so the first real run is on Chas's machine.
Only run this with a reference recording whose owner has agreed to their voice being cloned for Resonate.

  pip install chatterbox-tts   (Python 3.10-3.13; the model downloads once from huggingface.co)
  node tools/voice/export-clips.cjs --demo > clips.json      (25 lines; drop --demo for all ~2,200)
  python tools/voice/generate.py --model nano --ref chas.wav --clips clips.json --out voice/chas \
      --label "Chas's voice, cloned with Chas's permission" --consent "Chas, 28 Oct 2026, project thread"

Writes <out>/<id>.mp3 for each line plus <out>/manifest.json. Lines already recorded are skipped, so a
run can be stopped and resumed, or extended from the demo batch to the full deck.
"""
import argparse, json, os, subprocess, sys, tempfile, time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', required=True, help='reference recording of the speaker (wav/mp3/m4a, 10-30 s)')
    ap.add_argument('--model', choices=['nano', 'turbo', 'original'], default='nano')
    ap.add_argument('--device', default='cpu', help='cpu, cuda or mps')
    ap.add_argument('--clips', required=True, help='output of export-clips.cjs')
    ap.add_argument('--out', required=True)
    ap.add_argument('--label', required=True, help='shown under the player, e.g. whose voice and on what basis')
    ap.add_argument('--consent', required=True, help='who agreed, when and where')
    ap.add_argument('--exaggeration', type=float, default=0.55)
    ap.add_argument('--cfg', type=float, default=0.45)
    args = ap.parse_args()

    import torchaudio

    os.makedirs(args.out, exist_ok=True)
    manifest_path = os.path.join(args.out, 'manifest.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {'clips': {}}
    clips = json.load(open(args.clips))

    # The model wants a wav prompt; convert whatever the phone recorded.
    ref = os.path.join(tempfile.mkdtemp(), 'ref.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', args.ref, '-ac', '1', '-ar', '24000', ref], check=True)

    if args.model == 'original':
        from chatterbox.tts import ChatterboxTTS
        model = ChatterboxTTS.from_pretrained(device=args.device)
        say = lambda text: model.generate(text, exaggeration=args.exaggeration, cfg_weight=args.cfg)
    else:
        from chatterbox.tts_turbo import ChatterboxTurboTTS
        model = ChatterboxTurboTTS.from_pretrained(device=args.device, nano=args.model == 'nano')
        say = lambda text: model.generate(text)
    model.prepare_conditionals(ref, exaggeration=args.exaggeration)  # once, not per line
    todo = [c for c in clips if c['id'] not in manifest['clips']]
    print(f'{len(todo)} of {len(clips)} lines to record', file=sys.stderr)
    for n, clip in enumerate(todo, 1):
        start = time.time()
        wav = say(clip['spoken'])
        tmp = os.path.join(tempfile.gettempdir(), clip['id'] + '.wav')
        torchaudio.save(tmp, wav, model.sr)
        name = clip['id'] + '.mp3'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-ac', '1', '-b:a', '64k', os.path.join(args.out, name)], check=True)
        os.remove(tmp)
        manifest['clips'][clip['id']] = name
        manifest.update(label=args.label, consent=args.consent, model=f'Chatterbox {args.model} (Resemble AI, MIT), run locally',
                        generated=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
        json.dump(manifest, open(manifest_path, 'w'), indent=1, sort_keys=True)
        print(f'{n}/{len(todo)} {clip["id"]} {time.time() - start:.1f}s', file=sys.stderr)


if __name__ == '__main__':
    main()
