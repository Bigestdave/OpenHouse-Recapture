# OpenHouse Recapture — Hackathon build plan

## The product in one sentence

**For small real-estate teams whose listing is blocked by one missing piece of
property proof, OpenHouse Recapture turns the gap into an exact, accountable
recapture mission across the tools their team already uses.**

## The human story

A realtor has photographed a beautiful property. Buyers can see the living
room and the pool, but there is no continuous proof showing how they connect.
That small missing link prevents the listing from meeting the team’s quality
bar before publishing to the marketplaces where buyers already search.

Instead of the realtor coordinating calls, folders, and reminders manually,
OpenHouse Recapture creates one field mission with one shared record.

## What the agent does

1. Receives a **bounded evidence gap** from OpenHouse’s media review—such as
   `living room → pool terrace` has no continuous path.
2. Uses Gemini only for the human-facing, concise capture instruction. It may
   never invent rooms or declare a property ready by itself.
3. Applies deterministic policy:
   - Is this a blocking gap?
   - Has this exact mission already been sent?
   - Is a future time present?
   - Does a realtor need to approve before dispatch?
4. After approval, coordinates the real work:
   - Google Calendar: check/create the capture appointment.
   - Google Drive: create the evidence folder.
   - Telegram: send the photographer exact instructions.
   - Gmail: send the accountable realtor a summary.
5. Records external receipts and all state changes in one durable Supabase
   mission record.
6. When new footage arrives, moves it to verification. An upload is not a
   resolution; the agent either marks the bounded requirement resolved or
   clearly records the remaining gap.

## Why this is an agent, not a notification chain

The model is not trusted to decide critical workflow outcomes. The system
combines model language generation with durable state and explicit constraints:

- Idempotency key: a repeat click cannot create another photographer task.
- Approval gate: no one is booked without the realtor’s policy allowing it.
- Fail-closed connectors: calendar or credential failures never become a fake
  `scheduled` mission.
- Audit trail: every external action is linked to the same mission.
- Honest resolution: footage received and evidence verified are different
  statuses.

## The one demo to build and record

1. Show **Missing proof: Living room → pool terrace** on a property.
2. Open Recapture Agent and create the focused mission.
3. Show the generated instruction and approval gate.
4. Approve it. Show Calendar, Drive, Telegram, and Gmail receipts in the
   trace—and open real artifacts if credentials are configured.
5. Submit the same mission again. Show the duplicate-protection event and no
   second external side effect.
6. Show a deliberately insufficient upload becoming **Needs follow-up**, not
   “resolved.” End on credibility, not a fake perfect result.

## Build order

### Complete in the project

- [x] Separate `OpenHouse-Recapture` copy; original project stays unchanged.
- [x] Durable `recapture_missions` and `recapture_events` database schema.
- [x] Mission idempotency, approval state, connector receipts, and audit trace.
- [x] Server-side agent function and Recapture workspace UI.
- [x] Google Apps Script bridge source for Calendar, Drive, and Gmail.
- [x] Telegram connector contract and a demo-safe connector mode.
- [x] Evaluation set and two-minute demo outline.

### Need credentials / deployment to demonstrate real actions

- [ ] Create a separate Supabase project for Recapture and apply the migration.
- [ ] Deploy `openhouse-recapture`.
- [ ] Deploy the Google Apps Script bridge under a disposable Google account.
- [ ] Add its URL and secret to Supabase Edge Function secrets.
- [ ] Create a Telegram bot and add its server-side credentials.
- [ ] Run the golden cases and write down only real result counts.

### Optional stretch goal only after the core is working

- [ ] Use Arga service twins to test Google Calendar, Drive, and Gmail with
  repeatable stateful traces. Never claim Arga use unless actually run.
- [ ] Add a Lemma pod/workflow adapter. It is not a dependency for the core
  submission and should not delay actual multi-app actions.

## Reliability test set

| Cases | Expected outcome |
| --- | --- |
| 4 valid, available missions | One scheduled mission with all expected receipts |
| 3 duplicate replays | Original mission returned; zero duplicate connector actions |
| 3 conflict / no-slot cases | Escalation or failure; zero calendar event |
| 2 insufficient uploads | `needs_follow_up`, never a false resolution |

## Rules for claims in the submission

- Say **“tested with live Calendar/Drive/Gmail/Telegram”** only after opening
  those external records from this project.
- Say **“evaluated through Arga”** only after the exact cases have run there.
- Say **“Gemini generates the capture instruction”** if that secret is set and
  the result is visible. Otherwise say the policy template is in use.
- Do not claim OpenHouse outputs Zillow/Airbnb 3D files. It is the upstream
  evidence and operations layer that helps teams get ready to publish.
