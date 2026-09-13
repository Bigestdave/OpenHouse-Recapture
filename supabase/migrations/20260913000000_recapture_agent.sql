-- OpenHouse Recapture: durable, auditable missions for a media evidence gap.
--
-- A mission is deliberately separate from a generic capture request. A capture
-- request says what footage is needed; a recapture mission records the agent's
-- decision, external actions, and eventual resolution. This gives every
-- connector one shared source of truth and makes duplicate prevention possible.

alter table public.workflow_jobs
  drop constraint if exists workflow_jobs_kind_check;

alter table public.workflow_jobs
  add constraint workflow_jobs_kind_check
  check (kind in ('analysis', 'verification', 'experience_build', 'recapture'));

create table if not exists public.recapture_missions (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  capture_request_id text references public.capture_requests(id) on delete set null,
  -- The stable identity of the evidence problem. It is generated from the
  -- property and normalized gap, rather than a model's prose.
  idempotency_key text not null unique,
  gap_fingerprint text not null,
  gap_type text not null check (gap_type in (
    'missing_connection', 'missing_room', 'low_light', 'poor_coverage', 'blurred_media'
  )),
  from_space text,
  to_space text,
  severity text not null check (severity in ('blocking', 'advisory')),
  reason text not null,
  capture_instruction text not null,
  status text not null default 'detected' check (status in (
    'detected', 'planning', 'awaiting_realtor_approval', 'scheduled',
    'capture_uploaded', 'verifying', 'resolved', 'needs_follow_up', 'failed', 'cancelled'
  )),
  -- Model output is retained as evidence, but deterministic policy decisions
  -- remain in first-class columns above.
  agent_decision jsonb not null default '{}'::jsonb,
  calendar_event_ref text,
  drive_folder_ref text,
  telegram_message_ref text,
  gmail_thread_ref text,
  scheduled_for timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recapture_events (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.recapture_missions(id) on delete cascade,
  action text not null check (action in (
    'gap_detected', 'mission_deduplicated', 'policy_checked', 'instruction_generated',
    'awaiting_realtor_approval', 'calendar_checked', 'calendar_event_created',
    'drive_folder_created', 'telegram_sent', 'gmail_sent', 'capture_received',
    'verification_completed', 'mission_resolved', 'mission_escalated', 'mission_failed'
  )),
  actor text not null check (actor in ('agent', 'realtor', 'photographer', 'system')),
  external_app text check (external_app in ('google_calendar', 'google_drive', 'telegram', 'gmail', 'arga', 'lemma')),
  external_ref text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists recapture_missions_property_idx
  on public.recapture_missions(property_id, created_at desc);
create index if not exists recapture_missions_status_idx
  on public.recapture_missions(status, created_at desc);
create index if not exists recapture_events_mission_idx
  on public.recapture_events(mission_id, created_at asc);

create or replace function public.touch_recapture_mission_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_recapture_mission_updated_at on public.recapture_missions;
create trigger touch_recapture_mission_updated_at
before update on public.recapture_missions
for each row execute function public.touch_recapture_mission_updated_at();

alter table public.recapture_missions enable row level security;
alter table public.recapture_events enable row level security;

drop policy if exists "members can read recapture missions" on public.recapture_missions;
drop policy if exists "members can read recapture events" on public.recapture_events;

create policy "members can read recapture missions"
on public.recapture_missions for select to authenticated
using (
  exists (
    select 1 from public.properties p
    where p.id = property_id and public.is_workspace_member(p.workspace_id)
  )
);

create policy "members can read recapture events"
on public.recapture_events for select to authenticated
using (
  exists (
    select 1
    from public.recapture_missions m
    join public.properties p on p.id = m.property_id
    where m.id = mission_id and public.is_workspace_member(p.workspace_id)
  )
);

