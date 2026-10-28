import '../lib/env.js';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

const VALID_SPECIALTIES = ['math', 'science', 'tech', 'management', 'literature', 'languages'];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
  }

  const { identifier, code, type, name, specialty, wilaya } = req.body || {};

  // Validate inputs
  if (!identifier || !code || !type) {
    return res.status(400).json({ error: 'بيانات ناقصة' });
  }
  if (!['email', 'telegram'].includes(type)) {
    return res.status(400).json({ error: 'نوع غير صحيح' });
  }
  if (!/^\d{6}$/.test(String(code).trim())) {
    return res.status(400).json({ error: 'الكود يجب أن يتكوّن من 6 أرقام' });
  }

  const trimmedCode = String(code).trim();
  const now = new Date().toISOString();

  // Look up OTP — must be unused, not expired, matching identifier + code
  const { data: otpRow, error: otpErr } = await supabase
    .from('otp_codes')
    .select('id, identifier, code, type, expires_at, is_used')
    .eq('identifier', identifier)
    .eq('code', trimmedCode)
    .eq('is_used', false)
    .eq('type', type)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (otpErr || !otpRow) {
    return res.status(400).json({ error: 'كود خاطئ أو منتهي الصلاحية' });
  }

  // Mark code as used
  const { error: markErr } = await supabase
    .from('otp_codes')
    .update({ is_used: true })
    .eq('id', otpRow.id);

  if (markErr) {
    console.error('Mark OTP used error:', markErr);
    return res.status(500).json({ error: 'خطأ في الخادم، حاول مجدداً' });
  }

  // Upsert user
  let user = null;
  let isNewUser = false;

  // Build user payload (schema uses `name` not `display_name`)
  const userPayload = {};
  if (name && name.trim()) userPayload.name = name.trim();
  if (specialty && VALID_SPECIALTIES.includes(specialty)) userPayload.specialty = specialty;
  if (wilaya && wilaya.trim()) userPayload.wilaya = wilaya.trim();

  if (type === 'email') {
    // Look up by email
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', identifier)
      .maybeSingle();

    if (existing) {
      const updateData = { ...userPayload };
      if (Object.keys(updateData).length > 0) {
        await supabase.from('users').update(updateData).eq('id', existing.id);
      }
      const { data: updated } = await supabase.from('users').select('*').eq('id', existing.id).single();
      user = updated || existing;
      isNewUser = false;
    } else {
      const newUser = {
        email: identifier,
        name: userPayload.name || identifier.split('@')[0],
        specialty: userPayload.specialty || 'math',
        wilaya: userPayload.wilaya || '',
        is_premium: false,
        onboarding_done: false,
      };
      const { data: created, error: createErr } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createErr || !created) {
        console.error('User create error:', createErr);
        return res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
      }
      user = created;
      isNewUser = true;
    }
  } else {
    // Telegram: look up by telegram_chat_id
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_chat_id', identifier)
      .maybeSingle();

    if (existing) {
      const updateData = { ...userPayload };
      if (Object.keys(updateData).length > 0) {
        await supabase.from('users').update(updateData).eq('id', existing.id);
      }
      const { data: updated } = await supabase.from('users').select('*').eq('id', existing.id).single();
      user = updated || existing;
      isNewUser = false;
    } else {
      const newUser = {
        telegram_chat_id: identifier,
        name: userPayload.name || 'طالب',
        specialty: userPayload.specialty || 'math',
        wilaya: userPayload.wilaya || '',
        is_premium: false,
        onboarding_done: false,
      };
      const { data: created, error: createErr } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createErr || !created) {
        console.error('User create error:', createErr);
        return res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
      }
      user = created;
      isNewUser = true;
    }
  }

  if (!user) {
    return res.status(500).json({ error: 'خطأ في العثور على المستخدم' });
  }

  // Create session token (30-day)
  const token = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
  const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: sessionErr } = await supabase
    .from('sessions')
    .insert({
      token,
      user_id: user.id,
      expires_at: sessionExpiry,
    });

  if (sessionErr) {
    console.error('Session create error:', sessionErr);
    return res.status(500).json({ error: 'خطأ في إنشاء الجلسة' });
  }

  // Return session + safe user object
  return res.status(200).json({
    ok: true,
    token,
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
    is_new_user: isNewUser,
  });
}
