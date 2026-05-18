const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

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
