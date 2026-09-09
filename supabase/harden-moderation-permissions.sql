-- Run after community-chat-tables.sql and moderation-and-reporting.sql.
-- All forum mutations go through the authenticated, rate-limited Express API.
do $$
declare
  target text;
  policy_row record;
  column_list text;
begin
  foreach target in array array['forum_posts', 'forum_comments', 'forum_votes', 'forum_reports', 'profiles'] loop
    execute format('alter table public.%I enable row level security', target);
    for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = target loop
      execute format('drop policy %I on public.%I', policy_row.policyname, target);
    end loop;
    execute format('revoke all on public.%I from public, anon, authenticated', target);
    -- Table revocation does not remove previously granted column privileges.
    select string_agg(quote_ident(attname), ', ') into column_list
      from pg_attribute where attrelid = format('public.%I', target)::regclass
      and attnum > 0 and not attisdropped;
    execute format('revoke select (%s), insert (%s), update (%s), references (%s) on public.%I from public, anon, authenticated',
      column_list, column_list, column_list, column_list, target);
    execute format('grant all on public.%I to service_role', target);
  end loop;
end $$;

grant select on public.forum_posts, public.forum_comments, public.forum_votes to authenticated;
create policy "Visible posts or own posts" on public.forum_posts for select to authenticated
  using (moderation_status = 'visible' or (select auth.uid()) = user_id);
create policy "Visible comments or own comments" on public.forum_comments for select to authenticated
  using (moderation_status = 'visible' or (select auth.uid()) = user_id);
create policy "Read forum votes" on public.forum_votes for select to authenticated using (true);

-- Profile fields include private account details; forum author names are stored on posts.
grant select, insert, update, delete on public.profiles to authenticated;
create policy "Own profile" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- No browser policies or grants on forum_reports: even a reporter cannot read
-- staff review notes or insert around the server's validation and rate limit.
