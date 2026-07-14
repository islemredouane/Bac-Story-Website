// scripts/qa-rag.mjs — Part B: RAG retrieval QA against kb_embeddings/search_kb.
// Node 22, ESM, zero dependencies. Reads .env.local (SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, JINA_API_KEY). Run: node scripts/qa-rag.mjs
//
// Rewritten 2026-07-14: previous version required @supabase/supabase-js (not
// installed) and asserted stale KB ids (med-national etc. — removed from the KB).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').replace(/^﻿/, '').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: KEY, JINA_API_KEY } = env;
if (!SUPABASE_URL || !KEY || !JINA_API_KEY) { console.error('Missing env vars in .env.local'); process.exit(2); }

async function embed(text) {
  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JINA_API_KEY}` },
    body: JSON.stringify({ model: 'jina-embeddings-v3', task: 'retrieval.query', dimensions: 768, input: [text] }),
  });
  if (!res.ok) throw new Error(`Jina ${res.status}`);
  return (await res.json()).data[0].embedding;
}

async function searchKb(vec, count = 5) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_kb`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_embedding: vec, match_threshold: 0.2, match_count: count }),
  });
  if (!res.ok) throw new Error(`search_kb ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// Each test: expect metadata.id / source_id among top-5, OR content substring.
const TESTS = [
  { q: 'الإعلام العسكري', id: 'military-media' },
  { q: 'المدرسة العليا للطيران', id: 'esa' },
  { q: 'معدل الطب', id: 'medcine' },
  { q: 'التسجيل في المدارس العسكرية', content: 'preinscription.mdn.dz' },
  // geo-circle knowledge lives both in source 'geo' and rule 'geographic-circles-*'
  { q: 'الدائرة الجغرافية لولاية سطيف', id: 'geographic-circles', altSource: 'geo' },
  { q: 'معدل قبول الصيدلة', id: 'pharmacie', count: 8 },
  { q: 'المدرسة الوطنية العليا للإعلام الآلي سيدي بلعباس', id: 'esi' /* esi | esi-alger | esi-sba */ },
  { q: 'الفرق بين نظام LMD ومهندس دولة', id: 'system-lmd-vs-ingenieur' },
  { q: 'الدرك الوطني كيفاش الدخول', id: 'gendarmerie' },
  { q: 'المعدل الموزون كيفاش يتحسب', source: 'rule' },
];

let passN = 0;
const rows = [];
for (const t of TESTS) {
  let verdict, got;
  try {
    const data = await searchKb(await embed(t.q), t.count || 5);
    got = data.map((d) => `${d.source ?? d.metadata?.source ?? '?'}:${d.source_id ?? d.metadata?.id ?? d.metadata?.slug ?? d.metadata?.code ?? '?'}`).join(', ');
    const ok = data.some((d) => {
      const mid = String(d.metadata?.id ?? d.source_id ?? '');
      const slug = String(d.metadata?.slug ?? '');
      const src = String(d.source ?? d.metadata?.source ?? '');
      if (t.id && (mid === t.id || mid.startsWith(t.id + '-') || slug === t.id || slug.startsWith(t.id + '-'))) return true;
      if (t.id && String(d.metadata?.rule_id ?? '').startsWith(t.id)) return true;
      if (t.id && String(d.source_id ?? '').startsWith(t.id)) return true;
      if (t.source && src === t.source) return true;
      if (t.altSource && src === t.altSource) return true;
      if (t.content && String(d.content ?? '').includes(t.content)) return true;
      return false;
    });
    verdict = ok ? 'PASS' : 'FAIL';
    if (ok) passN++;
  } catch (e) {
    verdict = 'ERROR'; got = e.message;
  }
  console.log(`[${verdict}] "${t.q}" → ${got}`);
  rows.push({ ...t, verdict, got });
  await new Promise((r) => setTimeout(r, 800)); // Jina rate limit headroom
}
console.log(`\nPart B: ${passN}/${TESTS.length} retrieval tests passed`);
fs.writeFileSync(path.join(ROOT, 'tawjihi', 'data', '_staging', '_qa-rag-results.json'),
  JSON.stringify({ generated: new Date().toISOString(), passN, total: TESTS.length, rows }, null, 2), 'utf8');
process.exitCode = passN === TESTS.length ? 0 : 1;
