import {
  formatChatBenchmarkReport,
  parseChatBenchmarkArgs,
  runChatBenchmark,
} from "../src/lib/chatBenchmark";

const options = parseChatBenchmarkArgs(process.argv.slice(2));

try {
  const result = await runChatBenchmark(options);
  console.log(formatChatBenchmarkReport(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
