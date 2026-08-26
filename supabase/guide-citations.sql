-- Add stable citation metadata to an existing CaliGuide guide-content schema.
-- Safe to run more than once in the Supabase SQL Editor.

alter table if exists public.guide_official_links
  add column if not exists source_key text,
  add column if not exists publisher text,
  add column if not exists last_reviewed_at date;

update public.guide_official_links
set
  source_key = coalesce(source_key, 'source-' || id::text),
  publisher = coalesce(publisher, title),
  last_reviewed_at = coalesce(last_reviewed_at, current_date)
where source_key is null
   or publisher is null
   or last_reviewed_at is null;

alter table if exists public.guide_official_links
  alter column source_key set not null,
  alter column publisher set not null,
  alter column last_reviewed_at set not null;

create unique index if not exists guide_official_links_article_source_key_idx
  on public.guide_official_links (article_id, source_key);

comment on column public.guide_official_links.source_key is
  'Stable source ID used by citationIds in guide_article_translations.body sections.';

comment on column public.guide_official_links.last_reviewed_at is
  'Date CaliGuide last checked the cited official source.';
