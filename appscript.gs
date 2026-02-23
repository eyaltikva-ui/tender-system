// ===== עיריית רמת גן – מערכת אישורי מכרז =====

const BASE_URL = "https://eyaltikva-ui.github.io/tender-system";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    switch(data.action) {
      case 'sendApprovalEmail':  sendApprovalEmail(data);  break;
      case 'sendCompletedEmail': sendCompletedEmail(data); break;
      case 'sendRejectedEmail':  sendRejectedEmail(data);  break;
      case 'sendReturnedEmail':  sendReturnedEmail(data);  break;
    }
    return buildResponse({ success: true });
  } catch(err) {
    return buildResponse({ error: err.message });
  }
}

// נדרש לטיפול ב-CORS preflight
function doOptions(e) {
  return buildResponse({ status: 'ok' });
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return buildResponse({ status: 'active', system: 'rg-tender-approvals' });
}

function sendApprovalEmail(data) {
  const approveLink = BASE_URL + '/approve.html?formId=' + data.formId + '&idx=' + data.signerIndex;
  const subject = '[עיריית רמת גן] בקשת אישור טופס מכרז – ' + data.deptName;
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:#1a4b8c;padding:20px;border-radius:8px 8px 0 0">' +
    '<h2 style="color:white;margin:0">עיריית רמת גן – אגף הכספים</h2>' +
    '<p style="color:rgba(255,255,255,0.8);margin:5px 0 0">מערכת אישורי מכרז</p></div>' +
    '<div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>שלום <strong>' + data.signerRole + '</strong>,</p>' +
    '<p>טופס יציאה להליך מכרזי מחכה לאישורך:</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0">' +
    '<tr style="background:#e8f0fb"><td style="padding:8px 12px;font-weight:600;width:40%">אגף מגיש</td><td style="padding:8px 12px">' + data.deptName + '</td></tr>' +
    '<tr><td style="padding:8px 12px;font-weight:600">שם מגיש</td><td style="padding:8px 12px">' + data.submitterName + '</td></tr></table>' +
    '<div style="text-align:center;margin:24px 0">' +
    '<a href="' + approveLink + '" style="background:#1a4b8c;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">לצפייה ואישור הטופס ←</a></div>' +
    '<p style="color:#666;font-size:13px">לחץ על הקישור, עיין בטופס, הזן שמך ות.ז. וחתום.</p>' +
    '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">' +
    '<p style="color:#999;font-size:12px;text-align:center">עיריית רמת גן | אגף הכספים<br>מייל זה נשלח אוטומטית</p>' +
    '</div></div>';
  GmailApp.sendEmail(data.signerEmail, subject, '', { htmlBody: body });
}

function sendCompletedEmail(data) {
  const subject = '[עיריית רמת גן] ✓ טופס מכרז אושר במלואו – ' + data.deptName;
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:#2d7a4f;padding:20px;border-radius:8px 8px 0 0"><h2 style="color:white;margin:0">✓ הטופס אושר במלואו!</h2></div>' +
    '<div style="background:#f0fdf4;padding:24px;border:1px solid #bbf7d0;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>טופס המכרז של <strong>' + data.deptName + '</strong> (מגיש: ' + data.submitterName + ') אושר על ידי כל הגורמים.</p>' +
    '<p style="color:#666;font-size:13px">מספר טופס: ' + data.formId + '</p></div></div>';
  (data.allSignerEmails || []).forEach(function(email) {
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
  });
}

function sendRejectedEmail(data) {
  const subject = '[עיריית רמת גן] ✗ טופס מכרז נדחה – ' + data.deptName;
  const noteHtml = data.note ? '<div style="background:white;border-right:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0"><strong>סיבת הדחייה:</strong><br>' + data.note + '</div>' : '';
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:#dc2626;padding:20px;border-radius:8px 8px 0 0"><h2 style="color:white;margin:0">✗ הטופס נדחה</h2></div>' +
    '<div style="background:#fef2f2;padding:24px;border:1px solid #fecaca;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>טופס המכרז שהגשת נדחה על ידי <strong>' + data.prevSignerRole + '</strong>.</p>' + noteHtml + '</div></div>';
  GmailApp.sendEmail(data.signerEmail, subject, '', { htmlBody: body });
}

function sendReturnedEmail(data) {
  const formLink = BASE_URL + '/form.html?edit=' + data.formId;
  const subject = '[עיריית רמת גן] ↩ טופס מכרז הוחזר לתיקון – ' + data.deptName;
  const noteHtml = data.note ? '<div style="background:white;border-right:4px solid #d97706;padding:12px 16px;border-radius:4px;margin:16px 0"><strong>הערת ' + data.prevSignerRole + ':</strong><br>' + data.note + '</div>' : '';
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:#d97706;padding:20px;border-radius:8px 8px 0 0"><h2 style="color:white;margin:0">↩ הטופס הוחזר לתיקון</h2></div>' +
    '<div style="background:#fffbeb;padding:24px;border:1px solid #fde68a;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>הטופס שהגשת הוחזר אליך לתיקון על ידי <strong>' + data.prevSignerRole + '</strong>.</p>' + noteHtml +
    '<div style="text-align:center;margin:24px 0"><a href="' + formLink + '" style="background:#d97706;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">לתיקון הטופס ←</a></div>' +
    '</div></div>';
  GmailApp.sendEmail(data.signerEmail, subject, '', { htmlBody: body });
}

function sendOTPEmail(data) {
  const subject = '[עיריית רמת גן] קוד אימות לחתימה – ' + data.deptName;
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">' +
    '<div style="background:#1a4b8c;padding:20px;border-radius:8px 8px 0 0">' +
    '<h2 style="color:white;margin:0">🔐 קוד אימות לחתימה</h2>' +
    '<p style="color:rgba(255,255,255,0.8);margin:5px 0 0">עיריית רמת גן – מערכת אישורי מכרז</p></div>' +
    '<div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>שלום <strong>' + data.signerRole + '</strong>,</p>' +
    '<p>כדי לאמת את חתימתך על טופס מכרז של <strong>' + data.deptName + '</strong>, הזן את הקוד הבא:</p>' +
    '<div style="text-align:center;margin:24px 0">' +
    '<div style="display:inline-block;background:#1a4b8c;color:white;font-size:2.5rem;font-weight:700;letter-spacing:0.5rem;padding:16px 32px;border-radius:12px;direction:ltr">' + data.otp + '</div>' +
    '</div>' +
    '<p style="color:#666;font-size:13px;text-align:center">הקוד בתוקף ל-10 דקות.<br>אם לא ביצעת פעולה זו, התעלם ממייל זה.</p>' +
    '</div></div>';
  GmailApp.sendEmail(data.signerEmail, subject, '', { htmlBody: body });
}

function sendSubmitterConfirmation(data) {
  const subject = '[עיריית רמת גן] ✓ הטופס נשלח – מספר פנייה: ' + data.formId;
  const body = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:#1a4b8c;padding:20px;border-radius:8px 8px 0 0">' +
    '<h2 style="color:white;margin:0">✓ הטופס שלך נשלח בהצלחה</h2>' +
    '<p style="color:rgba(255,255,255,0.8);margin:5px 0 0">עיריית רמת גן – מערכת אישורי מכרז</p></div>' +
    '<div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">' +
    '<p>שלום <strong>' + data.submitterName + '</strong>,</p>' +
    '<p>טופס המכרז שלך התקבל ונמצא בתהליך אישור.</p>' +
    '<div style="background:#e8f0fb;border-radius:10px;padding:16px 20px;margin:20px 0;text-align:center">' +
    '<div style="font-size:0.85rem;color:#5a6478;margin-bottom:6px">מספר פנייה לשמירה</div>' +
    '<div style="font-size:1.4rem;font-weight:700;color:#1a4b8c;letter-spacing:0.05em;direction:ltr">' + data.formId + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.88rem">' +
    '<tr style="background:#f0f4f8"><td style="padding:8px 12px;font-weight:600;width:40%">אגף</td><td style="padding:8px 12px">' + data.deptName + '</td></tr>' +
    '<tr><td style="padding:8px 12px;font-weight:600">סכום משוער</td><td style="padding:8px 12px">₪' + Number(data.totalAmount||0).toLocaleString('he-IL') + '</td></tr>' +
    '<tr style="background:#f0f4f8"><td style="padding:8px 12px;font-weight:600">שלב נוכחי</td><td style="padding:8px 12px">ממתין לאישור ' + data.firstSignerRole + '</td></tr>' +
    '</table>' +
    '<div style="text-align:center;margin:24px 0">' +
    '<a href="' + data.statusLink + '" style="background:#1a4b8c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">🔍 עקוב אחר סטטוס הטופס</a>' +
    '</div>' +
    '<p style="color:#888;font-size:12px;text-align:center">שמור מייל זה – מספר הפנייה נדרש למעקב.</p>' +
    '</div></div>';
  GmailApp.sendEmail(data.submitterEmail, subject, '', { htmlBody: body });
}
