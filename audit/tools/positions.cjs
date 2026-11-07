// Prints the spread position definitions exactly as implemented in app.js (the only specification in the
// repository), with line numbers, as Markdown tables. Usage: node audit/tools/positions.cjs
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
const start = src.indexOf('const spreads'), end = src.indexOf('\n};', start) + 3;
const spreads = new Function(src.slice(start, end).replace(/^const spreads\s*=/, 'return') )();
const lineOf = i => src.slice(0, i).split('\n').length;
let out = '';
for (const [id, s] of Object.entries(spreads)) {
  out += `\n### ${s.name} (\`${id}\`, ${s.positions.length} positions) · app.js line ${lineOf(src.indexOf(id + ': {name', start))}\n\n| # | Position | Definition (verbatim) |\n|---|---|---|\n`;
  s.positions.forEach((p, i) => { out += `| ${i + 1} | ${p[0]} | ${p[1]} |\n`; });
}
process.stdout.write(out);
