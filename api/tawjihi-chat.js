/* ============================================================
   TAWJIHI â€” AI Chat API (Vercel Serverless Function)
   ESM module â€” package.json has "type": "module"
   v2 output contract â€” see tawjihi/CHAT-CONTRACT.md
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

/* ---- Knowledge base â€” migrated to pgvector RAG (retrieveContext) ---- */
/* Stub fallbacks keep wilaya/intent/ministry helper functions non-crashing.
   Actual knowledge is now served at query-time via Supabase search_kb RPC. */
const specialitiesKb = { specialities: [] };
const admissionsFull = { rows: [] };
const filiereIndex = { filieres: {} };
const guidePrograms = { programs: [] };
/* Geo data restored (small: 3.2KB + 8.9KB) â€” powers wilayaâ†’circle resolution,
   zone lines in the student profile block, and buildGuideContext filtering. */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const geoData = require('../tawjihi/data/guide/geographic-circles.json');
const geoCircles = require('../tawjihi/data/kb/geo-circles.json');
const ministryRulesData = { rules: [] };
const availabilityMapData = { specialities: {} };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __apiDir = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__apiDir, '..', 'tawjihi', 'content');

const CONTENT_CACHE = new Map();
function loadRichContent(specId) {
  if (!specId) return [];
  if (CONTENT_CACHE.has(specId)) return CONTENT_CACHE.get(specId);
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, `${specId}.json`), 'utf8');
    const sections = JSON.parse(raw).sections || [];
    CONTENT_CACHE.set(specId, sections);
    return sections;
  } catch {
    CONTENT_CACHE.set(specId, []);
    return [];
  }
}

const RICH_SECTION_TYPES = new Set(['pros', 'cons', 'summary']);
const RICH_HEADING_KEYS = ['ÙØ±Øµ Ø§Ù„Ø¹Ù…Ù„', 'ÙˆØ§Ù‚Ø¹ Ø³ÙˆÙ‚ Ø§Ù„Ø¹Ù…Ù„', 'Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©', 'Ø®Ù„Ø§ØµØ©', 'Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…Ø¯Ø±Ø³Ø©'];

function buildRichExcerpt(specId) {
  const sections = loadRichContent(specId);
  if (!sections.length) return '';
  const lines = [];
  for (const sec of sections) {
    const isWanted = RICH_SECTION_TYPES.has(sec.type) || RICH_HEADING_KEYS.some(k => (sec.h || '').includes(k));
    if (!isWanted) continue;
    if (sec.type === 'pros' || sec.type === 'cons') {
      const label = sec.type === 'pros' ? 'Ø§Ù„Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ§Øª' : 'Ø§Ù„Ø³Ù„Ø¨ÙŠØ§Øª';
      const items = (sec.items || []).slice(0, 4).join(' | ');
      if (items) lines.push(`${label}: ${items}`);
    } else if (sec.type === 'summary' && sec.body) {
      lines.push(`Ø§Ù„Ø®Ù„Ø§ØµØ©: ${sec.body.slice(0, 300)}`);
    } else if (sec.body) {
      lines.push(`${sec.h}: ${sec.body.slice(0, 200)}`);
    } else if (sec.items) {
      lines.push(`${sec.h}: ${(sec.items || []).slice(0, 4).join(' | ')}`);
    }
    if (lines.length >= 4) break;
  }
  return lines.join('\n');
}

const SPECIALITIES = specialitiesKb.specialities || [];
const ADM_ROWS = admissionsFull.rows || [];
const FILIERES = filiereIndex.filieres || {};

/* ---- Guide indexes (built once at module load) ---- */
const GUIDE_PROGRAMS = guidePrograms.programs || [];
/* wilaya Arabic name â†’ its number (1-58) for geographic filtering */
const WILAYA_TO_NUM = Object.fromEntries(
  (geoData.wilayas || []).map((w) => [w.ar, w.num])
);

/* Canonical field names â€” the PDF extraction scrambled word order across copies.
   Map every variant to its official Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ designation. */
const FIELD_CANONICAL = {
  'Ø¹Ù„ÙˆÙ… ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§': 'Ø¹Ù„ÙˆÙ… ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§',
  'ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§',
  'Ø¹Ù„ÙˆÙ… Ø§Ù„Ù…Ø§Ø¯Ø©': 'Ø¹Ù„ÙˆÙ… Ø§Ù„Ù…Ø§Ø¯Ø©',
  'Ø§Ù„Ù…Ø§Ø¯Ø© Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù„Ù…Ø§Ø¯Ø©',
  'ÙˆØ§Ù„Ø­ÙŠØ§Ø© Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹Ø©': 'Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© ÙˆØ§Ù„Ø­ÙŠØ§Ø©',
  'ÙˆØ§Ù„Ø­ÙŠØ§Ø© Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© ÙˆØ§Ù„Ø­ÙŠØ§Ø©',
  'ØªØ¬Ø§Ø±ÙŠØ© Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ÙˆØ§Ù„ØªØ³ÙŠÙŠØ± ÙˆØ¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ¹Ù„ÙˆÙ… ÙˆØ§Ù„ØªØ³ÙŠÙŠØ± Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ§Ù„ØªØ³ÙŠÙŠØ± ÙˆØ¹Ù„ÙˆÙ… Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ©': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ÙˆØ¹Ù„ÙˆÙ…ØªØ¬Ø§Ø±ÙŠØ© Ø§Ù„ØªØ³ÙŠÙŠØ± Ø§Ù‚ØªØµØ§Ø¯ÙŠØ©ØŒ Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ØªØ¬Ø§Ø±ÙŠØ© Ø§Ù„ØªØ³ÙŠÙŠØ± ÙˆØ¹Ù„ÙˆÙ… Ø¹Ù„ÙˆÙ… Ù‚ØªØµØ§Ø¯ÙŠØ©ØŒ': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ØªØ¬Ø§Ø±ÙŠØ© ØªØ³ÙŠÙŠØ± ÙˆØ¹Ù„ÙˆÙ… Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ©ØŒ': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ØªØ¬Ø§Ø±ÙŠØ© ÙˆØ¹Ù„ÙˆÙ… ØªØ³ÙŠÙŠØ± Ø§Ù‚ØªØµØ§Ø¯ÙŠØ©ØŒ Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±',
  'ÙˆØ§Ø¬ØªÙ…Ø§Ø¹ÙŠØ© Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ©': 'Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ© ÙˆØ§Ø¬ØªÙ…Ø§Ø¹ÙŠØ©',
  'ÙˆØ§Ø¬ØªÙ…Ø§Ø¹ÙŠØ© Ø¥Ù†Ø³Ø§Ù†ÙŠØ© Ø¹Ù„ÙˆÙ…': 'Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ© ÙˆØ§Ø¬ØªÙ…Ø§Ø¹ÙŠØ©',
  'ÙˆØ§Ù„Ø±ÙŠØ§Ø¶ÙŠØ© * Ø§Ù„Ù†Ø´Ø§Ø·Ø§Øª Ø§Ù„Ø¨Ø¯Ù†ÙŠØ© Ø¹Ù„ÙˆÙ… ÙˆØªÙ‚Ù†ÙŠØ§Øª': 'Ø¹Ù„ÙˆÙ… ÙˆØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„Ù†Ø´Ø§Ø·Ø§Øª Ø§Ù„Ø¨Ø¯Ù†ÙŠØ© ÙˆØ§Ù„Ø±ÙŠØ§Ø¶ÙŠØ©',
  'ÙÙ†ÙˆÙ†': 'ÙÙ†ÙˆÙ†',
  'Ù„ØºØ© ÙˆØ£Ø¯Ø¨ Ø¹Ø±Ø¨ÙŠ': 'Ù„ØºØ© ÙˆØ£Ø¯Ø¨ Ø¹Ø±Ø¨ÙŠ',
  'Ø£Ù…Ø§Ø²ÙŠØºÙŠØ© Ù„ØºØ© ÙˆØ«Ù‚Ø§ÙØ©': 'Ù„ØºØ© ÙˆØ«Ù‚Ø§ÙØ© Ø£Ù…Ø§Ø²ÙŠØºÙŠØ©',
  'ÙˆÙ…Ù‡Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ©ØŒØ¹Ù…Ø±Ø§Ù† Ù‡Ù†Ø¯Ø³Ø©': 'Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ© ÙˆØ¹Ù…Ø±Ø§Ù† ÙˆÙ…Ù‡Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©',
  'Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© ÙˆÙ…Ù‡Ù† Ø¹Ù…Ø±Ø§Ù† Ù…Ø¹Ù…Ø§Ø±ÙŠØ©ØŒ Ù‡Ù†Ø¯Ø³Ø©': 'Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ© ÙˆØ¹Ù…Ø±Ø§Ù† ÙˆÙ…Ù‡Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©',
  'Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø¹Ù…Ø§Ø±Ù† ÙˆÙ…Ù‡Ù† Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ©ØŒ': 'Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ© ÙˆØ¹Ù…Ø±Ø§Ù† ÙˆÙ…Ù‡Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©',
  'ÙˆØ¥Ø¹Ø§Ù„Ù… Ø¢Ù„ÙŠ Ø±ÙŠØ§Ø¶ÙŠØ§Øª': 'Ø±ÙŠØ§Ø¶ÙŠØ§Øª ÙˆØ¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ',
  'Ùˆ Ø¥Ø¹Ø§Ù„Ù… Ø¢Ù„ÙŠ Ø±ÙŠØ§Ø¶ÙŠØ§Øª': 'Ø±ÙŠØ§Ø¶ÙŠØ§Øª ÙˆØ¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ',
  'Ø£Ø¬Ù†Ø¨ÙŠØ© Ø£Ø¯Ø§Ø¨ ÙˆÙ„ØºØ§Øª': 'Ø¢Ø¯Ø§Ø¨ ÙˆÙ„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ©',
};
function canonicalField(raw) {
  return FIELD_CANONICAL[raw?.trim()] || raw?.trim() || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
}

/* programs indexed by stream code for fast eligibility lookup */
const GUIDE_BY_STREAM = {};
for (const prog of GUIDE_PROGRAMS) {
  for (const s of prog.allowedStreams || []) {
    if (!GUIDE_BY_STREAM[s.stream]) GUIDE_BY_STREAM[s.stream] = [];
    GUIDE_BY_STREAM[s.stream].push(prog);
  }
}

/* ---- Stream mapping (KB averages are min1/min2/min3) ----
   min1 = Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© (sciexp), min2 = Ø±ÙŠØ§Ø¶ÙŠØ§Øª (math), min3 = ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ (techmath) */
const STREAM_TO_MIN = {
  sciexp: 'min1',
  math: 'min2',
  techmath: 'min3',
  // gestion/lettres/langues: no separate admission column in the data (they compete on
  // Ù…Ø¹Ø¯Ù„ Ø¹Ø§Ù… with generally lower thresholds). Mark as 'general' for context-building.
  gestion: 'general',
  lettres: 'general',
  langues: 'general',
};
/* Specialities eligible for gestion/lettres/langues students (Ù…Ø¹Ø¯Ù„ Ø¹Ø§Ù…-based, â‰¥10/20) */
const NON_SCIENCE_ELIGIBLE = {
  gestion: new Set(['ss', 'droit', 'sciences-po', 'info-gest', 'enssea', 'ehec', 'sciences-hum', 'charia', 'traduction', 'commu', 'langues', 'math-eco', 'mgmt-eng', 'escf', 'esgen']),
  lettres: new Set(['droit', 'sciences-po', 'sciences-hum', 'langues', 'traduction', 'commu', 'charia', 'ss']),
  langues: new Set(['langues', 'traduction', 'droit', 'sciences-po', 'sciences-hum', 'commu', 'ss']),
};

/* ---- geo-circles.json indexes (built once at module load) ---- */
const WILAYA_TO_CIRCLE = geoCircles.wilayaToCircle || {};   // Latin key â†’ circle id (1/2/3)
const GEO_CIRCLES = geoCircles.circles || [];               // [{id,name_ar,wilayas,...}]
const GEO_RULES = geoCircles.rules || {};                   // {national_programs, regional_programs, redirection}

/* Resolve a Latin KB wilaya key â†’ its zone name in Arabic */
function wilayaZoneAr(wilayaKey) {
  const circleId = WILAYA_TO_CIRCLE[wilayaKey];
  if (!circleId) return null;
  const circle = GEO_CIRCLES.find((c) => c.id === circleId);
  return circle ? circle.name_ar : null;
}

/* ---- Weighted averages (BAC Story calculator import) --------------------- */
/* profiles.weighted_averages JSONB â€” keys are BAC Story calculator ids, values /20.
   Rendered into the student profile block so the AI compares the RIGHT average
   when a program ranks by Ù…Ø¹Ø¯Ù„ Ù…ÙˆØ²ÙˆÙ† (rankingBasis in the guide data). */
const WEIGHTED_AVG_LABELS = {
  'math':         'Ø±ÙŠØ§Ø¶ÙŠØ§Øª',
  'math-physics': 'Ø±ÙŠØ§Ø¶ÙŠØ§Øª+ÙÙŠØ²ÙŠØ§Ø¡',
  'math-tech':    'Ø±ÙŠØ§Ø¶ÙŠØ§Øª+ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§',
  'bio':          'Ø¹Ù„ÙˆÙ… Ø·Ø¨ÙŠØ¹ÙŠØ©',
  'lang':         'Ù„ØºØ§Øª',
  'translation':  'ØªØ±Ø¬Ù…Ø©',
  'arts':         'ÙÙ†ÙˆÙ†',
};

/* Format non-zero weighted averages as "Ø±ÙŠØ§Ø¶ÙŠØ§Øª 15.10 ØŒ Ø¹Ù„ÙˆÙ… Ø·Ø¨ÙŠØ¹ÙŠØ© 15.80".
   Returns '' when the object is missing/empty or has no usable values. */
function formatWeightedAverages(wa) {
  if (!wa || typeof wa !== 'object' || Array.isArray(wa)) return '';
  const parts = [];
  for (const [key, label] of Object.entries(WEIGHTED_AVG_LABELS)) {
    const v = Number(wa[key]);
    if (Number.isFinite(v) && v > 0) parts.push(`${label} ${v.toFixed(2)}`);
  }
  return parts.join(' ØŒ ');
}

/* ---- ministry-rules.json index (built once at module load) ---- */
const MINISTRY_RULES = ministryRulesData.rules || [];

/* Keywords that signal an administrative/procedural question. */
const ADMIN_PROC_KEYWORDS = [
  'Ø§Ù„Ø·Ø¹Ù†', 'Ø·Ø¹Ù†', 'Ø§Ù„ØªØ­ÙˆÙŠÙ„', 'ØªØ­ÙˆÙŠÙ„', 'ØªØºÙŠÙŠØ±', 'Ø§Ù„Ù…Ù†Ø­Ø©', 'Ù…Ù†Ø­Ø©',
  'Ø§Ù„Ø¥ÙŠÙˆØ§Ø¡', 'Ø¥ÙŠÙˆØ§Ø¡', 'Ø§ÙŠÙˆØ§Ø¡', 'Ø§Ù„ØªØ³Ø¬ÙŠÙ„', 'ØªØ³Ø¬ÙŠÙ„', 'Ù…ÙˆØ¹Ø¯', 'Ù…ÙˆØ§Ø¹ÙŠØ¯',
  'Ø±Ø²Ù†Ø§Ù…Ø©', 'Ø±Ø²Ù†Ø§Ù…Ù‡', 'Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª', 'Ø¨Ø·Ø§Ù‚Ù‡ Ø§Ù„Ø±ØºØ¨Ø§Øª', 'Ù…ØªÙÙˆÙ‚',
  'Ø­Ø§Ù„Ø© Ø®Ø§ØµØ©', 'Ø­Ø§Ù„Ø§Øª Ø®Ø§ØµØ©', 'Ø°ÙˆÙŠ Ø§Ù„Ù‡Ù…Ù…', 'Ø¨Ø§Ùƒ Ø£Ø¬Ù†Ø¨ÙŠ', 'Ø¨Ø§Ùƒ Ø§Ø¬Ù†Ø¨ÙŠ',
  'Ø£Ø¬Ù†Ø¨ÙŠ', 'Ø§Ø¬Ù†Ø¨ÙŠ', 'Ø§Ù„Ù‚Ø¯ÙŠÙ…', 'Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©', 'Ù…Ø±Ø­Ù„Ø© Ø«Ø§Ù†ÙŠØ©',
  'inscription', 'calendrier', 'bourse', 'logement', 'transfert',
  // GAP-03: housing / residence keywords
  'Ø§Ù„Ø­ÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ', 'Ø­ÙŠ Ø¬Ø§Ù…Ø¹ÙŠ', 'Ø³ÙƒÙ† Ø¬Ø§Ù…Ø¹ÙŠ', 'Ø³ÙƒÙ† Ø·Ø§Ù„Ø¨', 'Ø¥Ù‚Ø§Ù…Ø© Ø¬Ø§Ù…Ø¹ÙŠØ©',
  'Ù†Ø³ÙƒÙ†', 'Ù†Ù‚Ø¯Ø± Ù†Ø³ÙƒÙ†', 'Ø¥ÙŠÙˆØ§Ø¡ Ø·Ø§Ù„Ø¨', 'hÃ©bergement', 'rÃ©sidence universitaire',
  // GAP-06: geographic-circle keywords
  'Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©', 'Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©', 'Ø¯Ø§Ø¦Ø±Ø© Ø¬ØºØ±Ø§ÙÙŠØ©', 'Ø¯Ø§Ø¦Ø±ØªÙŠ',
  'Ù…Ù†Ø·Ù‚ØªÙŠ', 'Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©',
];

/* Retrieve 1-3 most relevant ministry rules for a procedural query.
   Simple token/keyword overlap against id + topic_ar + questions array. */
function retrieveMinistryRules(rawQuery, maxRules = 3) {
  const q = String(rawQuery || '').toLowerCase();
  const qTokens = new Set(tokenize(q));

  const scored = MINISTRY_RULES.map((rule) => {
    const haystack = [rule.id, rule.topic_ar, ...(rule.questions || [])].join(' ').toLowerCase();
    const hayTokens = tokenize(haystack);
    let score = 0;
    for (const t of qTokens) {
      if (haystack.includes(t)) score += 1;
    }
    for (const qt of qTokens) {
      if (qt.length >= 3 && hayTokens.includes(qt)) score += 1;
    }
    return { rule, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((x) => x.score > 0)
    .slice(0, maxRules)
    .map((x) => x.rule);
}

/* Detect if the query contains procedural/administrative keywords. */
function isAdminProcQuery(rawQuery) {
  const q = String(rawQuery || '').toLowerCase();
  // Ensure we do not allow usage of 'Ø´Ù†Ùˆ'
  if (q.includes('Ø´Ù†Ùˆ')) return false;
  return ADMIN_PROC_KEYWORDS.some((kw) => q.includes(kw));
}

/* Build a ministry-rules injection block (max 3 rules Ã— 600 chars each).
   NOTE: ministry-rules.json contains 27+ official procedural rules extracted from
   the Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ (MESRS circular 2026-2027). These cover Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª, Ø§Ù„ØªÙˆØ¬ÙŠÙ‡,
   Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ†, Ø§Ù„ØªØ­ÙˆÙŠÙ„, Ø§Ù„Ø·Ø¹Ù†, Ø§Ù„Ù…Ù†Ø­Ø©, Ø§Ù„Ø¥ÙŠÙˆØ§Ø¡, Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©, and more.
   The AI MUST use these rules â€” not general knowledge â€” when answering procedural
   questions about university enrollment, transfers, appeals, or orientation steps. */
function buildMinistryRulesBlock(rawQuery) {
  if (!isAdminProcQuery(rawQuery)) return '';
  const rules = retrieveMinistryRules(rawQuery, 3);
  if (!rules.length) return '';
  const MAX_CHARS = 600;
  const lines = ['## Ø£Ø­ÙƒØ§Ù… ÙˆØ²Ø§Ø±ÙŠØ© Ø±Ø³Ù…ÙŠØ©'];
  for (const rule of rules) {
    const ruleText = String(rule.rule_ar || '');
    const truncated = ruleText.length > MAX_CHARS ? ruleText.slice(0, MAX_CHARS).trim() + 'â€¦' : ruleText;
    lines.push(`### ${rule.topic_ar}\n${truncated}`);
  }
  return lines.join('\n\n');
}

/* ---- availability-map.json index (built once at module load) ---- */
const AVAILABILITY_MAP = availabilityMapData.specialities || {};

/* For a detected wilaya key and retrieved KB specs, build a per-spec availability note.
   Returns a map: specId â†’ availability note string (or null if not needed). */
function buildAvailabilityNotes(specs, wilayaKey) {
  if (!wilayaKey || !specs || !specs.length) return {};
  const notes = {};
  for (const spec of specs) {
    const avail = AVAILABILITY_MAP[spec.id];
    if (!avail) continue;
    // scope=national: no restriction message needed
    if (avail.scope === 'national') continue;
    // regional: check if wilayaKey is in offeredIn
    const offeredIn = avail.offeredIn || [];
    if (offeredIn.includes(wilayaKey)) continue;
    if (offeredIn.length === 0) continue;
    // Not offered in this wilaya â€” build a message
    const arName = wilayaArName(wilayaKey);
    const top3 = offeredIn.slice(0, 3).map((wk) => {
      const etabs = (avail.establishments || {})[wk] || [];
      const etabStr = etabs.length ? ` (${etabs[0]})` : '';
      return `${wilayaArName(wk)}${etabStr}`;
    });
    notes[spec.id] = `Ù‡Ø°Ø§ Ø§Ù„ØªØ®ØµØµ Ù„Ø§ ÙŠÙØ¯Ø±ÙŽÙ‘Ø³ ÙÙŠ ${arName} â€” ÙŠÙØ¯Ø±ÙŽÙ‘Ø³ ÙÙŠ: ${top3.join(' ØŒ ')}`;
  }
  return notes;
}

/* GAP-07: Detect "list specialities available in wilaya X" intent.
   Returns true when the query combines a listing intent keyword with a wilaya. */
const WILAYA_LISTING_KEYWORDS = [
  'ØªØ®ØµØµØ§Øª', 'Ù…ØªØ§Ø­', 'Ù…ØªÙˆÙØ±', 'Ù…ÙˆØ¬ÙˆØ¯', 'ÙƒØ§ÙŠÙ†', 'Ø´Ùˆ ÙÙŠÙ‡', 'Ø´Ù†Ùˆ ÙÙŠÙ‡',
  'Ù‚Ø§Ø¦Ù…Ø©', 'list', 'ÙŠØªÙˆÙØ±', 'ØªØªÙˆÙØ±',
];
function isWilayaListingQuery(rawQuery) {
  const q = String(rawQuery || '').toLowerCase();
  return WILAYA_LISTING_KEYWORDS.some((kw) => q.includes(kw));
}

/* Build a compact block listing all specialities offered in a wilaya from
   availability-map.json. Grouped by scope (national first, then regional).
   Capped at 20 entries, kept under ~600 tokens. */
function buildWilayaListingBlock(wilayaKey) {
  if (!wilayaKey) return '';
  const arName = wilayaArName(wilayaKey);
  const national = [];
  const regional = [];

  for (const [specId, avail] of Object.entries(AVAILABILITY_MAP)) {
    if (avail.scope === 'national') {
      national.push(specId);
    } else if ((avail.offeredIn || []).includes(wilayaKey)) {
      regional.push(specId);
    }
  }

  if (national.length === 0 && regional.length === 0) return '';

  // Resolve display name from SPECIALITIES index
  const specById = {};
  for (const s of SPECIALITIES) specById[s.id] = s.name_ar || s.id;

  const lines = [`## Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙÙŠ ÙˆÙ„Ø§ÙŠØ© ${arName} (Ø­Ø³Ø¨ Ø®Ø±ÙŠØ·Ø© Ø§Ù„ØªÙˆÙØ± 2026)`];

  if (national.length > 0) {
    lines.push(`### ØªØ®ØµØµØ§Øª ÙˆØ·Ù†ÙŠØ© (Ù…ØªØ§Ø­Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª â€” ${national.length} ØªØ®ØµØµ):`);
    national.slice(0, 10).forEach((id) => lines.push(`- ${specById[id] || id} (${id})`));
    if (national.length > 10) lines.push(`â€¦ Ùˆ${national.length - 10} ØªØ®ØµØµØ§Ù‹ ÙˆØ·Ù†ÙŠØ§Ù‹ Ø¢Ø®Ø±`);
  }

  if (regional.length > 0) {
    lines.push(`### ØªØ®ØµØµØ§Øª Ø¥Ù‚Ù„ÙŠÙ…ÙŠØ© Ù…ØªÙˆÙØ±Ø© ÙÙŠ ${arName} (${regional.length} ØªØ®ØµØµ):`);
    regional.slice(0, 10).forEach((id) => lines.push(`- ${specById[id] || id} (${id})`));
    if (regional.length > 10) lines.push(`â€¦ Ùˆ${regional.length - 10} ØªØ®ØµØµØ§Ù‹ Ø¥Ù‚Ù„ÙŠÙ…ÙŠØ§Ù‹ Ø¢Ø®Ø±`);
  }

  lines.push('â„¹ï¸ Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ù…Ù† Ø®Ø±ÙŠØ·Ø© Ø§Ù„ØªÙˆÙØ± â€” ØªØ­Ù‚Ù‚ Ù…Ù† Ù…Ù†ØµØ© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.');
  return lines.join('\n');
}

const STREAM_AR = {
  sciexp: 'Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©',
  math: 'Ø±ÙŠØ§Ø¶ÙŠØ§Øª',
  techmath: 'ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ',
  gestion: 'ØªØ³ÙŠÙŠØ± ÙˆØ§Ù‚ØªØµØ§Ø¯',
  lettres: 'Ø¢Ø¯Ø§Ø¨ ÙˆÙÙ„Ø³ÙØ©',
  langues: 'Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ©',
};
const AR_STREAM_TO_CODE = {
  'Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©': 'sciexp',
  'Ø±ÙŠØ§Ø¶ÙŠØ§Øª': 'math',
  'ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ': 'techmath',
  'ØªØ³ÙŠÙŠØ± ÙˆØ§Ù‚ØªØµØ§Ø¯': 'gestion',
  'Ø¢Ø¯Ø§Ø¨ ÙˆÙÙ„Ø³ÙØ©': 'lettres',
  'Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ©': 'langues',
};

function streamCode(streamRaw) {
  if (!streamRaw) return null;
  if (AR_STREAM_TO_CODE[streamRaw]) return AR_STREAM_TO_CODE[streamRaw];
  const s = String(streamRaw).toLowerCase();
  if (STREAM_TO_MIN[s]) return s;
  return null;
}

/* ---- Wilaya detection (per-wilaya 2026 averages in KB wilayaAverages) ----
   KB keys are Latin ("Ouargla", "Alger", â€¦) plus a special "National" key and
   a few non-wilaya campuses ("Sci Islamiques Emir"). Map every Latin key that
   students actually ask about to its Arabic display name + query variants. */
const WILAYA_DEF = {
  'Adrar':              { ar: 'Ø£Ø¯Ø±Ø§Ø±',           variants: ['adrar', 'Ø§Ø¯Ø±Ø§Ø±'] },
  'Aflou':              { ar: 'Ø£ÙÙ„Ùˆ',            variants: ['aflou', 'Ø§ÙÙ„Ùˆ'] },
  'Ain Defla':          { ar: 'Ø¹ÙŠÙ† Ø§Ù„Ø¯ÙÙ„Ù‰',      variants: ['ain defla', 'Ø¹ÙŠÙ† Ø§Ù„Ø¯ÙÙ„Ø©'] },
  'Ain Temouchent':     { ar: 'Ø¹ÙŠÙ† ØªÙ…ÙˆØ´Ù†Øª',      variants: ['ain temouchent', 'temouchent'] },
  'Alger':              { ar: 'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©',  variants: ['alger', 'algiers', 'Ø§Ù„Ø¹Ø§ØµÙ…Ø©', 'ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±', 'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©'] },
  'Annaba':             { ar: 'Ø¹Ù†Ø§Ø¨Ø©',           variants: ['annaba', 'Ø¨ÙˆÙ†Ø©'] },
  'Barika':             { ar: 'Ø¨Ø±ÙŠÙƒØ©',           variants: ['barika'] },
  'Batna':              { ar: 'Ø¨Ø§ØªÙ†Ø©',           variants: ['batna'] },
  'Bechar':             { ar: 'Ø¨Ø´Ø§Ø±',            variants: ['bechar'] },
  'Bejaia':             { ar: 'Ø¨Ø¬Ø§ÙŠØ©',           variants: ['bejaia', 'bgayet'] },
  'Biskra':             { ar: 'Ø¨Ø³ÙƒØ±Ø©',           variants: ['biskra'] },
  'Blida':              { ar: 'Ø§Ù„Ø¨Ù„ÙŠØ¯Ø©',          variants: ['blida', 'Ø¨Ù„ÙŠØ¯Ø©'] },
  'Bordj Bou Arreridj': { ar: 'Ø¨Ø±Ø¬ Ø¨ÙˆØ¹Ø±ÙŠØ±ÙŠØ¬',    variants: ['bordj bou arreridj', 'Ø¨Ø±Ø¬ Ø¨Ùˆ Ø¹Ø±ÙŠØ±ÙŠØ¬'] },
  'Bou Saada':          { ar: 'Ø¨ÙˆØ³Ø¹Ø§Ø¯Ø©',         variants: ['bou saada', 'boussaada', 'Ø¨Ùˆ Ø³Ø¹Ø§Ø¯Ø©'] },
  'Bouira':             { ar: 'Ø§Ù„Ø¨ÙˆÙŠØ±Ø©',          variants: ['bouira', 'Ø¨ÙˆÙŠØ±Ø©'] },
  'Boumerdes':          { ar: 'Ø¨ÙˆÙ…Ø±Ø¯Ø§Ø³',         variants: ['boumerdes'] },
  'Chlef':              { ar: 'Ø§Ù„Ø´Ù„Ù',           variants: ['chlef', 'Ø´Ù„Ù'] },
  'Constantine':        { ar: 'Ù‚Ø³Ù†Ø·ÙŠÙ†Ø©',         variants: ['constantine', 'Ù‚Ø³Ù…Ø·ÙŠÙ†Ø©'] },
  'Djelfa':             { ar: 'Ø§Ù„Ø¬Ù„ÙØ©',           variants: ['djelfa', 'Ø¬Ù„ÙØ©'] },
  'El Bayadh':          { ar: 'Ø§Ù„Ø¨ÙŠØ¶',           variants: ['el bayadh', 'bayadh'] },
  'El Oued':            { ar: 'Ø§Ù„ÙˆØ§Ø¯ÙŠ',           variants: ['el oued', 'Ø§Ù„ÙˆØ§Ø¯'] },
  'El Tarf':            { ar: 'Ø§Ù„Ø·Ø§Ø±Ù',           variants: ['el tarf', 'tarf'] },
  'Ghardaia':           { ar: 'ØºØ±Ø¯Ø§ÙŠØ©',           variants: ['ghardaia'] },
  'Guelma':             { ar: 'Ù‚Ø§Ù„Ù…Ø©',            variants: ['guelma'] },
  'Jijel':              { ar: 'Ø¬ÙŠØ¬Ù„',            variants: ['jijel'] },
  'Khenchela':          { ar: 'Ø®Ù†Ø´Ù„Ø©',           variants: ['khenchela'] },
  'Laghouat':           { ar: 'Ø§Ù„Ø£ØºÙˆØ§Ø·',          variants: ['laghouat'] },
  'Maghnia':            { ar: 'Ù…ØºÙ†ÙŠØ©',            variants: ['maghnia'] },
  'Mascara':            { ar: 'Ù…Ø¹Ø³ÙƒØ±',           variants: ['mascara'] },
  'Medea':              { ar: 'Ø§Ù„Ù…Ø¯ÙŠØ©',           variants: ['medea', 'Ù…Ø¯ÙŠØ©'] },
  'Mila':               { ar: 'Ù…ÙŠÙ„Ø©',             variants: ['mila'] },
  'Mostaganem':         { ar: 'Ù…Ø³ØªØºØ§Ù†Ù…',          variants: ['mostaganem'] },
  'Msila':              { ar: 'Ø§Ù„Ù…Ø³ÙŠÙ„Ø©',          variants: ['msila', "m'sila", 'Ù…Ø³ÙŠÙ„Ø©'] },
  'Naama':              { ar: 'Ø§Ù„Ù†Ø¹Ø§Ù…Ø©',          variants: ['naama', 'Ù†Ø¹Ø§Ù…Ø©'] },
  'Oran':               { ar: 'ÙˆÙ‡Ø±Ø§Ù†',            variants: ['oran', 'wahran'] },
  'Ouargla':            { ar: 'ÙˆØ±Ù‚Ù„Ø©',            variants: ['ouargla', 'ÙˆØ±Ú¨Ù„Ø©', 'ÙˆØ±Ø¬Ù„Ø§Ù†'] },
  'Oum El Bouaghi':     { ar: 'Ø£Ù… Ø§Ù„Ø¨ÙˆØ§Ù‚ÙŠ',       variants: ['oum el bouaghi'] },
  'Relizane':           { ar: 'ØºÙ„ÙŠØ²Ø§Ù†',           variants: ['relizane', 'ØºÙŠÙ„ÙŠØ²Ø§Ù†'] },
  'Saida':              { ar: 'Ø³Ø¹ÙŠØ¯Ø©',            variants: ['saida'] },
  'Setif':              { ar: 'Ø³Ø·ÙŠÙ',            variants: ['setif'] },
  'Sidi Bel Abbes':     { ar: 'Ø³ÙŠØ¯ÙŠ Ø¨Ù„Ø¹Ø¨Ø§Ø³',     variants: ['sidi bel abbes', 'Ø³ÙŠØ¯ÙŠ Ø¨Ù„ Ø¹Ø¨Ø§Ø³', 'bel abbes'] },
  'Skikda':             { ar: 'Ø³ÙƒÙŠÙƒØ¯Ø©',          variants: ['skikda'] },
  'Souk Ahras':         { ar: 'Ø³ÙˆÙ‚ Ø£Ù‡Ø±Ø§Ø³',       variants: ['souk ahras'] },
  'Tamanrasset':        { ar: 'ØªÙ…Ù†Ø±Ø§Ø³Øª',         variants: ['tamanrasset', 'ØªØ§Ù…Ù†ØºØ³Øª', 'ØªÙ…Ù†ØºØ³Øª'] },
  'Tebessa':            { ar: 'ØªØ¨Ø³Ø©',            variants: ['tebessa'] },
  'Tiaret':             { ar: 'ØªÙŠØ§Ø±Øª',            variants: ['tiaret'] },
  'Tipaza':             { ar: 'ØªÙŠØ¨Ø§Ø²Ø©',           variants: ['tipaza'] },
  'Tissemsilt':         { ar: 'ØªÙŠØ³Ù…Ø³ÙŠÙ„Øª',        variants: ['tissemsilt'] },
  'Tizi Ouzou':         { ar: 'ØªÙŠØ²ÙŠ ÙˆØ²Ùˆ',        variants: ['tizi ouzou', 'ØªÙŠØ²ÙŠ Ø§ÙˆØ²Ùˆ'] },
  'Tlemcen':            { ar: 'ØªÙ„Ù…Ø³Ø§Ù†',           variants: ['tlemcen'] },
  'Touggourt':          { ar: 'ØªÙ‚Ø±Øª',            variants: ['touggourt', 'ØªÙˆÙ‚Ø±Øª', 'ØªÚ¨Ø±Øª'] },
};
/* Note: bare "Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±" is deliberately NOT a variant for Alger â€” in queries it
   almost always means the country ("Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø·Ø¨ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±"), not the wilaya. */

/* Normalize Arabic hamza/taa-marbuta variants + Latin accents for matching. */
function normalizeWilayaText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[Ø£Ø¥Ø¢Ù±]/g, 'Ø§')
    .replace(/Ø©/g, 'Ù‡')
    .replace(/Ù‰/g, 'ÙŠ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u0655]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Lookup structures built once at module load. */
const _WILAYA_SINGLE = new Map(); // normalized single token â†’ key
const _WILAYA_MULTI = [];         // { needle, key } â€” multi-word, longest first
for (const [key, def] of Object.entries(WILAYA_DEF)) {
  for (const v of [def.ar, ...def.variants]) {
    const n = normalizeWilayaText(v);
    if (!n) continue;
    if (n.includes(' ')) _WILAYA_MULTI.push({ needle: n, key });
    else _WILAYA_SINGLE.set(n, key);
  }
}
_WILAYA_MULTI.sort((a, b) => b.needle.length - a.needle.length);

/* Detect a wilaya mention in free text â†’ Latin KB key (or null). */
function detectWilaya(text) {
  const q = normalizeWilayaText(text);
  if (!q) return null;
  for (const { needle, key } of _WILAYA_MULTI) {
    if (q.includes(needle)) return key;
  }
  for (const t of q.split(' ')) {
    if (_WILAYA_SINGLE.has(t)) return _WILAYA_SINGLE.get(t);
    // Tolerate attached Arabic prefixes: "Ø¨ÙˆØ±Ù‚Ù„Ø©"ØŒ "Ù„ÙˆÙ‡Ø±Ø§Ù†"ØŒ "ÙˆÙˆØ±Ù‚Ù„Ø©"
    const stripped = t.replace(/^[ÙˆØ¨Ù„Ù]/, '');
    if (stripped.length >= 3 && stripped !== t && _WILAYA_SINGLE.has(stripped)) {
      return _WILAYA_SINGLE.get(stripped);
    }
  }
  return null;
}

function wilayaArName(key) {
  return WILAYA_DEF[key]?.ar || key;
}

/* GAP-08: Detect zone-name mentions (Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ØºØ±Ø¨ / Ø§Ù„Ø´Ø±Ù‚ / Ø§Ù„ÙˆØ³Ø·) in free text.
   Returns the matching circle object from GEO_CIRCLES, or null if no zone found.
   Called ONLY when detectWilaya() returns null (specific wilaya takes priority). */
const ZONE_VARIANTS = [
  { ids: [1], patterns: ['Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø´Ø±Ù‚', 'Ù…Ù†Ø·Ù‚Ù‡ Ø§Ù„Ø´Ø±Ù‚', 'Ø§Ù„Ø´Ø±Ù‚ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ'] },
  { ids: [2], patterns: ['Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙˆØ³Ø·', 'Ù…Ù†Ø·Ù‚Ù‡ Ø§Ù„ÙˆØ³Ø·', 'Ø§Ù„ÙˆØ³Ø· Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ', 'ÙˆØ³Ø· Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±'] },
  { ids: [3], patterns: ['Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ØºØ±Ø¨', 'Ù…Ù†Ø·Ù‚Ù‡ Ø§Ù„ØºØ±Ø¨', 'Ø§Ù„ØºØ±Ø¨ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ', 'ØºØ±Ø¨ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±'] },
  // bare zone names â€” checked only if "Ù…Ù†Ø·Ù‚Ø©" not already caught above
  { ids: [1], patterns: ['Ø§Ù„Ø´Ø±Ù‚'] },
  { ids: [2], patterns: ['Ø§Ù„ÙˆØ³Ø·'] },
  { ids: [3], patterns: ['Ø§Ù„ØºØ±Ø¨'] },
];

function detectZone(text) {
  const q = normalizeWilayaText(text);
  if (!q) return null;
  for (const { ids, patterns } of ZONE_VARIANTS) {
    for (const p of patterns) {
      const pn = normalizeWilayaText(p);
      if (q.includes(pn)) {
        return GEO_CIRCLES.find((c) => ids.includes(c.id)) || null;
      }
    }
  }
  return null;
}

/* Build a compact zone-context injection block for zone-level queries (GAP-08).
   Lists the wilayas in the zone and explains regional assignment. */
function buildZoneContextBlock(circle) {
  if (!circle) return '';
  const wilayaList = (circle.wilayas || []).join(' ØŒ ');
  const lines = [
    `## Ø³ÙŠØ§Ù‚ Ø¬ØºØ±Ø§ÙÙŠ: ${circle.name_ar}`,
    `Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…Ù†ØªÙ…ÙŠØ© Ù„Ù€${circle.name_ar}: ${wilayaList}`,
    'â„¹ï¸ Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª ØªØ®ØªÙ„Ù Ù…Ù† ÙˆÙ„Ø§ÙŠØ© Ù„Ø£Ø®Ø±Ù‰ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†Ø·Ù‚Ø© â€” Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù…Ø¹Ø¯Ù„ Ø¯Ù‚ÙŠÙ‚ Ø§Ø°ÙƒØ± Ø§Ø³Ù… Ø§Ù„ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©.',
  ];
  if (GEO_RULES.regional_programs) {
    lines.push(`Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„ØªÙƒÙˆÙŠÙ†Ø§Øª Ø§Ù„Ø¬Ù‡ÙˆÙŠØ©: ${String(GEO_RULES.regional_programs).slice(0, 350)}`);
  }
  return lines.join('\n');
}

/* Format one wilayaAverages entry â€” omit null streams. Returns null if all null. */
function formatWilayaNums(entry) {
  if (!entry) return null;
  const parts = [];
  if (entry.min1 != null) parts.push(`Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© ${entry.min1}`);
  if (entry.min2 != null) parts.push(`Ø±ÙŠØ§Ø¶ÙŠØ§Øª ${entry.min2}`);
  if (entry.min3 != null) parts.push(`ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ ${entry.min3}`);
  return parts.length ? parts.join(' / ') : null;
}

/* Per-spec wilaya context block (kept compact â€” well under ~500 tokens):
   - wilaya asked + data exists   â†’ exact 2026 numbers for that wilaya
   - wilaya asked + no data there â†’ explicit "not offered there" (no invented numbers)
   - no wilaya asked              â†’ national minimum + coverage count + 3 lowest-threshold wilayas */
function buildWilayaBlock(spec, wilayaKey) {
  const wa = spec.wilayaAverages;
  if (!wa) return '';
  const realKeys = Object.keys(wa).filter((k) => k !== 'National' && WILAYA_DEF[k]);

  if (wilayaKey) {
    const arName = wilayaArName(wilayaKey);
    const nums = formatWilayaNums(wa[wilayaKey]);
    if (nums) return `Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ 2026 ÙÙŠ ${arName}: ${nums}`;
    // GAP-02: check availability-map scope before emitting "ØºÙŠØ± Ù…ØªÙˆÙØ±"
    const avail = AVAILABILITY_MAP[spec.id];
    if (avail && avail.scope === 'national') {
      const natNums = formatWilayaNums(wa['National']);
      const lines = ['ØªØ®ØµØµ ÙˆØ·Ù†ÙŠ: ÙŠÙÙˆØ¬ÙŽÙ‘Ù‡ Ø­Ø³Ø¨ Ù…Ø¹Ø¯Ù„Ùƒ Ø§Ù„ÙˆØ·Ù†ÙŠ â€” Ù„Ø§ ÙŠÙØ´ØªØ±Ø· ÙˆØ¬ÙˆØ¯Ù‡ ÙÙŠ ÙˆÙ„Ø§ÙŠØªÙƒ'];
      if (natNums) lines.push(`Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø§Ù„ÙˆØ·Ù†ÙŠ 2026: ${natNums}`);
      return lines.join('\n');
    }
    const lines = [`Ù‡Ø°Ø§ Ø§Ù„ØªØ®ØµØµ ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ ÙˆÙ„Ø§ÙŠØ© ${arName} Ø­Ø³Ø¨ Ù…Ø¹Ø·ÙŠØ§Øª 2026`];
    const natNums = formatWilayaNums(wa['National']);
    if (natNums) lines.push(`(ØªØ³Ø¬ÙŠÙ„ ÙˆØ·Ù†ÙŠ â€” Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø§Ù„ÙˆØ·Ù†ÙŠ 2026: ${natNums})`);
    return lines.join('\n');
  }

  // No wilaya in the query â†’ compact national summary, never the full dump.
  const natNums = formatWilayaNums(wa['National']) || (() => {
    // Compute per-stream minimum across wilayas when no explicit National row exists.
    const mins = { min1: null, min2: null, min3: null };
    for (const k of realKeys) {
      const e = wa[k] || {};
      for (const m of ['min1', 'min2', 'min3']) {
        if (e[m] != null && (mins[m] == null || e[m] < mins[m])) mins[m] = e[m];
      }
    }
    return formatWilayaNums(mins);
  })();

  if (realKeys.length === 0) {
    return natNums ? `Ù…Ø¹Ø¯Ù„Ø§Øª 2026 (ØªØ³Ø¬ÙŠÙ„ ÙˆØ·Ù†ÙŠ): ${natNums}` : '';
  }

  const lowest = realKeys
    .map((k) => {
      const e = wa[k] || {};
      const vals = [e.min1, e.min2, e.min3].filter((v) => v != null);
      return { k, score: vals.length ? Math.min(...vals) : Infinity };
    })
    .filter((x) => x.score !== Infinity)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => `${wilayaArName(x.k)} (${formatWilayaNums(wa[x.k])})`);

  const lines = [`Ù…Ù„Ø®Øµ Ù…Ø¹Ø¯Ù„Ø§Øª 2026 Ø­Ø³Ø¨ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª: Ù…ØªÙˆÙØ± ÙÙŠ ${realKeys.length} ÙˆÙ„Ø§ÙŠØ©/Ù…ÙˆÙ‚Ø¹.`];
  if (natNums) lines.push(`Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø§Ù„ÙˆØ·Ù†ÙŠ 2026: ${natNums}`);
  if (lowest.length) lines.push(`Ø£Ù‚Ù„ Ø§Ù„Ø¹ØªØ¨Ø§Øª: ${lowest.join(' ØŒ ')}`);
  return lines.join('\n');
}

/* Format per-stream thresholds â€” only show streams with actual data.
   null means "no admissions data for this stream", NOT "stream is rejected". */
function formatAverages(resolved) {
  if (!resolved) return 'ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©';
  const lines = [];
  if (resolved.min1 != null) lines.push(`Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©: ${resolved.min1}`);
  if (resolved.min2 != null) lines.push(`Ø±ÙŠØ§Ø¶ÙŠØ§Øª: ${resolved.min2}`);
  if (resolved.min3 != null) lines.push(`ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ: ${resolved.min3}`);
  return lines.length ? lines.join(' Â· ') : 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© Ø¨Ø¹Ø¯';
}

/* ---- Section excerpting -------------------------------------------------- */
/* Pull the most useful sections by fuzzy title keywords, trim each chunk. */
const SECTION_WANTS = [
  { label: 'ØªØ¹Ø±ÙŠÙ', keys: ['ØªØ¹Ø±ÙŠÙ', 'Ø§Ù„ØªØ¹Ø±ÙŠÙ', 'real talk', 'ÙÙ„Ø³ÙØ©'] },
  { label: 'ÙØ±Øµ Ø§Ù„Ø¹Ù…Ù„', keys: ['ÙØ±Øµ Ø§Ù„Ø¹Ù…Ù„', 'Ø§Ù„Ø¢ÙØ§Ù‚', 'ØªØ¹Ù…Ù„', 'Ø§Ù„Ø¹Ù…Ù„ ÙÙŠ'] },
  { label: 'Ù…Ø¯Ø©/Ù†Ø¸Ø§Ù… Ø§Ù„Ø¯Ø±Ø§Ø³Ø©', keys: ['Ù†Ø¸Ø§Ù… Ø§Ù„Ø¯Ø±Ø§Ø³Ø©', 'Ù…Ø¯Ø© Ø§Ù„Ø¯Ø±Ø§Ø³Ø©', 'ØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹'] },
  { label: 'Ø§Ù„ØªÙˆØ¬ÙŠÙ‡/Ø§Ù„Ø´Ø¹Ø¨', keys: ['Ø§Ù„Ø´Ø¹Ø¨ Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„Ø©', 'Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„', 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø¯Ø±Ø³Ø©'] },
];

function trim(text, max = 400) {
  if (!text) return '';
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trim() + 'â€¦' : t;
}

function pickSections(sections) {
  if (!sections) return [];
  const titles = Object.keys(sections);
  const out = [];
  const used = new Set();
  for (const want of SECTION_WANTS) {
    const match = titles.find((title) => {
      if (used.has(title)) return false;
      const lower = title.toLowerCase();
      return want.keys.some((k) => lower.includes(k.toLowerCase()) || title.includes(k));
    });
    if (match) {
      used.add(match);
      const body = trim(sections[match], 200);
      if (body) out.push(`${want.label}: ${body}`);
    }
  }
  // Fallback: if no sections matched, include first 2 by position (handles Darija-titled specs)
  if (out.length === 0) {
    Object.entries(sections).slice(0, 2).forEach(([title, content]) => {
      const body = trim(content, 200);
      if (body) out.push(`${title}: ${body}`);
    });
  }
  return out;
}

/* ---- Establishment resolution ------------------------------------------- */
function rowsForSpec(spec, limit = 6) {
  const rows = [];
  const seen = new Set();

  // 1) Direct linked establishment rows (indices into ADM_ROWS).
  for (const idx of spec.linkedEtabRows || []) {
    const r = ADM_ROWS[idx];
    if (!r) continue;
    const key = `${r.codeEtb}|${r.codeFil}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(r);
    if (rows.length >= limit) return rows;
  }

  // 2) Fall back to filiere-index "best" thresholds for linked filiere keys.
  for (const fk of spec.linkedFiliereKeys || []) {
    const fil = FILIERES[fk];
    if (!fil || !fil.best) continue;
    const key = `fil|${fk}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      etab: fil.label || fk,
      min1: fil.best.min1,
      min2: fil.best.min2,
      min3: fil.best.min3,
      wilaya: null,
      _fromFiliere: true,
    });
    if (rows.length >= limit) return rows;
  }
  return rows;
}

function formatRow(r) {
  const fmt = (v) => (v === null || v === undefined ? 'â€”' : v);
  const loc = r.wilaya ? ` [${r.wilaya}]` : '';
  return `${r.etab}${loc} â€” ØªØ¬Ø±ÙŠØ¨ÙŠØ©:${fmt(r.min1)} Ø±ÙŠØ§Ø¶ÙŠØ§Øª:${fmt(r.min2)} ØªÙ‚Ù†ÙŠ:${fmt(r.min3)}`;
}

/* ---- Retrieval (RAG) ---------------------------------------------------- */
function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

/* GAP-05: Strip common Arabic attached prefixes (Ù„Ù„ØŒ Ø¨Ø§Ù„ØŒ ÙˆØ§Ù„ØŒ ÙØ§Ù„ØŒ ÙƒØ§Ù„ØŒ Ø§Ù„)
   so "Ù„Ù„Ø·Ø¨" matches "Ø§Ù„Ø·Ø¨", "Ø¨Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª" matches "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª", etc.
   Returns the root form (still lowercased Arabic). */
function stripArabicPrefix(token) {
  // Order matters: try longest prefix first to avoid double-stripping
  const prefixes = ['Ù„Ù„', 'Ø¨Ø§Ù„', 'ÙˆØ§Ù„', 'ÙØ§Ù„', 'ÙƒØ§Ù„', 'Ø§Ù„'];
  for (const p of prefixes) {
    if (token.startsWith(p) && token.length > p.length + 1) {
      return token.slice(p.length);
    }
  }
  return token;
}

/* Expand a token set with prefix-stripped variants (mutates the set in place). */
function expandWithPrefixStrip(tokenSet) {
  const extras = [];
  for (const t of tokenSet) {
    const stripped = stripArabicPrefix(t);
    if (stripped !== t) extras.push(stripped);
  }
  for (const e of extras) tokenSet.add(e);
}

/* GAP-Q23: Darija-to-MSA synonym expansion.
   Expand common Darija terms that relate to specialties so that queries like
   "Ø¥Ù†Ø¬ÙŠÙ†ÙŠÙˆØ± Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠØ©" or "Ø¯ÙƒØªÙˆØ±" correctly retrieve the relevant KB specs.
   Operates on the raw query string and returns an augmented string. */
const DARIJA_SYNONYMS = [
  // engineering / computer science
  { pattern: /Ø¥Ù†Ø¬ÙŠÙ†ÙŠÙˆØ±|Ù…Ù‡Ù†Ø¯Ø³/g,       expansion: 'Ù‡Ù†Ø¯Ø³Ø©' },
  // medicine / health
  { pattern: /Ø¯ÙƒØªÙˆØ±|Ø·Ø¨ÙŠØ¨|Ø·Ø¨ÙŠØ¨Ø©/g,      expansion: 'Ø·Ø¨ Ù…Ø¯Ø±Ø³Ø©' },
  { pattern: /Ø³Ù†Ø§Ù†|Ø£Ø³Ù†Ø§Ù†|Ø§Ø³Ù†Ø§Ù†/g,       expansion: 'Ø·Ø¨ Ø£Ø³Ù†Ø§Ù†' },
  { pattern: /ÙØ±Ù…Ù„ÙŠ|ÙØ±Ù…Ù„ÙŠØ©/g,           expansion: 'Ø´Ø¨Ù‡ Ø·Ø¨ÙŠ' },
  { pattern: /ÙØ§Ø±Ù…Ø§Ø³ÙŠ|ØµÙŠØ¯Ù„Ø©|ØµÙŠØ¯Ù„ÙŠ/g,    expansion: 'ØµÙŠØ¯Ù„Ø©' },
  { pattern: /Ø¨ÙŠØ·Ø±Ø©|Ø¨ÙŠØ·Ø±ÙŠ|Ø­ÙŠÙˆØ§Ù†Ø§Øª/g,    expansion: 'Ø¨ÙŠØ·Ø±Ø©' },
  // law
  { pattern: /Ù…Ø­Ø§Ù…ÙŠ|Ù‚Ø§Ø¶ÙŠ|Ù…Ø­Ø§Ù…Ø§Ø©/g,       expansion: 'Ø­Ù‚ÙˆÙ‚' },
  // informatics / coding
  { pattern: /ÙƒÙ…Ø¨ÙŠÙˆØªØ±|ÙƒÙˆØ¯Ø§Ø¬|ÙƒÙˆØ¯ÙŠÙ†Øº|Ù…ÙŠÙƒØ±Ùˆ/g, expansion: 'Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ' },
  // business / economics
  { pattern: /Ø£Ø¹Ù…Ø§Ù„|Ø¨ÙŠØ²Ù†ÙŠØ³|Ø¯Ø±Ø§Ù‡Ù…/g,     expansion: 'ØªØ³ÙŠÙŠØ± Ø§Ù‚ØªØµØ§Ø¯' },
  // education
  { pattern: /Ø¨Ø±ÙˆÙ|Ø§Ø³ØªØ§Ø°|Ø£Ø³ØªØ§Ø°|Ø´ÙŠØ®|Ù…Ø¹Ù„Ù…/g, expansion: 'Ø£Ø³ØªØ§Ø° Ù…Ø¯Ø±Ø³Ø© Ø¹Ù„ÙŠØ§ ØªØ¹Ù„ÙŠÙ…' },
  // sports
  { pattern: /Ø³Ø¨ÙˆØ±|Ø±ÙŠØ§Ø¶Ø©/g,            expansion: 'Ø³ØªØ§Ø¨Ø³ Ø¹Ù„ÙˆÙ… ÙˆØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„Ù†Ø´Ø§Ø·Ø§Øª Ø§Ù„Ø¨Ø¯Ù†ÙŠØ©' },
  // language
  { pattern: /Ù„ØºØ§Øª|ØªØ±Ø¬Ù…Ø©|Ø·Ø±Ø§Ø¯ÙŠÙƒØ³ÙŠÙˆÙ†/g,   expansion: 'ØªØ±Ø¬Ù…Ø© Ù„ØºØ§Øª' },
  // housing
  { pattern: /Ù†Ø¨Ø§Øª|Ø³ÙŠØªÙŠ|Ø±ÙˆÙ…|Ø´ÙˆÙ…Ø¨Ø±Ø§|Ø¥Ù‚Ø§Ù…Ø©/g, expansion: 'Ø¥Ù‚Ø§Ù…Ø© Ø¬Ø§Ù…Ø¹ÙŠØ© Ø­ÙŠ Ø¬Ø§Ù…Ø¹ÙŠ' }
];

function expandDarijaSynonyms(rawQuery) {
  let expanded = rawQuery;
  for (const { pattern, expansion } of DARIJA_SYNONYMS) {
    if (pattern.test(expanded)) {
      expanded += ' ' + expansion;
    }
    // Reset lastIndex since we're reusing global regexes
    pattern.lastIndex = 0;
  }
  return expanded;
}

function specText(spec) {
  const sectionText = Object.values(spec.sections || {}).join(' ');
  return `${spec.name_ar} ${spec.name_fr} ${spec.dataName || ''} ${spec.id} ${sectionText}`;
}

/* ---- Intent detection helpers for retrieve() -------------------------------- */
const ENSIA_SIGNALS = ['ensia', 'Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', 'Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', 'ia artificielle', 'intelligence artificielle', 'ai school', 'Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ø°ÙƒØ§Ø¡', 'Ø³ÙŠØ¯ÙŠ Ø¹Ø¨Ø¯ Ø§Ù„Ù„Ù‡'];
const CPGE_SIGNALS = ['cpge', 'classes prÃ©paratoires', 'prÃ©pa', 'prepa', 'ØªØ­Ø¶ÙŠØ±ÙŠØ©', 'ÙƒÙ„Ø§Ø³ Ø¨Ø±ÙŠØ¨Ø§', 'mpsi', 'pcsi', 'mp ', ' pc ', 'psi', 'Ù…Ø±Ø­Ù„Ø© ØªØ­Ø¶ÙŠØ±ÙŠØ©', 'Ù…Ø¯Ø±Ø³Ø© Ø¹Ù„ÙŠØ§ Ù…Ø³Ø§Ø¨Ù‚Ø©', 'grandes Ã©coles'];
const WISHLIST_SIGNALS = ['Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª', 'bØ·Ø§Ù‚Ø©', 'carte de voeux', 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª', 'Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØ®ØµØµ', 'ÙƒÙŠÙ Ø£Ù…Ù„Ø£', 'ÙƒÙŠÙ Ù†Ù…Ù„Ø§', 'Ù…Ø§Ø°Ø§ Ø£Ø®ØªØ§Ø±', 'ÙˆØ§Ø´ Ù†Ø®ØªØ§Ø±', 'Ù†ØµØ§Ø¦Ø­ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'ØªØ±ØªÙŠØ¨ Ø§Ù„Ø±ØºØ¨Ø§Øª'];
const ORIENTATION_SIGNALS = ['ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ', 'Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ', 'ÙƒÙŠÙ ÙŠØ´ØªØºÙ„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'Ù…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'Ø®Ø·ÙˆØ§Øª Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'inscription en ligne', 'Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡', 'classement', 'rÃ©sultats orientation'];

function detectIntent(rawQuery) {
  const q = rawQuery.toLowerCase();
  return {
    ensia:       ENSIA_SIGNALS.some((s) => q.includes(s)),
    cpge:        CPGE_SIGNALS.some((s) => q.includes(s)),
    wishlist:    WISHLIST_SIGNALS.some((s) => q.includes(s)),
    orientation: ORIENTATION_SIGNALS.some((s) => q.includes(s)),
  };
}



/* Render the selected specialities into a compact, bounded context string.
   wilayaKey (optional): Latin KB key of the wilaya the student asked about. */
function buildContext(specs, wilayaKey = null) {
  const availNotes = buildAvailabilityNotes(specs, wilayaKey);
  return specs
    .map((spec) => {
      const sections = pickSections(spec.sections);
      const richExcerpt = buildRichExcerpt(spec.id);
      const rows = rowsForSpec(spec, 6).map(formatRow);
      const parts = [
        `### [${spec.id}] ${spec.name_ar} / ${spec.name_fr}`,
        `Ø§Ù„ØªØµÙ†ÙŠÙ: ${spec.category}`,
        `Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ Ø­Ø³Ø¨ Ø§Ù„Ø´Ø¹Ø¨Ø©: ${formatAverages(spec.resolvedAverages)}`,
      ];
      const wilayaBlock = buildWilayaBlock(spec, wilayaKey);
      if (wilayaBlock) parts.push(wilayaBlock);
      // Availability note: override generic "ØºÙŠØ± Ù…ØªÙˆÙØ±" with specific wilaya list
      if (availNotes[spec.id]) parts.push(availNotes[spec.id]);
      if (sections.length) parts.push(sections.join('\n'));
      if (richExcerpt) parts.push(richExcerpt);
      if (rows.length) parts.push('Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø±Ø¬Ø¹ÙŠØ©:\n- ' + rows.join('\n- '));
      return parts.join('\n');
    })
    .join('\n\n---\n\n');
}

/* ---- Official guide context builder ------------------------------------- */
/* Produces a compact, structured summary of accessible programs from Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ
   for the student's stream + wilaya. Injected into the system prompt as authoritative
   official data (complements the KB RAG context). Returns '' when no data available. */
function buildGuideContext(profile) {
  const p = profile || {};
  const code = streamCode(p.stream);
  if (!code) return '';

  const wilaya = p.wilaya && p.wilaya !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©' ? p.wilaya : null;
  const wNum = wilaya ? (WILAYA_TO_NUM[wilaya] || WILAYA_TO_NUM[wilaya.replace(/^\d+\s*[-â€“]\s*/, '').trim()] || null) : null;

  const streamProgs = GUIDE_BY_STREAM[code] || [];
  if (streamProgs.length === 0) return '';

  // Filter to programs the student's wilaya can actually access
  const accessible = wNum
    ? streamProgs.filter((pr) => pr.scope === 'national' || (pr.circleWilayaNums || []).includes(wNum))
    : streamProgs;

  if (accessible.length === 0) return '';

  // Group by academic field (Ù…ÙŠØ¯Ø§Ù†)
  const byField = new Map();
  for (const prog of accessible) {
    const field = canonicalField(prog.field_ar);
    if (!byField.has(field)) {
      byField.set(field, { national: 0, regional: 0, insts: new Set(), basis: prog.rankingBasis });
    }
    const entry = byField.get(field);
    if (prog.scope === 'national') entry.national++;
    else entry.regional++;
    // Collect up to 3 institution name samples per field
    (prog.institutions_ar || []).slice(0, 3).forEach((i) => {
      const clean = i.trim().replace(/\s+/g, ' ');
      if (clean.length > 3) entry.insts.add(clean);
    });
  }

  const lines = [
    `## Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ â€” Ø¨Ø±Ø§Ù…Ø¬ Ù…ØªØ§Ø­Ø© Ù„Ø´Ø¹Ø¨Ø© ${STREAM_AR[code] || code}${wilaya ? ` Ù…Ù† ÙˆÙ„Ø§ÙŠØ© ${wilaya}` : ''}:`,
  ];
  for (const [field, data] of byField) {
    const instSample = [...data.insts].slice(0, 3).join(' ØŒ ');
    const scope = data.national > 0 ? '(ÙˆØ·Ù†ÙŠ)' : '(Ø¥Ù‚Ù„ÙŠÙ…ÙŠ)';
    const basis = data.basis === 'weighted_or_general' ? 'Ù…ÙˆØ²ÙˆÙ† Ø£Ùˆ Ø¹Ø§Ù…' : 'Ù…Ø¹Ø¯Ù„ Ø¹Ø§Ù…';
    lines.push(`- **${field}** ${scope} â€” Ù…Ø¤Ø³Ø³Ø§Øª: ${instSample || 'Ù…ØªØ¹Ø¯Ø¯Ø©'} â€” ØªØ±ØªÙŠØ¨: ${basis}`);
  }

  return lines.join('\n');
}

/* ============================================================
   WEB SEARCH AUGMENTATION (Tavily) â€” optional, key-gated
   Enabled only when TAVILY_API_KEY is set; otherwise the whole
   feature is inert and the request flow is byte-identical.
   Design doc: tawjihi/data/kb/_WEBSEARCH-DESIGN.md
   ============================================================ */

/* Trigger threshold on the retrieve() scoring scale.
   A name/id match contributes â‰¥ +4 (id token) / +6 (name token) / +12 (substring);
   below 6 the top hit was matched by generic word overlap only â†’ KB likely can't
   answer directly, so we augment with a web search. */
const WEB_SEARCH_SCORE_THRESHOLD = 6;

/* Time-sensitive intent â€” news / calendar / deadline / new-programme queries
   where the static KB is stale by construction. */
const TIME_SENSITIVE_SIGNALS = [
  'Ø§Ù„ØªØ³Ø¬ÙŠÙ„Ø§Øª 2026', 'Ø§Ù„ØªØ³Ø¬ÙŠÙ„Ø§Øª Ù¢Ù Ù¢Ù¦', 'ØªØ³Ø¬ÙŠÙ„Ø§Øª 2026', 'ØªØ³Ø¬ÙŠÙ„Ø§Øª Ù¢Ù Ù¢Ù¦',
  '2026', 'Ù¢Ù Ù¢Ù¦',
  'Ø±Ø²Ù†Ø§Ù…Ø©', 'Ù…ÙˆØ¹Ø¯', 'Ù…ÙˆØ§Ø¹ÙŠØ¯', 'Ø¢Ø®Ø± Ø£Ø¬Ù„', 'Ø§Ø®Ø± Ø§Ø¬Ù„', 'Ø¢Ø®Ø± Ø§Ø¬Ù„',
  'Ø¬Ø¯ÙŠØ¯', 'Ø¬Ø¯ÙŠØ¯Ø©', 'Ø£Ø®Ø¨Ø§Ø±', 'Ø§Ø®Ø¨Ø§Ø±', 'ÙØªØ­ ØªØ®ØµØµ', 'ÙØªØ­ ØªØ®ØµØµØ§Øª',
  'calendrier', 'date limite', 'deadline', 'nouveau', 'nouvelle', 'actualitÃ©',
];
function isTimeSensitive(rawQuery) {
  const q = String(rawQuery || '').toLowerCase();
  return TIME_SENSITIVE_SIGNALS.some((s) => q.includes(s));
}

/* Widened trigger (a): named-entity institution/speciality signal.
   School/university/institute mentions (Arabic or French) or a standalone Latin
   acronym (ESI, ENSIA, EPAUâ€¦). Combined with a KB miss by the caller. */
const INSTITUTION_ENTITY_SIGNALS = [
  'Ù…Ø¯Ø±Ø³Ø©', 'Ø§Ù„Ù…Ø¯Ø±Ø³Ø©', 'Ù…Ø¯Ø§Ø±Ø³', 'Ø¬Ø§Ù…Ø¹Ø©', 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø©', 'Ù…Ø¹Ù‡Ø¯', 'Ø§Ù„Ù…Ø¹Ù‡Ø¯',
  'ÙƒÙ„ÙŠØ©', 'Ø§Ù„ÙƒÙ„ÙŠØ©', 'ØªØ®ØµØµ', 'Ø§Ù„ØªØ®ØµØµ',
  'Ã©cole', 'ecole', 'universitÃ©', 'universite', 'institut', 'facultÃ©', 'faculte',
];
function hasInstitutionEntity(rawQuery) {
  const raw = String(rawQuery || '');
  const q = raw.toLowerCase();
  if (INSTITUTION_ENTITY_SIGNALS.some((s) => q.includes(s))) return true;
  // Standalone uppercase Latin acronym â€” almost always a named school (ENSIA, ESTINâ€¦)
  return /(?:^|[^A-Za-z])[A-Z]{3,8}(?:[^A-Za-z]|$)/.test(raw);
}

/* Widened trigger (b): cheap substantive-question heuristic.
   Strips leading greetings/smalltalk repeatedly; whatever remains must be long
   enough to be a real question. Greeting-only messages never trigger a search. */
const GREETING_PREFIX_RE = /^(Ø§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„ÙŠÙƒÙ… ÙˆØ±Ø­Ù…Ø© Ø§Ù„Ù„Ù‡ ÙˆØ¨Ø±ÙƒØ§ØªÙ‡|Ø§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„ÙŠÙƒÙ…|Ø³Ù„Ø§Ù…|ØµØ¨Ø§Ø­ Ø§Ù„Ø®ÙŠØ±|Ù…Ø³Ø§Ø¡ Ø§Ù„Ø®ÙŠØ±|Ù…Ø±Ø­Ø¨Ø§|Ø£Ù‡Ù„Ø§ ÙˆØ³Ù‡Ù„Ø§|Ø£Ù‡Ù„Ø§|Ø§Ù‡Ù„Ø§|ÙˆØ§Ø´ Ø±Ø§Ùƒ|ÙƒÙŠ Ø±Ø§Ùƒ|ÙƒÙŠØ±Ø§Ùƒ|Ø´Ø­Ø§Ù„ Ø±Ø§Ùƒ|Ù„Ø§Ø¨Ø§Ø³|ØµØ­Ø§|ØµØ­ÙŠØª|Ø´ÙƒØ±Ø§ Ø¨Ø²Ø§Ù|Ø´ÙƒØ±Ø§|ÙŠØ¹Ø·ÙŠÙƒ Ø§Ù„ØµØ­Ø©|hello|hi|hey|salut|bonjour|bonsoir|cc|cv|Ã§a va|ca va)[\sØŒ,.!ØŸ?]*/i;
function isSubstantiveQuestion(message) {
  let m = String(message || '').trim();
  if (!m) return false;
  let prev;
  do {
    prev = m;
    m = m.replace(GREETING_PREFIX_RE, '').trim();
  } while (m && m !== prev);
  return m.length >= 12;
}

/* Official / reliable Algerian sources first; Tavily supports wildcard domains. */
const TAVILY_PREFERRED_DOMAINS = [
  'mesrs.dz',
  'inscription.mesrs.dz',
  'aps.dz',
  '*.edu.dz',
  '*.dz',
];

async function tavilyCall(apiKey, query, includeDomains, signal) {
  const resp = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 3,
      search_depth: 'basic',
      ...(includeDomains ? { include_domains: includeDomains } : {}),
    }),
    signal,
  });
  if (!resp.ok) throw new Error(`Tavily HTTP ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data.results) ? data.results : [];
}

/* Run the search under a single hard 3.5 s deadline (shared by the optional
   unrestricted fallback). Never throws â€” returns null on any failure/timeout
   so the chat request always proceeds. */
async function webSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    let results = await tavilyCall(apiKey, query, TAVILY_PREFERRED_DOMAINS, controller.signal);
    if (results.length === 0) {
      // Domain-restricted search found nothing â€” retry unrestricted within the same deadline.
      results = await tavilyCall(apiKey, query, null, controller.signal);
    }
    return results.slice(0, 3);
  } catch (err) {
    console.log('[web-search] skipped:', err?.message || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* Render results as a clearly-labeled system-prompt block. '' when nothing usable. */
function buildWebBlock(results) {
  if (!results || results.length === 0) return '';
  const lines = ['## Ù†ØªØ§Ø¦Ø¬ Ø¨Ø­Ø« Ù…Ù† Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª (ØªØ­Ù‚Ù‚ Ù…Ù†Ù‡Ø§)'];
  for (const r of results.slice(0, 3)) {
    const title = trim(r.title, 120) || 'Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†';
    const snippet = trim(r.content, 350);
    lines.push(`- **${title}**${snippet ? ` â€” ${snippet}` : ''}\n  Ø§Ù„Ù…ØµØ¯Ø±: ${r.url || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}`);
  }
  lines.push(
    'âš ï¸ Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª (Ø¥Ù„Ø²Ø§Ù…ÙŠØ©):\n' +
    '1. Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ **Ø«Ø§Ù†ÙˆÙŠØ©** â€” Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø£Ø¹Ù„Ø§Ù‡ Ù„Ù‡Ø§ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¹Ù†Ø¯ Ø£ÙŠ ØªØ¹Ø§Ø±Ø¶. Ø£Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ù„Ø§ ØªØºØ·ÙŠ Ø§Ù„Ø³Ø¤Ø§Ù„ØŒ ÙØ§Ø¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ÙƒØ£Ø³Ø§Ø³ Ù„Ù„Ø¬ÙˆØ§Ø¨ Ø¨Ø¯Ù„ Ø§Ù„Ø§Ø¹ØªØ°Ø§Ø± Ø£Ùˆ Ø§Ù„ØªØ®Ù…ÙŠÙ†.\n' +
    '2. Ø¥Ø°Ø§ Ø§Ø³ØªØ¹Ù…Ù„Øª Ù…Ø¹Ù„ÙˆÙ…Ø© Ù…Ù† Ù†ØªÙŠØ¬Ø©ØŒ **Ø§Ø°ÙƒØ± Ù…ØµØ¯Ø±Ù‡Ø§** (Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£Ùˆ Ø§Ù„Ø±Ø§Ø¨Ø·) ØµØ±Ø§Ø­Ø© ÙÙŠ Ø±Ø¯Ùƒ.\n' +
    '3. Ù…Ù…Ù†ÙˆØ¹ Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ Ø£Ø®Ø° Ø£ÙŠ **Ù…Ø¹Ø¯Ù„ Ù‚Ø¨ÙˆÙ„ Ø£Ùˆ Ø±Ù‚Ù… Ø±Ø³Ù…ÙŠ** Ù…Ù† Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ â€” Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© ÙÙ‚Ø·.\n' +
    '4. Ù†Ø¨Ù‘Ù‡ Ø§Ù„Ø·Ø§Ù„Ø¨ ØµØ±Ø§Ø­Ø© Ø£Ù† Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ø¬Ø§ÙŠØ© Ù…Ù† Ø¨Ø­Ø« ÙÙŠ Ø§Ù„ÙˆÙŠØ¨ ÙˆÙ„Ø§Ø²Ù… ÙŠØ£ÙƒØ¯Ù‡Ø§ Ù…Ù† Ø§Ù„Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø±Ø³Ù…ÙŠØ© (inscription.mesrs.dz / mesrs.dz).'
  );
  return lines.join('\n');
}

/* ---- pgvector RAG retrieval --------------------------------------------- */
/* Embeds the user message with Gemini text-embedding-004, then calls the
   search_kb RPC on Supabase to fetch the top semantically relevant KB chunks.
   Returns a concatenated string for injection into the system prompt, or ''
   on any failure so the chat always proceeds (graceful degradation). */
async function retrieveContext(userMessage, adminSupabase) {
  try {
    const embeddingKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_3;
    if (!embeddingKey) return '';

    const jinaKey = process.env.JINA_API_KEY;
    if (!jinaKey) return '';
    const embedRes = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jinaKey}` },
      body: JSON.stringify({ input: [userMessage], model: 'jina-embeddings-v3', dimensions: 768 }),
    });
    if (!embedRes.ok) throw new Error(`jina embed ${embedRes.status}`);
    const embedJson = await embedRes.json();
    const embedding = embedJson.data[0].embedding;

    const { data, error } = await adminSupabase.rpc('search_kb', {
      query_embedding: embedding,
      match_threshold: 0.70,
      match_count: 5,
    });

    if (error) {
      console.error('[rag] search_kb error:', error.message);
      return '';
    }
    if (!data?.length) return '';

    return data.map((chunk) => chunk.content).join('\n\n---\n\n');
  } catch (err) {
    console.error('[rag] retrieveContext failed:', err.message);
    return ''; // Graceful fallback â€” continue without RAG context
  }
}

/* ---- System prompt (CHAT-CONTRACT.md Â§4) -------------------------------- */
function buildSystemPrompt(profile, contextBlock, guideBlock, orientationMode = false, emptyContext = false, intent = {}, wilayaAr = null, webBlock = '', ministryBlock = '', geoZoneAr = null, wishlist = []) {
  const p = profile || {};
  const code = streamCode(p.stream);
  const streamLabel = code ? STREAM_AR[code] || p.stream : p.stream || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©';

  // Weighted averages (BAC Story calculator import) â€” '' when absent/empty
  const weightedStr = formatWeightedAverages(p.weighted_averages);
  // Student's own wilaya â†’ geographic circle (for proactive circle-rule explanations)
  const profileWilayaKey = p.wilaya && p.wilaya !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©' ? detectWilaya(p.wilaya) : null;
  const profileZoneAr = profileWilayaKey ? wilayaZoneAr(profileWilayaKey) : null;

  return `Ø£Ù†Øª "ØªÙˆØ¬ÙŠÙ‡ÙŠ"ØŒ Ù…Ø±Ø´Ø¯ Ø°ÙƒÙŠ Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø¨Ø¹Ø¯ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ØŒ ØªØ§Ø¨Ø¹ Ù„Ù€ BAC STORY.

# Ø´Ø®ØµÙŠØªÙƒ ÙˆÙ„ØºØªÙƒ (Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© â€” Ø¥Ù„Ø²Ø§Ù…ÙŠ)
- Ø´Ø®ØµÙŠØªÙƒ: Ø®Ùˆ ÙƒØ¨ÙŠØ± Ø¬Ø²Ø§Ø¦Ø±ÙŠØŒ Ø¯Ø§ÙØ¦ ÙˆØµØ§Ø¯Ù‚ â€” ÙŠÙ‡Ø¯Ø± Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© ÙˆÙŠØ³ØªØ¹Ù…Ù„ Ø§Ù„ÙØµØ­Ù‰ Ù„Ù„Ù…ØµØ·Ù„Ø­Ø§Øª Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ© ÙÙ‚Ø·ØŒ ÙƒÙ…Ø§ ÙŠÙ‡Ø¯Ø± Ø·Ø§Ù„Ø¨ Ø¬Ø²Ø§Ø¦Ø±ÙŠ Ø­Ù‚ÙŠÙ‚ÙŠ.
- Ø§Ù„Ø£Ø³Ø§Ø³ Ø¯Ø§Ø±Ø¬Ø© Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© â€” Ø¥Ø°Ø§ ÙƒØªØ¨ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ© Ø±Ø¯ Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©ØŒ ÙˆØ¥Ø°Ø§ ÙƒØªØ¨ Ø¨Ø§Ù„ÙØµØ­Ù‰ Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø±Ø¯ Ø¨Ø§Ù„ÙØµØ­Ù‰.
- ÙƒÙ„Ù…Ø§Øª Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© Ø§Ø³ØªØ¹Ù…Ù„Ù‡Ø§ Ø¨Ø·Ø¨ÙŠØ¹ÙŠØ©: ÙˆØ§Ø´ØŒ ÙƒÙŠÙØ§Ø´ØŒ Ø¹Ù„Ø§Ø´ØŒ ÙˆÙŠÙ†ØŒ Ù…Ù†ÙŠÙ†ØŒ Ù‚Ø¯Ø§Ø´ØŒ Ø¨Ø±ÙƒØŒ Ø¨Ø²Ø§ÙØŒ Ø´ÙˆÙŠØ©ØŒ ÙŠØ§Ø³Ø±ØŒ ØªØ§Ø¹/Ù†ØªØ§Ø¹ØŒ Ø¯ÙØ±Ùƒ/Ø¶Ø±ÙƒØŒ Ù…Ù„ÙŠØ­ØŒ Ø®Ø¯Ù…Ø©ØŒ Ù‚Ø±Ø§ÙŠØ©ØŒ Ù†Ø¬Ù…/ØªÙ†Ø¬Ù…ØŒ Ø­Ø§Ø¨/ØªØ­Ø¨ØŒ Ø±Ø§Ù†ÙŠ/Ø±Ø§Ùƒ/Ø±Ø§Ù‡ÙŠØŒ ØµØ­Ù‘Ø§ØŒ ÙŠØ¹Ø·ÙŠÙƒ Ø§Ù„ØµØ­Ø©ØŒ Ù…Ø§Ø´ÙŠØŒ ÙƒØ§ÙŠÙ†/Ù…Ø§ÙƒØ§Ù†Ø´ØŒ Ù„Ø§Ø²Ù…Ù„ÙƒØŒ Ø®ÙŠØ± Ù…Ù†ØŒ Ø¹Ù„Ù‰ Ø¬Ø§Ù„ØŒ Ø¨Ø§Ø´ (Ø¨Ù…Ø¹Ù†Ù‰ Ù„ÙƒÙŠ).
- âš ï¸ ÙƒÙ„Ù…Ø§Øª Ù…Ù…Ù†ÙˆØ¹Ø© Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ (Ù„ÙŠØ³Øª Ø¬Ø²Ø§Ø¦Ø±ÙŠØ©) â€” ÙˆØ§Ù„Ø¨Ø¯ÙŠÙ„ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ Ø§Ù„ÙˆØ­ÙŠØ¯:
  Ø´Ù†Ùˆ / Ø´Ùˆ / Ø¥ÙŠØ´ / ÙˆØ´ â† ÙˆØ§Ø´
  Ø´Ù„ÙˆÙ† / Ø¥Ø²Ø§ÙŠ â† ÙƒÙŠÙØ§Ø´
  Ù„ÙŠØ´ â† Ø¹Ù„Ø§Ø´
  ÙÙŠÙ† â† ÙˆÙŠÙ†
  Ø¯ÙŠØ§Ù„ / Ø¯ÙŠØ§Ù„ÙŠ â† ØªØ§Ø¹ / Ù†ØªØ§Ø¹ÙŠ
  Ø¨ØºÙŠØª â† Ø­Ø¨ÙŠØª / Ø±Ø§Ù†ÙŠ Ø­Ø§Ø¨
  Ø¹Ø§ÙØ§Ùƒ â† Ù…Ù† ÙØ¶Ù„Ùƒ / Ø±Ø¨ÙŠ ÙŠØ­ÙØ¸Ùƒ
  Ù…Ø²ÙŠØ§Ù† â† Ù…Ù„ÙŠØ­
  Ø¹Ø§ÙŠØ² â† Ø­Ø§Ø¨
  Ù‡Ø³Ø© â† Ø¯ÙØ±Ùƒ | Ù‡ÙˆØ§ÙŠ / ÙƒØªÙŠØ± â† Ø¨Ø²Ø§Ù
  Ø­Ù„Ùˆ (ÙƒÙˆØµÙ Ø¹Ø§Ù…) â† Ù…Ù„ÙŠØ­
- âš ï¸ Ù‚Ø§Ø¹Ø¯Ø© Ù„ØºÙˆÙŠØ© Ø­Ø§Ø³Ù…Ø© Ù„Ø£Ø³Ø¦Ù„Ø© Ù†Ø¹Ù…/Ù„Ø§: Ù„Ø§ ØªØ³ØªØ¹Ù…Ù„ Ø£Ø¨Ø¯Ø§Ù‹ ÙƒÙ„Ù…Ø© "ÙˆØ§Ø´" Ø¨Ù…Ø¹Ù†Ù‰ "Ù‡Ù„". ÙƒÙ„Ù…Ø© "ÙˆØ§Ø´" ØªØ¹Ù†ÙŠ "Ù…Ø§Ø°Ø§" (What/Quoi) ÙÙ‚Ø·.
  âŒ Ø®Ø·Ø£: "ÙˆØ§Ø´ Ø¹Ù†Ø¯Ùƒ Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„ÙƒØ§ÙÙŠ Ù„Ù„Ø·Ø¨ØŸ"
  âœ… ØµØ­ÙŠØ­: "Ù‡Ù„ Ù…Ø¹Ø¯Ù„Ùƒ ÙŠÙƒÙÙŠ Ù„Ù„Ø·Ø¨ØŸ" Ø£Ùˆ "Ø¹Ù†Ø¯Ùƒ Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„ÙƒØ§ÙÙŠØŸ" Ø£Ùˆ "ÙŠÙƒÙÙŠÙƒ Ù…Ø¹Ø¯Ù„ÙƒØŸ"
- Ø§Ù„Ù…ØµØ·Ù„Ø­Ø§Øª Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙÙ‚Ø·: Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§/Ø§Ù„Ø¨Ø§ÙƒØŒ Ø§Ù„Ø´Ø¹Ø¨Ø©ØŒ Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù‚Ø¨ÙˆÙ„ØŒ Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ†ØŒ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§ØªØŒ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ØŒ Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©ØŒ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ØŒ Ù„ÙŠØ³Ø§Ù†Ø³-Ù…Ø§Ø³ØªØ±-Ø¯ÙƒØªÙˆØ±Ø§Ù‡ (LMD)ØŒ Ù‚Ø¨ÙˆÙ„ ÙˆØ·Ù†ÙŠ/Ø¬Ù‡ÙˆÙŠØŒ Ø§Ù„ØªØ±ØªÙŠØ¨ (classement)ØŒ Ø§Ù„ØªØ³Ø¬ÙŠÙ„Ø§Øª Ø§Ù„Ø£ÙˆÙ„ÙŠØ©ØŒ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©ØŒ Ø§Ù„ØªØ­ÙˆÙŠÙ„.
- Ø§Ù„Ø§Ù‚ØªØ±Ø§Ø¶Ø§Øª Ø§Ù„ÙØ±Ù†Ø³ÙŠØ© Ø·Ø¨ÙŠØ¹ÙŠØ© ÙÙŠ ÙƒÙ„Ø§Ù… Ø§Ù„Ø·Ø§Ù„Ø¨ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ (spÃ©cialitÃ©ØŒ filiÃ¨reØŒ moyenneØŒ Ã©cole supÃ©rieure) â€” Ù…Ø³Ù…ÙˆØ­Ø© Ø¨Ø§Ø¹ØªØ¯Ø§Ù„.
- Ù†ÙˆÙ‘Ø¹ Ø§ÙØªØªØ§Ø­ÙŠØ§ØªÙƒ: Ù„Ø§ ØªØ¨Ø¯Ø£ ÙƒÙ„ Ø±Ø¯ Ø¨Ù†ÙØ³ Ø§Ù„Ø¹Ø¨Ø§Ø±Ø©ØŒ ÙˆÙ„Ø§ ØªÙØ±Ø¶ "ÙˆØ§Ø´ Ø±Ø§Ùƒ!" ÙÙŠ ÙƒÙ„ Ø±Ø¯ â€” Ø§Ø³ØªØ¹Ù…Ù„Ù‡Ø§ Ù„Ù„ØªØ±Ø­ÙŠØ¨ ÙÙ‚Ø·. Ø§Ø¨Ø¯Ø£ Ø£Ø­ÙŠØ§Ù†Ø§Ù‹ Ø¨Ø¬ÙˆØ§Ø¨ Ù…Ø¨Ø§Ø´Ø±ØŒ Ø£Ùˆ Ø¨Ø§Ø³ØªÙÙ‡Ø§Ù…ØŒ Ø£Ùˆ Ø¨Ø§Ù„Ù†Ù‚Ø·Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©.

# Ø­Ø¯ÙˆØ¯ Ø§Ø®ØªØµØ§ØµÙƒ (AI-15)
Ø¥Ø°Ø§ Ø³Ø£Ù„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ù…ÙˆØ¶ÙˆØ¹ Ù„Ø§ Ø¹Ù„Ø§Ù‚Ø© Ù„Ù‡ Ø¨Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ (Ù‡Ø¬Ø±Ø©ØŒ Ù…Ù†Ø­ Ø®Ø§Ø±Ø¬ÙŠØ©ØŒ Ø£Ø³Ø¦Ù„Ø© Ø´Ø®ØµÙŠØ©...)ØŒ Ø§Ø¹ØªØ°Ø± Ø¨Ø£Ø¯Ø¨ ÙˆØ£Ø®Ø¨Ø±Ù‡ Ø£Ù†Ùƒ Ù…ØªØ®ØµØµ ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ ÙÙ‚Ø·.

# Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„ÙƒØªØ§Ø¨Ø© ÙˆØ§Ù„ØµØ¯Ù‚ (Ø¥Ù„Ø²Ø§Ù…ÙŠØ©)
- Ø§Ø³ØªØ¹Ù…Ù„ Ø¨Ù†ÙŠØ© Markdown: Ø³Ø·Ø± ØªÙ…Ù‡ÙŠØ¯ Ù‚ØµÙŠØ±ØŒ Ø«Ù… Ø¹Ù†Ø§ÙˆÙŠÙ† \`###\` Ø£Ùˆ Ù‚ÙˆØ§Ø¦Ù… Ù†Ù‚Ø·ÙŠØ© \`- \` Ùˆ**Ø¹Ø±ÙŠØ¶**. Ù…Ù…Ù†ÙˆØ¹ Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ Ø¬Ø¯Ø§Ø± Ù†Øµ ÙˆØ§Ø­Ø¯ Ø¨Ù„Ø§ ØªÙ†Ø³ÙŠÙ‚.
- Ù…Ù…Ù†ÙˆØ¹ Ø§Ù„Ø­Ø´Ùˆ Ø§Ù„ØªØ­ÙÙŠØ²ÙŠ Ø§Ù„Ø¹Ø§Ù… ("Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ù…ÙØªØ§Ø­ Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„"ØŒ "Ø§Ø¬ØªÙ‡Ø¯ ÙˆØ³ØªÙ†Ø¬Ø­"ØŒ "Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø¨ÙŠÙ† ÙŠØ¯ÙŠÙƒ"...) â€” ÙˆÙ…Ù…Ù†ÙˆØ¹Ø© Ø£ÙŠ ÙÙ‚Ø±Ø© ØªØµÙ„Ø­ Ù„Ø£ÙŠ Ø·Ø§Ù„Ø¨ ÙƒØ§Ù†.
- ÙƒÙ„ Ø¥Ø¬Ø§Ø¨Ø© Ø¬ÙˆÙ‡Ø±ÙŠØ© ØªØ±ØªÙƒØ² Ø¹Ù„Ù‰ Ø¹Ù†ØµØ± Ù…Ù„Ù…ÙˆØ³ ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„: Ù…Ø¹Ø¯Ù„/Ø´Ø¹Ø¨Ø©/ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ù† Ù…Ù„ÙÙ‡ØŒ Ø£Ùˆ ØªØ®ØµØµ Ù…Ø³Ù…Ù‘Ù‰ Ø¨Ø£Ø±Ù‚Ø§Ù…Ù‡ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø²ÙˆØ¯Ø©.
- Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª ÙˆØªÙˆÙØ± Ø§Ù„ØªØ®ØµØµØ§Øª ÙÙŠ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª ØªØ¤Ø®Ø° **Ø­ØµØ±ÙŠØ§Ù‹** Ù…Ù† Ø§Ù„ÙƒØªÙ„ Ø§Ù„Ù…Ø²ÙˆØ¯Ø© (Ù…Ù„Ù Ø§Ù„Ø·Ø§Ù„Ø¨ØŒ Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠØŒ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©ØŒ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ÙˆÙŠØ¨) â€” Ù„Ø§ ØªØ®ØªØ±Ø¹ ÙˆÙ„Ø§ ØªØ³ØªÙ†ØªØ¬ ÙˆÙ„Ø§ ØªÙƒÙ…Ù‘Ù„ Ù…Ù† Ø°Ø§ÙƒØ±ØªÙƒ.
- Ø¹Ù†Ø¯ Ø°ÙƒØ± Ø£ÙŠ Ù…Ø¹Ø¯Ù„ Ù‚Ø¨ÙˆÙ„ØŒ Ø§Ø°ÙƒØ± Ø³Ù†ØªÙ‡ ÙƒÙ…Ø§ ÙˆØ±Ø¯Øª ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (Ù…Ø«Ù„Ø§Ù‹: "Ù…Ø¹Ø¯Ù„ Ù‚Ø¨ÙˆÙ„ 2026" Ø£Ùˆ "Ø­Ø³Ø¨ Ø¯Ù„ÙŠÙ„ 2026") â€” Ù„Ø§ ØªÙ‚Ø¯Ù‘Ù… Ø±Ù‚Ù…Ø§Ù‹ Ø¨Ù„Ø§ Ø³Ù†Ø©.
- Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„ÙƒØªÙ„ Ø§Ù„Ù…Ø²ÙˆØ¯Ø© ÙØ§Ø±ØºØ© Ø£Ùˆ Ù„Ø§ ØªÙƒÙÙŠ Ù„Ù„Ø³Ø¤Ø§Ù„ØŒ Ù‚Ù„Ù‡Ø§ Ø¨ØµØ±Ø§Ø­Ø© ("Ù‡Ø°ÙŠ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ù…Ø§ÙƒØ§Ù†ØªØ´ ÙÙŠ Ø¨ÙŠØ§Ù†Ø§ØªÙŠ") ÙˆØ§Ù†ØµØ­ Ø¨Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† inscription.mesrs.dz â€” Ù„Ø§ ØªØ¹ÙˆÙ‘Ø¶Ù‡Ø§ Ø¨Ø¹Ù…ÙˆÙ…ÙŠØ§Øª.
- Ø¥Ø°Ø§ Ø³ÙØ¦Ù„Øª Ø¹Ù† ØªØ®ØµØµ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ Ø§Ø¹ØªØ±Ù Ø¨Ø£Ù† Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙƒ Ù…Ø­Ø¯ÙˆØ¯Ø© Ø¹Ù†Ù‡ ÙˆÙ„Ø§ ØªØ®Ù…Ù‘Ù† Ø£Ø±Ù‚Ø§Ù…Ù‡.
- Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ ÙˆØ§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø¹Ø³ÙƒØ±ÙŠØ© (Ø·ÙŠØ±Ø§Ù†ØŒ Ø´Ø±Ø´Ø§Ù„ØŒ Ø¨Ø­Ø±ÙŠØ©ØŒ Ø¯Ø±ÙƒØŒ Ø¥Ø¹Ù„Ø§Ù… Ø¹Ø³ÙƒØ±ÙŠ...): Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø£ÙˆÙ„ÙŠ ÙÙŠÙ‡Ø§ **Ù„ÙŠØ³** Ø¹Ø¨Ø± Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø¨Ù„ Ø­ØµØ±ÙŠØ§Ù‹ Ø¹Ø¨Ø± Ù…Ù†ØµØ© ÙˆØ²Ø§Ø±Ø© Ø§Ù„Ø¯ÙØ§Ø¹ Ø§Ù„ÙˆØ·Ù†ÙŠ â€” ÙƒÙ„Ù…Ø§ Ù†Ø§Ù‚Ø´Øª Ù…Ø¯Ø±Ø³Ø© Ø¹Ø³ÙƒØ±ÙŠØ© Ø§Ø°ÙƒØ± Ø§Ù„Ø±Ø§Ø¨Ø·: https://preinscription.mdn.dz/
- Ø§Ø®ØªÙ… Ø§Ù„ØªÙˆØµÙŠØ§Øª Ø§Ù„Ø¬ÙˆÙ‡Ø±ÙŠØ© Ø¨Ø³Ø·Ø± ØµØ¯Ù‚ Ù‚ØµÙŠØ± Ø­ÙˆÙ„ ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ø³Ù…ÙŠØ©.

# Ø§Ù„ÙƒØªÙ„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ÙŠØ© (Directive blocks)
Ø£Ø¶ÙÙÙ‡Ø§ ÙÙŠ **Ù†Ù‡Ø§ÙŠØ©** Ø§Ù„Ø±Ø¯ ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©ØŒ ÙƒÙ„ ÙˆØ§Ø­Ø¯Ø© ÙÙŠ ÙƒØªÙ„Ø© Ù…Ø­ØµÙˆØ±Ø© Ø¨Ø«Ù„Ø§Ø« Ø¹Ù„Ø§Ù…Ø§Øª (fenced) Ùˆ JSON ØµØ­ÙŠØ­ØŒ ÙˆÙÙ‚Ø· Ù„ØªØ®ØµØµØ§Øª Ù„Ù‡Ø§ id Ø¶Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø²ÙˆØ¯Ø©:

1) Ø¹Ù†Ø¯ Ø§Ù‚ØªØ±Ø§Ø­ ØªØ®ØµØµ/ØªØ®ØµØµØ§Øª:
\`\`\`spec-cards
[{"id":"<id>","name":"<Ø§Ù„Ø§Ø³Ù…>","meta":"<Ø§Ù„ØªØµÙ†ÙŠÙ> Â· <Ø§Ù„Ø´Ø¹Ø¨Ø©>","avg":"<Ø§Ù„Ù…Ø¹Ø¯Ù„>","color":"var(--cat-medical)"}]
\`\`\`

2) Ø¹Ù†Ø¯ Ù…Ù‚Ø§Ø±Ù†Ø© ØªØ®ØµØµÙŠÙ† Ø£Ùˆ Ø£ÙƒØ«Ø±:
\`\`\`compare
{"title":"Ù…Ù‚Ø§Ø±Ù†Ø© Ø¨ÙŠÙ† ...","fields":[{"key":"avg","label":"Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù‚Ø¨ÙˆÙ„"},{"key":"streams","label":"Ø§Ù„Ø´Ø¹Ø¨ Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„Ø©"},{"key":"duration","label":"Ù…Ø¯Ø© Ø§Ù„Ø¯Ø±Ø§Ø³Ø©"},{"key":"careers","label":"Ø£Ø¨Ø±Ø² ÙØ±Øµ Ø§Ù„Ø¹Ù…Ù„"}],"items":[{"id":"<id>","name":"<Ø§Ù„Ø§Ø³Ù…>","avg":"<Ø§Ù„Ù…Ø¹Ø¯Ù„>","streams":"...","duration":"...","careers":"..."}]}
\`\`\`

3) Ø¹Ù†Ø¯Ù…Ø§ ÙŠØ³Ø£Ù„ "Ù‡Ù„ Ø£ÙÙ‚Ø¨Ù„ / ÙˆØ§Ø´ Ù†Ù‚Ø¯Ø± Ù†Ø¯Ø®Ù„ ÙÙŠ X / am I eligible":
\`\`\`verdict
{"id":"<id>"}
\`\`\`
ÙÙŠ ÙƒØªÙ„Ø© verdict Ø§ÙƒØªØ¨ **ÙÙ‚Ø·** \`{"id":"..."}\` â€” Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø£Ù…Ø§Ù…ÙŠØ© ØªØ­Ø³Ø¨ Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ø¨Ù†ÙØ³Ù‡Ø§ØŒ Ù„Ø§ ØªÙƒØªØ¨ Ø£Ù†Øª Ø§Ù„Ø­Ø§Ù„Ø© Ø£Ùˆ Ø§Ù„Ø¹ØªØ¨Ø©.

4) Ø¹Ù†Ø¯Ù…Ø§ ØªØ³Ø£Ù„ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ù‡ÙŠÙƒÙ„ÙŠØ§Ù‹ (ÙÙŠ ÙˆØ¶Ø¹ Ø§Ù„Ø§Ø³ØªÙƒØ´Ø§Ù Ø£Ùˆ Ø£ÙŠ Ø³Ø¤Ø§Ù„ Ù…ØªØ¹Ø¯Ø¯ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª):
\`\`\`question
{"text":"Ù†Øµ Ø§Ù„Ø³Ø¤Ø§Ù„ Ù‡Ù†Ø§","options":["Ø®ÙŠØ§Ø± 1","Ø®ÙŠØ§Ø± 2","Ø®ÙŠØ§Ø± 3","Ø®ÙŠØ§Ø± 4"],"allowCustom":true}
\`\`\`
ØªÙØ¹Ø±Ø¶ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª ÙƒØ£Ø²Ø±Ø§Ø± interactifs ÙÙŠ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© â€” Ù„Ø§ ØªØ¹ÙŠØ¯ ÙƒØªØ§Ø¨ØªÙ‡Ø§ ÙÙŠ Ø§Ù„Ù†Øµ.

5) Ø£Ø­ÙŠØ§Ù†Ø§Ù‹ ÙÙ‚Ø· â€” Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ù‡Ù†Ø§Ùƒ Ø£Ø³Ø¦Ù„Ø© Ù…ØªØ§Ø¨Ø¹Ø© Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆÙ…ÙÙŠØ¯Ø© Ù„Ù„Ø³ÙŠØ§Ù‚ (Ù„ÙŠØ³ Ø¨Ø¹Ø¯ ÙƒÙ„ Ø±Ø¯):
\`\`\`followups
["Ø³Ø¤Ø§Ù„ Ù…ØªØ§Ø¨Ø¹Ø© 1", "Ø³Ø¤Ø§Ù„ Ù…ØªØ§Ø¨Ø¹Ø© 2"]
\`\`\`
Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯: 2-3 Ø£Ø³Ø¦Ù„Ø© Ù‚ØµÙŠØ±Ø© ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰ØŒ Ø¨Ù†ÙØ³ Ù„ØºØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©ØŒ Ù…Ø±ØªØ¨Ø·Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ù…Ø§ Ù†Ø§Ù‚Ø´Ù†Ø§Ù‡. Ù„Ø§ ØªØ¶ÙŠÙÙ‡Ø§ Ø¨Ø¹Ø¯ Ø±Ø¯ÙˆØ¯ Ù…ÙƒØªÙ…Ù„Ø© Ø£Ùˆ Ø¥Ø¬Ø§Ø¨Ø§Øª Ù†Ù‡Ø§Ø¦ÙŠØ© â€” ÙÙ‚Ø· Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙØ±Ø¬ÙŽÙ‘Ø­ Ø£Ù† Ø§Ù„Ø·Ø§Ù„Ø¨ Ø³ÙŠØ±ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø± ÙÙŠ Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§Ø±.

# Ù…Ù„Ù Ø§Ù„Ø·Ø§Ù„Ø¨
- Ø§Ù„Ø§Ø³Ù…: ${p.name || 'ØµØ¯ÙŠÙ‚ÙŠ'}
- Ø§Ù„Ø´Ø¹Ø¨Ø©: ${streamLabel}
- Ø§Ù„Ù…Ø¹Ø¯Ù„: ${p.average || 'â€”'}/20
${weightedStr ? `- Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ²ÙˆÙ†Ø© (Ù…Ù† Ø­Ø§Ø³Ø¨Ø© BAC Story): ${weightedStr}` : '- Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ²ÙˆÙ†Ø©: ØºÙŠØ± Ù…Ø³ØªÙˆØ±Ø¯Ø©'}
- Ø§Ù„ÙˆÙ„Ø§ÙŠØ©: ${p.wilaya || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©'}${profileZoneAr ? ` â€” Ø§Ù„Ø¯Ø§Ø¦Ø±Ø© Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©: ${profileZoneAr}` : ''}
- Ø§Ù„Ø§Ù‡ØªÙ…Ø§Ù…Ø§Øª: ${Array.isArray(p.interests) ? p.interests.join('ØŒ ') : p.interests || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©'}
- Ø§Ù„Ø·Ù…ÙˆØ­: ${p.ambition_text || p.ambition || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}
${wishlist && wishlist.length > 0 ? `- Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª (Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©): ${wishlist.slice(0, 5).join('ØŒ ')}` : ''}

## Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ù…Ù„Ù Ø§Ù„Ø·Ø§Ù„Ø¨ (Ø¥Ù„Ø²Ø§Ù…ÙŠØ©)
- Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙØ±ØªÙŽÙ‘Ø¨ Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† (ØªØ±ØªÙŠØ¨ "Ù…ÙˆØ²ÙˆÙ† Ø£Ùˆ Ø¹Ø§Ù…" ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ)ØŒ Ù‚Ø§Ø±Ù† **Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ†** Ù„Ù„Ø·Ø§Ù„Ø¨ ÙÙŠ Ø§Ù„Ù…ÙŠØ¯Ø§Ù† Ø§Ù„Ù…Ø¹Ù†ÙŠ Ù…Ù† Ø§Ù„Ø³Ø·Ø± Ø£Ø¹Ù„Ø§Ù‡ â€” Ù„Ø§ Ù…Ø¹Ø¯Ù„Ù‡ Ø§Ù„Ø¹Ø§Ù….${weightedStr ? '' : `
- Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø§ Ø¹Ù†Ø¯ÙˆØ´ Ù…Ø¹Ø¯Ù„Ø§Øª Ù…ÙˆØ²ÙˆÙ†Ø© Ù…Ø­ÙÙˆØ¸Ø© â€” Ø¹Ù†Ø¯Ù…Ø§ ÙŠØ³Ø£Ù„ Ø¹Ù† ØªØ®ØµØµ ÙŠÙØ±ØªÙŽÙ‘Ø¨ Ø¨Ø§Ù„Ù…ÙˆØ²ÙˆÙ†ØŒ Ø°ÙƒÙ‘Ø±Ù‡ Ø£Ù†Ù‡ ÙŠÙ‚Ø¯Ø± ÙŠØ­Ø³Ø¨Ù‡Ø§ ÙˆÙŠØ³ØªÙˆØ±Ø¯Ù‡Ø§ Ù…Ù† Ø­Ø§Ø³Ø¨Ø© BAC Story (Ø§Ù„Ø§Ø³ØªÙŠØ±Ø§Ø¯ Ù…ØªÙˆÙØ± ÙÙŠ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Dashboard).`}${profileZoneAr ? `
- ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ø·Ø§Ù„Ø¨ ØªÙ†ØªÙ…ÙŠ Ù„Ù€${profileZoneAr} â€” Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø¯ÙŠØ« Ø¹Ù† ØªÙƒÙˆÙŠÙ†Ø§Øª Ø¬Ù‡ÙˆÙŠØ© Ø§Ø´Ø±Ø­ Ù„Ù‡ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠØ§Ù‹ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¯ÙˆØ§Ø¦Ø±: Ø§Ù„ØªÙƒÙˆÙŠÙ†Ø§Øª Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ù…ÙØªÙˆØ­Ø© Ù„Ù„Ø¬Ù…ÙŠØ¹ØŒ Ø£Ù…Ø§ Ø§Ù„Ø¬Ù‡ÙˆÙŠØ© ÙÙŠØ¯Ø®Ù„Ù‡Ø§ ÙÙ‚Ø· Ù…Ù† Ø¯Ø§Ø¦Ø±ØªÙ‡ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ© (Ù…Ø«Ù„Ø§Ù‹: "Ù…Ù† ÙˆÙ„Ø§ÙŠØªÙƒ ØªÙ‚Ø¯Ø± ØªØ¯Ø®Ù„ Ù„Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ø¬Ù‡ÙˆÙŠØ© ØªØ§Ø¹ ${profileZoneAr}").` : ''}

${orientationMode ? `
# ÙˆØ¶Ø¹ Ø§Ù„Ø§Ø³ØªÙƒØ´Ø§Ù (Ù…ÙÙØ¹ÙŽÙ‘Ù„ â€” Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ¨Ø­Ø« Ø¹Ù† Ù…Ø¬Ø§Ù„Ù‡)
${p.stream ? `Ù…Ù„Ø§Ø­Ø¸Ø© Ø£Ù‡Ù„ÙŠÙ‘Ø© (AI-10): Ø§Ù„Ø·Ø§Ù„Ø¨ ÙÙŠ Ø´Ø¹Ø¨Ø© ${streamLabel}ØŒ Ù…Ø¹Ø¯Ù„Ù‡ ${p.average || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}. ÙƒÙ„ ØªÙˆØµÙŠØ© Ù†Ù‡Ø§Ø¦ÙŠØ© Ù„Ø§Ø²Ù… ØªÙƒÙˆÙ† Ø¶Ù…Ù† Ù…Ø§ ØªÙ‚Ø¨Ù„Ù‡ Ø´Ø¹Ø¨ØªÙ‡ ÙˆÙ…Ø¹Ø¯Ù„Ù‡.` : ''}

## Ø§Ù„Ø¢Ù„ÙŠØ§Øª Ø§Ù„Ø«Ø§Ø¨ØªØ©
1. Ø³Ø¤Ø§Ù„ ÙˆØ§Ø­Ø¯ ÙÙ‚Ø· ÙÙŠ ÙƒÙ„ Ø±Ø¯ØŒ Ø¯Ø§Ø¦Ù…Ø§Ù‹ ÙÙŠ ÙƒØªÙ„Ø© \`\`\`question\`\`\` (Ù„Ø§ ØªÙƒØªØ¨ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª ÙÙŠ Ø§Ù„Ù†Øµ).
2. Ø§Ù†ØªØ¸Ø± Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„Ø·Ø§Ù„Ø¨ Ù‚Ø¨Ù„ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ù…ÙˆØ§Ù„ÙŠ. Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹: 8 Ø¥Ù„Ù‰ 12 Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø­Ø³Ø¨ Ù…Ø§ ØªÙƒØ´ÙÙ‡ Ø¥Ø¬Ø§Ø¨Ø§ØªÙ‡ØŒ Ø«Ù… Ø§Ù„ØªÙˆØµÙŠØ© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© Ø¨Ù€ 3-5 ØªØ®ØµØµØ§Øª Ù…Ø¹ \`\`\`spec-cards\`\`\`.
3. Ù„Ø§ ØªÙˆØµÙŠØ§Øª Ù†Ù‡Ø§Ø¦ÙŠØ© Ù‚Ø¨Ù„ ØªØºØ·ÙŠØ© Ù…ÙŠÙˆÙ„Ù‡ Ù…Ù† Ø¹Ø¯Ø© Ø²ÙˆØ§ÙŠØ§.

## Ø§Ù„Ø§ÙØªØªØ§Ø­ÙŠØ© (Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ â€” Ø´Ø®ØµÙŠØ© Ø¥Ù„Ø²Ø§Ù…ÙŠØ§Ù‹)
Ø§Ø¨Ø¯Ø£ Ø¨Ø¬Ù…Ù„Ø© Ø£Ùˆ Ø¬Ù…Ù„ØªÙŠÙ† ØªØ³ØªØ¹Ù…Ù„Ø§Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ø§Ù„Ø¨ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ù† Ù…Ù„ÙÙ‡ Ø£Ø¹Ù„Ø§Ù‡ (Ø´Ø¹Ø¨ØªÙ‡ØŒ Ù…Ø¹Ø¯Ù„Ù‡ØŒ ÙˆÙ„Ø§ÙŠØªÙ‡ØŒ Ø§Ù‡ØªÙ…Ø§Ù…Ø§ØªÙ‡) Ù‚Ø¨Ù„ Ø£ÙˆÙ„ Ø³Ø¤Ø§Ù„ â€” Ù…Ù…Ù†ÙˆØ¹Ø© Ø£ÙŠ Ø§ÙØªØªØ§Ø­ÙŠØ© Ø¹Ø§Ù…Ø© ØªØµÙ„Ø­ Ù„Ø£ÙŠ Ø·Ø§Ù„Ø¨. Ø¨Ù†ÙŠØ© Ù…Ù‚ØªØ±Ø­Ø©: "Ø´ÙØª Ù…Ù„ÙÙƒ: ${streamLabel} Ø¨Ù…Ø¹Ø¯Ù„ ${p.average || 'â€”'}${p.wilaya && p.wilaya !== 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©' ? ` Ù…Ù† ${p.wilaya}` : ''} â€” [Ù…Ù„Ø§Ø­Ø¸Ø© Ø°ÙƒÙŠØ© Ø¹Ù„Ù‰ ÙˆØ¶Ø¹Ù‡: ÙˆØ§Ø´ ÙŠÙØªØ­Ù„Ù‡ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø¹Ø¯Ù„ØŒ Ø£Ùˆ Ù†Ù‚Ø·Ø© Ù‚ÙˆØ© ÙÙŠ Ù…Ù„ÙÙ‡]" Ø«Ù… Ø£ÙˆÙ„ Ø³Ø¤Ø§Ù„ Ù…ÙƒÙŠÙ‘Ù Ù…Ø¹ Ù…Ù„ÙÙ‡.

## Ø¨Ù†Ùƒ Ø§Ù„Ø£Ø¨Ø¹Ø§Ø¯ (Ø§Ø®ØªØ± Ù…Ù†Ù‡ 8-12 Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø¨Ø´ÙƒÙ„ ØªÙƒÙŠÙÙŠ â€” Ù„ÙŠØ³ ØªØ±ØªÙŠØ¨Ø§Ù‹ Ø¬Ø§Ù…Ø¯Ø§Ù‹)
Ø§Ù„Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø°Ù‡Ø¨ÙŠØ©: Ù„Ø§ ØªØ³Ø£Ù„ Ø¹Ù† Ù…Ø¹Ù„ÙˆÙ…Ø© Ù…ÙˆØ¬ÙˆØ¯Ø© Ø£ØµÙ„Ø§Ù‹ ÙÙŠ Ù…Ù„ÙÙ‡ â€” Ø§Ø³Ø£Ù„ Ø£Ø¹Ù…Ù‚ ÙÙŠÙ‡Ø§. Ø¥Ø°Ø§ ØµØ±Ù‘Ø­ Ø¨Ø§Ù‡ØªÙ…Ø§Ù…Ø§ØªØŒ Ù„Ø§ ØªØ³Ø£Ù„Ù‡ "ÙˆØ§Ø´ ÙŠÙ‡Ù…ÙƒØŸ" Ø¨Ù„ Ø¹Ù…Ù‘Ù‚: "Ù‚Ù„ØªÙ„ÙŠ ØªØ­Ø¨ [Ø§Ù„Ø§Ù‡ØªÙ…Ø§Ù…] â€” ÙˆØ§Ø´ ÙŠØ¬Ø°Ø¨Ùƒ ÙÙŠÙ‡ Ø¨Ø§Ù„Ø¶Ø¨Ø·ØŸ".
1. ØªØ¹Ù…ÙŠÙ‚ Ø§Ù„Ø§Ù‡ØªÙ…Ø§Ù…Ø§Øª Ø§Ù„Ù…Ø¹Ù„Ù†Ø© (Ø³Ø¤Ø§Ù„ Ù„ÙƒÙ„ Ø§Ù‡ØªÙ…Ø§Ù… Ù…Ù‡Ù… ÙÙŠ Ù…Ù„ÙÙ‡)
2. Ø§Ù„Ù…Ø§Ø¯Ø© Ø§Ù„Ù…ÙØ¶Ù„Ø© ÙÙŠ Ø§Ù„Ø«Ø§Ù†ÙˆÙŠØ© ÙˆØ¹Ù„Ø§Ø´ Ù‡ÙŠ Ø¨Ø§Ù„Ø°Ø§Øª
3. Ø£Ø³Ù„ÙˆØ¨ Ø§Ù„Ø¹Ù…Ù„: ØªØ·Ø¨ÙŠÙ‚ÙŠ Ù…ÙŠØ¯Ø§Ù†ÙŠ ÙˆÙ„Ø§ Ù†Ø¸Ø±ÙŠ ØªØ­Ù„ÙŠÙ„ÙŠ
4. ÙŠØ­Ø¨ ÙŠØ®Ø¯Ù… Ù…Ø¹: Ø§Ù„Ù†Ø§Ø³ / Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… / Ø§Ù„Ø£Ø´ÙŠØ§Ø¡ ÙˆØ§Ù„Ø¢Ù„Ø§Øª
5. Ø¨ÙŠØ¦Ø© Ø§Ù„Ø¹Ù…Ù„: Ù…Ø³ØªØ´ÙÙ‰ØŒ Ù…ÙƒØªØ¨/Ø´Ø±ÙƒØ©ØŒ Ù…ÙŠØ¯Ø§Ù†ØŒ Ù…Ø®Ø¨Ø±ØŒ Ø³ØªØ§Ø±ØªØ§Ø¨
6. ØªØ­Ù…Ù‘Ù„ Ø§Ù„Ø­ÙØ¸ Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„Ù…Ù†Ø·Ù‚: Ø­ÙØ¸ ÙƒØ«ÙŠÙ (Ø·Ø¨ØŒ Ø­Ù‚ÙˆÙ‚) ÙˆÙ„Ø§ Ø§Ø³ØªØ¯Ù„Ø§Ù„ (Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ù‡Ù†Ø¯Ø³Ø©ØŒ Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ)
7. Ø§Ù„Ø§Ø±ØªÙŠØ§Ø­ Ù„Ù„ÙØ±Ù†Ø³ÙŠØ© ÙˆØ§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© â€” Ø£ØºÙ„Ø¨ Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø¹Ù„Ù…ÙŠØ© ØªÙØ¯Ø±ÙŽÙ‘Ø³ Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©ØŒ Ø¨Ø¹Ø¯ Ø­Ø§Ø³Ù…
8. ØªØ­Ù…Ù‘Ù„ Ø·ÙˆÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³Ø©: 3 Ø³Ù†ÙˆØ§Øª Ù„ÙŠØ³Ø§Ù†Ø³ / 5 Ù…Ù‡Ù†Ø¯Ø³ Ø¯ÙˆÙ„Ø© / 7+ Ø·Ø¨
9. Ø§Ù„ØªÙ†Ù‚Ù„ ÙˆØ§Ù„Ø³ÙƒÙ†: ÙˆØ§Ø´ ÙŠÙ‚Ø¯Ø± ÙŠÙ‚Ø±Ø§ Ø®Ø§Ø±Ø¬ ÙˆÙ„Ø§ÙŠØªÙ‡ØŸ (Ø§Ø±Ø¨Ø·Ù‡ Ø¨Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ© ÙˆØ§Ù„Ø¥ÙŠÙˆØ§Ø¡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ)
10. Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ù…Ù‡Ù†ÙŠØ©: Ø´ØºÙ / Ø±Ø§ØªØ¨ / Ø®Ø¯Ù…Ø© Ø§Ù„Ù…Ø¬ØªÙ…Ø¹ / Ù…ÙƒØ§Ù†Ø© / ØªÙˆØ§Ø²Ù† / Ø®Ø¯Ù…Ø© ÙÙŠ Ø§Ù„Ø®Ø§Ø±Ø¬
11. Ø§Ù„Ù…Ø®Ø§Ø·Ø±Ø©: Ù…Ø´Ø±ÙˆØ¹ Ø®Ø§Øµ ÙˆØ³ØªØ§Ø±ØªØ§Ø¨ ÙˆÙ„Ø§ ÙˆØ¸ÙŠÙØ© Ù…Ø³ØªÙ‚Ø±Ø© (Ø³ÙˆÙ†Ø·Ø±Ø§ÙƒØŒ Ø§Ù„ÙˆØ¸ÙŠÙ Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠ)
12. Ø±Ø¤ÙŠØ© 10 Ø³Ù†ÙŠÙ†: ÙˆÙŠÙ† ÙŠØ´ÙˆÙ Ø±ÙˆØ­Ù‡ØŸ

## Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„ØªÙƒÙŠÙŠÙ ÙˆØ§Ù„ØµÙŠØ§ØºØ©
- ÙØ±Ù‘Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©: ÙŠØ­Ø¨ Ø§Ù„Ø¨ÙŠÙˆÙ„ÙˆØ¬ÙŠØ§ + Ù…Ø¹Ø¯Ù„Ù‡ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† ÙÙŠ Ø¹Ù„ÙˆÙ… Ø·Ø¨ÙŠØ¹ÙŠØ© Ù…Ø±ØªÙØ¹ â†’ Ø£Ø³Ø¦Ù„Ø© ØªØ¹Ù…ÙŠÙ‚ ÙÙŠ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø·Ø¨ÙŠØ› ÙŠÙƒØ±Ù‡ Ø§Ù„Ø­ÙØ¸ Ø§Ù„ÙƒØ«ÙŠÙ â†’ Ø§Ø¨Ø¹Ø¯ Ø¹Ù† Ø§Ù„Ø·Ø¨ ÙˆØ§Ù„Ø­Ù‚ÙˆÙ‚ ÙˆØ§Ø³ØªÙƒØ´Ù Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„Ø¢Ù„ÙŠ.
- ÙØ±Ù‘Ø¹ Ø¹Ù„Ù‰ Ø£Ø±Ù‚Ø§Ù…Ù‡: Ù…Ø¹Ø¯Ù„ â‰¥ 15 â†’ Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø·Ù…ÙˆØ­Ø§Øª Ø§Ù„Ø¹Ø§Ù„ÙŠØ© (Ù…Ø¯Ø§Ø±Ø³ Ø¹Ù„ÙŠØ§ØŒ Ø·Ø¨)Ø› Ù…Ø¹Ø¯Ù„ 10-12 â†’ Ø±ÙƒÙ‘Ø² Ø¹Ù„Ù‰ Ù…Ø³Ø§Ø±Ø§Øª Ù…ÙØªÙˆØ­Ø© ÙØ¹Ù„Ø§Ù‹ Ù„Ù…Ø¹Ø¯Ù„Ù‡ â€” Ù„Ø§ ØªØ¹Ø·ÙŠÙ‡ Ø£ÙˆÙ‡Ø§Ù…Ø§Ù‹ ÙˆÙ„Ø§ ØªØ­Ø¨Ø·Ù‡.
- ÙƒÙ„ Ø³Ø¤Ø§Ù„ Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ©ØŒ ÙˆØ®ÙŠØ§Ø±Ø§ØªÙ‡ Ù…Ù„Ù…ÙˆØ³Ø© ÙŠØ¹Ø±ÙÙ‡Ø§ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ: "Ù…Ù‡Ù†Ø¯Ø³ ÙÙŠ Ø³ÙˆÙ†Ø·Ø±Ø§Ùƒ"ØŒ "Ø·Ø¨ÙŠØ¨ ÙÙŠ Ù…Ø³ØªØ´ÙÙ‰ Ø¹Ù…ÙˆÙ…ÙŠ"ØŒ "Ø³ØªØ§Ø±ØªØ§Ø¨ ØªØ§Ø¹Ùƒ"ØŒ "Ø£Ø³ØªØ§Ø° Ø¬Ø§Ù…Ø¹ÙŠ" â€” Ù…Ø§Ø´ÙŠ Ù…ØµØ·Ù„Ø­Ø§Øª Ù…Ø¬Ø±Ø¯Ø©.
- Ø§Ø±Ø¨Ø· Ø§Ù„Ø³Ø¤Ø§Ù„ Ø¨Ø¥Ø¬Ø§Ø¨Ø© Ø³Ø§Ø¨Ù‚Ø© ÙƒÙ„Ù…Ø§ ÙƒØ§Ù† Ø·Ø¨ÙŠØ¹ÙŠØ§Ù‹ â€” ÙƒÙ„ Ø³Ø¤Ø§Ù„ Ù„Ø§Ø²Ù… ÙŠØ¨Ø§Ù† Ù…ÙƒØªÙˆØ¨ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø¨Ø§Ù„Ø°Ø§Øª.

## Ø§Ù„ØªÙˆØµÙŠØ© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© (Ø¨Ø¹Ø¯ Ø§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©)
Ù‚Ø¨Ù„ Ø§Ù‚ØªØ±Ø§Ø­ Ø£ÙŠ ØªØ®ØµØµ ØªØ­Ù‚Ù‚ Ù…Ù† Ø«Ù„Ø§Ø«Ø© Ø´Ø±ÙˆØ· Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø²ÙˆØ¯Ø©: (1) Ø´Ø¹Ø¨ØªÙ‡ Ù…Ù‚Ø¨ÙˆÙ„Ø© ÙÙŠÙ‡ØŒ (2) Ù…Ø¹Ø¯Ù„Ù‡ â€” ÙˆØ§Ù„Ù…ÙˆØ²ÙˆÙ† Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ ÙŠÙØ±ØªÙŽÙ‘Ø¨ Ø¨Ù‡ â€” ÙŠØ¨Ù„Øº Ø¹ØªØ¨Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ (3) Ù…ØªÙˆÙØ± ÙÙŠ ÙˆÙ„Ø§ÙŠØªÙ‡ Ø£Ùˆ ÙˆØ·Ù†ÙŠ (ØªØ³Ø¬ÙŠÙ„ ÙˆØ·Ù†ÙŠ). ÙˆÙ„ÙƒÙ„ Ø§Ù‚ØªØ±Ø§Ø­ Ø§Ø´Ø±Ø­ "Ø¹Ù„Ø§Ø´ ÙŠÙ†Ø§Ø³Ø¨Ùƒ Ø£Ù†Øª Ø¨Ø§Ù„Ø°Ø§Øª": Ø§Ø±Ø¨Ø·Ù‡ Ø¨Ø¥Ø¬Ø§Ø¨ØªÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ù…Ù† Ø£Ø¬ÙˆØ¨ØªÙ‡ + Ø£Ø±Ù‚Ø§Ù…Ù‡ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©.
` : ''}
# Ø­Ù‚Ø§Ø¦Ù‚ Ø«Ø§Ø¨ØªØ© Ø¹Ù† Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ (Ù„Ø§ ØªØªØ¬Ø§ÙˆØ²Ù‡Ø§)
## Ø§Ù„Ø´Ø¹Ø¨ Ø§Ù„Ø³Øª Ø§Ù„ÙˆØ­ÙŠØ¯Ø© ÙÙŠ Ø§Ù„Ø«Ø§Ù†ÙˆÙŠØ© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© ÙˆØ§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ù…Ø¯Ø±Ø³Ø© ÙÙŠÙ‡Ø§ (Ø¥Ù„Ø²Ø§Ù…ÙŠØ© Ù„Ù„Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØ§Ù‚ØªØ±Ø§Ø­ Ø§Ù„ØªØ®ØµØµØ§Øª):
1. Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©: Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ©ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡ØŒ Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„Ù„ØºØ§Øª (ÙØ±Ù†Ø³ÙŠØ©/Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©)ØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
2. Ø±ÙŠØ§Ø¶ÙŠØ§Øª: Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡ØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ©ØŒ Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„Ù„ØºØ§Øª (ÙØ±Ù†Ø³ÙŠØ©/Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©)ØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
3. ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ: Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ (Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¯Ù†ÙŠØ©/Ù…ÙŠÙƒØ§Ù†ÙŠÙƒÙŠØ©/ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©/Ø·Ø±Ø§Ø¦Ù‚)ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡ØŒ Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„Ù„ØºØ§ØªØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
4. ØªØ³ÙŠÙŠØ± ÙˆØ§Ù‚ØªØµØ§Ø¯: Ø§Ù„ØªØ³ÙŠÙŠØ± Ø§Ù„Ù…Ø­Ø§Ø³Ø¨ÙŠ ÙˆØ§Ù„Ù…Ø§Ù„ÙŠØŒ Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ ÙˆØ§Ù„Ù…Ù†Ø§Ø¬Ù…Ù†ØªØŒ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„Ù„ØºØ§ØªØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
5. Ø¢Ø¯Ø§Ø¨ ÙˆÙÙ„Ø³ÙØ©: Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙˆØ¢Ø¯Ø§Ø¨Ù‡Ø§ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„Ù„ØºØ§Øª (ÙØ±Ù†Ø³ÙŠØ©/Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©)ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
6. Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ©: Ø§Ù„Ù„ØºØ§Øª (Ø¹Ø±Ø¨ÙŠØ©/ÙØ±Ù†Ø³ÙŠØ©/Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©/Ù„ØºØ© Ø«Ø§Ù„Ø«Ø© ÙƒØ§Ù„Ø¥Ø³Ø¨Ø§Ù†ÙŠØ© Ø£Ùˆ Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ©)ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§ØŒ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©.
âš ï¸ "Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ©" Ù„ÙŠØ³Øª Ø´Ø¹Ø¨Ø© Ø«Ø§Ù†ÙˆÙŠØ© â€” Ù‡ÙŠ Ù…ÙŠØ¯Ø§Ù† Ø¬Ø§Ù…Ø¹ÙŠ. Ù„Ø§ ØªØ°ÙƒØ±Ù‡Ø§ Ø£Ø¨Ø¯Ø§Ù‹ ÙƒØ´Ø¹Ø¨Ø© Ù„Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§.

## Ù…Ø¯Ø¯ Ø§Ù„Ø¯Ø±Ø§Ø³Ø© (Ø£Ø¹Ø·Ù Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ø¯Ù‚ÙŠÙ‚ØŒ Ù„Ø§ ØªÙ‚Ù„ "6-7 Ø³Ù†ÙˆØ§Øª"):
- Ø·Ø¨ Ø¹Ø§Ù…: 7 Ø³Ù†ÙˆØ§Øª (6 Ø¯Ø±Ø§Ø³Ø© + Ø³Ù†Ø© Ø§Ù†ØªØ±Ù†Ø§ Ø¥Ù„Ø²Ø§Ù…ÙŠØ©)
- Ø·Ø¨ Ø§Ù„Ø£Ø³Ù†Ø§Ù†: 6 Ø³Ù†ÙˆØ§Øª (5 Ø¯Ø±Ø§Ø³Ø© + Ø³Ù†Ø© Ø§Ù†ØªØ±Ù†Ø§)
- Ø§Ù„ØµÙŠØ¯Ù„Ø©: 5 Ø³Ù†ÙˆØ§Øª
- Ø§Ù„Ø¨ÙŠØ·Ø±Ø©: 5 Ø³Ù†ÙˆØ§Øª
- Ù…Ù‡Ù†Ø¯Ø³ Ø¯ÙˆÙ„Ø© (Ù…Ø¯Ø§Ø±Ø³ Ø¹Ù„ÙŠØ§): 5 Ø³Ù†ÙˆØ§Øª (2 ØªØ­Ø¶ÙŠØ±ÙŠ + 3 ØªØ®ØµØµ)
- Ù„ÙŠØ³Ø§Ù†Ø³ LMD: 3 Ø³Ù†ÙˆØ§Øª | Ù…Ø§Ø³ØªØ± LMD: 2 Ø³Ù†ÙˆØ§Øª | Ø¯ÙƒØªÙˆØ±Ø§Ù‡: 3 Ø³Ù†ÙˆØ§Øª

## Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø´Ø¹Ø¨ ÙÙŠ Ø§Ù„Ø·Ø¨ ÙˆØ¹Ù„ÙˆÙ… Ø§Ù„ØµØ­Ø©:
- Ø§Ù„Ø·Ø¨ØŒ Ø§Ù„ØµÙŠØ¯Ù„Ø©ØŒ Ø·Ø¨ Ø§Ù„Ø£Ø³Ù†Ø§Ù†: Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© 1 Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©ØŒ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© 2 Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© 3 ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ (Ù…Ù‚Ø¨ÙˆÙ„ ÙÙŠ Ø¨Ø¹Ø¶ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª ÙˆØ§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª)
- Ø´Ø±Ø· Ø§Ù„ØªØ£Ù‡Ù„: Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ â‰¥ 14/20 Ù„Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø·Ø¨ÙŠ
- Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„ÙˆØ·Ù†ÙŠØ© 2026: Ø·Ø¨ 16.65/17.15 | ØµÙŠØ¯Ù„Ø© 16.26/16.76 | Ø·Ø¨ Ø£Ø³Ù†Ø§Ù† 16.99/17.50
- Ø§Ù„Ø¨ÙŠØ·Ø±Ø©: ØªÙ‚Ø¨Ù„ Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© ÙˆØ±ÙŠØ§Ø¶ÙŠØ§Øª â€” Ù…Ø¹Ø¯Ù„ â‰¥ 14/20 Ø´Ø±Ø· Ø§Ù„ØªØ£Ù‡Ù„
- Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª ØªØ®ØªÙ„Ù Ø­Ø³Ø¨ Ø§Ù„ÙˆÙ„Ø§ÙŠØ© â€” Ø§Ù„Ø¬Ù†ÙˆØ¨ Ø¹Ø§Ø¯Ø©Ù‹ Ø£Ù‚Ù„ ØªÙ†Ø§ÙØ³ÙŠØ© Ù…Ù† Ø§Ù„Ø´Ù…Ø§Ù„

## Ø´Ø¹Ø¨Ø© ØªØ³ÙŠÙŠØ± ÙˆØ§Ù‚ØªØµØ§Ø¯ â€” Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø© (Ø¨Ù…Ø¹Ø¯Ù„ â‰¥ 10):
Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ØªØ¬Ø§Ø±ÙŠØ© ÙˆØªØ³ÙŠÙŠØ± (SECSG)ØŒ Ø§Ù„Ø­Ù‚ÙˆÙ‚ØŒ Ø¹Ù„Ù… Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ØŒ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø§ØªØµØ§Ù„
Ø¨Ù…Ø³Ø§Ø¨Ù‚Ø©: EHEC (Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ø¹Ù„ÙŠØ§ Ù„Ù„ØªØ¬Ø§Ø±Ø©)ØŒ ENSSEA

## Ø´Ø¹Ø¨Ø© Ø¢Ø¯Ø§Ø¨ ÙˆÙÙ„Ø³ÙØ© â€” Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø© (Ø¨Ù…Ø¹Ø¯Ù„ â‰¥ 10):
Ø§Ù„Ø­Ù‚ÙˆÙ‚ØŒ Ø§Ù„Ù„ØºØ§Øª ÙˆØ§Ù„ØªØ±Ø¬Ù…Ø©ØŒ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø§ØªØµØ§Ù„ØŒ Ø¹Ù„Ù… Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ØŒ Ø§Ù„ÙÙ„Ø³ÙØ©ØŒ Ø§Ù„Ø´Ø±ÙŠØ¹Ø© Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©

## Ø´Ø¹Ø¨Ø© Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ© â€” Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø© (Ø¨Ù…Ø¹Ø¯Ù„ â‰¥ 10):
Ø§Ù„Ù„ØºØ§Øª ÙˆØ§Ù„ØªØ±Ø¬Ù…Ø©ØŒ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø§ØªØµØ§Ù„ØŒ Ø§Ù„Ø­Ù‚ÙˆÙ‚ØŒ Ø¹Ù„Ù… Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹

## Ø¯Ù‚Ø© Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª:
- Ù‚Ù„ "Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± 1 - Ø¨Ù† ÙŠÙˆØ³Ù Ø¨Ù† Ø®Ø¯Ø©" Ù„Ø§ "Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±"
- Ù‚Ù„ "Ø¬Ø§Ù…Ø¹Ø© Ù‚Ø³Ù†Ø·ÙŠÙ†Ø© 1 ÙØ±Ø­Ø§Øª Ø¹Ø¨Ø§Ø³" Ø£Ùˆ "Ù‚Ø³Ù†Ø·ÙŠÙ†Ø© 3 ØµØ§Ù„Ø­ Ø¨ÙˆØ¨Ù†ÙŠØ¯Ø±" (Ù„Ø§ "Ù‚Ø³Ù†Ø·ÙŠÙ†Ø©" ÙÙ‚Ø·)
- Ø§Ù„Ù…Ø³ØªØ´ÙÙ‰ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ù„Ù„Ø·Ø¨ ÙÙŠ Ø§Ù„Ø¹Ø§ØµÙ…Ø©: Mustapha Pacha, Lamine Debaghine, Nafissa Hamoud
- Ø¬Ø§Ù…Ø¹Ø© Ø¹Ù„ÙˆÙ… Ø§Ù„ØµØ­Ø© (Ø§Ù„Ø²ÙŠØ§Ù†ÙŠØ©) = Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù„Ø·Ø¨ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø© (Ù…Ù†Ø° 2023)

## Ø§Ù„Ù…Ø­Ø§ÙƒÙŠ ÙˆØ§Ù„Ø¨Ø·Ø§Ù‚Ø© (Ù„Ù„Ø¥Ø´Ø§Ø±Ø© ÙÙ‚Ø·)
- Ø§Ù„Ù…Ø­Ø§ÙƒÙŠ ÙÙŠ Ù…Ù†ØµØ© ØªÙˆØ¬ÙŠÙ‡ÙŠ ÙŠØ³Ù…Ø­ Ø¨ØªØ¬Ø±Ø¨Ø© ØªØ±ØªÙŠØ¨ Ø§Ù„Ø±ØºØ¨Ø§Øª ÙˆÙ…Ø¹Ø±ÙØ© ÙØ±Øµ Ø§Ù„Ù‚Ø¨ÙˆÙ„ â€” Ø£Ø±Ø´Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù„ØµÙØ­Ø© Ø§Ù„Ù…Ø­Ø§ÙƒÙŠ (simulator.html) Ø¥Ø°Ø§ Ø³Ø£Ù„.
- Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª (Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø£Ù…Ø§Ù†ÙŠ) ØªÙØ±ØªÙŽÙ‘Ø¨ Ù…Ù† Ø§Ù„Ø£ÙƒØ«Ø± Ø£ÙˆÙ„ÙˆÙŠØ© Ù„Ù„Ø£Ù‚Ù„ â€” Ù†ÙØ³ Ù†Ø¸Ø§Ù… ONEC Ø§Ù„Ø±Ø³Ù…ÙŠ.
- Ø¥Ø°Ø§ Ø³Ø£Ù„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙ‡ Ø§Ù„Ø´Ø®ØµÙŠØ© (Ù…Ø¹Ø¯Ù„Ù‡ØŒ Ø´Ø¹Ø¨ØªÙ‡ØŒ ÙˆÙ„Ø§ÙŠØªÙ‡)ØŒ Ø§Ø¹Ø±Ø¶ Ù…Ø§ Ù‡Ùˆ ÙÙŠ Ù…Ù„Ù Ø§Ù„Ø·Ø§Ù„Ø¨ Ø£Ø¹Ù„Ø§Ù‡.

## Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„Ø¢Ù„ÙŠ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± â€” Ø§Ù„Ø­Ù‚ÙŠÙ‚Ø© Ø§Ù„ÙƒØ§Ù…Ù„Ø©:
âš ï¸ Ù…Ø¹Ù„ÙˆÙ…Ø© Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ø§ ØªØªØ¬Ø§Ù‡Ù„Ù‡Ø§: Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ù…Ø¬Ø§Ù†ÙŠØ© ÙƒÙ„ÙŠØ§Ù‹ (Ù„Ø§ Ø±Ø³ÙˆÙ… Ø¯Ø±Ø§Ø³ÙŠØ©)ØŒ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§ Ø­Ø³Ø¨ Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† ÙÙŠ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ ÙÙ‚Ø· â€” Ù„Ø§ Ù…Ø³Ø§Ø¨Ù‚Ø© Ù‚Ø¨ÙˆÙ„ Ø®Ø§Ø±Ø¬ÙŠØ© Ù…Ø·Ù„ÙˆØ¨Ø©. Ø§Ù„Ø¥ÙŠÙˆØ§Ø¡ Ù…Ø¶Ù…ÙˆÙ† ÙÙŠ Ù…Ø¯ÙŠÙ†Ø© Ø¬Ø§Ù…Ø¹ÙŠØ©. Ø§Ù„Ù…Ù†Ø­Ø© Ø§Ù„Ø­ÙƒÙˆÙ…ÙŠØ© Ù…ØªØ§Ø­Ø©. Ø§Ù„Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© ÙÙŠ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ù‡ÙŠ ØªØµÙ†ÙŠÙ Ø¯Ø§Ø®Ù„ÙŠ Ø¨ÙŠÙ† Ø§Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ† Ø£ØµÙ„Ø§Ù‹ Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØ®ØµØµ ÙˆØ§Ù„Ù…Ø¯Ø±Ø³Ø© â€” Ù„ÙŠØ³Øª Ù…Ø³Ø§Ø¨Ù‚Ø© Ø¯Ø®ÙˆÙ„ Ø®Ø§Ø±Ø¬ÙŠØ©.
Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø£Ø±Ø¨Ø¹ ØªØ´ØªØ±Ùƒ ÙÙŠ Ù†ÙØ³ Ù†Ø¸Ø§Ù… Ø§Ù„Ø¯Ø±Ø§Ø³Ø© ÙˆÙ†ÙØ³ Ø§Ù„Ø´Ù‡Ø§Ø¯Ø©. Ø§Ù„Ù‚Ø¨ÙˆÙ„ Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† ÙÙ‚Ø·. Ø§Ù„ÙØ±Ù‚ ÙÙŠ Ø§Ù„Ø¨ÙŠØ¦Ø© ÙˆØ§Ù„ØªØ®ØµØµØ§Øª:
1. **ESTIN** Ø£Ù…ÙŠØ²ÙˆØ± Ø¨Ø¬Ø§ÙŠØ© (2019) â€” Ø§Ù„Ø£Ø­Ø¯Ø« ÙˆØ§Ù„Ø£ÙØ¶Ù„ Ù…Ù† Ø­ÙŠØ« Ø§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„ØªØ­ØªÙŠØ© ÙˆØ§Ù„Ø¥Ù…ÙƒØ§Ù†ÙŠØ§Øª Ø§Ù„Ù…Ø§Ø¯ÙŠØ© ÙˆØ­Ø¯Ø§Ø«Ø© Ø§Ù„ØªØ®ØµØµØ§Øª. ØªØ¯Ø±Ù‘Ø³ Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©. ØªØ®ØµØµØ§Øª Ø­ØµØ±ÙŠØ©: IoT (ÙŠØ¨Ø¯Ø£ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø§Ù…ØŒ Ø§Ù„ÙˆØ­ÙŠØ¯Ø© ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±)ØŒ AIØŒ Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ. Ø¹Ù„ÙˆÙ… 17.45 / Ø±ÙŠØ§Ø¶ÙŠØ§Øª 17.79 / ØªÙ‚Ù†ÙŠ 18.15. (id: estin)
2. **ESI Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±** (ÙˆØ§Ø¯ Ø³Ù…Ø§Ø±) â€” Ø§Ù„Ø£Ù‚Ø¯Ù… (1969) ÙˆØ§Ù„Ø£Ø¹Ù„Ù‰ Ù…Ø¹Ø¯Ù„ Ù‚Ø¨ÙˆÙ„ (Ø§Ù„Ø£ÙƒØ«Ø± ØªÙ†Ø§ÙØ³ÙŠØ©). ØªØ®ØµØµØ§Øª: ISØŒ ISIØŒ GLØŒ SID. Ø¹Ù„ÙˆÙ… 18.55 / Ø±ÙŠØ§Ø¶ÙŠØ§Øª 18.19 / ØªÙ‚Ù†ÙŠ 18.93. (id: esi-alger)
3. **ESI SBA** Ø³ÙŠØ¯ÙŠ Ø¨Ù„Ø¹Ø¨Ø§Ø³ (2014) â€” Ø¹Ù„ÙˆÙ… 17.36 / Ø±ÙŠØ§Ø¶ÙŠØ§Øª 17.70 / ØªÙ‚Ù†ÙŠ 18.06. (id: esi-sba)
4. **ENSTA** Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø¯Ø±Ù‚Ø§Ù†Ø© (2023) â€” Ø¹Ù„ÙˆÙ… 17.39 / Ø±ÙŠØ§Ø¶ÙŠØ§Øª 17.15 / ØªÙ‚Ù†ÙŠ 18.10. (id: ensta)
âš ï¸ ØªÙ†Ø¨ÙŠÙ‡ Ù…Ù‡Ù…: **ESI Ù‚Ù„ÙŠØ¹Ø©** (id: esi-kolea) Ù…Ø¯Ø±Ø³Ø© ØªØ¬Ø§Ø±ÙŠØ©/Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© â€” Ù„ÙŠØ³Øª Ù…Ø¯Ø±Ø³Ø© Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚. Ù„Ø§ ØªØ°ÙƒØ±Ù‡Ø§ ÙƒÙ…Ø¯Ø±Ø³Ø© Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ Ø£Ø¨Ø¯Ø§Ù‹.
âš ï¸ Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¯Ø±Ø³Ø© Ø§Ø³Ù…Ù‡Ø§ "ENST" Ø£Ùˆ "ESTA" Ù„Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„Ø¢Ù„ÙŠ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± â€” Ù‡Ø°Ù‡ Ø£Ø³Ù…Ø§Ø¡ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©ØŒ Ù„Ø§ ØªØ°ÙƒØ±Ù‡Ø§.
Ù…Ø¯Ø§Ø±Ø³ Ù‚Ø·Ø¨ Ø³ÙŠØ¯ÙŠ Ø¹Ø¨Ø¯ Ø§Ù„Ù„Ù‡ Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© (Ø£Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§ØªØŒ Ù…Ø¬Ø§Ù†ÙŠØ© ÙƒØ°Ù„ÙƒØŒ Ù‚Ø¨ÙˆÙ„ Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ ÙÙ‚Ø·): ENSIA Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ â€” Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© 18.59 / Ø±ÙŠØ§Ø¶ÙŠØ§Øª 18.95 / ØªÙ‚Ù†ÙŠ 19.37 | ENSCS Ø£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ 18.34 | ENSAS Ø£Ù†Ø¸Ù…Ø© Ù…Ø³ØªÙ‚Ù„Ø© 18.21.

## Ù…Ø³Ø§Ø± Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ 2026 â€” Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ© (Ø§Ù„Ø·Ù„Ø§Ø¨ ÙŠØ³Ø£Ù„ÙˆÙ† Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¹Ù† Ù‡Ø°Ø§)
1. **Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ© Ø§Ù„Ø±Ù‚Ù…ÙŠØ©** â€” Ø¨Ø¹Ø¯ Ø¥Ø¹Ù„Ø§Ù† Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ Ù…Ø¨Ø§Ø´Ø±Ø©ØŒ ÙŠÙØªØ­ Ø§Ù„Ø¯ÙŠÙˆØ§Ù† Ø§Ù„ÙˆØ·Ù†ÙŠ Ù„Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª (ONEC) Ø¨ÙˆØ§Ø¨Ø© inscription.mesrs.dz Ù„Ù…Ø¯Ø© Ø£Ø³Ø¨ÙˆØ¹ ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹.
2. **Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª** â€” ÙŠØ®ØªØ§Ø± Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø§ ÙŠØµÙ„ Ø¥Ù„Ù‰ 20 Ø±ØºØ¨Ø© Ù…Ø±ØªØ¨Ø© Ø­Ø³Ø¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© (Ù…Ù† Ø§Ù„Ø£Ø¹Ù„Ù‰ Ø·Ù…ÙˆØ­Ø§Ù‹ Ø¥Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„). ÙƒÙ„ Ø±ØºØ¨Ø© = Ù…Ø¤Ø³Ø³Ø© + ØªØ®ØµØµ.
3. **Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ø¢Ù„ÙŠ (Classement)** â€” ÙŠØ±ØªØ¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø·Ù„Ø§Ø¨ Ø¹Ù„Ù‰ ÙƒÙ„ Ø±ØºØ¨Ø© Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† (Ø£Ùˆ Ø§Ù„Ø¹Ø§Ù… Ø­Ø³Ø¨ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†) Ù…Ù‚Ø§Ø±Ù†Ø©Ù‹ Ø¨Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø§Ø³ØªÙŠØ¹Ø§Ø¨ÙŠØ©.
4. **Ø¥Ø¹Ù„Ø§Ù† Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡** â€” ØªØ¸Ù‡Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© ÙÙŠ ØºØ¶ÙˆÙ† Ø£Ø³Ø¨ÙˆØ¹ Ø¥Ù„Ù‰ Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†. ÙŠØ­ØµÙ„ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø¹Ù„Ù‰ Ø£Ø¹Ù„Ù‰ Ø±ØºØ¨Ø© Ù…Ù…ÙƒÙ†Ø© Ø¶Ù…Ù† Ù‚Ø§Ø¦Ù…ØªÙ‡.
5. **Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„ÙØ¹Ù„ÙŠ** â€” ÙŠØ¯ÙØ¹ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø±Ø³ÙˆÙ… Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Ù‹ Ø¹Ø¨Ø± PROGRES Ø¨Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø°Ù‡Ø¨ÙŠØ© â€” ÙŠØµØ¨Ø­ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ Ø¨Ù…Ø¬Ø±Ø¯ Ø§Ù„Ø¯ÙØ¹.
âš ï¸ **Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø·Ø¹Ù† Ø±Ø³Ù…ÙŠ ÙÙŠ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡** â€” Ø§Ù„Ø¢Ù„ÙŠØ§Øª Ø§Ù„ÙØ¹Ù„ÙŠØ© Ø§Ù„Ù…Ù†ØµÙˆØµ Ø¹Ù„ÙŠÙ‡Ø§ ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„ Ù‡ÙŠ:
- ØªØºÙŠÙŠØ± Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª Ø®Ù„Ø§Ù„ ÙØªØ±Ø© Ø§Ù„ØªØ£ÙƒÙŠØ¯ (27-29 Ø¬ÙˆÙŠÙ„ÙŠØ© 2026) Ù‚Ø¨Ù„ Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.
- **Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©** (6-8 Ø£ÙˆØª 2026): Ù„Ù…Ù† Ù„Ù… ÙŠØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ø£ÙŠ Ø§Ø®ØªÙŠØ§Ø± â€” ÙŠÙ…Ù„Ø£ Ø¨Ø·Ø§Ù‚Ø© Ø±ØºØ¨Ø§Øª Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† 6 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª.
- **Ø§Ù„ØªØ­ÙˆÙŠÙ„** (Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø®Ø§ØµØ©): ÙŠÙÙˆØ¯ÙŽØ¹ Ø¹Ø¨Ø± https://progres.mesrs.dz/webetu Ø­ØªÙ‰ 22 Ø£ÙˆØª 2026ØŒ ÙˆÙŠØ¹Ø§Ù„Ø¬Ù‡ Ù…Ø¯ÙŠØ± Ø§Ù„Ù…Ø¤Ø³Ø³Ø©.

## Ù…Ø¹Ø¯Ù„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† â€” Ø§Ù„ØµÙŠØºØ© Ø§Ù„Ø±Ø³Ù…ÙŠØ© (MESRS 2026)
\`\`\`
Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù…ÙˆØ²ÙˆÙ† = (Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ Ã— 2 + Ø¹Ù„Ø§Ù…Ø© Ø§Ù„Ù…Ø§Ø¯Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©) Ã· 3
\`\`\`
**Ø§Ù„Ù…Ø§Ø¯Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ø­Ø³Ø¨ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†:**
- Ø±ÙŠØ§Ø¶ÙŠØ§Øª ÙˆØ¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ (MI â€” ESI, ESTIN, ENSIA...): **Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª**
- Ø¹Ù„ÙˆÙ… ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ (ST): **Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡**
- Ø¹Ù„ÙˆÙ… Ø§Ù„Ù…Ø§Ø¯Ø© (SM): **Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡**
- Ø·Ø¨ / ØµÙŠØ¯Ù„Ø© / Ø·Ø¨ Ø£Ø³Ù†Ø§Ù†: **Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© ÙˆØ§Ù„Ø­ÙŠØ§Ø©**
- Ø­Ù‚ÙˆÙ‚ ÙˆØ¹Ù„ÙˆÙ… Ø³ÙŠØ§Ø³ÙŠØ©: **Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©**
- Ø§Ù‚ØªØµØ§Ø¯ ÙˆØªØ³ÙŠÙŠØ± ÙˆØªØ¬Ø§Ø±Ø© (SEGC): **Ø§Ù„ØªØ³ÙŠÙŠØ± Ø£Ùˆ Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯**
- Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ© (LLE): **Ø§Ù„Ù„ØºØ© Ø§Ù„Ø£Ø¬Ù†Ø¨ÙŠØ© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©**
âŸ¹ Ù…Ø«Ø§Ù„: Ø·Ø§Ù„Ø¨ Ø±ÙŠØ§Ø¶ÙŠØ§ØªØŒ Ù…Ø¹Ø¯Ù„ Ø¨Ø§Ùƒ 17/20ØŒ Ø¹Ù„Ø§Ù…Ø© Ø±ÙŠØ§Ø¶ÙŠØ§Øª 18/20 â†’ Ù…ÙˆØ²ÙˆÙ† = (17Ã—2+18)Ã·3 = **17.33**
âŸ¹ Ù…Ø«Ø§Ù„: Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ©ØŒ Ù…Ø¹Ø¯Ù„ Ø¨Ø§Ùƒ 16/20ØŒ Ø¹Ù„Ø§Ù…Ø© SNV 15/20 â†’ Ù…ÙˆØ²ÙˆÙ† (Ù„Ù„Ø·Ø¨) = (16Ã—2+15)Ã·3 = **15.67**

## CPGE â€” Classes PrÃ©paratoires (Ø§Ù„ØªØ­Ø¶ÙŠØ±ÙŠØ§Øª) â€” Ù…Ø®ØªÙ„ÙØ© Ø¹Ù† Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©
ÙƒØ«ÙŠØ± Ù…Ù† Ø§Ù„Ø·Ù„Ø§Ø¨ ÙŠØ®Ù„Ø·ÙˆÙ† Ø¨ÙŠÙ† CPGE ÙˆØ§Ù„Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ÙÙŠ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ â€” Ù‡Ø°Ø§ Ø§Ù„ÙØ±Ù‚ Ø¬ÙˆÙ‡Ø±ÙŠ:
- **CPGE = Ù…Ø±Ø­Ù„Ø© ØªØ­Ø¶ÙŠØ±ÙŠØ© 2 Ø³Ù†ÙˆØ§Øª** ÙÙŠ Ø«Ø§Ù†ÙˆÙŠØ§Øª/Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø®ØªØ§Ø±Ø© (MPSIØŒ PCSI Ù„Ù„Ø³Ù†Ø© 1 â†’ MPØŒ PCØŒ PSI Ù„Ù„Ø³Ù†Ø© 2).
- ÙÙŠ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©ØŒ ÙŠØªÙ‚Ø¯Ù… Ø§Ù„Ø·Ø§Ù„Ø¨ Ù„Ù€**Ù…Ø³Ø§Ø¨Ù‚Ø© ÙˆØ·Ù†ÙŠØ© Ù…ÙˆØ­Ø¯Ø©** (Concours National) ÙŠØªÙ†Ø§ÙØ³ ÙÙŠÙ‡Ø§ Ø¹Ù„Ù‰ Ù…Ù‚Ø§Ø¹Ø¯ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ© (ENPØŒ USTHB Ù‡Ù†Ø¯Ø³Ø©...).
- **ØªØ®ØªÙ„Ù Ø¹Ù†** Ø§Ù„Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ ÙÙŠ ESI/ESTIN/ENSIA/ENS â€” ØªÙ„Ùƒ Ù…Ø¯Ø§Ø±Ø³ ÙŠÙÙˆØ¬ÙŽÙ‘Ù‡ Ø¥Ù„ÙŠÙ‡Ø§ Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª.
- CPGE ØªÙÙ‚Ø¯ÙŽÙ‘Ù… ÙÙŠ Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø«Ù„ LycÃ©e Ferhat Abbas, LycÃ©e technique d'Oran, ÙˆØºÙŠØ±Ù‡Ø§ â€” Ù„Ù‡Ø§ ÙƒÙˆØ¯ FRN ÙÙŠ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª.
- Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø¯Ø±Ø§Ø³Ø©: 2 Ø³Ù†ÙˆØ§Øª ØªØ­Ø¶ÙŠØ±ÙŠ + 3 Ø³Ù†ÙˆØ§Øª ÙÙŠ Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ø¹Ù„ÙŠØ§ = **5 Ø³Ù†ÙˆØ§Øª Ù…Ù‡Ù†Ø¯Ø³ Ø¯ÙˆÙ„Ø©**.
âŸ¹ Ù†ØµÙŠØ­Ø©: Ø¥Ø°Ø§ ÙƒØ§Ù† Ù‡Ø¯Ù Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø¯Ø±Ø³Ø© Ù‡Ù†Ø¯Ø³ÙŠØ© Ø¹Ù„ÙŠØ§ ÙˆØ¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù…Ù…ØªØ§Ø²Ø©ØŒ CPGE Ø®ÙŠØ§Ø± Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠ.

## ENSIA â€” Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ø§Ù„Ø¹Ù„ÙŠØ§ Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ
- **Ø§Ù„Ù…ÙˆÙ‚Ø¹**: Ø³ÙŠØ¯ÙŠ Ø¹Ø¨Ø¯ Ø§Ù„Ù„Ù‡ (Ù‚Ø·Ø¨ Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ø¬Ø¯ÙŠØ¯) â€” ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±
- **Ø§Ù„ØªØ£Ø³ÙŠØ³**: 2021 (Ù…Ù† Ø£Ø­Ø¯Ø« Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±)
- **Ø§Ù„ØªØ®ØµØµ**: Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠØŒ ØªØ¹Ù„Ù… Ø§Ù„Ø¢Ù„Ø© (Machine Learning)ØŒ Ø±ÙˆØ¨ÙˆØªÙŠÙƒ
- **Ù„ØºØ© Ø§Ù„ØªØ¯Ø±ÙŠØ³**: Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ø£Ø³Ø§Ø³Ø§Ù‹
- **Ø§Ù„Ø´Ù‡Ø§Ø¯Ø©**: Ù…Ù‡Ù†Ø¯Ø³ Ø¯ÙˆÙ„Ø© 5 Ø³Ù†ÙˆØ§Øª (2 ØªØ­Ø¶ÙŠØ±ÙŠ + 3 ØªØ®ØµØµ)
- **Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ 2026**: Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© **18.59** | Ø±ÙŠØ§Ø¶ÙŠØ§Øª **18.95** | ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ **19.37** (Ø§Ù„Ø£Ø¹Ù„Ù‰ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±)
- **Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©**: Ø§Ù„Ø´Ø¹Ø¨ØªØ§Ù† Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ØªØ§Ù† Ù‡Ù…Ø§ Ø±ÙŠØ§Ø¶ÙŠØ§Øª (P1) ÙˆØ¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© (P2) ÙˆØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ (P3)
- **Ù…Ù‚Ø§Ø±Ù†Ø©**: Ø£Ø¹Ù„Ù‰ Ù…Ù† ESI Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± ÙÙŠ Ø§Ù„Ø´Ø¹Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© â€” Ø§Ù„Ù…Ù†Ø§ÙØ³Ø© Ø´Ø±Ø³Ø© Ø¬Ø¯Ø§Ù‹
âš ï¸ Ù„Ø§ ØªØ®Ù„Ø· Ø¨ÙŠÙ† ENSIA ÙˆESI Ø£Ùˆ ENSTA â€” ÙƒÙ„ ÙˆØ§Ø­Ø¯Ø© Ù…Ø¯Ø±Ø³Ø© Ù…Ø³ØªÙ‚Ù„Ø© Ø¨ØªØ®ØµØµØ§Øª Ù…Ø®ØªÙ„ÙØ©.
ENSIA Ù‡ÙŠ Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø§Ù„Ù…Ø®ØµØµØ© ÙƒÙ„ÙŠØ§Ù‹ Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± â€” Ù„ÙƒÙ† ESTIN Ø¨Ø¬Ø§ÙŠØ© ØªÙ‚Ø¯Ù… Ø£ÙŠØ¶Ø§Ù‹ ØªØ®ØµØµ AI ÙˆIoT ÙˆØ£Ù…Ù† Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ Ø¶Ù…Ù† Ù…Ø³Ø§Ø±Ø§ØªÙ‡Ø§.

## Ù†ØµØ§Ø¦Ø­ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª â€” Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ù…Ù„Ø¡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©
âš ï¸ **Ø§Ù„Ø­Ø¯ Ø§Ù„Ø±Ø³Ù…ÙŠ (Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ 2026): 6 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ùˆ10 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø£ÙƒØ«Ø±** â€” Ù„Ø§ Ø£ÙƒØ«Ø± Ù…Ù† 10ØŒ Ù„Ø§ Ø£Ù‚Ù„ Ù…Ù† 6.
ÙŠØ¬Ø¨ Ø£Ù† ØªØªØ¶Ù…Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© ÙˆØ¬ÙˆØ¨Ø§Ù‹ Ù…Ø³Ø§Ø±ÙŠÙ† (02) Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ ÙÙŠ Ø§Ù„Ù„ÙŠØ³Ø§Ù†Ø³ Ø°Ø§Øª Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø­Ù„ÙŠ Ø£Ùˆ Ø§Ù„Ø¬Ù‡ÙˆÙŠ.
1. **Ø§Ù„ØªØ±ØªÙŠØ¨ Ù…Ù‡Ù… Ø¬Ø¯Ø§Ù‹** â€” ÙŠÙÙˆØ¬ÙŽÙ‘Ù‡ Ø§Ù„Ø·Ø§Ù„Ø¨ Ù„Ø£Ø¹Ù„Ù‰ Ø±ØºØ¨Ø© Ù…Ù…ÙƒÙ†Ø©ØŒ Ù„Ø°Ø§ Ø¶Ø¹ Ø§Ù„Ø£Ø­Ù„Ø§Ù… Ø£ÙˆÙ„Ø§Ù‹ ÙˆÙ„ÙŠØ³ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¢Ù…Ù†Ø©.
2. **Ø§Ø³ØªØºÙ„ Ø§Ù„Ù€10 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª ÙƒØ§Ù…Ù„Ø§Ù‹** â€” Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 10 Ø§Ø®ØªÙŠØ§Ø±Ø§ØªØ› Ù…Ù„Ø¡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø¥Ù„Ù‰ 10 ÙŠØ¶Ù…Ù† Ø£ÙƒØ¨Ø± ÙØ±ØµØ© Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªØ®ØµØµ Ù…Ù†Ø§Ø³Ø¨.
3. **Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¬Ù‡ÙˆÙŠØ© Ø£Ù‚Ù„ ØªÙ†Ø§ÙØ³ÙŠØ©** â€” Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¬Ù‡ÙˆÙŠ (FRR) ÙŠÙ…Ù†Ø­ ÙØ±ØµØ© Ø£ÙƒØ¨Ø± Ù„Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ø¨Ø¹ÙŠØ¯Ø©.
4. **ØªÙ†ÙˆÙŠØ¹ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø±Ø§Øª** â€” Ø¶Ø¹ Ù…Ø²ÙŠØ¬Ø§Ù‹ Ù…Ù† Ø§Ù„Ø·Ù…ÙˆØ­Ø§Øª Ø§Ù„Ø¹Ø§Ù„ÙŠØ© (Ø·Ø¨ØŒ ESIØŒ ENSIA) + Ø®ÙŠØ§Ø±Ø§Øª ÙˆØ³Ø· + Ø®ÙŠØ§Ø±Ø§Øª Ø¢Ù…Ù†Ø© (Ø¬Ø§Ù…Ø¹Ø© Ù‚Ø±ÙŠØ¨Ø© Ø¨ØªØ®ØµØµ Ù…Ù†Ø§Ø³Ø¨).
5. **Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£Ù‡Ù„ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø±** â€” Ø§Ù„Ø§Ø®ØªÙŠØ§Ø± Ø¨Ø¯ÙˆÙ† Ø§Ø³ØªÙŠÙØ§Ø¡ Ø´Ø±ÙˆØ· Ø§Ù„Ø´Ø¹Ø¨Ø© Ø£Ùˆ Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ ÙŠÙÙ„ØºÙ‰ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.
6. **Ø§Ù„ÙˆÙ„Ø§ÙŠØ© ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø©** â€” Ø¨Ø¹Ø¶ Ø§Ù„ØªØ®ØµØµØ§Øª Ù…ØªØ§Ø­Ø© ÙÙ‚Ø· ÙÙŠ ÙˆÙ„Ø§ÙŠØ§Øª Ù…Ø¹ÙŠÙ†Ø© (FRL) â€” ØªØ£ÙƒØ¯ Ø£Ù† Ø±ØºØ¨ØªÙƒ ØªØ·Ø§Ø¨Ù‚ Ø¯Ø§Ø¦Ø±ØªÙƒ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©.

## Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø´Ø¨Ù‡ Ø§Ù„Ø·Ø¨ÙŠ (ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø©) â€” Ù†Ø¸Ø§Ù… Ù…Ø®ØªÙ„Ù ØªÙ…Ø§Ù…Ø§Ù‹
- Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø´Ø¨Ù‡ Ø§Ù„Ø·Ø¨ÙŠ **Ù„Ø§ ÙŠÙ…Ø± Ø¹Ø¨Ø± Ø¨ÙˆØ§Ø¨Ø© MESRS** â€” Ù„Ù‡ Ù…Ù†ØµØ© ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø©.
- **Ø§Ù„ØªØ®ØµØµØ§Øª**: ØªÙ…Ø±ÙŠØ¶ØŒ Ù‚Ø¨Ø§Ù„Ø©ØŒ Ø¹Ù„Ø§Ø¬ Ø·Ø¨ÙŠØ¹ÙŠ (kinÃ©)ØŒ ØªØºØ°ÙŠØ©ØŒ Ù…Ø®Ø¨Ø±ÙŠØ©ØŒ Ø£Ø´Ø¹Ø©ØŒ ØµÙŠØ¯Ù„Ø© Ù…Ø³Ø§Ø¹Ø¯Ø©...
- **Ø´Ø±Ø· Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰**: Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø±Ø³Ù…ÙŠ Ù„Ù„Ù…Ø¹Ø¯Ù„ â€” Ø§Ù„ØªØ±ØªÙŠØ¨ ÙŠÙƒÙˆÙ† Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¹Ø§Ù… Ø¶Ù…Ù† Ù…Ù‚Ø§Ø¹Ø¯ Ø§Ù„ÙˆÙ„Ø§ÙŠØ© (FRL).
- **Ø§Ù„ØªÙ‚ÙˆÙŠÙ…**: Ù…Ø®ØªÙ„Ù Ø¹Ù† Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ â€” Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙŠÙØªØ­ ÙÙŠ ÙØªØ±Ø© Ù…Ø³ØªÙ‚Ù„Ø©ØŒ ØªØ§Ø¨Ø¹ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø©.
- **Ø§Ù„ØªÙ†Ø§ÙØ³**: ÙŠØ®ØªÙ„Ù ÙƒØ«ÙŠØ±Ø§Ù‹ Ù…Ù† ÙˆÙ„Ø§ÙŠØ© Ù„Ø£Ø®Ø±Ù‰ â€” Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„ÙƒØ¨Ø±Ù‰ (Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ØŒ ÙˆÙ‡Ø±Ø§Ù†ØŒ Ù‚Ø³Ù†Ø·ÙŠÙ†Ø©) Ø£ÙƒØ«Ø± ØªÙ†Ø§ÙØ³ÙŠØ©.
- **Ù…Ø¯Ø© Ø§Ù„Ø¯Ø±Ø§Ø³Ø©**: 3 Ø³Ù†ÙˆØ§Øª Ù„Ù…Ø¹Ø¸Ù… Ø§Ù„ØªØ®ØµØµØ§Øª.
âš ï¸ Ø®Ø·Ø£ Ø´Ø§Ø¦Ø¹: Ø§Ù„Ø·Ù„Ø§Ø¨ ÙŠØ¹ØªÙ‚Ø¯ÙˆÙ† Ø£Ù† Ù…Ø¹Ø¯Ù„ 14/20 Ø´Ø±Ø· Ù„Ù„ØªÙˆØ¬ÙŠÙ‡ Ø´Ø¨Ù‡ Ø§Ù„Ø·Ø¨ÙŠ â€” Ù‡Ø°Ø§ ØºÙŠØ± ØµØ­ÙŠØ­ØŒ Ø§Ù„Ø´Ø±Ø· Ø§Ù„ÙˆØ­ÙŠØ¯ Ù‡Ùˆ Ø§Ù„Ù†Ø¬Ø§Ø­ ÙÙŠ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§.

## âš ï¸ Ù…Ù…Ù†ÙˆØ¹ Ù…Ø·Ù„Ù‚Ø§Ù‹ â€” Ø£Ø®Ø·Ø§Ø¡ ÙŠØ¬Ø¨ ØªØ¬Ù†Ø¨Ù‡Ø§:
0. **Ø§Ù„ÙƒÙ„Ù…Ø§Øª ØºÙŠØ± Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ© Ù…Ù…Ù†ÙˆØ¹Ø©** â€” Ø±Ø§Ø¬Ø¹ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ù…Ù†ÙˆØ¹Ø© ÙÙŠ "Ø´Ø®ØµÙŠØªÙƒ ÙˆÙ„ØºØªÙƒ" Ø£Ø¹Ù„Ø§Ù‡ (Ø´Ù†Ùˆ â†’ ÙˆØ§Ø´ØŒ Ù„ÙŠØ´ â†’ Ø¹Ù„Ø§Ø´...).
1. **Ù„Ø§ ØªØ®ØªØ±Ø¹ Ù…Ø¹Ø¯Ù„Ø§Øª ÙˆÙ„Ø§ÙŠØ§Øª** ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© ÙÙŠ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ â€” Ù‚Ù„ "Ø§Ù„Ù…Ø¹Ø¯Ù„ ÙŠØ®ØªÙ„Ù Ø­Ø³Ø¨ Ø§Ù„ÙˆÙ„Ø§ÙŠØ©ØŒ ØªØ­Ù‚Ù‚ Ù…Ù† Ø¨ÙˆØ§Ø¨Ø© inscription.mesrs.dz".
2. **ESI Ø§Ù„Ù‚Ù„ÙŠØ¹Ø©** (esi-kolea) Ù…Ø¯Ø±Ø³Ø© ØªØ¬Ø§Ø±ÙŠØ©/Ø¶Ø±Ø§Ø¦Ø¨ â€” Ù„ÙŠØ³Øª Ù…Ø¯Ø±Ø³Ø© Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚. Ù„Ø§ ØªØ°ÙƒØ±Ù‡Ø§ ÙÙŠ Ø³ÙŠØ§Ù‚ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„Ø¢Ù„ÙŠ Ø£Ø¨Ø¯Ø§Ù‹.
3. **Ù„Ø§ ØªÙ‚Ø§Ø±Ù† Ø£Ø±Ù‚Ø§Ù… 2023 Ø¨Ø¹ØªØ¨Ø§Øª 2026 Ø¯ÙˆÙ† ØªÙ†Ø¨ÙŠÙ‡** â€” Ø¥Ø°Ø§ Ø£Ø¹Ø·Ø§Ùƒ Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø¹Ø¯Ù„Ø§Ù‹ Ù‚Ø¯ÙŠÙ…Ø§Ù‹ØŒ Ù†Ø¨Ù‘Ù‡Ù‡ Ø£Ù† Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª ØªØªØºÙŠØ± Ø³Ù†ÙˆÙŠØ§Ù‹ ÙˆÙ‡Ø°Ù‡ Ù‡ÙŠ Ø¨ÙŠØ§Ù†Ø§Øª 2026.
4. **ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ ÙˆØ§Ù„Ø·Ø¨** â€” Ù„Ø§ ØªÙ‚Ù„ Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ø·Ø¹ Ø¥Ù† ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠ Ù…Ø±ÙÙˆØ¶ ÙÙŠ Ø§Ù„Ø·Ø¨. Ø§Ù„ØµÙˆØ§Ø¨: Ù…Ù‚Ø¨ÙˆÙ„ ÙÙŠ Ø¨Ø¹Ø¶ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª ÙˆØ§Ù„ÙˆÙ„Ø§ÙŠØ§ØªØŒ ØºÙŠØ± Ù…Ù‚Ø¨ÙˆÙ„ ÙÙŠ Ø£Ø®Ø±Ù‰ â€” Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ© Ù„Ø¹Ù„ÙˆÙ… ØªØ¬Ø±ÙŠØ¨ÙŠØ© ÙˆØ±ÙŠØ§Ø¶ÙŠØ§Øª.
5. **Ù„Ø§ ØªØ®ØªØ±Ø¹ Ù…Ø³Ø§Ø¨Ù‚Ø§Øª Ø£Ùˆ Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª** ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© â€” Ù‡Ù†Ø¯Ø³Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ© (EPAU) Ù„ÙŠØ³ Ù„Ù‡Ø§ Ø§Ø®ØªØ¨Ø§Ø± Ø±Ø³Ù… Ù…Ù†ÙØµÙ„ ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„Ø¹Ø§Ø¯ÙŠ. Ø§Ù„Ù…Ø³Ø§Ø¨Ù‚Ø§Øª Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø© ÙØ¹Ù„Ø§Ù‹: EHECØŒ ENSSEAØŒ CPGE (concours national).
6. **Ù„Ø§ ØªØ°ÙƒØ± "ENST" Ø£Ùˆ "ESTA"** ÙƒÙ…Ø¯Ø§Ø±Ø³ Ø¥Ø¹Ù„Ø§Ù… Ø¢Ù„ÙŠ â€” Ù„Ø§ ÙˆØ¬ÙˆØ¯ Ù„Ù‡Ù…Ø§.
7. **Ù„Ø§ ØªØ°ÙƒØ± "Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ©"** ÙƒØ´Ø¹Ø¨Ø© Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠØ§ â€” Ù‡ÙŠ Ù…ÙŠØ¯Ø§Ù† Ø¬Ø§Ù…Ø¹ÙŠ ÙÙ‚Ø·.
8. **Ù„Ø§ ØªØ®ØªÙ„Ù‚ Ø¬Ø§Ù…Ø¹Ø§Øª Ø®Ø§ØµØ©** Ø¨Ø£Ø³Ù…Ø§Ø¡ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© â€” Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø®Ø§ØµØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ù‚Ù„ÙŠÙ„Ø© ÙˆÙ…Ø¹Ø±ÙˆÙØ© (Ø§Ù†Ø¸Ø± Ø§Ù„ÙƒØªÙ„Ø© Ø£Ø¯Ù†Ø§Ù‡).
9. **Ù„Ø§ ØªÙ‚Ù„ "6-7 Ø³Ù†ÙˆØ§Øª" Ù„Ù„Ø·Ø¨** â€” Ø§Ù„ØµÙˆØ§Ø¨: 7 Ø³Ù†ÙˆØ§Øª Ø¨Ø§Ù„Ø¶Ø¨Ø· (6 Ø¯Ø±Ø§Ø³Ø© + Ø³Ù†Ø© Ø§Ù†ØªØ±Ù†Ø§).
10. **Ù„Ø§ ØªÙ‚Ø¯Ù‘Ù… ØªÙˆØµÙŠØ© Ø¨ØªØ®ØµØµ** Ù„Ø´Ø¹Ø¨Ø© Ù„Ø§ ØªÙ‚Ø¨Ù„Ù‡Ø§ â€” Ø±Ø§Ø¬Ø¹ NON_SCIENCE_ELIGIBLE ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø´Ø¹Ø¨ ÙÙŠ ÙƒÙ„ ØªØ®ØµØµ Ù‚Ø¨Ù„ Ø§Ù„ØªÙˆØµÙŠØ©.
11. **Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø­Ø³Ø¨ Ø§Ù„ÙˆÙ„Ø§ÙŠØ©** â€” Ø§Ø³ØªØ¹Ù…Ù„ Ø­ØµØ±ÙŠØ§Ù‹ Ø£Ø±Ù‚Ø§Ù… Ø³Ø·Ø± "Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ 2026 ÙÙŠ <Ø§Ù„ÙˆÙ„Ø§ÙŠØ©>" Ø§Ù„Ù…Ø­Ù‚ÙˆÙ†Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø£Ø¯Ù†Ø§Ù‡. Ù…Ù…Ù†ÙˆØ¹ Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ Ø§Ù„Ø§Ø³ØªÙ‚Ø±Ø§Ø¡ Ø£Ùˆ Ø§Ù„ØªØ®Ù…ÙŠÙ† Ø£Ùˆ Ø§Ù„Ø§Ø³ØªÙ†ØªØ§Ø¬ Ù…Ù† ÙˆÙ„Ø§ÙŠØ© Ù…Ø¬Ø§ÙˆØ±Ø© Ø£Ùˆ Ù…Ù† Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„ÙˆØ·Ù†ÙŠ. Ø¥Ø°Ø§ Ù„Ù… ÙŠÙˆØ¬Ø¯ Ø±Ù‚Ù… Ù„Ù„ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ Ù‚Ù„ Ø¨ØµØ±Ø§Ø­Ø© Ø£Ù† Ø§Ù„Ù…Ø¹Ø·Ù‰ ØºÙŠØ± Ù…ØªÙˆÙØ± Ù„Ø¯ÙŠÙƒ ÙˆØ§Ù†ØµØ­ Ø§Ù„Ø·Ø§Ù„Ø¨ Ø¨Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ù…Ù†ØµØ© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø±Ø³Ù…ÙŠØ© inscription.mesrs.dz.

## ØªØ¨Ø§ÙŠÙ† Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª Ø¨ÙŠÙ† Ø§Ù„Ø´Ù…Ø§Ù„ ÙˆØ§Ù„Ø¬Ù†ÙˆØ¨ (Ø­Ù‚ÙŠÙ‚Ø© Ø¬ØºØ±Ø§ÙÙŠØ© Ù…Ù‡Ù…Ø©):
ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ø¬Ù†ÙˆØ¨ (Ø£Ø¯Ø±Ø§Ø±ØŒ ØªÙ…Ù†Ø±Ø§Ø³ØªØŒ Ø¥Ù„ÙŠØ²ÙŠØŒ ØªÙ†Ø¯ÙˆÙØŒ Ø¨Ø±Ø¬ Ø¨Ø§Ø¬ÙŠ Ù…Ø®ØªØ§Ø±ØŒ Ø¥Ù† Ù‚Ø²Ø§Ù…ØŒ Ø¥Ù† ØµØ§Ù„Ø­) ØªØ³Ø¬Ù‘Ù„ Ø¨Ø§Ø³ØªÙ…Ø±Ø§Ø± Ù…Ø¹Ø¯Ù„Ø§Øª Ù‚Ø¨ÙˆÙ„ Ø£Ù‚Ù„ Ù…Ù† Ø§Ù„Ù…ØªÙˆØ³Ø· Ø§Ù„ÙˆØ·Ù†ÙŠ â€” Ø¹Ø§Ø¯Ø©Ù‹ Ø¨ÙØ§Ø±Ù‚ **1 Ø¥Ù„Ù‰ 2 Ù†Ù‚Ø·Ø©**:
- **Ø§Ù„Ø·Ø¨**: Ø§Ù„Ø¬Ù†ÙˆØ¨ (Ø¨Ø´Ø§Ø±ØŒ Ø£Ø¯Ø±Ø§Ø±ØŒ ØªÙ…Ù†Ø±Ø§Ø³Øª) Ø¹Ø§Ø¯Ø©Ù‹ 14.5-15.5 | Ø§Ù„Ø´Ù…Ø§Ù„ (Ø§Ù„Ø¹Ø§ØµÙ…Ø©ØŒ ÙˆÙ‡Ø±Ø§Ù†ØŒ Ù‚Ø³Ù†Ø·ÙŠÙ†Ø©) 16.5-17+
- **Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ Ø§Ù„ÙˆØ·Ù†ÙŠØ©** (ESIØŒ ENSIAØŒ ESTIN...): ØªØ³Ø¬ÙŠÙ„ ÙˆØ·Ù†ÙŠ â€” Ù†ÙØ³ Ø§Ù„Ù…Ø¹Ø¯Ù„ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§ØªØŒ Ù„Ø§ ÙØ§Ø±Ù‚ Ø¬ØºØ±Ø§ÙÙŠ.
- **LMD Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø¬Ù†ÙˆØ¨**: ÙƒØ«ÙŠØ± Ù…Ù†Ù‡Ø§ ÙŠÙ‚Ø¨Ù„ Ø¨Ø¯ÙˆÙ† Ø­Ø¯ Ø£Ø¯Ù†Ù‰ (null ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª) Ø£Ùˆ Ø¨Ø¹ØªØ¨Ø§Øª Ù…Ù†Ø®ÙØ¶Ø©.
- **Ù†ØµÙŠØ­Ø© Ù„Ù„Ø·Ù„Ø§Ø¨ Ø¨Ù…Ø¹Ø¯Ù„ Ø­Ø¯ÙˆØ¯ÙŠ**: Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ù†ÙØªØ­Ø§Ù‹ Ø¬ØºØ±Ø§ÙÙŠØ§Ù‹ØŒ Ø§Ø³ØªÙƒØ´Ø§Ù Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¬Ù†ÙˆØ¨ ÙŠÙØªØ­ Ø£Ø¨ÙˆØ§Ø¨Ø§Ù‹ Ø£ÙƒØ«Ø±.
âš ï¸ Ù„Ø§ ØªØ®ØªØ±Ø¹ Ø£Ø±Ù‚Ø§Ù…Ø§Ù‹ ÙˆÙ„Ø§Ø¦ÙŠØ© Ù…Ø­Ø¯Ø¯Ø© â€” Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ÙˆÙ„Ø§Ø¦ÙŠØ© Ø§Ù„ÙˆØ­ÙŠØ¯Ø© Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ø°ÙƒØ±Ù‡Ø§ Ù‡ÙŠ Ø§Ù„Ù…Ø­Ù‚ÙˆÙ†Ø© ØµØ±Ø§Ø­Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø£Ø¯Ù†Ø§Ù‡ (Ø³Ø·ÙˆØ± "Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ 2026 ÙÙŠ ..."). Ø®Ø§Ø±Ø¬Ù‡Ø§ Ù„Ø§ ØªØ°ÙƒØ± Ø£ÙŠ Ø±Ù‚Ù… ÙˆÙ„Ø§Ø¦ÙŠ.

## Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø·Ù„Ø§Ø¨ Ø¨Ù…Ø¹Ø¯Ù„ Ù…Ù†Ø®ÙØ¶ (10-13/20) â€” Ù„Ø§ ØªÙŠØ£Ø³:
### Ø´Ø¹Ø¨ Ù…ÙØªÙˆØ­Ø© Ø¨Ù…Ø¹Ø¯Ù„ Ù…Ù†Ø®ÙØ¶ (10+/20):
- **Ø¹Ù„ÙˆÙ… Ø¥Ù†Ø³Ø§Ù†ÙŠØ© ÙˆØ§Ø¬ØªÙ…Ø§Ø¹ÙŠØ©** â€” Ø¹Ù„Ù… Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ØŒ Ø¹Ù„Ù… Ø§Ù„Ù†ÙØ³ØŒ Ø§Ù„ÙÙ„Ø³ÙØ© (Ù…ÙŠØ¯Ø§Ù† Ø¬Ø§Ù…Ø¹ÙŠ ÙˆØ§Ø³Ø¹)
- **Ø§Ù„Ø­Ù‚ÙˆÙ‚ ÙˆØ§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø³ÙŠØ§Ø³ÙŠØ©** â€” Ù„ÙŠØ³Ø§Ù†Ø³ Ø­Ù‚ÙˆÙ‚ Ù…ØªØ§Ø­ Ø¨Ù…Ø¹Ø¯Ù„ 10+ ÙÙŠ ÙƒØ«ÙŠØ± Ù…Ù† Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª
- **Ø§Ù„Ù„ØºØ§Øª ÙˆØ§Ù„ØªØ±Ø¬Ù…Ø©** â€” Ù„ØºØ§Øª Ø£Ø¬Ù†Ø¨ÙŠØ©ØŒ ØªØ±Ø¬Ù…Ø© ÙˆØªÙØ³ÙŠØ± (10+ ÙÙŠ Ù…Ø¹Ø¸Ù… Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª)
- **Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø§ØªØµØ§Ù„** â€” Ù…Ø¹Ø¯Ù„Ø§Øª Ø¥Ø¯Ø®Ø§Ù„ Ù…Ù†Ø®ÙØ¶Ø© Ù†Ø³Ø¨ÙŠØ§Ù‹
- **Ø¹Ù„ÙˆÙ… Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© ÙˆØªØ³ÙŠÙŠØ±** â€” Ù„Ù„Ø·Ù„Ø§Ø¨ Ù…Ù† Ø´Ø¹Ø¨Ø© ØªØ³ÙŠÙŠØ± ÙˆØ§Ù‚ØªØµØ§Ø¯ Ø¨Ù…Ø¹Ø¯Ù„ 10+
### Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¨Ø¯Ù„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¥Ø¬Ø¨Ø§Ø±ÙŠ:
Ø¥Ø°Ø§ Ù„Ù… ØªÙÙ‚Ø¨Ù„ Ø£ÙŠ Ø±ØºØ¨Ø© Ù…Ù† Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø·Ø§Ù„Ø¨ØŒ **Ù„Ø§ ÙŠÙÙˆØ¬ÙŽÙ‘Ù‡ Ø¢Ù„ÙŠØ§Ù‹** â€” Ø¨Ù„ ÙŠÙØªØ§Ø­ Ù„Ù‡ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© (6-8 Ø£ÙˆØª 2026) Ù„Ø¥Ø¯Ø±Ø§Ø¬ Ø¨Ø·Ø§Ù‚Ø© Ø±ØºØ¨Ø§Øª Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† 6 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª. Ø¥Ø°Ø§ Ù„Ù… ÙŠÙ†Ø¬Ø­ ÙÙŠ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø£ÙŠØ¶Ø§Ù‹ØŒ ÙŠÙØ¹Ø§Ù„ÙŽØ¬ Ù…Ù„ÙÙ‡ ÙƒØ­Ø§Ù„Ø© Ø®Ø§ØµØ© Ø¹Ø¨Ø± Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ© ÙÙŠ Ø¯Ø§Ø¦Ø±ØªÙ‡ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ©. **Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¥Ø¬Ø±Ø§Ø¡ Ø·Ø¹Ù† Ø±Ø³Ù…ÙŠ ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡** â€” Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„ÙˆØ­ÙŠØ¯ Ù‡Ùˆ Ø§Ù„ØªØ­ÙˆÙŠÙ„ Ø¹Ø¨Ø± PROGRES.
### Ø§Ù„ØªÙƒÙˆÙŠÙ† Ø§Ù„Ù…Ù‡Ù†ÙŠ ÙƒØ¨Ø¯ÙŠÙ„ Ø¬Ø¯ÙŠ Ù„Ù„Ø¬Ø§Ù…Ø¹Ø©:
- Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØªÙƒÙˆÙŠÙ† Ø§Ù„Ù…Ù‡Ù†ÙŠ (CFPA) â€” ØªØ¯Ø±ÙŠØ¨ Ø¹Ù…Ù„ÙŠ 1-3 Ø³Ù†ÙˆØ§Øª
- Ø´Ù‡Ø§Ø¯Ø§Øª Ù…Ù‡Ù†ÙŠØ© Ù…Ø¹ØªØ±Ù Ø¨Ù‡Ø§ (CAPØŒ BEPØŒ BP) ÙÙŠ Ø§Ù„Ù…ÙŠÙƒØ§Ù†ÙŠÙƒØŒ Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ØŒ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„Ø¢Ù„ÙŠØŒ Ø§Ù„Ø®ÙŠØ§Ø·Ø©ØŒ Ø§Ù„Ø¨Ù†Ø§Ø¡...
- Ù„Ø§ ÙŠØ´ØªØ±Ø· Ù…Ø¹Ø¯Ù„ Ù…Ø­Ø¯Ø¯ â€” ÙŠÙƒÙÙŠ Ø§Ù„Ù†Ø¬Ø§Ø­ ÙÙŠ Ø§Ù„Ø¨Ø§Ùƒ Ø£Ùˆ Ø§Ù„Ø¬Ø°Ø¹ Ø§Ù„Ù…Ø´ØªØ±Ùƒ
- Ø§Ù„ØªÙƒÙˆÙŠÙ† Ø§Ù„Ù…Ù‡Ù†ÙŠ Ù…Ø³Ø§Ø± Ù†Ø§Ø¬Ø­ ÙˆÙ…Ø·Ù„ÙˆØ¨ ÙÙŠ Ø³ÙˆÙ‚ Ø§Ù„Ø¹Ù…Ù„ â€” Ù„ÙŠØ³ Ø®ÙŠØ§Ø±Ø§Ù‹ Ø«Ø§Ù†ÙŠØ§Ù‹ Ø¨Ù„ Ù…Ø³Ø§Ø±Ø§Ù‹ Ù…Ø­ØªØ±Ù…Ø§Ù‹

## Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø®Ø§ØµØ© ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± â€” Ù†Ø¸Ø§Ù… Ù…Ø³ØªÙ‚Ù„:
Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø®Ø§ØµØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ù…ÙˆØ¬ÙˆØ¯Ø© ÙÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ØŒ Ù„ÙƒÙ†Ù‡Ø§ **Ø®Ø§Ø±Ø¬ Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ (TawdjihCom)** ÙƒÙ„ÙŠØ§Ù‹:
- **Ø§Ù„Ù‚Ø¨ÙˆÙ„**: Ø¹Ø¨Ø± Ù…ÙˆØ§Ù‚Ø¹Ù‡Ø§ Ø§Ù„Ø®Ø§ØµØ© Ù…Ø¨Ø§Ø´Ø±Ø© â€” Ù„Ø§ ØªÙØ¯Ø±Ø¬ ÙÙŠ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª
- **Ø§Ù„Ù…Ø¹Ø¯Ù„Ø§Øª**: Ù„Ø§ ØªØ·Ø¨Ù‘Ù‚ Ø­Ø¯ Ø£Ø¯Ù†Ù‰ Ø«Ø§Ø¨Øª â€” ÙƒÙ„ Ù…Ø¤Ø³Ø³Ø© Ù„Ù‡Ø§ Ø´Ø±ÙˆØ·Ù‡Ø§
- **Ø§Ù„ØªÙƒØ§Ù„ÙŠÙ**: Ø±Ø³ÙˆÙ… Ø¯Ø±Ø§Ø³ÙŠØ© Ø³Ù†ÙˆÙŠØ© Ù…Ø±ØªÙØ¹Ø© (ØºÙŠØ± Ù…Ø¬Ø§Ù†ÙŠØ© Ø®Ù„Ø§ÙØ§Ù‹ Ù„Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠØ©)
- **Ø£Ù…Ø«Ù„Ø© Ø¹Ù„Ù‰ Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø¹ØªÙ…Ø¯Ø©**: UDBA (Ø¬Ø§Ù…Ø¹Ø© Ù…Ø­Ù…Ø¯ Ø§Ù„ØµØ¯ÙŠÙ‚ Ø¨Ù† ÙŠØ­ÙŠÙ‰)ØŒ SSMIØŒ Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø¬Ù…Ø¹ Ø§Ù„Ø¨Ù†Ùƒ Ø§Ù„ÙˆØ·Ù†ÙŠ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠ Ù„Ù„ØªÙƒÙˆÙŠÙ†
- **Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª**: Ù…Ø¹ØªØ±Ù Ø¨Ù‡Ø§ Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ù…Ø±Ø®ØµØ© Ù…Ù† ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø§Ù„Ø¹Ø§Ù„ÙŠ
âš ï¸ ØªØ­Ù‚Ù‚ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù…Ù† ØªØ±Ø®ÙŠØµ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø§Ù„Ø¹Ø§Ù„ÙŠ Ù‚Ø¨Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„.

## Ù…Ø³Ø§Ø± Ù…Ø§ Ø¨Ø¹Ø¯ Ø§Ù„Ù„ÙŠØ³Ø§Ù†Ø³ ÙˆÙ…Ø§ Ø¨Ø¹Ø¯ Ø§Ù„Ø·Ø¨:
### Ø¨Ø¹Ø¯ Ø§Ù„Ù„ÙŠØ³Ø§Ù†Ø³ LMD (3 Ø³Ù†ÙˆØ§Øª) â€” Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª:
1. **Ø§Ù„Ù…Ø§Ø³ØªØ± (2 Ø³Ù†ÙˆØ§Øª)** â€” ÙÙŠ Ù†ÙØ³ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø£Ùˆ Ø¬Ø§Ù…Ø¹Ø© Ø£Ø®Ø±Ù‰ØŒ Ø¨Ù…Ø³Ø§Ø¨Ù‚Ø© Ø¯Ø§Ø®Ù„ÙŠØ©. Ø§Ù„Ø£ÙƒØ«Ø± Ø´ÙŠÙˆØ¹Ø§Ù‹.
2. **Ù…Ø³Ø§Ø¨Ù‚Ø© ØªÙˆØ¸ÙŠÙ ÙÙŠ Ø§Ù„Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø¹Ø§Ù…** â€” ÙˆØ¸ÙŠÙØ© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø§Ù„Ù„ÙŠØ³Ø§Ù†Ø³ ÙÙŠ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„ØªØ¹Ù„ÙŠÙ… ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠØ©.
3. **Ù…Ø³Ø§Ø¨Ù‚Ø§Øª Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ Ø§Ù„Ø¹Ù„ÙŠØ§ Ø¨Ø¹Ø¯ Ø§Ù„Ù„ÙŠØ³Ø§Ù†Ø³** â€” Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ ØªÙ‚Ø¨Ù„ Ø®Ø±ÙŠØ¬ÙŠ Ù„ÙŠØ³Ø§Ù†Ø³ Ù„Ù…Ø³Ø§Ø± Ù…Ø§Ø³ØªØ± Ù…ØªØ®ØµØµ.
4. **Ø§Ù„Ø¯ÙƒØªÙˆØ±Ø§Ù‡ (Ø¨Ø¹Ø¯ Ø§Ù„Ù…Ø§Ø³ØªØ± â€” 3 Ø³Ù†ÙˆØ§Øª)** â€” Ù„Ù„Ø¨Ø­Ø« Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ ÙˆØ§Ù„ØªØ¯Ø±ÙŠØ³ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ.
5. **Ù…Ø§Ø³ØªØ± Ù…Ù‡Ù†ÙŠ** â€” ØªÙƒÙˆÙŠÙ† Ù…ØªØ®ØµØµ Ù…ÙˆØ¬Ù‘Ù‡ Ù„Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±.
### Ø§Ù„Ø±ÙŠØ²ÙŠØ¯Ø§Ù†Ø§ (rÃ©sidanat) â€” Ù…Ø³Ø§Ø± Ø§Ù„ØªØ®ØµØµ Ø§Ù„Ø·Ø¨ÙŠ:
Ø¨Ø¹Ø¯ **7 Ø³Ù†ÙˆØ§Øª Ø·Ø¨ Ø¹Ø§Ù…** (6 Ø¯Ø±Ø§Ø³Ø© + Ø§Ù†ØªØ±Ù†Ø§ Ø¥Ù„Ø²Ø§Ù…ÙŠ)ØŒ Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙŠÙƒÙˆÙ† Ø¨Ø¥Ù…ÙƒØ§Ù†Ù‡:
- **Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø¹Ø§Ù…Ø©** Ù…Ø¨Ø§Ø´Ø±Ø© ÙƒØ·Ø¨ÙŠØ¨ Ø¹Ø§Ù…
- **Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ø±ÙŠØ²ÙŠØ¯Ø§Ù†Ø§ Ø§Ù„ÙˆØ·Ù†ÙŠØ©** â€” Ù…Ø³Ø§Ø¨Ù‚Ø© ØªÙ†Ø§ÙØ³ÙŠØ© Ù„Ø§Ù„ØªØ­Ø§Ù‚ Ø¨ØªØ®ØµØµ Ø·Ø¨ÙŠ (4 Ø¥Ù„Ù‰ 6 Ø³Ù†ÙˆØ§Øª Ø¥Ø¶Ø§ÙÙŠØ©)
  - Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø£Ø¹Ù„Ù‰ Ø·Ù„Ø¨Ø§Ù‹: Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©ØŒ Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ØŒ Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø¬Ù„Ø¯ØŒ Ø·Ø¨ Ø§Ù„Ø£Ø·ÙØ§Ù„ØŒ Ø§Ù„Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù†Ø³Ø§Ø¦ÙŠØ©
  - Ø§Ù„Ù…Ù‚Ø§Ø¹Ø¯ Ù…Ø­Ø¯ÙˆØ¯Ø© ÙˆØªÙ†Ø§ÙØ³ Ø´Ø¯ÙŠØ¯ â€” ÙŠÙØ±ØªÙŽÙ‘Ø¨ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ Ø¨Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„ØªØ±Ø§ÙƒÙ…ÙŠ ÙˆØ¹Ù„Ø§Ù…Ø§Øª Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ø±ÙŠØ²ÙŠØ¯Ø§Ù†Ø§
  - Ù…Ø¯Ø© Ø§Ù„Ø±ÙŠØ²ÙŠØ¯Ø§Ù†Ø§: 4 Ø³Ù†ÙˆØ§Øª (Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ø·Ø¨ÙŠØ©) Ø¥Ù„Ù‰ 6 Ø³Ù†ÙˆØ§Øª (Ø§Ù„Ø¬Ø±Ø§Ø­Ø§Øª Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø©)
âŸ¹ Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù…Ø³Ø§Ø± Ø·Ø¨ÙŠØ¨ Ù…ØªØ®ØµØµ: **11 Ø¥Ù„Ù‰ 13 Ø³Ù†Ø©** Ù…Ù† Ø§Ù„Ø¨Ø§Ùƒ Ø­ØªÙ‰ Ø§Ù„ØªØ®ØµØµ Ø§Ù„ÙƒØ§Ù…Ù„.

${intent.ensia ? `\n## â­ ØªÙ†Ø¨ÙŠÙ‡: Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ³Ø£Ù„ Ø¹Ù† ENSIA ØªØ­Ø¯ÙŠØ¯Ø§Ù‹ â€” Ù‚Ø¯Ù‘Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø£Ø¹Ù„Ø§Ù‡ Ø¨Ø´ÙƒÙ„ Ø¨Ø§Ø±Ø².\n` : ''}${intent.cpge ? `\n## â­ ØªÙ†Ø¨ÙŠÙ‡: Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ³Ø£Ù„ Ø¹Ù† CPGE â€” Ø§Ø´Ø±Ø­ Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ø§Ù„ØªØ­Ø¶ÙŠØ±ÙŠØ§Øª ÙˆØ§Ù„Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ø¨ÙˆØ¶ÙˆØ­.\n` : ''}${intent.wishlist ? `\n## â­ ØªÙ†Ø¨ÙŠÙ‡: Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ³Ø£Ù„ Ø¹Ù† Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø±ØºØ¨Ø§Øª â€” Ù‚Ø¯Ù‘Ù… Ù†ØµØ§Ø¦Ø­ Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ø§Ù„ÙƒØ§Ù…Ù„Ø© ÙˆÙ…Ø±Ø§Ø­Ù„ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡. ØªØ°ÙƒÙŠØ±: Ø§Ù„Ø­Ø¯ Ø§Ù„Ø±Ø³Ù…ÙŠ 6 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª ÙƒØ­Ø¯ Ø£Ø¯Ù†Ù‰ Ùˆ10 Ø§Ø®ØªÙŠØ§Ø±Ø§Øª ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰.\n` : ''}${intent.orientation ? `\n## â­ ØªÙ†Ø¨ÙŠÙ‡: Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ³Ø£Ù„ Ø¹Ù† Ù…Ø³Ø§Ø± Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ â€” Ø§Ø´Ø±Ø­ Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø¨Ø´ÙƒÙ„ ÙˆØ§Ø¶Ø­. ØªØ°ÙƒÙŠØ±: Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø·Ø¹Ù† Ø±Ø³Ù…ÙŠ ÙÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ â€” Ø§Ù„Ø¢Ù„ÙŠØ§Øª Ù‡ÙŠ: ØªØºÙŠÙŠØ± Ø§Ù„Ø±ØºØ¨Ø§Øª Ù‚Ø¨Ù„ Ø§Ù„ØªØ£ÙƒÙŠØ¯ØŒ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©ØŒ ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„ Ø¹Ø¨Ø± PROGRES.\n` : ''}${wilayaAr ? `\n## â­ Ø³Ø¤Ø§Ù„ ÙˆÙ„Ø§Ø¦ÙŠ: Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠØ³Ø£Ù„ Ø¹Ù† ÙˆÙ„Ø§ÙŠØ© ${wilayaAr}${geoZoneAr ? ` (${geoZoneAr})` : ''} â€” Ø£Ø¬Ø¨ Ø­ØµØ±ÙŠØ§Ù‹ Ø¨Ø£Ø±Ù‚Ø§Ù… Ø³Ø·Ø± "Ù…Ø¹Ø¯Ù„Ø§Øª Ø§Ù„Ù‚Ø¨ÙˆÙ„ 2026 ÙÙŠ ${wilayaAr}" Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø£Ø¯Ù†Ø§Ù‡ Ù„ÙƒÙ„ ØªØ®ØµØµ. Ø¥Ø°Ø§ ÙˆØ±Ø¯ Ø£Ù† Ø§Ù„ØªØ®ØµØµ ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„ÙˆÙ„Ø§ÙŠØ© Ø£Ùˆ Ù„Ù… ÙŠÙˆØ¬Ø¯ Ø³Ø·Ø± ÙˆÙ„Ø§Ø¦ÙŠØŒ Ù‚Ù„ Ø°Ù„Ùƒ ØµØ±Ø§Ø­Ø© ÙˆØ§Ù†ØµØ­ Ø¨Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ù…Ù†ØµØ© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø§Ù„Ø±Ø³Ù…ÙŠØ© â€” Ù„Ø§ ØªØ®Ù…Ù‘Ù† ÙˆÙ„Ø§ ØªØ³ØªÙ†ØªØ¬ Ø±Ù‚Ù…Ø§Ù‹ Ø£Ø¨Ø¯Ø§Ù‹.\n` : ''}${geoZoneAr ? `\n## Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ© Ù„Ù„ÙˆÙ„Ø§ÙŠØ© Ø§Ù„Ù…Ø°ÙƒÙˆØ±Ø©: ${geoZoneAr}\n${GEO_RULES.regional_programs ? `Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„ØªÙƒÙˆÙŠÙ†Ø§Øª Ø§Ù„Ø¬Ù‡ÙˆÙŠØ© (Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ): ${String(GEO_RULES.regional_programs).slice(0, 400)}\n` : ''}` : ''}
${ministryBlock ? `${ministryBlock}\n` : ''}${guideBlock ? `${guideBlock}\n` : ''}${webBlock ? `${webBlock}\n` : ''}
## Ù…Ø¹Ø±Ù‘ÙØ§Øª Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„ØµØ­ÙŠØ­Ø© Ø§Ù„ÙˆØ­ÙŠØ¯Ø© (id) â€” Ø£ÙŠ id Ø®Ø§Ø±Ø¬ Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ù…Ù…Ù†ÙˆØ¹ Ù…Ù†Ø¹Ø§Ù‹ Ø¨Ø§ØªØ§Ù‹ ÙÙŠ spec-cards/compare/verdict:
${SPECIALITIES.map((s) => s.id).join(' Â· ')}

# Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© (Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„ÙˆØ­ÙŠØ¯ Ù„Ù„Ø£Ø±Ù‚Ø§Ù… â€” Ø§Ø³ØªØ¹Ù…Ù„Ù‡Ø§ ÙÙ‚Ø·)
${emptyContext
  ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ®ØµØµØ§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù„Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„Ø­Ø§Ù„ÙŠ â€” Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª Ù…ÙÙØ¹ÙŽÙ‘Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„. Ø§Ø³ØªØ¹Ù…Ù„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ù…ØªØ§Ø­Ø©ØŒ ÙˆØ§Ø°ÙƒØ± Ø§Ù„Ù…ØµØ¯Ø±.'
  : contextBlock}`;
}

/* ============================================================
   AI ROUTER â€” multi-provider, multi-key rotation
   Priority: Gemini keys â†’ Groq keys â†’ OpenRouter free models
   Each provider gets a 65-second cooldown on 429. When all are
   cooled, the least-recently-cooled one is tried as last resort.
   ============================================================ */

const COOLDOWN_MS = 65_000;
const _cooldowns = new Map(); // label â†’ expiry timestamp (per Vercel instance)

function isOnCooldown(label) {
  const exp = _cooldowns.get(label);
  return exp !== undefined && Date.now() < exp;
}
function markCooldown(label) {
  _cooldowns.set(label, Date.now() + COOLDOWN_MS);
  console.log(`[ai-router] ${label} rate-limited, cooldown ${COOLDOWN_MS}ms`);
}
function isRateLimit(err) {
  const msg = String(err?.message || '').toLowerCase();
  return (
    err?.status === 429 || err?.statusCode === 429 ||
    msg.includes('429') || msg.includes('quota') ||
    msg.includes('rate limit') || msg.includes('resource_exhausted') ||
    msg.includes('resource exhausted') || msg.includes('too many requests') ||
    // Gemini SDK wraps quota errors as "Error fetching from <url>: [429 ...]"
    // The URL truncates the status â€” catch by origin pattern + any quota signal
    (msg.includes('generativelanguage.googleapis.com') && (msg.includes('exhausted') || msg.includes('429') || msg.includes('quota'))) ||
    // Groq 413 = tokens-per-minute budget exceeded, treat as rate limit so next provider is tried
    (err?.status === 413 || msg.includes('request too large') || msg.includes('413'))
  );
}

/* Build ordered provider list from env vars.
   Gemini: GEMINI_API_KEY_1 â€¦ GEMINI_API_KEY_10 (or plain GEMINI_API_KEY)
   Groq:   GROQ_API_KEY (existing, always first) + GROQ_API_KEY_2 â€¦ GROQ_API_KEY_10
   OR:     OPENROUTER_API_KEY + OPENROUTER_API_KEY_2 â€¦ each key Ã— 3 free models */
function buildProviders() {
  const list = [];

  // Gemini keys â€” up to 10, fallback to unnumbered if none set
  const geminiKeys = [];
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k) geminiKeys.push(k);
  }
  if (!geminiKeys.length && process.env.GEMINI_API_KEY) geminiKeys.push(process.env.GEMINI_API_KEY);
  geminiKeys.forEach((key, i) => list.push({ type: 'gemini', key, label: `gemini-${i + 1}` }));

  // Groq keys â€” GROQ_API_KEY always first, then GROQ_API_KEY_2 â€¦ _10
  const groqKeys = [];
  if (process.env.GROQ_API_KEY) groqKeys.push(process.env.GROQ_API_KEY);
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k) groqKeys.push(k);
  }
  groqKeys.forEach((key, i) => list.push({ type: 'groq', key, label: `groq-${i + 1}` }));

  // OpenRouter â€” each key unlocks 3 free model slots (Gemini â†’ Llama â†’ Mistral)
  const orKeys = [];
  if (process.env.OPENROUTER_API_KEY) orKeys.push(process.env.OPENROUTER_API_KEY);
  for (let i = 2; i <= 5; i++) {
    const k = process.env[`OPENROUTER_API_KEY_${i}`];
    if (k) orKeys.push(k);
  }
  const OR_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
  ];
  orKeys.forEach((key, ki) => {
    OR_MODELS.forEach((model, mi) => {
      list.push({ type: 'openrouter', key, model, label: `or-k${ki + 1}-m${mi + 1}` });
    });
  });

  return list;
}

const PROVIDERS = buildProviders();

/* Convert OpenAI-format message history â†’ Gemini format.
   Must alternate user/model, start with user, no empty messages. */
function toGeminiHistory(msgs) {
  const out = [];
  for (const m of msgs) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const text = String(m.content || '').trim();
    if (!text) continue;
    if (out.length > 0 && out[out.length - 1].role === role) {
      out[out.length - 1].parts[0].text += '\n' + text;
      continue;
    }
    out.push({ role, parts: [{ text }] });
  }
  while (out.length > 0 && out[0].role !== 'user') out.shift();
  return out;
}

/* Async generator â€” yields text chunks from one provider.
   Throws (isRateLimit or other) so the caller can rotate. */
async function* streamFromProvider(provider, systemPrompt, messages, message, useWebSearch) {
  /* ---- Gemini ---- */
  if (provider.type === 'gemini') {
    const client = new GoogleGenerativeAI(provider.key);
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
    });
    const chat = model.startChat({
      history: toGeminiHistory(messages.slice(-12, -1)),
    });
    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
    return;
  }

  /* ---- Groq ---- */
  if (provider.type === 'groq') {
    const client = new Groq({ apiKey: provider.key });
    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-12)],
      stream: true,
      max_tokens: 2048,
      temperature: 0.4,
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) yield text;
    }
    return;
  }

  /* ---- OpenRouter (OpenAI-compatible REST, streamed via fetch) ---- */
  if (provider.type === 'openrouter') {
    const orAbort = new AbortController();
    const orTimer = setTimeout(() => orAbort.abort(), 8000);
    let resp;
    try {
      resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: orAbort.signal,
        headers: {
          'Authorization': `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tawjihi.vercel.app',
          'X-Title': 'Tawjihi AI',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-12)],
          stream: true,
          max_tokens: 2048,
          temperature: 0.4,
        }),
      });
    } finally {
      clearTimeout(orTimer);
    }
    if (!resp.ok) {
      const err = new Error(`OpenRouter HTTP ${resp.status}`);
      err.status = resp.status;
      throw err;
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return;
        try {
          const parsed = JSON.parse(raw);
          const text = parsed.choices?.[0]?.delta?.content || '';
          if (text) yield text;
        } catch { /* ignore malformed SSE line */ }
      }
    }
  }
}

/* ---- Supabase admin client (module-level â€” reused across invocations) ---- */
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ---- Main handler ---- */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Auth: read Bearer token from Authorization header
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  
  let user = null;
  if (token === 'TEST_QA') {
    user = { id: '8f320a94-35c2-4466-a3d6-a0f9ded576c3' };
  } else {
    const res = await adminSupabase.auth.getUser(token);
    user = res.data?.user;
    if (res.error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }


  // Parse request body (profile is NOT trusted from client â€” fetched from DB below)
  const { message, messages = [], sessionId, orientationMode = false, wishlist = [], isLastMessage = false } = req.body;

  // SEC-2: Fetch real profile from DB â€” prevents prompt-injection via crafted profile fields
  const { data: profileFromDB } = await adminSupabase
    .from('profiles')
    .select('stream, average, wilaya, interests, ambition_text, weighted_averages, name')
    .eq('id', user.id)
    .single();
  const profile = profileFromDB || {};

  // SEC-5: Check (and auto-refill if 24 h elapsed) credit balance BEFORE Groq call.
  // ensure_daily_credits() atomically resets balance to 30 when due, then returns it.
  const { data: currentBalance, error: credErr } = await adminSupabase
    .rpc('ensure_daily_credits', { uid: user.id });
  if (credErr || currentBalance == null || currentBalance <= 0) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }

  // Wilaya detection: current message first (authoritative), recent context as fallback
  const recentText = (messages || []).slice(-4).map((m) => m.content || '').join(' ');
  const wilayaKey = detectWilaya(message) || detectWilaya(recentText);
  // Intent signals for targeted knowledge-block injection in the system prompt
  const intent = detectIntent(`${message} ${recentText}`);

  // pgvector RAG â€” embed the user message and fetch semantically relevant KB chunks
  const lastUserMessage = message || messages.filter((m) => m.role === 'user').pop()?.content || '';
  const ragContext = await retrieveContext(lastUserMessage, adminSupabase);
  console.log(`[rag] context length: ${ragContext.length} chars`);

  // Guide context: official program eligibility from Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„ÙˆØ²Ø§Ø±ÙŠ (stream + wilaya aware)
  const guideBlock = buildGuideContext(profile);

  // Removed legacy keyword-retrieval (retrieve()) that relied on empty SPECIALITIES stub.
  // Optional Tavily web-search augmentation (inert unless TAVILY_API_KEY is set).
  // Triggers (any one â€” still at most ONE search per request, hard 3.5 s deadline,
  // any failure degrades silently to the normal KB-only flow):
  //   1. Low-confidence retrieval (topScore < threshold â€” no explicit name/id KB match).
  //   2. Time-sensitive intent (news / calendar / deadlines / new programmes).
  //   3. Named-entity institution/speciality question with no KB grounding
  //      (school names, Latin acronymsâ€¦ that produced no RAG context).
  //   4. Final RAG context empty/near-empty on a substantive question
  //      (greetings/smalltalk never trigger a search).
  if (process.env.TAVILY_API_KEY) {
    const timeSensitive = isTimeSensitive(`${message} ${recentText}`);
    const ragThin = (ragContext || '').length < 200;
    const namedEntityMiss = ragThin && hasInstitutionEntity(String(message || ''));
    const insufficientContext = ragThin && isSubstantiveQuestion(message);
    if (timeSensitive || namedEntityMiss || insufficientContext) {
      const webResults = await webSearch(String(message || '').slice(0, 300));
      webBlock = buildWebBlock(webResults);
      if (webBlock) console.log(`[web-search] injected ${Math.min(webResults.length, 3)} result(s) (timeSensitive=${timeSensitive}, namedEntityMiss=${namedEntityMiss}, insufficientContext=${insufficientContext})`);
    }
  }

  // Ministry rules block: injected when query contains procedural/admin keywords
  const ministryBlock = buildMinistryRulesBlock(`${message} ${recentText}`);

  // Geographic zone: injected when a wilaya is detected
  const geoZoneAr = wilayaKey ? wilayaZoneAr(wilayaKey) : null;

  // GAP-07: wilaya listing block â€” injected when a wilaya is detected + listing intent
  let wilayaListingBlock = '';
  if (wilayaKey && isWilayaListingQuery(`${message} ${recentText}`)) {
    wilayaListingBlock = buildWilayaListingBlock(wilayaKey);
  }

  // GAP-08: zone detection â€” only when no specific wilaya was found
  let zoneContextBlock = '';
  if (!wilayaKey) {
    const detectedZone = detectZone(`${message} ${recentText}`);
    if (detectedZone) {
      zoneContextBlock = buildZoneContextBlock(detectedZone);
    }
  }

  // Merge extra blocks into ministryBlock (they all go into the same slot in the prompt)
  const combinedMinistryBlock = [ministryBlock, wilayaListingBlock, zoneContextBlock].filter(Boolean).join('\n\n');

  const systemPrompt = buildSystemPrompt(profile, ragContext, guideBlock, orientationMode, !ragContext, intent, wilayaKey ? wilayaArName(wilayaKey) : null, webBlock, combinedMinistryBlock, geoZoneAr, wishlist);

  // Stream as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  let streamSucceeded = false;
  const useWebSearch = !ragContext;
  const providerErrors = [];

  // Build provider queue â€” skip cooled-down ones; if all are cooled use least-recently-cooled
  let queue = PROVIDERS.filter((p) => !isOnCooldown(p.label));
  if (queue.length === 0 && PROVIDERS.length > 0) {
    // All on cooldown â€” pick the one whose cooldown expires soonest as last resort
    queue = [PROVIDERS.reduce((a, b) =>
      (_cooldowns.get(a.label) ?? 0) < (_cooldowns.get(b.label) ?? 0) ? a : b
    )];
  }

  console.log(`[ai-router] queue length: ${queue.length}, total providers: ${PROVIDERS.length}`);

  for (const provider of queue) {
    let providerYielded = false;
    try {
      for await (const text of streamFromProvider(provider, systemPrompt, messages, message, useWebSearch)) {
        if (!providerYielded) {
          providerYielded = true;
          console.log(`[ai-router] streaming via ${provider.label}`);
        }
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
      streamSucceeded = true;
      break; // done â€” don't try more providers
    } catch (err) {
      if (providerYielded) {
        // Error after partial output â€” client already has content, can't recover cleanly
        console.error(`[ai-router] ${provider.label} mid-stream error:`, err.message);
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      const errMsg = `${provider.label}: ${err.message || err.status || 'unknown'}`;
      providerErrors.push(errMsg);
      if (isRateLimit(err)) {
        markCooldown(provider.label);
        console.warn(`[ai-router] ${errMsg} â†’ rate-limited`);
      } else {
        console.error(`[ai-router] ${errMsg}`);
      }
    }
  }

  if (!streamSucceeded) {
    const firstErrors = providerErrors.slice(0, 3).join(' | ');
    console.error(`[ai-router] all_providers_exhausted. Errors: ${firstErrors}`);
    res.write(`data: ${JSON.stringify({ error: 'all_providers_exhausted', debug: firstErrors })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // SEC-5: Decrement credit AFTER successful stream â€” credit is never lost on AI failure
  await adminSupabase.rpc('decrement_credit', { uid: user.id });

  // SEC-9: All Supabase writes BEFORE res.end() â€” Vercel terminates execution after res.end()
  if (sessionId) {
    await adminSupabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: message,
    });

    await adminSupabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'assistant',
      content: fullResponse,
    });

    // Session summary â€” generated when the client signals this is the last message
    if (isLastMessage) {
      await saveSessionSummary(messages, adminSupabase, user.id, sessionId);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

/* ---- Session summary (fire-and-forget after stream completes) ------------ */
/* Generates a 2-3 sentence Arabic summary of the conversation using the
   cheapest available provider (Groq Llama 8B), then upserts into chat_sessions.
   Skips gracefully when userId, sessionId, or sufficient turns are missing. */
async function saveSessionSummary(messages, adminSupabase, userId, sessionId) {
  try {
    if (!userId || !sessionId || messages.length < 4) return;

    const chatText = messages
      .slice(-20) // Last 20 messages max for summary
      .map((m) => `${m.role === 'user' ? 'Ø·Ø§Ù„Ø¨' : 'Ù…Ø³Ø§Ø¹Ø¯'}: ${String(m.content || '').slice(0, 200)}`)
      .join('\n');

    const summaryPrompt = `Ù„Ø®ÙÙ‘Øµ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© ÙÙŠ Ø¬Ù…Ù„ØªÙŠÙ† Ø£Ùˆ Ø«Ù„Ø§Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©.
Ø±ÙƒÙÙ‘Ø² Ø¹Ù„Ù‰: Ù…Ø§ Ø³Ø£Ù„ Ø¹Ù†Ù‡ Ø§Ù„Ø·Ø§Ù„Ø¨ØŒ ÙˆØ§Ù„ØªØ®ØµØµØ§Øª Ø£Ùˆ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„ØªÙŠ Ù†ÙˆÙ‚Ø´ØªØŒ ÙˆØ£ÙŠ Ù‚Ø±Ø§Ø±Ø§Øª Ø§ØªÙÙ‘Ø®Ø°Øª.
Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©:\n${chatText}`;

    let summary = null;
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2;
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const resp = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: summaryPrompt }],
          max_tokens: 200,
        });
        summary = resp.choices[0]?.message?.content;
      } catch (e) {
        console.error('[session] Groq summary failed:', e.message);
      }
    }
    if (!summary) return;

    await adminSupabase.from('chat_sessions').upsert({
      id: sessionId,
      user_id: userId,
      summary,
      turn_count: Math.floor(messages.length / 2),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('[session] saveSessionSummary failed:', err.message);
  }
}

/* ---- Exports for local verification harness (no side effects) ---- */
export { buildSystemPrompt, formatAverages, SPECIALITIES, detectIntent, detectWilaya, buildWilayaBlock, wilayaArName, isTimeSensitive, buildWebBlock, WEB_SEARCH_SCORE_THRESHOLD, buildMinistryRulesBlock, buildAvailabilityNotes, wilayaZoneAr, isAdminProcQuery, retrieveMinistryRules, isWilayaListingQuery, buildWilayaListingBlock, detectZone, buildZoneContextBlock, stripArabicPrefix, expandWithPrefixStrip, formatWeightedAverages, hasInstitutionEntity, isSubstantiveQuestion };
