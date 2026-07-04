export interface R2MockStructureInput {
  userId?: string;
  postId?: string;
  guideId?: string;
}

export interface R2MockObject {
  key: string;
  contentType: "application/json";
  body: string;
}

const DEFAULTS = {
  userId: "user-demo-1",
  postId: "post-demo-1",
  guideId: "guide-dmv-checklist",
};

export function getR2MockObjects(input: R2MockStructureInput = {}): R2MockObject[] {
  const userId = sanitizePathPart(input.userId ?? DEFAULTS.userId);
  const postId = sanitizePathPart(input.postId ?? DEFAULTS.postId);
  const guideId = sanitizePathPart(input.guideId ?? DEFAULTS.guideId);

  return [
    buildMockObject({
      key: `assets/users/${userId}/profile/mock-profile.json`,
      folder: "profile",
      purpose: "Placeholder for a user's profile photo object.",
      futureFiles: ["avatar.png", "avatar.webp"],
    }),
    buildMockObject({
      key: `assets/users/${userId}/forum/${postId}/mock-forum-image.json`,
      folder: "forum",
      purpose: "Placeholder for images attached to one forum post.",
      futureFiles: ["question-photo.jpg", "reply-screenshot.png"],
    }),
    buildMockObject({
      key: `assets/users/${userId}/chat/mock-chat-attachment.json`,
      folder: "chat",
      purpose: "Placeholder for future chatbot conversation attachments.",
      futureFiles: ["uploaded-document-preview.png", "chat-image.webp"],
    }),
    buildMockObject({
      key: `assets/platform/guide/${guideId}/mock-guide-image.json`,
      folder: "platform-guide",
      purpose: "Placeholder for guide article images owned by the platform.",
      futureFiles: ["hero.jpg", "step-1.png"],
    }),
    buildMockObject({
      key: "assets/platform/public/mock-logo.json",
      folder: "platform-public",
      purpose: "Placeholder for public website assets such as logo and favicon.",
      futureFiles: ["logo.svg", "favicon.ico"],
    }),
  ];
}

function buildMockObject(input: {
  key: string;
  folder: string;
  purpose: string;
  futureFiles: string[];
}): R2MockObject {
  return {
    key: input.key,
    contentType: "application/json",
    body: JSON.stringify(
      {
        mock: true,
        folder: input.folder,
        purpose: input.purpose,
        futureFiles: input.futureFiles,
        objectKey: input.key,
        generatedBy: "bun run seed:r2-structure",
      },
      null,
      2,
    ),
  };
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "demo";
}
