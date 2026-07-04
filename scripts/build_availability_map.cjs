#!/usr/bin/env node
/**
 * build_availability_map.cjs
 * Builds tawjihi/data/kb/availability-map.json:
 * per KB specialty -> wilayas where it is offered, establishments per wilaya,
 * scope (national/regional/unknown), plus per-wilaya specialty counts.
 *
 * Sources:
 *  - tawjihi/data/kb/admissions-full.json  (4,445 rows of 2025 admissions)
 *  - tawjihi/data/kb/filiere-index.json    (filiere key -> rowIndices)
 *  - tawjihi/data/kb/specialities-kb.json  (181 KB entries)
 *
 * Mapping strategy (in order):
 *  1. linkedFiliereKeys  -> filiere-index rowIndices (primary, set by earlier linker)
 *  2. linkedEtabRows     -> direct row indices (grande-ecole recovery pass, gen_links2.py)
 *  3. FILIERE_FALLBACK   -> curated regex over de-accented filiere labels
 *  4. ETAB_FALLBACK      -> curated regex over de-accented establishment names
 *
 * Scope interpretation of admissions `type` (distinct values inspected in data):
 *  - "national" (3 rows)       : RECRUTEMENT NATIONAL rows (medecine/pharmacie/chirurgie
 *                                dentaire pools) -> wilaya is null, orientation is national.
 *  - "grande_ecole" (24 rows)  : ecoles superieures / grandes ecoles -> national
 *                                recruitment (student is oriented to the hosting wilaya).
 *  - "university" (4,418 rows) : ordinary university filieres -> regional, access governed
 *                                by the geographic circles of the hosting wilaya.
 * CAVEAT: `type` under-tags the grandes ecoles. 37 rows have a filiere label prefixed
 * "FB " (formation de base of an ecole superieure, e.g. "FB INF ECOLE SUPERIEURE ...
 * BEJAIA" = ESTIN) and only some of them carry type=grande_ecole; the rest are typed
 * "university" although they recruit nationally. A row therefore counts as NATIONAL
 * recruitment when: type is national/grande_ecole OR its filiere starts with "FB ".
 * (Ecoles normales superieures are NOT national: their 873 rows are per-wilaya quotas
 * "pour bacheliers X" -> regional.)
 * Entry scope: no rows -> "unknown"; all rows national-recruitment -> "national";
 * rows exist but none has a wilaya (null-wilaya school rows) -> "national";
 * otherwise -> "regional" (mixed entries are treated as regional because university
 * access via circles is the default path; national-school rows still appear in
 * establishments).
 *
 * Usage: node scripts/build_availability_map.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KB = path.join(ROOT, 'tawjihi', 'data', 'kb');
const OUT = path.join(KB, 'availability-map.json');

const load = (f) => JSON.parse(fs.readFileSync(path.join(KB, f), 'utf8'));
const adm = load('admissions-full.json');
const rows = adm.rows;
const filieres = load('filiere-index.json').filieres;
const kb = load('specialities-kb.json');
const specs = kb.specialities;

// De-accent + uppercase (same normalization as the earlier Python linkers).
const norm = (s) =>
  (s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();

const NROWS = rows.map((r) => ({ etab: norm(r.etab), fil: norm(r.filiere) }));

// ---------------------------------------------------------------------------
// Fallback 3: KB id -> regex list over de-accented filiere LABEL.
// Every pattern was verified against the 3,137 distinct labels before inclusion.
// ---------------------------------------------------------------------------
const FILIERE_FALLBACK = {
  allemand: [/^LANGUE ALLEMANDE/],
  anglais: [/^LANGUE ANGLAISE(?!.*\+)/],
  arabe: [/^LANGUE ET LITTERATURE ARABES/],
  francais: [/^LANGUE FRANCAISE/],
  espagnol: [/^LANGUE ESPAGNOLE/],
  italien: [/^LANGUE ITALIENNE/],
  russe: [/^LANGUE RUSSE/],
  chinois: [/^LANGUE CHINOISE/],
  turc: [/^LANGUE TURQUE/],
  tamazight: [/^LANGUE ET CULTURE AMAZIGHES/],
  geologie: [/^GEOLOGIE/],
  geographie: [/^GEOGRAPHIE ET AMENAGEMENT/],
  archeologie: [/^SCIENCES HUMAINES ARCHEOLOGIE/],
  arts: [/^ARTS$/],
  staps: [/^SCIENCES ET TECHNIQUES DES ACTIVITES PHYSIQUES ET SPORTIVES/],
  telecom: [/^TELECOMMUNICATIONS/],
  electro: [/^ELECTROTECHNIQUE/],
  auto: [/^AUTOMATIQUE/],
  hydro: [/^HYDRAULIQUE/],
  agro: [/^SCIENCES AGRONOMIQUES/],
  agronomie: [/^SCIENCES AGRONOMIQUES/],
  agroalimentaire: [/^SCIENCES ALIMENTAIRES/],
  petrochimie: [/^INDUSTRIES PETROCHIMIQUES/],
  hse: [/^HYGIENE ET SECURITE INDUSTRIELLE/],
  sociales: [/^SCIENCES SOCIALES/],
  eco: [/^SCIENCES ECONOMIQUES(?!.*\+)/],
  gestion: [/^SCIENCES DE GESTION(?!.*\+)/, /^SCIENCES ECONOMIQUES, DE GESTION ET COMMERCIALES/],
  commerce: [/^SCIENCES COMMERCIALES/, /^SCIENCES ECONOMIQUES, DE GESTION ET COMMERCIALES/],
  'city-jobs': [/^METIERS DE LA VILLE/],
  cinema: [/^CINEMA ET MEDIA NUMERIQUE/],
  'cinema-media': [/^CINEMA ET MEDIA NUMERIQUE/],
  'env-sci': [/^ECOLOGIE ET ENVIRONNEMENT/],
  'info-auto': [/^INFORMATIQUE \+ AUTOMATIQUE/, /^AUTOMATIQUE \+ INFORMATIQUE/],
  'law-pol': [/^DROIT \+ SCIENCES POLITIQUES/],
  'cs-eco': [/^INFORMATIQUE \+ SCIENCES ECONOMIQUES/],
  'eng-pol': [/^LANGUE ANGLAISE \+ SCIENCES POLITIQUES/, /^SCIENCES POLITIQUES \+ LANGUE ANGLAISE/],
  'law-fin': [/^DROIT \+ SCIENCES FINANCIERES/],
  'history-data': [/^HISTOIRE ET BIG DATA/],
  'sports-psych': [/^ENTRAINEMENT SPORTIF \+ SCIENCES SOCIALES/],
  childhood: [/^EDUCATION PSYCHOMOTRICE EN PERIODE DE L ENFANCE/],
  trading: [/^TRADING ET LES MARCHES FINANCIERS/],
  scenario: [/^ECRITURE DE SCENARIO/],
  'music-perf': [/^MUSICIEN INTERPRETE ET CREATEUR/],
  'comm-tourism': [/^COMMUNICATION TOURISTIQUE ET PROMOTION TERRITORIALES/],
  'marketing-comm': [/^COMMUNICATION MARKETING ET GESTION DE LA RELATION CLIENT/],
  'public-innov': [/^ETUDES POLITIQUES ET INNOVATION PUBLIQUE/],
  loisir: [/^SOCIOLOGIE DE LOISIR ET DU VOYAGE/],
  'soc-leisure': [/^SOCIOLOGIE DE LOISIR ET DU VOYAGE/],
  '3d-design': [/^CONCEPTEUR 3D/],
  aeroport: [/^MANAGEMENT DES AEROPORTS ET DU TRANSIT/],
  'health-info': [/^MANAGEMENT DES SYSTEMES D INFORMATIONS DE SANTE/],
  'health-comm': [/^INFORMATION ET COMMUNICATION DE LA SANTE/],
  'health-soc': [/^SANTE ET PROTECTION SOCIALE/],
  'digital-biz': [/^COMMUNICATION DIGITALE ET MANAGEMENT/],
  'digital-prod': [/PRODUCTION DE CONTENU NUMERIQUE/],
  'e-biz': [/^GESTION DES OPERATIONS COMMERCIALES ELECTRONIQUES/],
  fintech: [/^NEGOCIATION ET TECHNOLOGIE FINANCIERE/],
  theater: [/^COMEDIEN PROFESSIONNEL ET AUTEUR DRAMATIQUE/],
  'eco-ir': [/^ECONOMIE ET RELATIONS INTERNATIONALES/],
};

// Fallback 4: KB id -> regex over de-accented ESTABLISHMENT name.
const ETAB_FALLBACK = {
  'esi-alger': [/ECOLE NATIONALE SUPERIEURE EN INFORMATIQUE ALGER/],
  enscrbc: [/CONSERVATION ET DE RESTAURATION DES BIENS CULTURELS/],
};

// ---------------------------------------------------------------------------
// Collect row indices per KB entry
// ---------------------------------------------------------------------------
function rowsForSpec(s) {
  const idx = new Set();
  let method = null;

  for (const k of s.linkedFiliereKeys || []) {
    const ent = filieres[k];
    if (ent) {
      for (const i of ent.rowIndices || []) idx.add(i);
      method = 'linkedFiliereKeys';
    }
  }
  for (const i of s.linkedEtabRows || []) {
    idx.add(i);
    if (!method) method = 'linkedEtabRows';
  }
  if (idx.size === 0 && FILIERE_FALLBACK[s.id]) {
    for (let i = 0; i < NROWS.length; i++) {
      if (FILIERE_FALLBACK[s.id].some((re) => re.test(NROWS[i].fil))) idx.add(i);
    }
    if (idx.size) method = 'filiereKeywordFallback';
  }
  if (idx.size === 0 && ETAB_FALLBACK[s.id]) {
    for (let i = 0; i < NROWS.length; i++) {
      if (ETAB_FALLBACK[s.id].some((re) => re.test(NROWS[i].etab))) idx.add(i);
    }
    if (idx.size) method = 'etabKeywordFallback';
  }
  return { indices: [...idx].sort((a, b) => a - b), method };
}

const NOTE = {
  national: 'تخصص وطني: تُوجَّه إلى الولاية التي تحتضنه حسب ترتيبك',
  regional: 'يُدرَّس فقط في الولايات المذكورة، التوجيه حسب الدائرة الجغرافية',
  unknown: 'لا تتوفر بيانات توجيه رسمية لهذا التخصص في بيانات القبول 2025',
};

const specialities = {};
const wilayaCounts = {};
const unmatched = [];
const methodCounts = {};

for (const s of specs) {
  const { indices, method } = rowsForSpec(s);
  if (method) methodCounts[method] = (methodCounts[method] || 0) + 1;

  const byWilaya = {};
  let nationalRow = false;
  let allNationalRecruitment = indices.length > 0;

  for (const i of indices) {
    const r = rows[i];
    const isNatRecruit =
      r.type === 'national' || r.type === 'grande_ecole' || /^FB /.test(r.filiere);
    if (!isNatRecruit) allNationalRecruitment = false;
    const w = r.wilaya;
    if (!w || w === 'National' || r.type === 'national') {
      nationalRow = true;
      if (!w || w === 'National') continue; // exclude pseudo-wilaya from offeredIn
    }
    (byWilaya[w] = byWilaya[w] || new Set()).add(r.etab);
  }

  const offeredIn = Object.keys(byWilaya).sort((a, b) => a.localeCompare(b, 'fr'));
  const establishments = {};
  for (const w of offeredIn) establishments[w] = [...byWilaya[w]].slice(0, 5);

  let scope = 'unknown';
  if (indices.length > 0) {
    // all national-recruitment rows, or rows exist but none carries a wilaya
    scope = allNationalRecruitment || offeredIn.length === 0 ? 'national' : 'regional';
  }

  const entry = {
    offeredIn,
    establishments,
    scope,
    notOfferedNote_ar: NOTE[scope],
  };
  if (nationalRow) entry.nationalRow = true;
  if (method) entry.matchMethod = method;
  specialities[s.id] = entry;

  if (indices.length === 0) unmatched.push(s.id);
  for (const w of offeredIn) wilayaCounts[w] = (wilayaCounts[w] || 0) + 1;
}

const wilayas = {};
for (const w of Object.keys(wilayaCounts).sort((a, b) => a.localeCompare(b, 'fr'))) {
  wilayas[w] = { specialtyCount: wilayaCounts[w] };
}

const out = {
  _meta: {
    generatedAt: new Date().toISOString(),
    generatedBy: 'scripts/build_availability_map.cjs',
    source: 'tawjihi/data/kb/admissions-full.json (2025 admissions, 4445 rows)',
    kbEntries: specs.length,
    mappedEntries: specs.length - unmatched.length,
    unmatchedEntries: unmatched.length,
    matchMethods: methodCounts,
    typeInterpretation: {
      national: 'RECRUTEMENT NATIONAL pools (wilaya=null) -> scope national',
      grande_ecole: 'ecoles superieures, national recruitment -> scope national',
      university:
        'ordinary university filieres, geographic-circle access -> scope regional; ' +
        'EXCEPT rows whose filiere starts with "FB " (ecole superieure formation de base, ' +
        'under-tagged as university) which count as national recruitment',
    },
    notes:
      'offeredIn excludes the National pseudo-wilaya (recorded via nationalRow:true). ' +
      'establishments capped at 5 per wilaya. Mixed national+university entries are scope=regional.',
  },
  specialities,
  wilayas,
};

// ---------------------------------------------------------------------------
// Validation: every offeredIn wilaya must actually have >= 1 admission row
// ---------------------------------------------------------------------------
const wilayasInData = new Set(rows.map((r) => r.wilaya).filter(Boolean));
let bad = 0;
for (const [id, e] of Object.entries(specialities)) {
  for (const w of e.offeredIn) {
    if (!wilayasInData.has(w)) {
      console.error('BAD wilaya', w, 'in', id);
      bad++;
    }
    if (!e.establishments[w] || e.establishments[w].length === 0) {
      console.error('EMPTY establishments for', w, 'in', id);
      bad++;
    }
  }
}
if (bad) {
  console.error('Validation failed with', bad, 'problems');
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
JSON.parse(fs.readFileSync(OUT, 'utf8')); // round-trip parse check

console.log('Wrote', OUT);
console.log('KB entries:', specs.length);
console.log('Mapped:', specs.length - unmatched.length, ' Unmatched:', unmatched.length);
console.log('Match methods:', JSON.stringify(methodCounts));
console.log('Wilayas:', Object.keys(wilayas).length);
console.log('Unmatched ids:', unmatched.join(', '));
