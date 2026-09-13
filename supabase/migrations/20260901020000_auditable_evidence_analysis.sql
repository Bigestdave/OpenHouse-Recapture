-- Auditable, rules-based media analysis. Gemini supplies constrained observations;
-- OpenHouse makes every workflow decision from the stored observations below.

alter table public.media_assets
  add column if not exists storage_bucket text not null default 'property-media'
    check (storage_bucket in ('property-media', 'captures')),
  add column if not exists analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'accepted', 'rejected', 'uncertain', 'skipped', 'failed')),
  add column if not exists analyzed_at timestamptz;

alter table public.analysis_runs
  add column if not exists rules_version text,
  add column if not exists model text,
  add column if not exists input_hash text,
  add column if not exists decision jsonb not null default '{}'::jsonb;

alter table public.analysis_runs drop constraint if exists analysis_runs_status_check;
alter table public.analysis_runs add constraint analysis_runs_status_check
  check (status in ('needs_capture', 'ready_for_review', 'needs_human_review', 'failed'));

create table if not exists public.evidence_observations (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  provider text not null default 'gemini',
  model text not null,
  schema_version text not null,
  prompt_version text not null,
  input_hash text not null,
  status text not null check (status in ('accepted', 'rejected', 'uncertain', 'skipped', 'failed')),
  observation jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists evidence_observations_property_id_idx
  on public.evidence_observations(property_id, created_at desc);
create index if not exists evidence_observations_media_asset_id_idx
  on public.evidence_observations(media_asset_id, created_at desc);

alter table public.evidence_observations enable row level security;
drop policy if exists "members can read evidence observations" on public.evidence_observations;
create policy "members can read evidence observations" on public.evidence_observations for select to authenticated
using (exists (
  select 1 from public.properties p
  where p.id = property_id and public.is_workspace_member(p.workspace_id)
));

