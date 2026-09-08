-- Disposable CI database only. Never run this fixture against a Supabase project.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.profiles (id uuid primary key, name text);
create table public.forum_posts (id uuid primary key, user_id uuid, moderation_status text);
create table public.forum_comments (id uuid primary key, user_id uuid, moderation_status text);
create table public.forum_votes (id uuid primary key, user_id uuid);
create table public.forum_reports (id uuid primary key, reporter_user_id uuid, review_notes text);
-- Reproduce the permissive legacy policy and column-grant problem.
alter table public.forum_posts enable row level security;
create policy "Forum posts are readable" on public.forum_posts for select using (true);
grant all on all tables in schema public to anon, authenticated;
grant update (moderation_status) on public.forum_posts to authenticated;

insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
insert into public.profiles values ('11111111-1111-4111-8111-111111111111', 'Reader A'), ('22222222-2222-4222-8222-222222222222', 'Reader B');
insert into public.forum_posts values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'visible'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'hidden'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'hidden');
insert into public.forum_comments select * from public.forum_posts;
