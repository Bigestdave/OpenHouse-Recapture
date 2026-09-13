# OpenHouse Recapture connector contract

`openhouse-recapture` persists a mission and audit event before dispatching any
connector. The connector mode is selected only through server-side secrets:

- `demo` (default): creates clearly labelled simulated receipts for UI rehearsal.
- `google_apps_script`: posts Calendar, Drive, and Gmail operations to a team-owned
  Google Apps Script Web App. Set `RECAPTURE_GOOGLE_BRIDGE_URL` and
  `RECAPTURE_GOOGLE_BRIDGE_SECRET`.
- `live`: enables direct Telegram Bot delivery when `TELEGRAM_BOT_TOKEN` and
  `TELEGRAM_CHAT_ID` are also set. Google operations still use the Google bridge.

The bridge receives a JSON body of `{ action, payload }` and returns
`{ ref: string, data?: object }`. It must reject calls whose
`X-OpenHouse-Recapture-Secret` header does not match its own stored secret.

The Edge Function never stores connector credentials in browser code, never
retries a duplicate mission, and never marks footage resolved until verification
is explicitly recorded.
