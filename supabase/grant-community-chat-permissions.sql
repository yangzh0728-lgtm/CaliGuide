-- CaliGuide API role permissions for community/chat tables.
-- Run this if the app shows "permission denied for table ...".

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on public.forum_posts to authenticated, service_role;
grant select, insert, update, delete on public.forum_comments to authenticated, service_role;
grant select, insert, update, delete on public.forum_votes to authenticated, service_role;
grant select, insert, update, delete on public.chat_sessions to authenticated, service_role;
grant select, insert, update, delete on public.chat_messages to authenticated, service_role;
grant select, insert, update, delete on public.media_assets to authenticated, service_role;
