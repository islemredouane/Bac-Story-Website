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

const VALID_STREAMS = [
  'علوم تجريبية',
  'رياضيات',
  'تقني رياضي',
  'تسيير واقتصاد',
  'آداب وفلسفة',
  'لغات أجنبية',
];

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

  // GET — return the user's profile
  if (req.method === 'GET') {
    try {
      const { data: profile, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        console.error('Profile fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      return res.status(200).json(profile || {});
    } catch (err) {
      console.error('GET profile error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST — upsert the user's profile
  if (req.method === 'POST') {
    try {
      const { stream, average, wilaya, interests, ambition, ambition_text, completed } = req.body || {};

      // Validate stream if provided
      if (stream !== undefined && !VALID_STREAMS.includes(stream)) {
        return res.status(400).json({
          error: 'invalid_stream',
          message: `Stream must be one of: ${VALID_STREAMS.join(', ')}`,
        });
      }

      // Validate average if provided
      if (average !== undefined) {
        const avg = Number(average);
        if (isNaN(avg) || avg < 0 || avg > 20) {
          return res.status(400).json({
            error: 'invalid_average',
            message: 'Average must be a number between 0 and 20',
          });
        }
      }

      const updates = {
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (stream !== undefined) updates.stream = stream;
      if (average !== undefined) updates.average = Number(average);
      if (wilaya !== undefined) updates.wilaya = wilaya;
      if (interests !== undefined) updates.interests = interests;
      if (ambition !== undefined) updates.ambition = ambition;
      if (ambition_text !== undefined) updates.ambition_text = ambition_text;
      if (completed !== undefined) updates.completed = completed;

      const { error } = await adminSupabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Profile upsert error:', error);
        return res.status(500).json({ error: 'Failed to save profile' });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('POST profile error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
