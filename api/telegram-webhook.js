// api/telegram-webhook.js
// Telegram Bot webhook — handles admin commands + user OTP linking
// POST /api/telegram-webhook (set via setWebhook on Telegram Bot API)

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

const BOT_TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS     = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const BOT_API       = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── Send Telegram message ───────────────────────────────────
async function sendMsg(chatId, text, parseMode = 'HTML') {
  await fetch(`${BOT_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    chatId,
      text,
      parse_mode: parseMode,
    }),
  });
}

// ─── Generate random code ────────────────────────────────────
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BACS-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Admin check ─────────────────────────────────────────────
function isAdmin(chatId) {
  return ADMIN_IDS.includes(String(chatId));
}

// ─── Handle /start (OTP link or just welcome) ────────────────
async function handleStart(msg, param) {
  const chatId = msg.chat.id;

  if (param && param.startsWith('link')) {
    // User came from site OTP flow — store their chat_id
    // The identifier is stored in otp_codes; the bot_chat_id is the Telegram ID
    // We associate this chatId with pending OTP requests from this user
    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Save as telegram OTP (identifier = chatId string)
    await supabase.from('otp_codes').insert({
      identifier: String(chatId),
      type:       'telegram',
      code:       otp,
      expires_at: expires,
      is_used:    false,
    });

    await sendMsg(chatId,
      `🔐 <b>كود التحقق الخاص بك:</b>\n\n<code>${otp}</code>\n\n⏱ صالح لـ 10 دقائق\n\nارجع للموقع وأدخله هناك.`
    );
    return;
  }

  await sendMsg(chatId,
    `🤖 <b>أهلاً بك في BAC STORY Bot!</b>\n\nيمكنك:\n• <b>تسجيل الدخول</b> عبر الموقع باستخدام Telegram OTP\n• <b>تفعيل Premium</b> عبر كود الاشتراك\n\n🌐 <a href="https://bacstory.com">bacstory.com</a>`
  );
}

// ─── Handle /gencode [days] (admin only) ────────────────────
async function handleGencode(msg, args) {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) {
    await sendMsg(chatId, '⛔ هذا الأمر للمسؤولين فقط.');
    return;
  }

  const days = parseInt(args[0]) || 30;
  if (days < 1 || days > 365) {
    await sendMsg(chatId, '❌ عدد الأيام يجب أن يكون بين 1 و 365.');
    return;
  }

  // Generate unique code
  let code, exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    code = generateCode();
    const { data } = await supabase.from('premium_activation_codes').select('id').eq('code', code).single();
    exists = !!data;
    attempts++;
  }

  await supabase.from('premium_activation_codes').insert({
    code,
    created_by_admin: String(chatId),
    duration_days:    days,
    is_used:          false,
  });

  await sendMsg(chatId,
    `✅ <b>كود Premium جديد:</b>\n\n<code>${code}</code>\n\n⏳ مدة: <b>${days} يوم</b>\n\nأرسل هذا الكود للطالب ليدخله في ملفه الشخصي على الموقع.`
  );
}

// ─── Handle /status [user_id] (admin) ───────────────────────
async function handleStatus(msg, args) {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) {
    await sendMsg(chatId, '⛔ هذا الأمر للمسؤولين فقط.');
    return;
  }

  const userId = args[0];
  if (!userId) {
    await sendMsg(chatId, 'استخدام: /status [user_id]');
    return;
  }

  const { data: user } = await supabase
    .from('users')
    .select('name, email, is_premium, premium_until, tier, created_at')
    .eq('id', userId)
    .single();

  if (!user) {
    await sendMsg(chatId, `❌ المستخدم ${userId} غير موجود.`);
    return;
  }

  await sendMsg(chatId,
    `👤 <b>${user.name || 'بدون اسم'}</b>\n` +
    `📧 ${user.email || '—'}\n` +
    `💎 الاشتراك: <b>${user.is_premium ? 'Premium' : 'مجاني'}</b>\n` +
    `${user.premium_until ? `⏳ ينتهي: ${new Date(user.premium_until).toLocaleDateString('ar-DZ')}\n` : ''}` +
    `📅 انضم: ${new Date(user.created_at).toLocaleDateString('ar-DZ')}`
  );
}

// ─── Handle /codes — list unused codes (admin) ──────────────
async function handleCodes(msg) {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) { await sendMsg(chatId, '⛔'); return; }

  const { data: codes } = await supabase
    .from('premium_activation_codes')
    .select('code, duration_days, is_used, created_at')
    .eq('is_used', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!codes?.length) {
    await sendMsg(chatId, 'لا توجد أكواد غير مستخدمة.');
    return;
  }

  const text = codes.map(c => `<code>${c.code}</code> — ${c.duration_days} يوم`).join('\n');
  await sendMsg(chatId, `📋 <b>الأكواد المتاحة (${codes.length}):</b>\n\n${text}`);
}

// ─── Handle /stats (admin) ───────────────────────────────────
async function handleStats(msg) {
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) { await sendMsg(chatId, '⛔'); return; }

  const [
    { count: totalUsers },
    { count: premUsers },
    { count: totalSessions },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
  ]);

  await sendMsg(chatId,
    `📊 <b>إحصائيات BAC STORY</b>\n\n` +
    `👥 إجمالي المستخدمين: <b>${totalUsers || 0}</b>\n` +
    `👑 مشتركو Premium: <b>${premUsers || 0}</b>\n` +
    `💬 إجمالي المحادثات: <b>${totalSessions || 0}</b>`
  );
}

// ─── Main handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  // Only allow POST from Telegram
  if (req.method !== 'POST') { res.status(405).end(); return; }

  let update;
  try { update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { res.status(400).end(); return; }

  try {
    const msg = update.message;
    if (!msg || !msg.text) { res.status(200).end(); return; }

    const text  = (msg.text || '').trim();
    const parts = text.split(/\s+/);
    const cmd   = parts[0].split('@')[0].toLowerCase(); // strip bot mention
    const args  = parts.slice(1);

    if      (cmd === '/start')   await handleStart(msg, args[0]);
    else if (cmd === '/gencode') await handleGencode(msg, args);
    else if (cmd === '/status')  await handleStatus(msg, args);
    else if (cmd === '/codes')   await handleCodes(msg);
    else if (cmd === '/stats')   await handleStats(msg);
    else if (cmd === '/help') {
      const isAdm = isAdmin(msg.chat.id);
      await sendMsg(msg.chat.id,
        `🤖 <b>BAC STORY Bot — المساعدة</b>\n\n` +
        (isAdm
          ? `/gencode [أيام] — إنشاء كود Premium\n/codes — عرض الأكواد المتاحة\n/status [user_id] — حالة مستخدم\n/stats — إحصائيات المنصة`
          : `/start — بدء التشغيل\n\nللاشتراك في Premium تواصل مع المسؤول.`)
      );
    }
  } catch (err) {
    console.error('Telegram webhook error:', err);
  }

  res.status(200).json({ ok: true });
}
