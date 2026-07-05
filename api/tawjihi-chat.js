/* ============================================================
   TAWJIHI — AI Chat API (Vercel Serverless Function)
   ESM module — package.json has "type": "module"
   v2 output contract — see tawjihi/CHAT-CONTRACT.md
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

/* ---- Knowledge base (static JSON, bundled by Vercel via import attributes) ---- */
import specialitiesKb from '../tawjihi/data/kb/specialities-kb.json' with { type: 'json' };
import admissionsFull from '../tawjihi/data/kb/admissions-full.json' with { type: 'json' };
import filiereIndex from '../tawjihi/data/kb/filiere-index.json' with { type: 'json' };
/* ---- Official guide data (الدليل الوزاري) ---- */
import guidePrograms from '../tawjihi/data/guide/programs.json' with { type: 'json' };
import geoData from '../tawjihi/data/guide/geographic-circles.json' with { type: 'json' };
/* ---- New KB files: geographic zones, ministry rules, availability map ---- */
import geoCircles from '../tawjihi/data/kb/geo-circles.json' with { type: 'json' };
import ministryRulesData from '../tawjihi/data/kb/ministry-rules.json' with { type: 'json' };
import availabilityMapData from '../tawjihi/data/kb/availability-map.json' with { type: 'json' };

const SPECIALITIES = specialitiesKb.specialities || [];
const ADM_ROWS = admissionsFull.rows || [];
const FILIERES = filiereIndex.filieres || {};

/* ---- Guide indexes (built once at module load) ---- */
const GUIDE_PROGRAMS = guidePrograms.programs || [];
/* wilaya Arabic name → its number (1-58) for geographic filtering */
const WILAYA_TO_NUM = Object.fromEntries(
  (geoData.wilayas || []).map((w) => [w.ar, w.num])
);

/* Canonical field names — the PDF extraction scrambled word order across copies.
   Map every variant to its official الدليل الوزاري designation. */
const FIELD_CANONICAL = {
  'علوم وتكنولوجيا': 'علوم وتكنولوجيا',
  'وتكنولوجيا علوم': 'علوم وتكنولوجيا',
  'علوم المادة': 'علوم المادة',
  'المادة علوم': 'علوم المادة',
  'والحياة علوم الطبيعة': 'علوم الطبيعة والحياة',
  'والحياة الطبيعة علوم': 'علوم الطبيعة والحياة',
  'تجارية علوم اقتصادية والتسيير وعلوم': 'علوم اقتصادية تجارية وتسيير',
  'تجارية وعلوم والتسيير اقتصادية علوم': 'علوم اقتصادية تجارية وتسيير',
  'تجارية والتسيير وعلوم علوم اقتصادية': 'علوم اقتصادية تجارية وتسيير',
  'وعلومتجارية التسيير اقتصادية، علوم': 'علوم اقتصادية تجارية وتسيير',
  'تجارية التسيير وعلوم علوم قتصادية،': 'علوم اقتصادية تجارية وتسيير',
  'تجارية تسيير وعلوم علوم اقتصادية،': 'علوم اقتصادية تجارية وتسيير',
  'تجارية وعلوم تسيير اقتصادية، علوم': 'علوم اقتصادية تجارية وتسيير',
  'واجتماعية علوم إنسانية': 'علوم إنسانية واجتماعية',
  'واجتماعية إنسانية علوم': 'علوم إنسانية واجتماعية',
  'والرياضية * النشاطات البدنية علوم وتقنيات': 'علوم وتقنيات النشاطات البدنية والرياضية',
  'فنون': 'فنون',
  'لغة وأدب عربي': 'لغة وأدب عربي',
  'أمازيغية لغة وثقافة': 'لغة وثقافة أمازيغية',
  'ومهن المدينة معمارية،عمران هندسة': 'هندسة معمارية وعمران ومهن المدينة',
  'المدينة ومهن عمران معمارية، هندسة': 'هندسة معمارية وعمران ومهن المدينة',
  'المدينة عمارن ومهن هندسة معمارية،': 'هندسة معمارية وعمران ومهن المدينة',
  'وإعالم آلي رياضيات': 'رياضيات وإعلام آلي',
  'و إعالم آلي رياضيات': 'رياضيات وإعلام آلي',
  'أجنبية أداب ولغات': 'آداب ولغات أجنبية',
};
function canonicalField(raw) {
  return FIELD_CANONICAL[raw?.trim()] || raw?.trim() || 'غير محدد';
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
   min1 = علوم تجريبية (sciexp), min2 = رياضيات (math), min3 = تقني رياضي (techmath) */
const STREAM_TO_MIN = {
  sciexp: 'min1',
  math: 'min2',
  techmath: 'min3',
  // gestion/lettres/langues: no separate admission column in the data (they compete on
  // معدل عام with generally lower thresholds). Mark as 'general' for context-building.
  gestion: 'general',
  lettres: 'general',
  langues: 'general',
};
/* Specialities eligible for gestion/lettres/langues students (معدل عام-based, ≥10/20) */
const NON_SCIENCE_ELIGIBLE = {
  gestion: new Set(['ss', 'droit', 'sciences-po', 'info-gest', 'enssea', 'ehec', 'sciences-hum', 'charia', 'traduction', 'commu', 'langues', 'math-eco', 'mgmt-eng', 'escf', 'esgen']),
  lettres: new Set(['droit', 'sciences-po', 'sciences-hum', 'langues', 'traduction', 'commu', 'charia', 'ss']),
  langues: new Set(['langues', 'traduction', 'droit', 'sciences-po', 'sciences-hum', 'commu', 'ss']),
};

/* ---- geo-circles.json indexes (built once at module load) ---- */
const WILAYA_TO_CIRCLE = geoCircles.wilayaToCircle || {};   // Latin key → circle id (1/2/3)
const GEO_CIRCLES = geoCircles.circles || [];               // [{id,name_ar,wilayas,...}]
const GEO_RULES = geoCircles.rules || {};                   // {national_programs, regional_programs, redirection}

/* Resolve a Latin KB wilaya key → its zone name in Arabic */
function wilayaZoneAr(wilayaKey) {
  const circleId = WILAYA_TO_CIRCLE[wilayaKey];
  if (!circleId) return null;
  const circle = GEO_CIRCLES.find((c) => c.id === circleId);
  return circle ? circle.name_ar : null;
}

/* ---- ministry-rules.json index (built once at module load) ---- */
const MINISTRY_RULES = ministryRulesData.rules || [];

/* Keywords that signal an administrative/procedural question. */
const ADMIN_PROC_KEYWORDS = [
  'الطعن', 'طعن', 'التحويل', 'تحويل', 'تغيير', 'المنحة', 'منحة',
  'الإيواء', 'إيواء', 'ايواء', 'التسجيل', 'تسجيل', 'موعد', 'مواعيد',
  'رزنامة', 'رزنامه', 'بطاقة الرغبات', 'بطاقه الرغبات', 'متفوق',
  'حالة خاصة', 'حالات خاصة', 'ذوي الهمم', 'باك أجنبي', 'باك اجنبي',
  'أجنبي', 'اجنبي', 'القديم', 'المرحلة الثانية', 'مرحلة ثانية',
  'inscription', 'calendrier', 'bourse', 'logement', 'transfert',
  // GAP-03: housing / residence keywords
  'الحي الجامعي', 'حي جامعي', 'سكن جامعي', 'سكن طالب', 'إقامة جامعية',
  'نسكن', 'نقدر نسكن', 'إيواء طالب', 'hébergement', 'résidence universitaire',
  // GAP-06: geographic-circle keywords
  'الدائرة الجغرافية', 'الدوائر الجغرافية', 'دائرة جغرافية', 'دائرتي',
  'منطقتي', 'الدائرة',
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
  return ADMIN_PROC_KEYWORDS.some((kw) => q.includes(kw));
}

/* Build a ministry-rules injection block (max 3 rules × 600 chars each). */
function buildMinistryRulesBlock(rawQuery) {
  if (!isAdminProcQuery(rawQuery)) return '';
  const rules = retrieveMinistryRules(rawQuery, 3);
  if (!rules.length) return '';
  const MAX_CHARS = 600;
  const lines = ['## أحكام وزارية رسمية'];
  for (const rule of rules) {
    const ruleText = String(rule.rule_ar || '');
    const truncated = ruleText.length > MAX_CHARS ? ruleText.slice(0, MAX_CHARS).trim() + '…' : ruleText;
    lines.push(`### ${rule.topic_ar}\n${truncated}`);
  }
  return lines.join('\n\n');
}

/* ---- availability-map.json index (built once at module load) ---- */
const AVAILABILITY_MAP = availabilityMapData.specialities || {};

/* For a detected wilaya key and retrieved KB specs, build a per-spec availability note.
   Returns a map: specId → availability note string (or null if not needed). */
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
    // Not offered in this wilaya — build a message
    const arName = wilayaArName(wilayaKey);
    const top3 = offeredIn.slice(0, 3).map((wk) => {
      const etabs = (avail.establishments || {})[wk] || [];
      const etabStr = etabs.length ? ` (${etabs[0]})` : '';
      return `${wilayaArName(wk)}${etabStr}`;
    });
    notes[spec.id] = `هذا التخصص لا يُدرَّس في ${arName} — يُدرَّس في: ${top3.join(' ، ')}`;
  }
  return notes;
}

/* GAP-07: Detect "list specialities available in wilaya X" intent.
   Returns true when the query combines a listing intent keyword with a wilaya. */
const WILAYA_LISTING_KEYWORDS = [
  'تخصصات', 'متاح', 'متوفر', 'موجود', 'كاين', 'شو فيه', 'شنو فيه',
  'قائمة', 'list', 'يتوفر', 'تتوفر',
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

  const lines = [`## التخصصات المتاحة في ولاية ${arName} (حسب خريطة التوفر 2025)`];

  if (national.length > 0) {
    lines.push(`### تخصصات وطنية (متاحة لجميع الولايات — ${national.length} تخصص):`);
    national.slice(0, 10).forEach((id) => lines.push(`- ${specById[id] || id} (${id})`));
    if (national.length > 10) lines.push(`… و${national.length - 10} تخصصاً وطنياً آخر`);
  }

  if (regional.length > 0) {
    lines.push(`### تخصصات إقليمية متوفرة في ${arName} (${regional.length} تخصص):`);
    regional.slice(0, 10).forEach((id) => lines.push(`- ${specById[id] || id} (${id})`));
    if (regional.length > 10) lines.push(`… و${regional.length - 10} تخصصاً إقليمياً آخر`);
  }

  lines.push('ℹ️ هذه القائمة من خريطة التوفر — تحقق من منصة التوجيه الرسمية للتأكيد النهائي.');
  return lines.join('\n');
}

const STREAM_AR = {
  sciexp: 'علوم تجريبية',
  math: 'رياضيات',
  techmath: 'تقني رياضي',
  gestion: 'تسيير واقتصاد',
  lettres: 'آداب وفلسفة',
  langues: 'لغات أجنبية',
};
const AR_STREAM_TO_CODE = {
  'علوم تجريبية': 'sciexp',
  'رياضيات': 'math',
  'تقني رياضي': 'techmath',
  'تسيير واقتصاد': 'gestion',
  'آداب وفلسفة': 'lettres',
  'لغات أجنبية': 'langues',
};

function streamCode(streamRaw) {
  if (!streamRaw) return null;
  if (AR_STREAM_TO_CODE[streamRaw]) return AR_STREAM_TO_CODE[streamRaw];
  const s = String(streamRaw).toLowerCase();
  if (STREAM_TO_MIN[s]) return s;
  return null;
}

/* ---- Wilaya detection (per-wilaya 2025 averages in KB wilayaAverages) ----
   KB keys are Latin ("Ouargla", "Alger", …) plus a special "National" key and
   a few non-wilaya campuses ("Sci Islamiques Emir"). Map every Latin key that
   students actually ask about to its Arabic display name + query variants. */
const WILAYA_DEF = {
  'Adrar':              { ar: 'أدرار',           variants: ['adrar', 'ادرار'] },
  'Aflou':              { ar: 'أفلو',            variants: ['aflou', 'افلو'] },
  'Ain Defla':          { ar: 'عين الدفلى',      variants: ['ain defla', 'عين الدفلة'] },
  'Ain Temouchent':     { ar: 'عين تموشنت',      variants: ['ain temouchent', 'temouchent'] },
  'Alger':              { ar: 'الجزائر العاصمة',  variants: ['alger', 'algiers', 'العاصمة', 'ولاية الجزائر', 'الجزائر العاصمة'] },
  'Annaba':             { ar: 'عنابة',           variants: ['annaba', 'بونة'] },
  'Barika':             { ar: 'بريكة',           variants: ['barika'] },
  'Batna':              { ar: 'باتنة',           variants: ['batna'] },
  'Bechar':             { ar: 'بشار',            variants: ['bechar'] },
  'Bejaia':             { ar: 'بجاية',           variants: ['bejaia', 'bgayet'] },
  'Biskra':             { ar: 'بسكرة',           variants: ['biskra'] },
  'Blida':              { ar: 'البليدة',          variants: ['blida', 'بليدة'] },
  'Bordj Bou Arreridj': { ar: 'برج بوعريريج',    variants: ['bordj bou arreridj', 'برج بو عريريج'] },
  'Bou Saada':          { ar: 'بوسعادة',         variants: ['bou saada', 'boussaada', 'بو سعادة'] },
  'Bouira':             { ar: 'البويرة',          variants: ['bouira', 'بويرة'] },
  'Boumerdes':          { ar: 'بومرداس',         variants: ['boumerdes'] },
  'Chlef':              { ar: 'الشلف',           variants: ['chlef', 'شلف'] },
  'Constantine':        { ar: 'قسنطينة',         variants: ['constantine', 'قسمطينة'] },
  'Djelfa':             { ar: 'الجلفة',           variants: ['djelfa', 'جلفة'] },
  'El Bayadh':          { ar: 'البيض',           variants: ['el bayadh', 'bayadh'] },
  'El Oued':            { ar: 'الوادي',           variants: ['el oued', 'الواد'] },
  'El Tarf':            { ar: 'الطارف',           variants: ['el tarf', 'tarf'] },
  'Ghardaia':           { ar: 'غرداية',           variants: ['ghardaia'] },
  'Guelma':             { ar: 'قالمة',            variants: ['guelma'] },
  'Jijel':              { ar: 'جيجل',            variants: ['jijel'] },
  'Khenchela':          { ar: 'خنشلة',           variants: ['khenchela'] },
  'Laghouat':           { ar: 'الأغواط',          variants: ['laghouat'] },
  'Maghnia':            { ar: 'مغنية',            variants: ['maghnia'] },
  'Mascara':            { ar: 'معسكر',           variants: ['mascara'] },
  'Medea':              { ar: 'المدية',           variants: ['medea', 'مدية'] },
  'Mila':               { ar: 'ميلة',             variants: ['mila'] },
  'Mostaganem':         { ar: 'مستغانم',          variants: ['mostaganem'] },
  'Msila':              { ar: 'المسيلة',          variants: ['msila', "m'sila", 'مسيلة'] },
  'Naama':              { ar: 'النعامة',          variants: ['naama', 'نعامة'] },
  'Oran':               { ar: 'وهران',            variants: ['oran', 'wahran'] },
  'Ouargla':            { ar: 'ورقلة',            variants: ['ouargla', 'ورڨلة', 'ورجلان'] },
  'Oum El Bouaghi':     { ar: 'أم البواقي',       variants: ['oum el bouaghi'] },
  'Relizane':           { ar: 'غليزان',           variants: ['relizane', 'غيليزان'] },
  'Saida':              { ar: 'سعيدة',            variants: ['saida'] },
  'Setif':              { ar: 'سطيف',            variants: ['setif'] },
  'Sidi Bel Abbes':     { ar: 'سيدي بلعباس',     variants: ['sidi bel abbes', 'سيدي بل عباس', 'bel abbes'] },
  'Skikda':             { ar: 'سكيكدة',          variants: ['skikda'] },
  'Souk Ahras':         { ar: 'سوق أهراس',       variants: ['souk ahras'] },
  'Tamanrasset':        { ar: 'تمنراست',         variants: ['tamanrasset', 'تامنغست', 'تمنغست'] },
  'Tebessa':            { ar: 'تبسة',            variants: ['tebessa'] },
  'Tiaret':             { ar: 'تيارت',            variants: ['tiaret'] },
  'Tipaza':             { ar: 'تيبازة',           variants: ['tipaza'] },
  'Tissemsilt':         { ar: 'تيسمسيلت',        variants: ['tissemsilt'] },
  'Tizi Ouzou':         { ar: 'تيزي وزو',        variants: ['tizi ouzou', 'تيزي اوزو'] },
  'Tlemcen':            { ar: 'تلمسان',           variants: ['tlemcen'] },
  'Touggourt':          { ar: 'تقرت',            variants: ['touggourt', 'توقرت', 'تڨرت'] },
};
/* Note: bare "الجزائر" is deliberately NOT a variant for Alger — in queries it
   almost always means the country ("معدل الطب في الجزائر"), not the wilaya. */

/* Normalize Arabic hamza/taa-marbuta variants + Latin accents for matching. */
function normalizeWilayaText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u0655]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Lookup structures built once at module load. */
const _WILAYA_SINGLE = new Map(); // normalized single token → key
const _WILAYA_MULTI = [];         // { needle, key } — multi-word, longest first
for (const [key, def] of Object.entries(WILAYA_DEF)) {
  for (const v of [def.ar, ...def.variants]) {
    const n = normalizeWilayaText(v);
    if (!n) continue;
    if (n.includes(' ')) _WILAYA_MULTI.push({ needle: n, key });
    else _WILAYA_SINGLE.set(n, key);
  }
}
_WILAYA_MULTI.sort((a, b) => b.needle.length - a.needle.length);

/* Detect a wilaya mention in free text → Latin KB key (or null). */
function detectWilaya(text) {
  const q = normalizeWilayaText(text);
  if (!q) return null;
  for (const { needle, key } of _WILAYA_MULTI) {
    if (q.includes(needle)) return key;
  }
  for (const t of q.split(' ')) {
    if (_WILAYA_SINGLE.has(t)) return _WILAYA_SINGLE.get(t);
    // Tolerate attached Arabic prefixes: "بورقلة"، "لوهران"، "وورقلة"
    const stripped = t.replace(/^[وبلف]/, '');
    if (stripped.length >= 3 && stripped !== t && _WILAYA_SINGLE.has(stripped)) {
      return _WILAYA_SINGLE.get(stripped);
    }
  }
  return null;
}

function wilayaArName(key) {
  return WILAYA_DEF[key]?.ar || key;
}

/* GAP-08: Detect zone-name mentions (منطقة الغرب / الشرق / الوسط) in free text.
   Returns the matching circle object from GEO_CIRCLES, or null if no zone found.
   Called ONLY when detectWilaya() returns null (specific wilaya takes priority). */
const ZONE_VARIANTS = [
  { ids: [1], patterns: ['منطقة الشرق', 'منطقه الشرق', 'الشرق الجزائري'] },
  { ids: [2], patterns: ['منطقة الوسط', 'منطقه الوسط', 'الوسط الجزائري', 'وسط الجزائر'] },
  { ids: [3], patterns: ['منطقة الغرب', 'منطقه الغرب', 'الغرب الجزائري', 'غرب الجزائر'] },
  // bare zone names — checked only if "منطقة" not already caught above
  { ids: [1], patterns: ['الشرق'] },
  { ids: [2], patterns: ['الوسط'] },
  { ids: [3], patterns: ['الغرب'] },
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
  const wilayaList = (circle.wilayas || []).join(' ، ');
  const lines = [
    `## سياق جغرافي: ${circle.name_ar}`,
    `الولايات المنتمية لـ${circle.name_ar}: ${wilayaList}`,
    'ℹ️ المعدلات تختلف من ولاية لأخرى داخل المنطقة — للحصول على معدل دقيق اذكر اسم الولاية المحددة.',
  ];
  if (GEO_RULES.regional_programs) {
    lines.push(`قاعدة التكوينات الجهوية: ${String(GEO_RULES.regional_programs).slice(0, 350)}`);
  }
  return lines.join('\n');
}

/* Format one wilayaAverages entry — omit null streams. Returns null if all null. */
function formatWilayaNums(entry) {
  if (!entry) return null;
  const parts = [];
  if (entry.min1 != null) parts.push(`علوم تجريبية ${entry.min1}`);
  if (entry.min2 != null) parts.push(`رياضيات ${entry.min2}`);
  if (entry.min3 != null) parts.push(`تقني رياضي ${entry.min3}`);
  return parts.length ? parts.join(' / ') : null;
}

/* Per-spec wilaya context block (kept compact — well under ~500 tokens):
   - wilaya asked + data exists   → exact 2025 numbers for that wilaya
   - wilaya asked + no data there → explicit "not offered there" (no invented numbers)
   - no wilaya asked              → national minimum + coverage count + 3 lowest-threshold wilayas */
function buildWilayaBlock(spec, wilayaKey) {
  const wa = spec.wilayaAverages;
  if (!wa) return '';
  const realKeys = Object.keys(wa).filter((k) => k !== 'National' && WILAYA_DEF[k]);

  if (wilayaKey) {
    const arName = wilayaArName(wilayaKey);
    const nums = formatWilayaNums(wa[wilayaKey]);
    if (nums) return `معدلات القبول 2025 في ${arName}: ${nums}`;
    // GAP-02: check availability-map scope before emitting "غير متوفر"
    const avail = AVAILABILITY_MAP[spec.id];
    if (avail && avail.scope === 'national') {
      const natNums = formatWilayaNums(wa['National']);
      const lines = ['تخصص وطني: يُوجَّه حسب معدلك الوطني — لا يُشترط وجوده في ولايتك'];
      if (natNums) lines.push(`الحد الأدنى الوطني 2025: ${natNums}`);
      return lines.join('\n');
    }
    const lines = [`هذا التخصص غير متوفر في ولاية ${arName} حسب معطيات 2025`];
    const natNums = formatWilayaNums(wa['National']);
    if (natNums) lines.push(`(تسجيل وطني — الحد الأدنى الوطني 2025: ${natNums})`);
    return lines.join('\n');
  }

  // No wilaya in the query → compact national summary, never the full dump.
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
    return natNums ? `معدلات 2025 (تسجيل وطني): ${natNums}` : '';
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

  const lines = [`ملخص معدلات 2025 حسب الولايات: متوفر في ${realKeys.length} ولاية/موقع.`];
  if (natNums) lines.push(`الحد الأدنى الوطني 2025: ${natNums}`);
  if (lowest.length) lines.push(`أقل العتبات: ${lowest.join(' ، ')}`);
  return lines.join('\n');
}

/* Format per-stream thresholds — only show streams with actual data.
   null means "no admissions data for this stream", NOT "stream is rejected". */
function formatAverages(resolved) {
  if (!resolved) return 'غير متوفرة';
  const lines = [];
  if (resolved.min1 != null) lines.push(`علوم تجريبية: ${resolved.min1}`);
  if (resolved.min2 != null) lines.push(`رياضيات: ${resolved.min2}`);
  if (resolved.min3 != null) lines.push(`تقني رياضي: ${resolved.min3}`);
  return lines.length ? lines.join(' · ') : 'بيانات المعدلات غير متوفرة بعد';
}

/* ---- Section excerpting -------------------------------------------------- */
/* Pull the most useful sections by fuzzy title keywords, trim each chunk. */
const SECTION_WANTS = [
  { label: 'تعريف', keys: ['تعريف', 'التعريف', 'real talk', 'فلسفة'] },
  { label: 'فرص العمل', keys: ['فرص العمل', 'الآفاق', 'تعمل', 'العمل في'] },
  { label: 'مدة/نظام الدراسة', keys: ['نظام الدراسة', 'مدة الدراسة', 'تنظيم الأسبوع'] },
  { label: 'التوجيه/الشعب', keys: ['الشعب المقبولة', 'التوجيه', 'معدلات القبول', 'معلومات المدرسة'] },
];

function trim(text, max = 400) {
  if (!text) return '';
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trim() + '…' : t;
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
      const body = trim(sections[match], 400);
      if (body) out.push(`${want.label} (${match}): ${body}`);
    }
  }
  // Fallback: if no sections matched, include first 2 by position (handles Darija-titled specs)
  if (out.length === 0) {
    Object.entries(sections).slice(0, 2).forEach(([title, content]) => {
      const body = trim(content, 400);
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
  const fmt = (v) => (v === null || v === undefined ? '—' : v);
  const loc = r.wilaya ? ` [${r.wilaya}]` : '';
  return `${r.etab}${loc} — تجريبية:${fmt(r.min1)} رياضيات:${fmt(r.min2)} تقني:${fmt(r.min3)}`;
}

/* ---- Retrieval (RAG) ---------------------------------------------------- */
function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

/* GAP-05: Strip common Arabic attached prefixes (لل، بال، وال، فال، كال، ال)
   so "للطب" matches "الطب", "بالرياضيات" matches "الرياضيات", etc.
   Returns the root form (still lowercased Arabic). */
function stripArabicPrefix(token) {
  // Order matters: try longest prefix first to avoid double-stripping
  const prefixes = ['لل', 'بال', 'وال', 'فال', 'كال', 'ال'];
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
   "إنجينيور معلوماتية" or "دكتور" correctly retrieve the relevant KB specs.
   Operates on the raw query string and returns an augmented string. */
const DARIJA_SYNONYMS = [
  // engineering / computer science
  { pattern: /إنجينيور|مهندس/g,       expansion: 'هندسة' },
  // medicine / health
  { pattern: /دكتور|طبيب/g,           expansion: 'طب مدرسة' },
  // law
  { pattern: /محامي/g,                expansion: 'حقوق' },
  // informatics / coding
  { pattern: /كمبيوتر|كوداج|كودينغ/g, expansion: 'إعلام آلي' },
  // business / economics
  { pattern: /أعمال|بيزنيس/g,         expansion: 'تسيير اقتصاد' },
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
const ENSIA_SIGNALS = ['ensia', 'ذكاء اصطناعي', 'ذكاء الاصطناعي', 'ia artificielle', 'intelligence artificielle', 'ai school', 'مدرسة الذكاء', 'سيدي عبد الله'];
const CPGE_SIGNALS = ['cpge', 'classes préparatoires', 'prépa', 'prepa', 'تحضيرية', 'كلاس بريبا', 'mpsi', 'pcsi', 'mp ', ' pc ', 'psi', 'مرحلة تحضيرية', 'مدرسة عليا مسابقة', 'grandes écoles'];
const WISHLIST_SIGNALS = ['بطاقة الرغبات', 'bطاقة', 'carte de voeux', 'قائمة الرغبات', 'اختيار التخصص', 'كيف أملأ', 'كيف نملا', 'ماذا أختار', 'واش نختار', 'نصائح التوجيه', 'ترتيب الرغبات'];
const ORIENTATION_SIGNALS = ['توجيه الجامعي', 'التوجيه الجامعي', 'كيف يشتغل التوجيه', 'مراحل التوجيه', 'خطوات التوجيه', 'inscription en ligne', 'نتائج التوجيه', 'classement', 'résultats orientation'];

function detectIntent(rawQuery) {
  const q = rawQuery.toLowerCase();
  return {
    ensia:       ENSIA_SIGNALS.some((s) => q.includes(s)),
    cpge:        CPGE_SIGNALS.some((s) => q.includes(s)),
    wishlist:    WISHLIST_SIGNALS.some((s) => q.includes(s)),
    orientation: ORIENTATION_SIGNALS.some((s) => q.includes(s)),
  };
}

/* Score every speciality against the user's message; return top selection. */
function retrieve(message, conversation, profile, k = 6) {
  const userCode = streamCode(profile?.stream);
  const minKey = userCode ? STREAM_TO_MIN[userCode] : null;

  // Build the query from the latest message plus a little recent context.
  const recent = (conversation || [])
    .slice(-4)
    .map((m) => m.content || '')
    .join(' ');
  // GAP-Q23: expand Darija terms to MSA equivalents before tokenizing
  const expandedMessage = expandDarijaSynonyms(`${message} ${recent}`);
  const queryTokens = new Set(tokenize(expandedMessage));
  // GAP-05: expand query tokens with Arabic prefix-stripped variants
  expandWithPrefixStrip(queryTokens);
  const rawQuery = `${message} ${recent}`.toLowerCase();

  // Detect special intents early — these inject static knowledge blocks rather than KB entries.
  const intent = detectIntent(rawQuery);

  const scored = SPECIALITIES.map((spec) => {
    const haystack = specText(spec).toLowerCase();
    const hayTokens = tokenize(haystack);
    const hayTokenSet = new Set(hayTokens);
    // GAP-05: also expand haystack tokens with prefix-stripped forms
    expandWithPrefixStrip(hayTokenSet);

    let score = 0;
    // Keyword overlap (token-level).
    for (const t of queryTokens) {
      if (hayTokenSet.has(t)) score += 1;
    }
    // Strong boost for explicit name / id substring mentions.
    const names = [spec.id, spec.name_fr, spec.name_ar, spec.dataName].filter(Boolean);
    let named = false;
    for (const n of names) {
      const nl = String(n).toLowerCase();
      if (nl.length >= 2 && rawQuery.includes(nl)) {
        score += 12;
        named = true;
      } else {
        // Token-level partial boost: "طب" matches "تخصص الطب – MÉDECINE"
        // GAP-05: expand name tokens with prefix-stripped variants for better matching
        const nameTokenSet = new Set(tokenize(nl));
        expandWithPrefixStrip(nameTokenSet);
        for (const qt of queryTokens) {
          if (qt.length >= 3 && nameTokenSet.has(qt)) {
            score += 6;
            named = true;
            break;
          }
        }
      }
    }
    // ID token boost: "esi" matches "esi-alger"
    const idTokens = spec.id.split('-');
    for (const qt of queryTokens) {
      if (qt.length >= 3 && idTokens.includes(qt)) {
        score += 4;
        named = true;
        break;
      }
    }
    // Intent-based boosts — surface high-signal entries for special queries.
    if (intent.ensia && (spec.id === 'ensia' || String(spec.name_ar || '').includes('ذكاء'))) {
      score += 15;
      named = true;
    }
    // Stream-fit boost: speciality accepts the student's stream.
    if (minKey && minKey !== 'general' && spec.resolvedAverages) {
      const v = spec.resolvedAverages[minKey];
      if (v !== null && v !== undefined) score += 2;
    }
    // Boost for gestion/lettres/langues: their filières have معدل عام access (no numeric threshold column).
    if (minKey === 'general' && userCode && NON_SCIENCE_ELIGIBLE[userCode]) {
      if (NON_SCIENCE_ELIGIBLE[userCode].has(spec.id)) score += 3;
    }

    return { spec, score, named };
  });

  scored.sort((a, b) => b.score - a.score);

  // Top retrieval score is exposed on the returned array (result.topScore) so the
  // handler can decide whether to augment with web search (low-confidence trigger).
  const topScore = scored[0]?.score ?? 0;

  // AI-2: If top score < 3 (only common-word overlap, no name/id match), return empty → triggers web search.
  // Exception: intent signals detected → always return context (intent blocks added at prompt-build time).
  if (topScore < 3 && !intent.ensia && !intent.cpge && !intent.wishlist && !intent.orientation) {
    const none = [];
    none.topScore = topScore;
    return none;
  }

  // Always include any explicitly-named speciality, then fill with top scorers.
  const selected = [];
  const chosen = new Set();
  for (const s of scored) {
    if (s.named) {
      selected.push(s.spec);
      chosen.add(s.spec.id);
    }
  }
  for (const s of scored) {
    if (selected.length >= k) break;
    if (chosen.has(s.spec.id)) continue;
    selected.push(s.spec);
    chosen.add(s.spec.id);
  }
  const result = selected.slice(0, Math.max(k, selected.length));
  result.topScore = topScore;
  return result;
}

/* Render the selected specialities into a compact, bounded context string.
   wilayaKey (optional): Latin KB key of the wilaya the student asked about. */
function buildContext(specs, wilayaKey = null) {
  const availNotes = buildAvailabilityNotes(specs, wilayaKey);
  return specs
    .map((spec) => {
      const sections = pickSections(spec.sections);
      const rows = rowsForSpec(spec, 6).map(formatRow);
      const parts = [
        `### [${spec.id}] ${spec.name_ar} / ${spec.name_fr}`,
        `التصنيف: ${spec.category}`,
        `معدلات القبول حسب الشعبة: ${formatAverages(spec.resolvedAverages)}`,
      ];
      const wilayaBlock = buildWilayaBlock(spec, wilayaKey);
      if (wilayaBlock) parts.push(wilayaBlock);
      // Availability note: override generic "غير متوفر" with specific wilaya list
      if (availNotes[spec.id]) parts.push(availNotes[spec.id]);
      if (sections.length) parts.push(sections.join('\n'));
      if (rows.length) parts.push('مؤسسات مرجعية:\n- ' + rows.join('\n- '));
      return parts.join('\n');
    })
    .join('\n\n---\n\n');
}

/* ---- Official guide context builder ------------------------------------- */
/* Produces a compact, structured summary of accessible programs from الدليل الوزاري
   for the student's stream + wilaya. Injected into the system prompt as authoritative
   official data (complements the KB RAG context). Returns '' when no data available. */
function buildGuideContext(profile) {
  const p = profile || {};
  const code = streamCode(p.stream);
  if (!code) return '';

  const wilaya = p.wilaya && p.wilaya !== 'غير محددة' ? p.wilaya : null;
  const wNum = wilaya ? WILAYA_TO_NUM[wilaya] : null;

  const streamProgs = GUIDE_BY_STREAM[code] || [];
  if (streamProgs.length === 0) return '';

  // Filter to programs the student's wilaya can actually access
  const accessible = wNum
    ? streamProgs.filter((pr) => pr.scope === 'national' || (pr.circleWilayaNums || []).includes(wNum))
    : streamProgs;

  if (accessible.length === 0) return '';

  // Group by academic field (ميدان)
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
    `## الدليل الوزاري الرسمي — برامج متاحة لشعبة ${STREAM_AR[code] || code}${wilaya ? ` من ولاية ${wilaya}` : ''}:`,
  ];
  for (const [field, data] of byField) {
    const instSample = [...data.insts].slice(0, 3).join(' ، ');
    const scope = data.national > 0 ? '(وطني)' : '(إقليمي)';
    const basis = data.basis === 'weighted_or_general' ? 'موزون أو عام' : 'معدل عام';
    lines.push(`- **${field}** ${scope} — مؤسسات: ${instSample || 'متعددة'} — ترتيب: ${basis}`);
  }

  return lines.join('\n');
}

/* ============================================================
   WEB SEARCH AUGMENTATION (Tavily) — optional, key-gated
   Enabled only when TAVILY_API_KEY is set; otherwise the whole
   feature is inert and the request flow is byte-identical.
   Design doc: tawjihi/data/kb/_WEBSEARCH-DESIGN.md
   ============================================================ */

/* Trigger threshold on the retrieve() scoring scale.
   A name/id match contributes ≥ +4 (id token) / +6 (name token) / +12 (substring);
   below 6 the top hit was matched by generic word overlap only → KB likely can't
   answer directly, so we augment with a web search. */
const WEB_SEARCH_SCORE_THRESHOLD = 6;

/* Time-sensitive intent — news / calendar / deadline / new-programme queries
   where the static KB is stale by construction. */
const TIME_SENSITIVE_SIGNALS = [
  'التسجيلات 2026', 'التسجيلات ٢٠٢٦', 'تسجيلات 2026', 'تسجيلات ٢٠٢٦',
  '2026', '٢٠٢٦',
  'رزنامة', 'موعد', 'مواعيد', 'آخر أجل', 'اخر اجل', 'آخر اجل',
  'جديد', 'جديدة', 'أخبار', 'اخبار', 'فتح تخصص', 'فتح تخصصات',
  'calendrier', 'date limite', 'deadline', 'nouveau', 'nouvelle', 'actualité',
];
function isTimeSensitive(rawQuery) {
  const q = String(rawQuery || '').toLowerCase();
  return TIME_SENSITIVE_SIGNALS.some((s) => q.includes(s));
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
   unrestricted fallback). Never throws — returns null on any failure/timeout
   so the chat request always proceeds. */
async function webSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    let results = await tavilyCall(apiKey, query, TAVILY_PREFERRED_DOMAINS, controller.signal);
    if (results.length === 0) {
      // Domain-restricted search found nothing — retry unrestricted within the same deadline.
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
  const lines = ['## نتائج بحث من الإنترنت (تحقق منها)'];
  for (const r of results.slice(0, 3)) {
    const title = trim(r.title, 120) || 'بدون عنوان';
    const snippet = trim(r.content, 350);
    lines.push(`- **${title}**${snippet ? ` — ${snippet}` : ''}\n  المصدر: ${r.url || 'غير معروف'}`);
  }
  lines.push(
    '⚠️ قواعد استعمال نتائج الإنترنت (إلزامية):\n' +
    '1. هذه النتائج **ثانوية** — قاعدة المعرفة أعلاه لها الأولوية دائماً عند أي تعارض.\n' +
    '2. إذا استعملت معلومة من نتيجة، **اذكر مصدرها** (اسم الموقع أو الرابط) صراحة في ردك.\n' +
    '3. ممنوع منعاً باتاً أخذ أي **معدل قبول أو رقم رسمي** من هذه النتائج — الأرقام الرسمية من قاعدة المعرفة فقط.'
  );
  return lines.join('\n');
}

/* ---- System prompt (CHAT-CONTRACT.md §4) -------------------------------- */
function buildSystemPrompt(profile, contextBlock, guideBlock, orientationMode = false, emptyContext = false, intent = {}, wilayaAr = null, webBlock = '', ministryBlock = '', geoZoneAr = null) {
  const p = profile || {};
  const code = streamCode(p.stream);
  const streamLabel = code ? STREAM_AR[code] || p.stream : p.stream || 'غير محددة';

  return `أنت "توجيهي"، مرشد ذكي لطلاب الجزائر في التوجيه الجامعي بعد البكالوريا، تابع لـ BAC STORY.

# شخصيتك ولغتك
- أخ كبير محبّ وصادق، بالدارجة الجزائرية الدافئة.
- الأساس دارجة جزائرية — إذا سألك المستخدم بالفرنسية رد بالفرنسية، إذا سألك بالعربية الفصحى رد بالعربية الفصحى.

# حدود اختصاصك (AI-15)
إذا سأل المستخدم عن موضوع لا علاقة له بالتوجيه الجامعي الجزائري (هجرة، منح خارجية، أسئلة شخصية...)، اعتذر بأدب وأخبره أنك متخصص في التوجيه الجامعي الجزائري فقط.

# قواعد الكتابة (إلزامية)
- استعمل بنية Markdown: سطر تمهيد قصير، ثم عناوين \`###\` أو قوائم نقطية \`- \` و**عريض**.
- ممنوع منعاً باتاً كتابة جدار نص واحد بلا تنسيق.
- أسند كل رقم (معدل، مؤسسة، ولاية) إلى البيانات المزودة أسفله فقط — لا تخترع أي معدل أو جامعة أو رقم.
- إذا سُئلت عن تخصص غير موجود في البيانات، اعترف بأن معلوماتك محدودة عنه ولا تخمّن أرقامه.
- اختم التوصيات الجوهرية بسطر صدق قصير حول تأكيد المعلومة على البوابة الرسمية.

# الكتل التوجيهية (Directive blocks)
أضِفها في **نهاية** الرد فقط عند الحاجة، كل واحدة في كتلة محصورة بثلاث علامات (fenced) و JSON صحيح، وفقط لتخصصات لها id ضمن البيانات المزودة:

1) عند اقتراح تخصص/تخصصات:
\`\`\`spec-cards
[{"id":"<id>","name":"<الاسم>","meta":"<التصنيف> · <الشعبة>","avg":"<المعدل>","color":"var(--cat-medical)"}]
\`\`\`

2) عند مقارنة تخصصين أو أكثر:
\`\`\`compare
{"title":"مقارنة بين ...","fields":[{"key":"avg","label":"معدل القبول"},{"key":"streams","label":"الشعب المقبولة"},{"key":"duration","label":"مدة الدراسة"},{"key":"careers","label":"أبرز فرص العمل"}],"items":[{"id":"<id>","name":"<الاسم>","avg":"<المعدل>","streams":"...","duration":"...","careers":"..."}]}
\`\`\`

3) عندما يسأل "هل أُقبل / واش نقدر ندخل في X / am I eligible":
\`\`\`verdict
{"id":"<id>"}
\`\`\`
في كتلة verdict اكتب **فقط** \`{"id":"..."}\` — الواجهة الأمامية تحسب القرار النهائي بنفسها، لا تكتب أنت الحالة أو العتبة.

4) عندما تسأل الطالب سؤالاً هيكلياً (في وضع الاستكشاف أو أي سؤال متعدد الخيارات):
\`\`\`question
{"text":"نص السؤال هنا","options":["خيار 1","خيار 2","خيار 3","خيار 4"],"allowCustom":true}
\`\`\`
تُعرض الخيارات كأزرار interactifs في الواجهة — لا تعيد كتابتها في النص.

5) أحياناً فقط — عندما يكون هناك أسئلة متابعة طبيعية ومفيدة للسياق (ليس بعد كل رد):
\`\`\`followups
["سؤال متابعة 1", "سؤال متابعة 2"]
\`\`\`
القواعد: 2-3 أسئلة قصيرة كحد أقصى، بنفس لغة المحادثة، مرتبطة مباشرة بما ناقشناه. لا تضيفها بعد ردود مكتملة أو إجابات نهائية — فقط عندما يُرجَّح أن الطالب سيريد الاستمرار في نفس المسار.

# تنويع الافتتاحيات (إلزامي)
لا تبدأ كل رد بنفس العبارة. نوّع: ابدأ أحياناً بسطر قصير يجيب مباشرة، أو باستفهام، أو بنقطة أساسية. لا تفرض "واش راك!" في كل رد — استعملها عند الترحيب فقط.

# ملف الطالب
- الاسم: ${p.name || 'صديقي'}
- الشعبة: ${streamLabel}
- المعدل: ${p.average || '—'}/20
- الولاية: ${p.wilaya || 'غير محددة'}
- الاهتمامات: ${Array.isArray(p.interests) ? p.interests.join('، ') : p.interests || 'غير محددة'}
- الطموح: ${p.ambition_text || p.ambition || 'غير محدد'}

${orientationMode ? `
# وضع الاستكشاف (مُفعَّل — الطالب لا يعرف مجاله)
${p.stream ? `ملاحظة أهليّة (AI-10): المستخدم في شعبة ${streamLabel}، معدله ${p.average || 'غير محدد'}. تأكد أن توصياتك ضمن الشعبة ومعدل القبول.` : ''}
اتبع هذا المسار بدقة تامة:
1. اسأل سؤالاً واحداً فقط في كل رد — لا تجمع أسئلة.
2. استعمل دائماً كتلة \`\`\`question\`\`\` لكل سؤال (لا تكتب الخيارات في النص).
3. انتظر إجابة الطالب قبل الانتقال للسؤال التالي.
4. بعد 4-5 أسئلة، حلّل الإجابات وأوصِ بـ 3-5 تخصصات مناسبة مع \`\`\`spec-cards\`\`\`.
5. لا تعطِ توصيات نهائية قبل فهم ميوله من عدة زوايا.

### الأسئلة بهذا الترتيب (صيغها في كتلة question):
س1: "شنو أكثر شيء يمتعك وتحب تعمله؟" | خيارات: ["حل مسائل تقنية ورياضية 🔧","مساعدة الناس والتواصل معهم 🤝","البحث والتجربة واكتشاف أشياء جديدة 🔬","الإدارة والأعمال والتنظيم 📊","الإبداع والتصميم والفن 🎨","التعليم ونقل المعرفة للآخرين 📚"]
س2: "في أي مادة كنت تتألق أكثر؟" | خيارات: ["الرياضيات والفيزياء","العلوم التجريبية والطبيعية","الاقتصاد والمحاسبة","اللغات والأدب","العلوم الإنسانية والتاريخ"]
س3: "أين تتخيل نفسك مستقبلاً؟" | خيارات: ["قطاع الصحة والمستشفيات 🏥","شركة أو مؤسسة (مكتب) 🏢","مخبر بحثي أو أكاديمية 🔬","الميدان ومشاريع الهندسة ⚙️","شركة تكنولوجيا أو ستارتاب 💻","القانون والإدارة الحكومية ⚖️"]
س4: "شنو الأهم بالنسبة ليك مهنياً؟" | خيارات: ["الشغف — نحب ما ندرس ونعمل ❤️","الراتب المرتفع — الكفاءة المالية 💰","خدمة المجتمع والمساهمة فيه 🤲","المكانة الاجتماعية والاحترام 🏆","التوازن بين العمل والحياة الشخصية ⚖️","العمل الدولي والسفر للخارج 🌍"]
س5: "كيف تتخيل روحك بعد 10 سنين؟" | خيارات: ["طبيب أو مختص في الصحة","مهندس أو خبير تقني","رجل/سيدة أعمال أو مدير","باحث أو أستاذ جامعي","محامٍ أو قانوني","مبرمج أو خبير رقمي","في مجال إبداعي أو فني"]
` : ''}
# حقائق ثابتة عن التعليم الجزائري (لا تتجاوزها)
## الشعب الست الوحيدة في الثانوية الجزائرية (لا تذكر شعبة غير هذه الست أبداً):
1. علوم تجريبية
2. رياضيات
3. تقني رياضي
4. تسيير واقتصاد
5. آداب وفلسفة
6. لغات أجنبية
⚠️ "علوم إنسانية" ليست شعبة ثانوية — هي ميدان جامعي. لا تذكرها أبداً كشعبة للبكالوريا.

## مدد الدراسة (أعطِ الرقم الدقيق، لا تقل "6-7 سنوات"):
- طب عام: 7 سنوات (6 دراسة + سنة انترنا إلزامية)
- طب الأسنان: 6 سنوات (5 دراسة + سنة انترنا)
- الصيدلة: 5 سنوات
- البيطرة: 5 سنوات
- مهندس دولة (مدارس عليا): 5 سنوات (2 تحضيري + 3 تخصص)
- ليسانس LMD: 3 سنوات | ماستر LMD: 2 سنوات | دكتوراه: 3 سنوات

## قبول الشعب في الطب وعلوم الصحة:
- الطب، الصيدلة، طب الأسنان: الأولوية 1 علوم تجريبية، الأولوية 2 رياضيات، الأولوية 3 تقني رياضي (مقبول في بعض الولايات والجامعات)
- شرط التأهل: معدل البكالوريا ≥ 14/20 للمشاركة في التوجيه الطبي
- المعدلات الوطنية 2025: طب 16.65/17.15 | صيدلة 16.26/16.76 | طب أسنان 16.99/17.50
- البيطرة: تقبل علوم تجريبية ورياضيات — معدل ≥ 14/20 شرط التأهل
- المعدلات تختلف حسب الولاية — الجنوب عادةً أقل تنافسية من الشمال

## شعبة تسيير واقتصاد — التخصصات الجامعية المتاحة (بمعدل ≥ 10):
علوم اقتصادية تجارية وتسيير (SECSG)، الحقوق، علم الاجتماع، الإعلام والاتصال
بمسابقة: EHEC (المدرسة العليا للتجارة)، ENSSEA

## شعبة آداب وفلسفة — التخصصات الجامعية المتاحة (بمعدل ≥ 10):
الحقوق، اللغات والترجمة، الإعلام والاتصال، علم الاجتماع، الفلسفة، الشريعة الإسلامية

## شعبة لغات أجنبية — التخصصات الجامعية المتاحة (بمعدل ≥ 10):
اللغات والترجمة، الإعلام والاتصال، الحقوق، علم الاجتماع

## دقة أسماء الجامعات:
- قل "جامعة الجزائر 1 - بن يوسف بن خدة" لا "جامعة الجزائر"
- قل "جامعة قسنطينة 1 فرحات عباس" أو "قسنطينة 3 صالح بوبنيدر" (لا "قسنطينة" فقط)
- المستشفى الجامعي للطب في العاصمة: Mustapha Pacha, Lamine Debaghine, Nafissa Hamoud
- جامعة علوم الصحة (الزيانية) = المؤسسة الجديدة للطب في الجزائر العاصمة (منذ 2023)

## مدارس الإعلام الآلي في الجزائر — الحقيقة الكاملة:
هذه المدارس الأربع تتنافس في نفس المسابقة الوطنية — نفس نظام الدراسة، نفس الشهادة. الفرق في البيئة والتخصصات:
1. **ESTIN** أميزور بجاية (2019) — الأحدث والأفضل من حيث البنية التحتية والإمكانيات المادية وحداثة التخصصات. تدرّس بالإنجليزية. تخصصات حصرية: IoT (يبدأ هذا العام، الوحيدة في الجزائر)، AI، أمن سيبراني. علوم 17.45 / رياضيات 17.79 / تقني 18.15. (id: estin)
2. **ESI الجزائر** (واد سمار) — الأقدم (1969) والأعلى معدل قبول (الأكثر تنافسية). تخصصات: IS، ISI، GL، SID. علوم 18.55 / رياضيات 18.19 / تقني 18.93. (id: esi-alger)
3. **ESI SBA** سيدي بلعباس (2014) — علوم 17.36 / رياضيات 17.70 / تقني 18.06. (id: esi-sba)
4. **ENSTA** الجزائر درقانة (2023) — علوم 17.39 / رياضيات 17.15 / تقني 18.10. (id: ensta)
⚠️ تنبيه مهم: **ESI قليعة** (id: esi-kolea) مدرسة تجارية/اقتصادية — ليست مدرسة إعلام آلي على الإطلاق. لا تذكرها كمدرسة إعلام آلي أبداً.
⚠️ لا توجد مدرسة اسمها "ENST" أو "ESTA" للإعلام الآلي في الجزائر — هذه أسماء غير موجودة، لا تذكرها.
مدارس قطب سيدي عبد الله الجديدة (أعلى المعدلات): ENSIA ذكاء اصطناعي — علوم تجريبية 18.59 / رياضيات 18.95 / تقني 19.37 | ENSCS أمن سيبراني 18.34 | ENSAS أنظمة مستقلة 18.21.

## مسار التوجيه الجامعي 2025 — خطوة بخطوة (الطلاب يسألون دائماً عن هذا)
1. **التسجيل على المنصة الرقمية** — بعد إعلان نتائج البكالوريا مباشرة، يفتح الديوان الوطني للامتحانات (ONEC) بوابة inscription.mesrs.dz لمدة أسبوع تقريباً.
2. **إدخال بطاقة الرغبات** — يختار الطالب ما يصل إلى 20 رغبة مرتبة حسب الأولوية (من الأعلى طموحاً إلى الأقل). كل رغبة = مؤسسة + تخصص.
3. **التصنيف الآلي (Classement)** — يرتب النظام الطلاب على كل رغبة بالمعدل الموزون (أو العام حسب الميدان) مقارنةً بالطاقة الاستيعابية.
4. **إعلان نتائج التوجيه** — تظهر على البوابة في غضون أسبوع إلى أسبوعين. يحصل الطالب على أعلى رغبة ممكنة ضمن قائمته.
5. **التسجيل الجامعي الفعلي** — يدفع الطالب رسوم التسجيل إلكترونياً عبر PROGRES بالبطاقة الذهبية — يصبح التسجيل نهائياً بمجرد الدفع.
⚠️ **لا يوجد طعن رسمي في نتائج التوجيه** — الآليات الفعلية المنصوص عليها في الدليل هي:
- تغيير بطاقة الرغبات خلال فترة التأكيد (27-29 جويلية 2025) قبل التأكيد النهائي.
- **المرحلة الثانية** (6-8 أوت 2025): لمن لم يتحصل على أي اختيار — يملأ بطاقة رغبات جديدة من 6 اختيارات.
- **التحويل** (الحالات الخاصة): يُودَع عبر https://progres.mesrs.dz/webetu حتى 22 أوت 2025، ويعالجه مدير المؤسسة.

## معدل التوجيه الموزون — الصيغة الرسمية (MESRS 2025)
\`\`\`
المعدل الموزون = (معدل البكالوريا × 2 + علامة المادة الأساسية) ÷ 3
\`\`\`
**المادة الأساسية حسب الميدان:**
- رياضيات وإعلام آلي (MI — ESI, ESTIN, ENSIA...): **الرياضيات**
- علوم وتكنولوجيا (ST): **الفيزياء**
- علوم المادة (SM): **الفيزياء**
- طب / صيدلة / طب أسنان: **علوم الطبيعة والحياة**
- حقوق وعلوم سياسية: **اللغة العربية**
- اقتصاد وتسيير وتجارة (SEGC): **التسيير أو الاقتصاد**
- لغات أجنبية (LLE): **اللغة الأجنبية المختارة**
⟹ مثال: طالب رياضيات، معدل باك 17/20، علامة رياضيات 18/20 → موزون = (17×2+18)÷3 = **17.33**
⟹ مثال: علوم تجريبية، معدل باك 16/20، علامة SNV 15/20 → موزون (للطب) = (16×2+15)÷3 = **15.67**

## CPGE — Classes Préparatoires (التحضيريات) — مختلفة عن المدارس العليا المباشرة
كثير من الطلاب يخلطون بين CPGE والقبول المباشر في المدارس العليا — هذا الفرق جوهري:
- **CPGE = مرحلة تحضيرية 2 سنوات** في ثانويات/مؤسسات مختارة (MPSI، PCSI للسنة 1 → MP، PC، PSI للسنة 2).
- في نهاية السنة الثانية، يتقدم الطالب لـ**مسابقة وطنية موحدة** (Concours National) يتنافس فيها على مقاعد المدارس العليا الهندسية (ENP، USTHB هندسة...).
- **تختلف عن** القبول المباشر بالمعدل في ESI/ESTIN/ENSIA/ENS — تلك مدارس يُوجَّه إليها الطالب مباشرة عبر بطاقة الرغبات.
- CPGE تُقدَّم في مؤسسات مثل Lycée Ferhat Abbas, Lycée technique d'Oran, وغيرها — لها كود FRN في بطاقة الرغبات.
- سنوات الدراسة: 2 سنوات تحضيري + 3 سنوات في المدرسة العليا = **5 سنوات مهندس دولة**.
⟹ نصيحة: إذا كان هدف الطالب مدرسة هندسية عليا وعلامات الرياضيات ممتازة، CPGE خيار استراتيجي.

## ENSIA — المدرسة الوطنية العليا للذكاء الاصطناعي
- **الموقع**: سيدي عبد الله (قطب التكنولوجيا الجديد) — ولاية الجزائر
- **التأسيس**: 2021 (من أحدث المدارس العليا في الجزائر)
- **التخصص**: ذكاء اصطناعي، تعلم الآلة (Machine Learning)، روبوتيك
- **لغة التدريس**: الإنجليزية أساساً
- **الشهادة**: مهندس دولة 5 سنوات (2 تحضيري + 3 تخصص)
- **معدلات القبول 2025**: علوم تجريبية **18.59** | رياضيات **18.95** | تقني رياضي **19.37** (الأعلى في الجزائر)
- **الأولوية**: الشعبتان المقبولتان هما رياضيات (P1) وعلوم تجريبية (P2) وتقني رياضي (P3)
- **مقارنة**: أعلى من ESI الجزائر في الشعبة العلمية — المنافسة شرسة جداً
⚠️ لا تخلط بين ENSIA وESI أو ENSTA — كل واحدة مدرسة مستقلة بتخصصات مختلفة.
ENSIA هي المدرسة المخصصة كلياً للذكاء الاصطناعي في الجزائر — لكن ESTIN بجاية تقدم أيضاً تخصص AI وIoT وأمن سيبراني ضمن مساراتها.

## نصائح بطاقة الرغبات — استراتيجية ملء القائمة
⚠️ **الحد الرسمي (الدليل الوزاري 2025): 6 اختيارات على الأقل و10 اختيارات على الأكثر** — لا أكثر من 10، لا أقل من 6.
يجب أن تتضمن البطاقة وجوباً مسارين (02) على الأقل في الليسانس ذات التسجيل المحلي أو الجهوي.
1. **الترتيب مهم جداً** — يُوجَّه الطالب لأعلى رغبة ممكنة، لذا ضع الأحلام أولاً وليس الخيارات الآمنة.
2. **استغل الـ10 اختيارات كاملاً** — الحد الأقصى 10 اختيارات؛ ملء القائمة إلى 10 يضمن أكبر فرصة للحصول على تخصص مناسب.
3. **الخيارات الجهوية أقل تنافسية** — التسجيل الجهوي (FRR) يمنح فرصة أكبر للولايات البعيدة.
4. **تنويع الاختيارات** — ضع مزيجاً من الطموحات العالية (طب، ESI، ENSIA) + خيارات وسط + خيارات آمنة (جامعة قريبة بتخصص مناسب).
5. **التحقق من الأهلية قبل الاختيار** — الاختيار بدون استيفاء شروط الشعبة أو الحد الأدنى يُلغى تلقائياً.
6. **الولاية والمؤسسة** — بعض التخصصات متاحة فقط في ولايات معينة (FRL) — تأكد أن رغبتك تطابق دائرتك الجغرافية.

## التوجيه شبه الطبي (وزارة الصحة) — نظام مختلف تماماً
- التوجيه شبه الطبي **لا يمر عبر بوابة MESRS** — له منصة وزارة الصحة المستقلة.
- **التخصصات**: تمريض، قبالة، علاج طبيعي (kiné)، تغذية، مخبرية، أشعة، صيدلة مساعدة...
- **شرط الحد الأدنى**: لا يوجد حد أدنى رسمي للمعدل — الترتيب يكون بالمعدل العام ضمن مقاعد الولاية (FRL).
- **التقويم**: مختلف عن الجامعي — التسجيل يفتح في فترة مستقلة، تابع إعلانات وزارة الصحة.
- **التنافس**: يختلف كثيراً من ولاية لأخرى — الولايات الكبرى (الجزائر، وهران، قسنطينة) أكثر تنافسية.
- **مدة الدراسة**: 3 سنوات لمعظم التخصصات.
⚠️ خطأ شائع: الطلاب يعتقدون أن معدل 14/20 شرط للتوجيه شبه الطبي — هذا غير صحيح، الشرط الوحيد هو النجاح في البكالوريا.

## ⚠️ ممنوع مطلقاً — أخطاء يجب تجنبها:
1. **لا تخترع معدلات ولايات** غير موجودة في بياناتك — قل "المعدل يختلف حسب الولاية، تحقق من بوابة inscription.mesrs.dz".
2. **ESI القليعة** (esi-kolea) مدرسة تجارية/ضرائب — ليست مدرسة إعلام آلي على الإطلاق. لا تذكرها في سياق الإعلام الآلي أبداً.
3. **لا تقارن أرقام 2023 بعتبات 2025 دون تنبيه** — إذا أعطاك الطالب معدلاً قديماً، نبّهه أن المعدلات تتغير سنوياً وهذه هي بيانات 2025.
4. **تقني رياضي والطب** — لا تقل بشكل قاطع إن تقني رياضي مرفوض في الطب. الصواب: مقبول في بعض الجامعات والولايات، غير مقبول في أخرى — الأولوية لعلوم تجريبية ورياضيات.
5. **لا تخترع مسابقات أو اختبارات** غير موجودة — هندسة معمارية (EPAU) ليس لها اختبار رسم منفصل في التوجيه الجامعي العادي. المسابقات الموجودة فعلاً: EHEC، ENSSEA، CPGE (concours national).
6. **لا تذكر "ENST" أو "ESTA"** كمدارس إعلام آلي — لا وجود لهما.
7. **لا تذكر "علوم إنسانية"** كشعبة بكالوريا — هي ميدان جامعي فقط.
8. **لا تختلق جامعات خاصة** بأسماء غير موجودة — الجامعات الخاصة المعتمدة قليلة ومعروفة (انظر الكتلة أدناه).
9. **لا تقل "6-7 سنوات" للطب** — الصواب: 7 سنوات بالضبط (6 دراسة + سنة انترنا).
10. **لا تقدّم توصية بتخصص** لشعبة لا تقبلها — راجع NON_SCIENCE_ELIGIBLE وبيانات الشعب في كل تخصص قبل التوصية.
11. **أسئلة المعدلات حسب الولاية** — استعمل حصرياً أرقام سطر "معدلات القبول 2025 في <الولاية>" المحقونة في قاعدة المعرفة أدناه. ممنوع منعاً باتاً الاستقراء أو التخمين أو الاستنتاج من ولاية مجاورة أو من المعدل الوطني. إذا لم يوجد رقم للولاية المطلوبة في البيانات، قل بصراحة أن المعطى غير متوفر لديك وانصح الطالب بالتحقق من منصة التوجيه الرسمية inscription.mesrs.dz.

## تباين المعدلات بين الشمال والجنوب (حقيقة جغرافية مهمة):
ولايات الجنوب (أدرار، تمنراست، إليزي، تندوف، برج باجي مختار، إن قزام، إن صالح) تسجّل باستمرار معدلات قبول أقل من المتوسط الوطني — عادةً بفارق **1 إلى 2 نقطة**:
- **الطب**: الجنوب (بشار، أدرار، تمنراست) عادةً 14.5-15.5 | الشمال (العاصمة، وهران، قسنطينة) 16.5-17+
- **المدارس العليا الوطنية** (ESI، ENSIA، ESTIN...): تسجيل وطني — نفس المعدل لجميع الولايات، لا فارق جغرافي.
- **LMD جامعات الجنوب**: كثير منها يقبل بدون حد أدنى (null في قاعدة البيانات) أو بعتبات منخفضة.
- **نصيحة للطلاب بمعدل حدودي**: إذا كان الطالب منفتحاً جغرافياً، استكشاف خيارات الجنوب يفتح أبواباً أكثر.
⚠️ لا تخترع أرقاماً ولائية محددة — الأرقام الولائية الوحيدة المسموح بذكرها هي المحقونة صراحة في قاعدة المعرفة أدناه (سطور "معدلات القبول 2025 في ..."). خارجها لا تذكر أي رقم ولائي.

## خيارات الطلاب بمعدل منخفض (10-13/20) — لا تيأس:
### شعب مفتوحة بمعدل منخفض (10+/20):
- **علوم إنسانية واجتماعية** — علم الاجتماع، علم النفس، الفلسفة (ميدان جامعي واسع)
- **الحقوق والعلوم السياسية** — ليسانس حقوق متاح بمعدل 10+ في كثير من الجامعات
- **اللغات والترجمة** — لغات أجنبية، ترجمة وتفسير (10+ في معظم الولايات)
- **الإعلام والاتصال** — معدلات إدخال منخفضة نسبياً
- **علوم اقتصادية وتسيير** — للطلاب من شعبة تسيير واقتصاد بمعدل 10+
### المرحلة الثانية بدل التوجيه الإجباري:
إذا لم تُقبل أي رغبة من قائمة الطالب، **لا يُوجَّه آلياً** — بل يُتاح له المرحلة الثانية (6-8 أوت 2025) لإدراج بطاقة رغبات جديدة من 6 اختيارات. إذا لم ينجح في المرحلة الثانية أيضاً، يُعالَج ملفه كحالة خاصة عبر المؤسسة الجامعية في دائرته الجغرافية. **لا يوجد إجراء طعن رسمي في التوجيه** — الخيار الوحيد هو التحويل عبر PROGRES.
### التكوين المهني كبديل جدي للجامعة:
- مراكز التكوين المهني (CFPA) — تدريب عملي 1-3 سنوات
- شهادات مهنية معترف بها (CAP، BEP، BP) في الميكانيك، الكهرباء، الإعلام الآلي، الخياطة، البناء...
- لا يشترط معدل محدد — يكفي النجاح في الباك أو الجذع المشترك
- التكوين المهني مسار ناجح ومطلوب في سوق العمل — ليس خياراً ثانياً بل مساراً محترماً

## الجامعات الخاصة في الجزائر — نظام مستقل:
الجامعات الخاصة المعتمدة موجودة في الجزائر، لكنها **خارج منظومة التوجيه الجامعي الرسمي (TawdjihCom)** كلياً:
- **القبول**: عبر مواقعها الخاصة مباشرة — لا تُدرج في بطاقة الرغبات
- **المعدلات**: لا تطبّق حد أدنى ثابت — كل مؤسسة لها شروطها
- **التكاليف**: رسوم دراسية سنوية مرتفعة (غير مجانية خلافاً للجامعات العمومية)
- **أمثلة على مؤسسات معتمدة**: UDBA (جامعة محمد الصديق بن يحيى)، SSMI، مؤسسات مجمع البنك الوطني الجزائري للتكوين
- **الشهادات**: معترف بها رسمياً إذا كانت المؤسسة مرخصة من وزارة التعليم العالي
⚠️ تحقق دائماً من ترخيص المؤسسة الخاصة على الموقع الرسمي لوزارة التعليم العالي قبل التسجيل.

## مسار ما بعد الليسانس وما بعد الطب:
### بعد الليسانس LMD (3 سنوات) — الخيارات:
1. **الماستر (2 سنوات)** — في نفس الجامعة أو جامعة أخرى، بمسابقة داخلية. الأكثر شيوعاً.
2. **مسابقة توظيف في القطاع العام** — وظيفة مباشرة بالليسانس في الإدارة والتعليم والمؤسسات العمومية.
3. **مسابقات المدارس العليا بعد الليسانس** — بعض المدارس تقبل خريجي ليسانس لمسار ماستر متخصص.
4. **الدكتوراه (بعد الماستر — 3 سنوات)** — للبحث الأكاديمي والتدريس الجامعي.
5. **ماستر مهني** — تكوين متخصص موجّه للتشغيل المباشر.
### الريزيدانا (résidanat) — مسار التخصص الطبي:
بعد **7 سنوات طب عام** (6 دراسة + انترنا إلزامي)، الطبيب يكون بإمكانه:
- **الممارسة العامة** مباشرة كطبيب عام
- **مسابقة الريزيدانا الوطنية** — مسابقة تنافسية لالتحاق بتخصص طبي (4 إلى 6 سنوات إضافية)
  - التخصصات الأعلى طلباً: الجراحة العامة، أمراض القلب، أمراض الجلد، طب الأطفال، الأمراض النسائية
  - المقاعد محدودة وتنافس شديد — يُرتَّب الأطباء بالمعدل التراكمي وعلامات مسابقة الريزيدانا
  - مدة الريزيدانا: 4 سنوات (التخصصات الطبية) إلى 6 سنوات (الجراحات الدقيقة)
⟹ إجمالي مسار طبيب متخصص: **11 إلى 13 سنة** من الباك حتى التخصص الكامل.

${intent.ensia ? `\n## ⭐ تنبيه: الطالب يسأل عن ENSIA تحديداً — قدّم المعلومات الكاملة أعلاه بشكل بارز.\n` : ''}${intent.cpge ? `\n## ⭐ تنبيه: الطالب يسأل عن CPGE — اشرح الفرق بين التحضيريات والقبول المباشر بوضوح.\n` : ''}${intent.wishlist ? `\n## ⭐ تنبيه: الطالب يسأل عن بطاقة الرغبات — قدّم نصائح الاستراتيجية الكاملة ومراحل التوجيه. تذكير: الحد الرسمي 6 اختيارات كحد أدنى و10 اختيارات كحد أقصى.\n` : ''}${intent.orientation ? `\n## ⭐ تنبيه: الطالب يسأل عن مسار التوجيه — اشرح الخطوات بشكل واضح. تذكير: لا يوجد طعن رسمي في التوجيه — الآليات هي: تغيير الرغبات قبل التأكيد، المرحلة الثانية، والتحويل عبر PROGRES.\n` : ''}${wilayaAr ? `\n## ⭐ سؤال ولائي: الطالب يسأل عن ولاية ${wilayaAr}${geoZoneAr ? ` (${geoZoneAr})` : ''} — أجب حصرياً بأرقام سطر "معدلات القبول 2025 في ${wilayaAr}" الموجود في قاعدة المعرفة أدناه لكل تخصص. إذا ورد أن التخصص غير متوفر في هذه الولاية أو لم يوجد سطر ولائي، قل ذلك صراحة وانصح بالتحقق من منصة التوجيه الرسمية — لا تخمّن ولا تستنتج رقماً أبداً.\n` : ''}${geoZoneAr ? `\n## المنطقة الجغرافية للولاية المذكورة: ${geoZoneAr}\n${GEO_RULES.regional_programs ? `قاعدة التكوينات الجهوية (الدليل الوزاري): ${String(GEO_RULES.regional_programs).slice(0, 400)}\n` : ''}` : ''}
${ministryBlock ? `${ministryBlock}\n` : ''}${guideBlock ? `${guideBlock}\n` : ''}${webBlock ? `${webBlock}\n` : ''}
## معرّفات التخصصات الصحيحة الوحيدة (id) — أي id خارج هذه القائمة ممنوع منعاً باتاً في spec-cards/compare/verdict:
${SPECIALITIES.map((s) => s.id).join(' · ')}

# قاعدة المعرفة (المصدر الوحيد للأرقام — استعملها فقط)
${emptyContext
  ? 'لا توجد تخصصات مطابقة في قاعدة بياناتك للسؤال الحالي — البحث في الإنترنت مُفعَّل تلقائياً لهذا السؤال. استعمل النتائج المتاحة، واذكر المصدر.'
  : contextBlock}`;
}

/* ============================================================
   AI ROUTER — multi-provider, multi-key rotation
   Priority: Gemini keys → Groq keys → OpenRouter free models
   Each provider gets a 65-second cooldown on 429. When all are
   cooled, the least-recently-cooled one is tried as last resort.
   ============================================================ */

const COOLDOWN_MS = 65_000;
const _cooldowns = new Map(); // label → expiry timestamp (per Vercel instance)

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
    msg.includes('resource exhausted') || msg.includes('too many requests')
  );
}

/* Build ordered provider list from env vars.
   Gemini: GEMINI_API_KEY_1 … GEMINI_API_KEY_10 (or plain GEMINI_API_KEY)
   Groq:   GROQ_API_KEY (existing, always first) + GROQ_API_KEY_2 … GROQ_API_KEY_10
   OR:     OPENROUTER_API_KEY + OPENROUTER_API_KEY_2 … each key × 3 free models */
function buildProviders() {
  const list = [];

  // Gemini keys — up to 10, fallback to unnumbered if none set
  const geminiKeys = [];
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k) geminiKeys.push(k);
  }
  if (!geminiKeys.length && process.env.GEMINI_API_KEY) geminiKeys.push(process.env.GEMINI_API_KEY);
  geminiKeys.forEach((key, i) => list.push({ type: 'gemini', key, label: `gemini-${i + 1}` }));

  // Groq keys — GROQ_API_KEY always first, then GROQ_API_KEY_2 … _10
  const groqKeys = [];
  if (process.env.GROQ_API_KEY) groqKeys.push(process.env.GROQ_API_KEY);
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k) groqKeys.push(k);
  }
  groqKeys.forEach((key, i) => list.push({ type: 'groq', key, label: `groq-${i + 1}` }));

  // OpenRouter — each key unlocks 3 free model slots (Gemini → Llama → Mistral)
  const orKeys = [];
  if (process.env.OPENROUTER_API_KEY) orKeys.push(process.env.OPENROUTER_API_KEY);
  for (let i = 2; i <= 5; i++) {
    const k = process.env[`OPENROUTER_API_KEY_${i}`];
    if (k) orKeys.push(k);
  }
  const OR_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ];
  orKeys.forEach((key, ki) => {
    OR_MODELS.forEach((model, mi) => {
      list.push({ type: 'openrouter', key, model, label: `or-k${ki + 1}-m${mi + 1}` });
    });
  });

  return list;
}

const PROVIDERS = buildProviders();

/* Convert OpenAI-format message history → Gemini format.
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

/* Async generator — yields text chunks from one provider.
   Throws (isRateLimit or other) so the caller can rotate. */
async function* streamFromProvider(provider, systemPrompt, messages, message, useWebSearch) {
  /* ---- Gemini ---- */
  if (provider.type === 'gemini') {
    const client = new GoogleGenerativeAI(provider.key);
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
    });
    const chat = model.startChat({
      systemInstruction: systemPrompt,
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
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
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

/* ---- Supabase admin client (module-level — reused across invocations) ---- */
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

  const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Parse request body (profile is NOT trusted from client — fetched from DB below)
  const { message, messages = [], sessionId, orientationMode = false } = req.body;

  // SEC-2: Fetch real profile from DB — prevents prompt-injection via crafted profile fields
  const { data: profileFromDB } = await adminSupabase
    .from('profiles')
    .select('stream, average, wilaya, interests, ambition_text, weightedAverages, name')
    .eq('user_id', user.id)
    .single();
  const profile = profileFromDB || {};

  // SEC-5: Check (and auto-refill if 24 h elapsed) credit balance BEFORE Groq call.
  // ensure_daily_credits() atomically resets balance to 30 when due, then returns it.
  const { data: currentBalance, error: credErr } = await adminSupabase
    .rpc('ensure_daily_credits', { uid: user.id });
  if (credErr || currentBalance == null || currentBalance <= 0) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }

  // Build RAG context from the real knowledge base
  // AI-2: retrieve() returns [] when all scores are 0 — avoids misleading CS-heavy defaults
  const selected = retrieve(message, messages, profile, 6);
  // Wilaya detection: current message first (authoritative), recent context as fallback
  const recentText = (messages || []).slice(-4).map((m) => m.content || '').join(' ');
  const wilayaKey = detectWilaya(message) || detectWilaya(recentText);
  const contextBlock = buildContext(selected, wilayaKey);
  // Guide context: official program eligibility from الدليل الوزاري (stream + wilaya aware)
  const guideBlock = buildGuideContext(profile);
  // Intent signals for targeted knowledge-block injection in the system prompt
  const intent = detectIntent(`${message} ${recentText}`);

  // Optional Tavily web-search augmentation (inert unless TAVILY_API_KEY is set).
  // Trigger: low-confidence retrieval (topScore < threshold — no explicit name/id
  // match in the KB) OR time-sensitive intent (news / calendar / deadlines / new
  // programmes). At most one search per request, hard 3.5 s deadline, and any
  // failure degrades silently to the normal KB-only flow.
  let webBlock = '';
  if (process.env.TAVILY_API_KEY) {
    const topScore = selected.topScore ?? 0;
    const timeSensitive = isTimeSensitive(`${message} ${recentText}`);
    if (topScore < WEB_SEARCH_SCORE_THRESHOLD || timeSensitive) {
      const webResults = await webSearch(String(message || '').slice(0, 300));
      webBlock = buildWebBlock(webResults);
      if (webBlock) console.log(`[web-search] injected ${Math.min(webResults.length, 3)} result(s) (topScore=${topScore}, timeSensitive=${timeSensitive})`);
    }
  }

  // Ministry rules block: injected when query contains procedural/admin keywords
  const ministryBlock = buildMinistryRulesBlock(`${message} ${recentText}`);

  // Geographic zone: injected when a wilaya is detected
  const geoZoneAr = wilayaKey ? wilayaZoneAr(wilayaKey) : null;

  // GAP-07: wilaya listing block — injected when a wilaya is detected + listing intent
  let wilayaListingBlock = '';
  if (wilayaKey && isWilayaListingQuery(`${message} ${recentText}`)) {
    wilayaListingBlock = buildWilayaListingBlock(wilayaKey);
  }

  // GAP-08: zone detection — only when no specific wilaya was found
  let zoneContextBlock = '';
  if (!wilayaKey) {
    const detectedZone = detectZone(`${message} ${recentText}`);
    if (detectedZone) {
      zoneContextBlock = buildZoneContextBlock(detectedZone);
    }
  }

  // Merge extra blocks into ministryBlock (they all go into the same slot in the prompt)
  const combinedMinistryBlock = [ministryBlock, wilayaListingBlock, zoneContextBlock].filter(Boolean).join('\n\n');

  const systemPrompt = buildSystemPrompt(profile, contextBlock, guideBlock, orientationMode, selected.length === 0, intent, wilayaKey ? wilayaArName(wilayaKey) : null, webBlock, combinedMinistryBlock, geoZoneAr);

  // Stream as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  let streamSucceeded = false;
  let _lastErr = '';
  const useWebSearch = selected.length === 0;

  // Build provider queue — skip cooled-down ones; if all are cooled use least-recently-cooled
  let queue = PROVIDERS.filter((p) => !isOnCooldown(p.label));
  if (queue.length === 0) {
    // All on cooldown — pick the one whose cooldown expires soonest as last resort
    queue = [PROVIDERS.reduce((a, b) =>
      (_cooldowns.get(a.label) ?? 0) < (_cooldowns.get(b.label) ?? 0) ? a : b
    )];
  }

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
      break; // done — don't try more providers
    } catch (err) {
      if (providerYielded) {
        // Error after partial output — client already has content, can't recover cleanly
        console.error(`[ai-router] ${provider.label} mid-stream error:`, err.message);
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      if (isRateLimit(err)) {
        markCooldown(provider.label);
        _lastErr = `${provider.label}: rate_limit`;
        // continue to next provider
      } else {
        _lastErr = `${provider.label}: ${err.message?.slice(0, 200)}`;
        console.error(`[ai-router] ${provider.label} error:`, err.message);
        // non-rate-limit error — still try next provider
      }
    }
  }

  if (!streamSucceeded) {
    res.write(`data: ${JSON.stringify({ error: 'all_providers_exhausted', _dbg: _lastErr })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // SEC-5: Decrement credit AFTER successful stream — credit is never lost on AI failure
  await adminSupabase.rpc('decrement_credit', { uid: user.id });

  // SEC-9: All Supabase writes BEFORE res.end() — Vercel terminates execution after res.end()
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
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

/* ---- Exports for local verification harness (no side effects) ---- */
export { retrieve, buildContext, buildSystemPrompt, formatAverages, SPECIALITIES, detectIntent, detectWilaya, buildWilayaBlock, wilayaArName, isTimeSensitive, buildWebBlock, WEB_SEARCH_SCORE_THRESHOLD, buildMinistryRulesBlock, buildAvailabilityNotes, wilayaZoneAr, isAdminProcQuery, retrieveMinistryRules, isWilayaListingQuery, buildWilayaListingBlock, detectZone, buildZoneContextBlock, stripArabicPrefix, expandWithPrefixStrip };
