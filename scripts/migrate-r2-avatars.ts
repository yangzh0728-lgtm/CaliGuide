import dotenv from "dotenv";
import { CopyObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { getR2Config } from "../src/lib/r2Upload";
import { encodeR2CopySource, planAvatarMigration, planLegacyAvatarObjectMigration } from "../src/lib/r2AvatarMigration";

dotenv.config();

type ProfileAvatarRow = {
  id: string;
  avatar_url: string | null;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const r2Config = getR2Config(process.env);
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const dryRun = process.argv.includes("--dry-run");

const { data: profiles, error } = await supabase.from("profiles").select("id,avatar_url").returns<ProfileAvatarRow[]>();

if (error) {
  throw new Error(formatSupabaseMigrationError(error.message));
}

let migrated = 0;
let skipped = 0;
const copiedDestinations = new Set<string>();

console.log(`Checking ${profiles.length} profile avatar URLs...`);

for (const profile of profiles) {
  const plan = planAvatarMigration({
    userId: profile.id,
    avatarUrl: profile.avatar_url,
    publicBaseUrl: r2Config.publicBaseUrl,
  });

  if (plan.status === "skip") {
    skipped += 1;
    console.log(`skip ${profile.id}: ${plan.reason}`);
    continue;
  }

  console.log(`migrate ${profile.id}: ${plan.sourceKey} -> ${plan.destinationKey}`);

  if (!dryRun) {
    await copyR2Object(plan.sourceKey, plan.destinationKey);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: plan.destinationUrl, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (updateError) {
      throw new Error(formatSupabaseMigrationError(updateError.message));
    }
  }

  migrated += 1;
  copiedDestinations.add(plan.destinationKey);
}

const legacyAvatarKeys = await listR2Keys("avatars/");

console.log(`Checking ${legacyAvatarKeys.length} legacy avatar objects...`);

for (const key of legacyAvatarKeys) {
  const plan = planLegacyAvatarObjectMigration({
    objectKey: key,
    publicBaseUrl: r2Config.publicBaseUrl,
  });

  if (plan.status === "skip") {
    skipped += 1;
    console.log(`skip ${key}: ${plan.reason}`);
    continue;
  }

  if (copiedDestinations.has(plan.destinationKey)) {
    skipped += 1;
    console.log(`skip ${key}: destination already copied`);
    continue;
  }

  console.log(`migrate legacy object: ${plan.sourceKey} -> ${plan.destinationKey}`);

  if (!dryRun) {
    await copyR2Object(plan.sourceKey, plan.destinationKey);
  }

  migrated += 1;
  copiedDestinations.add(plan.destinationKey);
}

const mode = dryRun ? "dry-run" : "live";
console.log(`Avatar migration finished (${mode}). migrated=${migrated} skipped=${skipped}`);

async function copyR2Object(sourceKey: string, destinationKey: string) {
  await r2Client.send(
    new CopyObjectCommand({
      Bucket: r2Config.bucketName,
      CopySource: encodeR2CopySource(r2Config.bucketName, sourceKey),
      Key: destinationKey,
    }),
  );
}

async function listR2Keys(prefix: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: r2Config.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

function formatSupabaseMigrationError(message: string) {
  if (message.toLowerCase().includes("permission denied for table profiles")) {
    return `${message}. Run supabase/r2-avatar-migration-grants.sql in Supabase SQL Editor, then run this migration again.`;
  }

  return message;
}
