#!/usr/bin/env bash
# Builds audit/MANIFEST.sha256 (every evidence file + its SHA-256) and a portable zip for reviewers
# without GitHub access. Usage: bash audit/tools/package.sh <tested-sha> <zip-path>
# Verify later with:  cd audit && sha256sum -c MANIFEST.sha256
set -eu
SHA="${1:?tested sha}"; ZIP="${2:?zip path}"
cd "$(dirname "$0")/.."
find . -type f ! -name MANIFEST.sha256 ! -name '*.zip' | sed 's|^\./||' | LC_ALL=C sort | xargs sha256sum > MANIFEST.sha256
echo "files: $(wc -l < MANIFEST.sha256)"
rm -f "$ZIP"
cd ..
zip -qr -X "$ZIP" audit -x 'audit/*.zip'
echo "zip: $ZIP ($(du -h "$ZIP" | cut -f1)) for tested SHA $SHA"
