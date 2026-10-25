/**
 * Paste into the spreadsheet: Extensions → Apps Script.
 * Set Script properties: TOKEN = a long random string (same as GOOGLE_SHEETS_TOKEN).
 * Deploy → New deployment → Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the web app URL into GOOGLE_SHEETS_WEBHOOK (Cloudflare Pages secret or api/.env).
 *
 * Columns on Лист1:
 *   A Telegram ID → "заявка с сайта"
 *   B Name
 *   C UserName (empty)
 *   D Phone
 *   E Language
 *   F Дата регистрации
 *   G Дата подачи заявки
 *   H Услуга
 *   I Тип (консультация / скидка 10%)
 */
function doPost(e) {
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput('{"ok":false}').setMimeType(ContentService.MimeType.JSON);
  }
  if (!token || data.token !== token) {
    return ContentService.createTextOutput('{"ok":false}').setMimeType(ContentService.MimeType.JSON);
  }
  const row = Array.isArray(data.row) ? data.row : [];
  if (row.length < 7) {
    return ContentService.createTextOutput('{"ok":false}').setMimeType(ContentService.MimeType.JSON);
  }
  SpreadsheetApp.getActive().getSheetByName('Лист1').appendRow(row);
  return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
}
