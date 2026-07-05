const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface UploadedImage {
  objectKey: string;
  publicUrl: string;
}

export interface UploadImagesOptions {
  folder: "chat" | "forum";
  resourceId?: string;
  attachedToType?: "chat" | "forum_post" | "forum_comment";
  attachedToId?: string;
  fetcher?: Fetcher;
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

    uploads.push({
      objectKey: uploadedImage.objectKey,
      publicUrl: uploadedImage.publicUrl,
    });
  }

  return uploads;
}

function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose image files only");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Choose images under 2 MB");
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
