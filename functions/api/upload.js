/**
 * Cloudflare Pages Function — /api/upload
 * ==========================================
 * POST  → GAS proxy  (initiateUpload / completeUpload / submitWithLink)
 * PUT   → Drive proxy (resumable chunk upload / range query)
 *
 * The browser cannot PUT directly to googleapis.com from bac-story.com
 * because the server-created Drive resumable session URL does not carry
 * CORS headers for cross-origin browser access.  Routing every PUT
 * through this function eliminates the CORS problem entirely.
 */

const ORIGIN = 'https://www.bac-story.com';

const CORS = {
  'Access-Control-Allow-Origin':  ORIGIN,
  'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Content-Range, X-Drive-Session-Url',
  'Access-Control-Expose-Headers': 'Range',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // ── PUT: proxy a resumable-upload chunk (or range query) to Google Drive ──
  if (method === 'PUT') {
    const sessionUrl = (request.headers.get('X-Drive-Session-Url') || '').trim();

    if (!sessionUrl.startsWith('https://www.googleapis.com/upload/drive/')) {
      return jsonResponse({ success: false, error: 'Invalid or missing Drive session URL' });
    }

    const driveHeaders = {};
    const contentRange = request.headers.get('Content-Range');
    if (contentRange) driveHeaders['Content-Range'] = contentRange;

    try {
      const driveResp = await fetch(sessionUrl, {
        method: 'PUT',
        headers: driveHeaders,
        body: request.body,
        // duplex needed in some runtimes when piping a streaming body
        duplex: 'half',
      });

      // Forward headers the client actually needs
      const respHeaders = { ...CORS, 'Cache-Control': 'no-store' };
      const range = driveResp.headers.get('Range');
      if (range) respHeaders['Range'] = range;

      // Pass Drive's status + body straight through
      // 308 → chunk accepted (empty body, Range header carries offset)
      // 200/201 → upload complete (body is JSON with .id)
      return new Response(driveResp.body, {
        status: driveResp.status,
        headers: respHeaders,
      });
    } catch (err) {
      return jsonResponse({ success: false, error: 'Drive proxy error: ' + err.message });
    }
  }

  // ── POST: forward to Google Apps Script backend ───────────────────────────
  const GAS_URL = env.APPS_SCRIPT_URL_CONTRIBUTE;

  if (!GAS_URL || !GAS_URL.startsWith('https://script.google.com')) {
    return jsonResponse({ success: false, error: 'Backend API not configured' });
  }

  if (method === 'POST') {
    let bodyText;
    try {
      bodyText = await request.text();
    } catch (e) {
      return jsonResponse({ success: false, error: 'Could not read request body' });
    }

    if (!bodyText || bodyText.length > 8192) {
      return jsonResponse({ success: false, error: 'Payload too large or empty' });
    }

    try {
      const gasResponse = await fetch(GAS_URL, {
        method: 'POST',
        body: bodyText,
        redirect: 'follow',
      });

      const responseText = await gasResponse.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        if (gasResponse.ok || gasResponse.status === 200) {
          return jsonResponse({ success: true });
        }
        return jsonResponse({ success: false, error: 'Unexpected response from upload database' });
      }

      return jsonResponse(result);
    } catch (err) {
      return jsonResponse({ success: false, error: 'Could not reach backend' });
    }
  }

  return jsonResponse({ success: false, error: 'Method not allowed' });
}
