const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface UploadedImage {
  objectKey: string;
  publicUrl: string;
}

interface SignedUploadResponse extends Partial<UploadedImage> {
  uploadUrl?: string;
}

export interface UploadImagesOptions {
  folder: "chat" | "forum";
  resourceId?: string;
  attachedToType?: "chat" | "forum_post" | "forum_comment";
  attachedToId?: string;
  fetcher?: Fetcher;
  onProgress?: (progress: { completed: number; total: number; fileName: string }) => void;
}

export async function uploadImagesToR2(
  files: File[],
  accessToken: string,
  options: UploadImagesOptions,
): Promise<UploadedImage[]> {
  if (!files.length) {
    return [];
  }
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  files.forEach(validateImageFile);

  const fetcher = options.fetcher ?? fetch;
  const uploads: UploadedImage[] = [];

  for (const file of files) {
    const uploadedImage = await uploadImageThroughBinaryServer(file, accessToken, options, fetcher).catch(async () =>
      uploadImageWithSignedUrl(file, accessToken, options, fetcher).catch(async () =>
        uploadImageThroughServer(file, accessToken, options, fetcher),
      ),
    );

    uploads.push(uploadedImage);
    options.onProgress?.({
      completed: uploads.length,
      total: files.length,
      fileName: file.name,
    });
  }

  return uploads;
}

async function uploadImageThroughBinaryServer(
  file: File,
  accessToken: string,
  options: UploadImagesOptions,
  fetcher: Fetcher,
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": file.type,
    "X-Upload-Folder": options.folder,
    "X-Size-Bytes": String(file.size),
  };

  if (options.resourceId) {
    headers["X-Resource-Id"] = options.resourceId;
  }
  if (options.attachedToType) {
    headers["X-Attached-To-Type"] = options.attachedToType;
  }
  if (options.attachedToId) {
    headers["X-Attached-To-Id"] = options.attachedToId;
  }

  const uploadResponse = await fetcher("/api/uploads/file", {
    method: "POST",
    headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(await readUploadError(uploadResponse, "Unable to upload image"));
  }

  const uploadedImage = (await uploadResponse.json()) as Partial<UploadedImage>;
  if (!uploadedImage.publicUrl || !uploadedImage.objectKey) {
    throw new Error("Upload response is invalid");
  }

  return {
    objectKey: uploadedImage.objectKey,
    publicUrl: uploadedImage.publicUrl,
  };
}

async function uploadImageWithSignedUrl(
  file: File,
  accessToken: string,
  options: UploadImagesOptions,
  fetcher: Fetcher,
) {
  const signResponse = await fetcher("/api/uploads/sign", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: options.folder,
      resourceId: options.resourceId,
      attachedToType: options.attachedToType,
      attachedToId: options.attachedToId,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });

  if (!signResponse.ok) {
    throw new Error(await readUploadError(signResponse, "Unable to prepare image upload"));
  }

  const signedUpload = (await signResponse.json()) as SignedUploadResponse;
  if (!signedUpload.uploadUrl || !signedUpload.publicUrl || !signedUpload.objectKey) {
    throw new Error("Upload signature response is invalid");
  }

  const putResponse = await fetcher(signedUpload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error(await readUploadError(putResponse, "Unable to upload image to Cloudflare R2"));
  }

  return {
    objectKey: signedUpload.objectKey,
    publicUrl: signedUpload.publicUrl,
  };
}

async function uploadImageThroughServer(
  file: File,
  accessToken: string,
  options: UploadImagesOptions,
  fetcher: Fetcher,
) {
  const uploadResponse = await fetcher("/api/uploads/image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: options.folder,
      resourceId: options.resourceId,
      attachedToType: options.attachedToType,
      attachedToId: options.attachedToId,
      mimeType: file.type,
      sizeBytes: file.size,
      base64: await fileToBase64(file),
    }),
  });

  if (!uploadResponse.ok) {
    throw new Error(await readUploadError(uploadResponse, "Unable to upload image"));
  }

  const uploadedImage = (await uploadResponse.json()) as Partial<UploadedImage>;
  if (!uploadedImage.publicUrl || !uploadedImage.objectKey) {
    throw new Error("Upload response is invalid");
  }

  return {
    objectKey: uploadedImage.objectKey,
    publicUrl: uploadedImage.publicUrl,
  };
}

function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose image files only");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Choose images under 8 MB");
  }
}

async function readUploadError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
