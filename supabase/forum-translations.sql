alter table public.profiles
  add column if not exists forum_translation_language text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_forum_translation_language_check;

alter table public.profiles
  add constraint profiles_forum_translation_language_check
  check (forum_translation_language in ('en', 'zh-CN', 'zh-TW', 'es'));

create table if not exists public.forum_translations (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('post', 'comment')),
  source_id text not null,
  target_language text not null check (target_language in ('en', 'zh-CN', 'zh-TW', 'es')),
  source_hash text not null,
  title text,
  excerpt text,
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, target_language, source_hash)
);

create index if not exists forum_translations_lookup_idx
  on public.forum_translations (source_type, source_id, target_language, source_hash);

alter table public.forum_translations enable row level security;

revoke all on table public.forum_translations from anon, authenticated;
grant all on table public.forum_translations to service_role;

grant select, update on table public.profiles to authenticated;
