-- Durable progress and retry metadata for the evidence-analysis worker.
-- A retry is explicit and auditable: previous attempts are never overwritten.

alter table public.workflow_jobs
  add column if not exists attempt_count integer not null default 0 check (attempt_count >= 0),
  add column if not exists max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  add column if not exists next_attempt_at timestamptz,
  add column if not exists progress_phase text not null default 'queued'
    check (progress_phase in ('queued', 'loading_evidence', 'inspecting_media', 'applying_rules', 'creating_capture_requests', 'complete', 'failed')),
  add column if not exists progress_message text;

create index if not exists workflow_jobs_retry_idx
  on public.workflow_jobs(status, next_attempt_at)
  where status = 'failed';

