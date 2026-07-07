import { describe, expect, test } from "bun:test";
import { uploadImagesToR2 } from "./imageUpload";

describe("imageUpload", () => {
  test("uploads multiple images through the same-origin binary upload API", async () => {
    const files = [
      new File(["first"], "first.png", { type: "image/png" }),
      new File(["second"], "second.webp", { type: "image/webp" }),
    ];
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const progressEvents: Array<{ completed: number; total: number; fileName: string }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, init });

      return new Response(
        JSON.stringify({
          publicUrl: `https://cdn.example.com/${init?.headers?.["X-Upload-Folder"]}/${(init?.body as File).name}`,
          objectKey: `assets/${init?.headers?.["X-Upload-Folder"]}/${(init?.body as File).name}`,
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
      "https://cdn.example.com/forum/first.png",
      "https://cdn.example.com/forum/second.webp",
    ]);
    expect(requests.map((request) => request.url)).toEqual(["/api/uploads/file", "/api/uploads/file"]);
    expect(progressEvents).toEqual([
      { completed: 1, total: 2, fileName: "first.png" },
      { completed: 2, total: 2, fileName: "second.webp" },
    ]);
    expect(requests[0].init?.headers).toEqual({
      Authorization: "Bearer access-token",
      "Content-Type": "image/png",
      "X-Upload-Folder": "forum",
      "X-Size-Bytes": String(files[0].size),
      "X-Resource-Id": "11111111-1111-4111-8111-111111111111",
      "X-Attached-To-Type": "forum_post",
      "X-Attached-To-Id": "11111111-1111-4111-8111-111111111111",
    });
    expect(requests[0].init?.method).toBe("POST");
    expect(requests[0].init?.body).toBe(files[0]);
  });

  test("falls back to signed R2 upload when binary upload fails", async () => {
    const file = new File(["first"], "first.png", { type: "image/png" });
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, init });

      if (String(url) === "/api/uploads/file") {
        return new Response(JSON.stringify({ error: "Server upload failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (String(url) === "/api/uploads/sign") {
        const body = JSON.parse(String(init?.body));

        return new Response(
          JSON.stringify({
            uploadUrl: `https://r2.example.com/upload/${body.folder}/${body.resourceId}/${body.mimeType}`,
            publicUrl: `https://cdn.example.com/${body.folder}/${body.resourceId}/${body.mimeType}`,
            objectKey: `assets/${body.folder}/${body.resourceId}/${body.mimeType}`,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(null, { status: 200 });
    };

    const uploads = await uploadImagesToR2([file], "access-token", {
      folder: "forum",
      resourceId: "11111111-1111-4111-8111-111111111111",
      attachedToType: "forum_post",
      attachedToId: "11111111-1111-4111-8111-111111111111",
      fetcher,
    });

    expect(uploads[0].publicUrl).toBe(
      "https://cdn.example.com/forum/11111111-1111-4111-8111-111111111111/image/png",
    );
    expect(requests.map((request) => request.url)).toEqual([
      "/api/uploads/file",
      "/api/uploads/sign",
      "https://r2.example.com/upload/forum/11111111-1111-4111-8111-111111111111/image/png",
    ]);
    expect(requests[2].init?.method).toBe("PUT");
    expect(requests[2].init?.body).toBe(file);
  });

  test("falls back to the base64 media API when binary and signed uploads fail", async () => {
    const file = new File(["first"], "first.png", { type: "image/png" });
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, init });

      if (String(url) === "/api/uploads/file") {
        return new Response(JSON.stringify({ error: "Server upload failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (String(url) === "/api/uploads/sign") {
        return new Response(JSON.stringify({ error: "CORS blocked" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          publicUrl: `https://cdn.example.com/${body.folder}/${body.base64}.png`,
          objectKey: `assets/${body.folder}/${body.base64}.png`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const uploads = await uploadImagesToR2([file], "access-token", {
      folder: "forum",
      resourceId: "11111111-1111-4111-8111-111111111111",
      attachedToType: "forum_post",
      attachedToId: "11111111-1111-4111-8111-111111111111",
      fetcher,
    });

    expect(uploads[0].publicUrl).toBe("https://cdn.example.com/forum/Zmlyc3Q=.png");
    expect(requests.map((request) => request.url)).toEqual([
      "/api/uploads/file",
      "/api/uploads/sign",
      "/api/uploads/image",
    ]);
    expect(JSON.parse(String(requests[2].init?.body))).toMatchObject({
      folder: "forum",
      resourceId: "11111111-1111-4111-8111-111111111111",
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
