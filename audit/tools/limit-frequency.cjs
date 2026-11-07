// How often the two-clarifier limit is met (Clarifier 1 and Clarifier 2 both Major), derived, not assumed.
// Usage: node audit/tools/limit-frequency.cjs [trials] [seed]
// 1. One Major card (exact): Clarifier 1 is drawn from the 77 unused cards (21 Majors left); if Major,
//    Clarifier 2 from the 76 left (20 Majors left). P = 21/77 × 20/76.
// 2. A whole Celtic Cross (estimate): no simple closed form, because the ten cards share one deck. Seeded
//    Monte Carlo (mulberry32), clarifying every Major in position order, Clarifier 1 then Clarifier 2, as the
//    app's main button does. Reports the estimate with a 95% interval.
'use strict';
const trials = Number(process.argv[2] || 1000000), seed0 = Number(process.argv[3] || 71107);
function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const exact = (21 / 77) * (20 / 76);
console.log(`One Major card: P(both clarifiers Major) = 21/77 × 20/76 = 420/5852 = ${(100 * exact).toFixed(2)}% (exact)`);
const rng = mulberry32(seed0);
let hit = 0;
for (let r = 0; r < trials; r++) {
  const d = Array.from({ length: 78 }, (_, i) => i);
  for (let i = 77; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  let k = 10, any = false;
  for (let p = 0; p < 10; p++) { if (d[p] > 21) continue; const c1 = d[k++]; if (c1 > 21) continue; if (d[k++] <= 21) any = true; }
  if (any) hit++;
}
const p = hit / trials, half = 1.96 * Math.sqrt(p * (1 - p) / trials);
console.log(`Celtic Cross, every Major clarified: ${(100 * p).toFixed(2)}% of readings have at least one card at the limit (estimate, ${trials} seeded trials, seed ${seed0}; 95% interval ${(100 * (p - half)).toFixed(2)}–${(100 * (p + half)).toFixed(2)}%)`);
