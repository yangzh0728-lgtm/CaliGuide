-- CaliGuide forum moderation and user-reporting queue.
-- Run after supabase/community-chat-tables.sql.

create extension if not exists pgcrypto;

alter table public.forum_posts
  add column if not exists moderation_status text not null default 'visible';

alter table public.forum_comments
  add column if not exists moderation_status text not null default 'visible';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'forum_posts_moderation_status_check'
      and conrelid = 'public.forum_posts'::regclass
  ) then
    alter table public.forum_posts
      add constraint forum_posts_moderation_status_check
      check (moderation_status in ('visible', 'under_review', 'removed'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'forum_comments_moderation_status_check'
      and conrelid = 'public.forum_comments'::regclass
  ) then
    alter table public.forum_comments
      add constraint forum_comments_moderation_status_check
      check (moderation_status in ('visible', 'under_review', 'removed'));
  end if;
end $$;

create table if not exists public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (
    reason in ('spam', 'harassment', 'unsafe_advice', 'misinformation', 'inappropriate_image', 'other')
  ),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  review_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists forum_reports_open_unique
  on public.forum_reports(reporter_user_id, target_type, target_id)
  where status in ('open', 'reviewing');

create index if not exists forum_reports_status_created_idx
  on public.forum_reports(status, created_at desc);

create index if not exists forum_reports_target_idx
  on public.forum_reports(target_type, target_id);

revoke all on public.forum_reports from anon, authenticated;
grant select, insert on public.forum_reports to authenticated;
grant select, insert, update, delete on public.forum_reports to service_role;

alter table public.forum_reports enable row level security;

drop policy if exists "Users create their own forum reports" on public.forum_reports;
create policy "Users create their own forum reports"
on public.forum_reports for insert
to authenticated
with check ((select auth.uid()) = reporter_user_id);

drop policy if exists "Users read their own forum reports" on public.forum_reports;
create policy "Users read their own forum reports"
on public.forum_reports for select
to authenticated
using ((select auth.uid()) = reporter_user_id);

-- Removed content disappears for the community but remains visible to its
-- author so moderation does not silently erase their record of the content.
drop policy if exists "Forum posts are readable by signed-in users" on public.forum_posts;
create policy "Forum posts are readable by signed-in users"
on public.forum_posts for select
to authenticated
using (moderation_status = 'visible' or (select auth.uid()) = user_id);

drop policy if exists "Forum comments are readable by signed-in users" on public.forum_comments;
create policy "Forum comments are readable by signed-in users"
on public.forum_comments for select
to authenticated
using (moderation_status = 'visible' or (select auth.uid()) = user_id);

-- Reports enter the review queue only. A report never auto-removes a post or
-- comment; review decisions are made through the service role or dashboard.
