#!/usr/bin/env bash
# Checks that the shuffle and deal are byte-for-byte the approved reference.
# Usage: audit/tools/shuffle-identity.sh [reference-commit] [candidate-commit]
# Reference: 73da97d, the deck theatre build Chas reviewed and approved on 6 Nov ("Brilliant shuffle").
# Files: deck-theatre.js / .css (shuffle and deal animation), deck-engine.js (Fisher-Yates prepareDeck /
# drawRemaining), reading-stage.js (selectDraw / startDraw / commitDraw).
set -euo pipefail
REF=${1:-73da97d}; CAND=${2:-HEAD}
status=0
printf '%-20s %-12s %-12s %s\n' file reference candidate result
for f in deck-theatre.js deck-theatre.css deck-engine.js reading-stage.js; do
  a=$(git rev-parse "$REF:$f"); b=$(git rev-parse "$CAND:$f")
  if [ "$a" = "$b" ]; then r=IDENTICAL; else r=DIFFERENT; status=1; fi
  printf '%-20s %-12s %-12s %s\n' "$f" "${a:0:12}" "${b:0:12}" "$r"
done
echo "reference $(git rev-parse "$REF")"; echo "candidate $(git rev-parse "$CAND")"
exit $status
