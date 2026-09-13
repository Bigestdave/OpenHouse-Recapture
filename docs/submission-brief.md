# OpenHouse Recapture — System brief

## The problem

Small and mid-sized real-estate teams want to present homes with the polish of
large brokerages, but premium immersive property experiences depend on complete,
well-captured source media. When a walkthrough is missing a room, is too dark,
skips a required angle, or fails to show an important transition, the whole
experience may be held back. Fixing that one gap means chasing a photographer,
negotiating a time, creating folders, and following up across several tools.

## The agent

OpenHouse Recapture converts one bounded media gap into an accountable field
mission. Examples include: **“The primary bedroom is too dark to use,”**
**“the garden terrace was never captured,”** or **“there is no continuous
living-room-to-pool route.”**

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
small team collect the complete, quality source media needed to build an
immersive property experience and prepare it for the publishing channels they
use, including Zillow, Airbnb, and MLS workflows. It does not claim to generate
or upload a universal 3D-tour file to those platforms.
