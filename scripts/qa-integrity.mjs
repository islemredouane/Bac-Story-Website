// scripts/qa-integrity.mjs — Part A data-integrity battery (QA Task 2)
// Node 22, ESM, zero dependencies. Run: node scripts/qa-integrity.mjs
//
// Rewritten 2026-07-14: the previous version predated the runtime split-card
// expansion (TW_SPLIT_DATA -> 638 cards) and assumed stale shapes for
// code-mapping.json ({mapping:{...}}) and minima-phase1-2025.json ({entries:[...]}).
// It also required exact catalog-id == KB-id parity, which was never the
// runtime contract (the KB is joined semantically via RAG, ids differ).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const rel = (...p) => path.join(ROOT, ...p);
const stripBOM = (s) => s.replace(/^﻿/, '');
const readJSON = (f) => JSON.parse(stripBOM(fs.readFileSync(f, 'utf8')));

// ── result collector ────────────────────────────────────────────────────────
const checks = [];
function record(name, failures, warnings = [], info = '') {
  const status = failures.length ? 'FAIL' : warnings.length ? 'WARN' : 'PASS';
  checks.push({ name, status, failures, warnings, info });
  console.log(`[${status}] ${name}${info ? ' — ' + info : ''}`);
  failures.slice(0, 15).forEach((f) => console.log('   ✗ ' + f));
  if (failures.length > 15) console.log(`   … +${failures.length - 15} more`);
  warnings.slice(0, 10).forEach((w) => console.log('   ⚠ ' + w));
  if (warnings.length > 10) console.log(`   … +${warnings.length - 10} more warnings`);
}

// ── load runtime catalog (638 cards after TW_SPLIT_DATA expansion) ──────────
const catalogSrc = fs.readFileSync(rel('tawjihi', 'catalog.js'), 'utf8');
const { TW_CATALOG, twById } = new Function(
  catalogSrc + '\n;return { TW_CATALOG, twById };'
)();

// ═════════════════════════ A1 — catalog entries ═════════════════════════════
{
  const fails = [];
  const warns = [];
  const VALID_CATS = new Set([
    'engineering', 'medical', 'science', 'business', 'humanities',
    'law', 'military', 'arts', 'education', 'double',
  ]);
  const VALID_STREAMS = new Set([
    'sciexp', 'math', 'techmath', 'gestion', 'lettres', 'langues', 'arts',
  ]);

  const seen = new Set();
  for (const c of TW_CATALOG) {
    if (!c.id) fails.push(`entry without id (name: ${c.name})`);
    if (seen.has(c.id)) fails.push(`duplicate id: ${c.id}`);
    seen.add(c.id);
    if (!VALID_CATS.has(c.cat)) fails.push(`${c.id}: invalid cat "${c.cat}"`);
    for (const s of c.streamCodes || []) {
      if (!VALID_STREAMS.has(s)) fails.push(`${c.id}: invalid streamCode "${s}"`);
    }
    for (const k of ['avg', 'minAvg']) {
      const v = c[k];
      if (v !== null && v !== undefined && (typeof v !== 'number' || v < 8 || v > 20)) {
        fails.push(`${c.id}: ${k}=${v} outside [8,20]`);
      }
    }
    if (c.img !== '' && c.img !== undefined) {
      if (!fs.existsSync(rel('tawjihi', c.img))) fails.push(`${c.id}: img not found: ${c.img}`);
    }
    if (c.cat === 'military' && !c.regLink) fails.push(`${c.id}: military entry missing regLink`);
  }
  record('A1 catalog: ids/cat/streams/avg/img/regLink', fails, warns,
    `${TW_CATALOG.length} runtime cards (expected 638)`);
  if (TW_CATALOG.length !== 638) {
    record('A1b catalog size', [`runtime catalog has ${TW_CATALOG.length} cards, expected 638`]);
  }
}

// ── A1c split-card integrity + twById legacy resolution ─────────────────────
{
  const fails = [];
  const splits = TW_CATALOG.filter((c) => c.baseId);
  for (const c of splits) {
    if (!c.id.startsWith(c.baseId + '-')) fails.push(`${c.id}: id does not extend baseId ${c.baseId}`);
    if (!Array.isArray(c.unis) || c.unis.length !== 1) fails.push(`${c.id}: split card should carry exactly 1 uni`);
  }
  // legacy ids saved in wishlists must keep resolving
  for (const legacy of ['med', 'esi', 'pharm', 'info', 'droit', 'archi']) {
    if (!twById(legacy)) fails.push(`twById("${legacy}") no longer resolves (breaks saved wishlists)`);
  }
  record('A1c split cards + twById legacy resolution', fails, [],
    `${splits.length} split cards (expected 480), ${TW_CATALOG.length - splits.length} literal`);
}

// ═════════════════ A2 — KB cross-ref + content files ════════════════════════
{
  // The KB ids intentionally differ from catalog ids (KB joined via RAG, not id).
  // Alias map: catalog base id -> KB id verified by name during QA 2026-07-14.
  const KB_ALIASES = {
    esi: 'esi-alger', med: 'medcine', pharm: 'pharmacie', dent: 'medcine-dentaire',
    archi: 'epau', info: 'informatique', bio: 'biologie', 'genie-civil': 'gc',
    'genie-elec': 'electro', 'genie-meca': 'gm', 'marine-eng': 'genie-maritime',
    vet: 'vetrinaire', 'pharm-ind': 'pharmacie-industrielle', 'ensa-agro': 'ensa',
    essb: 'essbo',
    // partial coverage only — nearest KB entry, flagged as warning below:
    esc: 'commerce', education: 'childhood', psych: 'sociales',
  };
  const PARTIAL = new Set(['esc', 'education', 'psych']);

  const kb = readJSON(rel('tawjihi', 'data', 'kb', 'specialities-kb.json'));
  const kbIds = new Set(kb.specialities.map((s) => s.id));
  const fails = [];
  const warns = [];

  const baseIds = new Set(TW_CATALOG.map((c) => c.baseId || c.id));
  for (const id of baseIds) {
    if (kbIds.has(id)) continue;
    const alias = KB_ALIASES[id];
    if (alias && kbIds.has(alias)) {
      if (PARTIAL.has(id)) warns.push(`${id}: only partial KB coverage via "${alias}" — consider a dedicated KB entry`);
      continue;
    }
    fails.push(`catalog id "${id}" has no KB record (and no known alias)`);
  }
  record('A2 catalog → KB coverage (alias-aware)', fails, warns,
    `${baseIds.size} base specialities vs ${kbIds.size} KB entries`);
}

{
  const VALID_TYPES = new Set(['text', 'list', 'pros', 'cons', 'summary']);
  const dir = rel('tawjihi', 'content');
  const fails = [];
  const warns = [];
  let bomCount = 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) bomCount++;
    let parsed;
    try {
      parsed = JSON.parse(stripBOM(raw));
    } catch (e) {
      fails.push(`${f}: JSON parse error even after BOM strip: ${e.message.slice(0, 80)}`);
      continue;
    }
    (parsed.sections || []).forEach((s, i) => {
      if (!VALID_TYPES.has(s.type)) fails.push(`${f} section[${i}]: invalid type "${s.type}"`);
    });
  }
  if (bomCount) warns.push(`${bomCount}/${files.length} content files carry a UTF-8 BOM — harmless for browser fetch()/embed-kb (both strip it), but breaks naive JSON.parse consumers`);
  record('A2b content/*.json parse + section types', fails, warns, `${files.length} files`);
}

// ═════════════════════ A3 — programs.json ═══════════════════════════════════
{
  const doc = readJSON(rel('tawjihi', 'data', 'guide', 'programs.json'));
  const progs = doc.programs || [];
  const fails = [];
  const warns = [];
  const VALID_STREAMS = new Set(['sciexp', 'math', 'techmath', 'gestion', 'lettres', 'langues', 'arts']);
  // 4 index-only rows documented as having no stream data in the guide index:
  const DOCUMENTED_NO_STREAMS = new Set(['A00TCN01', 'A05TCN00', 'B00IAN01', 'F01TPN01']);

  if (progs.length !== 495) fails.push(`program count ${progs.length}, expected 495`);

  const codes = new Set();
  let nullRankingIndexRows = 0;
  for (const p of progs) {
    if (!p.code) { fails.push(`program without code (field: ${p.field_ar})`); continue; }
    if (codes.has(p.code)) fails.push(`duplicate program code ${p.code}`);
    codes.add(p.code);
    if (!p.field_ar) fails.push(`${p.code}: missing field_ar`);
    if (!p.scope) fails.push(`${p.code}: missing scope`);
    if (!p.rankingBasis) {
      // every known null carries extraction provenance in _note (index-only rows,
      // merged PDF cells, inherited sibling rows) — the circulaire states no
      // explicit ranking basis for these. Null WITHOUT provenance is a real error.
      if (p._note) nullRankingIndexRows++;
      else fails.push(`${p.code}: missing rankingBasis (no extraction provenance note)`);
    }
    for (const w of p.circleWilayaNums || []) {
      if (!Number.isInteger(w) || w < 1 || w > 58) fails.push(`${p.code}: wilaya ${w} outside 1-58`);
    }
    const streams = p.allowedStreams || [];
    if (!streams.length && !DOCUMENTED_NO_STREAMS.has(p.code)) {
      fails.push(`${p.code}: empty allowedStreams (not among the 4 documented index-only exceptions)`);
    }
    for (const s of streams) {
      if (!VALID_STREAMS.has(s.stream)) fails.push(`${p.code}: invalid stream "${s.stream}"`);
    }
  }
  if (nullRankingIndexRows) {
    warns.push(`${nullRankingIndexRows} index-derived programs have rankingBasis=null (guide index page states no ranking basis; _note=no_explicit_priority). Suggested fix: backfill "weighted_or_general" (the MESRS default) or resolve from the detailed guide pages.`);
  }
  record('A3 programs.json required fields / wilayas / streams', fails, warns,
    `${progs.length} programs`);
}

// ═══════════════ A4 — averages traceability (20 samples) ════════════════════
{
  const fails = [];
  const warns = [];
  const mappingDoc = readJSON(rel('tawjihi', 'data', '_staging', 'code-mapping.json'));
  const mapping = mappingDoc.mapping || {};
  const minima = readJSON(rel('tawjihi', 'data', 'averages-2025', 'minima-phase1-2025.json'));
  const entries = minima.entries || [];
  const byCode = new Map();
  for (const e of entries) {
    if (!byCode.has(e.code)) byCode.set(e.code, []);
    byCode.get(e.code).push(e);
  }

  // sample: 20 mapped base specialities that have codes and a catalog avg
  const candidates = Object.entries(mapping).filter(
    ([id, m]) => Array.isArray(m.codes) && m.codes.length && twById(id) && twById(id).minAvg != null
  );
  const step = Math.max(1, Math.floor(candidates.length / 20));
  const sample = [];
  for (let i = 0; i < candidates.length && sample.length < 20; i += step) sample.push(candidates[i]);

  for (const [id, m] of sample) {
    const card = twById(id);
    const values = [];
    for (const code of m.codes) {
      const rows = byCode.get(code);
      if (!rows) { fails.push(`${id}: mapped code ${code} not present in minima entries`); continue; }
      for (const r of rows) for (const k of ['min1', 'min2', 'min3']) {
        if (typeof r[k] === 'number') values.push(r[k]);
      }
    }
    if (!values.length) { warns.push(`${id}: mapped codes carry no numeric minima (all NC?)`); continue; }
    const hit = values.some((v) => Math.abs(v - card.minAvg) < 0.005);
    if (!hit) fails.push(`${id}: catalog minAvg ${card.minAvg} not found among minima values of codes [${m.codes.join(',')}] (values: ${[...new Set(values)].slice(0, 6).join(', ')}…)`);
  }
  record('A4 averages traceability (20 sampled specialities)', fails, warns,
    `${sample.length} sampled of ${candidates.length} mapped-with-codes`);
}

// ═════════════════════ A5 — KB structural expectations ══════════════════════
{
  const kb = readJSON(rel('tawjihi', 'data', 'kb', 'specialities-kb.json'));
  const fails = [];
  const warns = [];
  const specs = kb.specialities || [];
  if (specs.length !== 244) fails.push(`KB has ${specs.length} entries, expected 244`);
  const legacy = specs.filter((s) => s.legacy_unverified).length;
  if (legacy !== 66) warns.push(`legacy_unverified count ${legacy}, expected 66 (intentional legacy set)`);
  const military = specs.filter((s) => s.category === 'military');
  for (const m of military) {
    const sections = Array.isArray(m.sections) ? m.sections : Object.values(m.sections || {});
    const txt = JSON.stringify(sections);
    if (!txt.includes('التسجيل الأولي')) fails.push(`military KB entry "${m.id}" missing 'التسجيل الأولي' section`);
  }
  record('A5 KB: count / legacy_unverified / military preinscription sections', fails, warns,
    `${specs.length} entries, ${military.length} military, ${legacy} legacy_unverified`);
}

// ═════════════ A6 — encoding audit (mojibake / double-encoded UTF-8) ════════
{
  const fails = [];
  const warns = [];
  const exts = new Set(['.js', '.mjs', '.cjs', '.json', '.html']);
  const skipDirs = new Set(['node_modules', '.git', '_scratch', '.claude']);
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!skipDirs.has(e.name)) walk(path.join(d, e.name)); continue; }
      if (!exts.has(path.extname(e.name))) continue;
      const f = path.join(d, e.name);
      if (fs.statSync(f).size > 5e6) continue;
      const txt = fs.readFileSync(f, 'utf8');
      const moji = (txt.match(/Ø§|Ù„|Ø¹/g) || []).length; // double-encoded ا / ل / ع
      if (moji > 3) {
        const arabic = (txt.match(/[؀-ۿ]/g) || []).length;
        const relPath = path.relative(ROOT, f);
        if (arabic === 0) fails.push(`${relPath}: Arabic is fully double-encoded (mojibake ${moji}, real Arabic 0) — recoverable via cp1252 reverse-map`);
        else warns.push(`${relPath}: mixed encoding — ${moji} mojibake sequences alongside ${arabic} real Arabic chars`);
      }
    }
  })(ROOT);
  record('A6 encoding audit (double-encoded Arabic)', fails, warns);
}

// ── report ───────────────────────────────────────────────────────────────────
const passN = checks.filter((c) => c.status === 'PASS').length;
const warnN = checks.filter((c) => c.status === 'WARN').length;
const failN = checks.filter((c) => c.status === 'FAIL').length;
console.log(`\nPart A: ${passN} pass / ${warnN} warn / ${failN} fail`);
process.exitCode = failN ? 1 : 0;

// machine-readable dump for the report author
fs.writeFileSync(
  rel('tawjihi', 'data', '_staging', '_qa-integrity-results.json'),
  JSON.stringify({ generated: new Date().toISOString(), passN, warnN, failN, checks }, null, 2),
  'utf8'
);
console.log('Results written to tawjihi/data/_staging/_qa-integrity-results.json');
