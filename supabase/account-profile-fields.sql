-- Adds account profile fields used during registration and Settings.
-- Run this in Supabase SQL Editor after pulling this update.

alter table public.profiles
  add column if not exists country_nationality text not null default '',
  add column if not exists current_location text not null default '',
  add column if not exists arrival_status text not null default 'planning';

do $$
begin
  alter table public.profiles
    add constraint profiles_arrival_status_check
    check (arrival_status in ('planning', 'arrived', 'long_term_resident'));
exception
  when duplicate_object then null;
end $$;

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
    country_nationality = excluded.country_nationality,
    current_location = excluded.current_location,
    arrival_status = excluded.arrival_status;

  return new;
end;
$$;

update public.profiles
set
  country_nationality = coalesce(nullif(auth_users.raw_user_meta_data ->> 'country_nationality', ''), profiles.country_nationality, ''),
  current_location = coalesce(nullif(auth_users.raw_user_meta_data ->> 'current_location', ''), profiles.current_location, ''),
  arrival_status = case
    when auth_users.raw_user_meta_data ->> 'arrival_status' in ('planning', 'arrived', 'long_term_resident')
      then auth_users.raw_user_meta_data ->> 'arrival_status'
    when profiles.arrival_status in ('planning', 'arrived', 'long_term_resident')
      then profiles.arrival_status
    else 'planning'
  end
from auth.users as auth_users
where profiles.id = auth_users.id;
