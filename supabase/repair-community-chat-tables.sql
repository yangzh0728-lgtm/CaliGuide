-- CaliGuide repair script for partial community/chat schemas.
-- Run this if forum/chat tables already exist but are missing newer columns.

create extension if not exists pgcrypto;

alter table if exists public.forum_posts
  add column if not exists source_id text,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
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

alter table if exists public.forum_comments
  add column if not exists post_id uuid references public.forum_posts(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists author_name text,
  add column if not exists author_avatar text,
  add column if not exists body text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table if exists public.forum_votes
  add column if not exists target_type text,
  add column if not exists target_id uuid,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists vote_type text,
  add column if not exists created_at timestamptz default now();

alter table if exists public.chat_sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists title text default 'New chat',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table if exists public.chat_messages
  add column if not exists session_id uuid references public.chat_sessions(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists role text,
  add column if not exists content text,
  add column if not exists created_at timestamptz default now();

alter table if exists public.media_assets
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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'forum_comments'
      and column_name = 'author_id'
  ) then
    update public.forum_comments
    set user_id = author_id
    where user_id is null and author_id is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'forum_votes'
      and column_name = 'author_id'
  ) then
    update public.forum_votes
    set user_id = author_id
    where user_id is null and author_id is not null;
  end if;
end $$;

alter table if exists public.forum_posts
  alter column body set default '{}',
  alter column tags set default '{}',
  alter column image_urls set default '{}',
  alter column view_count set default 0,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.forum_posts
  alter column author_id drop not null;

alter table if exists public.forum_comments
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.forum_votes
  alter column created_at set default now();

alter table if exists public.forum_comments
  alter column author_id drop not null;

alter table if exists public.forum_votes
  alter column author_id drop not null;

alter table if exists public.chat_sessions
  alter column title set default 'New chat',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.chat_messages
  alter column created_at set default now();

alter table if exists public.media_assets
  alter column moderation_status set default 'pending',
  alter column created_at set default now();

create index if not exists forum_posts_created_at_idx on public.forum_posts(created_at desc);
create index if not exists forum_posts_category_idx on public.forum_posts(category);
create index if not exists forum_comments_post_id_idx on public.forum_comments(post_id, created_at);
create index if not exists forum_votes_target_idx on public.forum_votes(target_type, target_id);
create index if not exists chat_sessions_user_updated_idx on public.chat_sessions(user_id, updated_at desc);
create index if not exists chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index if not exists media_assets_owner_idx on public.media_assets(owner_user_id, created_at desc);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.forum_posts to authenticated, service_role;
grant select, insert, update, delete on public.forum_comments to authenticated, service_role;
grant select, insert, update, delete on public.forum_votes to authenticated, service_role;
grant select, insert, update, delete on public.chat_sessions to authenticated, service_role;
grant select, insert, update, delete on public.chat_messages to authenticated, service_role;
grant select, insert, update, delete on public.media_assets to authenticated, service_role;
