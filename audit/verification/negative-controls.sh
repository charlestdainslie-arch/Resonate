#!/usr/bin/env bash
# Recreates the three deliberately corrupted sample copies used to show crosscheck.py catches errors,
# then runs the checker on them. Expected: exit 1 and 8 FAIL lines (see 04-negative-controls.txt).
# Usage (from the repository root): bash audit/verification/negative-controls.sh
set -u
N=$(mktemp -d)
cp -r audit/samples/three "$N/three-flip"; cp -r audit/samples/celtic "$N/celtic-clar"; cp -r audit/samples/three "$N/three-quote"
python3 - "$N" <<'EOF'
import json, sys
n = sys.argv[1]
# 1) Claim Queen of Swords (S2 position 2) is upright, although every channel says reversed
p = n + '/three-flip/draw-record.json'; d = json.load(open(p)); d['positions'][1]['card']['orientation'] = 'upright'; json.dump(d, open(p, 'w'))
# 2) Claim a different Clarifier 1 for S3 position 4 (The Sun) than the one drawn
p = n + '/celtic-clar/draw-record.json'; d = json.load(open(p)); d['positions'][3]['clarifier1']['name'] = 'Knight of Cups'; json.dump(d, open(p, 'w'))
# 3) Insert one word into a Max quote (Max saying something not in the reading)
p = n + '/three-quote/presenter-script.json'; s = json.load(open(p)); q = [x for x in s if x['kind'] == 'quote'][2]; q['text'] = q['text'].replace(' ', ' really ', 1); json.dump(s, open(p, 'w'))
EOF
python3 audit/verification/crosscheck.py "$N" three-flip celtic-clar three-quote
echo "exit=$? (expected 1)"
