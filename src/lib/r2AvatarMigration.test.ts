import { describe, expect, it } from "bun:test";
import { planAvatarMigration, planLegacyAvatarObjectMigration } from "./r2AvatarMigration";

describe("r2AvatarMigration", () => {
  it("plans a copy from an old user upload path into the profile folder", () => {
    expect(
      planAvatarMigration({
        userId: "user-demo-1",
        avatarUrl: "https://media.example.com/assets/users/user-demo-1/uploads/avatar-1.png",
        publicBaseUrl: "https://media.example.com",
      }),
    ).toEqual({
      status: "migrate",
      sourceKey: "assets/users/user-demo-1/uploads/avatar-1.png",
      destinationKey: "assets/users/user-demo-1/profile/avatar-1.png",
      destinationUrl: "https://media.example.com/assets/users/user-demo-1/profile/avatar-1.png",
    });
  });

  it("skips avatars that are already in the profile folder", () => {
    expect(
      planAvatarMigration({
        userId: "user-demo-1",
        avatarUrl: "https://media.example.com/assets/users/user-demo-1/profile/avatar-1.png",
        publicBaseUrl: "https://media.example.com/",
      }),
    ).toEqual({
      status: "skip",
      reason: "already-migrated",
    });
  });

  it("skips generated or external avatars that do not live in R2", () => {
    expect(
      planAvatarMigration({
        userId: "user-demo-1",
        avatarUrl: "data:image/svg+xml,avatar",
        publicBaseUrl: "https://media.example.com",
      }),
    ).toEqual({
      status: "skip",
      reason: "not-r2-url",
    });
  });

  it("plans a copy from the legacy avatars prefix into the profile folder", () => {
    expect(
      planLegacyAvatarObjectMigration({
        objectKey: "avatars/user-demo-1/avatar-1.jpg",
        publicBaseUrl: "https://media.example.com",
      }),
    ).toEqual({
      status: "migrate",
      userId: "user-demo-1",
      sourceKey: "avatars/user-demo-1/avatar-1.jpg",
      destinationKey: "assets/users/user-demo-1/profile/avatar-1.jpg",
      destinationUrl: "https://media.example.com/assets/users/user-demo-1/profile/avatar-1.jpg",
    });
  });
});
