// DEPENDENCY: This file requires the following Supabase RPC function to exist:
//
//   create or replace function increment_credits(uid uuid, amount integer)
//   returns void language plpgsql security definer as $$
//   begin
//     update credits
//     set balance = balance + amount,
//         total_earned = total_earned + amount,
//         updated_at = now()
//     where user_id = uid;
//   end;
//   $$;
//
// If the RPC is not available, the fallback path below performs a manual read+update.

import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await adminSupabase.auth.getUser(token);
  return user || null;
}

/**
 * Increment credits for a user by `amount`.
 * Tries the increment_credits RPC first; falls back to a manual read+update.
 */
async function incrementCredits(uid, amount) {
  const { error: rpcError } = await adminSupabase.rpc('increment_credits', { uid, amount });

  if (!rpcError) return; // RPC succeeded

  console.warn('increment_credits RPC unavailable, using fallback:', rpcError.message);

  // Fallback: manual read + update
  const { data: existing, error: fetchError } = await adminSupabase
    .from('credits')
    .select('balance, total_earned')
    .eq('user_id', uid)
    .single();

  if (fetchError) throw new Error(`Credits fetch failed for ${uid}: ${fetchError.message}`);

  const { error: updateError } = await adminSupabase
    .from('credits')
    .update({
      balance: (existing?.balance || 0) + amount,
      total_earned: (existing?.total_earned || 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', uid);

  if (updateError) throw new Error(`Credits update failed for ${uid}: ${updateError.message}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user;
  try {
    user = await getUser(req);
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — return referral info + current balance
  if (req.method === 'GET') {
    try {
      const [{ data: ref, error: refError }, { data: credits, error: creditsError }] =
        await Promise.all([
          adminSupabase
            .from('referral_codes')
            .select('code, refs_count, earned_credits')
            .eq('owner_user_id', user.id)
            .single(),
          adminSupabase
            .from('credits')
            .select('balance')
            .eq('user_id', user.id)
            .single(),
        ]);

      // PGRST116 = no rows found — acceptable for both tables
      if (refError && refError.code !== 'PGRST116') {
        console.error('Referral fetch error:', refError);
        return res.status(500).json({ error: 'Failed to fetch referral data' });
      }
      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Credits fetch error:', creditsError);
        return res.status(500).json({ error: 'Failed to fetch credit balance' });
      }

      return res.status(200).json({
        code: ref?.code || null,
        refs: ref?.refs_count || 0,
        earnedCredits: ref?.earned_credits || 0,
        balance: credits?.balance || 0,
      });
    } catch (err) {
      console.error('GET referral error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST — redeem a referral code
  if (req.method === 'POST') {
    try {
      const { action, code } = req.body || {};

      if (action !== 'redeem') {
        return res.status(400).json({ error: 'invalid_action', message: 'action must be "redeem"' });
      }

      if (!code || typeof code !== 'string' || code.trim() === '') {
        return res.status(400).json({ error: 'invalid_code', message: 'A referral code is required' });
      }

      const normalizedCode = code.trim().toUpperCase();

      // Look up the referral code — must belong to someone else
      const { data: referral, error: lookupError } = await adminSupabase
        .from('referral_codes')
        .select('id, owner_user_id, refs_count, earned_credits')
        .eq('code', normalizedCode)
        .neq('owner_user_id', user.id)
        .single();

      if (lookupError || !referral) {
        return res.status(404).json({ error: 'invalid_code', message: 'Referral code not found or not valid' });
      }

      const referrerId = referral.owner_user_id;

      // Credit both users (+30 each)
      await incrementCredits(referrerId, 30);
      await incrementCredits(user.id, 30);

      // Update refs_count and earned_credits on the referral record
      const { error: refUpdateError } = await adminSupabase
        .from('referral_codes')
        .update({
          refs_count: (referral.refs_count || 0) + 1,
          earned_credits: (referral.earned_credits || 0) + 30,
        })
        .eq('id', referral.id);

      if (refUpdateError) {
        // Non-fatal: credits already awarded — log but don't fail the request
        console.error('Referral stats update error:', refUpdateError);
      }

      return res.status(200).json({ ok: true, credited: 30 });
    } catch (err) {
      console.error('POST referral error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
