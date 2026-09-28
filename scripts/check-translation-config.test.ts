import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

function check(overrides: Record<string, string>) {
  return spawnSync(process.execPath, [fileURLToPath(new URL("./check-translation-config.ts", import.meta.url))], {
    cwd: tmpdir(),
    env: { PATH: process.env.PATH, ...overrides },
    encoding: "utf8",
  });
}

test("translation config check identifies missing names without credentials", () => {
  const result = check({ AZURE_TRANSLATOR_KEY: "private-test-key", SUPABASE_SERVICE_ROLE_KEY: " " });
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("VITE_SUPABASE_URL: MISSING");
  expect(result.stdout).toContain("SUPABASE_SERVICE_ROLE_KEY: MISSING");
  expect(result.stdout).toContain("AZURE_TRANSLATOR_KEY: SET");
  expect(result.stdout + result.stderr).not.toContain("private-test-key");
});

test("translation config check reports presence, not credential validity", () => {
  const result = check({
    VITE_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "private-role-key", AZURE_TRANSLATOR_KEY: "private-test-key",
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("AZURE_TRANSLATOR_REGION: NOT SET");
  expect(result.stdout).toContain("does not verify credentials");
  expect(result.stdout + result.stderr).not.toContain("private-role-key");
  expect(result.stdout + result.stderr).not.toContain("private-test-key");
});
