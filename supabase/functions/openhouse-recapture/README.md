# OpenHouse Recapture connector contract

`openhouse-recapture` persists a mission and audit event before dispatching any
connector. The connector mode is selected only through server-side secrets:

- `demo` (default): creates clearly labelled simulated receipts for UI rehearsal.
- `live`: posts Calendar, Drive, and Gmail operations to a team-owned Google
  Apps Script Web App and enables direct Telegram Bot delivery. Set
  `RECAPTURE_GOOGLE_BRIDGE_URL`, `RECAPTURE_GOOGLE_BRIDGE_SECRET`,
  `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID`.

The bridge receives a JSON body of `{ secret, action, payload }` and returns
`{ ref: string, data?: object }`. It must reject calls whose `secret` value
does not match its own stored secret.

The Edge Function never stores connector credentials in browser code, never
retries a duplicate mission, and never marks footage resolved until verification
is explicitly recorded.
