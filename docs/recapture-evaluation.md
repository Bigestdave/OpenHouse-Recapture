# Reliability and evaluation

OpenHouse Recapture treats external actions as a consequence of durable state,
not as optimistic UI effects. This document distinguishes the tests that run
inside the repository from live connector validation.

## Automated policy contract

Run:

```bash
npm run evaluate:recapture
```

The current offline contract set contains ten deterministic cases:

| Area | Cases | Expected safety property |
| --- | ---: | --- |
| Valid dispatch | 1 | A mission with a future time and required approval satisfied can proceed. |
| Approval control | 1 | A photographer is never dispatched before the realtor's approval gate. |
| Duplicate prevention | 3 | Replaying the same bounded gap makes zero additional external calls. |
| Scheduling / connector failures | 3 | Missing time, past time, or missing connector credentials produces no external call. |
| Honest verification | 2 | New footage is not automatically treated as resolved. |

This test reports **10/10 policy-contract cases passing** when run locally. It
does not claim live provider delivery.

## Live connector checklist

Before claiming a live integration in a final demo, run one mission with
`RECAPTURE_CONNECTOR_MODE=live` and retain the corresponding evidence:

1. Google Calendar event URL or event identifier.
2. Google Drive folder URL or folder identifier.
3. Telegram message identifier.
4. Gmail thread identifier.
5. The matching `recapture_events` audit records in Supabase.

If any connector is unavailable, the mission must remain failed or awaiting
human action. The app must never show a simulated receipt as a live receipt.

## What is evaluated in the demo

The two-minute demo should visibly replay one duplicate request and one
insufficient-upload outcome. Those two moments show the system does more than
send messages: it prevents duplicate field work and refuses false completion.
