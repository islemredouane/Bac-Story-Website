/**
 * Cloudflare Pages Function — /api/feedback
 * ==========================================
 * Acts as a secure proxy between the frontend and the Google Apps Script backend.
 * The Apps Script URL is stored as a Cloudflare environment secret (APPS_SCRIPT_URL)
 * so it is never exposed in the client-side HTML.
 *
 * HOW TO SET THE SECRET (one time):
 *   1. Go to your Cloudflare Pages project → Settings → Environment variables
 *   2. Add a variable named: APPS_SCRIPT_URL
 *   3. Set its value to your Apps Script web app URL:
 *      https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 *   4. Save and redeploy (or just wait for the next push)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.bac-story.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const APPS_SCRIPT_URL = env.APPS_SCRIPT_URL;

  // Guard: env var not configured yet
  if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.startsWith('http')) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Backend not configured' }),
      { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let upstream;

    if (method === 'GET') {
      // Forward GET to Apps Script (load ratings + approved comments)
      upstream = await fetch(APPS_SCRIPT_URL, { method: 'GET' });

    } else if (method === 'POST') {
      // Forward POST to Apps Script (submit feedback)
      const body = await request.text();

      // Basic size guard — reject absurdly large payloads
      if (body.length > 4096) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Payload too large' }),
          { status: 413, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // Validate it is valid JSON before forwarding
      try { JSON.parse(body); } catch (e) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid JSON' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // Apps Script requires no Content-Type header to avoid CORS preflight on its end
      upstream = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body,
        redirect: 'follow',
      });

    } else {
      return new Response(
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const data = await upstream.text();

    return new Response(data, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': method === 'GET' ? 'public, max-age=60, s-maxage=300' : 'no-store',
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Proxy error: ' + err.message }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
}
