#!/usr/bin/env bash
# Checks that the shuffle and deal are byte-for-byte the approved reference.
# Usage: audit/tools/shuffle-identity.sh [reference-commit] [candidate-commit]
# Reference: 73da97d, the deck theatre build Chas reviewed and approved on 6 Nov ("Brilliant shuffle").
# Files: deck-theatre.js / .css (shuffle and deal animation), deck-engine.js (Fisher-Yates prepareDeck /
# drawRemaining), reading-stage.js (selectDraw / startDraw / commitDraw).
# 7 Nov 2026: Chas approved secure randomness for live draws. deck-engine.js is compared with that approved
# version (blob below) instead of 73da97d; the animation and draw flow must still match 73da97d exactly.
set -euo pipefail
ENGINE_APPROVED=08e42e6a2fd586eb79abe2557c10ab3cb09780d2
REF=${1:-73da97d}; CAND=${2:-HEAD}
status=0
printf '%-20s %-12s %-12s %s\n' file reference candidate result
echo "(deck-engine.js reference: the approved secure-randomness version, 7 Nov 2026)"
for f in deck-theatre.js deck-theatre.css deck-engine.js reading-stage.js; do
  a=$(git rev-parse "$REF:$f"); b=$(git rev-parse "$CAND:$f")
  if [ "$f" = deck-engine.js ]; then a=$ENGINE_APPROVED; fi
  if [ "$a" = "$b" ]; then r=IDENTICAL; else r=DIFFERENT; status=1; fi
  printf '%-20s %-12s %-12s %s\n' "$f" "${a:0:12}" "${b:0:12}" "$r"
done
echo "reference $(git rev-parse "$REF")"; echo "candidate $(git rev-parse "$CAND")"
exit $status
