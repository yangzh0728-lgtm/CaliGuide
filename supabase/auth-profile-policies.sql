-- Run this in Supabase SQL Editor when registration fails with:
-- "permission denied for table profiles".
--
-- The browser client signs users up with the public Supabase key. The trigger
-- below creates the matching profile from auth metadata, which avoids fragile
-- client-side profile inserts while email confirmation/session state is still
-- being established. The RLS policies allow users to manage only their own
-- account data after sign-in.

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, delete on table public.saved_guides to authenticated;

alter table public.profiles enable row level security;
alter table public.saved_guides enable row level security;

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'CaliGuide Member'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Crect width=%2296%22 height=%2296%22 rx=%2224%22 fill=%22%230b3f75%22/%3E%3Ccircle cx=%2248%22 cy=%2238%22 r=%2215%22 fill=%22%23fff%22/%3E%3Cpath d=%22M24 80c4-18 16-28 24-28s20 10 24 28%22 fill=%22%23fff%22/%3E%3C/svg%3E'
    )
  )
  on conflict (id) do update
  set
    name = excluded.name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists create_profile_after_auth_user_insert on auth.users;
create trigger create_profile_after_auth_user_insert
after insert on auth.users
for each row
execute function public.create_profile_for_new_auth_user();

insert into public.profiles (id, name, avatar_url)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(users.email, '@', 1), ''),
    'CaliGuide Member'
  ) as name,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Crect width=%2296%22 height=%2296%22 rx=%2224%22 fill=%22%230b3f75%22/%3E%3Ccircle cx=%2248%22 cy=%2238%22 r=%2215%22 fill=%22%23fff%22/%3E%3Cpath d=%22M24 80c4-18 16-28 24-28s20 10 24 28%22 fill=%22%23fff%22/%3E%3C/svg%3E'
  ) as avatar_url
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

drop policy if exists "Users read their own profile" on public.profiles;
create policy "Users read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users create their own profile" on public.profiles;
create policy "Users create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users read their own saved guides" on public.saved_guides;
create policy "Users read their own saved guides"
on public.saved_guides
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users save their own guides" on public.saved_guides;
create policy "Users save their own guides"
on public.saved_guides
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users remove their own saved guides" on public.saved_guides;
create policy "Users remove their own saved guides"
on public.saved_guides
for delete
to authenticated
using (auth.uid() = user_id);
