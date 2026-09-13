-- Relational workflow records for the OpenHouse production MVP.
-- This supplements the original JSONB columns while the legacy UI is migrated.

create table if not exists public.property_spaces (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  captured boolean not null default false,
  verified boolean not null default false,
  confidence real not null default 0 check (confidence between 0 and 1),
  issue text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, name)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  capture_request_id text references public.capture_requests(id) on delete set null,
  kind text not null check (kind in ('image', 'video', 'floor_plan')),
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  room_name text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_jobs (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  kind text not null check (kind in ('analysis', 'verification', 'experience_build')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  job_id uuid references public.workflow_jobs(id) on delete set null,
  status text not null check (status in ('needs_capture', 'ready_for_review', 'failed')),
  confidence real not null check (confidence between 0 and 1),
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.experience_versions (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  version integer not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'superseded')),
  public_token uuid unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (property_id, version)
);

alter table public.capture_requests add column if not exists capture_token uuid unique;
alter table public.capture_requests add column if not exists from_room text;
alter table public.capture_requests add column if not exists to_room text;
alter table public.capture_requests add column if not exists attempt_count integer not null default 0;
alter table public.capture_requests add column if not exists expires_at timestamptz;

create index if not exists property_spaces_property_id_idx on public.property_spaces(property_id);
create index if not exists media_assets_property_id_idx on public.media_assets(property_id);
create index if not exists workflow_jobs_property_id_idx on public.workflow_jobs(property_id, created_at desc);
create index if not exists analysis_runs_property_id_idx on public.analysis_runs(property_id, created_at desc);
create index if not exists experience_versions_public_token_idx on public.experience_versions(public_token);
create index if not exists capture_requests_token_idx on public.capture_requests(capture_token);

alter table public.property_spaces enable row level security;
alter table public.media_assets enable row level security;
alter table public.workflow_jobs enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.experience_versions enable row level security;

drop policy if exists "members can read property spaces" on public.property_spaces;
drop policy if exists "members can manage property spaces" on public.property_spaces;
drop policy if exists "members can read media assets" on public.media_assets;
drop policy if exists "members can manage media assets" on public.media_assets;
drop policy if exists "members can read workflow jobs" on public.workflow_jobs;
drop policy if exists "members can read analysis runs" on public.analysis_runs;
drop policy if exists "members can read experience versions" on public.experience_versions;

create policy "members can read property spaces" on public.property_spaces for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));
create policy "members can manage property spaces" on public.property_spaces for all to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)))
with check (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));

create policy "members can read media assets" on public.media_assets for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));
create policy "members can manage media assets" on public.media_assets for all to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)))
with check (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));

create policy "members can read workflow jobs" on public.workflow_jobs for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));
create policy "members can read analysis runs" on public.analysis_runs for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));
create policy "members can read experience versions" on public.experience_versions for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));

