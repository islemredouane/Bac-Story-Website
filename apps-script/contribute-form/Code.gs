/**
 * BAC STORY — Student contribution form backend (doPost API edition).
 *
 * Flow:
 *  1. Browser POSTs { action:'initiateUpload', ...metadata } → /api/upload (Cloudflare)
 *     → Cloudflare proxies to this script's doPost()
 *     → We create a Drive resumable session and log a pending row to the Sheet
 *     → We return { success:true, sessionUrl, rowIndex }
 *  2. Browser PUTs file bytes in chunks directly to Drive's sessionUrl
 *     (bytes never pass through Apps Script or Cloudflare)
 *  3. Browser POSTs { action:'completeUpload', rowIndex, fileId }
 *     → We update the Sheet row with the real Drive file URL
 *     → We return { success:true }
 */

const FOLDER_NAME = 'BAC STORY - مساهمات الطلاب';
const SHEET_NAME  = 'مساهمات الطلاب - BAC STORY';

// ── Entry point ───────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'initiateUpload') {
      return handleInitiateUpload(data);
    }
    if (data.action === 'completeUpload') {
      return handleCompleteUpload(data);
    }

    return respond({ success: false, error: 'Unknown action: ' + data.action });
  } catch (err) {
    return respond({ success: false, error: 'doPost error: ' + err.message });
  }
}

// ── Action handlers ───────────────────────────────────────────────────────────

function handleInitiateUpload(data) {
  const folder = getOrCreateFolder_();
  const token  = ScriptApp.getOAuthToken();

  const metadata = {
    name:    sanitize_(data.fileName || 'upload'),
    parents: [folder.getId()]
  };

  const resp = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',
    {
      method:      'post',
      contentType: 'application/json; charset=UTF-8',
      headers: {
        Authorization:            'Bearer ' + token,
        'X-Upload-Content-Type':  data.mimeType   || 'application/octet-stream',
        'X-Upload-Content-Length': String(data.fileSize || 0)
      },
      payload:            JSON.stringify(metadata),
      muteHttpExceptions: true
    }
  );

  const headers    = resp.getAllHeaders();
  const sessionUrl = headers['Location'] || headers['location'];

  if (!sessionUrl) {
    return respond({
      success: false,
      error: 'Drive session error (' + resp.getResponseCode() + '): ' +
             resp.getContentText().slice(0, 200)
    });
  }

  // Log a pending row — completeUpload will fill in the real file link
  const sheet = getOrCreateSheet_();
  sheet.appendRow([
    new Date(),
    data.name     || '',
    data.email    || '',
    data.stream   || '',
    data.subject  || '',
    data.filetype || '',
    data.fileName || '',
    'pending…'
  ]);

  const rowIndex = sheet.getLastRow();
  return respond({ success: true, sessionUrl: sessionUrl, rowIndex: rowIndex });
}

function handleCompleteUpload(data) {
  const rowIndex = parseInt(data.rowIndex, 10);
  const fileId   = data.fileId || '';

  if (!rowIndex || !fileId) {
    return respond({ success: false, error: 'Missing rowIndex or fileId' });
  }

  try {
    const fileUrl = DriveApp.getFileById(fileId).getUrl();
    const sheet   = getOrCreateSheet_();
    sheet.getRange(rowIndex, 8).setValue(fileUrl); // column 8 = رابط الملف
    return respond({ success: true });
  } catch (err) {
    return respond({ success: false, error: 'Could not update file link: ' + err.message });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitize_(name) {
  return String(name).replace(/[^\w؀-ۿ.\-_ ]/g, '').slice(0, 200) || 'upload';
}

function getOrCreateFolder_() {
  const props   = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (_) {}
  }
  const existing = DriveApp.getFoldersByName(FOLDER_NAME);
  const folder   = existing.hasNext() ? existing.next() : DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

function getOrCreateSheet_() {
  const props   = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SHEET_ID');
  let ss        = null;
  if (savedId) {
    try { ss = SpreadsheetApp.openById(savedId); } catch (_) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
    const sh = ss.getSheets()[0];
    sh.appendRow(['التاريخ', 'الاسم', 'الإيميل', 'الشعبة', 'المادة', 'نوع الملف', 'اسم الملف', 'رابط الملف']);
    sh.setFrozenRows(1);
  }
  return ss.getSheets()[0];
}
