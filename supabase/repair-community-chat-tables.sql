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

create table if not exists public.saved_forum_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

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
  add column if not exists image_urls text[] default '{}',
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

do $$
declare
  existing_constraint text;
begin
  if to_regclass('public.forum_comments') is not null
    and to_regclass('public.forum_posts') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'forum_comments'
        and column_name = 'post_id'
    )
  then
    delete from public.forum_comments c
    where c.post_id is not null
      and not exists (
        select 1
        from public.forum_posts post
        where post.id = c.post_id
      );

    for existing_constraint in
      select usage.constraint_name
      from information_schema.key_column_usage usage
      join information_schema.table_constraints constraint_info
        on constraint_info.constraint_schema = usage.constraint_schema
       and constraint_info.constraint_name = usage.constraint_name
       and constraint_info.table_schema = usage.table_schema
       and constraint_info.table_name = usage.table_name
      where usage.table_schema = 'public'
        and usage.table_name = 'forum_comments'
        and usage.column_name = 'post_id'
        and constraint_info.constraint_type = 'FOREIGN KEY'
    loop
      execute format('alter table public.forum_comments drop constraint if exists %I', existing_constraint);
    end loop;

    alter table public.forum_comments
      add constraint forum_comments_post_id_fkey
      foreign key (post_id)
      references public.forum_posts(id)
      on delete cascade;
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
  alter column image_urls set default '{}',
  alter column created_at set default now();

alter table if exists public.media_assets
  alter column moderation_status set default 'pending',
  alter column created_at set default now();

create index if not exists forum_posts_created_at_idx on public.forum_posts(created_at desc);
create index if not exists forum_posts_category_idx on public.forum_posts(category);
create index if not exists forum_comments_post_id_idx on public.forum_comments(post_id, created_at);
create index if not exists forum_votes_target_idx on public.forum_votes(target_type, target_id);
create index if not exists saved_forum_posts_user_created_idx on public.saved_forum_posts(user_id, created_at desc);
create index if not exists chat_sessions_user_updated_idx on public.chat_sessions(user_id, updated_at desc);
create index if not exists chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index if not exists media_assets_owner_idx on public.media_assets(owner_user_id, created_at desc);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.forum_posts to authenticated, service_role;
grant select, insert, update, delete on public.forum_comments to authenticated, service_role;
grant select, insert, update, delete on public.forum_votes to authenticated, service_role;
grant select, insert, delete on public.saved_forum_posts to authenticated, service_role;
grant select, insert, update, delete on public.chat_sessions to authenticated, service_role;
grant select, insert, update, delete on public.chat_messages to authenticated, service_role;
grant select, insert, update, delete on public.media_assets to authenticated, service_role;

alter table public.saved_forum_posts enable row level security;

drop policy if exists "Users read their own saved forum posts" on public.saved_forum_posts;
create policy "Users read their own saved forum posts"
on public.saved_forum_posts for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users save their own forum posts" on public.saved_forum_posts;
create policy "Users save their own forum posts"
on public.saved_forum_posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users remove their own saved forum posts" on public.saved_forum_posts;
create policy "Users remove their own saved forum posts"
on public.saved_forum_posts for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users delete their own forum posts" on public.forum_posts;
create policy "Users delete their own forum posts"
on public.forum_posts for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users delete their own forum comments" on public.forum_comments;
create policy "Users delete their own forum comments"
on public.forum_comments for delete
to authenticated
using (auth.uid() = user_id);
