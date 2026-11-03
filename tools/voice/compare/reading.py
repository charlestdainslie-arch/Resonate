"""A whole reading in Chas's cloned voice, as one continuous recording, to judge it the way a listener hears it.

Same rules as compare.py: runs on this computer only, Chas's own voice with his consent, the converted reference is
deleted afterwards, and the output goes to out/ (git-ignored). Each passage is generated in one go, so the model
phrases whole sentences itself; passages are joined with a short pause.

  python tools/voice/compare/reading.py --ref chas.wav --consent "Chas, <date>, recorded for Resonate"

Writes out/reading-<id>-<model>.mp3 and out/reading-<id>-<model>.json (timings per passage).
"""
import argparse, json, os, platform, shutil, sys, tempfile, time

from compare import HERE, OUT, ffmpeg, load, seconds

PAUSE_S = 0.6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', required=True, help="reference recording of Chas's own voice, 10-30 s (wav/mp3/m4a)")
    ap.add_argument('--consent', required=True, help='who agreed, when and where')
    ap.add_argument('--reading', default=os.path.join(HERE, 'reading-demo.json'))
    ap.add_argument('--model', default='nano', choices=['nano', 'turbo', 'original'])
    ap.add_argument('--device', default='cpu', help='cpu, cuda or mps')
    args = ap.parse_args()

    import torch, torchaudio
    reading = json.load(open(args.reading, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    work = tempfile.mkdtemp()
    ref = os.path.join(work, 'ref.wav')
    try:
        ffmpeg('-i', args.ref, '-ac', '1', '-ar', '24000', ref)
        start = time.time()
        tts = load(args.model, args.device)
        load_s = time.time() - start
        tts.prepare_conditionals(ref, exaggeration=0.5)
        pause = torch.zeros(1, int(tts.sr * PAUSE_S))
        parts, timings = [], []
        for i, text in enumerate(reading['passages']):
            t = time.time()
            wav = tts.generate(text)
            made = time.time() - t
            audio = wav.shape[-1] / tts.sr
            parts += [wav, pause]
            timings.append({'passage': i + 1, 'words': len(text.split()), 'audio_s': round(audio, 2),
                            'make_s': round(made, 2), 'rtf': round(made / audio, 2) if audio else None})
            print(f'passage {i + 1}/{len(reading["passages"])}: {audio:.1f} s audio in {made:.1f} s', file=sys.stderr)
        whole = os.path.join(work, 'reading.wav')
        torchaudio.save(whole, torch.cat(parts[:-1], dim=-1), tts.sr)
        name = f'reading-{reading["id"]}-{args.model}'
        mp3 = os.path.join(OUT, name + '.mp3')
        ffmpeg('-i', whole, '-ac', '1', '-b:a', '96k', mp3)
    finally:
        shutil.rmtree(work, ignore_errors=True)  # the converted reference never stays on disk

    result = {'consent': args.consent, 'reading': reading['title'], 'model': args.model,
              'machine': f'{platform.system()} {platform.machine()}, {os.cpu_count()} CPUs, device={args.device}',
              'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'model_load_s': round(load_s, 1),
              'audio_s': round(seconds(mp3), 2), 'passages': timings}
    json.dump(result, open(os.path.join(OUT, name + '.json'), 'w'), indent=1)
    print('Wrote', mp3, file=sys.stderr)


if __name__ == '__main__':
    main()
