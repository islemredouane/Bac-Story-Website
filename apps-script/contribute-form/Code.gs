/**
 * BAC STORY — Student contribution form backend
 * Google Apps Script Web App (standalone deployment)
 *
 * Deploy as:  Execute as → Me  |  Who has access → Anyone
 *
 * Flow (file upload):
 *   1. POST { action:'initiateUpload', ...meta }
 *      → creates Drive resumable session + pending Sheet row
 *      ← returns { success:true, sessionUrl, rowIndex }
 *   2. Browser PUTs chunks directly to Drive sessionUrl (bytes never touch this script)
 *   3. POST { action:'completeUpload', rowIndex, fileId }
 *      → finalises Sheet row with real Drive link
 *
 * Flow (external link):
 *   1. POST { action:'submitWithLink', ...meta, fileLink }
 *      → one-shot Sheet row
 */

const FOLDER_NAME = 'BAC STORY - مساهمات الطلاب';
const SHEET_NAME  = 'مساهمات الطلاب';
const PROPS       = PropertiesService.getScriptProperties();

// Column indices (1-based) for the sheet
const COL = { DATE:1, NAME:2, EMAIL:3, STREAM:4, SUBJECT:5, FILETYPE:6, SOURCE:7, LINK:8 };

// ── Entry point ───────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond({ success: false, error: 'Empty request body' });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (_) {
      return respond({ success: false, error: 'Invalid JSON payload' });
    }

    switch (String(data.action || '')) {
      case 'initiateUpload': return handleInitiateUpload(data);
      case 'completeUpload': return handleCompleteUpload(data);
      case 'submitWithLink': return handleSubmitWithLink(data);
      default:               return respond({ success: false, error: 'Unknown action' });
    }
  } catch (err) {
    Logger.log('doPost fatal: ' + err.stack);
    return respond({ success: false, error: 'Internal server error' });
  }
}

// ── Action handlers ───────────────────────────────────────────────────────────

function handleInitiateUpload(data) {
  const fileName = sanitizeFilename_(data.fileName);
  const fileSize = parseInt(data.fileSize, 10);
  const mimeType = sanitizeMime_(data.mimeType);

  if (!fileName) {
    return respond({ success: false, error: 'Missing or invalid file name' });
  }
  if (!(fileSize > 0 && fileSize <= 1073741824)) {
    return respond({ success: false, error: 'Invalid file size (max 1 GB)' });
  }

  const folder = getOrCreateFolder_();
  const token  = ScriptApp.getOAuthToken();

  let driveResp;
  try {
    driveResp = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',
      {
        method:      'post',
        contentType: 'application/json; charset=UTF-8',
        headers: {
          Authorization:             'Bearer ' + token,
          'X-Upload-Content-Type':   mimeType,
          'X-Upload-Content-Length': String(fileSize)
        },
        payload:            JSON.stringify({ name: fileName, parents: [folder.getId()] }),
        muteHttpExceptions: true
      }
    );
  } catch (err) {
    Logger.log('Drive session fetch error: ' + err.message);
    return respond({ success: false, error: 'Could not reach Drive API' });
  }

  const hdrs      = driveResp.getAllHeaders();
  const sessionUrl = hdrs['Location'] || hdrs['location'] || '';

  if (!sessionUrl) {
    Logger.log('Drive session missing Location. Code: ' + driveResp.getResponseCode() +
               ' Body: ' + driveResp.getContentText().slice(0, 300));
    return respond({
      success: false,
      error: 'Drive did not return a session URL (code ' + driveResp.getResponseCode() + ')'
    });
  }

  // Append pending row inside a lock to prevent concurrent-write collision
  const sheet = getOrCreateSheet_();
  const lock  = LockService.getScriptLock();
  lock.waitLock(10000);
  let rowIndex;
  try {
    sheet.appendRow([
      new Date(),
      safeCell_(data.name,     100),
      safeCell_(data.email,    150),
      safeCell_(data.stream,    50),
      safeCell_(data.subject,  100),
      safeCell_(data.filetype,  50),
      fileName,
      'جارٍ الرفع…'
    ]);
    rowIndex = sheet.getLastRow();
  } finally {
    lock.releaseLock();
  }

  return respond({ success: true, sessionUrl, rowIndex });
}

function handleCompleteUpload(data) {
  const rowIndex = parseInt(data.rowIndex, 10);
  const fileId   = String(data.fileId || '').trim();

  if (!rowIndex || rowIndex < 2) {
    return respond({ success: false, error: 'Invalid rowIndex' });
  }
  // Drive file IDs are alphanumeric + underscore + hyphen, 25–50 chars
  if (!/^[\w-]{25,50}$/.test(fileId)) {
    return respond({ success: false, error: 'Invalid fileId format' });
  }

  try {
    const fileUrl = DriveApp.getFileById(fileId).getUrl();
    const sheet   = getOrCreateSheet_();
    sheet.getRange(rowIndex, COL.LINK).setValue(fileUrl);
    return respond({ success: true });
  } catch (err) {
    Logger.log('completeUpload error: ' + err.message);
    return respond({ success: false, error: 'Could not finalise upload record' });
  }
}

function handleSubmitWithLink(data) {
  const link = String(data.fileLink || '').trim().slice(0, 1000);

  // Only allow http/https
  if (!/^https?:\/\/.{4,}/i.test(link)) {
    return respond({ success: false, error: 'رابط غير صالح — يجب أن يبدأ بـ https://' });
  }
  // Belt-and-suspenders: reject other URI schemes that could sneak through
  if (/^(javascript|data|vbscript|file):/i.test(link)) {
    return respond({ success: false, error: 'نوع الرابط غير مسموح به' });
  }

  const sheet = getOrCreateSheet_();
  const lock  = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow([
      new Date(),
      safeCell_(data.name,     100),
      safeCell_(data.email,    150),
      safeCell_(data.stream,    50),
      safeCell_(data.subject,  100),
      safeCell_(data.filetype,  50),
      'رابط خارجي',
      link
    ]);
  } finally {
    lock.releaseLock();
  }

  return respond({ success: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Prevents formula / CSV injection by prepending a single-quote to any value
 * that opens with a formula-triggering character (=, +, -, @, |, %).
 * Enforces max length and strips control characters.
 */
function safeCell_(value, maxLen) {
  const max = maxLen || 200;
  const s   = String(value || '')
                .replace(/[\r\n\t\x00-\x1F]/g, ' ')
                .trim()
                .slice(0, max);
  // Leading chars that Google Sheets interprets as formula starters
  return /^[=+\-@|%`]/.test(s) ? "'" + s : s;
}

/** Strips everything except word chars, Arabic, and safe filename punctuation. */
function sanitizeFilename_(name) {
  return String(name || '')
    .replace(/[^\w؀-ۿ.\-_ ]/g, '')
    .trim()
    .slice(0, 200);
}

/**
 * Whitelists MIME types accepted by the frontend file validator.
 * Anything not in the list falls back to octet-stream.
 */
function sanitizeMime_(mime) {
  const ALLOWED = new Set([
    'application/pdf',
    'application/zip', 'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav',
    'text/plain'
  ]);
  const m = String(mime || '').toLowerCase().split(';')[0].trim();
  return ALLOWED.has(m) ? m : 'application/octet-stream';
}

/**
 * Returns the Drive folder for uploads, caching its ID in script properties
 * to avoid repeated folder lookups.
 */
function getOrCreateFolder_() {
  const savedId = PROPS.getProperty('FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (_) { /* cache miss */ }
  }
  const iter   = DriveApp.getFoldersByName(FOLDER_NAME);
  const folder = iter.hasNext() ? iter.next() : DriveApp.createFolder(FOLDER_NAME);
  PROPS.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

/**
 * Returns the contributions sheet.
 * Creates the spreadsheet + header row on first run, then caches the ID.
 * Uses the named sheet tab — not index 0 — to survive manual tab reordering.
 */
function getOrCreateSheet_() {
  const savedId = PROPS.getProperty('SHEET_ID');
  let ss = null;
  if (savedId) {
    try { ss = SpreadsheetApp.openById(savedId); } catch (_) { ss = null; }
  }

  if (!ss) {
    // First run: create spreadsheet
    ss = SpreadsheetApp.create(SHEET_NAME);
    PROPS.setProperty('SHEET_ID', ss.getId());

    const sh = ss.getSheets()[0];
    sh.setName(SHEET_NAME);
    sh.appendRow([
      'التاريخ', 'الاسم', 'الإيميل', 'الشعبة',
      'المادة', 'نوع الملف', 'اسم الملف / المصدر', 'رابط الملف'
    ]);
    sh.getRange('1:1')
      .setFontWeight('bold')
      .setBackground('#eef2ff')
      .setFontColor('#1a3a8f');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, 8);
    return sh;
  }

  // Prefer tab by name; guard against tab having been renamed/deleted
  const byName = ss.getSheetByName(SHEET_NAME);
  return byName || ss.getSheets()[0];
}
