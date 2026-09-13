# Google Calendar, Drive, and Gmail bridge

This is the real integration adapter for OpenHouse Recapture. It is optional
for local work, but it is the smallest safe way to exercise three Google apps
under one team-owned Google account.

1. Create a Google Apps Script project at [script.google.com](https://script.google.com), paste in `Code.gs`, and set the two script properties named in its header.
2. Deploy it as a **Web app**, executing as the team account. Restrict access to the intended account/team.
3. In the Supabase project that hosts this copy, set `RECAPTURE_CONNECTOR_MODE=google_apps_script`, `RECAPTURE_GOOGLE_BRIDGE_URL`, and `RECAPTURE_GOOGLE_BRIDGE_SECRET`.
4. Start one approved mission in OpenHouse Recapture. It will check/create a Calendar event, create a Drive folder, and send a Gmail summary. The Recapture trace will retain the returned receipts.

The Google bridge has no browser credentials and does not receive the Supabase
service key. Do not put its shared secret in Vite variables, a committed `.env`,
or the client application.
