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

alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists sex text not null default 'prefer_not_to_say',
  add column if not exists nationalities jsonb not null default '[]'::jsonb,
  add column if not exists country_nationality text not null default '',
  add column if not exists current_location text not null default '',
  add column if not exists arrival_status text not null default 'planning';

do $$
begin
  alter table public.profiles
    add constraint profiles_sex_check
    check (sex in ('male', 'female', 'prefer_not_to_say'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_arrival_status_check
    check (arrival_status in ('planning', 'arrived', 'long_term_resident'));
exception
  when duplicate_object then null;
end $$;

alter table public.profiles enable row level security;
alter table public.saved_guides enable row level security;

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    avatar_url,
    date_of_birth,
    sex,
    nationalities,
    country_nationality,
    current_location,
    arrival_status
  )
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
    ),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    case
      when new.raw_user_meta_data ->> 'sex' in ('male', 'female', 'prefer_not_to_say')
        then new.raw_user_meta_data ->> 'sex'
      else 'prefer_not_to_say'
    end,
    case
      when jsonb_typeof(new.raw_user_meta_data -> 'nationalities') = 'array'
        then new.raw_user_meta_data -> 'nationalities'
      when nullif(new.raw_user_meta_data ->> 'country_nationality', '') is not null
        then jsonb_build_array(new.raw_user_meta_data ->> 'country_nationality')
      else '[]'::jsonb
    end,
    coalesce(nullif(new.raw_user_meta_data ->> 'country_nationality', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'current_location', ''), ''),
    case
      when new.raw_user_meta_data ->> 'arrival_status' in ('planning', 'arrived', 'long_term_resident')
        then new.raw_user_meta_data ->> 'arrival_status'
      else 'planning'
    end
  )
  on conflict (id) do update
  set
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    date_of_birth = excluded.date_of_birth,
    sex = excluded.sex,
    nationalities = excluded.nationalities,
    country_nationality = excluded.country_nationality,
    current_location = excluded.current_location,
    arrival_status = excluded.arrival_status;

  return new;
end;
$$;

drop trigger if exists create_profile_after_auth_user_insert on auth.users;
create trigger create_profile_after_auth_user_insert
after insert on auth.users
for each row
execute function public.create_profile_for_new_auth_user();

insert into public.profiles (
  id,
  name,
  avatar_url,
  date_of_birth,
  sex,
  nationalities,
  country_nationality,
  current_location,
  arrival_status
)
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
  ) as avatar_url,
  nullif(users.raw_user_meta_data ->> 'date_of_birth', '')::date as date_of_birth,
  case
    when users.raw_user_meta_data ->> 'sex' in ('male', 'female', 'prefer_not_to_say')
      then users.raw_user_meta_data ->> 'sex'
    else 'prefer_not_to_say'
  end as sex,
  case
    when jsonb_typeof(users.raw_user_meta_data -> 'nationalities') = 'array'
      then users.raw_user_meta_data -> 'nationalities'
    when nullif(users.raw_user_meta_data ->> 'country_nationality', '') is not null
      then jsonb_build_array(users.raw_user_meta_data ->> 'country_nationality')
    else '[]'::jsonb
  end as nationalities,
  coalesce(nullif(users.raw_user_meta_data ->> 'country_nationality', ''), '') as country_nationality,
  coalesce(nullif(users.raw_user_meta_data ->> 'current_location', ''), '') as current_location,
  case
    when users.raw_user_meta_data ->> 'arrival_status' in ('planning', 'arrived', 'long_term_resident')
      then users.raw_user_meta_data ->> 'arrival_status'
    else 'planning'
  end as arrival_status
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

update public.profiles
set nationalities = case
  when jsonb_typeof(auth_users.raw_user_meta_data -> 'nationalities') = 'array'
    then auth_users.raw_user_meta_data -> 'nationalities'
  when jsonb_typeof(profiles.nationalities) = 'array' and jsonb_array_length(profiles.nationalities) > 0
    then profiles.nationalities
  when nullif(auth_users.raw_user_meta_data ->> 'country_nationality', '') is not null
    then jsonb_build_array(auth_users.raw_user_meta_data ->> 'country_nationality')
  when nullif(profiles.country_nationality, '') is not null
    then jsonb_build_array(profiles.country_nationality)
  else '[]'::jsonb
end
from auth.users as auth_users
where profiles.id = auth_users.id;

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
