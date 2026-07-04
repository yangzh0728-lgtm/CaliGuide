-- Run this in Supabase SQL Editor if `bun run migrate:r2-avatars -- --dry-run`
-- reports: "permission denied for table profiles".
--
-- The migration script uses the server-only Supabase key to read and update
-- profile avatar URLs after copying old R2 avatar objects into the new
-- assets/users/{user_id}/profile/ folder.

grant usage on schema public to service_role;
grant select, update on table public.profiles to service_role;
