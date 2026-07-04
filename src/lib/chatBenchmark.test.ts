import { describe, expect, it } from "bun:test";
import {
  estimateOutputTokens,
  formatChatBenchmarkReport,
  parseChatBenchmarkArgs,
  runChatBenchmark,
} from "./chatBenchmark";

describe("chatBenchmark", () => {
  it("parses CLI flags with useful defaults", () => {
    expect(
      parseChatBenchmarkArgs([
        "--url=http://localhost:3000/api/chat",
        "--runs=3",
        "--prompt=Tell me about REAL ID",
      ]),
    ).toEqual({
      url: "http://localhost:3000/api/chat",
      runs: 3,
      prompt: "Tell me about REAL ID",
    });
  });

  it("estimates output tokens from streamed text length", () => {
    expect(estimateOutputTokens("California DMV checklist")).toBe(6);
    expect(estimateOutputTokens("")).toBe(0);
  });

  it("measures first chunk time and generation tokens per second from a stream", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("hello "));
        controller.enqueue(new TextEncoder().encode("world"));
        controller.close();
      },
    });
    const fetcher = async () =>
      new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    const timestamps = [0, 600, 1600];

    const result = await runChatBenchmark({
      url: "http://localhost:3000/api/chat",
      prompt: "test prompt",
      runs: 1,
      fetcher,
      now: () => timestamps.shift() ?? 1600,
    });

    expect(result.runs[0]).toMatchObject({
      firstChunkMs: 600,
      totalMs: 1600,
      outputChars: 11,
      estimatedOutputTokens: 3,
      tokensPerSecondAfterFirstChunk: 3,
      responseText: "hello world",
    });
    expect(result.average.tokensPerSecondAfterFirstChunk).toBe(3);
  });

  it("surfaces API errors clearly", async () => {
    const fetcher = async () => new Response("API_KEY and APP_ID must be configured", { status: 500 });

    await expect(
      runChatBenchmark({
        url: "http://localhost:3000/api/chat",
        prompt: "test prompt",
        runs: 1,
        fetcher,
        now: () => 0,
      }),
    ).rejects.toThrow("Chat benchmark failed with 500: API_KEY and APP_ID must be configured");
  });

  it("formats the report for latency diagnosis", () => {
    expect(
      formatChatBenchmarkReport({
        url: "http://127.0.0.1:3000/api/chat",
        prompt: "DMV checklist",
        runs: [
          {
            index: 1,
            firstChunkMs: 1420,
            totalMs: 8120,
            outputChars: 1840,
            estimatedOutputTokens: 460,
            tokensPerSecondAfterFirstChunk: 68.7,
            totalTokensPerSecond: 56.65,
            responseText: "Bring proof of identity, residency, and your Social Security number.",
          },
        ],
        average: {
          firstChunkMs: 1420,
          totalMs: 8120,
          outputChars: 1840,
          estimatedOutputTokens: 460,
          tokensPerSecondAfterFirstChunk: 68.7,
          totalTokensPerSecond: 56.65,
        },
      }),
    ).toBe(
      [
        "Prompt: DMV checklist",
        "First chunk: 1420 ms",
        "Total time: 8120 ms",
        "Output chars: 1840",
        "Estimated tokens: 460",
        "Tokens/sec: 68.7",
        "Total tokens/sec: 56.65",
        "Diagnosis: first chunk wait is 17.49% of total time; streaming after first chunk took 6700 ms.",
        "Frontend check: compare this First chunk value with the browser console log \"first time we received first chunk\".",
        "",
        "Response:",
        "Bring proof of identity, residency, and your Social Security number.",
      ].join("\n"),
    );
  });

  it("formats every response when multiple benchmark runs are requested", () => {
    expect(
      formatChatBenchmarkReport({
        url: "http://127.0.0.1:3000/api/chat",
        prompt: "DMV checklist",
        runs: [
          {
            index: 1,
            firstChunkMs: 100,
            totalMs: 400,
            outputChars: 11,
            estimatedOutputTokens: 3,
            tokensPerSecondAfterFirstChunk: 10,
            totalTokensPerSecond: 7.5,
            responseText: "first reply",
          },
          {
            index: 2,
            firstChunkMs: 200,
            totalMs: 600,
            outputChars: 12,
            estimatedOutputTokens: 3,
            tokensPerSecondAfterFirstChunk: 7.5,
            totalTokensPerSecond: 5,
            responseText: "second reply",
          },
        ],
        average: {
          firstChunkMs: 150,
          totalMs: 500,
          outputChars: 11.5,
          estimatedOutputTokens: 3,
          tokensPerSecondAfterFirstChunk: 8.75,
          totalTokensPerSecond: 6.25,
        },
      }),
    ).toContain(["Responses:", "Run 1:", "first reply", "", "Run 2:", "second reply"].join("\n"));
  });
});
