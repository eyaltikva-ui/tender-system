// ===== עיריית רמת גן – מערכת אישורי מכרז =====
// הדבק קוד זה ב-Google Apps Script ופרסם כ-Web App

const BASE_URL = "https://eyaltikva-ui.github.io/tender-system"; // לדוגמה: https://eyaltikva-ui.github.io/tender-system

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch(data.action) {
      case 'sendApprovalEmail':
        sendApprovalEmail(data);
        break;
      case 'sendCompletedEmail':
        sendCompletedEmail(data);
        break;
      case 'sendRejectedEmail':
        sendRejectedEmail(data);
        break;
      case 'sendReturnedEmail':
        sendReturnedEmail(data);
        break;
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: 'active' })).setMimeType(ContentService.MimeType.JSON);
}
