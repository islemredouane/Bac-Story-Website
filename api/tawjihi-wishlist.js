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

  // GET — return the user's wishlist
  if (req.method === 'GET') {
    try {
      const { data, error } = await adminSupabase
        .from('wishlists')
        .select('spec_ids')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Wishlist fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch wishlist' });
      }

      return res.status(200).json({ specIds: data?.spec_ids || [] });
    } catch (err) {
      console.error('GET wishlist error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST — save the user's wishlist
  if (req.method === 'POST') {
    try {
      const { specIds } = req.body || {};

      if (!Array.isArray(specIds)) {
        return res.status(400).json({
          error: 'invalid_spec_ids',
          message: 'specIds must be an array',
        });
      }

      if (specIds.length > 10) {
        return res.status(400).json({
          error: 'too_many_specs',
          message: 'Wishlist cannot contain more than 10 specialties',
        });
      }

      const { error } = await adminSupabase
        .from('wishlists')
        .upsert(
          { user_id: user.id, spec_ids: specIds, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Wishlist upsert error:', error);
        return res.status(500).json({ error: 'Failed to save wishlist' });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('POST wishlist error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
