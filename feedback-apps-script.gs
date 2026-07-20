/**
 * BAC STORY — Feedback backend (Google Apps Script)
 * ==================================================
 * DEPLOY STEPS (5 minutes, one time):
 * 1. Go to https://sheets.google.com and create a new Sheet named "BAC STORY Feedback".
 * 2. In the Sheet: Extensions → Apps Script.
 * 3. Delete any code there and paste this whole file, then Save.
 * 4. Click "Deploy" → "New deployment" → gear icon → "Web app":
 *      - Description: bac story feedback
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Click Deploy, authorize with your account, and COPY the web app URL
 *    (it looks like https://script.google.com/macros/s/XXXXX/exec).
 * 5. Paste that URL in feedback.html in place of PASTE_APPS_SCRIPT_URL_HERE.
 *
 * MODERATION:
 * Every submission lands as a row with the "approved" column = FALSE.
 * Open the Sheet (works from your phone), read the comment, and type TRUE
 * (or insert a checkbox via Insert → Checkbox and tick it) to publish it.
 * It appears on the site within ~5 minutes (server cache) once approved.
 * Stars count in the live average immediately, before any approval.
 */

var SHEET_NAME = 'Feedback';
var CACHE_SECONDS = 300; // serve cached JSON for 5 min to handle heavy traffic
var MAX_COMMENTS = 100;  // newest approved comments returned to the site

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['timestamp', 'name', 'track', 'stars', 'opinion', 'advice', 'approved']);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ── WRITE: called by the site form ── */
function doPost(e) {
  var out = { ok: false };
  try {
    var data = JSON.parse(e.postData.contents);
    var stars = parseInt(data.stars, 10);
    if (!(stars >= 1 && stars <= 5)) throw new Error('bad stars');

    var clean = function (v, max) {
      return String(v || '').replace(/[\n\r]+/g, ' ').trim().slice(0, max);
    };

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet_().appendRow([
        new Date(),
        clean(data.name, 40),
        clean(data.track, 30),
        stars,
        clean(data.opinion, 600),
        clean(data.advice, 600),
        false
      ]);
    } finally {
      lock.releaseLock();
    }
    out.ok = true;
  } catch (err) {
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── READ: live average + approved comments ── */
function doGet() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('fb_json');
  if (cached) {
    return ContentService.createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sh = getSheet_();
  var last = sh.getLastRow();
  var result = { avg: 0, count: 0, comments: [] };

  if (last > 1) {
    var rows = sh.getRange(2, 1, last - 1, 7).getValues();
    var sum = 0, count = 0, comments = [];

    for (var i = 0; i < rows.length; i++) {
      var stars = Number(rows[i][3]);
      if (stars >= 1 && stars <= 5) { sum += stars; count++; }

      var approved = rows[i][6] === true || String(rows[i][6]).toUpperCase() === 'TRUE';
      if (approved && (rows[i][4] || rows[i][5])) {
        comments.push({
          n: String(rows[i][1] || ''),
          t: String(rows[i][2] || ''),
          s: stars || 0,
          o: String(rows[i][4] || ''),
          a: String(rows[i][5] || '')
        });
      }
    }

    comments.reverse(); // newest first
    result.avg = count ? Math.round((sum / count) * 10) / 10 : 0;
    result.count = count;
    result.comments = comments.slice(0, MAX_COMMENTS);
  }

  var json = JSON.stringify(result);
  cache.put('fb_json', json, CACHE_SECONDS);
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
