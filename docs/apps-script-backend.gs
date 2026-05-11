/**
 * mBot Coding Adventure - Google Apps Script Backend
 *
 * Deployment Steps:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. Run setupSheets() once to create the spreadsheet
 * 4. Deploy as Web App:
 *    - Click Deploy > New deployment
 *    - Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy
 * 5. Copy the Web App URL
 * 6. Set NEXT_PUBLIC_SHEETS_URL in your Vercel project settings
 */

const SHEET_ID_KEY = 'MBOT_SHEET_ID';

function getSheetId() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(SHEET_ID_KEY);
}

function getSpreadsheet() {
  const id = getSheetId();
  if (!id) throw new Error('Spreadsheet not initialized. Run setupSheets() first.');
  return SpreadsheetApp.openById(id);
}

/**
 * One-time setup - run this first in the Apps Script editor
 */
function setupSheets() {
  const ss = SpreadsheetApp.create('mBot Coding Adventure Backend');
  const id = ss.getId();
  PropertiesService.getScriptProperties().setProperty(SHEET_ID_KEY, id);

  // GuestSessions sheet
  const guestSheet = ss.getSheetByName('GuestSessions') || ss.insertSheet('GuestSessions');
  guestSheet.clear();
  guestSheet.appendRow(['session_id', 'created_at', 'finished_at', 'total_points']);
  guestSheet.getRange(1, 1, 1, 4).setFontWeight('bold');

  // GuestProgress sheet
  const guestProgressSheet = ss.getSheetByName('GuestProgress') || ss.insertSheet('GuestProgress');
  guestProgressSheet.clear();
  guestProgressSheet.appendRow(['session_id', 'level_id', 'stars', 'blocks_used', 'time_seconds', 'timestamp']);
  guestProgressSheet.getRange(1, 1, 1, 6).setFontWeight('bold');

  // Students sheet
  const studentsSheet = ss.getSheetByName('Students') || ss.insertSheet('Students');
  studentsSheet.clear();
  studentsSheet.appendRow(['student_id', 'name', 'avatar', 'pin', 'created_at']);
  studentsSheet.getRange(1, 1, 1, 5).setFontWeight('bold');

  // StudentProgress sheet
  const studentProgressSheet = ss.getSheetByName('StudentProgress') || ss.insertSheet('StudentProgress');
  studentProgressSheet.clear();
  studentProgressSheet.appendRow(['student_id', 'level_id', 'stars', 'blocks_used', 'time_seconds', 'timestamp']);
  studentProgressSheet.getRange(1, 1, 1, 6).setFontWeight('bold');

  Logger.log('Spreadsheet created: ' + ss.getUrl());
  Logger.log('Sheet ID saved. You can now deploy as Web App.');
  return { sheetUrl: ss.getUrl(), sheetId: id };
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'exportTeacherData') {
    return exportTeacherData();
  }
  return jsonResponse({ success: false, error: 'Unknown action' });
}

function doPost(e) {
  let data;
  try {
    // Handle text/plain body (CORS-safe)
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = JSON.parse(e.parameter.data || '{}');
    }
  } catch (err) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' });
  }

  const action = data.action;
  if (!action) return jsonResponse({ success: false, error: 'Missing action' });

  try {
    switch (action) {
      case 'createGuestSession': return createGuestSession(data);
      case 'saveGuestProgress': return saveGuestProgress(data);
      case 'finishSession': return finishSession(data);
      case 'createStudent': return createStudent(data);
      case 'loginStudent': return loginStudent(data);
      case 'saveStudentProgress': return saveStudentProgress(data);
      case 'getStudentProgress': return getStudentProgress(data);
      default: return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Server error' });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function createGuestSession(data) {
  const sessionId = 'guest_' + Utilities.getUuid();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('GuestSessions');
  sheet.appendRow([sessionId, new Date(), '', 0]);
  return jsonResponse({ success: true, session_id: sessionId });
}

function saveGuestProgress(data) {
  const { session_id, level_id, stars, blocks_used, time_seconds } = data;
  if (!session_id || level_id == null) {
    return jsonResponse({ success: false, error: 'Missing required fields' });
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('GuestProgress');
  sheet.appendRow([session_id, level_id, stars, blocks_used, time_seconds, new Date()]);
  return jsonResponse({ success: true });
}

function finishSession(data) {
  const { session_id, total_points } = data;
  if (!session_id) return jsonResponse({ success: false, error: 'Missing session_id' });

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('GuestSessions');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === session_id) {
      sheet.getRange(i + 1, 4).setValue(total_points || 0);
      sheet.getRange(i + 1, 3).setValue(new Date());
      break;
    }
  }
  return jsonResponse({ success: true });
}

function createStudent(data) {
  const { name, avatar } = data;
  if (!name) return jsonResponse({ success: false, error: 'Missing name' });

  const ss = getSpreadsheet();
  const studentsSheet = ss.getSheetByName('Students');
  const rows = studentsSheet.getDataRange().getValues();

  // Check for duplicate name
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === name) {
      return jsonResponse({ success: false, error: 'Name already taken' });
    }
  }

  const studentId = 'stu_' + Utilities.getUuid();
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  studentsSheet.appendRow([studentId, name, avatar || 'robot-1', pin, new Date()]);

  return jsonResponse({ success: true, student_id: studentId, pin });
}

function loginStudent(data) {
  const { name, pin } = data;
  if (!name || !pin) return jsonResponse({ success: false, error: 'Missing name or pin' });

  const ss = getSpreadsheet();
  const studentsSheet = ss.getSheetByName('Students');
  const rows = studentsSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === name && String(rows[i][3]) === String(pin)) {
      return jsonResponse({ success: true, student_id: rows[i][0], name: rows[i][1], avatar: rows[i][2] });
    }
  }
  return jsonResponse({ success: false, error: 'Invalid PIN' });
}

function saveStudentProgress(data) {
  const { student_id, level_id, stars, blocks_used, time_seconds } = data;
  if (!student_id || level_id == null) {
    return jsonResponse({ success: false, error: 'Missing required fields' });
  }

  const ss = getSpreadsheet();
  const progressSheet = ss.getSheetByName('StudentProgress');
  progressSheet.appendRow([student_id, level_id, stars, blocks_used, time_seconds, new Date()]);
  return jsonResponse({ success: true });
}

function getStudentProgress(data) {
  const { student_id } = data;
  if (!student_id) return jsonResponse({ success: false, error: 'Missing student_id' });

  const ss = getSpreadsheet();
  const progressSheet = ss.getSheetByName('StudentProgress');
  const rows = progressSheet.getDataRange().getValues();
  const progress = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === student_id) {
      progress.push({
        level_id: rows[i][1],
        stars: rows[i][2],
        blocks_used: rows[i][3],
        time_seconds: rows[i][4],
        timestamp: rows[i][5],
      });
    }
  }
  return jsonResponse({ success: true, progress });
}

function exportTeacherData() {
  try {
    const ss = getSpreadsheet();
    const data = {
      students: [],
      studentProgress: [],
      guestSessions: [],
      guestProgress: [],
    };

    const studentsSheet = ss.getSheetByName('Students');
    const studentRows = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < studentRows.length; i++) {
      data.students.push({
        student_id: studentRows[i][0],
        name: studentRows[i][1],
        avatar: studentRows[i][2],
        created_at: studentRows[i][4],
      });
    }

    const progressSheet = ss.getSheetByName('StudentProgress');
    const progressRows = progressSheet.getDataRange().getValues();
    for (let i = 1; i < progressRows.length; i++) {
      data.studentProgress.push({
        student_id: progressRows[i][0],
        level_id: progressRows[i][1],
        stars: progressRows[i][2],
        blocks_used: progressRows[i][3],
        time_seconds: progressRows[i][4],
        timestamp: progressRows[i][5],
      });
    }

    const guestSheet = ss.getSheetByName('GuestSessions');
    const guestRows = guestSheet.getDataRange().getValues();
    for (let i = 1; i < guestRows.length; i++) {
      data.guestSessions.push({
        session_id: guestRows[i][0],
        created_at: guestRows[i][1],
        finished_at: guestRows[i][2],
        total_points: guestRows[i][3],
      });
    }

    const guestProgressSheet = ss.getSheetByName('GuestProgress');
    const gpRows = guestProgressSheet.getDataRange().getValues();
    for (let i = 1; i < gpRows.length; i++) {
      data.guestProgress.push({
        session_id: gpRows[i][0],
        level_id: gpRows[i][1],
        stars: gpRows[i][2],
        blocks_used: gpRows[i][3],
        time_seconds: gpRows[i][4],
        timestamp: gpRows[i][5],
      });
    }

    return jsonResponse({ success: true, data });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}
