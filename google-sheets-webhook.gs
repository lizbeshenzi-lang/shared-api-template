/**
 * GOOGLE SHEETS SETUP
 * =====================
 * 1. Open a new Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire file, replacing what's there
 * 4. Save (Ctrl+S)
 * 5. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL
 * 7. Add it to Vercel as: GOOGLE_SHEETS_WEBHOOK_URL=<paste URL here>
 *
 * The sheet will auto-create a header row on first submission.
 */

const SHEET_NAME = 'Submissions';
const COLUMNS = ['Timestamp','Site','Name','Email','Phone','Service','Date','Time','Occasion','Message','Status','ID'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    const row = [
      data.timestamp || new Date().toISOString(),
      data.siteName || '',
      data.name || '',
      data.email || '',
      data.phone || '',
      data.service || '',
      data.date || '',
      data.time || '',
      data.occasion || '',
      data.message || '',
      data.status || 'new',
      data.id || ''
    ];
    sheet.appendRow(row);
    autoResizeColumns(sheet);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    // Style header
    const header = sheet.getRange(1, 1, 1, COLUMNS.length);
    header.setFontWeight('bold');
    header.setBackground('#0d1f1f');
    header.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function autoResizeColumns(sheet) {
  sheet.autoResizeColumns(1, COLUMNS.length);
}

// Test function — run manually to verify setup
function testWebhook() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        id: 'sub_test_001',
        siteName: 'Halisi Clinic',
        name: 'Test User',
        email: 'test@test.com',
        phone: '+254700000000',
        service: 'General Consultation',
        date: '2026-03-25',
        time: '10:00',
        occasion: '',
        message: 'This is a test submission',
        timestamp: new Date().toISOString(),
        status: 'new'
      })
    }
  };
  doPost(fakeEvent);
  Logger.log('Test complete — check your sheet');
}
