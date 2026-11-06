// Exports the full 78-card dataset exactly as shipped in data.js, plus a provenance/correspondence analysis.
// Usage: node audit/tools/export-dataset.cjs   (writes audit/sources/cards-78.json, .csv, correspondence-analysis.json)
// Deterministic: no network, no randomness. Re-run on any SHA to reproduce.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'audit', 'sources');
fs.mkdirSync(OUT, { recursive: true });

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8') + '\n;globalThis.__cards=cards;', ctx);
const cards = ctx.__cards;
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/deck/manifest.json'), 'utf8'));
const catalogue = require(path.join(ROOT, 'tarot-catalogue.js'));

// Reference: Hermetic Order of the Golden Dawn Major Arcana attributions (as commonly reproduced from "Book T" /
// Crowley's "Liber 777"). Named as the comparison system only — NO page-level citation is asserted here.
// A reviewer should verify against a primary edition before this column is relied on.
const GD = ['Air','Mercury','The Moon','Venus','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Jupiter','Libra',
  'Water','Scorpio','Sagittarius','Capricorn','Mars','Aquarius','Pisces','Sun','Fire','Saturn'];
const SIGNS = { Aries:'Fire', Leo:'Fire', Sagittarius:'Fire', Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air', Cancer:'Water', Scorpio:'Water', Pisces:'Water' };
const SUIT_EL = { Wands:'Fire', Cups:'Water', Swords:'Air', Pentacles:'Earth' };

// Detect templated (machine-generated) fields: the text is built from the card name + journal prompt.
const templated = c => ({
  spiritual: c.spiritual.startsWith(`${c.name} invites reflection on`),
  wuWei: c.wuWei.startsWith(`A practice of unforced attention with ${c.name}:`),
  wabiSabi: c.wabiSabi.startsWith('An imperfect, lived expression of')
});

const rows = cards.slice().sort((a, b) => a.id - b.id).map(c => {
  const m = manifest.find(x => x.id === c.id) || {};
  const img = path.join(ROOT, c.image);
  const sha = fs.existsSync(img) ? crypto.createHash('sha256').update(fs.readFileSync(img)).digest('hex') : null;
  const cat = catalogue.find(x => x.id === c.id);
  const astroParts = String(c.astrology).split(' · ').map(s => s.trim());
  let gdMatch = 'N/A (Minor: no decan/planet stored)';
  let elementRule = 'Suit element (Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth) — standard; source text UNKNOWN';
  if (c.arcana === 'Major') {
    gdMatch = astroParts[0] === GD[c.id] ? (astroParts.length > 1 ? 'PARTIAL (extra: ' + astroParts.slice(1).join(', ') + ')' : 'MATCH') : `DIFFERS (Golden Dawn: ${GD[c.id]})`;
    const sign = astroParts.find(p => SIGNS[p]);
    elementRule = sign ? `Triplicity of ${sign} (${SIGNS[sign]})` + (SIGNS[sign] === c.element ? '' : ' — MISMATCH')
      : ['Air','Water','Fire','Earth'].includes(astroParts[0]) ? `Elemental attribution (${astroParts[0]})` + (astroParts[0] === c.element ? '' : ' — MISMATCH')
      : `Planet → element mapping (${astroParts[0]} → ${c.element}): rule UNKNOWN, not documented in repo`;
  } else if (SUIT_EL[c.suit] !== c.element) elementRule += ' — MISMATCH';
  const t = templated(c);
  return {
    id: c.id, name: c.name, arcana: c.arcana, suit: c.suit, rank: c.rank, number: c.number, roman: c.roman,
    catalogue_name_matches: !!cat && cat.name === c.name,
    subtitle: c.subtitle,
    upright_keywords: c.uprightKeywords, reversed_keywords: c.reversedKeywords,
    upright: c.upright, reversed: c.reversed,
    numerology: c.numerology,
    element: c.element, astrology_as_stored: c.astrology,
    golden_dawn_major_comparison: gdMatch,
    element_derivation: elementRule,
    minor_decan_or_planet: c.arcana === 'Minor' ? 'NOT PRESENT in data (no decan, planet or sign stored)' : 'N/A',
    psychological: c.psychological, spiritual: c.spiritual, wu_wei: c.wuWei, wabi_sabi: c.wabiSabi,
    symbolism: c.symbolism, journal_prompt: c.journalPrompt,
    connections: c.connections,
    templated_fields: Object.keys(t).filter(k => t[k]),
    image_file: c.image, image_sha256_actual: sha,
    image_sha256_manifest: m.sha256 || null,
    image_hash_verified: !!sha && sha === m.sha256,
    image_source: m.source || 'UNKNOWN',
    text_provenance: c.id <= 4
      ? 'In-repo editorial (commits a75e591 2026-09-04, 7eccfb4 2026-09-07). Author/reference source not recorded: UNKNOWN'
      : 'In-repo editorial (commit f488713 2026-10-22). Author/reference source not recorded: UNKNOWN',
    correspondence_source_citation: 'UNKNOWN — no citation stored in repo'
  };
});

fs.writeFileSync(path.join(OUT, 'cards-78.json'), JSON.stringify({
  generated_from: 'data.js + assets/deck/manifest.json + tarot-catalogue.js',
  count: rows.length, cards: rows }, null, 1));

const flat = ['id','name','arcana','suit','rank','number','element','astrology_as_stored','golden_dawn_major_comparison',
  'element_derivation','minor_decan_or_planet','upright_keywords','reversed_keywords','upright','reversed','numerology',
  'templated_fields','image_file','image_hash_verified','image_source','text_provenance','correspondence_source_citation'];
const esc = v => { const s = Array.isArray(v) ? v.join('; ') : v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
fs.writeFileSync(path.join(OUT, 'cards-78.csv'), '﻿' + [flat.join(','), ...rows.map(r => flat.map(k => esc(r[k])).join(','))].join('\n') + '\n');

const majors = rows.filter(r => r.arcana === 'Major'), minors = rows.filter(r => r.arcana === 'Minor');
const summary = {
  count: rows.length, unique_ids: new Set(rows.map(r => r.id)).size,
  majors: majors.length, minors: minors.length,
  all_names_match_catalogue: rows.every(r => r.catalogue_name_matches),
  images_hash_verified: rows.filter(r => r.image_hash_verified).length,
  golden_dawn_major: {
    match: majors.filter(r => r.golden_dawn_major_comparison === 'MATCH').map(r => r.name),
    partial: majors.filter(r => r.golden_dawn_major_comparison.startsWith('PARTIAL')).map(r => `${r.name}: ${r.golden_dawn_major_comparison}`),
    differs: majors.filter(r => r.golden_dawn_major_comparison.startsWith('DIFFERS')).map(r => `${r.name}: stored ${r.astrology_as_stored}; ${r.golden_dawn_major_comparison}`)
  },
  planet_element_rule_undocumented: majors.filter(r => r.element_derivation.includes('rule UNKNOWN')).map(r => `${r.name}: ${r.element_derivation}`),
  element_mismatches: rows.filter(r => r.element_derivation.includes('MISMATCH')).map(r => r.name),
  minors_with_decans: 0,
  cards_with_templated_fields: rows.filter(r => r.templated_fields.length).length,
  minors_connection_counts: [...new Set(minors.map(r => r.connections.length))],
  text_citations_present: 0
};
fs.writeFileSync(path.join(OUT, 'correspondence-analysis.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
