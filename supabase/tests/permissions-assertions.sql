\set ON_ERROR_STOP on
begin;
do $$
declare target text;
begin
  foreach target in array array['forum_posts','forum_comments','forum_votes','forum_reports','content_reports'] loop
    if has_table_privilege('authenticated', 'public.' || target, 'INSERT,UPDATE,DELETE')
       or has_table_privilege('anon', 'public.' || target, 'SELECT,INSERT,UPDATE,DELETE') then
      raise exception 'Unexpected browser privileges on %', target;
    end if;
  end loop;
  if has_column_privilege('authenticated', 'public.forum_posts', 'moderation_status', 'UPDATE') then
    raise exception 'Column grant permits moderation bypass';
  end if;
  if has_table_privilege('authenticated','public.forum_reports','SELECT')
     or has_table_privilege('authenticated','public.content_reports','SELECT') then
    raise exception 'Browser can read moderation queues';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'Profile isolation failed'; end if;
  if (select count(*) from public.forum_posts) <> 2 then raise exception 'Hidden post isolation failed'; end if;
  if (select count(*) from public.forum_comments) <> 2 then raise exception 'Hidden comment isolation failed'; end if;
end $$;
insert into public.moving_checklist_progress(user_id,completed_task_ids)
  values ('11111111-1111-4111-8111-111111111111', array['usps']);
do $$ begin
  begin
    insert into public.moving_checklist_progress(user_id) values ('22222222-2222-4222-8222-222222222222');
    raise exception 'Cross-account insert succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
  if exists(select 1 from public.moving_checklist_progress) then raise exception 'Checklist read isolation failed'; end if;
end $$;
update public.moving_checklist_progress set completed_task_ids = '{}' where user_id = '11111111-1111-4111-8111-111111111111';
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  if (select completed_task_ids from public.moving_checklist_progress) <> array['usps'] then raise exception 'Cross-account update succeeded'; end if;
end $$;
set local role service_role;
insert into public.content_reports(article_id,language,article_reviewed_at,reason) values ('category-dmv','en','2026-01-01','outdated');
rollback;
