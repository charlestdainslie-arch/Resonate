"""Private voice comparison for Max Chasroom: Chas's own cloned voice, several models and settings, side by side.

Runs Chatterbox (github.com/resemble-ai/chatterbox, MIT) on this computer only. Nothing is uploaded: the
model downloads once from huggingface.co, then everything runs offline. Every output carries Chatterbox's
inaudible PerTh watermark marking it as AI-generated.

Only use a reference recording of Chas's own voice, made with his consent.

  python -m venv .venv && . .venv/bin/activate        (Windows: .venv\\Scripts\\activate)
  pip install chatterbox-tts                          (Python 3.10-3.13)
  python tools/voice/compare/compare.py --ref chas.m4a --consent "Chas, <date>, recorded for Resonate"
  then open tools/voice/compare/out/listen.html in a browser to listen and grade.

  --fake    no model: writes short test tones, to check the harness itself works.
  --models  nano,turbo,original (default nano; add turbo/original if you have an NVIDIA or Apple GPU).
  --delete  removes out/ and the converted reference, leaving nothing behind.

Writes out/<model>-<setting>-<script>.mp3, out/results.js (for listen.html) and out/results.json
(timings: seconds of audio, seconds to make it, real-time factor).
"""
import argparse, json, os, platform, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
# A few settings worth hearing side by side. Turbo and Nano ignore exaggeration/cfg, so they get one setting.
SETTINGS = {
    'original': [('calm', 0.4, 0.5), ('default', 0.5, 0.5), ('lively', 0.7, 0.3)],
    'turbo': [('default', None, None)],
    'nano': [('default', None, None)],
}


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], check=True)


def seconds(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out or 0)


def load(model, device):
    if model == 'original':
        from chatterbox.tts import ChatterboxTTS
        return ChatterboxTTS.from_pretrained(device=device)
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    return ChatterboxTurboTTS.from_pretrained(device=device, nano=model == 'nano')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', help="reference recording of Chas's own voice, 10-30 s (wav/mp3/m4a)")
    ap.add_argument('--consent', help='who agreed, when and where')
    ap.add_argument('--models', default='nano')
    ap.add_argument('--device', default='cpu', help='cpu, cuda or mps')
    ap.add_argument('--fake', action='store_true')
    ap.add_argument('--delete', action='store_true')
    args = ap.parse_args()

    if args.delete:
        shutil.rmtree(OUT, ignore_errors=True)
        print('Deleted', OUT)
        return
    if not args.fake and not (args.ref and args.consent):
        ap.error('--ref and --consent are required (or --fake to test the harness)')

    scripts = json.load(open(os.path.join(HERE, 'scripts.json')))['scripts']
    os.makedirs(OUT, exist_ok=True)
    work = tempfile.mkdtemp()
    ref = os.path.join(work, 'ref.wav')
    if not args.fake:
        ffmpeg('-i', args.ref, '-ac', '1', '-ar', '24000', ref)
        ref_seconds = seconds(ref)
        if not 5 <= ref_seconds <= 40:
            print(f'Warning: reference is {ref_seconds:.1f} s; 10-30 s of clear speech works best.', file=sys.stderr)

    results = {'consent': args.consent or 'fake run, no voice', 'machine': f'{platform.system()} {platform.machine()}, {os.cpu_count()} CPUs, device={args.device}',
               'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'scripts': scripts, 'samples': []}
    try:
        for model in args.models.split(','):
            start = time.time()
            tts = None if args.fake else load(model, args.device)
            load_s = time.time() - start
            for name, exaggeration, cfg in SETTINGS[model]:
                if not args.fake:
                    tts.prepare_conditionals(ref, exaggeration=exaggeration if exaggeration is not None else 0.5)
                for script in scripts:
                    file = f'{model}-{name}-{script["id"]}.mp3'
                    wav = os.path.join(work, 'line.wav')
                    t = time.time()
                    if args.fake:
                        ffmpeg('-f', 'lavfi', '-i', 'sine=frequency=220:duration=1.5', wav)
                    else:
                        import torchaudio
                        kw = {} if model != 'original' else {'exaggeration': exaggeration, 'cfg_weight': cfg}
                        torchaudio.save(wav, tts.generate(script['text'], **kw), tts.sr)
                    made = time.time() - t
                    ffmpeg('-i', wav, '-ac', '1', '-b:a', '64k', os.path.join(OUT, file))
                    audio = seconds(os.path.join(OUT, file))
                    results['samples'].append({'file': file, 'model': model, 'setting': name, 'script': script['id'],
                                               'audio_s': round(audio, 2), 'make_s': round(made, 2),
                                               'rtf': round(made / audio, 2) if audio else None, 'model_load_s': round(load_s, 1)})
                    print(f'{file}: {audio:.1f} s audio in {made:.1f} s', file=sys.stderr)
    finally:
        shutil.rmtree(work, ignore_errors=True)  # the converted reference never stays on disk

    json.dump(results, open(os.path.join(OUT, 'results.json'), 'w'), indent=1)
    open(os.path.join(OUT, 'results.js'), 'w').write('window.RESULTS = ' + json.dumps(results) + ';\n')
    shutil.copy(os.path.join(HERE, 'listen.html'), os.path.join(OUT, 'listen.html'))
    print('Open', os.path.join(OUT, 'listen.html'), file=sys.stderr)


if __name__ == '__main__':
    main()
