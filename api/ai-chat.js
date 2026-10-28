// api/ai-chat.js — SSE Streaming AI Chat
// Vercel serverless, ES module
// POST /api/ai-chat
// Authorization: Bearer <token>
// Body: { message, mode, session_id?, file_context? }

import '../lib/env.js';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt, MODE_CONFIG, getDaysUntilBAC } from '../lib/ai-prompts.js';

let _supabase;
const supabase = new Proxy({}, {
  get(_, key) {
    if (!_supabase) _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const val = _supabase[key];
    return typeof val === 'function' ? val.bind(_supabase) : val;
  }
});

const GEMINI_API_KEY  = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL    = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_FALLBACK = 'gemini-2.0-flash';
const FREE_DAILY_LIMIT = 5;
const ALLOWED_MODES    = ['advisor','solver','corrector','summarizer','quiz','planner','flashcards','mindmap'];
const PREMIUM_MODES    = ['planner'];

// ─── CORS helper ────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Token verification ──────────────────────────────────────
async function verifyToken(token) {
  if (!token) return null;
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  const { data: user } = await supabase
    .from('users')
    .select('id, name, specialty, wilaya, is_premium, premium_until, onboarding_done, onboarding_data')
    .eq('id', session.user_id)
    .single();
  return user || null;
}

// ─── Usage check & increment ─────────────────────────────────
async function getTodayUsage(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('ai_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  return data?.message_count || 0;
}

async function incrementUsage(userId) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_date: today })
    .catch(async () => {
      // Fallback if RPC not available: manual upsert
      const { data: existing } = await supabase
        .from('ai_usage')
        .select('message_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();
      if (existing) {
        await supabase
          .from('ai_usage')
          .update({ message_count: (existing.message_count || 0) + 1 })
          .eq('user_id', userId)
          .eq('date', today);
      } else {
        await supabase
          .from('ai_usage')
          .insert({ user_id: userId, date: today, message_count: 1 });
      }
    });
}

// ─── Session management ──────────────────────────────────────
async function getOrCreateChatSession(userId, sessionId, mode, firstMessage) {
  if (sessionId) {
    const { data } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    if (data) return sessionId;
  }
  // Create new session — title from first 60 chars of message
  const title = (firstMessage || 'محادثة جديدة').slice(0, 60);
  const { data } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title, mode })
    .select('id')
    .single();
  return data?.id || null;
}

async function saveMessage(sessionId, role, content) {
  if (!sessionId) return;
  await supabase.from('chat_messages').insert({ session_id: sessionId, role, content });
  // Update session updated_at
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);
}

// ─── Gemini streaming ────────────────────────────────────────
async function streamGemini(systemPrompt, conversationHistory, signal, modeConfig = {}) {
  const model = GEMINI_MODEL;
  const url = `${GEMINI_BASE_URL}/${model}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: conversationHistory,
    generationConfig: {
      temperature:     modeConfig.temperature ?? 0.7,
      maxOutputTokens: modeConfig.maxOutputTokens ?? 2048,
      topP:            0.95,
      topK:            40,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  // Automated resilience fallback if primary model encounters temporary issue
  if (!response.ok && model !== GEMINI_FALLBACK) {
    console.warn(`[Gemini] Model ${model} returned ${response.status}. Attempting fallback to ${GEMINI_FALLBACK}...`);
    const fallbackUrl = `${GEMINI_BASE_URL}/${GEMINI_FALLBACK}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;
    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (fallbackRes.ok) {
      return fallbackRes;
    }
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }

  return response;
}

// ─── Main handler ────────────────────────────────────────────
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  // ── Auth ──
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const user  = await verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // ── Parse body ──
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { res.status(400).json({ error: 'Invalid JSON' }); return; }

  const {
    message      = '',
    mode         = 'advisor',
    session_id   = null,
    file_context = null,   // string of extracted text from files
    history      = [],     // [{ role:'user'|'model', parts:[{text}] }]
  } = body;

  // ── Validate ──
  if (!message.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }
  if (!ALLOWED_MODES.includes(mode)) {
    res.status(400).json({ error: 'Invalid mode' });
    return;
  }

  // ── Premium gate ──
  if (PREMIUM_MODES.includes(mode) && !user.is_premium) {
    res.status(403).json({ error: 'Premium required', upgrade_required: true });
    return;
  }

  // ── Daily limit (free users) ──
  if (!user.is_premium) {
    const todayCount = await getTodayUsage(user.id);
    if (todayCount >= FREE_DAILY_LIMIT) {
      res.status(429).json({
        error: 'Daily limit reached',
        upgrade_required: true,
        count: todayCount,
        limit: FREE_DAILY_LIMIT,
      });
      return;
    }
  }

  // ── Build system prompt ──
  const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG.advisor;
  const studentCtx = {
    name:           user.name,
    specialty:      user.specialty,
    wilaya:         user.wilaya,
    is_premium:     user.is_premium,
    days_until_bac: getDaysUntilBAC(),
    onboarding_data: user.onboarding_data || {},
  };
  let systemPrompt = buildSystemPrompt(mode, studentCtx);

  // Inject file context if provided (client-extracted text)
  if (file_context && typeof file_context === 'string' && file_context.trim()) {
    const truncated = file_context.slice(0, 8000); // Safety cap
    systemPrompt += `\n\n---\n## المصادر المرفقة من الطالب\n\n${truncated}\n---`;
  }

  // ── Build conversation ──
  // Gemini requires strictly alternating roles starting with 'user'
  let safeHistory = [];
  let expectedRole = 'user';
  
  // Walk history backwards to ensure we end with a model response before our new user message
  const rawHistory = history.slice(-10).reverse();
  for (const msg of rawHistory) {
    if (msg.role !== 'user' && msg.role !== 'model') continue;
    // We are walking backwards. The msg before the NEW user message must be a 'model' message.
    if (safeHistory.length === 0) {
      if (msg.role === 'model') safeHistory.unshift(msg);
      // If it's 'user', we drop it because we can't have two 'user' messages in a row
    } else {
      const prevAddedRole = safeHistory[0].role;
      if (msg.role !== prevAddedRole) {
        safeHistory.unshift(msg);
      }
    }
  }

  // Ensure first message is user
  if (safeHistory.length > 0 && safeHistory[0].role === 'model') {
    safeHistory.shift();
  }

  const conversation = [
    ...safeHistory,
    { role: 'user', parts: [{ text: message }] },
  ];

  // ── Get/create chat session ──
  const chatSessionId = await getOrCreateChatSession(user.id, session_id, mode, message);

  // ── Save user message ──
  await saveMessage(chatSessionId, 'user', message);

  // ── SSE headers ──
  res.setHeader('Content-Type',  'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send session_id first so client knows which session we're in
  res.write(`data: ${JSON.stringify({ type: 'session', session_id: chatSessionId })}\n\n`);

  let fullText  = '';
  let aborted   = false;

  req.on('close', () => { aborted = true; });

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    // Dynamically apply temperature & token limit from mode config
    const geminiRes = await streamGemini(systemPrompt, conversation, controller.signal, modeConfig);
    const reader    = geminiRes.body.getReader();
    const decoder   = new TextDecoder();
    let   buffer    = '';

    while (!aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            fullText += text;
            res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
          }
          // Check for finish reason
          const finishReason = parsed?.candidates?.[0]?.finishReason;
          if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            if (finishReason === 'SAFETY') {
              res.write(`data: ${JSON.stringify({ type: 'error', message: 'تم حجب الرد لأسباب أمنية' })}\n\n`);
            }
          }
        } catch (parseErr) {
          // Skip malformed SSE lines
        }
      }
    }

    if (!aborted) {
      // Increment usage & save assistant message (non-blocking)
      Promise.all([
        incrementUsage(user.id),
        saveMessage(chatSessionId, 'assistant', fullText),
      ]).catch(e => console.error('Post-stream error:', e));

      res.write(`data: ${JSON.stringify({ type: 'done', session_id: chatSessionId })}\n\n`);
    }

  } catch (err) {
    if (!aborted) {
      console.error('Gemini stream error:', err);
      const msg = err.message?.includes('503') || err.message?.includes('429')
        ? 'الخدمة مشغولة — حاول مرة أخرى'
        : `حدث خطأ في الاتصال بإسلام AI: ${err.message}`;
      res.write(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`);
    }
  } finally {
    if (!aborted) res.end();
  }
}
