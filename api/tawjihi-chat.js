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
  const queryTokens = new Set(tokenize(`${message} ${recent}`));
  const rawQuery = `${message} ${recent}`.toLowerCase();

  // Detect special intents early — these inject static knowledge blocks rather than KB entries.
  const intent = detectIntent(rawQuery);

  const scored = SPECIALITIES.map((spec) => {
    const haystack = specText(spec).toLowerCase();
    const hayTokens = tokenize(haystack);
    const hayTokenSet = new Set(hayTokens);

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
        const nameTokens = tokenize(nl);
        for (const qt of queryTokens) {
          if (qt.length >= 3 && nameTokens.includes(qt)) {
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

  // AI-2: If top score < 3 (only common-word overlap, no name/id match), return empty → triggers web search.
  // Exception: intent signals detected → always return context (intent blocks added at prompt-build time).
  if ((scored[0]?.score ?? 0) < 3 && !intent.ensia && !intent.cpge && !intent.wishlist && !intent.orientation) return [];

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
  return selected.slice(0, Math.max(k, selected.length));
}

/* Render the selected specialities into a compact, bounded context string. */
function buildContext(specs) {
  return specs
    .map((spec) => {
      const sections = pickSections(spec.sections);
      const rows = rowsForSpec(spec, 6).map(formatRow);
      const parts = [
        `### [${spec.id}] ${spec.name_ar} / ${spec.name_fr}`,
        `التصنيف: ${spec.category}`,
        `معدلات القبول حسب الشعبة: ${formatAverages(spec.resolvedAverages)}`,
      ];
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

/* ---- System prompt (CHAT-CONTRACT.md §4) -------------------------------- */
function buildSystemPrompt(profile, contextBlock, guideBlock, orientationMode = false, emptyContext = false, intent = {}) {
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
5. **التسجيل الجامعي الفعلي** — يتوجه الطالب للمؤسسة التي وُجِّه إليها، ومعه وثائق البكالوريا والهوية، ويُسجَّل فيها رسمياً.
⚠️ لا يوجد "عطلة ثانية" أو إعادة توجيه بعد الإعلان في الغالب — الاختيار نهائي.

## معدل التوجيه الموزون — الصيغة الرسمية (MESRS 2025)
```
المعدل الموزون = (معدل البكالوريا × 2 + علامة المادة الأساسية) ÷ 3
```
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

## نصائح بطاقة الرغبات — استراتيجية ملء القائمة
1. **الترتيب مهم جداً** — يُوجَّه الطالب لأعلى رغبة ممكنة، لذا ضع الأحلام أولاً وليس الخيارات الآمنة.
2. **لا تترك مقاعد فارغة** — الطالب الذي لا يختار 20 رغبة يضيع فرصاً مجانية.
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

${intent.ensia ? `\n## ⭐ تنبيه: الطالب يسأل عن ENSIA تحديداً — قدّم المعلومات الكاملة أعلاه بشكل بارز.\n` : ''}${intent.cpge ? `\n## ⭐ تنبيه: الطالب يسأل عن CPGE — اشرح الفرق بين التحضيريات والقبول المباشر بوضوح.\n` : ''}${intent.wishlist ? `\n## ⭐ تنبيه: الطالب يسأل عن بطاقة الرغبات — قدّم نصائح الاستراتيجية الكاملة ومراحل التوجيه.\n` : ''}${intent.orientation ? `\n## ⭐ تنبيه: الطالب يسأل عن مسار التوجيه — اشرح الخطوات الخمس بشكل واضح.\n` : ''}
${guideBlock ? `${guideBlock}\n` : ''}
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
      tools: useWebSearch ? [{ googleSearch: {} }] : [],
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
  const contextBlock = buildContext(selected);
  // Guide context: official program eligibility from الدليل الوزاري (stream + wilaya aware)
  const guideBlock = buildGuideContext(profile);
  // Intent signals for targeted knowledge-block injection in the system prompt
  const intent = detectIntent(`${message} ${(messages || []).slice(-4).map((m) => m.content || '').join(' ')}`);
  const systemPrompt = buildSystemPrompt(profile, contextBlock, guideBlock, orientationMode, selected.length === 0, intent);

  // Stream as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  let streamSucceeded = false;
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
        // continue to next provider
      } else {
        console.error(`[ai-router] ${provider.label} error:`, err.message);
        // non-rate-limit error — still try next provider
      }
    }
  }

  if (!streamSucceeded) {
    res.write(`data: ${JSON.stringify({ error: 'all_providers_exhausted' })}\n\n`);
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
export { retrieve, buildContext, buildSystemPrompt, formatAverages, SPECIALITIES, detectIntent };
