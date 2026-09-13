/*
 * OpenHouse Recapture Google bridge
 *
 * Deploy this file as a Google Apps Script Web App owned by the real-estate
 * team. It is deliberately small: it provides the Google actions, while
 * OpenHouse remains the source of truth for the mission and audit log.
 *
 * Script properties required before deployment:
 * - OPENHOUSE_RECAPTURE_SECRET: long random shared secret
 * - RECAPTURE_REALTOR_EMAIL: destination for the Gmail summary
 */

function doPost(event) {
  try {
    var request = JSON.parse(event.postData.contents || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('OPENHOUSE_RECAPTURE_SECRET');
    if (!expected || request.secret !== expected) return reply({ error: 'Unauthorized' });
    var payload = request.payload || {};
    var result;

    if (request.action === 'calendar_check_and_create') {
      var start = new Date(payload.startAt);
      var end = new Date(start.getTime() + (Number(payload.durationMinutes) || 30) * 60 * 1000);
      var calendar = CalendarApp.getDefaultCalendar();
      if (calendar.getEvents(start, end).length) return reply({ error: 'Requested time is unavailable' });
      var eventRecord = calendar.createEvent(payload.title || 'OpenHouse recapture', start, end, {
        description: 'OpenHouse Recapture mission: ' + (payload.missionId || '')
      });
      result = { ref: eventRecord.getId(), data: { startAt: start.toISOString(), endAt: end.toISOString() } };
    } else if (request.action === 'drive_create_folder') {
      var folder = DriveApp.createFolder(payload.name || ('OpenHouse Recapture ' + payload.missionId));
      result = { ref: folder.getId(), data: { url: folder.getUrl() } };
    } else if (request.action === 'gmail_send') {
      var recipient = PropertiesService.getScriptProperties().getProperty('RECAPTURE_REALTOR_EMAIL');
      if (!recipient) return reply({ error: 'Missing RECAPTURE_REALTOR_EMAIL script property' });
      GmailApp.sendEmail(recipient, payload.subject || 'OpenHouse Recapture update', payload.body || 'A mission was updated.');
      result = { ref: 'gmail:' + (payload.missionId || new Date().getTime()) };
    } else if (request.action === 'drive_list_files') {
      var target = DriveApp.getFolderById(payload.folderId);
      var files = target.getFiles();
      var names = [];
      while (files.hasNext()) names.push(files.next().getName());
      result = { ref: payload.folderId, data: { files: names } };
    } else {
      return reply({ error: 'Unknown action' });
    }
    return reply(result);
  } catch (error) {
    return reply({ error: error && error.message ? error.message : String(error) });
  }
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

