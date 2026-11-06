#!/usr/bin/env python3
"""Item 4 — cross-channel verification of the sample readings, written separately from audit/tools/sample-readings.cjs.
Shares no code with it: different language, different PDF engine (poppler pdftotext, not pdf.js), reads the committed
reading.pdf itself (not pdf-text.txt), and re-implements the clarifier rule rather than calling the app's validate().
For each position it checks, per channel (page text, PDF, Max script): the base card with its orientation, each clarifier
in its slot with its orientation, and that an upright card is never named 'reversed' inside that position's section.
Usage: python3 crosscheck.py <samples-dir> <sample-name>...
"""
import json, re, subprocess, sys, unicodedata, pathlib

def norm(t):
    t = unicodedata.normalize('NFKD', t)
    t = t.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
    t = re.sub('[–—]', '-', t)
    return re.sub(r'\s+', ' ', t).strip()

def disp(c):  # how the app names a card
    return c['name'] + (', reversed' if c['orientation'] == 'reversed' else '')

def sections(text, starts):
    """Cut text at the first occurrence of each start marker, in order. Returns list of section strings or None."""
    out, pos = [], 0
    idx = []
    for s in starts:
        i = text.find(s, pos)
        if i < 0: return None
        idx.append(i); pos = i + len(s)
    for k, i in enumerate(idx):
        out.append(text[i: idx[k + 1] if k + 1 < len(idx) else len(text)])
    return out

def check(root, name):
    d = pathlib.Path(root) / name
    rec = json.loads((d / 'draw-record.json').read_text())
    pdf = norm(subprocess.run(['pdftotext', '-enc', 'UTF-8', str(d / 'reading.pdf'), '-'], capture_output=True, text=True, check=True).stdout)
    page = norm((d / 'written-interpretation.txt').read_text())
    script = json.loads((d / 'presenter-script.json').read_text())
    lines = [norm(p['text']) for p in script]
    one = len(rec['positions']) == 1
    res = {'sample': name, 'spread': rec['spreadName'], 'positions': len(rec['positions']), 'checks': [], 'fail': 0}
    def ok(label, cond, detail=''):
        res['checks'].append(('PASS' if cond else 'FAIL', label, detail))
        if not cond: res['fail'] += 1

    P = rec['positions']
    cards = [c for p in P for c in (p['card'], p['clarifier1'], p['clarifier2']) if c]
    # Rule, re-implemented: no repeats; clarifier 2 only if clarifier 1 is Major; a Major base always has clarifier 1.
    ok('no card repeated in the reading', len({c['id'] for c in cards}) == len(cards), f'{len(cards)} cards')
    for p in P:
        if p['card']['arcana'] == 'Major': ok(f"pos {p['position']}: Major base has clarifier 1", p['clarifier1'] is not None)
        if p['clarifier2']: ok(f"pos {p['position']}: clarifier 2 only after a Major clarifier 1", p['clarifier1'] and p['clarifier1']['arcana'] == 'Major')
        if p['clarifier1'] and p['clarifier1']['arcana'] == 'Major': ok(f"pos {p['position']}: Major clarifier 1 received clarifier 2", p['clarifier2'] is not None)

    # PDF: one section per position, titled "<label> · <card>" (app's downloadReading), in order.
    pdf_secs = sections(pdf, [norm(f"{p['label']} · {disp(p['card'])}") for p in P])
    ok('PDF: every position section present, in order, with base card + orientation', pdf_secs is not None)
    # Page: one block per position, "Original Card · <roman> · <card>", in order.
    page_secs = None
    if pdf_secs is not None or True:
        romans = [re.search(r'Original Card · (\S+) · ' + re.escape(norm(disp(p['card']))), page) for p in P]
        ok('Page: every position block present with base card + orientation', all(romans))
        if all(romans): page_secs = sections(page, [m.group(0) for m in romans])
        ok('Page: position blocks in order', page_secs is not None)
    for chan, secs in (('PDF', pdf_secs), ('Page', page_secs)):
        if secs is None: continue
        for p, s in zip(P, secs):
            for n in (1, 2):
                c = p[f'clarifier{n}']
                has = re.search(rf'Clarifier {n} · \S+ · ' + re.escape(norm(disp(c))), s) if c else None
                if c: ok(f"{chan} pos {p['position']}: clarifier {n} = {disp(c)}", bool(has))
                else: ok(f"{chan} pos {p['position']}: no clarifier {n}", not re.search(rf'Clarifier {n} · ', s))
            for c in (p['card'], p['clarifier1'], p['clarifier2']):
                if c and c['orientation'] == 'upright':
                    ok(f"{chan} pos {p['position']}: '{c['name']}' never named reversed", norm(c['name'] + ', reversed') not in s)

    # Max: label lines name position and card exactly as the app does (presenter.js buildScript).
    for p in P:
        want = norm(f"{disp(p['card'])}.") if one else norm(f"{p['label']}: {disp(p['card'])}.")
        ok(f"Max pos {p['position']}: '{want}'", want in lines)
        for n in (1, 2):
            c = p[f'clarifier{n}']
            pat = norm(f"Clarifier {n}: {disp(c)}.") if (c and one) else (norm(f"Clarifier {n} · {p['label']}: {disp(c)}.") if c else None)
            if c: ok(f"Max pos {p['position']}: '{pat}'", pat in lines)
            else: ok(f"Max pos {p['position']}: no clarifier {n} line", not any(l.startswith(f'Clarifier {n}') and (one or f"· {p['label']}:" in l) for l in lines))
    # Max quotes: each quoted line must appear verbatim on the page and in the PDF.
    quotes = [norm(q['text']) for q in script if q['kind'] == 'quote']
    ok('Max quotes verbatim on page', all(q in page for q in quotes), f'{sum(q in page for q in quotes)}/{len(quotes)}')
    ok('Max quotes verbatim in PDF (poppler)', all(q in pdf for q in quotes), f'{sum(q in pdf for q in quotes)}/{len(quotes)}')
    return res

if __name__ == '__main__':
    root = sys.argv[1]
    total = 0
    for name in sys.argv[2:]:
        r = check(root, name); total += r['fail']
        n = len(r['checks'])
        print(f"## {r['sample']} ({r['spread']}, {r['positions']} positions): {n - r['fail']}/{n} PASS")
        for st, lab, det in r['checks']:
            print(f"  {st}  {lab}{('  [' + det + ']') if det else ''}")
    print(f"\nTOTAL FAILURES: {total}")
    sys.exit(1 if total else 0)
