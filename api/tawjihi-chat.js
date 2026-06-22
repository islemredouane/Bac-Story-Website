/* ============================================================
   TAWJIHI — AI Chat API (Vercel Serverless Function)
   ESM module — package.json has "type": "module"
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

/* ---- Specialty catalog — real 2025-2026 official Algerian admission minimums from CSV ---- */
const CATALOG = [
  {
    id: 'esi', name: 'إعلام آلي', nameEn: 'Informatique – ESI',
    streams: ['رياضيات','تقني رياضي','علوم تجريبية'],
    streamCodes: ['math','techmath','sciexp'],
    avg: 18.19, minAvg: 17.36, demand: 'مرتفع جداً',
    unis: [
      { abbr: 'ESI Alger', avg: 18.19 }, { abbr: 'ESI-SBA', avg: 17.36 },
      { abbr: 'ESTIN Bejaia', avg: 15.56 }, { abbr: 'USTHB', avg: 11.00 },
    ],
    conditions: [
      'الحصول على البكالوريا في إحدى الشعب المؤهلة',
      'معدل الرياضيات والفيزياء مهم في ترتيب المدارس العليا',
      'التوجيه آلي عبر بطاقة الرغبات — لا مقابلة',
    ],
    careers: ['مطوّر برمجيات','محلّل بيانات','أمن سيبراني','مهندس شبكات','تطوير تطبيقات','ذكاء اصطناعي','هندسة سحابية'],
  },
  {
    id: 'ensia', name: 'ذكاء اصطناعي', nameEn: 'Intelligence Artificielle – ENSIA',
    streams: ['رياضيات','تقني رياضي'],
    streamCodes: ['math','techmath'],
    avg: 18.59, minAvg: 18.19, demand: 'مرتفع جداً',
    unis: [{ abbr: 'ENSIA', avg: 18.59 }],
    conditions: [
      'شعبة رياضيات أو تقني رياضي فقط',
      'ترتيب وطني مرتفع جداً — عادةً أعلى 1٪',
      'أولوية لمعدلات الرياضيات والفيزياء والعلوم',
      'لا مقابلة — التوجيه آلي',
    ],
    careers: ['مهندس ذكاء اصطناعي','عالم بيانات','باحث تعلم آلة','رؤية حاسوبية','معالجة لغة طبيعية','ريادة أعمال AI'],
  },
  {
    id: 'estin', name: 'علوم وتكنولوجيا الإعلام الآلي', nameEn: 'Informatique & Tech – ESTIN',
    streams: ['رياضيات','تقني رياضي','علوم تجريبية'],
    streamCodes: ['math','techmath','sciexp'],
    avg: 15.56, minAvg: 14.90, demand: 'مرتفع',
    unis: [{ abbr: 'ESTIN Bejaia', avg: 15.56 }],
    conditions: [
      'شعبة رياضيات، تقني رياضي، أو علوم تجريبية',
      'أولوية لمعدلات الرياضيات والفيزياء',
      'التوجيه آلي عبر بطاقة الرغبات',
    ],
    careers: ['مطوّر برمجيات','مهندس أنظمة','هندسة سحابية','أمن معلوماتي','هندسة بيانات','تطوير تطبيقات'],
  },
  {
    id: 'med', name: 'طب', nameEn: 'Médecine',
    streams: ['علوم تجريبية','رياضيات'],
    streamCodes: ['sciexp','math'],
    avg: 16.65, minAvg: 16.00, demand: 'مرتفع جداً',
    unis: [
      { abbr: 'Recrutement National', avg: 16.65 },
      { abbr: 'UA1', avg: 16.65 }, { abbr: 'UCA3', avg: 16.50 },
      { abbr: 'UO1', avg: 16.10 }, { abbr: 'UFAS1', avg: 16.40 },
    ],
    conditions: [
      'شعبة علوم تجريبية أو رياضيات بأولوية كاملة',
      'معدل مرتفع مع أهمية كبيرة لمواد العلوم الطبيعية والفيزياء',
      'التوجيه آلي — لا مقابلة شخصية',
    ],
    careers: ['طبيب عام','طبيب متخصص','طب المستشفيات','طب المختبر','العمل في الخارج','التدريس الجامعي'],
  },
  {
    id: 'pharm', name: 'صيدلة', nameEn: 'Pharmacie',
    streams: ['علوم تجريبية','رياضيات'],
    streamCodes: ['sciexp','math'],
    avg: 16.26, minAvg: 15.80, demand: 'مرتفع',
    unis: [
      { abbr: 'Recrutement National', avg: 16.26 },
      { abbr: 'UA1', avg: 16.26 }, { abbr: 'UCA3', avg: 16.10 }, { abbr: 'UO1', avg: 15.90 },
    ],
    conditions: [
      'شعبة علوم تجريبية بأولوية، رياضيات مقبول',
      'معدل العلوم الطبيعية والكيمياء مهم للترتيب',
      'التوجيه آلي عبر بطاقة الرغبات',
    ],
    careers: ['صيدلاني عام','صناعة دوائية','بحث علمي','صيدلة مستشفيات','تسويق دوائي'],
  },
  {
    id: 'dent', name: 'طب الأسنان', nameEn: 'Médecine dentaire',
    streams: ['علوم تجريبية','رياضيات'],
    streamCodes: ['sciexp','math'],
    avg: 16.99, minAvg: 16.50, demand: 'مرتفع',
    unis: [
      { abbr: 'Recrutement National', avg: 16.99 },
      { abbr: 'UA1', avg: 16.99 }, { abbr: 'UCA3', avg: 16.80 }, { abbr: 'UO1', avg: 16.60 },
    ],
    conditions: [
      'شعبة علوم تجريبية أو رياضيات',
      'معدل في مواد العلوم الطبيعية والكيمياء',
      'التوجيه آلي عبر بطاقة الرغبات',
    ],
    careers: ['طبيب أسنان عام','تجميل الأسنان','جراح الفكين','تدريس جامعي'],
  },
  {
    id: 'archi', name: 'هندسة معمارية', nameEn: 'Architecture – EPAU',
    streams: ['رياضيات','تقني رياضي','علوم تجريبية'],
    streamCodes: ['math','techmath','sciexp'],
    avg: 14.04, minAvg: 11.10, demand: 'متوسط',
    unis: [
      { abbr: 'EPAU', avg: 16.54 }, { abbr: 'USTO', avg: 13.50 }, { abbr: 'UCA2', avg: 12.80 },
    ],
    conditions: [
      'شعبة رياضيات، تقني رياضي، أو علوم تجريبية',
      'EPAU (الجزائر العاصمة): معدل مرتفع 16.54 — الأكثر تنافسية',
      'جامعات أخرى: معدل أقل (11-14)',
    ],
    careers: ['مهندس معماري','تخطيط عمراني','إشراف بناء','تصميم داخلي','عمارة خضراء'],
  },
  {
    id: 'info', name: 'إعلام آلي (LMD)', nameEn: 'Informatique – Université',
    streams: ['رياضيات','تقني رياضي','علوم تجريبية'],
    streamCodes: ['math','techmath','sciexp'],
    avg: 14.04, minAvg: 10.04, demand: 'مرتفع',
    unis: [
      { abbr: 'USTHB', avg: 16.80 }, { abbr: 'UCA2', avg: 13.50 }, { abbr: 'UO1', avg: 12.20 },
    ],
    conditions: [
      'شعبة رياضيات، تقني رياضي، أو علوم تجريبية',
      'USTHB: متنافس جداً (16+) — جامعات أخرى أقل صرامة (10-13)',
      'الانتقاء يختلف بحسب الجامعة والولاية',
    ],
    careers: ['مطوّر برمجيات','مدير قواعد بيانات','مهندس شبكات','مطوّر تطبيقات','محلل أنظمة'],
  },
  {
    id: 'esc', name: 'علوم تجارية ومالية', nameEn: 'Commerce & Finance – ESC',
    streams: ['تسيير واقتصاد','رياضيات','تقني رياضي','علوم تجريبية','آداب وفلسفة'],
    streamCodes: ['gestion','math','techmath','sciexp','lettres'],
    avg: 14.00, minAvg: 12.50, demand: 'متوسط',
    unis: [{ abbr: 'ESC', avg: 14.00 }],
    conditions: [
      'مفتوح لشعب التسيير، الرياضيات، تقني رياضي، علوم تجريبية، والآداب',
      'أفضلية لشعبة التسيير والاقتصاد',
    ],
    careers: ['مدير مشاريع','محلل مالي','مدير تسويق','تجارة دولية','مصرفية','ريادة أعمال'],
  },
  {
    id: 'eco', name: 'علوم اقتصادية وتسيير', nameEn: 'Sciences Économiques',
    streams: ['تسيير واقتصاد','رياضيات','تقني رياضي','علوم تجريبية','آداب وفلسفة','لغات أجنبية'],
    streamCodes: ['gestion','math','techmath','sciexp','lettres','langues'],
    avg: 11.45, minAvg: 10.00, demand: 'متوسط',
    unis: [
      { abbr: 'UABM', avg: 12.20 }, { abbr: 'UCA2', avg: 11.50 }, { abbr: 'UO1', avg: 11.00 },
    ],
    conditions: [
      'مفتوح لجميع الشعب',
      'يُقبل الطلاب حسب الترتيب والرغبة',
    ],
    careers: ['محاسب قانوني','موظف بنكي','مستشار مالي','مدقق حسابات','أستاذ اقتصاد'],
  },
  {
    id: 'bio', name: 'علوم الطبيعة والحياة', nameEn: 'Biologie',
    streams: ['علوم تجريبية'],
    streamCodes: ['sciexp'],
    avg: 11.07, minAvg: 10.21, demand: 'متوسط',
    unis: [
      { abbr: 'UBMA', avg: 11.20 }, { abbr: 'UCA1', avg: 11.50 }, { abbr: 'UO1', avg: 10.90 },
    ],
    conditions: [
      'شعبة علوم تجريبية فقط',
      'معدل باكالوريا معقول',
    ],
    careers: ['باحث جيني','بيئي','محلل مختبر','أستاذ علوم','علوم غذائية'],
  },
  {
    id: 'math', name: 'رياضيات', nameEn: 'Mathématiques',
    streams: ['رياضيات','تقني رياضي'],
    streamCodes: ['math','techmath'],
    avg: 13.83, minAvg: 10.02, demand: 'متوسط',
    unis: [
      { abbr: 'USTHB', avg: 16.50 }, { abbr: 'UCA1', avg: 13.20 }, { abbr: 'UA3', avg: 12.80 },
    ],
    conditions: [
      'شعبة رياضيات أو تقني رياضي',
      'معدل جيد في الرياضيات والعلوم',
    ],
    careers: ['أستاذ رياضيات','باحث جامعي','محلل إحصائي','أكتوار / تأمين','مطوّر رياضي'],
  },
  {
    id: 'education', name: 'علوم التربية', nameEn: "Sciences de l'Éducation",
    streams: ['آداب وفلسفة','لغات أجنبية','علوم تجريبية','تسيير واقتصاد'],
    streamCodes: ['lettres','langues','sciexp','gestion'],
    avg: 11.00, minAvg: 10.00, demand: 'متوسط',
    unis: [{ abbr: 'UA2', avg: 11.00 }],
    conditions: [
      'مفتوح لشعب الآداب، اللغات، العلوم التجريبية، والتسيير',
      'لا شروط خاصة',
    ],
    careers: ['أستاذ','مرشد تربوي','إدارة مدرسة','تصميم مناهج'],
  },
  {
    id: 'genie-civil', name: 'هندسة مدنية', nameEn: 'Génie Civil',
    streams: ['رياضيات','تقني رياضي','علوم تجريبية'],
    streamCodes: ['math','techmath','sciexp'],
    avg: 12.04, minAvg: 10.17, demand: 'مرتفع',
    unis: [
      { abbr: 'USTHB', avg: 14.20 }, { abbr: 'UCA2', avg: 12.50 }, { abbr: 'UO1', avg: 11.80 },
    ],
    conditions: [
      'شعبة رياضيات أو تقني رياضي بأولوية',
      'معدل في الرياضيات والفيزياء',
    ],
    careers: ['مهندس بناء','هندسة طرق','هندسة موارد مائية','تخطيط عمراني','إشراف مشاريع'],
  },
  {
    id: 'genie-elec', name: 'هندسة كهربائية', nameEn: 'Génie Électrique',
    streams: ['رياضيات','تقني رياضي'],
    streamCodes: ['math','techmath'],
    avg: 11.98, minAvg: 10.14, demand: 'مرتفع',
    unis: [
      { abbr: 'USTHB', avg: 14.00 }, { abbr: 'UO1', avg: 12.20 }, { abbr: 'UCA1', avg: 11.80 },
    ],
    conditions: [
      'شعبة رياضيات أو تقني رياضي',
      'معدل في الرياضيات والفيزياء',
    ],
    careers: ['مهندس طاقة','إلكترونيك','اتصالات','أتمتة صناعية','طاقات متجددة'],
  },
  {
    id: 'droit', name: 'دراسات قانونية', nameEn: 'Droit',
    streams: ['آداب وفلسفة','تسيير واقتصاد','لغات أجنبية','علوم تجريبية','رياضيات'],
    streamCodes: ['lettres','gestion','langues','sciexp','math'],
    avg: 10.37, minAvg: 10.00, demand: 'متوسط',
    unis: [
      { abbr: 'UA2', avg: 11.50 }, { abbr: 'UCA2', avg: 10.80 }, { abbr: 'UO1', avg: 10.50 },
    ],
    conditions: [
      'مفتوح لأغلب الشعب',
      'تُفضَّل شعبة الآداب والتسيير',
    ],
    careers: ['محامٍ','قاضٍ','مستشار قانوني','وظيف عمومي','تحكيم تجاري'],
  },
  {
    id: 'langues', name: 'لغات أجنبية', nameEn: 'Langues Étrangères',
    streams: ['لغات أجنبية','آداب وفلسفة','تسيير واقتصاد'],
    streamCodes: ['langues','lettres','gestion'],
    avg: 13.42, minAvg: 11.00, demand: 'متوسط',
    unis: [
      { abbr: 'UA2', avg: 13.50 }, { abbr: 'UCA3', avg: 12.80 }, { abbr: 'UO2', avg: 12.40 },
    ],
    conditions: [
      'أولوية لشعبة اللغات الأجنبية',
      'مستوى جيد في اللغة الأجنبية المختارة',
      'بعض الجامعات تطلب معدل مرتفع',
    ],
    careers: ['أستاذ لغة','مترجم','صحفي','دبلوماسية','ناشر','تعاون دولي'],
  },
  {
    id: 'psych', name: 'علم النفس', nameEn: 'Psychologie',
    streams: ['آداب وفلسفة','علوم تجريبية','لغات أجنبية','تسيير واقتصاد'],
    streamCodes: ['lettres','sciexp','langues','gestion'],
    avg: 11.00, minAvg: 10.00, demand: 'متوسط',
    unis: [
      { abbr: 'UA2', avg: 11.00 }, { abbr: 'UCA3', avg: 10.80 }, { abbr: 'UO2', avg: 10.60 },
    ],
    conditions: [
      'مفتوح لأغلب الشعب',
      'أولوية للآداب والعلوم التجريبية',
    ],
    careers: ['معالج نفسي','مستشار تربوي','علم نفس تنظيمي','إكلينيكي','أستاذ باحث'],
  },
  {
    id: 'genie-meca', name: 'هندسة ميكانيكية', nameEn: 'Génie Mécanique',
    streams: ['رياضيات','تقني رياضي'],
    streamCodes: ['math','techmath'],
    avg: 11.61, minAvg: 10.31, demand: 'مرتفع',
    unis: [
      { abbr: 'USTHB', avg: 13.50 }, { abbr: 'USTO', avg: 12.20 }, { abbr: 'UCA1', avg: 11.60 },
    ],
    conditions: [
      'شعبة رياضيات أو تقني رياضي',
      'معدل في الرياضيات والفيزياء مهم',
    ],
    careers: ['مهندس ميكانيك','صناعة نفطية','صناعة سيارات','هندسة حرارية','طاقات متجددة'],
  },
];

/* ---- RAG helpers ---- */
function getRelevantSpecialties(catalog, profile) {
  const streamMap = {
    'علوم تجريبية': 'sciexp', 'رياضيات': 'math',
    'تقني رياضي': 'techmath', 'تسيير واقتصاد': 'gestion',
    'آداب وفلسفة': 'lettres', 'لغات أجنبية': 'langues',
  };
  const userStreamCode = streamMap[profile?.stream] || null;
  const userAvg = parseFloat(profile?.average) || 12;

  const relevant = catalog.filter(s => {
    const streamMatch = !userStreamCode || s.streamCodes.includes(userStreamCode);
    const avgMatch = Math.abs(s.avg - userAvg) <= 3.5;
    return streamMatch || avgMatch;
  });
  return relevant.length >= 4 ? relevant : catalog;
}

function formatCatalog(specs) {
  return specs.map(s =>
    `[${s.id}] ${s.name} | Avg:${s.avg} Min:${s.minAvg} | Demand:${s.demand}\n` +
    `Streams: ${s.streams.join(', ')}\n` +
    `Unis: ${s.unis.map(u => `${u.abbr}(${u.avg})`).join(', ')}\n` +
    `Careers: ${s.careers.join(', ')}\n` +
    `Conditions: ${s.conditions.join('; ')}`
  ).join('\n\n');
}

function buildSystemPrompt(profile, relevantSpecs) {
  const p = profile || {};
  return `أنت توجيهي، مرشد ذكي لطلاب الجزائر في التوجيه الجامعي بعد البكالوريا. تتبع لـ BAC STORY.

شخصيتك: أخ كبير محب وصادق، تتحدث بالدارجة الجزائرية الدافئة. تفهم العربية والفرنسية والدارجة وترد بنفس لغة السؤال.

قواعد صارمة:
1. لا تذكر معدلات قبول لتخصصات غير موجودة في البيانات المزودة.
2. دائماً اذكر المعدل والمصدر عند الاقتراح.
3. اختم كل توصية بـ "أكّد على البوابة الرسمية".
4. كن صادقاً بشأن الأهلية — لا تبالغ في التفاؤل.
5. إذا ذكر الطالب تخصصاً غير موجود في البيانات، اعترف أن معلوماتك محدودة لهذا التخصص.

ملف الطالب:
- الاسم: ${p.name || 'صديقي'}
- الشعبة: ${p.stream || 'غير محددة'}
- المعدل: ${p.average || '—'}/20
- الولاية: ${p.wilaya || 'غير محددة'}
- الاهتمامات: ${Array.isArray(p.interests) ? p.interests.join('، ') : (p.interests || 'غير محددة')}
- الطموح: ${p.ambition_text || p.ambition || 'غير محدد'}

بيانات التخصصات — أرقام رسمية للقبول 2025-2026 (استخدم هذه فقط — لا تخترع بيانات):
${formatCatalog(relevantSpecs)}

عند اقتراح تخصص، أضف في نهاية ردك كتلة JSON بهذا الشكل بالضبط (ضرورية للعرض المرئي):
\`\`\`spec-cards
[{"id":"<id>","name":"<name>","meta":"<category> · <stream>","avg":"<avg>","color":"var(--cat-<engineering|medical|business|science|education>)"}]
\`\`\`
أذكر فقط التخصصات التي لها id في البيانات المزودة. إذا لا تقترح تخصصاً، لا تضف الكتلة.`;
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

  // Build RAG context
  const relevantSpecs = getRelevantSpecialties(CATALOG, profile);
  const systemPrompt = buildSystemPrompt(profile, relevantSpecs);

  // Call Groq with streaming
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-12)],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
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
