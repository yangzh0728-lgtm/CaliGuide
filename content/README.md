# CaliGuide Content Files

This folder stores source JSON files for guide and blog content before they are imported into Supabase.

## Files

- `guide-content.template.json`: copy this when drafting a new content batch.
- `california_newcomer_20_blogs_zh-CN.json`: first zh-CN content batch with 10 categories, 49 tags, and 20 articles.

## Import

Run the default import:

```bash
bun run import:guide-content
```

Or import a specific file:

```bash
bun run import:guide-content content/california_newcomer_20_blogs_zh-CN.json
```

## Structure

Content files should match:

```text
schemas/guide-content.schema.json
```

Supabase remains the source of truth after import. These JSON files are editable source batches and backups for content work.
