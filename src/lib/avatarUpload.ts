const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export async function readAvatarFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Choose an image under 2 MB");
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:${file.type};base64,${btoa(binary)}`;
}

export async function uploadAvatarToR2(file: File, accessToken: string, fetcher: Fetcher = fetch) {
  validateAvatarFile(file);

  if (!accessToken) {
    throw new Error("Sign in required");
  }

  const uploadResponse = await fetcher("/api/uploads/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mimeType: file.type,
      sizeBytes: file.size,
      base64: await fileToBase64(file),
    }),
  });

  if (!uploadResponse.ok) {
    throw new Error(await readUploadError(uploadResponse, "Unable to upload profile picture"));
  }

  const uploadedAvatar = (await uploadResponse.json()) as {
    publicUrl?: string;
  };

  if (!uploadedAvatar.publicUrl) {
    throw new Error("Upload response is invalid");
  }

  return uploadedAvatar.publicUrl;
}

function validateAvatarFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Choose an image under 2 MB");
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
