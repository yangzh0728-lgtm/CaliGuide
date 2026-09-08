create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  article_id text not null check (article_id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  section_index integer check (section_index >= 0),
  language text not null check (language in ('en', 'zh-CN', 'zh-TW', 'yue', 'es')),
  article_reviewed_at date not null,
  reason text not null check (reason in ('outdated', 'incorrect', 'broken_link', 'translation', 'confusing')),
  details text not null default '' check (char_length(details) <= 1500),
  reporter_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_reports_status_created_idx on public.content_reports(status, created_at);
create index if not exists content_reports_reporter_idx on public.content_reports(reporter_user_id);
alter table public.content_reports enable row level security;
revoke all on public.content_reports from public, anon, authenticated;
grant select, insert, update, delete on public.content_reports to service_role;
