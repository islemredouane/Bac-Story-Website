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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
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

  // GET — return the user's credit balance
  try {
    const { data, error } = await adminSupabase
      .from('credits')
      .select('balance, total_earned, total_spent')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Credits fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch credits' });
    }

    return res.status(200).json(data || { balance: 0, total_earned: 0, total_spent: 0 });
  } catch (err) {
    console.error('GET credits error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
