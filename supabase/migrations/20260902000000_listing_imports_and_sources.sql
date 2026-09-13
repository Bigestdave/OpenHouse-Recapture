-- Listing imports are review-first. They are never properties until a member
-- explicitly opens the Add Property form and creates one.

create table if not exists public.listing_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null check (kind in ('mls_reso', 'crm', 'other')),
  status text not null default 'draft' check (status in ('draft', 'configured', 'active', 'error', 'disabled')),
  endpoint text,
  credential_secret_ref text,
  configuration jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.imported_listings (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  listing_source_id uuid references public.listing_sources(id) on delete set null,
  import_kind text not null check (import_kind in ('csv', 'url', 'connected_source')),
  source_url text,
  source_reference text,
  fingerprint text not null check (char_length(fingerprint) between 16 and 128),
  status text not null default 'new' check (status in ('new', 'in_review', 'incomplete', 'added', 'ignored', 'failed')),
  title text,
  address text,
  property_type text,
  bedrooms numeric,
  bathrooms numeric,
  price text,
  description text,
  media_urls jsonb not null default '[]'::jsonb,
  spaces jsonb not null default '[]'::jsonb,
  raw_data jsonb not null default '{}'::jsonb,
  error_message text,
  added_property_id text references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, fingerprint)
);

create index if not exists listing_sources_workspace_id_idx on public.listing_sources(workspace_id, updated_at desc);
create index if not exists imported_listings_workspace_id_idx on public.imported_listings(workspace_id, updated_at desc);
create index if not exists imported_listings_status_idx on public.imported_listings(workspace_id, status, updated_at desc);

alter table public.listing_sources enable row level security;
alter table public.imported_listings enable row level security;

create policy "members can read listing sources" on public.listing_sources for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "members can manage listing sources" on public.listing_sources for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members can read imported listings" on public.imported_listings for select to authenticated
using (public.is_workspace_member(workspace_id));
create policy "members can manage imported listings" on public.imported_listings for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
