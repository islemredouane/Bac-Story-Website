// api/ai-history.js
// GET  /api/ai-history             → list sessions (with ?limit=N)
// GET  /api/ai-history?session=ID  → get messages for a session
// DELETE /api/ai-history?session=ID → delete a session

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
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

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const token  = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const userId = await verifyToken(token);
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { session: sessionId, limit = '20' } = req.query;

  // ── DELETE session ──
  if (req.method === 'DELETE') {
    if (!sessionId) { res.status(400).json({ error: 'session query param required' }); return; }
    // Verify ownership
    const { data } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    if (!data) { res.status(404).json({ error: 'Session not found' }); return; }

    // Delete messages first, then session
    await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    res.status(200).json({ ok: true });
    return;
  }

  // ── GET session messages ──
  if (req.method === 'GET' && sessionId) {
    // Verify ownership
    const { data: sess } = await supabase
      .from('chat_sessions')
      .select('id, title, mode, created_at, updated_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    if (!sess) { res.status(404).json({ error: 'Session not found' }); return; }

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    res.status(200).json({ session: sess, messages: messages || [] });
    return;
  }

  // ── GET sessions list ──
  if (req.method === 'GET') {
    const limitN = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id, title, mode, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limitN);

    res.status(200).json({ sessions: sessions || [] });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
