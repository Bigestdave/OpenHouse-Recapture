-- OpenHouse production security baseline.
-- Run after schema.sql. Existing demo seed rows intentionally remain invisible
-- to authenticated production users until they are assigned a workspace owner.

alter table public.workspaces add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.workspace_members (
  workspace_id text not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

create or replace function public.add_workspace_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

drop trigger if exists workspace_owner_membership on public.workspaces;
create trigger workspace_owner_membership
after insert on public.workspaces
for each row when (new.owner_user_id is not null)
execute function public.add_workspace_owner_membership();

create or replace function public.is_workspace_member(target_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(text) from public;
grant execute on function public.is_workspace_member(text) to authenticated;

drop policy if exists "Allow public read on workspaces" on public.workspaces;
drop policy if exists "Allow public insert/update on workspaces" on public.workspaces;
drop policy if exists "Allow public read on properties" on public.properties;
drop policy if exists "Allow public insert/update on properties" on public.properties;
drop policy if exists "Allow public read on capture_requests" on public.capture_requests;
drop policy if exists "Allow public insert/update on capture_requests" on public.capture_requests;
drop policy if exists "Allow public read on bookings" on public.bookings;
drop policy if exists "Allow public insert/update on bookings" on public.bookings;
drop policy if exists "workspace members can read workspaces" on public.workspaces;
drop policy if exists "authenticated users can create their own workspace" on public.workspaces;
drop policy if exists "workspace owners can update their workspace" on public.workspaces;
drop policy if exists "members can view their memberships" on public.workspace_members;
drop policy if exists "workspace owners can manage memberships" on public.workspace_members;
drop policy if exists "members can read properties" on public.properties;
drop policy if exists "members can create properties" on public.properties;
drop policy if exists "members can update properties" on public.properties;
drop policy if exists "members can delete properties" on public.properties;
drop policy if exists "members can manage capture requests" on public.capture_requests;
drop policy if exists "members can view bookings" on public.bookings;

create policy "workspace members can read workspaces"
on public.workspaces for select to authenticated
using (owner_user_id = auth.uid() or public.is_workspace_member(id));

create policy "authenticated users can create their own workspace"
on public.workspaces for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "workspace owners can update their workspace"
on public.workspaces for update to authenticated
using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create policy "members can view their memberships"
on public.workspace_members for select to authenticated using (user_id = auth.uid());

create policy "workspace owners can manage memberships"
on public.workspace_members for all to authenticated
using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_user_id = auth.uid()))
with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_user_id = auth.uid()));

create policy "members can read properties"
on public.properties for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can create properties"
on public.properties for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update properties"
on public.properties for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can delete properties"
on public.properties for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members can manage capture requests"
on public.capture_requests for all to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)))
with check (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));

create policy "members can view bookings"
on public.bookings for select to authenticated
using (exists (select 1 from public.properties p where p.id = property_id and public.is_workspace_member(p.workspace_id)));

insert into storage.buckets (id, name, public) values
  ('captures', 'captures', false),
  ('property-media', 'property-media', false)
on conflict (id) do update set public = false;

drop policy if exists "members can manage property media" on storage.objects;
drop policy if exists "members can manage captures" on storage.objects;

create policy "members can manage property media"
on storage.objects for all to authenticated
using (
  bucket_id = 'property-media' and exists (
    select 1 from public.properties p
    where p.id = (storage.foldername(name))[1] and public.is_workspace_member(p.workspace_id)
  )
)
with check (
  bucket_id = 'property-media' and exists (
    select 1 from public.properties p
    where p.id = (storage.foldername(name))[1] and public.is_workspace_member(p.workspace_id)
  )
);

create policy "members can manage captures"
on storage.objects for all to authenticated
using (
  bucket_id = 'captures' and exists (
    select 1 from public.capture_requests c
    join public.properties p on p.id = c.property_id
    where c.id = (storage.foldername(name))[1] and public.is_workspace_member(p.workspace_id)
  )
)
with check (
  bucket_id = 'captures' and exists (
    select 1 from public.capture_requests c
    join public.properties p on p.id = c.property_id
    where c.id = (storage.foldername(name))[1] and public.is_workspace_member(p.workspace_id)
  )
);
