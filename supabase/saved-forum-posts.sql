-- Run after the forum tables exist.
-- Stores forum posts saved by each signed-in user for the Profile > Saved > Posts section.

create table if not exists public.saved_forum_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

grant select, insert, delete on table public.saved_forum_posts to authenticated;

alter table public.saved_forum_posts enable row level security;

drop policy if exists "Users read their own saved forum posts" on public.saved_forum_posts;
create policy "Users read their own saved forum posts"
on public.saved_forum_posts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users save their own forum posts" on public.saved_forum_posts;
create policy "Users save their own forum posts"
on public.saved_forum_posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users remove their own saved forum posts" on public.saved_forum_posts;
create policy "Users remove their own saved forum posts"
on public.saved_forum_posts
for delete
to authenticated
using (auth.uid() = user_id);
