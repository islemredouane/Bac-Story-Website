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

const origin = process.env.NODE_ENV === 'development'
  ? '*'
  : (process.env.ALLOWED_ORIGIN || '');

async function verifySession(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { data, error } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return { token, userId: data.user_id };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: validate session and return user ──────────────────────────────────
  if (req.method === 'GET') {
    const session = await verifySession(req);
    if (!session) {
      return res.status(401).json({ error: 'جلسة غير صحيحة أو منتهية' });
    }

    // Fetch user (schema uses `name` not `display_name`)
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, specialty, wilaya, is_premium, premium_until, onboarding_done')
      .eq('id', session.userId)
      .single();

    if (userErr || !user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email || null,
        specialty: user.specialty,
        wilaya: user.wilaya || '',
        is_premium: user.is_premium || false,
        premium_until: user.premium_until || null,
        onboarding_done: user.onboarding_done !== false,
      },
    });
  }

  // ── DELETE: invalidate session (logout) ────────────────────────────────────
  if (req.method === 'DELETE') {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(400).json({ error: 'الرمز مطلوب' });
    }

    // Set expires_at to now() to invalidate
    const { error } = await supabase
      .from('sessions')
      .update({ expires_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      console.error('Session invalidation error:', error);
      // Return ok anyway — client already cleared localStorage
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
}
