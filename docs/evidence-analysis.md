# OpenHouse evidence analysis

OpenHouse does not ask Gemini whether a property should pass. Gemini is restricted to describing one uploaded asset at a time, while OpenHouse makes all workflow decisions using stored, versioned rules.

## Fixed contract

For each eligible image, short video, or PDF, Gemini must return JSON matching `asset-observation/1.0.0`:

- `evidence`: `usable`, `unusable`, or `uncertain`
- `observed_space_ids`: only IDs supplied in that exact request
- `reasons`: short evidence notes

The function validates every field again. Unknown room IDs, invalid states, malformed JSON, and provider failures cannot become positive property evidence.

## Deterministic decision rules

Rules version `evidence-rules/1.0.0` applies the same mechanics to every run:

1. A space is accepted only when at least one asset returned `usable` and named that exact advertised space ID.
2. Coverage is `accepted advertised spaces / advertised spaces`; it is a calculated coverage measure, not model confidence.
3. Missing evidence creates a targeted capture request only when the inspected assets were conclusive.
4. Any skipped, uncertain, or failed asset places the property in `needs_human_review`. A provider outage never becomes a recapture request or a positive verification.
5. A newly uploaded capture is only `uploaded_pending_verification`. It is not verified until another analysis run accepts it.

Every run stores the rules version, model, input hash, decision payload, and asset observations in `analysis_runs` and `evidence_observations`. That makes a result explainable and repeatable against the same media and model version.

## Execution model

Submitting analysis creates a durable `workflow_jobs` row immediately, then uses Supabase Edge Function background tasks to perform the inspection after the browser receives its response. Jobs move from `queued` to `running`, then `completed` or `failed`; the property remains in `checking_media` until the stored deterministic decision is written. Re-running analysis is safe because capture requests are de-duplicated by open room.

## Current operating limits

The Edge Function analyzes at most 12 assets per run and uses inline media only up to 12 MiB (to keep the base64 request safely below Gemini's inline request limit). Larger videos are deliberately marked for human review instead of being guessed at. The next scaling step is a durable video worker using the Gemini Files API, with retries and polling; it should not be hidden inside a short-lived request.

## Gemini setup

Store `GEMINI_API_KEY` only in Supabase **Edge Function Secrets**. Optionally set `GEMINI_MODEL`; otherwise OpenHouse uses `gemini-3.7-flash`. Do not put either value in `.env.local` or frontend code.
