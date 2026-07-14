// Create/refresh the QA test account and print its token + uuid (stdout: JSON only)
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const ROOT = 'C:/Users/AZ/Documents/BAC CHANNEL/Bac-Story-Website/.claude/worktrees/cool-stonebraker-deb446/FETCH_HEAD';
const env = {};
for (const l of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').replace(/^﻿/, '').split('\n')) {
  const t = l.trim(); if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('='); if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
const PUB = 'sb_publishable_OoplMmN-mUbjASDk_dLycA_jT5Ej2Eq';
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const EMAIL = 'qa-battery-test@tawjihi-internal.test';
const PASS = 'Qa!' + Math.random().toString(36).slice(2, 12) + 'x9';

// find or create
let userId;
const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const existing = (list?.users || []).find(u => u.email === EMAIL);
if (existing) {
  userId = existing.id;
  await admin.auth.admin.updateUserById(userId, { password: PASS, email_confirm: true });
} else {
  const { data, error } = await admin.auth.admin.createUser({ email: EMAIL, password: PASS, email_confirm: true });
  if (error) { console.error('createUser:', error.message); process.exit(1); }
  userId = data.user.id;
}
// sign in with the client key to obtain a genuine access token
const client = createClient(env.SUPABASE_URL, PUB);
const { data: s, error: e2 } = await client.auth.signInWithPassword({ email: EMAIL, password: PASS });
if (e2) { console.error('signIn:', e2.message); process.exit(1); }
console.log(JSON.stringify({ userId, token: s.session.access_token }));
