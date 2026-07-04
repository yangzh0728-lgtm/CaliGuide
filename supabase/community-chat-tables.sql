-- CaliGuide community + chat persistence tables.
-- Run this in the Supabase SQL Editor after the auth/profile tables exist.

create extension if not exists pgcrypto;

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_avatar text not null,
  category text not null,
  title text not null,
  excerpt text not null,
  body text[] not null default '{}',
  tags text[] not null default '{}',
  image_urls text[] not null default '{}',
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_avatar text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_votes (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type text not null check (vote_type in ('useful', 'unuseful')),
  created_at timestamptz not null default now(),
  unique (target_type, target_id, user_id)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'bot')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  object_key text not null,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  attached_to_type text not null check (attached_to_type in ('profile', 'forum_post', 'forum_comment', 'chat', 'guide', 'platform')),
  attached_to_id uuid,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (bucket, object_key)
);

-- Compatibility repair: if an earlier/partial version of these tables already
-- exists, create table if not exists will not add missing columns. These ALTERs
-- make the script safe to rerun after a failed first attempt.
alter table public.forum_posts
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists author_name text,
  add column if not exists author_avatar text,
  add column if not exists category text,
  add column if not exists title text,
  add column if not exists excerpt text,
  add column if not exists body text[] default '{}',
  add column if not exists tags text[] default '{}',
  add column if not exists image_urls text[] default '{}',
  add column if not exists view_count integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.forum_comments
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists post_id uuid references public.forum_posts(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists author_name text,
  add column if not exists author_avatar text,
  add column if not exists body text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.forum_votes
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists target_type text,
  add column if not exists target_id uuid,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists vote_type text,
  add column if not exists created_at timestamptz default now();

alter table public.chat_sessions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists title text default 'New chat',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.chat_messages
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists session_id uuid references public.chat_sessions(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role text,
  add column if not exists content text,
  add column if not exists created_at timestamptz default now();

alter table public.media_assets
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists bucket text,
  add column if not exists object_key text,
  add column if not exists public_url text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists attached_to_type text,
  add column if not exists attached_to_id uuid,
  add column if not exists moderation_status text default 'pending',
  add column if not exists created_at timestamptz default now();

create index if not exists forum_posts_created_at_idx on public.forum_posts(created_at desc);
create index if not exists forum_posts_category_idx on public.forum_posts(category);
create index if not exists forum_comments_post_id_idx on public.forum_comments(post_id, created_at);
create index if not exists forum_votes_target_idx on public.forum_votes(target_type, target_id);
create index if not exists chat_sessions_user_updated_idx on public.chat_sessions(user_id, updated_at desc);
create index if not exists chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index if not exists media_assets_owner_idx on public.media_assets(owner_user_id, created_at desc);

alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_votes enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "Forum posts are readable by signed-in users" on public.forum_posts;
create policy "Forum posts are readable by signed-in users"
on public.forum_posts for select
to authenticated
using (true);

drop policy if exists "Users create their own forum posts" on public.forum_posts;
create policy "Users create their own forum posts"
on public.forum_posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update their own forum posts" on public.forum_posts;
create policy "Users update their own forum posts"
on public.forum_posts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Forum comments are readable by signed-in users" on public.forum_comments;
create policy "Forum comments are readable by signed-in users"
on public.forum_comments for select
to authenticated
using (true);

drop policy if exists "Users create their own forum comments" on public.forum_comments;
create policy "Users create their own forum comments"
on public.forum_comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Forum votes are readable by signed-in users" on public.forum_votes;
create policy "Forum votes are readable by signed-in users"
on public.forum_votes for select
to authenticated
using (true);

drop policy if exists "Users manage their own forum votes" on public.forum_votes;
create policy "Users manage their own forum votes"
on public.forum_votes for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read their own chat sessions" on public.chat_sessions;
create policy "Users read their own chat sessions"
on public.chat_sessions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users create their own chat sessions" on public.chat_sessions;
create policy "Users create their own chat sessions"
on public.chat_sessions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update their own chat sessions" on public.chat_sessions;
create policy "Users update their own chat sessions"
on public.chat_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete their own chat sessions" on public.chat_sessions;
create policy "Users delete their own chat sessions"
on public.chat_sessions for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users read their own chat messages" on public.chat_messages;
create policy "Users read their own chat messages"
on public.chat_messages for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users create their own chat messages" on public.chat_messages;
create policy "Users create their own chat messages"
on public.chat_messages for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users read their own media assets" on public.media_assets;
create policy "Users read their own media assets"
on public.media_assets for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "Users create their own media assets" on public.media_assets;
create policy "Users create their own media assets"
on public.media_assets for insert
to authenticated
with check (auth.uid() = owner_user_id);
