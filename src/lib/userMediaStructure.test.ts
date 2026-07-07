import { describe, expect, it } from "bun:test";
import { ensureUserMediaStructure } from "./userMediaStructure";

describe("userMediaStructure", () => {
  it("asks the server to prepare the current user's R2 folders", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const result = await ensureUserMediaStructure("access-token", async (url, init) => {
      requests.push({ url, init });

      return new Response(
        JSON.stringify({
          objectKeys: [
            "assets/users/user-1/profile/_structure.json",
            "assets/users/user-1/forum/_structure.json",
            "assets/users/user-1/chat/_structure.json",
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    expect(requests).toEqual([
      {
        url: "/api/uploads/user-structure",
        init: {
          method: "POST",
          headers: {
            Authorization: "Bearer access-token",
          },
        },
      },
    ]);
    expect(result.objectKeys).toEqual([
      "assets/users/user-1/profile/_structure.json",
      "assets/users/user-1/forum/_structure.json",
      "assets/users/user-1/chat/_structure.json",
    ]);
  });

  it("requires a signed-in user", async () => {
    await expect(ensureUserMediaStructure("")).rejects.toThrow("Sign in required");
  });
});
