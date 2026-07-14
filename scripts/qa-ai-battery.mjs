// scripts/qa-ai-battery.mjs — Part C: AI behaviour battery for /api/tawjihi-chat
// Node 22, ESM, zero dependencies. NOT run during QA session (no test account) —
// ready for the owner to run.
//
// Usage:
//   TAWJIHI_ENDPOINT=https://<host>/api/tawjihi-chat  (or http://localhost:3000/api/tawjihi-chat via `vercel dev`)
//   TAWJIHI_TOKEN=<supabase user access token for the TEST account>
//   TEST_USER_ID=<uuid of the test account>            (optional — enables profile seeding)
//   node scripts/qa-ai-battery.mjs
//
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local only to seed the
// test profile (name أمين, علوم تجريبية, 15.5, سطيف, interests الطب والصحة).
// Writes: tawjihi/data/_staging/_QA-AI-REPORT.md

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnvLocal() {
  const f = path.join(ROOT, '.env.local');
  if (!fs.existsSync(f)) return {};
  const env = {};
  for (const line of fs.readFileSync(f, 'utf8').replace(/^﻿/, '').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}
const fileEnv = loadEnvLocal();
const ENDPOINT = process.env.TAWJIHI_ENDPOINT || fileEnv.TAWJIHI_ENDPOINT;
const TOKEN = process.env.TAWJIHI_TOKEN || fileEnv.TAWJIHI_TOKEN;
const TEST_USER_ID = process.env.TEST_USER_ID || fileEnv.TEST_USER_ID;
const SUPABASE_URL = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!ENDPOINT || !TOKEN) {
  console.error('Missing TAWJIHI_ENDPOINT and/or TAWJIHI_TOKEN env vars. See usage header.');
  process.exit(2);
}

// ── expected numbers pulled from the live catalog (ground truth) ─────────────
const catalogSrc = fs.readFileSync(path.join(ROOT, 'tawjihi', 'catalog.js'), 'utf8');
const { twById } = new Function(catalogSrc + '\n;return { TW_CATALOG, twById };')();
const numRe = (n) => new RegExp(String(n).replace('.', '[.,]'));
const MED_AVG = twById('med')?.minAvg;      // e.g. 16.65 — resolves via baseId
const ESI_AVG = twById('esi')?.minAvg;

// ── banned dialect words (non-Algerian) ──────────────────────────────────────
const BANNED = ['شنو', 'شو ', 'إيش', ' وش ', 'شلون', 'ليش', 'فين ', 'ديال', 'بغيت', 'عافاك', 'مزيان', 'إزاي', 'عايز', 'هسة', 'كتير'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── SSE client ───────────────────────────────────────────────────────────────
async function askOnce(message, { history = [], orientationMode = false } = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ message, messages: [...history, { role: 'user', content: message }], sessionId: 'qa-battery', orientationMode }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const raw = await res.text();
  let out = '';
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') break;
    try {
      const j = JSON.parse(payload);
      if (j.content) out += j.content;
      if (j.error) throw new Error('stream error: ' + j.error);
    } catch (e) { if (String(e.message).startsWith('stream error')) throw e; }
  }
  return out;
}

async function ask(message, opts = {}) {
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await askOnce(message, opts);
    } catch (e) {
      const isRateLimit = /all_providers_exhausted|rate.?limit|429|quota/i.test(e.message);
      if (isRateLimit && attempt < maxRetries) {
        const wait = 20000 * (attempt + 1); // 20s, 40s, 60s
        console.log(`\n  [rate-limit] retrying in ${wait / 1000}s (attempt ${attempt + 1}/${maxRetries})…`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
}

// ── assertion helpers ────────────────────────────────────────────────────────
const hasCodeBlock = (txt, tag) => {
  const m = txt.match(new RegExp('```' + tag + '\\s*([\\s\\S]*?)```'));
  if (!m) return { ok: false, why: `no \`\`\`${tag} block` };
  try { return { ok: true, json: JSON.parse(m[1]) }; }
  catch { return { ok: false, why: `\`\`\`${tag} block is not valid JSON` }; }
};
const noBanned = (txt) => {
  const hit = BANNED.find((w) => txt.includes(w));
  return hit ? `banned dialect word: "${hit.trim()}"` : null;
};
const latinRatio = (txt) => {
  const latin = (txt.match(/[a-zA-Zàâçéèêëîïôùûü]/g) || []).length;
  const arabic = (txt.match(/[؀-ۿ]/g) || []).length;
  return latin / Math.max(1, latin + arabic);
};
const admitsNoData = (txt) =>
  /ما عنديش|ما لقيتش|غير متوفر|ما كاينش|لا أملك|ما عندناش|ماكانش|مش متأكد|نحتاج نتأكد|websearch|بحث/i.test(txt);

// ── the 25-question battery ──────────────────────────────────────────────────
// Each: { id, cat, q, opts, assert(txt) -> null | failure string }
const TESTS = [
  // — Averages grounding —
  { id: 1, cat: 'averages', q: 'قداش معدل قبول الطب في 2025؟', assert: (t) =>
      (MED_AVG && !numRe(MED_AVG).test(t) ? `expected the official med minAvg ${MED_AVG} in the answer` : null) ||
      (!/2025/.test(t) ? 'year 2025 not cited' : null) },
  { id: 2, cat: 'averages', q: 'قداش كان معدل قبول ESI العام لي فات؟', assert: (t) =>
      ESI_AVG && !numRe(ESI_AVG).test(t) ? `expected ESI minAvg ${ESI_AVG}` : null },
  { id: 3, cat: 'averages', q: 'معدلات القبول تاع الصيدلة والطب واش الفرق بيناتهم؟', assert: (t) =>
      /\d{2}[.,]\d/.test(t) ? null : 'no numeric averages cited' },
  // — Wilaya / geographic circle rule —
  { id: 4, cat: 'wilaya', q: 'واش نقدر نقرا إعلام آلي في ولايتي؟', assert: (t) =>
      /سطيف/.test(t) ? null : 'answer does not use the profile wilaya (سطيف)' },
  { id: 5, cat: 'wilaya', q: 'التكوينات الجهوية لي يقدر يدخلها واحد من سطيف؟', assert: (t) =>
      /دائرة|جهوي|منطقة/.test(t) ? null : 'no geographic-circle logic in answer' },
  // — Military —
  { id: 6, cat: 'military', q: 'كيفاش نسجل في مدرسة الطيران؟', assert: (t) =>
      /preinscription\.mdn\.dz/.test(t) ? null : 'missing preinscription.mdn.dz' },
  { id: 7, cat: 'military', q: 'واش هي شروط الدخول للمدارس العسكرية؟', assert: (t) =>
      /preinscription\.mdn\.dz|التسجيل الأولي/.test(t) ? null : 'missing military pre-registration info' },
  // — Weighted average rule —
  { id: 8, cat: 'weighted', q: 'معدلي الموزون في الرياضيات 16، واش يخدملي؟', assert: (t) =>
      /موزون|مرجح|مرجّح/.test(t) ? null : 'no weighted-vs-general reasoning' },
  { id: 9, cat: 'weighted', q: 'واش الفرق بين المعدل الموزون والمعدل العام في التوجيه؟', assert: (t) =>
      /موزون|مرجح/.test(t) && /عام/.test(t) ? null : 'does not contrast weighted vs general' },
  // — Verdict block —
  { id: 10, cat: 'verdict', q: 'واش نقدر ندخل ESI؟', assert: (t) => {
      const r = hasCodeBlock(t, 'verdict');
      if (!r.ok) return r.why;
      const vid = r.json.id ?? r.json.specId ?? null;
      return vid && twById(vid) ? null : `verdict id "${vid}" does not resolve in catalog`;
    } },
  { id: 11, cat: 'verdict', q: 'بمعدلي 15.5 واش نقدر نقرا طب؟', assert: (t) => {
      const r = hasCodeBlock(t, 'verdict');
      return r.ok ? null : r.why;
    } },
  // — Comparison block —
  { id: 12, cat: 'compare', q: 'قارنلي بين ESI و ENSIA', assert: (t) => {
      const r = hasCodeBlock(t, 'compare');
      if (!r.ok) return r.why;
      return Array.isArray(r.json.items) && r.json.items.length >= 2 ? null : 'compare block lacks 2+ items';
    } },
  { id: 13, cat: 'compare', q: 'قارن بين الصيدلة وطب الأسنان', assert: (t) => {
      const r = hasCodeBlock(t, 'compare');
      return r.ok ? null : r.why;
    } },
  // — Orientation / discover mode —
  { id: 14, cat: 'orientation', q: 'ابدأ', opts: { orientationMode: true }, assert: (t) => {
      const blocks = (t.match(/```question/g) || []).length;
      if (blocks !== 1) return `expected exactly 1 question block, got ${blocks}`;
      return /15[.,]5|سطيف|علوم تجريبية/.test(t) ? null : 'opening not personalized to the profile';
    } },
  { id: 15, cat: 'orientation', q: 'نحب المواد العلمية والتشريح', opts: { orientationMode: true }, assert: (t) =>
      (t.match(/```question/g) || []).length <= 1 ? null : 'more than one question per message' },
  // — Anti-generic —
  { id: 16, cat: 'anti-generic', q: 'واش نقرا؟', assert: (t) =>
      /15[.,]5|سطيف|علوم تجريبية|الطب والصحة/.test(t) ? null : 'no anchoring on profile numbers/interests' },
  { id: 17, cat: 'anti-generic', q: 'عطيني نصيحة', assert: (t) =>
      /15[.,]5|سطيف|علوم تجريبية/.test(t) ? null : 'generic advice, profile ignored' },
  // — Out of scope —
  { id: 18, cat: 'scope', q: 'احسبلي شحال نخلص visa كندا', assert: (t) =>
      /توجيه|تخصص|جامع|بكالوريا|دراسة/.test(t) && !/سعر الفيزا|رسوم الفيزا/.test(t) ? null : 'did not stay in domain / politely refuse' },
  { id: 19, cat: 'scope', q: 'اكتبلي كود بايثون يحسب الأعداد الأولية', assert: (t) =>
      /def |import |```python/.test(t) ? 'wrote out-of-scope code' : null },
  // — French handling —
  { id: 20, cat: 'french', q: "C'est quoi la moyenne de médecine ?", assert: (t) =>
      (latinRatio(t) < 0.4 ? 'did not respond in French' : null) ||
      (MED_AVG && !numRe(MED_AVG).test(t) ? `expected ${MED_AVG} in French answer` : null) },
  { id: 21, cat: 'french', q: 'Est-ce que je peux étudier informatique à Sétif ?', assert: (t) =>
      latinRatio(t) >= 0.4 ? null : 'did not respond in French' },
  // — Unknown speciality / anti-hallucination —
  { id: 22, cat: 'unknown', q: 'قداش معدل قبول تخصص هندسة الفضاء الجوي العميق في وهران؟', assert: (t) =>
      admitsNoData(t) || !/\d{2}[.,]\d{2}/.test(t) ? null : 'invented a number for a non-existent speciality' },
  { id: 23, cat: 'unknown', q: 'واش رايك في المدرسة العليا للروبوتات تاع تمنراست؟', assert: (t) =>
      admitsNoData(t) || !/معدل القبول \d/.test(t) ? null : 'hallucinated data about a non-existent school' },
  // — Dialect stress —
  { id: 24, cat: 'dialect', q: 'اشرحلي كيفاش يخدم نظام LMD', assert: () => null /* banned-word check runs globally */ },
  { id: 25, cat: 'dialect', q: 'واش هي أحسن جامعة للإعلام الآلي في الدزاير؟', assert: (t) =>
      /USTHB|ESI|باب الزوار|وهران|قسنطينة|سطيف/.test(t) ? null : 'no concrete institutions named' },
];

// ── profile seeding (optional) ───────────────────────────────────────────────
async function seedProfile() {
  if (!TEST_USER_ID || !SUPABASE_URL || !SERVICE_KEY) {
    console.log('[seed] TEST_USER_ID or Supabase service creds missing — assuming profile already seeded (أمين / علوم تجريبية / 15.5 / سطيف / الطب والصحة).');
    return;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{
      id: TEST_USER_ID, name: 'أمين', stream: 'علوم تجريبية', average: 15.5,
      wilaya: 'سطيف', interests: ['الطب والصحة'], completed: true,
    }]),
  });
  console.log(res.ok ? '[seed] test profile upserted.' : `[seed] FAILED (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

// ── run ──────────────────────────────────────────────────────────────────────
async function main() {
  await seedProfile();
  const results = [];
  for (const t of TESTS) {
    process.stdout.write(`Q${String(t.id).padStart(2)} [${t.cat}] ${t.q.slice(0, 40)}… `);
    let txt = '';
    let failure = null;
    try {
      txt = await ask(t.q, t.opts || {});
      failure = t.assert(txt) || noBanned(txt);
    } catch (e) {
      failure = 'request error: ' + e.message;
    }
    console.log(failure ? `FAIL — ${failure}` : 'PASS');
    results.push({ ...t, response: txt, failure });
    await sleep(8000); // 8s between questions to stay under Groq free-tier TPM
  }

  const passed = results.filter((r) => !r.failure).length;
  const lines = [
    '# QA — AI Behaviour Battery (Part C)', '',
    `Generated: ${new Date().toISOString()}`,
    `Endpoint: ${ENDPOINT}`,
    `Result: **${passed}/${results.length} passed** (target ≥ 90% = 23/25)`, '',
    '| # | Category | Question | Result |', '|---|---|---|---|',
    ...results.map((r) => `| ${r.id} | ${r.cat} | ${r.q.replace(/\|/g, '\\|')} | ${r.failure ? '❌ ' + r.failure.replace(/\|/g, '\\|') : '✅'} |`),
    '',
  ];
  for (const r of results.filter((x) => x.failure)) {
    lines.push(`## ❌ Q${r.id} — ${r.cat}`, '', `**Question:** ${r.q}`, '', `**Failure:** ${r.failure}`, '', '**Full response:**', '', '```', r.response || '(empty)', '```', '');
  }
  fs.writeFileSync(path.join(ROOT, 'tawjihi', 'data', '_staging', '_QA-AI-REPORT.md'), lines.join('\n'), 'utf8');
  console.log(`\n${passed}/${results.length} passed — report: tawjihi/data/_staging/_QA-AI-REPORT.md`);
  process.exitCode = passed / results.length >= 0.9 ? 0 : 1;
}
main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
