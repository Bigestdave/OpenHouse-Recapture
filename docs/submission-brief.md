# OpenHouse Recapture — System brief

## The problem

A listing can look complete in photos yet still fail the buyer's most basic
question: *how do these two spaces connect?* For a small real-estate team,
fixing one missing 20-second proof often means chasing a photographer,
negotiating a time, creating folders, and following up across several tools.
That delay holds back the listing from the marketplaces where buyers already
search.

## The agent

OpenHouse Recapture converts one bounded media-evidence gap into an accountable
field mission. For example: **“There is no continuous proof from the living
room to the pool terrace.”**

The agent turns that into a precise instruction, checks durable mission state,
requires approval when policy demands it, then coordinates the work across:

- **Google Calendar** for the capture appointment;
- **Google Drive** for the evidence destination;
- **Telegram** for the photographer's exact instruction; and
- **Gmail** for the realtor's record and handoff.

Supabase is the shared mission record and audit trail. Gemini may improve the
human-facing instruction, but it never decides whether to schedule, duplicate,
approve, or resolve a mission.

## Reliability choices

- An idempotency fingerprint stops the same property gap from creating a
  second mission or a second photographer dispatch.
- A mission cannot dispatch without a future slot and required realtor
  approval.
- Missing connector credentials fail closed rather than producing a fake
  “scheduled” state.
- Receiving footage is distinct from verifying that it resolves the stated
  gap.
- Every state change and connector receipt is attached to one mission record.

## Product boundary

OpenHouse Recapture is an upstream evidence and operations layer. It helps a
small team prepare quality property media for the publishing channels they use,
including Zillow, Airbnb, and MLS workflows. It does not claim to generate or
upload a universal 3D-tour file to those platforms.
