import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { buildGuideContentImportRows, type GuideContentImportData } from "../src/lib/guideContentImport";

dotenv.config();

const inputPath = process.argv[2] ?? "content/california_newcomer_20_blogs_zh-CN.json";
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const content = JSON.parse(await readFile(inputPath, "utf8")) as GuideContentImportData;
const rows = buildGuideContentImportRows(content);
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log(
  `Importing guide content from ${inputPath}: categories=${rows.categories.length}, tags=${rows.tags.length}, articles=${rows.articles.length}`,
);

await upsertRows("content_categories", rows.categories, "id");
await upsertRows("content_tags", rows.tags, "id");
await upsertRows("guide_articles", rows.articles, "id");
await upsertRows("guide_article_translations", rows.translations, "article_id,locale");

await replaceScopedRows("guide_article_tags", rows.articleIds, rows.articleTags);
await replaceScopedRows("guide_official_links", rows.articleIds, rows.officialLinks);
await replaceScopedRows("guide_media_assets", rows.articleIds, rows.mediaAssets);

console.log("Guide content import complete.");

async function upsertRows(table: string, values: Array<Record<string, unknown>>, onConflict: string) {
  if (values.length === 0) {
    console.log(`skip ${table}: 0 rows`);
    return;
  }

  const { error } = await supabase.from(table).upsert(values, { onConflict });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`upsert ${table}: ${values.length} rows`);
}

async function replaceScopedRows(table: string, articleIds: string[], values: Array<Record<string, unknown>>) {
  const { error: deleteError } = await supabase.from(table).delete().in("article_id", articleIds);
  if (deleteError) {
    throw new Error(`${table} delete: ${deleteError.message}`);
  }

  if (values.length === 0) {
    console.log(`replace ${table}: 0 rows`);
    return;
  }

  const { error: insertError } = await supabase.from(table).insert(values);
  if (insertError) {
    throw new Error(`${table} insert: ${insertError.message}`);
  }

  console.log(`replace ${table}: ${values.length} rows`);
}
