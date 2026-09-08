create table if not exists public.moving_checklist_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_task_ids text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint moving_checklist_progress_known_tasks check (
    completed_task_ids <@ array[
      'usps',
      'uscis',
      'dmv-license',
      'dmv-vehicle',
      'voter',
      'employer',
      'financial',
      'insurance',
      'health',
      'utilities'
    ]::text[]
  )
);

alter table public.moving_checklist_progress enable row level security;

revoke all on table public.moving_checklist_progress from public, anon, authenticated;
grant all on table public.moving_checklist_progress to service_role;
grant select, insert, update, delete on table public.moving_checklist_progress to authenticated;

drop policy if exists "Users read their own moving checklist" on public.moving_checklist_progress;
create policy "Users read their own moving checklist"
on public.moving_checklist_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own moving checklist" on public.moving_checklist_progress;
create policy "Users create their own moving checklist"
on public.moving_checklist_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own moving checklist" on public.moving_checklist_progress;
create policy "Users update their own moving checklist"
on public.moving_checklist_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own moving checklist" on public.moving_checklist_progress;
create policy "Users delete their own moving checklist"
on public.moving_checklist_progress for delete
to authenticated
using ((select auth.uid()) = user_id);
