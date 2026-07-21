/**
 * Cloudflare Pages Function — /api/feedback
 * ==========================================
 * Secure proxy between the frontend and Google Apps Script.
 * APPS_SCRIPT_URL is stored as a Cloudflare environment secret.
 *
 * NOTE: Google Apps Script POST responses always redirect (302).
 * We handle this by using redirect:'manual' and following the
 * Location header ourselves, which returns the actual doPost() JSON.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.bac-story.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const APPS_SCRIPT_URL = env.APPS_SCRIPT_URL;
  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.startsWith('http')) {
    return json({ ok: false, error: 'Backend not configured' }, 503);
  }

  try {
    // ── GET: load ratings + approved comments ────────────────────────────
    if (method === 'GET') {
      const r = await fetch(APPS_SCRIPT_URL, { method: 'GET', redirect: 'follow' });
      const data = await r.text();
      return new Response(data, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    // ── POST: submit feedback ────────────────────────────────────────────
    if (method === 'POST') {
      const body = await request.text();

      // Size guard
      if (body.length > 4096) return json({ ok: false, error: 'Payload too large' }, 413);

      // JSON guard
      let parsed;
      try { parsed = JSON.parse(body); } catch {
        return json({ ok: false, error: 'Invalid JSON' }, 400);
      }

      // Step 1: POST to Apps Script — use redirect:'manual' so we can see the 302
      const r1 = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(parsed), // re-stringify to ensure clean JSON
        redirect: 'manual',
      });

      // Apps Script always redirects after POST — follow the Location header
      if (r1.status >= 300 && r1.status < 400) {
        const location = r1.headers.get('Location');
        if (!location) return json({ ok: false, error: 'Redirect with no Location' }, 502);

        // Step 2: fetch the redirect target (this is the actual doPost() response)
        const r2 = await fetch(location, { method: 'GET', redirect: 'follow' });
        const text = await r2.text();

        // Try to parse JSON from Apps Script response
        try {
          const result = JSON.parse(text);
          // Apps Script doPost returns {ok: true} or {ok: false, error: "..."}
          return json(result);
        } catch {
          // If it's not JSON (shouldn't happen), treat redirect success as ok
          return json({ ok: true });
        }
      }

      // No redirect — direct response (unexpected but handle it)
      const text = await r1.text();
      try {
        return json(JSON.parse(text));
      } catch {
        return json({ ok: r1.ok });
      }
    }

    return json({ ok: false, error: 'Method not allowed' }, 405);

  } catch (err) {
    return json({ ok: false, error: 'Proxy error: ' + err.message }, 502);
  }
}
