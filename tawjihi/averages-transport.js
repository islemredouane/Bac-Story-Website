/* ============================================================
   TAWJIHI — Averages transport (import side, shared)
   Browser global script (plain <script src>, no modules/imports).

   Decodes + validates the "import code" produced by the BAC Story
   weighted-average calculator (components/calculator.js → twExport*).

   ── IMPORT-CODE FORMAT ──────────────────────────────────────
   The code is  base64url( UTF-8( JSON ) )  of this payload:

     {
       "schemaVersion": 1,
       "source": "bacstory",
       "issuedAt": "<ISO 8601 UTC>",
       "generalAverage": 15.42,          // /20, required-ish (see below)
       "stream": "sciexp",               // canonical stream code OR Arabic label
       "bacYear": 2025,                  // optional
       "weightedAverages": {             // optional map, keys mirror wcConfig types
         "math": 14.9, "math-physics": 15.1, "math-tech": 0,
         "bio": 15.8, "lang": 13.0, "translation": 0, "arts": 0
       }
     }

   weightedAverages keys (the SAME ids used by BAC Story wcConfig):
     math | math-physics | math-tech | bio | lang | translation | arts

   Validation: schemaVersion must be 1; every average present must be a
   finite number in [0, 20]; at least one of generalAverage / a weighted
   average must exist. Garbage is rejected (advisory tool → no signing).

   Exposes:
     window.twAvg.STREAM_CODES          - canonical stream codes
     window.twAvg.WEIGHTED_KEYS         - allowed weightedAverages keys
     window.twAvg.normalizeStream(s)    - Arabic label / code → canonical code | ''
     window.twAvg.decode(code)          - { ok, payload } | { ok:false, error }
     window.twAvg.mergeIntoProfile(profile, payload) - mutates+returns profile
   ============================================================ */
(function (root) {
  "use strict";

  var STREAM_CODES = ['sciexp', 'math', 'techmath', 'gestion', 'lettres', 'langues', 'arts'];
  var WEIGHTED_KEYS = ['math', 'math-physics', 'math-tech', 'bio', 'lang', 'translation', 'arts'];

  // Arabic label / legacy value → canonical stream code.
  // Covers onboarding option text, BAC Story calculator field names, and
  // the canonical codes themselves (idempotent).
  var STREAM_MAP = {
    // canonical (identity)
    'sciexp': 'sciexp', 'math': 'math', 'techmath': 'techmath',
    'gestion': 'gestion', 'lettres': 'lettres', 'langues': 'langues', 'arts': 'arts',
    // Arabic labels (onboarding / streams.json)
    'علوم تجريبية': 'sciexp',
    'رياضيات': 'math',
    'تقني رياضي': 'techmath',
    'تسيير واقتصاد': 'gestion',
    'تسيير وإقتصاد': 'gestion',
    'آداب وفلسفة': 'lettres',
    'لغات أجنبية': 'langues',
    'فنون': 'arts',
    // BAC Story calculator internal field codes
    'science': 'sciexp',
    'tech': 'techmath',
    'management': 'gestion',
    'literature': 'lettres',
    'languages': 'langues'
  };

  function normalizeStream(s) {
    if (!s) return '';
    var key = String(s).trim();
    return STREAM_MAP[key] || '';
  }

  function isAvg(n) {
    return typeof n === 'number' && isFinite(n) && n >= 0 && n <= 20;
  }

  // base64url → UTF-8 string
  function b64urlDecode(str) {
    var s = String(str).trim().replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    // decode UTF-8 bytes
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
    return decodeURIComponent(escape(bin)); // fallback
  }

  function decode(code) {
    if (!code || !String(code).trim()) {
      return { ok: false, error: 'الرمز فارغ.' };
    }
    var json;
    try {
      json = b64urlDecode(code);
    } catch (e) {
      return { ok: false, error: 'الرمز غير صالح أو منقوص — تأكّد من نسخه كاملاً.' };
    }
    var p;
    try {
      p = JSON.parse(json);
    } catch (e) {
      return { ok: false, error: 'تعذّر قراءة الرمز — يبدو تالفاً.' };
    }
    if (!p || typeof p !== 'object') {
      return { ok: false, error: 'محتوى الرمز غير صالح.' };
    }
    if (p.schemaVersion !== 1) {
      return { ok: false, error: 'إصدار الرمز غير مدعوم. حدّث حاسبة BAC Story وأعد المحاولة.' };
    }

    // Validate generalAverage if present
    var hasGeneral = p.generalAverage !== undefined && p.generalAverage !== null;
    if (hasGeneral && !isAvg(Number(p.generalAverage))) {
      return { ok: false, error: 'المعدل العام في الرمز غير منطقي (يجب أن يكون بين 0 و 20).' };
    }

    // Validate + clean weightedAverages
    var cleanWeighted = {};
    var hasWeighted = false;
    if (p.weightedAverages && typeof p.weightedAverages === 'object') {
      for (var i = 0; i < WEIGHTED_KEYS.length; i++) {
        var k = WEIGHTED_KEYS[i];
        if (p.weightedAverages[k] === undefined || p.weightedAverages[k] === null) continue;
        var val = Number(p.weightedAverages[k]);
        if (!isAvg(val)) {
          return { ok: false, error: 'أحد المعدلات الموزونة في الرمز غير منطقي (يجب أن يكون بين 0 و 20).' };
        }
        cleanWeighted[k] = val;
        hasWeighted = true;
      }
    }

    if (!hasGeneral && !hasWeighted) {
      return { ok: false, error: 'الرمز لا يحتوي على أي معدل صالح.' };
    }

    var bacYear;
    if (p.bacYear !== undefined && p.bacYear !== null) {
      var y = parseInt(p.bacYear, 10);
      if (!isNaN(y) && y >= 2000 && y <= 2100) bacYear = y;
    }

    var warnings = [];
    if (bacYear && bacYear < 2025) {
      warnings.push('المعدلات من دفعة ' + bacYear + ' — عتبات القبول الحالية لسنة 2025، قد تكون المقارنة غير دقيقة.');
    }

    return {
      ok: true,
      warnings: warnings,
      payload: {
        schemaVersion: 1,
        source: p.source || 'bacstory',
        issuedAt: typeof p.issuedAt === 'string' ? p.issuedAt : '',
        generalAverage: hasGeneral ? Number(p.generalAverage) : undefined,
        stream: normalizeStream(p.stream),
        bacYear: bacYear,
        weightedAverages: cleanWeighted
      }
    };
  }

  // Merge a validated payload into a tw-profile object (mutates + returns it).
  function mergeIntoProfile(profile, payload) {
    profile = profile || {};
    if (payload.generalAverage !== undefined) {
      profile.average = Number(payload.generalAverage.toFixed ? payload.generalAverage.toFixed(2) : payload.generalAverage);
    }
    if (payload.weightedAverages && Object.keys(payload.weightedAverages).length) {
      profile.weightedAverages = payload.weightedAverages;
    }
    if (payload.stream) profile.stream = payload.stream; // canonical code
    if (payload.bacYear) profile.bacYear = payload.bacYear;
    profile.averagesSource = 'bacstory-import';
    return profile;
  }

  root.twAvg = {
    STREAM_CODES: STREAM_CODES,
    WEIGHTED_KEYS: WEIGHTED_KEYS,
    normalizeStream: normalizeStream,
    decode: decode,
    mergeIntoProfile: mergeIntoProfile
  };
})(typeof window !== 'undefined' ? window : this);
