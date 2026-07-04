export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
}

type R2Env = Partial<{
  CLOUDFLARE_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_BASE_URL: string;
}>;

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function getR2Config(env: R2Env): R2Config {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = env.R2_PUBLIC_BASE_URL?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new Error("Missing Cloudflare R2 upload configuration");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
  };
}

export function isAllowedUploadMimeType(mimeType: string) {
  return Object.hasOwn(MIME_TYPE_EXTENSIONS, mimeType);
}

export function createR2ObjectKey(input: {
  userId: string;
  folder: string;
  resourceId?: string;
  mimeType: string;
  randomId?: string;
}) {
  const extension = MIME_TYPE_EXTENSIONS[input.mimeType];
  if (!extension) {
    throw new Error("Unsupported upload type");
  }

  const safeFolder = sanitizePathPart(input.folder) || "profile";
  const safeUserId = sanitizePathPart(input.userId) || "user";
  const safeResourceId = sanitizePathPart(input.resourceId ?? "");
  const randomId = input.randomId ?? crypto.randomUUID();

  if (safeFolder === "profile") {
    return `assets/users/${safeUserId}/profile/${randomId}.${extension}`;
  }

  if (safeFolder === "forum") {
    if (!safeResourceId) {
      throw new Error("Resource id is required");
    }

    return `assets/users/${safeUserId}/forum/${safeResourceId}/${randomId}.${extension}`;
  }

  if (safeFolder === "chat") {
    return `assets/users/${safeUserId}/chat/${randomId}.${extension}`;
  }

  if (safeFolder === "platform-guide") {
    if (!safeResourceId) {
      throw new Error("Resource id is required");
    }

    return `assets/platform/guide/${safeResourceId}/${randomId}.${extension}`;
  }

  if (safeFolder === "platform-public") {
    return `assets/platform/public/${randomId}.${extension}`;
  }

  return `assets/users/${safeUserId}/uploads/${randomId}.${extension}`;
}

export function buildPublicR2Url(publicBaseUrl: string, objectKey: string) {
  return `${publicBaseUrl.replace(/\/+$/, "")}/${objectKey.replace(/^\/+/, "")}`;
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "").toLowerCase();
}
