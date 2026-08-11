/**
 * BAC STORY — Student contribution form backend
 * Google Apps Script Web App (standalone deployment)
 *
 * Deploy as:  Execute as → Me  |  Who has access → Anyone
 *
 * IMPORTANT — before first deploy, run testSetup() from the editor to
 * complete the OAuth consent screen (authorises Spreadsheets + Drive).
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

// ── Health check (GET) ────────────────────────────────────────────────────────

/**
 * Simple GET endpoint — open the deployment URL in a browser to verify
 * the script is reachable and authorised.
 */
function doGet() {
  try {
    // Quick auth check — will throw if scopes not yet approved
    PropertiesService.getScriptProperties().getKeys();
    return respond({ success: true, status: 'BAC STORY GAS online', ts: new Date().toISOString() });
  } catch (err) {
    return respond({ success: false, status: 'auth_error', detail: err.message });
  }
}

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
      default:               return respond({ success: false, error: 'Unknown action: ' + data.action });
    }
  } catch (err) {
    Logger.log('doPost fatal: ' + err.stack);
    // Return actual error message so Cloudflare proxy can surface it for diagnosis
    return respond({ success: false, error: 'GAS error: ' + err.message });
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

  let folder;
  try {
    folder = getOrCreateFolder_();
  } catch (err) {
    Logger.log('getOrCreateFolder_ error: ' + err.message);
    return respond({ success: false, error: 'Drive folder error: ' + err.message });
  }

  let token;
  try {
    token = ScriptApp.getOAuthToken();
  } catch (err) {
    Logger.log('getOAuthToken error: ' + err.message);
    return respond({ success: false, error: 'OAuth token error: ' + err.message });
  }

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

  let sheet;
  try {
    sheet = getOrCreateSheet_();
  } catch (err) {
    Logger.log('getOrCreateSheet_ error: ' + err.message);
    return respond({ success: false, error: 'Sheet init error: ' + err.message });
  }

  const lock = LockService.getScriptLock();
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
    return respond({ success: false, error: 'Could not finalise upload record: ' + err.message });
  }
}

function handleSubmitWithLink(data) {
  const link = String(data.fileLink || '').trim().slice(0, 1000);

  if (!/^https?:\/\/.{4,}/i.test(link)) {
    return respond({ success: false, error: 'رابط غير صالح — يجب أن يبدأ بـ https://' });
  }
  if (/^(javascript|data|vbscript|file):/i.test(link)) {
    return respond({ success: false, error: 'نوع الرابط غير مسموح به' });
  }

  let sheet;
  try {
    sheet = getOrCreateSheet_();
  } catch (err) {
    Logger.log('getOrCreateSheet_ error in submitWithLink: ' + err.message);
    return respond({ success: false, error: 'Sheet init error: ' + err.message });
  }

  const lock = LockService.getScriptLock();
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

// ── Manual setup / auth trigger ───────────────────────────────────────────────

/**
 * Run this function ONCE from the Apps Script editor to:
 *   1. Complete the OAuth consent screen (authorises Spreadsheets + Drive)
 *   2. Pre-create the folder + sheet so the first web-app call is instant
 *
 * After running it you should see no errors in the Execution log.
 */
function testSetup() {
  Logger.log('=== testSetup starting ===');
  try {
    const folder = getOrCreateFolder_();
    Logger.log('Folder OK: ' + folder.getName() + ' (' + folder.getId() + ')');
  } catch (err) {
    Logger.log('Folder ERROR: ' + err.message);
    throw err;
  }
  try {
    const sheet = getOrCreateSheet_();
    Logger.log('Sheet OK: ' + sheet.getParent().getName());
  } catch (err) {
    Logger.log('Sheet ERROR: ' + err.message);
    throw err;
  }
  Logger.log('=== testSetup complete — all services authorised ===');
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
 * Returns the Drive folder for uploads, caching its ID in script properties.
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
 */
function getOrCreateSheet_() {
  const savedId = PROPS.getProperty('SHEET_ID');
  let ss = null;
  if (savedId) {
    try { ss = SpreadsheetApp.openById(savedId); } catch (_) { ss = null; }
  }

  if (!ss) {
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

  const byName = ss.getSheetByName(SHEET_NAME);
  return byName || ss.getSheets()[0];
}
