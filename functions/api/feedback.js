/**
 * Cloudflare Pages Function — /api/feedback
 * ==========================================
 * Secure proxy → Google Apps Script backend.
 * APPS_SCRIPT_URL is stored as a Cloudflare environment secret.
 *
 * FIX: Google Apps Script always responds to POST with a 302 redirect
 * to a googleusercontent.com echo URL that carries the actual doPost()
 * response. We use redirect:'follow' so Cloudflare follows the chain
 * and gets the real JSON. The doPost() (and sheet write) runs on Google's
 * side BEFORE the 302 is sent, so the data lands in the sheet regardless
 * of how we handle the redirect.
 */

const ORIGIN = 'https://www.bac-story.com';

const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status, cache) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': cache || 'no-store',
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const GAS_URL = env.APPS_SCRIPT_URL;

  if (!GAS_URL || !GAS_URL.startsWith('https://script.google.com')) {
    return jsonResponse({ ok: false, error: 'Backend not configured' }, 503);
  }

  // ── GET: fetch live ratings + approved comments ──────────────────────────
  if (method === 'GET') {
    try {
      const r = await fetch(GAS_URL, { method: 'GET', redirect: 'follow' });
      const text = await r.text();
      return new Response(text, {
        status: 200,
        headers: {
          ...CORS,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    } catch (e) {
      return jsonResponse({ ok: false, error: 'GET proxy error: ' + e.message }, 502);
    }
  }

  // ── POST: submit feedback ────────────────────────────────────────────────
  if (method === 'POST') {
    // Read and validate body
    let bodyText;
    try {
      bodyText = await request.text();
    } catch (e) {
      return jsonResponse({ ok: false, error: 'Could not read request body' }, 400);
    }

    if (!bodyText || bodyText.length > 4096) {
      return jsonResponse({ ok: false, error: 'Payload too large or empty' }, 413);
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON payload' }, 400);
    }

    // Basic star validation before hitting Apps Script
    const stars = parseInt(payload.stars, 10);
    if (!(stars >= 1 && stars <= 5)) {
      return jsonResponse({ ok: false, error: 'Invalid stars value' }, 400);
    }

    // Forward to Apps Script
    // redirect:'follow' lets Cloudflare follow the 302 that Apps Script
    // always returns after executing doPost(). The write to the sheet
    // happens on Google's side before the redirect is sent.
    let gasResponse;
    try {
      gasResponse = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
        headers: {
          // Omit Content-Type intentionally: Apps Script reads e.postData.contents
          // regardless, and omitting avoids any edge-case preflight on Google's end.
        },
      });
    } catch (e) {
      return jsonResponse({ ok: false, error: 'Could not reach backend: ' + e.message }, 502);
    }

    // Parse Apps Script response
    let responseText;
    try {
      responseText = await gasResponse.text();
    } catch (e) {
      // If we can't read the response but reached this far, the POST likely
      // went through (Apps Script writes BEFORE redirecting). Return ok.
      return jsonResponse({ ok: true });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      // Non-JSON response — unexpected but treat as success if HTTP was ok
      if (gasResponse.ok || gasResponse.status === 200) {
        return jsonResponse({ ok: true });
      }
      return jsonResponse({
        ok: false,
        error: 'Unexpected backend response: ' + responseText.slice(0, 120),
      }, 502);
    }

    // Apps Script doPost() returns { ok: true } or { ok: false, error: "..." }
    if (result.ok === true) {
      return jsonResponse({ ok: true });
    }

    // If Apps Script returned a doGet()-style response (avg/count/comments),
    // the redirect chain resolved to doGet instead of doPost.
    // This should not happen with redirect:'follow' but guard for it.
    if ('avg' in result || 'count' in result) {
      return jsonResponse({
        ok: false,
        error: 'doGet response received instead of doPost — check Apps Script deployment',
      }, 502);
    }

    // Apps Script returned { ok: false, error: "..." }
    return jsonResponse({ ok: false, error: result.error || 'Apps Script error' }, 200);
  }

  return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
}
