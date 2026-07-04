import { describe, expect, it } from "bun:test";
import {
  buildPublicR2Url,
  createR2ObjectKey,
  getR2Config,
  isAllowedUploadMimeType,
} from "./r2Upload";

describe("r2Upload", () => {
  it("reads R2 upload config from server env", () => {
    expect(
      getR2Config({
        CLOUDFLARE_ACCOUNT_ID: "account-1",
        R2_ACCESS_KEY_ID: "access-1",
        R2_SECRET_ACCESS_KEY: "secret-1",
        R2_BUCKET_NAME: "caliguide-media",
        R2_PUBLIC_BASE_URL: "https://pub-example.r2.dev",
      }),
    ).toEqual({
      accountId: "account-1",
      accessKeyId: "access-1",
      secretAccessKey: "secret-1",
      bucketName: "caliguide-media",
      publicBaseUrl: "https://pub-example.r2.dev",
    });
  });

  it("throws a helpful error when R2 env values are missing", () => {
    expect(() => getR2Config({})).toThrow("Missing Cloudflare R2 upload configuration");
  });

  it("creates scoped object keys with safe file extensions", () => {
    const key = createR2ObjectKey({
      userId: "user-1",
      folder: "profile",
      mimeType: "image/png",
      randomId: "upload-1",
    });

    expect(key).toBe("assets/users/user-1/profile/upload-1.png");
  });

  it("creates forum, chat, and platform object keys in the planned R2 structure", () => {
    expect(
      createR2ObjectKey({
        userId: "user-1",
        folder: "forum",
        resourceId: "post-99",
        mimeType: "image/jpeg",
        randomId: "image-1",
      }),
    ).toBe("assets/users/user-1/forum/post-99/image-1.jpg");

    expect(
      createR2ObjectKey({
        userId: "user-1",
        folder: "chat",
        mimeType: "image/webp",
        randomId: "chat-1",
      }),
    ).toBe("assets/users/user-1/chat/chat-1.webp");

    expect(
      createR2ObjectKey({
        userId: "admin-1",
        folder: "platform-guide",
        resourceId: "guide-real-id-documents",
        mimeType: "image/png",
        randomId: "hero",
      }),
    ).toBe("assets/platform/guide/guide-real-id-documents/hero.png");

    expect(
      createR2ObjectKey({
        userId: "admin-1",
        folder: "platform-public",
        mimeType: "image/gif",
        randomId: "logo",
      }),
    ).toBe("assets/platform/public/logo.gif");
  });

  it("requires a post or guide id for scoped forum and platform guide uploads", () => {
    expect(() =>
      createR2ObjectKey({
        userId: "user-1",
        folder: "forum",
        mimeType: "image/png",
      }),
    ).toThrow("Resource id is required");
  });

  it("builds public R2 URLs without duplicate slashes", () => {
    expect(buildPublicR2Url("https://pub-example.r2.dev/", "/assets/users/user-1/profile/avatar.png")).toBe(
      "https://pub-example.r2.dev/assets/users/user-1/profile/avatar.png",
    );
  });

  it("allows common web image uploads only", () => {
    expect(isAllowedUploadMimeType("image/png")).toBe(true);
    expect(isAllowedUploadMimeType("image/jpeg")).toBe(true);
    expect(isAllowedUploadMimeType("image/webp")).toBe(true);
    expect(isAllowedUploadMimeType("text/plain")).toBe(false);
  });
});
