#!/usr/bin/env bash
# Runs every RESONATE test exactly as CI does (unit) plus every browser test, and records results.
# Usage: bash audit/tools/run-all-tests.sh <out-dir>
# Prerequisites: Node 22; Playwright with Chromium (npm i -D playwright && npx playwright install chromium,
#   or NODE_PATH pointing at an existing playwright install). No network access is needed by the tests.
set -u
OUT="${1:?out dir}"; mkdir -p "$OUT"
cd "$(dirname "$0")/../.."
SHA=$(git rev-parse HEAD); DIRTY=$(git status --porcelain -- . ':!audit' | wc -l)
{
  echo "sha=$SHA"; echo "uncommitted_non_audit_changes=$DIRTY"; echo "node=$(node -v)"
  echo "playwright=$(node -e "console.log(require('playwright/package.json').version)" 2>/dev/null)"
  echo "os=$(uname -sr)"; echo "started=$(date -u +%FT%TZ)"
} > "$OUT/environment.txt"
SUMMARY="$OUT/summary.tsv"; printf 'suite\tcommand\texit\tseconds\tresult_line\n' > "$SUMMARY"
run() { # name, command...
  local name="$1"; shift; local t0=$(date +%s)
  timeout 1800 "$@" > "$OUT/$name.log" 2>&1; local code=$?
  local line=$(grep -E '^# (pass|fail) |[0-9]+/[0-9]+ passed|^PASS [0-9]+|passed|FAIL' "$OUT/$name.log" | tail -2 | tr '\n' ' ' | cut -c1-200)
  printf '%s\t%s\t%s\t%s\t%s\n' "$name" "$*" "$code" "$(( $(date +%s) - t0 ))" "$line" >> "$SUMMARY"
}
for f in app.js deck-engine.js data.js journal.js reading-stage.js astrology-prelude.js astrology-prelude-ui.js reading-pdf.js opening-dice.js reading-session.js navigation-a11y.js; do
  run "syntax-$f" node --check "$f"
done
run unit-all node --test tests/*.test.cjs
for f in tests/*.browser.cjs tests/browser-uat.cjs; do run "$(basename "$f" .cjs)" node "$f"; done
echo "finished=$(date -u +%FT%TZ)" >> "$OUT/environment.txt"
cat "$SUMMARY"
