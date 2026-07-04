-- Run this in Supabase SQL Editor when registration fails with:
-- "permission denied for table profiles".
--
-- The browser client signs users up with the public Supabase key, then writes
-- the signed-in user's profile and saved-guide rows. These grants and RLS
-- policies allow users to manage only their own account data.

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, delete on table public.saved_guides to authenticated;

alter table public.profiles enable row level security;
alter table public.saved_guides enable row level security;

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
