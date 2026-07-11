// ESM, Node 22
// Usage: node scripts/embed-kb.js
// Reads: .env.local for SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY_1
//
// Prereq: the kb_embeddings table must have a unique constraint on (source, source_id, chunk_index)
//   CREATE UNIQUE INDEX IF NOT EXISTS kb_embeddings_source_id_chunk_idx
//     ON kb_embeddings (source, source_id, chunk_index);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
// Jina AI embeddings — free tier 1M tokens/month, 768-dim, multilingual Arabic support

// ── Resolve project root ────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Parse .env.local manually (dotenv may not be installed) ─────────────────
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`.env.local not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip optional surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(path.join(ROOT, '.env.local'));

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Embeddings are 100% Jina (below) — the old GEMINI_API_KEY_1 requirement was stale.
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// ── Clients ──────────────────────────────────────────────────────────────────
const JINA_API_KEY = env.JINA_API_KEY;
if (!JINA_API_KEY) throw new Error('Missing JINA_API_KEY in .env.local — get one free at jina.ai');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip UTF-8 BOM if present. */
function stripBOM(str) {
  return str.replace(/^﻿/, '');
}

/** Read a JSON file, stripping BOM, returning parsed object. */
function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(stripBOM(raw));
}

/** Embed a single text string via Jina AI (768-dim, multilingual Arabic support). */
async function embedText(text) {
  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JINA_API_KEY}` },
    body: JSON.stringify({ input: [text], model: 'jina-embeddings-v3', dimensions: 768 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${res.status}] ${err.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data[0].embedding; // float32[], dim=768
}

/** 700ms delay — Jina free tier: 100 req/min = 1 per 600ms, 700ms gives headroom. */
function delay(ms = 700) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upsert rows to kb_embeddings in batches of 50.
 * Requires a UNIQUE constraint on (source, source_id, chunk_index).
 */
async function upsertRows(rows) {
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('kb_embeddings')
      .upsert(batch, { onConflict: 'source,source_id,chunk_index', ignoreDuplicates: false });
    if (error) {
      console.error(`  [upsert error] batch ${i}–${i + batch.length - 1}:`, error.message);
    }
  }
}

/**
 * Embed all chunks and collect upsert rows.
 * @param {Array<{source, source_id, chunk_index, content, metadata}>} chunks
 * @param {string} label   Label for progress log, e.g. "content files"
 */
async function embedChunks(chunks, label) {
  const rows = [];
  const total = chunks.length;
  for (let i = 0; i < total; i++) {
    const chunk = chunks[i];
    if ((i + 1) % 10 === 0 || i === 0 || i === total - 1) {
      process.stdout.write(`  [${i + 1}/${total}] Embedding ${label}...\n`);
    }
    try {
      const embedding = await embedText(chunk.content);
      rows.push({
        source: chunk.source,
        source_id: chunk.source_id,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding,
      });
    } catch (err) {
      console.warn(`  [WARN] Failed to embed ${label} chunk ${i} (${chunk.source_id}): ${err.message}`);
    }
    await delay(100);
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. CONTENT FILES  (tawjihi/content/*.json — 83 files)
// ═══════════════════════════════════════════════════════════════════════════
function buildContentChunks() {
  const contentDir = path.join(ROOT, 'tawjihi', 'content');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
  const chunks = [];

  for (const file of files) {
    const slug = path.basename(file, '.json');
    let parsed;
    try {
      parsed = readJSON(path.join(contentDir, file));
    } catch (err) {
      console.warn(`  [WARN] Cannot parse ${file}: ${err.message}`);
      continue;
    }
    const sections = parsed.sections ?? [];
    sections.forEach((section, idx) => {
      const text = [
        section.h ?? '',
        section.body ?? '',
        (section.items ?? []).join('\n'),
      ].join('\n').trim();

      if (text.length < 20) return; // skip empty

      chunks.push({
        source: 'content',
        source_id: slug,
        chunk_index: idx,
        content: text,
        metadata: {
          slug,
          heading: section.h ?? '',
          type: section.type ?? '',
        },
      });
    });
  }
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  2. SPECIALITIES KB  (tawjihi/data/kb/specialities-kb.json — 220 entries)
// ═══════════════════════════════════════════════════════════════════════════
function buildSpecialityChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'kb', 'specialities-kb.json');
  const parsed = readJSON(filePath);
  const entries = parsed.specialities ?? [];
  const chunks = [];

  entries.forEach((e, i) => {
    const text = [
      `${e.name_ar ?? ''} (${e.name_fr ?? ''})`,
      `التخصص: ${e.category ?? ''}`,
      e.averages_text ?? '',
      `الأقسام: ${(e.sections ?? []).join('، ')}`,
    ].join('\n').trim();

    if (text.length < 20) return;

    chunks.push({
      source: 'speciality',
      source_id: String(e.id ?? i),
      chunk_index: 0,
      content: text,
      metadata: {
        id: e.id,
        name_ar: e.name_ar,
        name_fr: e.name_fr,
        category: e.category,
      },
    });
  });
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  3. PROGRAMS  (tawjihi/data/guide/programs.json — 341 entries)
// ═══════════════════════════════════════════════════════════════════════════
function buildProgramChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'guide', 'programs.json');
  const parsed = readJSON(filePath);
  // Support both array and {programs:[...]}
  const entries = Array.isArray(parsed) ? parsed : (parsed.programs ?? []);
  const chunks = [];

  entries.forEach((p, i) => {
    const parts = [];
    if (p.code)          parts.push(`كود: ${p.code}`);
    if (p.field_ar)      parts.push(`الميدان: ${p.field_ar}`);
    if (p.branch_ar)     parts.push(`الشعبة: ${p.branch_ar}`);
    if (p.name)          parts.push(`الاسم: ${p.name}`);
    if (p.name_ar)       parts.push(p.name_ar);
    if (p.scope)         parts.push(`النطاق: ${p.scope}`);
    if (p.eligibility)   parts.push(`الأهلية: ${p.eligibility}`);
    if (p.average)       parts.push(`المعدل الأدنى: ${p.average}`);
    if (p.conditions)    parts.push(`الشروط: ${p.conditions}`);
    if (Array.isArray(p.institutions_ar) && p.institutions_ar.length) {
      parts.push(`المؤسسات: ${p.institutions_ar.join('، ')}`);
    }
    if (p.wilayaAverages && typeof p.wilayaAverages === 'object') {
      const waLines = Object.entries(p.wilayaAverages)
        .map(([w, v]) => `${w}: ${v}`)
        .join('، ');
      parts.push(`معدلات الولايات: ${waLines}`);
    }

    const text = parts.join('\n').trim();
    if (text.length < 20) return;

    chunks.push({
      source: 'program',
      source_id: String(p.id ?? p.code ?? i),
      chunk_index: 0,
      content: text,
      metadata: {
        name: p.name ?? p.name_ar ?? p.field_ar,
        wilaya: p.wilaya ?? null,
        code: p.code ?? null,
        scope: p.scope ?? null,
      },
    });
  });
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. MINISTRY RULES  (tawjihi/data/kb/ministry-rules.json — 27 rules)
// ═══════════════════════════════════════════════════════════════════════════
function buildRuleChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'kb', 'ministry-rules.json');
  const parsed = readJSON(filePath);
  const rules = parsed.rules ?? [];
  const chunks = [];

  rules.forEach((r, i) => {
    // rule_ar is the main text field in this file; fallback to other names
    const body = r.rule_ar ?? r.body ?? r.description ?? r.text ?? '';
    const title = r.topic_ar ?? r.title ?? '';
    const text = [
      `قاعدة ${r.id ?? i + 1}: ${title}`,
      body,
    ].join('\n').trim();

    if (text.length < 20) return;

    chunks.push({
      source: 'rule',
      source_id: String(r.id ?? i),
      chunk_index: 0,
      content: text,
      metadata: {
        rule_id: r.id ?? null,
        title: title,
      },
    });
  });
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  5. GEO CIRCLES  (tawjihi/data/kb/geo-circles.json)
//     Structure: { circles: [{id, name_ar, name, wilayas, wilayaCodes}], wilayaToCircle: {...} }
// ═══════════════════════════════════════════════════════════════════════════
function buildGeoChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'kb', 'geo-circles.json');
  const parsed = readJSON(filePath);
  const circles = parsed.circles ?? [];
  const chunks = [];

  circles.forEach((circle, i) => {
    const text = [
      `الدائرة الجغرافية ${circle.id}: ${circle.name_ar} (${circle.name})`,
      `الولايات: ${(circle.wilayas ?? []).join('، ')}`,
      `أرقام الولايات: ${(circle.wilayaCodes ?? []).join(', ')}`,
    ].join('\n').trim();

    if (text.length < 20) return;

    chunks.push({
      source: 'geo',
      source_id: `circle-${circle.id ?? i + 1}`,
      chunk_index: 0,
      content: text,
      metadata: {
        circle_id: circle.id,
        name: circle.name,
        name_ar: circle.name_ar,
        wilaya_count: (circle.wilayas ?? []).length,
      },
    });
  });

  // Also emit one summary chunk listing the full wilayaToCircle mapping
  if (parsed.wilayaToCircle && Object.keys(parsed.wilayaToCircle).length) {
    const lines = Object.entries(parsed.wilayaToCircle)
      .map(([w, c]) => `${w} → منطقة ${c}`)
      .join('\n');
    chunks.push({
      source: 'geo',
      source_id: 'wilaya-to-circle-map',
      chunk_index: 0,
      content: `خريطة الولايات إلى الدوائر الجغرافية:\n${lines}`,
      metadata: { type: 'wilaya_index' },
    });
  }

  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  6. FILIERE INDEX  (tawjihi/data/kb/filiere-index.json)
//     Structure: { filieres: { KEY: { label, rowIndices, best: {min1,min2,min3} } } }
// ═══════════════════════════════════════════════════════════════════════════
function buildFiliereChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'kb', 'filiere-index.json');
  const parsed = readJSON(filePath);
  const filieres = parsed.filieres ?? {};
  const chunks = [];
  // streamMap from meta: min1=sciexp, min2=math, min3=techmath
  const streamMap = parsed._meta?.streamMap ?? { min1: 'sciexp', min2: 'math', min3: 'techmath' };

  Object.entries(filieres).forEach(([key, v], i) => {
    const best = v.best ?? {};
    const bestLines = Object.entries(best)
      .filter(([, val]) => val !== null)
      .map(([stream, val]) => `  ${streamMap[stream] ?? stream}: ${val}`)
      .join('\n');

    const text = [
      `فيليار: ${v.label ?? key}`,
      bestLines ? `أفضل معدلات القبول:\n${bestLines}` : '',
    ].filter(Boolean).join('\n').trim();

    if (text.length < 20) return;

    chunks.push({
      source: 'filiere',
      source_id: key,
      chunk_index: 0,
      content: text,
      metadata: {
        key,
        label: v.label ?? key,
        best_sciexp: best.min1 ?? null,
        best_math: best.min2 ?? null,
        best_techmath: best.min3 ?? null,
      },
    });
  });
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  7. AVAILABILITY MAP  (tawjihi/data/kb/availability-map.json)
//     Structure: { specialities: { KEY: { offeredIn, establishments, scope, ... } } }
// ═══════════════════════════════════════════════════════════════════════════
function buildAvailabilityChunks() {
  const filePath = path.join(ROOT, 'tawjihi', 'data', 'kb', 'availability-map.json');
  const parsed = readJSON(filePath);
  const specialities = parsed.specialities ?? {};
  const chunks = [];

  Object.entries(specialities).forEach(([key, entry]) => {
    const offeredIn = entry.offeredIn ?? [];
    const scope = entry.scope ?? 'unknown';
    const note = entry.notOfferedNote_ar ?? '';

    // Build establishment lines
    const etabLines = Object.entries(entry.establishments ?? {})
      .map(([w, etabs]) => `  ${w}: ${etabs.join(' / ')}`)
      .join('\n');

    const text = [
      `تخصص: ${key}`,
      `النطاق: ${scope}`,
      offeredIn.length
        ? `متاح في: ${offeredIn.join('، ')}`
        : (note || 'غير متاح في ولاية محددة (وطني)'),
      etabLines ? `المؤسسات:\n${etabLines}` : '',
    ].filter(Boolean).join('\n').trim();

    if (text.length < 20) return;

    chunks.push({
      source: 'availability',
      source_id: key,
      chunk_index: 0,
      content: text,
      metadata: {
        key,
        scope,
        wilaya_count: offeredIn.length,
        is_national: scope === 'national',
      },
    });
  });
  return chunks;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  let totalEmbedded = 0;

  console.log('=== embed-kb.js — Knowledge Base Embedding Pipeline ===\n');

  // ── Build all chunk lists (synchronous) ──────────────────────────────────
  console.log('Building chunks from source files...');

  const sources = [
    { label: 'content files', build: buildContentChunks },
    { label: 'specialities-kb', build: buildSpecialityChunks },
    { label: 'programs', build: buildProgramChunks },
    { label: 'ministry rules', build: buildRuleChunks },
    { label: 'geo circles', build: buildGeoChunks },
    // filiere-index (3137 raw average entries) and availability-map skipped —
    // overlaps with programs.json already embedded; not conversational content
  ];

  for (const { label, build } of sources) {
    console.log(`\n── ${label.toUpperCase()} ──`);
    let chunks;
    try {
      chunks = build();
    } catch (err) {
      console.error(`  [ERROR] Failed to build chunks for "${label}": ${err.message}`);
      continue;
    }
    console.log(`  ${chunks.length} chunks to embed`);

    if (chunks.length === 0) continue;

    const rows = await embedChunks(chunks, label);
    console.log(`  ${rows.length}/${chunks.length} chunks embedded successfully`);

    if (rows.length > 0) {
      console.log(`  Upserting ${rows.length} rows to Supabase...`);
      await upsertRows(rows);
    }

    totalEmbedded += rows.length;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done: ${totalEmbedded} chunks embedded in ${elapsed}s ===`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
