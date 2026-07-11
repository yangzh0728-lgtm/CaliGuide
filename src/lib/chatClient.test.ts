import { describe, expect, it } from "bun:test";
import { readChatResponseError } from "./chatClient";

describe("chatClient", () => {
  it("reads the provider error from a failed JSON chat response", async () => {
    const response = new Response(
      JSON.stringify({ error: "The selected model cannot read images" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );

    await expect(readChatResponseError(response, "Unable to send message")).resolves.toBe(
      "The selected model cannot read images",
    );
  });

  it("uses the fallback when a failed chat response has no readable message", async () => {
    const response = new Response("", { status: 500 });

    await expect(readChatResponseError(response, "Unable to send message")).resolves.toBe(
      "Unable to send message",
    );
  });
});
