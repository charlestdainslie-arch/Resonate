"""OpenVoice V2 (github.com/myshell-ai/OpenVoice, MIT) for compare.py: a Scottish base voice, recoloured to sound like Chas.

OpenVoice copies the colour of a voice (timbre), not its accent: the accent comes from the base speech it converts.
So the base is Piper (github.com/OHF-Voice/piper1-gpl, GPL-3, used here only as a local tool) speaking with one of
the Scottish speakers in its VCTK voice (Edinburgh University CSTR, CC BY 4.0), or the Scottish "alba" voice.

Needs its own environment, because OpenVoice's pins clash with Chatterbox's (see README.md):
  .venv-openvoice\\Scripts\\python tools/voice/compare/compare.py --models openvoice --bases vctk:p252 --ref ... --consent ...
  .venv-openvoice\\Scripts\\python tools/voice/compare/openvoice_tts.py --audition   (Piper alone, every Scottish candidate)

Models download once (huggingface.co: myshell-ai/OpenVoiceV2, rhasspy/piper-voices) to ~/.cache/resonate-voice.
Nothing is uploaded. Outputs carry OpenVoice's WavMark watermark marking them as AI-generated.
"""
import json, os, sys, tempfile, urllib.request, wave

CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'resonate-voice')
HF = 'https://huggingface.co/{repo}/resolve/main/{path}'
PIPER = {'vctk': 'en/en_GB/vctk/medium/en_GB-vctk-medium', 'alba': 'en/en_GB/alba/medium/en_GB-alba-medium'}
# Scottish men in VCTK (speaker-info.txt), to be confirmed by ear with --audition.
SCOTTISH_MEN = {'p237': 'Fife', 'p241': 'Perth', 'p246': 'Selkirk', 'p247': 'Argyll', 'p252': 'Edinburgh',
                'p255': 'Galloway', 'p260': 'Orkney', 'p263': 'Aberdeen', 'p271': 'Fife', 'p272': 'Edinburgh',
                'p275': 'Midlothian', 'p281': 'Edinburgh', 'p284': 'Fife', 'p285': 'Edinburgh'}
# Spoken by the base voice to measure its own colour, so only the difference to Chas is applied.
SOURCE_LINES = ['Right, come in and sit yourself down, the kettle is on.',
                'Take a breath, there is no rush, we will look at it together.',
                'The cards are only a perspective, never a fixed prediction.']


def fetch(repo, path):
    dest = os.path.join(CACHE, repo.replace('/', '--'), path)
    if not os.path.exists(dest):
        try:  # Windows' certificate store, so antivirus HTTPS scanning (e.g. Norton) doesn't break the download.
            from pip._vendor import truststore
            truststore.inject_into_ssl()
        except ImportError:
            pass
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        urllib.request.urlretrieve(HF.format(repo=repo, path=path), dest + '.part')
        os.replace(dest + '.part', dest)
    return dest


class Piper:
    def __init__(self, base):
        from piper import PiperVoice
        name, _, self.speaker = base.partition(':')
        model = fetch('rhasspy/piper-voices', PIPER[name] + '.onnx')
        config = fetch('rhasspy/piper-voices', PIPER[name] + '.onnx.json')
        self.voice = PiperVoice.load(model, config_path=config)
        speakers = json.load(open(config, encoding='utf-8')).get('speaker_id_map', {})
        if self.speaker and self.speaker not in speakers:
            raise SystemExit(f'{base}: no such speaker in the {name} voice')
        self.speaker_id = speakers.get(self.speaker)

    def say(self, text, path):
        from piper import SynthesisConfig
        with wave.open(path, 'wb') as out:
            self.voice.synthesize_wav(text, out, syn_config=SynthesisConfig(speaker_id=self.speaker_id))


class OpenVoiceTTS:
    """The same three calls compare.py makes of Chatterbox: prepare_conditionals, generate and sr."""

    def __init__(self, device='cpu'):
        from openvoice.api import ToneColorConverter
        config = fetch('myshell-ai/OpenVoiceV2', 'converter/config.json')
        ckpt = fetch('myshell-ai/OpenVoiceV2', 'converter/checkpoint.pth')
        self.converter = ToneColorConverter(config, device=device)
        self.converter.load_ckpt(ckpt)
        self.sr = self.converter.hps.data.sampling_rate
        self.work = tempfile.mkdtemp()
        self.target = self.piper = self.source = None

    def prepare_conditionals(self, ref, base):
        if self.target is None:
            self.target = self.converter.extract_se([ref])  # Chas's voice colour, from the reference only
        self.piper = Piper(base)
        lines = []
        for i, text in enumerate(SOURCE_LINES):
            lines.append(os.path.join(self.work, f'source{i}.wav'))
            self.piper.say(text, lines[-1])
        self.source = self.converter.extract_se(lines)

    def generate(self, text, tau=0.3):
        import torch
        base_wav = os.path.join(self.work, 'base.wav')
        self.piper.say(text, base_wav)
        audio = self.converter.convert(audio_src_path=base_wav, src_se=self.source, tgt_se=self.target, tau=tau)
        return torch.from_numpy(audio).float().unsqueeze(0)


def audition():
    """Piper alone, each Scottish candidate saying the place-names line, to pick the base voice by ear."""
    from compare import HERE, OUT, ffmpeg
    text = next(s['text'] for s in json.load(open(os.path.join(HERE, 'scripts.json')))['scripts'] if s['id'] == 'places')
    out = os.path.join(OUT, 'piper-audition')
    os.makedirs(out, exist_ok=True)
    work = tempfile.mkdtemp()
    for base in [f'vctk:{s}' for s in SCOTTISH_MEN] + ['alba']:
        wav = os.path.join(work, 'line.wav')
        Piper(base).say(text, wav)
        name = base.replace(':', '-') + (f'-{SCOTTISH_MEN[base[5:]]}' if base.startswith('vctk:') else '')
        ffmpeg('-i', wav, '-ac', '1', '-b:a', '64k', os.path.join(out, name + '.mp3'))
        print(name, file=sys.stderr)
    print('Listen in', out, file=sys.stderr)


if __name__ == '__main__' and '--audition' in sys.argv:
    audition()
