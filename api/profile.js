// api/profile.js
// GET    /api/profile          → user profile + today's usage
// PATCH  /api/profile          → update profile fields / onboarding
// POST   /api/profile          → actions (activate_premium, save_quiz, save_deck)

import '../lib/env.js';
import { createClient } from '@supabase/supabase-js';

let _supabase;
const supabase = new Proxy({}, {
  get(_, key) {
    if (!_supabase) _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const val = _supabase[key];
    return typeof val === 'function' ? val.bind(_supabase) : val;
  }
});

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function verifyToken(token) {
  if (!token) return null;
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();
  if (!session || new Date(session.expires_at) < new Date()) return null;
  return session.user_id;
}

async function getUser(userId) {
  const { data } = await supabase
    .from('users')
    .select('id, name, email, specialty, wilaya, is_premium, premium_until, tier, onboarding_done, onboarding_data, created_at')
    .eq('id', userId)
    .single();
  return data;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const token  = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const userId = await verifyToken(token);
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  // ── GET — profile + stats ──────────────────────────────────
  if (req.method === 'GET') {
    const user = await getUser(userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Today's message count
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('message_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Quiz results count
    const { count: quizCount } = await supabase
      .from('quiz_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Chat sessions count
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.status(200).json({
      user,
      today_messages: usage?.message_count || 0,
      stats: {
        quiz_count:    quizCount    || 0,
        session_count: sessionCount || 0,
      },
    });
    return;
  }

  // ── PATCH — update profile / onboarding ───────────────────
  if (req.method === 'PATCH') {
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { res.status(400).json({ error: 'Invalid JSON' }); return; }

    // Whitelist patchable fields
    const ALLOWED = ['name', 'specialty', 'wilaya', 'onboarding_done', 'onboarding_data'];
    const patch   = {};
    for (const key of ALLOWED) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (!Object.keys(patch).length) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    patch.updated_at = new Date().toISOString();
    const { error } = await supabase.from('users').update(patch).eq('id', userId);
    if (error) { res.status(500).json({ error: error.message }); return; }

    // Return updated user
    const user = await getUser(userId);
    res.status(200).json({ ok: true, user });
    return;
  }

  // ── POST — actions ────────────────────────────────────────
  if (req.method === 'POST') {
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { res.status(400).json({ error: 'Invalid JSON' }); return; }

    const { action } = body;

    // ── activate_premium ──
    if (action === 'activate_premium') {
      const { code } = body;
      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Code is required' });
        return;
      }
      const cleanCode = code.toUpperCase().trim();

      // Find code
      const { data: codeRow } = await supabase
        .from('premium_activation_codes')
        .select('id, is_used, duration_days')
        .eq('code', cleanCode)
        .single();

      if (!codeRow) {
        res.status(404).json({ error: 'invalid_code', message: 'الكود غير صحيح' });
        return;
      }
      if (codeRow.is_used) {
        res.status(409).json({ error: 'code_used', message: 'هذا الكود استُخدم مسبقاً' });
        return;
      }

      const durationDays = codeRow.duration_days || 30;
      const premiumUntil = new Date(Date.now() + durationDays * 86400000).toISOString();

      // Mark code as used
      await supabase
        .from('premium_activation_codes')
        .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
        .eq('id', codeRow.id);

      // Upgrade user
      await supabase
        .from('users')
        .update({
          is_premium:    true,
          premium_until: premiumUntil,
          tier:          'premium',
          updated_at:    new Date().toISOString(),
        })
        .eq('id', userId);

      const user = await getUser(userId);
      res.status(200).json({ ok: true, user, premium_until: premiumUntil });
      return;
    }

    // ── save_quiz ──
    if (action === 'save_quiz') {
      const { subject, score, total, mode } = body;
      if (!subject || score == null || !total) {
        res.status(400).json({ error: 'subject, score, total required' });
        return;
      }
      await supabase.from('quiz_results').insert({
        user_id: userId,
        subject,
        score:   parseInt(score),
        total:   parseInt(total),
        mode:    mode || 'quiz',
      });
      res.status(200).json({ ok: true });
      return;
    }

    // ── save_deck ──
    if (action === 'save_deck') {
      const { title, subject, cards_json } = body;
      if (!title || !cards_json) {
        res.status(400).json({ error: 'title and cards_json required' });
        return;
      }
      await supabase.from('flashcard_decks').insert({
        user_id:    userId,
        title:      title.slice(0, 100),
        subject:    subject || '',
        cards_json: typeof cards_json === 'string' ? cards_json : JSON.stringify(cards_json),
      });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
