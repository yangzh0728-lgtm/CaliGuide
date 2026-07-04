-- Reset only the CaliGuide guide/blog content tables.
-- Use this if the first schema run failed partway through with errors like:
--   relation "public.guide_articles" does not exist
--
-- Do not run this after real guide/blog content has been imported unless you
-- intentionally want to delete those content tables.

drop table if exists public.guide_media_assets cascade;
drop table if exists public.guide_official_links cascade;
drop table if exists public.guide_article_tags cascade;
drop table if exists public.guide_article_translations cascade;
drop table if exists public.guide_articles cascade;
drop table if exists public.content_tags cascade;
drop table if exists public.content_categories cascade;