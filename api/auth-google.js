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

async function verifyGoogleCredential(credential) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!res.ok) throw new Error('فشل التحقق من حساب Google');
  const data = await res.json();
  if (data.error) throw new Error('رمز Google غير صحيح أو منتهي الصلاحية');

  // Validate audience matches our client ID
  const expectedAudience = process.env.GOOGLE_CLIENT_ID;
  if (expectedAudience && data.aud !== expectedAudience) {
    throw new Error('رمز Google غير موثوق');
  }

  return {
    google_id: data.sub,
    email: data.email,
    name: data.name || data.email?.split('@')[0] || 'طالب',
    picture: data.picture || null,
    email_verified: data.email_verified === 'true',
  };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
  }

  const { credential, name, specialty, wilaya } = req.body || {};

  if (!credential) {
    return res.status(400).json({ error: 'رمز Google مطلوب' });
  }

  // Verify with Google
  let googleProfile;
  try {
    googleProfile = await verifyGoogleCredential(credential);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  const { google_id, email, name: googleName, picture } = googleProfile;

  // Look up user by google_id first, then fallback to email
  let user = null;
  let isNewUser = false;

  const { data: byGoogleId } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', google_id)
    .maybeSingle();

  if (byGoogleId) {
    user = byGoogleId;
  } else if (email) {
    const { data: byEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (byEmail) {
      // Link google_id to existing email account
      await supabase.from('users').update({ google_id }).eq('id', byEmail.id);
      user = { ...byEmail, google_id };
    }
  }

  // Determine if profile completion is needed
  const providedSpecialty = specialty && VALID_SPECIALTIES.includes(specialty) ? specialty : null;
  const providedName = (name && name.trim()) || googleName;
  const providedWilaya = wilaya && wilaya.trim() ? wilaya.trim() : null;

  if (!user) {
    // New user — check if profile data is complete enough
    if (!providedSpecialty || !providedWilaya) {
      // Return needs_profile so client shows profile form
      return res.status(200).json({
        ok: true,
        needs_profile: true,
        google_email: email,
        google_name: googleName,
      });
    }

    // Create new user with full profile (schema uses `name` column)
    const newUser = {
      email,
      google_id,
      name: providedName,
      specialty: providedSpecialty,
      wilaya: providedWilaya,
      is_premium: false,
      onboarding_done: false,
    };

    const { data: created, error: createErr } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (createErr || !created) {
      console.error('Google user create error:', createErr);
      return res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
    }
    user = created;
    isNewUser = true;
  } else {
    // Existing user — update profile fields if provided
    const updateData = {};
    if (providedSpecialty) updateData.specialty = providedSpecialty;
    if (providedWilaya) updateData.wilaya = providedWilaya;
    if (providedName) updateData.name = providedName;
    if (Object.keys(updateData).length > 0) {
      await supabase.from('users').update(updateData).eq('id', user.id);
      user = { ...user, ...updateData };
    }
    isNewUser = false;
  }

  // Create session (30-day)
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
