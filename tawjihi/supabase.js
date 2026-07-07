// Supabase browser client.
// IMPORTANT: only the PUBLISHABLE key (sb_publishable_...) may live here — this file
// ships to every visitor's browser. The SECRET key (sb_secret_...) must NEVER appear
// in client code; it lives only in server-side env vars (Vercel + local .env.local)
// and is used exclusively by the serverless functions under /api. The publishable key
// is safe to expose because Row-Level Security (RLS) enforces all access rules.
const SUPABASE_URL = 'https://vfjjrpzdyvawthvkwelr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OoplMmN-mUbjASDk_dLycA_jT5Ej2Eq';
const tw_supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
