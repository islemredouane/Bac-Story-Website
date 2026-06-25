/* ============================================================
   TAWJIHI — AI Chat API (Vercel Serverless Function)
   ESM module — package.json has "type": "module"
   v2 output contract — see tawjihi/CHAT-CONTRACT.md
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

/* ---- Knowledge base (static JSON, bundled by Vercel via import attributes) ---- */
import specialitiesKb from '../tawjihi/data/kb/specialities-kb.json' with { type: 'json' };
import admissionsFull from '../tawjihi/data/kb/admissions-full.json' with { type: 'json' };
import filiereIndex from '../tawjihi/data/kb/filiere-index.json' with { type: 'json' };

const SPECIALITIES = specialitiesKb.specialities || [];
const ADM_ROWS = admissionsFull.rows || [];
const FILIERES = filiereIndex.filieres || {};

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

/* Format the three per-stream thresholds; null => "لا يقبل". */
function formatAverages(resolved) {
  if (!resolved) return 'غير متوفرة';
  const fmt = (v) => (v === null || v === undefined ? 'لا يقبل' : String(v));
  return `علوم تجريبية: ${fmt(resolved.min1)} · رياضيات: ${fmt(resolved.min2)} · تقني رياضي: ${fmt(resolved.min3)}`;
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
  return `${spec.name_ar} ${spec.name_fr} ${spec.dataName} ${spec.id} ${sectionText}`;
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
      }
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

  // AI-2: If every score is 0, return empty — don't inject misleading CS-heavy defaults.
  const allZero = scored.every((s) => s.score === 0);
  if (allZero) return [];

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

/* ---- System prompt (CHAT-CONTRACT.md §4) -------------------------------- */
function buildSystemPrompt(profile, contextBlock, orientationMode = false, emptyContext = false) {
  const p = profile || {};
  const code = streamCode(p.stream);
  const streamLabel = code ? STREAM_AR[code] || p.stream : p.stream || 'غير محددة';

  return `أنت "توجيهي"، مرشد ذكي لطلاب الجزائر في التوجيه الجامعي بعد البكالوريا، تابع لـ BAC STORY.

# شخصيتك ولغتك
- أخ كبير محبّ وصادق، بالدارجة الجزائرية الدافئة.
- ترد بنفس لغة السؤال (عربية / فرنسية / دارجة).

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
## مدد الدراسة (أعطِ الرقم الدقيق، لا تقل "6-7 سنوات"):
- طب عام: 7 سنوات (6 دراسة + سنة انترنا إلزامية)
- طب الأسنان: 6 سنوات (5 دراسة + سنة انترنا)
- الصيدلة: 5 سنوات
- البيطرة: 5 سنوات
- مهندس دولة (مدارس عليا): 5 سنوات (2 تحضيري + 3 تخصص)
- ليسانس LMD: 3 سنوات | ماستر LMD: 2 سنوات | دكتوراه: 3 سنوات

## قبول الشعب في الطب وعلوم الصحة:
- الطب، الصيدلة، طب الأسنان، البيطرة: تقبل فقط علوم تجريبية ورياضيات (لا يُقبل تقني رياضي)
- طب الأسنان: لا يقبل تقني رياضي

## شعبة تسيير واقتصاد — مسارات التوجيه:
بمعدل ≥ 10: SECSG (علوم اقتصادية تجارية وتسيير)، الحقوق، العلوم الإنسانية، الإعلام والاتصال
بمسابقة: EHEC (المدرسة العليا للتجارة)، ENSSEA، بعض الدراسات الاقتصادية المتخصصة

## شعبة آداب وفلسفة ولغات أجنبية — مسارات التوجيه:
بمعدل ≥ 10: الحقوق، اللغات والترجمة، الإعلام، العلوم الإنسانية، الشريعة الإسلامية

## دقة أسماء الجامعات:
- قل "جامعة الجزائر 1 - بن يوسف بن خدة" لا "جامعة الجزائر"
- قل "جامعة قسنطينة 1 فرحات عباس" أو "قسنطينة 3 صالح بوبنيدر" (لا "قسنطينة" فقط)
- المستشفى الجامعي للطب في العاصمة: Mustapha Pacha, Lamine Debaghine, Nafissa Hamoud
- جامعة علوم الصحة (الزيانية) = المؤسسة الجديدة للطب في الجزائر العاصمة (منذ 2023)

# قاعدة المعرفة (المصدر الوحيد للأرقام — استعملها فقط)
${emptyContext
  ? 'لا توجد تخصصات مطابقة في قاعدة بياناتك. اطلب من المستخدم توضيح سؤاله أو اذكر أن المعلومة غير متوفرة لديك.'
  : contextBlock}`;
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

  // SEC-5: Check credit balance BEFORE Groq call (read-only check; decrement happens after)
  const { data: creditRow } = await adminSupabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single();
  if (!creditRow || creditRow.balance <= 0) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }

  // Build RAG context from the real knowledge base
  // AI-2: retrieve() returns [] when all scores are 0 — avoids misleading CS-heavy defaults
  const selected = retrieve(message, messages, profile, 6);
  const contextBlock = buildContext(selected);
  const systemPrompt = buildSystemPrompt(profile, contextBlock, orientationMode, selected.length === 0);

  // Call Groq with streaming
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-12)],
    stream: true,
    max_tokens: 2048,      // AI-8: was 1200 — prevents mid-sentence cutoff
    temperature: 0.4,      // AI-16: was 0.6 — reduces variance in factual citations
  });

  // Stream as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  let streamSucceeded = false;

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    streamSucceeded = true;
  } catch (groqError) {
    // Stream failed — do NOT decrement credit; propagate error to client
    res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // SEC-5: Decrement credit AFTER successful stream — credit is never lost on Groq failure
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
export { retrieve, buildContext, buildSystemPrompt, formatAverages, SPECIALITIES };
