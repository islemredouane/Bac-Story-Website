// scripts/embed-cleanup.mjs — remove stale kb_embeddings rows.
// embed-kb.js only UPSERTS; rows whose (source, source_id) no longer exists in
// the current source files accumulate forever. This script lists them and,
// with --apply, deletes them.
//
// DRY-RUN BY DEFAULT:  node scripts/embed-cleanup.mjs
// Actually delete:     node scripts/embed-cleanup.mjs --apply
//
// Node 22, ESM, zero dependencies (plain fetch against Supabase REST).
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

// ── env ──────────────────────────────────────────────────────────────────────
const env = {};
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').replace(/^﻿/, '').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
const URL0 = env.SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL0 || !KEY) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(2); }
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const stripBOM = (s) => s.replace(/^﻿/, '');
const readJSON = (f) => JSON.parse(stripBOM(fs.readFileSync(f, 'utf8')));

// ── current valid (source, source_id) set — mirrors embed-kb.js builders ─────
// Keep this in sync with scripts/embed-kb.js. Sources it embeds today:
//   content, speciality, program, rule, geo   (filiere + availability skipped)
function currentKeys() {
  const keys = new Set();
  // content: source_id = file slug
  for (const f of fs.readdirSync(path.join(ROOT, 'tawjihi', 'content'))) {
    if (f.endsWith('.json')) keys.add('content|' + path.basename(f, '.json'));
  }
  // speciality: source_id = kb entry id
  const kb = readJSON(path.join(ROOT, 'tawjihi', 'data', 'kb', 'specialities-kb.json'));
  (kb.specialities || []).forEach((e, i) => keys.add('speciality|' + String(e.id ?? i)));
  // program: source_id = id ?? code ?? index
  const progsDoc = readJSON(path.join(ROOT, 'tawjihi', 'data', 'guide', 'programs.json'));
  const progs = Array.isArray(progsDoc) ? progsDoc : (progsDoc.programs || []);
  progs.forEach((p, i) => keys.add('program|' + String(p.id ?? p.code ?? i)));
  // rule: source_id = rule id ?? index
  const rules = readJSON(path.join(ROOT, 'tawjihi', 'data', 'kb', 'ministry-rules.json'));
  (rules.rules || []).forEach((r, i) => keys.add('rule|' + String(r.id ?? i)));
  // geo: circle-<id> + wilaya map chunk
  const geo = readJSON(path.join(ROOT, 'tawjihi', 'data', 'kb', 'geo-circles.json'));
  (geo.circles || []).forEach((c, i) => keys.add('geo|circle-' + String(c.id ?? i + 1)));
  if (geo.wilayaToCircle) keys.add('geo|wilaya-to-circle-map');
  return keys;
}

// ── fetch all embedding rows (id, source, source_id) paginated ───────────────
async function fetchAllRows() {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${URL0}/rest/v1/kb_embeddings?select=id,source,source_id&order=id.asc`, {
      headers: { ...HEADERS, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) throw new Error(`fetch rows ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

async function main() {
  const valid = currentKeys();
  console.log(`Current source files define ${valid.size} valid (source, source_id) keys.`);
  const rows = await fetchAllRows();
  console.log(`kb_embeddings holds ${rows.length} rows.`);

  const stale = rows.filter((r) => !valid.has(`${r.source}|${r.source_id}`));
  const bySrc = {};
  stale.forEach((r) => { bySrc[r.source] = (bySrc[r.source] || 0) + 1; });
  console.log(`\nStale rows: ${stale.length}`);
  Object.entries(bySrc).forEach(([s, n]) => console.log(`  ${s}: ${n}`));
  const staleIds = new Set(stale.map((r) => `${r.source}|${r.source_id}`));
  console.log('\nSample stale keys:');
  [...staleIds].slice(0, 20).forEach((k) => console.log('  ' + k));

  if (!stale.length) { console.log('\nNothing to clean.'); return; }
  if (!APPLY) {
    console.log(`\nDRY RUN — no deletions. Re-run with --apply to delete ${stale.length} rows.`);
    return;
  }
  // delete in batches of 100 by primary key
  console.log('\n--apply set: deleting…');
  const ids = stale.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const res = await fetch(`${URL0}/rest/v1/kb_embeddings?id=in.(${batch.join(',')})`, {
      method: 'DELETE', headers: HEADERS,
    });
    if (!res.ok) throw new Error(`delete batch @${i} failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
    process.stdout.write(`  deleted ${Math.min(i + 100, ids.length)}/${ids.length}\r`);
  }
  console.log(`\nDone — ${ids.length} stale rows deleted.`);
}
main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
