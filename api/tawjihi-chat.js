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
    if (minKey && spec.resolvedAverages) {
      const v = spec.resolvedAverages[minKey];
      if (v !== null && v !== undefined) score += 2;
    }

    return { spec, score, named };
  });

  scored.sort((a, b) => b.score - a.score);

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
  // Guarantee grounding even if everything scored 0.
  if (selected.length === 0) {
    return SPECIALITIES.slice(0, k);
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
function buildSystemPrompt(profile, contextBlock) {
  const p = profile || {};
  const code = streamCode(p.stream);
  const streamLabel = code ? STREAM_AR[code] || p.stream : p.stream || 'غير محددة';

  return `أنت "توجيهي"، مرشد ذكي لطلاب الجزائر في التوجيه الجامعي بعد البكالوريا، تابع لـ BAC STORY.

# شخصيتك ولغتك
- أخ كبير محبّ وصادق، بالدارجة الجزائرية الدافئة.
- ترد بنفس لغة السؤال (عربية / فرنسية / دارجة).

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

# مثال قصير على الأسلوب الجيد
> سؤال: "نحب نقرا إعلام آلي، واش تنصحني؟"
>
> رد:
> واش راك خويا! الإعلام الآلي خيار ممتاز ومطلوب بزاف. 👇
>
> ### ليه تختار الإعلام الآلي
> - مجال واسع وفرص شغل كثيرة داخل وخارج الوطن.
> - يقبل عدة شعب حسب المؤسسة.
>
> ### المعدلات (رسمية 2025)
> - المدارس العليا تطلب معدل مرتفع، الجامعة أكثر مرونة.
>
> أكّد دائماً على البوابة الرسمية قبل بطاقة الرغبات.
>
> \`\`\`spec-cards
> [{"id":"ESI-ALGER","name":"إعلام آلي ESI","meta":"engineering · رياضيات","avg":"18.19","color":"var(--cat-engineering)"}]
> \`\`\`

# ملف الطالب
- الاسم: ${p.name || 'صديقي'}
- الشعبة: ${streamLabel}
- المعدل: ${p.average || '—'}/20
- الولاية: ${p.wilaya || 'غير محددة'}
- الاهتمامات: ${Array.isArray(p.interests) ? p.interests.join('، ') : p.interests || 'غير محددة'}
- الطموح: ${p.ambition_text || p.ambition || 'غير محدد'}

# قاعدة المعرفة (المصدر الوحيد للأرقام — استعملها فقط)
${contextBlock}`;
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

  // Ensure credits row exists for new users (insert 30 free credits; no-op if row already exists)
  await adminSupabase
    .from('credits')
    .upsert(
      { user_id: user.id, balance: 30, total_earned: 30, total_spent: 0 },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );

  // Decrement credit atomically BEFORE calling Groq
  const { data: credited } = await adminSupabase.rpc('decrement_credit', { uid: user.id });
  if (!credited) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }

  // Parse request body
  const { message, messages = [], profile, sessionId } = req.body;

  // Build RAG context from the real knowledge base
  const selected = retrieve(message, messages, profile, 6);
  const contextBlock = buildContext(selected);
  const systemPrompt = buildSystemPrompt(profile, contextBlock);

  // Call Groq with streaming
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-12)],
    stream: true,
    max_tokens: 1200,
    temperature: 0.6,
  });

  // Stream as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();

  // Save messages to Supabase (fire and forget, after streaming completes)
  if (sessionId) {
    adminSupabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: message,
    }).then(() => {});

    adminSupabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'assistant',
      content: fullResponse,
    }).then(() => {});
  }
}

/* ---- Exports for local verification harness (no side effects) ---- */
export { retrieve, buildContext, buildSystemPrompt, formatAverages, SPECIALITIES };
