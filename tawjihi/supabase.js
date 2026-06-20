// Supabase browser client — anon key is safe to expose (enforces RLS)
const SUPABASE_URL = 'https://vfjjrpzdyvawthvkwelr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_mc3AaE87sIU8hqaJT1b8iA_b1a2FhUw';
const tw_supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
