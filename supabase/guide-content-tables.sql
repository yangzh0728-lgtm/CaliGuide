-- CaliGuide guide/blog content schema.
-- Run this in Supabase SQL Editor before importing content JSON.
-- Important: run the whole file from the top. If a previous run failed partway
-- through, run supabase/reset-guide-content-tables.sql first, then rerun this file.

create extension if not exists pgcrypto;

create table if not exists public.content_categories (
  id text primary key,
  label text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_categories_id_format check (id ~ '^[a-z0-9][a-z0-9-]*$')
);

create table if not exists public.content_tags (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_tags_id_format check (id ~ '^[a-z0-9][a-z0-9-]*$')
);

create table if not exists public.guide_articles (
  id text primary key,
  slug text not null unique,
  article_type text not null default 'guide',
  category_id text not null references public.content_categories(id) on update cascade,
  status text not null default 'draft',
  cover_image_key text,
  reading_minutes integer not null default 5,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guide_articles_id_format check (id ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint guide_articles_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint guide_articles_article_type_check check (article_type in ('guide', 'blog', 'question')),
  constraint guide_articles_status_check check (status in ('draft', 'review', 'published', 'archived')),
  constraint guide_articles_reading_minutes_check check (reading_minutes > 0 and reading_minutes <= 120)
);

create table if not exists public.guide_article_translations (
  article_id text not null references public.guide_articles(id) on delete cascade,
  locale text not null,
  title text not null,
  summary text not null,
  body jsonb not null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (article_id, locale),
  constraint guide_article_translations_locale_check check (locale in ('en', 'zh-CN', 'zh-HK', 'zh-TW', 'es')),
  constraint guide_article_translations_body_array check (jsonb_typeof(body) = 'array')
);

create table if not exists public.guide_article_tags (
  article_id text not null references public.guide_articles(id) on delete cascade,
  tag_id text not null references public.content_tags(id) on update cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create table if not exists public.guide_official_links (
  id bigint generated always as identity primary key,
  article_id text not null references public.guide_articles(id) on delete cascade,
  title text not null,
  url text not null,
  purpose text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guide_official_links_url_check check (url ~ '^https?://')
);

create table if not exists public.guide_media_assets (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public.guide_articles(id) on delete cascade,
  kind text not null default 'image',
  r2_key text not null,
  public_url text,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guide_media_assets_kind_check check (kind in ('cover', 'image', 'attachment')),
  constraint guide_media_assets_r2_key_check check (r2_key like 'assets/platform/guide/%')
);

create index if not exists content_categories_sort_idx
  on public.content_categories (sort_order, label);

create index if not exists content_tags_label_idx
  on public.content_tags (label);

create index if not exists guide_articles_status_category_published_idx
  on public.guide_articles (status, category_id, published_at desc);

create index if not exists guide_articles_featured_published_idx
  on public.guide_articles (is_featured, published_at desc)
  where status = 'published';

create index if not exists guide_article_translations_locale_title_idx
  on public.guide_article_translations (locale, title);

create index if not exists guide_article_translations_body_gin_idx
  on public.guide_article_translations using gin (body);

create index if not exists guide_article_tags_tag_idx
  on public.guide_article_tags (tag_id, sort_order);

create index if not exists guide_official_links_article_sort_idx
  on public.guide_official_links (article_id, sort_order);

create index if not exists guide_media_assets_article_sort_idx
  on public.guide_media_assets (article_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_content_categories_updated_at on public.content_categories;
create trigger set_content_categories_updated_at
before update on public.content_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_content_tags_updated_at on public.content_tags;
create trigger set_content_tags_updated_at
before update on public.content_tags
for each row execute function public.set_updated_at();

drop trigger if exists set_guide_articles_updated_at on public.guide_articles;
create trigger set_guide_articles_updated_at
before update on public.guide_articles
for each row execute function public.set_updated_at();

drop trigger if exists set_guide_article_translations_updated_at on public.guide_article_translations;
create trigger set_guide_article_translations_updated_at
before update on public.guide_article_translations
for each row execute function public.set_updated_at();

drop trigger if exists set_guide_official_links_updated_at on public.guide_official_links;
create trigger set_guide_official_links_updated_at
before update on public.guide_official_links
for each row execute function public.set_updated_at();

drop trigger if exists set_guide_media_assets_updated_at on public.guide_media_assets;
create trigger set_guide_media_assets_updated_at
before update on public.guide_media_assets
for each row execute function public.set_updated_at();

alter table public.content_categories enable row level security;
alter table public.content_tags enable row level security;
alter table public.guide_articles enable row level security;
alter table public.guide_article_translations enable row level security;
alter table public.guide_article_tags enable row level security;
alter table public.guide_official_links enable row level security;
alter table public.guide_media_assets enable row level security;

drop policy if exists "public can read content categories" on public.content_categories;
create policy "public can read content categories"
on public.content_categories for select
to anon, authenticated
using (true);

drop policy if exists "public can read content tags" on public.content_tags;
create policy "public can read content tags"
on public.content_tags for select
to anon, authenticated
using (true);

drop policy if exists "public can read published guide articles" on public.guide_articles;
create policy "public can read published guide articles"
on public.guide_articles for select
to anon, authenticated
using (status = 'published');

drop policy if exists "public can read published guide translations" on public.guide_article_translations;
create policy "public can read published guide translations"
on public.guide_article_translations for select
to anon, authenticated
using (
  exists (
    select 1
    from public.guide_articles
    where guide_articles.id = guide_article_translations.article_id
      and guide_articles.status = 'published'
  )
);

drop policy if exists "public can read published guide tags" on public.guide_article_tags;
create policy "public can read published guide tags"
on public.guide_article_tags for select
to anon, authenticated
using (
  exists (
    select 1
    from public.guide_articles
    where guide_articles.id = guide_article_tags.article_id
      and guide_articles.status = 'published'
  )
);

drop policy if exists "public can read published guide links" on public.guide_official_links;
create policy "public can read published guide links"
on public.guide_official_links for select
to anon, authenticated
using (
  exists (
    select 1
    from public.guide_articles
    where guide_articles.id = guide_official_links.article_id
      and guide_articles.status = 'published'
  )
);

drop policy if exists "public can read published guide media" on public.guide_media_assets;
create policy "public can read published guide media"
on public.guide_media_assets for select
to anon, authenticated
using (
  exists (
    select 1
    from public.guide_articles
    where guide_articles.id = guide_media_assets.article_id
      and guide_articles.status = 'published'
  )
);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.content_categories to anon, authenticated;
grant select on public.content_tags to anon, authenticated;
grant select on public.guide_articles to anon, authenticated;
grant select on public.guide_article_translations to anon, authenticated;
grant select on public.guide_article_tags to anon, authenticated;
grant select on public.guide_official_links to anon, authenticated;
grant select on public.guide_media_assets to anon, authenticated;

grant all on public.content_categories to service_role;
grant all on public.content_tags to service_role;
grant all on public.guide_articles to service_role;
grant all on public.guide_article_translations to service_role;
grant all on public.guide_article_tags to service_role;
grant all on public.guide_official_links to service_role;
grant all on public.guide_media_assets to service_role;

do $$
begin
  if to_regclass('public.guide_official_links_id_seq') is not null then
    grant usage, select on sequence public.guide_official_links_id_seq to service_role;
  end if;
end $$;
