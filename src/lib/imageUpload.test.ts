import { describe, expect, test } from "bun:test";
import { uploadImagesToR2 } from "./imageUpload";

describe("imageUpload", () => {
  test("uploads multiple images through the same-origin media API", async () => {
    const files = [
      new File(["first"], "first.png", { type: "image/png" }),
      new File(["second"], "second.webp", { type: "image/webp" }),
    ];
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const progressEvents: Array<{ completed: number; total: number; fileName: string }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, init });
      const body = JSON.parse(String(init?.body));

      return new Response(
        JSON.stringify({
          publicUrl: `https://cdn.example.com/${body.folder}/${body.resourceId ?? "chat"}/${body.base64}.png`,
          objectKey: `assets/${body.folder}/${body.base64}.png`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const uploads = await uploadImagesToR2(files, "access-token", {
      folder: "forum",
      resourceId: "11111111-1111-4111-8111-111111111111",
      attachedToType: "forum_post",
      attachedToId: "11111111-1111-4111-8111-111111111111",
      fetcher,
      onProgress: (progress) => progressEvents.push(progress),
    });

    expect(uploads.map((upload) => upload.publicUrl)).toEqual([
      "https://cdn.example.com/forum/11111111-1111-4111-8111-111111111111/Zmlyc3Q=.png",
      "https://cdn.example.com/forum/11111111-1111-4111-8111-111111111111/c2Vjb25k.png",
    ]);
    expect(requests).toHaveLength(2);
    expect(requests[0].url).toBe("/api/uploads/image");
    expect(progressEvents).toEqual([
      { completed: 1, total: 2, fileName: "first.png" },
      { completed: 2, total: 2, fileName: "second.webp" },
    ]);
    expect(requests[0].init?.headers).toEqual({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(requests[0].init?.body))).toMatchObject({
      folder: "forum",
      resourceId: "11111111-1111-4111-8111-111111111111",
      attachedToType: "forum_post",
      attachedToId: "11111111-1111-4111-8111-111111111111",
      mimeType: "image/png",
      sizeBytes: files[0].size,
      base64: "Zmlyc3Q=",
    });
  });

  test("rejects non-image files before uploading", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await expect(
      uploadImagesToR2([file], "access-token", {
        folder: "chat",
      }),
    ).rejects.toThrow("Choose image files only");
  });
});
