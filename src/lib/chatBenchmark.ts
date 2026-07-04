export type ChatBenchmarkOptions = {
  url: string;
  prompt: string;
  runs: number;
  fetcher?: typeof fetch;
  now?: () => number;
};

export type ChatBenchmarkRun = {
  index: number;
  firstChunkMs: number | null;
  totalMs: number;
  outputChars: number;
  estimatedOutputTokens: number;
  tokensPerSecondAfterFirstChunk: number;
  totalTokensPerSecond: number;
  responseText: string;
};

export type ChatBenchmarkResult = {
  url: string;
  prompt: string;
  runs: ChatBenchmarkRun[];
  average: Omit<ChatBenchmarkRun, "index" | "responseText">;
};

const DEFAULT_URL = "http://127.0.0.1:3000/api/chat";
const DEFAULT_PROMPT =
  "Give me a concise checklist for a newcomer applying for a California REAL ID.";

export function parseChatBenchmarkArgs(args: string[]) {
  const parsed = {
    url: DEFAULT_URL,
    runs: 1,
    prompt: DEFAULT_PROMPT,
  };

  for (const arg of args) {
    if (arg.startsWith("--url=")) {
      parsed.url = arg.slice("--url=".length).trim() || parsed.url;
    }

    if (arg.startsWith("--runs=")) {
      const runs = Number.parseInt(arg.slice("--runs=".length), 10);
      parsed.runs = Number.isFinite(runs) && runs > 0 ? runs : parsed.runs;
    }

    if (arg.startsWith("--prompt=")) {
      parsed.prompt = arg.slice("--prompt=".length).trim() || parsed.prompt;
    }
  }

  return parsed;
}

export function estimateOutputTokens(text: string) {
  if (!text.trim()) {
    return 0;
  }

  return Math.max(1, Math.round(text.length / 4));
}

function formatMs(value: number | null) {
  return value === null ? "none" : `${value} ms`;
}

export function formatChatBenchmarkReport(result: ChatBenchmarkResult) {
  const mainRun = result.runs.length === 1 ? result.runs[0] : result.average;
  const streamingMs =
    mainRun.firstChunkMs === null
      ? mainRun.totalMs
      : roundMetric(Math.max(0, mainRun.totalMs - mainRun.firstChunkMs));
  const firstChunkShare =
    mainRun.firstChunkMs === null || mainRun.totalMs === 0
      ? "unknown"
      : `${roundMetric((mainRun.firstChunkMs / mainRun.totalMs) * 100)}%`;

  const lines = [
    `Prompt: ${result.prompt}`,
    `First chunk: ${formatMs(mainRun.firstChunkMs)}`,
    `Total time: ${mainRun.totalMs} ms`,
    `Output chars: ${mainRun.outputChars}`,
    `Estimated tokens: ${mainRun.estimatedOutputTokens}`,
    `Tokens/sec: ${mainRun.tokensPerSecondAfterFirstChunk}`,
    `Total tokens/sec: ${mainRun.totalTokensPerSecond}`,
    `Diagnosis: first chunk wait is ${firstChunkShare} of total time; streaming after first chunk took ${streamingMs} ms.`,
    'Frontend check: compare this First chunk value with the browser console log "first time we received first chunk".',
  ];

  if (result.runs.length > 1) {
    lines.unshift(`Runs: ${result.runs.length}`);
    lines.push("");
    lines.push("Per-run details:");
    for (const run of result.runs) {
      lines.push(
        `Run ${run.index}: first chunk ${formatMs(run.firstChunkMs)}, total ${run.totalMs} ms, tokens/sec ${run.tokensPerSecondAfterFirstChunk}`,
      );
    }
    lines.push("");
    lines.push("Responses:");
    for (const run of result.runs) {
      lines.push(`Run ${run.index}:`);
      lines.push(run.responseText || "(empty response)");

      if (run.index !== result.runs[result.runs.length - 1].index) {
        lines.push("");
      }
    }
  } else {
    lines.push("");
    lines.push("Response:");
    lines.push(result.runs[0]?.responseText || "(empty response)");
  }

  return lines.join("\n");
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function averageRuns(runs: ChatBenchmarkRun[]): Omit<ChatBenchmarkRun, "index" | "responseText"> {
  const count = runs.length || 1;
  const sum = runs.reduce(
    (totals, run) => ({
      firstChunkMs: totals.firstChunkMs + (run.firstChunkMs ?? 0),
      totalMs: totals.totalMs + run.totalMs,
      outputChars: totals.outputChars + run.outputChars,
      estimatedOutputTokens: totals.estimatedOutputTokens + run.estimatedOutputTokens,
      tokensPerSecondAfterFirstChunk:
        totals.tokensPerSecondAfterFirstChunk + run.tokensPerSecondAfterFirstChunk,
      totalTokensPerSecond: totals.totalTokensPerSecond + run.totalTokensPerSecond,
    }),
    {
      firstChunkMs: 0,
      totalMs: 0,
      outputChars: 0,
      estimatedOutputTokens: 0,
      tokensPerSecondAfterFirstChunk: 0,
      totalTokensPerSecond: 0,
    },
  );

  return {
    firstChunkMs: roundMetric(sum.firstChunkMs / count),
    totalMs: roundMetric(sum.totalMs / count),
    outputChars: roundMetric(sum.outputChars / count),
    estimatedOutputTokens: roundMetric(sum.estimatedOutputTokens / count),
    tokensPerSecondAfterFirstChunk: roundMetric(sum.tokensPerSecondAfterFirstChunk / count),
    totalTokensPerSecond: roundMetric(sum.totalTokensPerSecond / count),
  };
}

export async function runChatBenchmark(options: ChatBenchmarkOptions): Promise<ChatBenchmarkResult> {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? performance.now.bind(performance);
  const runs: ChatBenchmarkRun[] = [];

  for (let runIndex = 1; runIndex <= options.runs; runIndex += 1) {
    const startedAt = now();
    const response = await fetcher(options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: options.prompt,
        history: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Chat benchmark failed with ${response.status}: ${errorText || response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("Chat benchmark failed: response did not include a stream body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let output = "";
    let firstChunkAt: number | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunkText = decoder.decode(value, { stream: true });
      if (!chunkText) {
        continue;
      }

      firstChunkAt ??= now();
      output += chunkText;
    }

    output += decoder.decode();
    const completedAt = now();
    const totalMs = Math.max(0, completedAt - startedAt);
    const firstChunkMs = firstChunkAt === null ? null : Math.max(0, firstChunkAt - startedAt);
    const estimatedOutputTokens = estimateOutputTokens(output);
    const generationMs =
      firstChunkAt === null ? totalMs : Math.max(1, completedAt - firstChunkAt);

    runs.push({
      index: runIndex,
      firstChunkMs: firstChunkMs === null ? null : roundMetric(firstChunkMs),
      totalMs: roundMetric(totalMs),
      outputChars: output.length,
      estimatedOutputTokens,
      tokensPerSecondAfterFirstChunk: roundMetric(
        estimatedOutputTokens / (generationMs / 1000),
      ),
      totalTokensPerSecond: roundMetric(
        totalMs > 0 ? estimatedOutputTokens / (totalMs / 1000) : 0,
      ),
      responseText: output,
    });
  }

  return {
    url: options.url,
    prompt: options.prompt,
    runs,
    average: averageRuns(runs),
  };
}
