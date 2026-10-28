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

const origin = process.env.NODE_ENV === 'development'
  ? '*'
  : (process.env.ALLOWED_ORIGIN || '');

// ── HTML email template ────────────────────────────────────────────────────────
function buildEmailHtml(code, name) {
  const displayName = name || 'طالب';
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>كود التحقق - BAC STORY</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(44,92,197,0.14);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2c5cc5 0%,#212529 100%);padding:36px 32px;text-align:center;">
              <div style="font-family:'Georgia',serif;font-size:2.2rem;font-weight:900;color:#ffffff;letter-spacing:3px;margin-bottom:6px;">BAC STORY</div>
              <div style="color:rgba(255,255,255,0.78);font-size:0.9rem;">منصة التميز في البكالوريا الجزائرية</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 36px 32px;">
              <p style="font-size:1.15rem;color:#212529;margin:0 0 10px;font-weight:600;">
                مرحباً ${escapeHtml(displayName)} 👋
              </p>
              <p style="font-size:0.95rem;color:#4a5568;margin:0 0 28px;line-height:1.7;">
                طلبت تسجيل الدخول إلى منصة <strong style="color:#2c5cc5;">BAC STORY</strong>. استخدم الكود أدناه لإتمام العملية. صلاحيته <strong>10 دقائق</strong> فقط.
              </p>

              <!-- OTP code box -->
              <div style="background:linear-gradient(135deg,#f0f4ff 0%,#e8eeff 100%);border:2px solid #2c5cc5;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <div style="font-size:0.78rem;color:#6c757d;margin-bottom:12px;letter-spacing:1px;">كود التحقق الخاص بك</div>
                <div style="font-family:'Courier New',monospace;font-size:2.8rem;font-weight:900;color:#2c5cc5;letter-spacing:14px;">${escapeHtml(code)}</div>
              </div>

              <div style="background:#fff8f5;border:1px solid rgba(255,107,53,0.25);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:0.85rem;color:#e05a2b;line-height:1.6;">
                  ⚠️ <strong>تحذير أمني:</strong> لا تشارك هذا الكود مع أي شخص. فريق BAC STORY لن يطلب منك هذا الكود أبداً.
                </p>
              </div>

              <p style="font-size:0.85rem;color:#94a3b8;margin:0;line-height:1.6;">
                إذا لم تطلب هذا الكود، تجاهل هذا البريد بأمان تام. حسابك بخير 🔒
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:0.78rem;color:#94a3b8;line-height:1.7;">
                © ${new Date().getFullYear()} BAC STORY — منصة البكالوريا الجزائرية<br>
                <a href="https://bacstory.vercel.app" style="color:#2c5cc5;text-decoration:none;">bacstory.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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

  const { identifier, type, name, specialty, wilaya } = req.body || {};

  // Validate required fields
  if (!identifier || !type || !name || !specialty || !wilaya) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }
  if (!['email', 'telegram'].includes(type)) {
    return res.status(400).json({ error: 'نوع التحقق غير صحيح' });
  }
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
  }
  if (type === 'telegram' && !/^\d+$/.test(identifier)) {
    return res.status(400).json({ error: 'Chat ID غير صحيح' });
  }

  // Rate limit: max 3 OTPs per hour per identifier
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount, error: countErr } = await supabase
    .from('otp_codes')
    .select('id', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gt('created_at', oneHourAgo);

  if (countErr) {
    console.error('Rate limit check error:', countErr);
    return res.status(500).json({ error: 'خطأ في الخادم، حاول مجدداً' });
  }
  if (recentCount >= 3) {
    return res.status(429).json({ error: 'تجاوزت الحد المسموح. انتظر ساعة قبل المحاولة مجدداً' });
  }

  // Invalidate old unused codes for this identifier (schema uses `is_used`)
  await supabase
    .from('otp_codes')
    .update({ is_used: true })
    .eq('identifier', identifier)
    .eq('is_used', false);

  // Generate OTP
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Save to DB (schema uses `type` and `is_used`)
  const { error: insertErr } = await supabase
    .from('otp_codes')
    .insert({
      identifier,
      code,
      type,
      is_used: false,
      expires_at: expiresAt,
    });

  if (insertErr) {
    console.error('OTP insert error:', insertErr);
    return res.status(500).json({ error: 'خطأ في حفظ الكود، حاول مجدداً' });
  }

  // Send OTP
  if (type === 'email') {
    // Send via Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(500).json({ error: 'خدمة البريد غير مفعّلة' });
    }
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BAC STORY <noreply@bacstory.vercel.app>',
          to: [identifier],
          subject: `كود التحقق: ${code} — BAC STORY`,
          html: buildEmailHtml(code, name),
        }),
      });
      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}));
        console.error('Resend error:', errData);
        return res.status(500).json({ error: 'فشل إرسال البريد الإلكتروني، تحقق من العنوان وحاول مجدداً' });
      }
    } catch (e) {
      console.error('Email send exception:', e);
      return res.status(500).json({ error: 'فشل إرسال البريد الإلكتروني' });
    }
  } else {
    // Send via Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'خدمة تيليجرام غير مفعّلة' });
    }
    const message = `🎓 *BAC STORY* — كود التحقق الخاص بك:\n\n` +
      `\`${code}\`\n\n` +
      `⏱ صلاحيته 10 دقائق فقط.\n` +
      `🔒 لا تشاركه مع أحد.`;
    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: identifier,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );
      const tgData = await tgRes.json();
      if (!tgData.ok) {
        console.error('Telegram error:', tgData);
        const tgErr = tgData.description || '';
        if (tgErr.includes('chat not found') || tgErr.includes('user not found')) {
          return res.status(400).json({ error: 'Chat ID غير صحيح. تأكد من أنك أرسلت /start للبوت أولاً' });
        }
        return res.status(500).json({ error: 'فشل إرسال رسالة تيليجرام' });
      }
    } catch (e) {
      console.error('Telegram send exception:', e);
      return res.status(500).json({ error: 'فشل الاتصال بتيليجرام' });
    }
  }

  return res.status(200).json({ ok: true });
}
