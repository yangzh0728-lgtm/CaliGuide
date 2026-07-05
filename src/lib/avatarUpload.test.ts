import { describe, expect, test } from "bun:test";
import { readAvatarFile, uploadAvatarToR2 } from "./avatarUpload";

describe("avatarUpload", () => {
  test("converts an uploaded image file to a data URL", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    const dataUrl = await readAvatarFile(file);

    expect(dataUrl).toStartWith("data:image/png;base64,");
  });

  test("rejects non-image uploads", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await expect(readAvatarFile(file)).rejects.toThrow("Choose an image file");
  });

  test("uploads an avatar through the same-origin avatar API", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, init });

      if (url === "/api/uploads/avatar") {
        return new Response(
          JSON.stringify({
            publicUrl: "https://pub.example.com/avatars/user/avatar.png",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(null, { status: 200 });
    };

    const publicUrl = await uploadAvatarToR2(file, "access-token", fetcher);

    expect(publicUrl).toBe("https://pub.example.com/avatars/user/avatar.png");
    expect(requests[0].url).toBe("/api/uploads/avatar");
    expect(requests[0].init?.method).toBe("POST");
    expect(requests[0].init?.headers).toEqual({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(requests[0].init?.body))).toMatchObject({
      mimeType: "image/png",
      sizeBytes: file.size,
    });
    expect(JSON.parse(String(requests[0].init?.body)).base64).toBe("YXZhdGFy");
    expect(requests).toHaveLength(1);
  });
});
