import { buildPublicR2Url } from "./r2Upload";

export type AvatarMigrationPlan =
  | {
      status: "migrate";
      userId?: string;
      sourceKey: string;
      destinationKey: string;
      destinationUrl: string;
    }
  | {
      status: "skip";
      reason: "missing-avatar" | "not-r2-url" | "already-migrated" | "missing-filename";
    };

export function planAvatarMigration(input: {
  userId: string;
  avatarUrl: string | null;
  publicBaseUrl: string;
}): AvatarMigrationPlan {
  if (!input.avatarUrl) {
    return { status: "skip", reason: "missing-avatar" };
  }

  const sourceKey = getR2ObjectKeyFromPublicUrl(input.avatarUrl, input.publicBaseUrl);
  if (!sourceKey) {
    return { status: "skip", reason: "not-r2-url" };
  }

  const safeUserId = sanitizePathPart(input.userId) || "user";
  const profilePrefix = `assets/users/${safeUserId}/profile/`;

  if (sourceKey.startsWith(profilePrefix)) {
    return { status: "skip", reason: "already-migrated" };
  }

  const filename = sourceKey.split("/").pop();
  if (!filename) {
    return { status: "skip", reason: "missing-filename" };
  }

  const destinationKey = `${profilePrefix}${filename}`;

  return {
    status: "migrate",
    sourceKey,
    destinationKey,
    destinationUrl: buildPublicR2Url(input.publicBaseUrl, destinationKey),
  };
}

export function planLegacyAvatarObjectMigration(input: {
  objectKey: string;
  publicBaseUrl: string;
}): AvatarMigrationPlan {
  const parts = input.objectKey.split("/");
  const [prefix, userId, ...filenameParts] = parts;

  if (prefix !== "avatars" || !userId || filenameParts.length === 0) {
    return { status: "skip", reason: "not-r2-url" };
  }

  const safeUserId = sanitizePathPart(userId) || "user";
  const filename = filenameParts.join("/");
  if (!filename) {
    return { status: "skip", reason: "missing-filename" };
  }

  const destinationKey = `assets/users/${safeUserId}/profile/${filename}`;

  return {
    status: "migrate",
    userId: safeUserId,
    sourceKey: input.objectKey,
    destinationKey,
    destinationUrl: buildPublicR2Url(input.publicBaseUrl, destinationKey),
  };
}

export function encodeR2CopySource(bucketName: string, objectKey: string) {
  const encodedKey = objectKey
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${bucketName}/${encodedKey}`;
}

function getR2ObjectKeyFromPublicUrl(avatarUrl: string, publicBaseUrl: string) {
  const normalizedBase = publicBaseUrl.replace(/\/+$/, "");
  if (!avatarUrl.startsWith(`${normalizedBase}/`)) {
    return "";
  }

  return decodeURIComponent(avatarUrl.slice(normalizedBase.length + 1).replace(/^\/+/, ""));
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "").toLowerCase();
}
