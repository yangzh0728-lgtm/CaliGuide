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

  const signResponse = await fetcher("/api/uploads/sign", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: "profile",
      mimeType: file.type,
      sizeBytes: file.size,
      attachedToType: "profile",
    }),
  });

  if (!signResponse.ok) {
    throw new Error(await readUploadError(signResponse, "Unable to prepare profile picture upload"));
  }

  const signedUpload = (await signResponse.json()) as {
    uploadUrl?: string;
    publicUrl?: string;
  };

  if (!signedUpload.uploadUrl || !signedUpload.publicUrl) {
    throw new Error("Upload URL response is invalid");
  }

  const uploadResponse = await fetcher(signedUpload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Unable to upload profile picture");
  }

  return signedUpload.publicUrl;
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
