/**
 * Cloudflare Pages Function — /api/upload
 * ==========================================
 * Secure proxy → Google Apps Script backend for resource submissions.
 * APPS_SCRIPT_URL_CONTRIBUTE is stored as a Cloudflare environment secret.
 *
 * Google Apps Script always responds to POST with a 302 redirect.
 * We use redirect: 'follow' so Cloudflare follows the chain and gets 
 * the actual JSON output from our Apps Script.
 */

const ORIGIN = 'https://www.bac-story.com';

const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const GAS_URL = env.APPS_SCRIPT_URL_CONTRIBUTE;

  if (!GAS_URL || !GAS_URL.startsWith('https://script.google.com')) {
    return jsonResponse({ success: false, error: 'Backend API not configured' }, 200);
  }

  if (method === 'POST') {
    let bodyText;
    try {
      bodyText = await request.text();
    } catch (e) {
      return jsonResponse({ success: false, error: 'Could not read request body' }, 400);
    }

    if (!bodyText || bodyText.length > 8192) {
      return jsonResponse({ success: false, error: 'Payload too large or empty' }, 413);
    }

    try {
      // Forward request to Apps Script Web App
      // redirect: 'follow' is essential because GAS returns a 302 redirect code.
      const gasResponse = await fetch(GAS_URL, {
        method: 'POST',
        body: bodyText,
        redirect: 'follow',
        headers: {
          // Omit Content-Type intentionally to prevent preflight errors
          // on Google's end; Apps Script reads e.postData.contents directly.
        }
      });

      const responseText = await gasResponse.text();
      
      // Parse the response back to the front-end client
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        if (gasResponse.ok || gasResponse.status === 200) {
          return jsonResponse({ success: true });
        }
        return jsonResponse({
          success: false,
          error: 'Unexpected response from upload database'
        }, 200);
      }

      return jsonResponse(result, 200);

    } catch (err) {
      return jsonResponse({ success: false, error: 'Could not reach backend' }, 200);
    }
  }

  return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
}
